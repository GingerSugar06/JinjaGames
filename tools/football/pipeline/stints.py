"""
Oyuncuların kulüp dönemleri (kim, hangi kulüpte, hangi aylar arasında) — takım kimyası için "daha önce birlikte oynadılar mı?" sorusunun cevabı.

Kaynak: data/built/valuations (Transfermarkt değer geçmişi; her kayıtta kulüp var) ve players.json (güncel kulüp). Yeni veri çekmez.
Kapsam: herhangi bir sezon kadrosunda (data/built/squads) ya da güncel kadroda (current.json) geçen oyuncular.

Çıktı: data/built/stints.json   { "<oyuncu>": [kulüp, başlangıç_ay, bitiş_ay, kulüp, başlangıç_ay, bitiş_ay, ...] }
  ay = 2000 Ocak'tan beri ay sırası (sitedeki "mi" ile aynı); bitiş 9999 = hâlâ orada (güncel kulüp).
"""
import json
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")


def main():
    players = json.load(open(os.path.join(OUT, "players.json"), encoding="utf-8"))
    cur_club = {p[0]: p[6] for p in players}           # [id, ad, hat, mevki, doğum, uyruk, kulüp, ...]
    want = set()
    sq = os.path.join(OUT, "squads")
    for fn in os.listdir(sq):
        for rows in json.load(open(os.path.join(sq, fn), encoding="utf-8")).values():
            want.update(r[0] for r in rows)
    try:
        for rows in json.load(open(os.path.join(OUT, "current.json"), encoding="utf-8"))["clubs"].values():
            want.update(r["id"] for r in rows if r.get("id"))
    except Exception:  # noqa: BLE001
        pass
    out = {}
    for s in range(32):
        shard = json.load(open(os.path.join(OUT, "valuations", f"{s}.json"), encoding="utf-8"))
        for pid, recs in shard.items():
            pid = int(pid)
            if pid not in want or not recs:
                continue
            recs = sorted(recs)
            segs = []                                   # [kulüp, ilk_kayıt, son_kayıt]
            for mi, _v, club in recs:
                if club is None:
                    continue
                if segs and segs[-1][0] == club:
                    segs[-1][2] = mi
                else:
                    segs.append([club, mi, mi])
            flat = []
            for k, (club, a, b) in enumerate(segs):
                start = a if k == 0 else (segs[k - 1][2] + a) // 2        # kulüp değişimi, iki kayıt arasının ortasına konur
                end = b if k == len(segs) - 1 else (b + segs[k + 1][1]) // 2
                if k == len(segs) - 1 and cur_club.get(pid) == club:
                    end = 9999
                flat += [club, start, end]
            if flat:
                out[str(pid)] = flat
    p = os.path.join(OUT, "stints.json")
    json.dump(out, open(p, "w", encoding="utf-8"), separators=(",", ":"))
    print(f"yazıldı: {p} ({os.path.getsize(p) / 1e6:.2f} MB) · {len(out)} oyuncu / {len(want)} istenen")


if __name__ == "__main__":
    sys.exit(main())
