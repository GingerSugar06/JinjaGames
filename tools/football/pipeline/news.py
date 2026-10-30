"""
Günlük haberler: her lig için günün biten maçları, skorlar ve maç olayları (gol dakikası/türü, penaltı, kendi kalesine, kartlar).

Kaynak: ESPN açık JSON API (anahtarsız) — lig takvimi uçları; maçlarda "details" alanı olayları taşır.
Kapsam: CATALOG'daki ~60 lig/kupa (Türkiye, Avrupa kupaları, İngiltere/İspanya/İtalya/Almanya/Fransa ve alt ligleri, diğer Avrupa, Amerika, Asya/Afrika, milli takımlar).

Artımlı: kaldığı günden devam eder. data/built/news/index.json'daki en son günün BİR GÜN öncesinden bugüne kadar olan günleri yeniden yazar
(geç biten maçlar tamamlansın diye); ilk çalıştırmada (ya da katalog sürümü değişince) son 14 gün alınır. 60 günden eski gün dosyaları silinir.
Gün, Türkiye saatine (UTC+3) göre belirlenir.

Çıktı:
  data/built/news/index.json        { asOf, v, days: ["2026-10-27", ...] (yeniden eskiye), leagues: [{id, n, g, o, c?}], seen: {lig: son_maç_günü} }
  data/built/news/YYYY-MM-DD.json   { d, leagues: [ { c, m: [ {id, t, h, a, hn, an, hg, ag, st, ps?, v, att, ev:[[dk, tür, taraf, oyuncu, sıra]]} ] } ] }
     tür: g gol · h kafa · v röveşata/vole · f frikik · p penaltı · o kendi kalesine · y sarı · r kırmızı ; taraf: h/a (olayın ait olduğu takım; kendi kalesine golde oyuncunun takımı)
     ps: penaltı atışları sonucu [ev, dep] (yalnızca PEN)
"""
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))
from fixtures import ESPN, PLAYED, Mapper, get  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
NEWS = os.path.join(OUT, "news")
SEASON = 2026
KEEP_DAYS = 60
FIRST_RUN_DAYS = 14
CATALOG_VERSION = 2          # katalog değişince ilk çalıştırma gibi geriye doğru doldurulur
TR = timedelta(hours=3)
TYPE = {"Goal": "g", "Goal - Header": "h", "Goal - Volley": "v", "Goal - Free-kick": "f", "Penalty - Scored": "p", "Own Goal": "o", "Yellow Card": "y", "Red Card": "r"}

# (kimlik, ESPN kodu, Türkçe ad, grup, kulüp eşleştirme havuzu)  — kimlikler sitedeki yarışma kimlikleriyle aynıdır (varsa); havuz None ise kulüp kimliği eşlenmez (ESPN adı gösterilir)
G_TR, G_EU, G_EN, G_ES, G_IT, G_DE, G_FR, G_OE, G_AM, G_AS, G_NT = ("Türkiye", "Avrupa kupaları", "İngiltere", "İspanya", "İtalya", "Almanya", "Fransa", "Diğer Avrupa", "Amerika", "Asya, Afrika, Okyanusya", "Milli takımlar")
CATALOG = [
    ("TR1", "tur.1", "Süper Lig", G_TR, "TR1"),
    ("CL", "uefa.champions", "Şampiyonlar Ligi", G_EU, None), ("EL", "uefa.europa", "Avrupa Ligi", G_EU, None), ("UCOL", "uefa.europa.conf", "Konferans Ligi", G_EU, None),
    ("GB1", "eng.1", "Premier Lig", G_EN, "GB1"), ("GB2", "eng.2", "Championship", G_EN, "GB2"), ("GB3", "eng.3", "League One", G_EN, "GB3"), ("GB4", "eng.4", "League Two", G_EN, "GB4"),
    ("GB5", "eng.5", "National League", G_EN, "GB5"), ("FAC", "eng.fa", "FA Cup", G_EN, "GB1"), ("eng.league_cup", "eng.league_cup", "Lig Kupası (Carabao)", G_EN, "GB1"), ("GBCS", "eng.charity", "Community Shield", G_EN, "GB1"),
    ("ES1", "esp.1", "LaLiga", G_ES, "ES1"), ("esp.2", "esp.2", "LaLiga 2", G_ES, "ES1"), ("CDR", "esp.copa_del_rey", "Copa del Rey", G_ES, "ES1"), ("SUC", "esp.super_cup", "İspanya Süper Kupası", G_ES, "ES1"),
    ("IT1", "ita.1", "Serie A", G_IT, "IT1"), ("ita.2", "ita.2", "Serie B", G_IT, "IT1"), ("CIT", "ita.coppa_italia", "Coppa Italia", G_IT, "IT1"), ("SCI", "ita.super_cup", "İtalya Süper Kupası", G_IT, "IT1"),
    ("L1", "ger.1", "Bundesliga", G_DE, "L1"), ("L2", "ger.2", "2. Bundesliga", G_DE, "L2"), ("DFB", "ger.dfb_pokal", "DFB-Pokal", G_DE, "L1"), ("DFL", "ger.super_cup", "Almanya Süper Kupası", G_DE, "L1"),
    ("FR1", "fra.1", "Ligue 1", G_FR, "FR1"), ("fra.2", "fra.2", "Ligue 2", G_FR, "FR1"), ("fra.coupe_de_france", "fra.coupe_de_france", "Fransa Kupası", G_FR, "FR1"), ("FRCH", "fra.super_cup", "Fransa Süper Kupası", G_FR, "FR1"),
    ("NL1", "ned.1", "Eredivisie", G_OE, "NL1"), ("ned.2", "ned.2", "Eerste Divisie", G_OE, "NL1"), ("NLP", "ned.cup", "KNVB Beker", G_OE, "NL1"),
    ("PO1", "por.1", "Liga Portugal", G_OE, "PO1"), ("por.taca.portugal", "por.taca.portugal", "Taça de Portugal", G_OE, "PO1"),
    ("BE1", "bel.1", "Belçika Pro Lig", G_OE, "BE1"), ("SC1", "sco.1", "İskoç Premiership", G_OE, "SC1"), ("SC2", "sco.2", "İskoç Championship", G_OE, "SC2"), ("sco.cis", "sco.cis", "İskoç Lig Kupası", G_OE, "SC1"),
    ("GR1", "gre.1", "Yunanistan Süper Ligi", G_OE, "GR1"), ("RU1", "rus.1", "Rusya Premier Ligi", G_OE, "RU1"), ("DK1", "den.1", "Danimarka Superliga", G_OE, "DK1"), ("A1", "aut.1", "Avusturya Bundesliga", G_OE, "A1"),
    ("NO1", "nor.1", "Norveç Eliteserien", G_OE, "NO1"), ("SE1", "swe.1", "İsveç Allsvenskan", G_OE, "SE1"), ("cyp.1", "cyp.1", "Kıbrıs 1. Lig", G_OE, None),
    ("BRA1", "bra.1", "Brezilya Série A", G_AM, "BRA1"), ("bra.2", "bra.2", "Brezilya Série B", G_AM, None), ("ARG1", "arg.1", "Arjantin Liga Profesional", G_AM, "ARG1"),
    ("MEX1", "mex.1", "Meksika Liga MX", G_AM, "MEX1"), ("MLS1", "usa.1", "MLS", G_AM, "MLS1"), ("usa.nwsl", "usa.nwsl", "NWSL (kadınlar)", G_AM, None), ("COL1", "col.1", "Kolombiya Primera A", G_AM, "COL1"),
    ("chi.1", "chi.1", "Şili Primera", G_AM, None), ("uru.1", "uru.1", "Uruguay Primera", G_AM, None), ("par.1", "par.1", "Paraguay Primera", G_AM, None), ("per.1", "per.1", "Peru Liga 1", G_AM, None), ("ecu.1", "ecu.1", "Ekvador LigaPro", G_AM, None),
    ("conmebol.libertadores", "conmebol.libertadores", "Copa Libertadores", G_AM, None), ("conmebol.sudamericana", "conmebol.sudamericana", "Copa Sudamericana", G_AM, None), ("concacaf.champions", "concacaf.champions", "Concacaf Şampiyonlar Kupası", G_AM, None),
    ("JAP1", "jpn.1", "Japonya J1 League", G_AS, "JAP1"), ("chn.1", "chn.1", "Çin Süper Ligi", G_AS, None), ("SA1", "ksa.1", "Suudi Pro Lig", G_AS, "SA1"), ("AUS1", "aus.1", "Avustralya A-League", G_AS, "AUS1"),
    ("ind.1", "ind.1", "Hindistan Süper Ligi", G_AS, None), ("rsa.1", "rsa.1", "Güney Afrika Premiership", G_AS, None), ("afc.champions", "afc.champions", "AFC Şampiyonlar Ligi", G_AS, None), ("caf.champions", "caf.champions", "CAF Şampiyonlar Ligi", G_AS, None),
    ("uefa.nations", "uefa.nations", "UEFA Uluslar Ligi", G_NT, None), ("fifa.world", "fifa.world", "Dünya Kupası", G_NT, None), ("fifa.friendly", "fifa.friendly", "Milli hazırlık maçları", G_NT, None),
]
ORDER = {c[0]: i for i, c in enumerate(CATALOG)}


def tr_day(iso):
    """ESPN UTC zamanı -> (Türkiye tarihi, saat)."""
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%MZ") + TR
    return dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M")


def parse_event(e, mcomp, mp):
    c = e["competitions"][0]
    home = next((x for x in c["competitors"] if x["homeAway"] == "home"), None)
    away = next((x for x in c["competitors"] if x["homeAway"] == "away"), None)
    if not home or not away or e["status"]["type"]["name"] not in PLAYED or home.get("score") in (None, "") or away.get("score") in (None, ""):
        return None
    side = {home["team"]["id"]: "h", away["team"]["id"]: "a"}
    hg, ag = int(home["score"]), int(away["score"])
    evs = []
    for d in c.get("details") or []:
        k = TYPE.get(d["type"]["text"])
        if not k or d.get("shootout"):
            continue
        who = (d.get("athletesInvolved") or [{}])[0].get("displayName", "")
        evs.append([d["clock"]["displayValue"], k, side.get(d["team"]["id"], "h"), who, d["clock"].get("value", 0)])
    # kendi kalesine gollerde ESPN'in "takım" alanı gol atanın mı yoksa golün yazıldığı takımın mı olduğu açık değil: skora uyan yorumu seç
    og = [x for x in evs if x[1] == "o"]
    if og:
        def tally(flip):
            gh = sum(1 for x in evs if x[1] in "ghvfp" and x[2] == "h") + sum(1 for x in og if (x[2] == "a") != flip)
            ga = sum(1 for x in evs if x[1] in "ghvfp" and x[2] == "a") + sum(1 for x in og if (x[2] == "h") != flip)
            return gh == hg and ga == ag
        if not tally(False) and tally(True):
            for x in og:
                x[2] = "a" if x[2] == "h" else "h"
    evs.sort(key=lambda x: x[4])
    day, t = tr_day(e["date"])
    hn, an = home["team"]["displayName"], away["team"]["displayName"]
    mh = mp.map(hn, mcomp) if mp and mcomp else None
    ma = mp.map(an, mcomp) if mp and mcomp else None
    st = {"STATUS_FULL_TIME": "FT", "STATUS_FINAL_AET": "AET", "STATUS_FINAL_PEN": "PEN"}[e["status"]["type"]["name"]]
    row = {
        "id": int(e["id"]), "t": t, "h": mh, "a": ma, "hn": hn, "an": an, "hg": hg, "ag": ag, "st": st,
        "v": (c.get("venue") or {}).get("fullName"), "att": c.get("attendance") or None, "ev": [x[:4] + [i] for i, x in enumerate(evs)],
    }
    if st == "PEN":                                                   # "X win 4-3 on penalties" notundan seri atışı sonucu
        for n in c.get("notes") or []:
            m = re.match(r"(.+?) win (\d+)-(\d+) on penalties", n.get("headline") or n.get("text") or "")
            if m:
                w, a, b = m.group(1).strip(), int(m.group(2)), int(m.group(3))
                row["ps"] = [a, b] if hn.startswith(w) or w.startswith(hn) else [b, a]
                break
    return day, row


def main():
    clubs = json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8"))
    mp = Mapper(clubs)
    os.makedirs(NEWS, exist_ok=True)
    idx_p = os.path.join(NEWS, "index.json")
    idx = json.load(open(idx_p, encoding="utf-8")) if os.path.exists(idx_p) else {}
    days_have = idx.get("days", []) if idx.get("v") == CATALOG_VERSION else []     # katalog değiştiyse geriye doğru yeniden doldur
    today = (datetime.now(timezone.utc) + TR).date()
    start = (datetime.strptime(days_have[0], "%Y-%m-%d").date() - timedelta(days=1)) if days_have else today - timedelta(days=FIRST_RUN_DAYS)
    start = max(start, today - timedelta(days=KEEP_DAYS))
    print(f"-> haberler: {start} .. {today} arası günler alınıyor ({len(CATALOG)} lig/kupa, kaldığı yerden)", flush=True)
    by_day, failed = {}, []
    for lid, slug, _name, _grp, mcomp in CATALOG:
        seen, got_any = set(), False
        for year in (SEASON, SEASON + 1):
            data = get(f"{ESPN}/{slug}/scoreboard?dates={year}&limit=1000")
            if data is None:
                continue
            got_any = True
            for e in data.get("events", []):
                if e["id"] in seen:
                    continue
                seen.add(e["id"])
                day = tr_day(e["date"])[0]
                if not (start.isoformat() <= day <= today.isoformat()):
                    continue
                r = parse_event(e, mcomp, mp)
                if r:
                    by_day.setdefault(r[0], {}).setdefault(lid, []).append(r[1])
        if not got_any:
            failed.append(slug)
        time.sleep(0.25)
    if failed:
        print(f"   ! alınamayan lig kodları: {', '.join(failed)}", flush=True)
    written = 0
    for day, comps in by_day.items():
        leagues = [{"c": c, "m": sorted(ms, key=lambda m: (m["t"], m["id"]))} for c, ms in sorted(comps.items(), key=lambda kv: ORDER.get(kv[0], 999))]
        json.dump({"d": day, "leagues": leagues}, open(os.path.join(NEWS, f"{day}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        written += 1
    # indeks: diskteki gün dosyaları; eski olanlar silinir
    days = sorted((f[:-5] for f in os.listdir(NEWS) if f.endswith(".json") and f != "index.json"), reverse=True)
    cut = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for d in [d for d in days if d < cut]:
        os.remove(os.path.join(NEWS, f"{d}.json"))
    days = [d for d in days if d >= cut]
    last = {}                                                         # lig -> son maç günü (arayüz: "son maç 26 Eki")
    for d in sorted(days):
        for l in json.load(open(os.path.join(NEWS, f"{d}.json"), encoding="utf-8"))["leagues"]:
            last[l["c"]] = d
    cat = [{"id": c[0], "n": c[2], "g": c[3], "o": i} for i, c in enumerate(CATALOG)]
    json.dump({"asOf": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "v": CATALOG_VERSION, "days": days, "leagues": cat, "seen": last}, open(idx_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    n = sum(len(ms) for d in by_day.values() for ms in d.values())
    print(f"tamam: {written} gün yazıldı, {n} biten maç, {len(last)} ligde maç var, indekste {len(days)} gün")
    from common import log_changes
    log_changes([("haber", None, f"{max(by_day)} günü haberleri hazır: {sum(len(v) for v in by_day[max(by_day)].values())} maç, {len(by_day[max(by_day)])} lig")] if by_day else [])


if __name__ == "__main__":
    sys.exit(main())
