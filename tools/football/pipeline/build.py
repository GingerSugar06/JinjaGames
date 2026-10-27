"""
What If Football - veri hattı (pipeline)

Ham ücretsiz veri setlerini (data/raw) okur, web uygulamasının doğrudan
kullanacağı kompakt JSON parçalarına (data/built) dönüştürür.

Kaynaklar (hepsi ücretsiz / açık lisans):
  - dcaribou/transfermarkt-datasets (CC0): maçlar, oyuncular, değerler, transferler, kulüpler
  - martj42/international_results (CC0): 1872'den bu yana milli maçlar

Çalıştır:  python pipeline/build.py
"""
import json
import math
import re
import os
import sys
from collections import defaultdict

import pandas as pd

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW = os.environ.get("WIF_RAW") or os.path.join(ROOT, "data", "raw")
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
FIRST_SEASON = 2000

sys.path.insert(0, os.path.dirname(__file__))
from competitions import COMPETITIONS  # noqa: E402


def dump(path, obj):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def nn(v, cast=None, default=None):
    """NaN -> default."""
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return default
    if pd.isna(v):
        return default
    return cast(v) if cast else v


def read(name):
    return pd.read_csv(os.path.join(RAW, "tm", name + ".csv.gz"), low_memory=False)


POS = {
    "Goalkeeper": "GK",
    "Centre-Back": "CB", "Left-Back": "LB", "Right-Back": "RB",
    "Defensive Midfield": "DM", "Central Midfield": "CM", "Attacking Midfield": "AM",
    "Left Midfield": "LM", "Right Midfield": "RM",
    "Left Winger": "LW", "Right Winger": "RW", "Second Striker": "SS", "Centre-Forward": "CF",
}
LINE = {"Goalkeeper": "G", "Defender": "D", "Midfield": "M", "Attack": "A"}


def img_of(url):
    """Transfermarkt portre adresinden yalnızca dosya adı (istemci tam adresi kurar)."""
    if not isinstance(url, str):
        return None
    m = re.search(r"/portrait/\w+/([^/?]+)", url)
    return m.group(1) if m and "default" not in m.group(1) else None


def month_idx(date_str):
    y, m = int(date_str[:4]), int(date_str[5:7])
    return (y - 2000) * 12 + (m - 1)


def season_of(date_str):
    y, m = int(date_str[:4]), int(date_str[5:7])
    return y if m >= 7 else y - 1


def main():
    print("-> okunuyor")
    games = read("games")
    clubs = read("clubs")
    players = read("players")
    vals = read("player_valuations")
    trf = read("transfers")

    # ------------------------------------------------------------------ yarışmalar
    comps_in_data = set(games.competition_id.unique())
    comp_out = {}
    for cid, meta in COMPETITIONS.items():
        comp_out[cid] = dict(meta, id=cid, has_data=cid in comps_in_data)

    # ------------------------------------------------------------------ kulüp adları
    names = {}
    for _, r in clubs.iterrows():
        names[int(r.club_id)] = r["name"]
    for col_id, col_name in (("home_club_id", "home_club_name"), ("away_club_id", "away_club_name")):
        for cid, nm in games[[col_id, col_name]].dropna().drop_duplicates().itertuples(index=False):
            names.setdefault(int(cid), nm)
    for a, b in (("from_club_id", "from_club_name"), ("to_club_id", "to_club_name")):
        for cid, nm in trf[[a, b]].dropna().drop_duplicates().itertuples(index=False):
            names.setdefault(int(cid), nm)

    club_meta = {}
    for _, r in clubs.iterrows():
        club_meta[int(r.club_id)] = {
            "n": r["name"],
            "c": nn(r.domestic_competition_id),
            "st": nn(r.stadium_name),
            "se": nn(r.stadium_seats, int),
            "co": nn(r.coach_name),
        }
    for cid, nm in names.items():
        club_meta.setdefault(cid, {"n": nm, "c": None})
    # kulüp -> lig (maç verisinden de çıkar)
    dom = games[games.competition_id.isin([c for c, m in COMPETITIONS.items() if m["type"] == "league"])]
    for col in ("home_club_id", "away_club_id"):
        for cid, comp in dom[[col, "competition_id"]].drop_duplicates().itertuples(index=False):
            club_meta.setdefault(int(cid), {"n": names.get(int(cid), "?"), "c": None})
            if not club_meta[int(cid)].get("c"):
                club_meta[int(cid)]["c"] = comp
    dump("clubs.json", club_meta)

    # ------------------------------------------------------------------ maçlar
    games = games.dropna(subset=["home_club_goals", "away_club_goals"]).copy()
    games = games[games.season >= FIRST_SEASON - 1]
    index = defaultdict(dict)
    for (comp, season), g in games.groupby(["competition_id", "season"]):
        g = g.sort_values(["date", "game_id"])
        rows = []
        for r in g.itertuples(index=False):
            rows.append([
                int(r.game_id), r.date, nn(r.round, str, ""),
                int(r.home_club_id), int(r.away_club_id),
                int(r.home_club_goals), int(r.away_club_goals),
                nn(r.home_club_position, int), nn(r.away_club_position, int),
                nn(r.home_club_formation, str), nn(r.away_club_formation, str),
                nn(r.stadium, str), nn(r.attendance, int), nn(r.referee, str),
                nn(r.home_club_manager_name, str), nn(r.away_club_manager_name, str),
                nn(r.aggregate, str),
            ])
        dump(f"matches/{comp}/{int(season)}.json", rows)
        index[comp][int(season)] = len(rows)
    dump("match_index.json", index)
    print("   maç dosyaları:", sum(len(v) for v in index.values()))

    # ------------------------------------------------------------------ oyuncular
    pl = []
    for r in players.itertuples(index=False):
        pl.append([
            int(r.player_id), r.name,
            LINE.get(r.position, "M"), POS.get(r.sub_position, ""),
            nn(r.date_of_birth, lambda v: str(v)[:10]),
            nn(r.country_of_citizenship, str),
            nn(r.current_club_id, int),
            nn(r.market_value_in_eur, int, 0),
            nn(r.highest_market_value_in_eur, int, 0),
            nn(r.foot, str), nn(r.height_in_cm, int),
            nn(r.contract_expiration_date, lambda v: str(v)[:10]),
            nn(r.last_season, int),
            nn(r.international_caps, int),
            img_of(r.image_url),
        ])
    dump("players.json", pl)
    pinfo = {p[0]: p for p in pl}
    print("   oyuncu:", len(pl))

    # ------------------------------------------------------------------ değer geçmişi (parçalı)
    vals = vals[vals.date >= "2000-01-01"].copy()
    vals["mi"] = vals.date.map(month_idx)
    vals = vals.sort_values(["player_id", "date"])
    shards = defaultdict(lambda: defaultdict(list))
    for r in vals.itertuples(index=False):
        shards[int(r.player_id) % 32][int(r.player_id)].append(
            [int(r.mi), int(r.market_value_in_eur), nn(r.current_club_id, int, 0)]
        )
    for s, d in shards.items():
        dump(f"valuations/{s}.json", d)
    print("   değer geçmişi parça:", len(shards))

    # ------------------------------------------------------------------ transferler
    trf = trf.copy()
    trf = trf[(trf.transfer_date >= "2000-01-01") & (trf.transfer_date < "2029-01-01")]
    trf["season"] = trf.transfer_date.map(season_of)
    for season, g in trf.groupby("season"):
        rows = []
        for r in g.sort_values("transfer_date").itertuples(index=False):
            rows.append([
                int(r.player_id), r.transfer_date,
                nn(r.from_club_id, int, 0), nn(r.to_club_id, int, 0),
                nn(r.transfer_fee, int), nn(r.market_value_in_eur, int, 0),
            ])
        dump(f"transfers/{int(season)}.json", rows)
    print("   transfer sezon:", trf.season.nunique())

    # ------------------------------------------------------------------ sezon kadroları (değerlerden)
    vals["season"] = vals.date.map(season_of)
    squads_by_season = {}
    last = vals.sort_values("date").groupby(["season", "player_id"]).tail(1)
    for season, g in last.groupby("season"):
        sq = defaultdict(list)
        for r in g.itertuples(index=False):
            if not r.current_club_id or pd.isna(r.current_club_id):
                continue
            sq[int(r.current_club_id)].append([int(r.player_id), int(r.market_value_in_eur)])
        out = {}
        for cid, lst in sq.items():
            lst.sort(key=lambda x: -x[1])
            out[cid] = lst[:45]
        squads_by_season[int(season)] = out
        dump(f"squads/{int(season)}.json", out)
    print("   kadro sezon:", len(squads_by_season))

    # ------------------------------------------------------------------ kulüp Elo (sezon başı)
    elo_snap = build_club_elo(games, squads_by_season)
    for season, d in elo_snap.items():
        dump(f"elo/{season}.json", d)

    # ------------------------------------------------------------------ milli takımlar
    build_national(players)
    dump("competitions.json", comp_out)
    from common import reindex
    reindex()
    print("tamam ->", OUT)


# ---------------------------------------------------------------------- kulüp Elo
def build_club_elo(games, squads_by_season):
    """Maç sonuçlarından kulüp Elo. Yeni kulüpler kadro değerine göre başlar;
    her sezon başı %30 oranında değer-tabanlı beklentiye çekilir."""
    def sq_value(season, cid):
        sq = squads_by_season.get(season, {}).get(cid)
        if not sq:
            return None
        top = sorted((v for _, v in sq), reverse=True)[:18]
        return sum(top)

    def prior(season, cid):
        v = sq_value(season, cid)
        if not v:
            return None
        return 1500 + 120 * math.log(max(v, 2e6) / 60e6)

    g = games.sort_values(["date", "game_id"])
    rating = {}
    snaps = {}
    cur_season = None
    for r in g.itertuples(index=False):
        s = int(r.season)
        if s != cur_season:
            cur_season = s
            for cid in list(rating):
                p = prior(s, cid)
                if p is not None:
                    rating[cid] = 0.7 * rating[cid] + 0.3 * p
            # bu sezon kadrosu olan veya rating'i olan tüm kulüpler
            snap = {cid: round(v) for cid, v in rating.items()}
            for cid in squads_by_season.get(s, {}):
                if cid not in snap:
                    p = prior(s, cid)
                    if p is not None:
                        snap[cid] = round(p)
            snaps[s] = snap
        h, a = int(r.home_club_id), int(r.away_club_id)
        for cid in (h, a):
            if cid not in rating:
                rating[cid] = prior(s, cid) or 1400.0
                snaps[s].setdefault(cid, round(rating[cid]))
        if r.competition_id in ("FIWC", "EURO", "COPA", "AFAC", "AFCN"):
            continue
        dr = rating[h] + 60.0 - rating[a]
        e = 1 / (1 + 10 ** (-dr / 400))
        hg, ag = int(r.home_club_goals), int(r.away_club_goals)
        res = 1.0 if hg > ag else 0.5 if hg == ag else 0.0
        gd = abs(hg - ag)
        mult = 1.0 if gd <= 1 else 1.5 if gd == 2 else (11 + gd) / 8
        k = 22 * mult
        if r.competition_id in ("CL", "EL", "UCOL", "CLQ", "ELQ", "ECLQ"):
            k *= 1.15
        d = k * (res - e)
        rating[h] += d
        rating[a] -= d
    snaps[max(snaps) + 1] = {cid: round(v) for cid, v in rating.items()}  # güncel
    return snaps


# ---------------------------------------------------------------------- milli takımlar
TOURN_W = {
    "FIFA World Cup": 60, "Friendly": 20,
}


def tourn_weight(t):
    if t == "FIFA World Cup":
        return 60
    if "qualification" in t and ("FIFA" in t or "World Cup" in t):
        return 40
    if t == "Friendly":
        return 20
    if t in ("UEFA Euro", "Copa América", "African Cup of Nations", "AFC Asian Cup",
             "Gold Cup", "CONCACAF Championship", "Confederations Cup"):
        return 50
    if "qualification" in t:
        return 40
    if "Nations League" in t:
        return 40
    return 30


def build_national(players):
    res = pd.read_csv(os.path.join(RAW, "intl", "results.csv"))
    res = res.dropna(subset=["home_score", "away_score"]).sort_values("date")
    shoot = pd.read_csv(os.path.join(RAW, "intl", "shootouts.csv"))
    so = {(r.date, r.home_team, r.away_team): r.winner for r in shoot.itertuples(index=False)}
    rating = defaultdict(lambda: 1500.0)
    year_end = defaultdict(dict)  # team -> {year: elo}
    rows = []
    cur_year = None
    for r in res.itertuples(index=False):
        y = int(r.date[:4])
        if cur_year is not None and y != cur_year:
            for t, v in rating.items():
                year_end[t][cur_year] = round(v)
        cur_year = y
        h, a = r.home_team, r.away_team
        hg, ag = int(r.home_score), int(r.away_score)
        ha = 0 if r.neutral else 100
        dr = rating[h] + ha - rating[a]
        e = 1 / (1 + 10 ** (-dr / 400))
        s = 1.0 if hg > ag else 0.5 if hg == ag else 0.0
        gd = abs(hg - ag)
        gm = 1 if gd <= 1 else 1.5 if gd == 2 else (11 + gd) / 8
        k = tourn_weight(r.tournament) * gm
        pre_h, pre_a = rating[h], rating[a]
        d = k * (s - e)
        rating[h] += d
        rating[a] -= d
        if y >= FIRST_SEASON:
            rows.append([r.date, h, a, hg, ag, r.tournament, nn(r.city, str, ""), nn(r.country, str, ""),
                         1 if r.neutral else 0, round(pre_h), round(pre_a), so.get((r.date, h, a))])
    for t, v in rating.items():
        year_end[t][cur_year] = round(v)
    teams = sorted(rating)
    dump("intl/matches.json", rows)
    dump("intl/elo_year_end.json", {t: {str(y): v for y, v in d.items() if y >= 1990} for t, d in year_end.items()})
    dump("intl/teams.json", teams)
    print("   milli maç:", len(rows), " takım:", len(teams))


if __name__ == "__main__":
    main()
