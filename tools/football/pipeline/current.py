"""
Güncel kadrolar, sezon istatistikleri ve sakatlıklar. GitHub Actions'ta her gün çalışır.

Kaynaklar (anahtarsız, ücretsiz):
  - ESPN açık JSON API: lig takımları + kadrolar (ad, doğum tarihi, mevki, forma no, bu sezon maç/gol/asist/kart)
  - Fantasy Premier League API: Premier League oyuncu haberleri ve sakatlıklar (diğer ligler için ücretsiz güvenilir kaynak yok)

Çıktı: data/built/current.json  { asOf, clubs: { <tmClubId>: [oyuncu...] }, injuries: n }
        data/built/transfers/2026.json  (+ ESPN'e göre kulüp değiştirenler; 7. alan = 1)
Oyuncular Transfermarkt kimliğiyle (ad + doğum tarihi) eşleştirilir; piyasa değeri o veri setindendir (son güncelleme Eylül 2026).

Sıra: build.py -> england.py -> ess.py -> fixtures.py -> current.py (hepsi okuyup birleştirir).
"""
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
from fixtures import norm  # noqa: E402
from fixtures import Mapper  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
LAST = os.environ.get("WIF_LAST") or os.path.join(ROOT, "data", "last")
LEAGUES = {  # ESPN lig kodu -> yarışma kimliği
    "tur.1": "TR1", "eng.1": "GB1", "esp.1": "ES1", "ger.1": "L1", "ita.1": "IT1", "fra.1": "FR1", "ned.1": "NL1",
    "por.1": "PO1", "bel.1": "BE1", "sco.1": "SC1", "gre.1": "GR1", "eng.2": "GB2", "ger.2": "L2",
}
ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer"
LINE = {"G": "G", "GK": "G", "D": "D", "M": "M", "F": "A", "A": "A"}


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WhatIfFootball-pipeline/1.0 (personal project)"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                print("   !", url.split("soccer/")[-1][:70], e, flush=True)
                return None
            time.sleep(2 + 3 * i)


def stat_of(p):
    out = {}
    try:
        for cat in p["statistics"]["splits"]["categories"]:
            for s in cat["stats"]:
                out[s["name"]] = s["value"]
    except Exception:  # noqa: BLE001
        pass
    return {"ap": int(out.get("appearances", 0)), "g": int(out.get("totalGoals", 0)), "as": int(out.get("goalAssists", 0)), "y": int(out.get("yellowCards", 0)), "r": int(out.get("redCards", 0)),
            "sv": int(out.get("saves", 0)), "ga": int(out.get("goalsConceded", 0))}



def detect_transfers(res, players, clubs, asof):
    """Güncel kadro (ESPN) ile Transfermarkt'taki kulüp farkından, TM veri setinin durduğu tarihten sonraki transferleri bulur.

    Ücret bilinmez (ESPN vermiyor); ilk görüldüğü gün saklanır (data/last/transfers_detected.json, günlük çalışmalar arasında korunur).
    """
    tm_club = {p[0]: p[6] for p in players}
    youth = re.compile(r"(\s(B|II|III|U\d{2}|Yth\.?|Youth|Jgd\.?|Jeugd|Reserves?)|\bU\d{2})\s*$", re.I)
    prev_path = os.path.join(LAST, "transfers_detected.json")
    prev = json.load(open(prev_path, encoding="utf-8")) if os.path.exists(prev_path) else {}
    out, logs = {}, []
    names = {k: v["n"] for k, v in clubs.items()}
    pn = {p[0]: p[1] for p in players}
    for cid, rows in res.items():
        for r in rows:
            pid = r.get("id")
            frm = tm_club.get(pid) if pid else None
            if not frm or frm == int(cid) or str(frm) not in clubs or youth.search(clubs[str(frm)]["n"]):
                continue
            key = str(pid)
            old = prev.get(key)
            seen = old["seen"] if old and old["from"] == frm and old["to"] == int(cid) else asof
            if not (old and old["from"] == frm and old["to"] == int(cid)):
                logs.append(("transfer", int(cid), f"{pn.get(pid, r['n'])}: {names.get(str(frm), frm)} → {names.get(str(cid), cid)}"))
            out[key] = {"from": frm, "to": int(cid), "seen": seen, "v": r.get("v") or 0}
    os.makedirs(os.path.dirname(prev_path), exist_ok=True)
    for path in (prev_path, os.path.join(OUT, "transfers_detected.json")):
        json.dump(out, open(path, "w", encoding="utf-8"), separators=(",", ":"))
    # transfers/2026.json: TM satırları + tespit edilenler (7. alan = 1)
    tpath = os.path.join(OUT, "transfers", "2026.json")
    base = json.load(open(tpath, encoding="utf-8")) if os.path.exists(tpath) else []
    base = [t for t in base if len(t) < 7]                    # önceki tespitleri at, yeniden ekle
    have = {(t[0], t[3]) for t in base}
    added = 0
    for pid, d in out.items():
        if (int(pid), d["to"]) in have:
            continue
        base.append([int(pid), d["seen"], d["from"], d["to"], None, d["v"], 1])
        added += 1
    base.sort(key=lambda t: t[1])
    os.makedirs(os.path.dirname(tpath), exist_ok=True)
    json.dump(base, open(tpath, "w", encoding="utf-8"), separators=(",", ":"))
    from common import log_changes
    log_changes(logs)
    return added


def main():
    clubs = json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8"))
    players = json.load(open(os.path.join(OUT, "players.json"), encoding="utf-8"))   # [id,name,line,pos,dob,nat,club,value,peak,...]
    by_dob = {}
    for p in players:
        if p[4]:
            by_dob.setdefault(p[4][:10], []).append(p)
    for k in [k for k in clubs if -2000 < int(k) < 0]:
        del clubs[k]
    mt = Mapper(clubs)
    res, n_players, matched = {}, 0, 0
    for slug, comp in LEAGUES.items():
        data = get(f"{ESPN}/{slug}/teams")
        if not data:
            continue
        teams = data["sports"][0]["leagues"][0]["teams"]
        print(f"-> {slug}: {len(teams)} takım", flush=True)
        for t in teams:
            tm, name = t["team"], t["team"]["displayName"]
            cid = mt.map(name, comp)
            r = get(f"{ESPN}/{slug}/teams/{tm['id']}/roster")
            if not r:
                continue
            rows = []
            for a in r.get("athletes", []):
                dob = (a.get("dateOfBirth") or "")[:10]
                nm = a.get("fullName") or a.get("displayName")
                pos = (a.get("position") or {}).get("abbreviation", "M")
                hit = None
                for cand in by_dob.get(dob, []):
                    if norm(cand[1]) == norm(nm):
                        hit = cand
                        break
                if not hit and dob:
                    last = norm(nm).split()[-1:] or [""]
                    for cand in by_dob.get(dob, []):
                        if norm(cand[1]).split()[-1:] == last:
                            hit = cand
                            break
                n_players += 1
                matched += 1 if hit else 0
                rows.append({
                    "e": int(a["id"]), "id": hit[0] if hit else None, "n": nm, "l": LINE.get(pos, "M"), "p": (hit[3] if hit else "") or "",
                    "dob": dob or None, "nat": hit[5] if hit else None, "v": hit[7] if hit else 0, "pk": hit[8] if hit else 0, "j": a.get("jersey"),
                    "h": round(a["height"] * 2.54) if a.get("height") else None, "st": stat_of(a), "inj": None,
                })
            if cid is not None:
                res[str(cid)] = rows
            time.sleep(0.15)
    # --- sakatlıklar: FPL (Premier League)
    injuries = 0
    fpl = get("https://fantasy.premierleague.com/api/bootstrap-static/")
    if fpl:
        teams = {t["id"]: t["name"] for t in fpl["teams"]}
        for e in fpl["elements"]:
            if not e.get("news") or e.get("chance_of_playing_next_round") == 100:
                continue
            club = mt.map(teams[e["team"]], "GB1")
            full, web = norm(f"{e['first_name']} {e['second_name']}"), norm(e["web_name"])
            for p in res.get(str(club), []):
                pn = norm(p["n"])
                if pn == full or pn.endswith(web) or web in pn.split():
                    p["inj"] = {"t": e["news"], "c": e.get("chance_of_playing_next_round"), "src": "FPL"}
                    injuries += 1
                    break
    # yeni sakatlıklar: önceki günlük çalışmanın (data/last) listesine göre
    from common import log_changes
    try:
        prev = json.load(open(os.path.join(LAST, "current.json"), encoding="utf-8"))["clubs"]
        was = {(c, p["e"]) for c, rows in prev.items() for p in rows if p.get("inj")}
        log_changes([("sakat", int(c), f"{p['n']} ({clubs[c]['n']}): {p['inj']['t'][:70]}") for c, rows in res.items() for p in rows if p.get("inj") and (c, p["e"]) not in was][:40])
    except Exception:  # noqa: BLE001
        pass
    asof = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    moved = detect_transfers(res, players, clubs, asof)
    out = {"asOf": asof, "clubs": res, "injuries": injuries}
    json.dump(out, open(os.path.join(OUT, "current.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    import shutil
    os.makedirs(LAST, exist_ok=True)
    shutil.copy(os.path.join(OUT, "current.json"), os.path.join(LAST, "current.json"))   # bir sonraki güncellemede yeni sakatlıkları ayırt etmek için
    json.dump(clubs, open(os.path.join(OUT, "clubs.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"tamam: {len(res)} kulüp, {n_players} oyuncu ({matched} TM eşleşmesi), {injuries} sakatlık, {moved} yeni transfer tespit edildi")


if __name__ == "__main__":
    main()
