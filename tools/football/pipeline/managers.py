"""
Teknik direktörler ve kulüp yönetimi.

Kaynaklar:
  - Transfermarkt veri seti (games.csv): her maçta iki takımın teknik direktörü (2006+). Buradan kulüp başına görev
    geçmişi (ilk/son maç, G-B-M) ve her hocanın "beklenenin üstü puan" (PPG) performansı çıkarılır.
  - Wikidata (SPARQL, anahtarsız): kulübün güncel başkanı, genel müdürü, sahipleri, güncel hoca. Transfermarkt takım kimliği (P7223) ile eşlenir.

Beklenen puan: kadro piyasa değerlerinin logaritması farkından (ev sahibi avantajı dahil) doğrusal regresyonla.
Hoca puanı = (gerçek − beklenen) puan/maç, görev süresine göre küçültülmüş; Elo karşılığı ≈ 240 × PPG farkı.

Çıktı: data/built/managers.json
  { asOf, m: { ad: [elo, maç, G, B, M, ppg, beklenenPpg, ilkTarih, sonTarih, [kulüpler...]] },
    c: { kulüpId: { cur: {n, since, src}, chair: {n, since}, ceo: {...}, own: [ad...], hist: [[ad, from, to, g, w, d, l, gf, ga]] } } }
"""
import csv
import shutil
import gzip
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW = os.environ.get("WIF_RAW") or os.path.join(ROOT, "data", "raw")
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
LAST = os.environ.get("WIF_LAST") or os.path.join(ROOT, "data", "last")
WD = os.environ.get("WIF_LAST") or os.path.join(ROOT, "data", "last")   # önbellek durum klasöründe: depoda kalır, Actions önbelleği silinse de kaybolmaz
PPG_TO_ELO = 240.0
GOAL_TO_ELO = 362.0      # 1 gol/maç ≈ 362 Elo (sitedeki lambdas: dλ/λ = 0,85·Δ/400, λ≈1,3)
LAM_M = 200.0           # hoca etkisi için ridge ağırlığı (≈ "ortalama hoca" önsel maç sayısı)
LAM_C = 25.0            # kulüp-dönem etkisi için ridge ağırlığı
HALF_LIFE = 6.0         # yıl: eski maçlar yarı yarıya sayılır
SHRINK = 80.0           # bu kadar maçlık "ortalama hoca" önsel bilgi (az maçlı ya da yalnızca küçük bir ligde başarılı hocalar ortalamaya çekilir)
MIN_GAMES = 12          # listeye girmek için en az maç


def rows(name):
    with gzip.open(os.path.join(RAW, "tm", name), "rt", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def club_values():
    """{sezon: {kulüp: ln(en değerli 18 oyuncunun toplam değeri)}} — site ile aynı kadro dosyalarından."""
    out = {}
    d = os.path.join(OUT, "squads")
    for fn in os.listdir(d):
        s = int(fn[:-5])
        sq = json.load(open(os.path.join(d, fn), encoding="utf-8"))
        out[s] = {int(c): float(np.log(max(sum(sorted((v for _, v in rs), reverse=True)[:18]), 1e6))) for c, rs in sq.items() if rs}
    return out


def season_of(date):
    y, m = int(date[:4]), int(date[5:7])
    return y if m >= 7 else y - 1


def build_history():
    games = [g for g in rows("games.csv.gz") if g["home_club_goals"] != "" and g["date"]]
    games.sort(key=lambda g: g["date"])
    vals = club_values()
    # --- beklenen puan regresyonu
    bycomp = defaultdict(lambda: ([], []))
    gd_by = defaultdict(lambda: ([], []))
    tot_by = defaultdict(list)
    keep = []
    for i, g in enumerate(games):
        s = season_of(g["date"])
        vh, va = vals.get(s, {}).get(int(g["home_club_id"])), vals.get(s, {}).get(int(g["away_club_id"]))
        if vh is None or va is None or g["competition_type"] == "national_team_competition":
            continue
        diff = np.sign(int(g["home_club_goals"]) - int(g["away_club_goals"]))
        key = g["competition_id"] if g["competition_type"] == "domestic_league" else "*"
        hg0, ag0 = int(g["home_club_goals"]), int(g["away_club_goals"])
        for k in {key, "*"}:
            bycomp[k][0].append([1.0, vh - va]); bycomp[k][1].append(diff)
            gd_by[k][0].append([1.0, vh - va]); gd_by[k][1].append(hg0 - ag0)
            tot_by[k].append(hg0 + ag0)
        keep.append(i)
    # beklenen puan farkı, ln-değer farkının DOĞRUSAL olmayan eğrisi (dilimlenmiş ortalama): uçlarda (dev kulüpler) doğrusal model hata yapıyor
    def curve(X, Y):
        d = np.array([x[1] for x in X]); y = np.array(Y)
        o = np.argsort(d); d, y = d[o], y[o]
        nb = max(6, min(30, len(y) // 250))
        idx = np.array_split(np.arange(len(y)), nb)
        cx = np.array([d[i].mean() for i in idx]); cy = np.array([y[i].mean() for i in idx])
        cy = np.maximum.accumulate(cy)        # tekdüze
        return cx, cy

    coefs = {k: curve(X, Y) for k, (X, Y) in bycomp.items() if k == "*" or len(Y) >= 1500}
    gcoefs = {k: curve(X, Y) for k, (X, Y) in gd_by.items() if k == "*" or len(Y) >= 1500}
    tmean = {k: float(np.mean(v)) for k, v in tot_by.items()}
    print(f"   beklenen puan modeli: {len(keep)} maç, genel eğri + {len(coefs) - 1} lig için ayrı", flush=True)
    keep_set = set(keep)

    def xp(i, g):
        """ev ve deplasman için beklenen puan; değer yoksa None."""
        if i not in keep_set:
            return None
        s = season_of(g["date"])
        d = vals[s][int(g["home_club_id"])] - vals[s][int(g["away_club_id"])]
        cx, cy = coefs.get(g["competition_id"] if g["competition_type"] == "domestic_league" else "*", coefs["*"])
        D = 3 * float(np.interp(d, cx, cy))   # beklenen puan farkı (ev − dep)
        return float(np.clip(1.365 + D / 2, 0.15, 2.85)), float(np.clip(1.365 - D / 2, 0.15, 2.85))

    def xg(i, g):
        """ev sahibi için beklenen (atılan, yenilen) gol; deplasman tersi."""
        s = season_of(g["date"])
        d = vals[s][int(g["home_club_id"])] - vals[s][int(g["away_club_id"])]
        k = g["competition_id"] if g["competition_type"] == "domestic_league" else "*"
        cx, cy = gcoefs.get(k, gcoefs["*"])
        gd = float(np.interp(d, cx, cy)); tot = tmean.get(k, tmean["*"])
        return (tot + gd) / 2, (tot - gd) / 2

    obs = []          # (kulüp-dönem, hoca, ağırlık, puan artığı, hücum artığı, savunma artığı)
    forms = defaultdict(lambda: defaultdict(int))
    # --- maç maç hoca görevleri
    ten = defaultdict(list)       # kulüp -> [[ad, ilk, son, g, w, d, l, gf, ga]]
    mg = defaultdict(lambda: {"g": 0, "w": 0, "d": 0, "l": 0, "act": 0.0, "exp": 0.0, "n": 0, "first": "9999", "last": "0000", "clubs": {}})
    for i, g in enumerate(games):
        if g["competition_type"] == "national_team_competition":
            continue
        e = xp(i, g)
        hg, ag = int(g["home_club_goals"]), int(g["away_club_goals"])
        for side in ("home", "away"):
            name = (g[f"{side}_club_manager_name"] or "").strip()
            if not name:
                continue
            cid = int(g[f"{side}_club_id"])
            own, opp = (hg, ag) if side == "home" else (ag, hg)
            pts = 3 if own > opp else 1 if own == opp else 0
            t = ten[cid]
            if t and t[-1][0] == name:
                r = t[-1]; r[2] = g["date"]
            else:
                r = [name, g["date"], g["date"], 0, 0, 0, 0, 0, 0]; t.append(r)
            r[3] += 1; r[4] += pts == 3; r[5] += pts == 1; r[6] += pts == 0; r[7] += own; r[8] += opp
            m = mg[name]
            m["g"] += 1; m["w"] += pts == 3; m["d"] += pts == 1; m["l"] += pts == 0
            m["first"] = min(m["first"], g["date"]); m["last"] = max(m["last"], g["date"])
            m["clubs"][cid] = m["clubs"].get(cid, 0) + 1
            f = (g[f"{side}_club_formation"] or "").strip()
            if f:
                forms[name][f] += 1
            if e:
                m["act"] += pts; m["exp"] += e[0] if side == "home" else e[1]; m["n"] += 1
                exg = xg(i, g)
                eg, ec = (exg[0], exg[1]) if side == "home" else (exg[1], exg[0])
                yr = int(g["date"][:4]) + (int(g["date"][5:7]) - 1) / 12
                obs.append((cid, season_of(g["date"]), name, 0.5 ** ((2026.5 - yr) / HALF_LIFE), pts - (e[0] if side == "home" else e[1]), own - eg, ec - opp))
    return ten, mg, obs, forms


def ridge_effects(obs):
    """y = kulüp-dönem etkisi + hoca etkisi (ridge, dönüşümlü en küçük kareler). Kulüp etkisi "dev kulüp zaten fazla puan alır"ı emer;
    hoca etkisi yalnızca hocanın kulüp değiştirmesi / kulüp içinde hoca değişimi üzerinden ayrışır. Döner: {hoca: (puan, hücum, savunma)} (maç başına)."""
    ck = {}
    mk = {}
    ci = np.empty(len(obs), dtype=np.int64); mi = np.empty(len(obs), dtype=np.int64)
    for n, (cid, season, name, *_r) in enumerate(obs):
        ci[n] = ck.setdefault((cid, (season - 2006) // 4), len(ck))
        mi[n] = mk.setdefault(name, len(mk))
    w = np.array([o[3] for o in obs])
    res = {}
    out = np.zeros((len(mk), 3))
    for col in range(3):
        y = np.array([o[4 + col] for o in obs])
        c = np.zeros(len(ck)); m = np.zeros(len(mk))
        for _ in range(40):
            m = np.bincount(mi, w * (y - c[ci]), len(mk)) / (np.bincount(mi, w, len(mk)) + LAM_M)
            c = np.bincount(ci, w * (y - m[mi]), len(ck)) / (np.bincount(ci, w, len(ck)) + LAM_C)
        out[:, col] = m
    for name, k in mk.items():
        res[name] = tuple(float(x) for x in out[k])
    return res


WD_ROLES = [("coach", "P286"), ("chair", "P488"), ("ceo", "P169"), ("own", "P127")]


def wd_role(role, prop):
    """Bir rolün TÜM dönemlerini (başlangıç/bitiş tarihli) ve kişinin Commons fotoğraf dosya adını döndürür. Sorgu başına bir istek."""
    q = f"""SELECT ?tm ?pLabel ?start ?end ?img WHERE {{
      ?c wdt:P7223 ?tm .
      ?c p:{prop} ?st . ?st ps:{prop} ?p .
      OPTIONAL {{ ?st pq:P580 ?start }}
      OPTIONAL {{ ?st pq:P582 ?end }}
      OPTIONAL {{ ?p wdt:P18 ?img }}
      FILTER(!BOUND(?end) || ?end >= "2006-01-01T00:00:00Z"^^xsd:dateTime)       # Transfermarkt maç verisi 2006'dan başlıyor: daha eski dönemler gereksiz
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "tr,en". }}
    }}"""
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": q, "format": "json"})
    for i in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WhatIfFootball-pipeline/1.0 (personal project)", "Accept": "application/sparql-results+json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                data = json.loads(r.read().decode("utf-8"))["results"]["bindings"]
            return [(int(b["tm"]["value"]), role, b["pLabel"]["value"], (b.get("start", {}).get("value") or "")[:10], (b.get("end", {}).get("value") or "")[:10],
                     urllib.parse.unquote((b.get("img", {}).get("value") or "").rsplit("/", 1)[-1])) for b in data if b["tm"]["value"].isdigit()]
        except Exception as e:  # noqa: BLE001
            print(f"   ! wikidata {role}: {e}", flush=True)
            time.sleep(70)
    return None


def wd_all():
    """Wikidata'dan tüm kulüpler için hoca/başkan/genel müdür/sahip dönemlerini çeker (dakikada 1 istek sınırı için roller arası bekleme).
    Başarısız rol için önceki önbellek kullanılır. Satır: (kulüp, rol, ad, başlangıç, bitiş, fotoğraf_dosyası)."""
    os.makedirs(WD, exist_ok=True)
    cache = os.path.join(WD, "wikidata_roles2.json")
    prev = []
    if os.path.exists(cache):
        prev = [tuple(x) for x in json.load(open(cache, encoding="utf-8"))]
    else:                                              # eski (yalnızca güncel, tarihsiz) önbelleği başlangıç olarak al
        for old in (os.path.join(WD, "wikidata_roles.json"), os.path.join(RAW, "wikidata", "roles.json")):
            if os.path.exists(old):
                prev = [(r[0], r[1], r[2], r[3], "", "") for r in json.load(open(old, encoding="utf-8"))]
                break
    out, ok = [], 0
    for k, (role, prop) in enumerate(WD_ROLES):
        if k:
            time.sleep(65)                              # sunucu: dakikada 1 istek
        rows = wd_role(role, prop)
        if rows is None:
            print(f"   (Wikidata {role}: önceki önbellekten)", flush=True)
            rows = [r for r in prev if r[1] == role]
        else:
            ok += 1
        out += rows
    if ok:
        json.dump(out, open(cache, "w", encoding="utf-8"), ensure_ascii=False)
    return out if (ok or out) else []


def fingerprint():
    """Hoca geçmişinin girdileri (maç verisi, kadro dosyaları, bu betik) değişmedikçe geçmiş yeniden hesaplanmaz."""
    import hashlib
    h = hashlib.sha1()
    for p in [os.path.join(RAW, "tm", "games.csv.gz"), __file__]:   # betik değişince geçmiş yeniden hesaplanır
        st = os.stat(p); h.update(f"{os.path.basename(p)}:{st.st_size}:{int(st.st_mtime)}".encode())
    d = os.path.join(OUT, "squads")
    for fn in sorted(os.listdir(d)):
        h.update(f"{fn}:{os.path.getsize(os.path.join(d, fn))}".encode())
    return h.hexdigest()


def history():
    """Maç verisinden hoca puanları ve kulüp başına görev geçmişi. Girdi değişmediyse önbellekten gelir."""
    cache_p = os.path.join(LAST, "managers_hist.json")   # v3: tüm görevler
    fp = fingerprint()
    if os.path.exists(cache_p):
        c = json.load(open(cache_p, encoding="utf-8"))
        if c.get("fp") == fp:
            print("-> hoca geçmişi: maç verisi değişmemiş, önbellekten", flush=True)
            return c["mgrs"], {int(k): v for k, v in c["hist"].items()}
    print("-> maç verisinden hoca geçmişi", flush=True)
    ten, mg, obs, forms = build_history()
    eff = ridge_effects(obs)
    mgrs = {}
    for name, m in mg.items():
        if m["g"] < MIN_GAMES:
            continue
        _pts, a, d = eff.get(name, (0.0, 0.0, 0.0))
        att = int(round(max(-60, min(60, GOAL_TO_ELO * a))))      # takım hücum puanına doğrudan eklenen Elo
        dfn = int(round(max(-60, min(60, GOAL_TO_ELO * d))))      # takım savunma puanına doğrudan eklenen Elo
        elo = int(round((att + dfn) / 2))                        # tek sayılık "net etki" (hücum+savunma ortalaması): sezon simülasyonundaki tek Elo ile aynı ölçek
        fm = sorted(forms.get(name, {}).items(), key=lambda kv: -kv[1])[:3]
        tot_f = sum(forms.get(name, {}).values()) or 1
        clubs = [c for c, _ in sorted(m["clubs"].items(), key=lambda kv: -kv[1])[:4]]
        ppg = round((3 * m["w"] + m["d"]) / m["g"], 2)
        xpg = round(m["exp"] / m["n"], 2) if m["n"] else None
        mgrs[name] = [elo, m["g"], m["w"], m["d"], m["l"], ppg, xpg, m["first"], m["last"], clubs, att, dfn, [[f, round(c / tot_f, 2)] for f, c in fm]]
    v = np.array([m[0] for m in mgrs.values()])
    print(f"   {len(mgrs)} hoca puanlandı · sd {v.std():.1f} Elo · |puan|>=60: {(abs(v) >= 60).sum()}", flush=True)
    hist = {cid: [r for r in t] for cid, t in ten.items()}
    os.makedirs(os.path.dirname(cache_p), exist_ok=True)
    json.dump({"fp": fp, "mgrs": mgrs, "hist": hist}, open(cache_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return mgrs, hist


def snapshot(clubs):
    """Değişiklik karşılaştırması için kulüp başına {hoca, başkan, genel müdür, sahipler}."""
    return {str(k): [(v.get("cur") or {}).get("n"), (v.get("chair") or {}).get("n"), (v.get("ceo") or {}).get("n"), " · ".join(sorted(v.get("own") or []))] for k, v in clubs.items()}   # sahip sırası değişimi "sahip değişti" sayılmasın


def diff_changes(prev, now):
    """Önceki güncellemeyle karşılaştırıp hoca/başkan/genel müdür/sahip değişikliklerini günlük satırlarına çevirir."""
    from common import club_names
    names = club_names()
    LAB = [("hoca", "teknik direktör"), ("baskan", "başkan"), ("ceo", "genel müdür"), ("sahip", "sahip")]
    out = []
    for cid, row in now.items():
        old = prev.get(cid)
        if old is None:
            continue
        for i, (kind, label) in enumerate(LAB):
            if row[i] and row[i] != old[i]:
                nm = names.get(cid, cid)
                out.append((kind, int(cid), f"{nm}: {label} {old[i] + ' → ' if old[i] else 'yeni: '}{row[i]}"))
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    mgrs, hist = history()
    clubs = {}
    for cid, t in hist.items():
        clubs[cid] = {"hist": t, "cur": {"n": t[-1][0], "since": t[-1][1], "src": "maç"}}

    print("-> Wikidata: başkan, genel müdür, sahip, güncel hoca", flush=True)
    got = wd_all()
    print(f"   {len(got)} kayıt (tüm dönemler)", flush=True)
    by = defaultdict(lambda: defaultdict(list))
    images = {}
    for row in got:
        cid, role, name, start, end = row[:5]
        img = row[5] if len(row) > 5 else ""
        by[cid][role].append((start, end, name, img))
        if img and role in ("coach", "chair", "ceo"):
            images.setdefault(name, img)
    for cid, roles in by.items():
        c = clubs.setdefault(cid, {"hist": [], "cur": None})
        c["roles"] = {}
        for key, lst in roles.items():
            lst = sorted(set(lst), key=lambda x: (x[0] or "0000", x[1] or "9999"), reverse=True)
            c["roles"][key] = [[n, st or None, en or None, im or None] for st, en, n, im in lst][:40]
            now_l = [x for x in lst if not x[1]]                 # bitişi olmayanlar = güncel
            if key == "coach":
                if not now_l:
                    continue
                start, _e, name, im = now_l[0]
                cur = c["cur"]
                # Wikidata, maç verisinin bittiği tarihten sonraki bir göreve işaret ediyorsa (ya da maç verisi yoksa) onu kullan
                if cur is None or (start and start > (c["hist"][-1][2] if c["hist"] else "0000") and name != cur["n"]):
                    c["cur"] = {"n": name, "since": start or None, "src": "wikidata"}
            elif key == "own":
                names = list(dict.fromkeys(x[2] for x in now_l))[:4]
                if names:
                    c["own"] = names
            elif now_l:
                start, _e, name, im = now_l[0]
                c[key] = {"n": name, "since": start or None, **({"img": im} if im else {})}

    prev_p = os.path.join(OUT, "managers.json")
    if not got and os.path.exists(prev_p):
        print("   ! Wikidata alınamadı: önceki başkan/sahip/hoca bilgileri korunuyor", flush=True)
        _prev = json.load(open(prev_p, encoding="utf-8"))
        images.update(_prev.get("I", {}))
        for k, v in _prev.get("c", {}).items():
            c = clubs.setdefault(int(k), {"hist": [], "cur": None})
            for f in ("chair", "ceo", "own"):
                if v.get(f):
                    c[f] = v[f]
            if v.get("roles"):
                c["roles"] = v["roles"]
            if (v.get("cur") or {}).get("src") == "wikidata":
                c["cur"] = v["cur"]

    # kulüp değerleri: yalnızca en az bir bilgisi olanlar
    clubs = {str(k): v for k, v in clubs.items() if v.get("hist") or v.get("cur") or v.get("chair") or v.get("own")}
    out = {"asOf": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "m": mgrs, "c": clubs, "I": images}
    p = os.path.join(OUT, "managers.json")
    try:
        same = {k: v for k, v in json.load(open(p, encoding="utf-8")).items() if k != "asOf"} == {k: v for k, v in out.items() if k != "asOf"}
    except Exception:  # noqa: BLE001
        same = False
    if same:
        print("   managers.json: içerik değişmedi, yeniden yazılmadı", flush=True)
    else:
        json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    n_ch = sum(1 for v in clubs.values() if v.get("chair")); n_ow = sum(1 for v in clubs.values() if v.get("own"))
    print(f"yazıldı: {p} ({os.path.getsize(p) / 1e6:.1f} MB) · {len(clubs)} kulüp · {n_ch} başkan · {n_ow} sahip", flush=True)

    # --- önceki güncellemeden bu yana ne değişti?
    sys.path.insert(0, os.path.dirname(__file__))
    from common import log_changes
    snap_p = os.path.join(LAST, "managers_snapshot.json")
    now = snapshot(clubs)
    if os.path.exists(snap_p) and got:      # Wikidata hiç gelmediyse (boş) sahte "kayboldu" değişiklikleri üretme
        ch = diff_changes(json.load(open(snap_p, encoding="utf-8")), now)
        added = log_changes(ch)
        print(f"   önceki güncellemeden beri {len(ch)} yönetim değişikliği ({added} yeni kayıt)", flush=True)
        for _, _, t in ch[:10]:
            print("    •", t)
    if got:
        os.makedirs(os.path.dirname(snap_p), exist_ok=True)
        json.dump(now, open(snap_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    sys.exit(main())
