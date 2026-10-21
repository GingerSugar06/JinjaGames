"""Mod jar'ı bu makinede olmayan bir BaneBender projesini wiki verisine ekler (yalnız CurseForge verisiyle).

Kullanım:  python tools/add_cf_mod.py every-last-bite <logo-dosyası>
- Ad, proje kimliği, sürüm ve dosya tarihi api.cfwidget.com'dan gelir.
- Logo verilen dosyadan `banebender/img/<slug>/logo.webp` ve `logo-s.webp` olarak yazılır.
- `banebender/data/generated.js`'e girdi eklenir (sprite/varlık listesi boş: jar okunmadığı için).
Jar elindeyse bunun yerine `tools/build_banebender.py` (BB_ONLY=slug) kullan: eşya atlası ve dil sayısı da çıkar.
Sayfa metni elle yazılır: banebender/data/mods.js."""
import colorsys, json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug, logo_path = sys.argv[1], sys.argv[2]
OUT = os.path.join(ROOT, 'banebender')

d = json.loads(urllib.request.urlopen(urllib.request.Request('https://api.cfwidget.com/minecraft/mc-mods/' + slug, headers={'User-Agent': 'jinjagames-site'}), timeout=40).read())
f = d['files'][0]


def accent_of(im):
    im = im.convert('RGB').resize((64, 64))
    buckets = {}
    for r, g, b in im.getdata():
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < .35 or l < .25 or l > .8:
            continue
        buckets.setdefault(int(h * 24), []).append((r, g, b))
    if not buckets:
        return '#6fbf87'
    px = max(buckets.values(), key=len)
    return '#%02x%02x%02x' % tuple(sum(c[i] for c in px) // len(px) for i in range(3))


os.makedirs(os.path.join(OUT, 'img', slug), exist_ok=True)
im = Image.open(logo_path)
im.seek(0)
im = im.convert('RGB')
accent = accent_of(im)
big = im.copy(); big.thumbnail((400, 400)); big.save(os.path.join(OUT, 'img', slug, 'logo.webp'), 'WEBP', quality=86, method=6)
small = im.copy(); small.thumbnail((160, 160)); small.save(os.path.join(OUT, 'img', slug, 'logo-s.webp'), 'WEBP', quality=84, method=6)

gp = os.path.join(OUT, 'data', 'generated.js')
t = open(gp, encoding='utf8').read()
gen = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
gen[slug] = {
    'name': d['title'], 'modid': '', 'version': f['name'].split('-')[1] if '-' in f['name'] else '',
    'file': f['name'], 'fileDate': f['uploaded_at'][:10], 'mc': '1.20.1', 'loader': 'Forge',
    'url': d['urls']['curseforge'], 'projectId': d['id'], 'deps': [], 'langs': [], 'accent': accent, 'lists': {},
    'sprites': [], 'entities': [], 'gallery': [], 'counts': {'itemTextures': 0, 'blockTextures': 0, 'entityTextures': 0, 'langKeys': 0},
}
with open(gp, 'w', encoding='utf8', newline='\n') as fh:
    fh.write('/* Otomatik üretildi: mod jar dosyalarındaki dil ve doku verisinden. Elle düzenleme. */\n')
    fh.write('window.BB_GEN=' + json.dumps(gen, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('eklendi', slug, accent, gen[slug]['version'], gen[slug]['fileDate'])
