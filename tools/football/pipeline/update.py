"""
Tek komutla güncelleme: son güncellemeden bu yana ne değiştiyse onu alır, değişmeyeni yeniden işlemez.

  python pipeline/update.py              # normal (artımlı) güncelleme
  python pipeline/update.py --force      # her adımı baştan çalıştır
  python pipeline/update.py --only managers current

Nasıl çalışır:
  - data/last/state.json son başarılı güncellemenin zamanını ve ağır adımların girdi parmak izini tutar.
  - Eski sezonlar (build / england / ess) yalnızca ham veri ya da betikleri değiştiyse yeniden kurulur; aksi hâlde atlanır.
  - Güncel veri adımları her güncellemede çalışır ve bir önceki güncellemeden bu yana olan her şeyi bir seferde getirir:
      fixtures  yeni oynanan maçlar + kalan fikstür (ESPN)
      current   kadrolar, istatistikler, sakatlıklar, yeni transferler (ESPN + FPL)
      managers  teknik direktör/başkan/CEO/sahip değişiklikleri (Wikidata); eski hoca geçmişi önbellekten
  - Fark edilen her değişiklik data/built/changes.json'a yazılır; sitenin ana sayfası bunu "Son güncellemeler" olarak gösterir.
  - Bir adım başarısız olursa diğerleri çalışır; site son iyi veriyle yayınlanır. O adım bir sonraki güncellemede yeniden denenir.
"""
import hashlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
RAW = os.environ.get("WIF_RAW") or os.path.join(ROOT, "data", "raw")
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")
LAST = os.environ.get("WIF_LAST") or os.path.join(ROOT, "data", "last")
STATE = os.path.join(LAST, "state.json")


def fp_files(paths):
    """Dosya/dizin listesinin içerik parmak izi (sha1). Ham dosyalar her çalıştırmada yeniden indirilse bile aynı içerik aynı izi verir."""
    h = hashlib.sha1()

    def one(q):
        h.update(os.path.relpath(q, ROOT).replace("\\", "/").encode())
        with open(q, "rb") as f:
            while chunk := f.read(1 << 20):
                h.update(chunk)

    for p in paths:
        if os.path.isdir(p):
            for root, _, files in sorted(os.walk(p)):
                for f in sorted(files):
                    one(os.path.join(root, f))
        elif os.path.exists(p):
            one(p)
        else:
            h.update(f"yok:{p}".encode())
    return h.hexdigest()


def script(*names):
    return [os.path.join(HERE, n) for n in names]


# (ad, betik, "artımlı" ise girdi listesi ve beklenen çıktılar; None = her güncellemede çalışır)
STEPS = [
    ("fetch", "fetch.py", None, None),
    ("build", "build.py", [os.path.join(RAW, "tm"), os.path.join(RAW, "intl")] + script("build.py", "competitions.py", "common.py"), ["clubs.json", "players.json", "competitions.json"]),
    ("england", "england.py", [os.path.join(RAW, "england")] + script("england.py", "common.py"), ["match_index.json"]),
    ("ess", "ess.py", [os.path.join(RAW, "ess")] + script("ess.py", "common.py"), ["match_index.json"]),
    ("fixtures", "fixtures.py", None, None),
    ("news", "news.py", None, None),
    ("current", "current.py", None, None),
    ("managers", "managers.py", None, None),
    ("stints", "stints.py", None, None),            # oyuncu kulüp dönemleri (takım kimyası); güncel kadrolara ve değer geçmişine bakar
]


def load_state():
    try:
        return json.load(open(STATE, encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {"last": None, "fp": {}}


def main():
    args = sys.argv[1:]
    force = "--force" in args
    only = set(args[args.index("--only") + 1:]) if "--only" in args else None
    st = load_state()
    now = datetime.now(timezone.utc)
    last = st.get("last")
    if last:
        days = (now - datetime.fromisoformat(last)).total_seconds() / 86400
        print(f"Son güncelleme: {last[:16].replace('T', ' ')} UTC ({days:.1f} gün önce) — o günden bu yana olanlar alınacak.\n", flush=True)
    else:
        print("İlk güncelleme: her şey kuruluyor.\n", flush=True)

    report, rebuilt_base = [], False
    for name, fn, inputs, outputs in STEPS:
        if only and name not in only:
            continue
        if inputs is not None and not force:
            fp = fp_files(inputs)
            have = all(os.path.exists(os.path.join(OUT, o)) for o in outputs)
            # temel veri (build) yeniden kurulduysa ondan türeyen eski sezon adımları da yeniden çalışmalı
            same = st["fp"].get(name) == fp and have and not (rebuilt_base and name in ("england", "ess"))
            if same:
                print(f"== {name}: değişiklik yok, atlandı", flush=True)
                report.append((name, "atlandı", 0))
                continue
        else:
            fp = fp_files(inputs) if inputs is not None else None
        print(f"== {name}", flush=True)
        t0 = time.time()
        r = subprocess.run([sys.executable, os.path.join(HERE, fn)], cwd=ROOT, env={**os.environ, "PYTHONIOENCODING": "utf-8"})
        dt = time.time() - t0
        if r.returncode == 0:
            if fp is not None:
                st["fp"][name] = fp
            if name == "build":
                rebuilt_base = True
            report.append((name, "tamam", dt))
        else:
            # başarısız adımın parmak izi kaydedilmez: bir sonraki güncellemede yeniden denenir
            st["fp"].pop(name, None)
            report.append((name, "HATA", dt))
            print(f"   ! {name} başarısız oldu (çıkış kodu {r.returncode}); diğer adımlar sürüyor", flush=True)

    ok_current = all(s != "HATA" for n, s, _ in report if n in ("fixtures", "news", "current", "managers"))
    if ok_current and not only:
        st["last"] = now.isoformat(timespec="seconds")
    os.makedirs(LAST, exist_ok=True)
    json.dump(st, open(STATE, "w", encoding="utf-8"), indent=1)

    # siteye: güncelleme zamanı + günlük (log_changes yazdıysa üzerine ekler)
    cp = os.path.join(LAST, "changes.json")
    doc = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {"items": []}
    doc["updated"] = now.isoformat(timespec="seconds")
    doc["prev"] = last
    os.makedirs(OUT, exist_ok=True)
    for p in (cp, os.path.join(OUT, "changes.json")):
        json.dump(doc, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    since = (last or "0000")[:10]
    news = [r for r in doc["items"] if r[0] >= since]
    print("\n---- özet ----")
    for n, s, dt in report:
        print(f"  {n:9s} {s:8s} {dt:5.0f} sn" if s != "atlandı" else f"  {n:9s} {s}")
    print(f"  son güncellemeden beri {len(news)} değişiklik kaydedildi:")
    for r in news[:15]:
        print(f"    [{r[1]}] {r[3]}")
    if any(s == "HATA" for _, s, _ in report):
        print("  Not: hata veren adımlar bir sonraki güncellemede yeniden denenecek.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
