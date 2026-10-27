"""Veri hattı adımlarının ortak yardımcıları."""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.environ.get("WIF_BUILT") or os.path.join(ROOT, "data", "built")


def reindex():
    """match_index.json'u diskteki maç dosyalarından yeniden kurar.

    Her adım yalnızca kendi dosyalarını yazar; indeks hep dizinden türetildiği için
    bir adımın (ör. build.py) yeniden çalışması diğerlerinin (ör. 2026/27 fikstürü) kaydını silemez.
    """
    root = os.path.join(OUT, "matches")
    idx = {}
    for comp in sorted(os.listdir(root)):
        d = os.path.join(root, comp)
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            if f.endswith(".json"):
                with open(os.path.join(d, f), encoding="utf-8") as fh:
                    idx.setdefault(comp, {})[f[:-5]] = len(json.load(fh))
    with open(os.path.join(OUT, "match_index.json"), "w", encoding="utf-8") as fh:
        json.dump(idx, fh, ensure_ascii=False, separators=(",", ":"))
    return idx


LAST = os.environ.get("WIF_LAST") or os.path.join(ROOT, "data", "last")
MAX_LOG = 500


def club_names():
    try:
        return {k: v["n"] for k, v in json.load(open(os.path.join(OUT, "clubs.json"), encoding="utf-8")).items()}
    except Exception:  # noqa: BLE001
        return {}


def log_changes(entries):
    """Bu güncellemede fark edilen değişiklikleri günlüğe ekler. entries: [(tür, kulüp_kimliği|None, metin)].

    Günlük data/last/changes.json'da (güncellemeler arasında korunur) tutulur ve siteye data/built/changes.json olarak verilir.
    Satır: [tarih, tür, kulüp, metin]; en yeni başta, en fazla 500 satır.
    """
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    os.makedirs(LAST, exist_ok=True)
    path = os.path.join(LAST, "changes.json")
    cur = json.load(open(path, encoding="utf-8")).get("items", []) if os.path.exists(path) else []
    seen = {(r[0], r[1], r[2], r[3]) for r in cur}
    new = [[today, k, c, t] for k, c, t in entries if (today, k, c, t) not in seen]
    doc = {"items": (new + cur)[:MAX_LOG]}
    for p in (path, os.path.join(OUT, "changes.json")):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        json.dump(doc, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return len(new)
