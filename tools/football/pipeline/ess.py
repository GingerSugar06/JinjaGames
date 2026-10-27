"""
2000-2011 (1. lig) ve alt ligler: jalapic/engsoccerdata (açık veri, data-raw/*.csv).

Transfermarkt'ın kapsamadığı sezonları doldurur:
  - 1. ligler: yalnızca 2000-2011 (2012+ zaten Transfermarkt'ta)
  - Almanya 2. Bundesliga (L2), İskoçya 2-4 (SC2-SC4), İngiltere 5. kademe (GB5): 2000-2024

Sıra: build.py -> england.py -> ess.py -> fixtures.py (hepsi okuyup birleştirir).
"""
import difflib
import json
import os
import re
import sys
import urllib.request
import zlib
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from fixtures import norm, toks, ALIAS  # noqa: E402

import pandas as pd  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
RAW = os.path.join(os.environ.get("WIF_RAW") or os.path.join(ROOT, "data", "raw"), "ess")
BASE = "https://raw.githubusercontent.com/jalapic/engsoccerdata/master/data-raw/"
# (dosya, tier filtresi, yarışma, yalnızca bu sezondan önce mi (1. lig için 2012))
SOURCES = [
    ("turkey", 1, "TR1", 2012), ("spain", 1, "ES1", 2012), ("italy", 1, "IT1", 2012), ("germany", 1, "L1", 2012),
    ("france", 1, "FR1", 2012), ("holland", 1, "NL1", 2012), ("portugal", 1, "PO1", 2012), ("belgium", 1, "BE1", 2012),
    ("greece", 1, "GR1", 2012), ("scotland", 1, "SC1", 2012),
    ("germany", 2, "L2", 9999), ("scotland", 2, "SC2", 9999), ("scotland", 3, "SC3", 9999), ("scotland", 4, "SC4", 9999),
    ("england5", 5, "GB5", 9999),
]
META = {
    "L2": ("2. Bundesliga", "Almanya", "de", 2), "SC2": ("Championship", "İskoçya", "gb-sct", 2), "SC3": ("League One", "İskoçya", "gb-sct", 3),
    "SC4": ("League Two", "İskoçya", "gb-sct", 4), "GB5": ("National League", "İngiltere", "gb-eng", 5),
}
TIER_BASE = {1: 1500, 2: 1420, 3: 1340, 4: 1270, 5: 1200}
FIRST, LAST = 2000, 2024


def load(name):
    p = os.path.join(RAW, name + ".csv")
    if not os.path.exists(p):
        os.makedirs(RAW, exist_ok=True)
        urllib.request.urlretrieve(BASE + name + ".csv", p)
    return pd.read_csv(p)


class Matcher:
    """Hızlı ad eşleştirme: önce kendi ligindeki kulüpler, yetmezse sınırlı genel arama."""

    def __init__(self, clubs):
        self.clubs, self.cache = clubs, {}
        self.pre = {int(i): (norm(c["n"]), set(toks(c["n"]))) for i, c in clubs.items()}
        try:
            comps = json.load(open(os.path.join(OUT, "competitions.json"), encoding="utf-8"))
        except Exception:  # noqa: BLE001
            comps = {}
        lower = {"GB2": "İngiltere", "GB3": "İngiltere", "GB4": "İngiltere", "GB5": "İngiltere", "L2": "Almanya", "SC2": "İskoçya", "SC3": "İskoçya", "SC4": "İskoçya"}
        self.country = {**{c: m.get("country") for c, m in comps.items()}, **lower}
        self.by_country = defaultdict(list)
        self.by_comp = defaultdict(list)
        self.free = []
        youth = re.compile(r"(\s(B|II|III|U\d{2}|Yth\.?|Youth|Jgd\.?|Jeugd|Sub-?\d+|Reserves?|Amateure|Fo\.|Stars?))\s*$", re.I)
        for i, c in clubs.items():
            if youth.search(c["n"]) and int(i) > 0:   # yedek / altyapı takımlarını eşleştirme dışı bırak
                continue
            if c.get("c"):
                self.by_comp[c["c"]].append(int(i))
                if self.country.get(c["c"]):
                    self.by_country[self.country[c["c"]]].append(int(i))
            else:
                self.free.append(int(i))

    def _score(self, sm, nn, tt, cid):
        n, t = self.pre[cid]
        sm.set_seq1(n)
        if sm.real_quick_ratio() < 0.6 or sm.quick_ratio() < 0.6:
            r = 0
        else:
            r = sm.ratio()
        if tt and t and (tt <= t or t <= tt):
            r = max(r, 0.93 if len(tt) == len(t) else 0.88)
        return r

    def best(self, name, pool):
        sm = difflib.SequenceMatcher(None, autojunk=False)
        sm.set_seq2(norm(name))
        nn, tt = norm(name), set(toks(name))
        b, bs = None, 0
        for cid in pool:
            s = self._score(sm, nn, tt, cid)
            if s > bs:
                b, bs = cid, s
        return b, bs

    def get(self, name, comp):
        key = (name, comp)
        if key in self.cache:
            return self.cache[key]
        if name in ALIAS:
            self.cache[key] = ALIAS[name]
            return ALIAS[name]
        # aynı ülkedeki tüm kademelerin kulüpleri (alt lig adları üst ligdeki kayıtla eşleşsin)
        b, bs = self.best(name, self.by_country.get(self.country.get(comp), None) or self.by_comp.get(comp, []))
        if bs < 0.85:
            b2, bs2 = self.best(name, self.free)
            if bs2 > bs and bs2 >= 0.9:
                b, bs = b2, bs2
        if bs < 0.85:
            b = -3000 - zlib.crc32(f"{name}|{comp}".encode()) % 10**8
            self.clubs[str(b)] = {"n": name, "c": comp}
            self.pre[b] = (norm(name), set(toks(name)))
            self.by_comp[comp].append(b)
            if self.country.get(comp):
                self.by_country[self.country[comp]].append(b)
        elif not self.clubs[str(b)].get("c"):
            self.clubs[str(b)]["c"] = comp
        self.cache[key] = b
        return b


def main():
    clubs = json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8"))
    idx = json.load(open(os.path.join(OUT, "match_index.json"), encoding="utf-8"))
    comps = json.load(open(os.path.join(OUT, "competitions.json"), encoding="utf-8"))
    mt = Matcher(clubs)
    allm = []
    for fname, tier, comp, before in SOURCES:
        df = load(fname)
        df = df[(df["tier"] == tier) & (df["Season"] >= FIRST) & (df["Season"] <= LAST) & (df["Season"] < before)]
        if "round" in df.columns:
            df = df[df["round"] == "league"]
        df = df.dropna(subset=["hgoal", "vgoal", "Date"]).sort_values("Date", kind="stable")
        n = 0
        for season, g in df.groupby("Season"):
            season = int(season)
            played, rows = defaultdict(int), []
            for r in g.itertuples(index=False):
                h, a = mt.get(str(r.home), comp), mt.get(str(r.visitor), comp)
                played[h] += 1
                played[a] += 1
                rnd = f"{max(played[h], played[a])}. Matchday"
                hg, ag = int(r.hgoal), int(r.vgoal)
                gid = 700_000_000 + zlib.crc32(f"{comp}|{r.Date}|{h}|{a}".encode()) % 90_000_000
                rows.append([gid, str(r.Date)[:10], rnd, h, a, hg, ag, None, None, None, None, None, None, None, None, None, None])
                allm.append((str(r.Date)[:10], comp, tier, season, h, a, hg, ag))
            if not rows:
                continue
            os.makedirs(os.path.join(OUT, "matches", comp), exist_ok=True)
            json.dump(rows, open(os.path.join(OUT, "matches", comp, f"{season}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            idx.setdefault(comp, {})[str(season)] = len(rows)
            n += len(rows)
        print(f"   {comp} ({fname} k{tier}): {n} maç", flush=True)

    # --- Elo (ülke içi), 1. lig kulüplerine TM'nin 2012 lig ortalamasına göre ofset
    elo12 = json.load(open(os.path.join(OUT, "elo", "2012.json"), encoding="utf-8"))
    sums = defaultdict(list)
    for cid, v in elo12.items():
        c = clubs.get(cid, {}).get("c")
        if c:
            sums[c].append(v)
    offset = {c: (sum(v) / len(v) - 1500) for c, v in sums.items() if len(v) >= 8}
    allm.sort()
    rating, snaps, cur, club_comp = {}, {}, None, {}
    for d, comp, tier, season, h, a, hg, ag in allm:
        if season != cur:
            cur = season
            snaps[season] = {c: v for c, v in rating.items()}
        for cid in (h, a):
            club_comp[cid] = comp
            if cid not in rating:
                rating[cid] = TIER_BASE[tier]
                snaps[season][cid] = rating[cid]
        e = 1 / (1 + 10 ** (-(rating[h] + 60 - rating[a]) / 400))
        res = 1.0 if hg > ag else 0.5 if hg == ag else 0.0
        gd = abs(hg - ag)
        delta = 22 * (1 if gd <= 1 else 1.5 if gd == 2 else (11 + gd) / 8) * (res - e)
        rating[h] += delta
        rating[a] -= delta
    top = {"TR1", "ES1", "IT1", "L1", "FR1", "NL1", "PO1", "BE1", "GR1", "SC1"}
    for season, snap in snaps.items():
        path = os.path.join(OUT, "elo", f"{season}.json")
        e = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}
        for cid, v in snap.items():
            comp = club_comp.get(cid)
            val = round(v + (offset.get(comp, 0) if comp in top else 0))
            if season < 2012:
                e.setdefault(str(cid), val)        # England (england.py) varsa ezme
            else:
                e.setdefault(str(cid), val)
        json.dump(e, open(path, "w", encoding="utf-8"), separators=(",", ":"))

    for cid, m in META.items():
        comps[cid] = {"name": m[0], "country": m[1], "cc": m[2], "type": "league", "tier": m[3], "id": cid, "has_data": True}
    json.dump(comps, open(os.path.join(OUT, "competitions.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(clubs, open(os.path.join(OUT, "clubs.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    from common import reindex
    reindex()
    print("tamam; kulüp:", len(clubs))


if __name__ == "__main__":
    main()
