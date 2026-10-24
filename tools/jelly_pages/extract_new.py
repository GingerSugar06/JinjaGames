"""6 yeni Jelly oyununun l10n dosyasından dünya/twist adı ve açıklamasını çıkarır -> strings_jelly<oyun>.json."""
import ast
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
APPS = r'C:\Users\user\Desktop\Puzzles\apps'
BS = chr(92)


def dart_string(body, lang):
    """body içinde 'lang': '...' ya da "..." değerini, kaçışlara uyarak okur."""
    m = re.search("'" + lang + "':" + r'\s*', body)
    if not m:
        return None
    i = m.end()
    q = body[i]
    if q not in '\'"':
        return None
    j = i + 1
    while j < len(body):
        if body[j] == BS:
            j += 2
            continue
        if body[j] == q:
            break
        j += 1
    return ast.literal_eval(body[i:j + 1])


for g in ('jars', 'logic', 'loops', 'park', 'seek', 'slide'):
    src = open(os.path.join(APPS, 'jelly_' + g, 'lib', 'l10n', 'strings.dart'), encoding='utf8').read()
    d = {}
    for m in re.finditer(r"'((?:world|twist)\.[\w.]+)':\s*\{(.*?)\n    \}", src, re.S):
        k, body = m.groups()
        tr, en = dart_string(body, 'tr'), dart_string(body, 'en')
        if tr is not None and en is not None:
            d[k] = {'tr': tr, 'en': en}
    with open(os.path.join(HERE, 'strings_jelly%s.json' % g), 'w', encoding='utf8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)
    print(g, len(d))
