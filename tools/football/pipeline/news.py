"""
Günlük haberler: her lig için günün biten maçları, skorlar ve maç olayları (gol dakikası/türü, penaltı, kendi kalesine, kartlar).

Kaynak: ESPN açık JSON API (anahtarsız) — fixtures.py'nin kullandığı lig takvimiyle aynı uç; maçlarda "details" alanı olayları taşır.

Artımlı: kaldığı günden devam eder. data/built/news/index.json'daki en son günün BİR GÜN öncesinden bugüne kadar olan günleri yeniden yazar
(geç biten maçlar tamamlansın diye); ilk çalıştırmada son 14 gün alınır. 60 günden eski gün dosyaları silinir.
Gün, Türkiye saatine (UTC+3) göre belirlenir.

Çıktı:
  data/built/news/index.json        { asOf, days: ["2026-10-27", ...] }  (yeniden eskiye)
  data/built/news/YYYY-MM-DD.json   { d, leagues: [ { c, m: [ {id, t, h, a, hn, an, hg, ag, st, v, att, ev:[[dk, tür, taraf, oyuncu, sıra]]} ] } ] }
     tür: g gol · h kafa · v röveşata/vole · f frikik · p penaltı · o kendi kalesine · y sarı · r kırmızı ; taraf: h/a (olayın ait olduğu takım; kendi kalesine golde oyuncunun takımı)
"""
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))
from fixtures import ESPN, LEAGUES, PLAYED, Mapper, get  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
NEWS = os.path.join(OUT, "news")
SEASON = 2026
KEEP_DAYS = 60
FIRST_RUN_DAYS = 14
TR = timedelta(hours=3)
EXTRA = {"uefa.champions": "CL", "uefa.europa": "EL", "uefa.europa.conf": "UCOL"}   # kupalar: kulüpler başka ülkelerden, eşleşmeyen adlar olduğu gibi kalır
TYPE = {"Goal": "g", "Goal - Header": "h", "Goal - Volley": "v", "Goal - Free-kick": "f", "Penalty - Scored": "p", "Own Goal": "o", "Yellow Card": "y", "Red Card": "r"}


def tr_day(iso):
    """ESPN UTC zamanı -> (Türkiye tarihi, saat)."""
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%MZ") + TR
    return dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M")


def parse_event(e, comp, mp):
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
    mh = mp.map(home["team"]["displayName"], comp) if comp in LEAGUES.values() else None
    ma = mp.map(away["team"]["displayName"], comp) if comp in LEAGUES.values() else None
    v = (c.get("venue") or {}).get("fullName")
    return day, {
        "id": int(e["id"]), "t": t, "h": mh, "a": ma, "hn": home["team"]["displayName"], "an": away["team"]["displayName"], "hg": hg, "ag": ag,
        "st": {"STATUS_FULL_TIME": "FT", "STATUS_FINAL_AET": "AET", "STATUS_FINAL_PEN": "PEN"}[e["status"]["type"]["name"]],
        "v": v, "att": c.get("attendance") or None, "ev": [x[:4] + [i] for i, x in enumerate(evs)],
    }


def main():
    clubs = json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8"))
    mp = Mapper(clubs)
    os.makedirs(NEWS, exist_ok=True)
    idx_p = os.path.join(NEWS, "index.json")
    days_have = json.load(open(idx_p, encoding="utf-8")).get("days", []) if os.path.exists(idx_p) else []
    today = (datetime.now(timezone.utc) + TR).date()
    start = (datetime.strptime(days_have[0], "%Y-%m-%d").date() - timedelta(days=1)) if days_have else today - timedelta(days=FIRST_RUN_DAYS)
    start = max(start, today - timedelta(days=KEEP_DAYS))
    print(f"-> haberler: {start} .. {today} arası günler alınıyor (kaldığı yerden)", flush=True)
    by_day = {}
    for slug, comp in {**LEAGUES, **EXTRA}.items():
        seen = set()
        for year in (SEASON, SEASON + 1):
            data = get(f"{ESPN}/{slug}/scoreboard?dates={year}&limit=1000")
            for e in (data or {}).get("events", []):
                if e["id"] in seen:
                    continue
                seen.add(e["id"])
                day = tr_day(e["date"])[0]
                if not (start.isoformat() <= day <= today.isoformat()):
                    continue
                r = parse_event(e, comp, mp)
                if r:
                    by_day.setdefault(r[0], {}).setdefault(comp, []).append(r[1])
        time.sleep(0.3)
    order = list(LEAGUES.values()) + list(EXTRA.values())
    written = 0
    for day, comps in by_day.items():
        leagues = [{"c": c, "m": sorted(comps[c], key=lambda m: (m["t"], m["id"]))} for c in order if c in comps]
        json.dump({"d": day, "leagues": leagues}, open(os.path.join(NEWS, f"{day}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        written += 1
    # indeks: diskteki gün dosyaları; eski olanlar silinir
    days = sorted((f[:-5] for f in os.listdir(NEWS) if f.endswith(".json") and f != "index.json"), reverse=True)
    cut = (today - timedelta(days=KEEP_DAYS)).isoformat()
    for d in [d for d in days if d < cut]:
        os.remove(os.path.join(NEWS, f"{d}.json"))
    days = [d for d in days if d >= cut]
    json.dump({"asOf": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "days": days}, open(idx_p, "w", encoding="utf-8"), separators=(",", ":"))
    n = sum(len(ms) for d in by_day.values() for ms in d.values())
    print(f"tamam: {written} gün yazıldı, {n} biten maç, indekste {len(days)} gün")
    from common import log_changes
    log_changes([("haber", None, f"{max(by_day)} günü haberleri hazır: {sum(len(v) for v in by_day[max(by_day)].values())} maç")] if by_day else [])


if __name__ == "__main__":
    sys.exit(main())
