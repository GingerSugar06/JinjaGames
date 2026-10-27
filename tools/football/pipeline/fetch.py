"""
Ham veri setlerini data/raw altına indirir (varsa atlar; --force ile yeniler).

  python pipeline/fetch.py [--force]

Transfermarkt veri seti (dcaribou, CC0) bakımcıları kazıyıcıyı Eylül 2026'da durdurdu; dosyalar artık değişmiyor,
bu yüzden günlük iş akışı bunları yeniden indirmez. Güncel veri için pipeline/current.py (ESPN + FPL) kullanılır.
"""
import os
import sys
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW = os.environ.get("WIF_RAW") or os.path.join(ROOT, "data", "raw")
R2 = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/"
FILES = {
    **{f"tm/{n}.csv.gz": R2 + f"{n}.csv.gz" for n in ("players", "games", "player_valuations", "transfers", "clubs", "competitions")},
    "intl/results.csv": "https://raw.githubusercontent.com/martj42/international_results/master/results.csv",
    "intl/shootouts.csv": "https://raw.githubusercontent.com/martj42/international_results/master/shootouts.csv",
}


def main():
    force = "--force" in sys.argv
    for rel, url in FILES.items():
        path = os.path.join(RAW, rel)
        if os.path.exists(path) and not force:
            print("var:", rel)
            continue
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print("indiriliyor:", rel, flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": "WhatIfFootball-pipeline/1.0 (personal project)"})
        with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f:
            f.write(r.read())


if __name__ == "__main__":
    main()
