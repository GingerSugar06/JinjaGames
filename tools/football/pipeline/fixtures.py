"""
Güncel sezon (2026/27) fikstür ve sonuçları: build.py'den SONRA çalıştırılır.

Kaynak (ücretsiz, anahtarsız): ESPN açık JSON API — 13 ligin 2026/27 maçları (oynananlar skorlu, kalanlar fikstür).

Çıktılar (data/built):
  matches/{comp}/2026.json   oynanmış maçlar (lig what-if ekranında "2026/27" olarak görünür)
  upcoming.json              oynanmamış maçlar (simülatörün "Yaklaşan" listesi)
  clubs.json                 yeni kulüpler ve arma (b) alanı eklenir
  match_index.json           2026 sezonu eklenir
"""
import difflib
import zlib
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request
from datetime import date

sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
SEASON = 2026
TODAY = date.today().isoformat()

OPENFOOTBALL = {  # dosya -> yarışma kimliği
    "en.1": "GB1", "es.1": "ES1", "de.1": "L1", "it.1": "IT1", "fr.1": "FR1", "nl.1": "NL1", "pt.1": "PO1",
}
SPORTSDB = {"TR1": (4339, 34)}  # yarışma -> (lig id, hafta sayısı)
ALIAS = {  # kaynak adı -> Transfermarkt kulüp kimliği (otomatik eşleşmeyenler)
    "FC Internazionale Milano": 46, "ES Troyes AC": 1095, "Lille OSC": 1082, "SBV Excelsior": 798, "Fortuna Sittard": 385,
    "FC Twente '65": 317, "Sporting Clube de Portugal": 336, "Sport Lisboa e Benfica": 294,
    # ESPN adları
    "Internazionale": 46, "FC Cologne": 3, "SV Elversberg": 64, "Brest": 3911, "OH Leuven": 2727, "Racing Genk": 1184, "PAOK": 1091,
    "AEK": 2441, "AEK Athens": 2441, "Levadeiakos": 2672, "OFI": 653, "OFI Crete": 653, "Volos NFC": 60949, "Olympiacos": 683, "Olympiakos": 683,
    "Hertha Berlin": 44, "1. FC Heidenheim 1846": 2036, "Kifisia": 30120, "Kalamata": 9, "Erzurum BB": 39722,
}
STOP = {"fc", "afc", "cf", "ac", "as", "sc", "sk", "fk", "club", "de", "futbol", "football", "calcio", "1", "the", "cd", "ud", "sv", "vfb", "vfl", "rc", "us", "ss", "og", "real"}


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "WhatIfFootball-pipeline/1.0 (personal project)"}), timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            if i == tries - 1:
                print("   !", url, e)
                return None
            time.sleep(25 if "429" in str(e) else 3)


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").replace("ı", "i")
    return re.sub(r"[^a-z0-9 ]", " ", s)


def toks(s):
    return [t for t in norm(s).split() if t not in STOP] or norm(s).split()


class Mapper:
    def __init__(self, clubs):
        self.clubs = clubs
        self.cache = {}
        self.new = {}
        self.next_id = -1000
        self.pre = {int(i): (norm(c["n"]), set(toks(c["n"]))) for i, c in clubs.items()}
        self.skip = {int(i) for i, c in clubs.items() if int(i) > 0 and re.search(r"(\s(B|II|III|U\d{2}|Yth\.?|Youth|Jgd\.?|Jeugd|Sub-?\d+|Reserves?)|U\d{2})\s*$", c["n"], re.I)}
        try:
            comps = json.load(open(os.path.join(OUT, "competitions.json"), encoding="utf-8"))
        except Exception:  # noqa: BLE001
            comps = {}
        self.country = {c: m.get("country") for c, m in comps.items()}

    def score(self, name, cid):
        n, t = self.pre[cid]
        nn, tt = norm(name), set(toks(name))
        r = difflib.SequenceMatcher(None, nn, n).ratio()
        if tt and (tt <= t or t <= tt) and min(len(tt), len(t)) >= 1:
            r = max(r, 0.93 if len(tt) == len(t) else 0.88)
        return r

    def map(self, name, comp):
        key = (name, comp)
        if key in self.cache:
            return self.cache[key]
        if name in ALIAS:
            self.cache[key] = ALIAS[name]
            return ALIAS[name]
        ctry = self.country.get(comp)
        # aynı ülkedeki tüm kademelerin kulüpleri (yükselen/düşen takımlar yanlış havuza düşmesin)
        pool = [i for i, c in self.clubs.items() if int(i) not in self.skip and (c.get("c") == comp or (ctry and self.country.get(c.get("c")) == ctry))]
        best, bs = None, 0
        for cid in map(int, pool):
            s = self.score(name, cid)
            if s > bs:
                best, bs = cid, s
        if bs < 0.8:  # yükselen takım: başka liglerde adı geçen kulüp olabilir
            for cid in self.pre:
                if cid in self.skip:
                    continue
                s = self.score(name, cid)
                if s > bs and s >= 0.9:
                    best, bs = cid, s
        if bs < 0.8:
            best = -1000 - zlib.crc32(name.encode()) % 900     # kararlı kimlik: aynı ad her çalıştırmada aynı kimliği alır
            while str(best) in self.clubs and self.clubs[str(best)]["n"] != name:
                best -= 1
            self.new[best] = {"n": name, "c": comp}
            self.clubs[str(best)] = {"n": name, "c": comp}
            self.pre[best] = (norm(name), set(toks(name)))
            print(f"   + yeni kulüp {name} ({comp})")
        elif bs < 0.9:
            print(f"   ~ eşleşme {name} -> {self.clubs[str(best)]['n']} ({bs:.2f})")
        self.cache[key] = best
        return best


ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer"
LEAGUES = {  # ESPN lig kodu -> yarışma kimliği
    "tur.1": "TR1", "eng.1": "GB1", "esp.1": "ES1", "ger.1": "L1", "ita.1": "IT1", "fra.1": "FR1", "ned.1": "NL1",
    "por.1": "PO1", "bel.1": "BE1", "sco.1": "SC1", "gre.1": "GR1", "eng.2": "GB2", "ger.2": "L2",
}
PLAYED = {"STATUS_FULL_TIME", "STATUS_FINAL_AET", "STATUS_FINAL_PEN"}


def main():
    from common import reindex
    clubs = json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8"))
    for k in [k for k in clubs if -2000 < int(k) < 0]:     # önceki çalıştırmada oluşan geçici kulüpleri yeniden kur
        del clubs[k]
    mp = Mapper(clubs)
    upcoming, total_played, fresh = [], 0, []
    for slug, comp in LEAGUES.items():
        events = {}
        for year in (SEASON, SEASON + 1):          # ESPN "dates=YYYY" takvim yılının tüm maçlarını verir
            data = get(f"{ESPN}/{slug}/scoreboard?dates={year}&limit=1000")
            for e in (data or {}).get("events", []):
                if e.get("season", {}).get("year") == SEASON:
                    events[e["id"]] = e
        rows_src = []
        for e in events.values():
            c = e["competitions"][0]["competitors"]
            home = next((x for x in c if x["homeAway"] == "home"), None)
            away = next((x for x in c if x["homeAway"] == "away"), None)
            if not home or not away or e["status"]["type"]["name"] == "STATUS_ABANDONED":
                continue
            st = e["status"]["type"]["name"]
            played = st in PLAYED and home.get("score") not in (None, "") and away.get("score") not in (None, "")
            rows_src.append((e["date"][:10], e["date"], home["team"]["displayName"], away["team"]["displayName"], int(home["score"]) if played else None, int(away["score"]) if played else None))
        rows_src.sort(key=lambda r: (r[1], r[2]))
        count, rows = {}, []
        for d, _, hn, an, hg, ag in rows_src:
            h, a = mp.map(hn, comp), mp.map(an, comp)
            count[h] = count.get(h, 0) + 1
            count[a] = count.get(a, 0) + 1
            rnd = f"{max(count[h], count[a])}. Matchday"
            gid = 900_000_000 + zlib.crc32(f"{comp}|{d}|{h}|{a}".encode()) % 90_000_000
            if hg is not None:
                rows.append([gid, d, rnd, h, a, hg, ag, None, None, None, None, None, None, None, None, None, None])
            else:
                upcoming.append({"id": gid, "comp": comp, "date": d, "round": rnd, "h": h, "a": a, "hn": hn, "an": an})
        os.makedirs(os.path.join(OUT, "matches", comp), exist_ok=True)
        path = os.path.join(OUT, "matches", comp, f"{SEASON}.json")
        old_n = len(json.load(open(path, encoding="utf-8"))) if os.path.exists(path) else 0
        if len(rows) > old_n:
            fresh.append(("mac", None, f"{comp}: {len(rows) - old_n} yeni maç sonucu (toplam {len(rows)})"))
        if rows:
            json.dump(rows, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        elif os.path.exists(path):
            os.remove(path)
        total_played += len(rows)
        print(f"-> {slug}: {len(rows)} oynanmış, {sum(1 for u in upcoming if u['comp'] == comp)} kalan maç", flush=True)
        time.sleep(0.3)
    upcoming = sorted((u for u in upcoming if u["date"] >= TODAY), key=lambda u: (u["date"], u["comp"]))
    json.dump({"asOf": TODAY, "fixtures": upcoming}, open(os.path.join(OUT, "upcoming.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(clubs, open(os.path.join(OUT, "clubs.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    reindex()
    from common import log_changes
    log_changes(fresh)
    print(f"tamam: {total_played} oynanmış maç, yaklaşan: {len(upcoming)}")


if __name__ == "__main__":
    sys.exit(main())
