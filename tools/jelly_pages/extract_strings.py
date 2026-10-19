"""Oyunların l10n dosyasından dünya adlarını ve mekanik (twist) açıklamalarını çıkarır ->
tools/jelly_pages/strings_<slug>.json. Sayfa metinleri oyunun kendi sözcükleriyle tutarlı kalsın diye."""
import ast
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
APPS = r'C:\Users\user\Desktop\Puzzles\apps'
PAT = re.compile(r"'((?:world|twist)\.[\w.]+)':\s*\{\s*'tr':\s*('(?:[^'\\]|\\.)*'),\s*'en':\s*('(?:[^'\\]|\\.)*')\s*,?\s*\}", re.S)

for slug, app in (('jellytrails', 'jelly_trails'), ('jellypipes', 'jelly_pipes')):
    src = open(os.path.join(APPS, app, 'lib', 'l10n', 'strings.dart'), encoding='utf8').read()
    out = {}
    for k, tr, en in PAT.findall(src):
        out[k] = {'tr': ast.literal_eval(tr), 'en': ast.literal_eval(en)}
    with open(os.path.join(HERE, 'strings_%s.json' % slug), 'w', encoding='utf8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(slug, len(out), sum(1 for k in out if k.startswith('world.')))
