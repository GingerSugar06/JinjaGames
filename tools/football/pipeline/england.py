"""
İngiltere piramidi (Premier League + 3 alt kademe) 2000-01 → 2025-26: openfootball/england (Football.TXT, açık lisans).

- GB1 için yalnızca Transfermarkt'ın kapsamadığı sezonlar (2000-2011) eklenir; GB2/GB3/GB4 (Championship, League One/Two) tüm sezonlar.
- Kulüp Elo'su (kademeler arası) hesaplanıp elo/{sezon}.json'a yazılır: 2000-2011 için tamamen, sonrası için yalnızca eksik kulüpler.

Sıra: build.py → fixtures.py → england.py (ikisi de dosyaları okuyup birleştirir, sıra bozulmaz).
"""
import json
import math
import os
import re
import sys
import urllib.request
import zlib
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))
from ess import Matcher  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
RAW = os.path.join(os.environ.get("WIF_RAW") or os.path.join(ROOT, "data", "raw"), "england")
TIERS = {"1-premierleague": "GB1", "2-division1": "GB2", "3-division2": "GB3", "4-division3": "GB4"}
TIER_ALT = {"GB2": ["2-championship", "2-division1"], "GB3": ["3-league1", "3-division2"], "GB4": ["4-league2", "4-division3"], "GB1": ["1-premierleague"]}
FIRST_TM_SEASON = 2012
MONTHS = {m: i + 1 for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}

LINE = re.compile(r"^\s+(?:\d{1,2}[:.]\d{2}\s+)?(.+?)\s+(\d+)-(\d+)(?:\s+\(\d+-\d+\))?(?:\s+[a-z.]+)?\s+(.+?)\s*$")
DATE = re.compile(r"^\s*(?:[A-Z][a-z]{2}\s+)?(?:(\d{1,2})\s+([A-Z][a-z]{2})|([A-Z][a-z]{2})\s+(\d{1,2}))(?:\s+(\d{4}))?\s*$")


def fetch_txt(season, comp):
    sname = f"{season}-{str(season + 1)[2:]}"
    for stem in TIER_ALT[comp]:
        cache = os.path.join(RAW, f"{sname}_{stem}.txt")
        if os.path.exists(cache):
            return open(cache, encoding="utf-8").read()
        url = f"https://raw.githubusercontent.com/openfootball/england/master/{sname}/{stem}.txt"
        try:
            with urllib.request.urlopen(url, timeout=40) as r:
                txt = r.read().decode("utf-8")
            os.makedirs(RAW, exist_ok=True)
            open(cache, "w", encoding="utf-8").write(txt)
            return txt
        except Exception:  # noqa: BLE001
            continue
    return None


def parse(txt, season):
    out, rnd, cur = [], "", None
    for raw in txt.splitlines():
        if raw.startswith("▪") or raw.startswith("»"):
            rnd = raw.lstrip("▪» ").strip()
            continue
        if raw.startswith("#") or raw.startswith("="):
            continue
        m = LINE.match(raw)
        if m and cur:
            out.append((cur, rnd, m.group(1).strip(), m.group(4).strip(), int(m.group(2)), int(m.group(3))))
            continue
        d = DATE.match(raw)
        if d:
            if d.group(1):
                day, mon = int(d.group(1)), MONTHS.get(d.group(2))
            else:
                mon, day = MONTHS.get(d.group(3)), int(d.group(4))
            if not mon:
                continue
            year = int(d.group(5)) if d.group(5) else (season if mon >= 7 else season + 1)
            cur = f"{year:04d}-{mon:02d}-{day:02d}"
    return out


def main():
    clubs = json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8"))
    idx = json.load(open(os.path.join(OUT, "match_index.json"), encoding="utf-8"))
    comps = json.load(open(os.path.join(OUT, "competitions.json"), encoding="utf-8"))
    mt = Matcher(clubs)

    def club_id(name, comp):
        return mt.get(name, comp)

    allm = []   # (date, comp, season, h, a, hg, ag)
    for season in range(2000, 2026):
        for comp in ("GB1", "GB2", "GB3", "GB4"):
            if comp == "GB1" and season >= FIRST_TM_SEASON:
                continue
            txt = fetch_txt(season, comp)
            if not txt:
                print("   ! eksik", season, comp)
                continue
            rows = parse(txt, season)
            ms = []
            for d, rnd, h, a, hg, ag in rows:
                hid, aid = club_id(h, comp), club_id(a, comp)
                gid = 800_000_000 + zlib.crc32(f"{comp}|{d}|{hid}|{aid}".encode()) % 90_000_000
                rn = re.sub(r"Matchday (\d+)", r"\1. Matchday", rnd)
                ms.append([gid, d, rn, hid, aid, hg, ag, None, None, None, None, None, None, None, None, None, None])
                allm.append((d, comp, season, hid, aid, hg, ag))
            if not ms:
                continue
            ms.sort(key=lambda r: (r[1], r[0]))
            os.makedirs(os.path.join(OUT, "matches", comp), exist_ok=True)
            json.dump(ms, open(os.path.join(OUT, "matches", comp, f"{season}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            idx.setdefault(comp, {})[str(season)] = len(ms)
        print("   sezon", season, "tamam")

    # --- kademeler arası Elo
    allm.sort()
    rating, snaps, cur = {}, {}, None
    base = {"GB1": 1500, "GB2": 1420, "GB3": 1340, "GB4": 1270}
    for d, comp, season, h, a, hg, ag in allm:
        if season != cur:
            cur = season
            snaps[season] = {cid: round(v) for cid, v in rating.items()}
        for cid in (h, a):
            if cid not in rating:
                rating[cid] = base[comp]
                snaps[season][cid] = round(rating[cid])
        dr = rating[h] + 60 - rating[a]
        e = 1 / (1 + 10 ** (-dr / 400))
        res = 1.0 if hg > ag else 0.5 if hg == ag else 0.0
        gd = abs(hg - ag)
        mult = 1 if gd <= 1 else 1.5 if gd == 2 else (11 + gd) / 8
        delta = 22 * mult * (res - e)
        rating[h] += delta
        rating[a] -= delta
    for season, snap in snaps.items():
        path = os.path.join(OUT, "elo", f"{season}.json")
        cur_elo = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
        if season < FIRST_TM_SEASON:
            cur_elo.update({str(k): v for k, v in snap.items()})
        else:
            for k, v in snap.items():
                cur_elo.setdefault(str(k), v)
        json.dump(cur_elo, open(path, "w", encoding="utf-8"), separators=(",", ":"))

    for cid, meta in (("GB2", ("Championship", "İngiltere", "gb-eng", 2)), ("GB3", ("League One", "İngiltere", "gb-eng", 3)), ("GB4", ("League Two", "İngiltere", "gb-eng", 4))):
        comps[cid] = {"name": meta[0], "country": meta[1], "cc": meta[2], "type": "league", "tier": meta[3], "id": cid, "has_data": True}
    json.dump(comps, open(os.path.join(OUT, "competitions.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(clubs, open(os.path.join(OUT, "clubs.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    from common import reindex
    reindex()
    print("tamam; kulüp:", len(clubs))


if __name__ == "__main__":
    main()
