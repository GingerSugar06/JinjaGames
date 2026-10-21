"""Builds sprite atlases, gallery webps and a generated data file for the BaneBender wiki.

Reads the mod jars (read only) and a folder of CurseForge downloads: $CF_CACHE_PARENT/dl/<slug>/logo.* and g*.png.
Writes into C:/Users/user/Desktop/JinjaGames/banebender/.
"""
import glob, io, json, os, re, zipfile, colorsys
from PIL import Image

HERE = os.environ.get('CF_CACHE_PARENT', os.path.dirname(os.path.abspath(__file__)))
MODS = r'C:\Users\user\curseforge\minecraft\Instances\veinminer\mods'
INST = r'C:\Users\user\curseforge\minecraft\Instances\veinminer\minecraftinstance.json'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'banebender')

JARS = {
    'pale-contagion': 'Pale Contagion', 'gilded-gambit': 'Gilded Gambit', 'variantide': 'Variantide',
    'real-animals': 'Real Animals', 'frontier-structures': 'Frontier-Structures', 'flesh-tanner': 'Flesh Tanner',
    'pantheon-of-legends': 'Pantheon-of-Legends', 'towers': 'Towers', 'chest-hauler': 'Chest Hauler',
    'seraph': 'Seraph', 'uncraft-and-unfurnace': 'Uncraft and Unfurnace', 'power-generators': 'Power Generators',
    'hard-mobs-and-bosses': 'Hard Mobs', 'elemental-arcana': 'Elemental-Arcana', 'card-lootbags': 'Loot Bags',
    'all-irons': 'Irones', 'veinminer-all-types': "Banebender's Veinminer",
    'death-hand': 'Death Hand', 'hearthly': 'Hearthly', 'ore-elemental-golems': 'Ore and Elemental Golems',
    'board-games': 'Board Games',
}
# Jar'ı bu makinede olmayan (ya da hiç indirilmemiş) projeler: yalnızca CurseForge verisiyle eklenir (tools/add_cf_mod.py).
# BB_ONLY=slug1,slug2 ortam değişkeni verilirse yalnız o modlar yeniden üretilir, geri kalanı generated.js'te korunur.
ONLY = {x for x in os.environ.get('BB_ONLY', '').split(',') if x}
# gallery files worth showing (screenshots, not unreadable creative-tab strips)
GALLERY_KEEP = {
    'towers': ['struct_', 'mobs_'],
    'hard-mobs-and-bosses': ['mobs_', 'item_totem', 'item_tools', 'item_armor'],
    'elemental-arcana': ['mobs_1'],
    'all-irons': ['mobs_4'],
    'chest-hauler': ['item_transporter'],
    'uncraft-and-unfurnace': ['item_diger'],
    'veinminer-all-types': [''],
}
MAX_ITEMS = 72
CELL = 32
COLS = 12


def load_json(z, name):
    t = z.read(name).decode('utf8', 'replace')
    try:
        return json.loads(t, strict=False)
    except Exception:
        return json.loads(re.sub(r',\s*}', '}', t), strict=False)


def fix(t):
    """Repairs double-encoded UTF-8 (Ã¼ -> ü) found in some tr_tr files."""
    if not isinstance(t, str) or not re.search('[ÃÄÅ][-¿Œ-™�]', t):
        return t
    t2 = t.replace('Å�', 'Ş')
    out, buf = [], ''
    try:
        b = bytearray()
        for ch in t2:
            if ch == 'Ş':
                b += 'Ş'.encode('utf8')
            else:
                b += ch.encode('cp1252')
        return b.decode('utf8')
    except Exception:
        return t


def first_frame(im):
    w, h = im.size
    if h > w and h % w == 0:  # animated strip
        im = im.crop((0, 0, w, w))
    return im


def accent_of(path):
    im = Image.open(path).convert('RGB').resize((64, 64))
    best, score = (120, 200, 90), -1
    buckets = {}
    for r, g, b in list(im.getdata()):
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if s < .35 or l < .25 or l > .8:
            continue
        key = int(h * 24)
        buckets.setdefault(key, []).append((r, g, b))
    for k, px in buckets.items():
        if len(px) > score:
            score = len(px)
            n = len(px)
            best = tuple(sum(c[i] for c in px) // n for i in range(3))
    return '#%02x%02x%02x' % best


def main():
    inst = json.load(open(INST, encoding='utf8'))
    meta = {a['webSiteURL'].rsplit('/', 1)[1]: a for a in inst['installedAddons']}
    gen = {}
    gpath = os.path.join(OUT, 'data', 'generated.js')
    if ONLY and os.path.exists(gpath):
        t = open(gpath, encoding='utf8').read()
        gen = json.loads(t[t.index('=') + 1:].rstrip().rstrip(';'))
    for slug, prefix in JARS.items():
        if ONLY and slug not in ONLY:
            continue
        jar = [j for j in glob.glob(os.path.join(MODS, '*.jar')) if os.path.basename(j).startswith(prefix)][0]
        z = zipfile.ZipFile(jar)
        names = z.namelist()
        toml = z.read('META-INF/mods.toml').decode('utf8', 'replace')
        modid = re.search(r'modId\s*=\s*"([^"]+)"', toml).group(1)
        version = re.search(r'^version\s*=\s*"([^"]+)"', toml, re.M)
        deps = re.findall(r'\[\[dependencies\.[^\]]+\]\][^\[]*?modId\s*=\s*"([^"]+)"[^\[]*?mandatory\s*=\s*(true|false)', toml, re.S)
        en_f = [n for n in names if n.endswith(f'assets/{modid}/lang/en_us.json')]
        tr_f = [n for n in names if n.endswith(f'assets/{modid}/lang/tr_tr.json')]
        en = load_json(z, en_f[0]) if en_f else {}
        tr = {k: fix(v) for k, v in (load_json(z, tr_f[0]) if tr_f else {}).items()}
        langs = sorted({re.search(r'lang/([a-z_]+)\.json$', n).group(1) for n in names if re.search(rf'assets/{modid}/lang/[a-z_]+\.json$', n)})

        # ---- sprites ----
        cands = []
        for kind in ('item', 'block'):
            for n in sorted(names):
                m = re.match(rf'assets/{modid}/textures/{kind}/([a-z0-9_/]+)\.png$', n)
                if not m:
                    continue
                key = m.group(1).split('/')[-1]
                lk = f'{kind}.{modid}.{key}'
                if lk not in en and kind == 'item':
                    lk2 = f'block.{modid}.{key}'
                    lk = lk2 if lk2 in en else lk
                if lk not in en and kind == 'block':
                    parts = key.split('_')
                    while len(parts) > 1 and f'block.{modid}.' + '_'.join(parts) not in en:
                        parts = parts[:-1]
                    lk = f'block.{modid}.' + '_'.join(parts)
                if lk not in en:
                    continue
                pri = 0 if 'front' in key and not key.endswith('_on') else 1 if key.endswith('top') else 2 if 'side' in key else 3
                cands.append((kind, n, lk, pri))
        cands.sort(key=lambda c: (c[0] != 'item', c[3]))
        items = [c for c in cands if c[0] == 'item']
        pool = items if len(items) >= 8 else cands
        seen, uniq = set(), []
        for c in pool:
            label = en[c[2]]
            if label in seen or 'Spawn Egg' in label:
                continue
            seen.add(label)
            uniq.append(c)
        if len(uniq) > MAX_ITEMS:  # even sample across the sorted list for variety
            step = len(uniq) / MAX_ITEMS
            uniq = [uniq[int(i * step)] for i in range(MAX_ITEMS)]
        sprites = []
        os.makedirs(os.path.join(OUT, 'img', slug), exist_ok=True)
        if uniq:
            rows = (len(uniq) + COLS - 1) // COLS
            atlas = Image.new('RGBA', (COLS * CELL, rows * CELL), (0, 0, 0, 0))
            for i, (kind, n, lk, _p) in enumerate(uniq):
                im = first_frame(Image.open(io.BytesIO(z.read(n))).convert('RGBA'))
                w, h = im.size
                if w <= CELL:
                    f = max(1, CELL // w)
                    im = im.resize((w * f, h * f), Image.NEAREST)
                    if im.size != (CELL, CELL):
                        im = im.resize((CELL, CELL), Image.NEAREST)
                else:
                    im = im.resize((CELL, CELL), Image.BOX)
                atlas.paste(im, ((i % COLS) * CELL, (i // COLS) * CELL))
                sprites.append({'en': en[lk], 'tr': tr.get(lk, en[lk]), 'k': kind})
            atlas.save(os.path.join(OUT, 'img', slug, 'items.png'), optimize=True)

        # ---- entities (names) ----
        ents = []
        for k, v in en.items():
            if k.startswith(f'entity.{modid}.') and k.count('.') == 2:
                ents.append({'en': v, 'tr': tr.get(k, v)})

        # ---- logo + gallery ----
        logo_src = sorted(glob.glob(os.path.join(HERE, 'dl', slug, 'logo.*')))[0]
        lim = Image.open(logo_src); lim.seek(0); lim = lim.convert('RGB')
        lim.thumbnail((400, 400))
        lim.save(os.path.join(OUT, 'img', slug, 'logo.webp'), 'WEBP', quality=86, method=6)
        small = lim.copy(); small.thumbnail((160, 160))
        small.save(os.path.join(OUT, 'img', slug, 'logo-s.webp'), 'WEBP', quality=84, method=6)
        accent = accent_of(logo_src)
        gallery = []
        for gi, g in enumerate(sorted(glob.glob(os.path.join(HERE, 'dl', slug, 'g*')))):
            base = os.path.basename(g)
            keep = GALLERY_KEEP.get(slug)
            if keep is None or not any(k in base for k in keep):
                continue
            im = Image.open(g).convert('RGB')
            w, h = im.size
            name = f'g{len(gallery) + 1:02d}'
            big = im.copy(); big.thumbnail((1600, 1600)); big.save(os.path.join(OUT, 'img', slug, name + '.webp'), 'WEBP', quality=82, method=6)
            th = im.copy(); th.thumbnail((560, 560)); th.save(os.path.join(OUT, 'img', slug, name + '-t.webp'), 'WEBP', quality=78, method=6)
            gallery.append({'f': name, 'w': big.size[0], 'h': big.size[1], 'src': base})

        def group(pref, depth=3):
            return [{'id': k.split('.')[-1], 'en': v, 'tr': tr.get(k, v)} for k, v in en.items()
                    if k.startswith(pref) and k.count('.') == depth - 1]
        extra = {
            'structures': group(f'structure.{modid}.'),
            'variants': group(f'variant.{modid}.'),
            'spells': group(f'spell.{modid}.'),
            'elements': group(f'element.{modid}.'),
            'effects': group(f'effect.{modid}.'),
            'advancements': [x for x in group(f'advancements.{modid}.', 4) if x['id'] == 'title'],
            'towers': group('towers.tower.'),
            'tabs': group(f'itemGroup.{modid}.'),
        }
        extra = {k: v for k, v in extra.items() if v}
        a = meta[slug]
        f = a['installedFile']
        gen[slug] = {
            'name': a['name'], 'modid': modid, 'version': version.group(1) if version else '',
            'file': f['fileName'], 'fileDate': f['fileDate'][:10], 'mc': '1.20.1', 'loader': 'Forge',
            'url': a['webSiteURL'], 'projectId': a['addonID'],
            'deps': [d for d, mand in deps if mand == 'true' and d not in ('forge', 'minecraft')],
            'langs': langs, 'accent': accent, 'lists': extra, 'sprites': sprites, 'entities': ents, 'gallery': gallery,
            'counts': {'itemTextures': len([n for n in names if re.search(rf'assets/{modid}/textures/item/.*\.png$', n)]),
                       'blockTextures': len([n for n in names if re.search(rf'assets/{modid}/textures/block/.*\.png$', n)]),
                       'entityTextures': len([n for n in names if re.search(rf'assets/{modid}/textures/entity/.*\.png$', n)]),
                       'langKeys': len(en)},
        }
        print(slug, modid, 'sprites', len(sprites), 'ents', len(ents), 'gal', len(gallery), accent, langs[:4], len(langs))
    os.makedirs(os.path.join(OUT, 'data'), exist_ok=True)
    with open(os.path.join(OUT, 'data', 'generated.js'), 'w', encoding='utf8', newline='\n') as fh:
        fh.write('/* Otomatik üretildi: mod jar dosyalarındaki dil ve doku verisinden. Elle düzenleme. */\n')
        fh.write('window.BB_GEN=' + json.dumps(gen, ensure_ascii=False, separators=(',', ':')) + ';\n')


if __name__ == '__main__':
    main()
