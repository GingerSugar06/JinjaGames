"""Oyunların l10n dosyasından dünya adlarını ve mekanik (twist) açıklamalarını çıkarır ->
tools/jelly_pages/strings_<slug>.json. Sayfa metinleri oyunun kendi sözcükleriyle tutarlı kalsın diye.
Oyunlar çok dilli (tr, en, de, es, pt, fr ...): sayfalar yalnız TR ve EN kullanır."""
import ast
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
APPS = r'C:\Users\user\Desktop\Puzzles\apps'
BLOCK = re.compile(r"'((?:world|twist)\.[\w.]+)':\s*\{(.*?)\n\s*\},", re.S)
LANG = re.compile(r"'(tr|en)':\s*('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")")

for slug, app in (('jellytrails', 'jelly_trails'), ('jellypipes', 'jelly_pipes')):
    src = open(os.path.join(APPS, app, 'lib', 'l10n', 'strings.dart'), encoding='utf8').read()
    out = {}
    for k, body in BLOCK.findall(src):
        d = {l: ast.literal_eval(v) for l, v in LANG.findall(body)}
        if 'tr' in d and 'en' in d:
            out[k] = {'tr': d['tr'], 'en': d['en']}
    with open(os.path.join(HERE, 'strings_%s.json' % slug), 'w', encoding='utf8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(slug, len(out), sum(1 for k in out if k.startswith('world.')))
