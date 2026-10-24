"""6 yeni Jelly sayfası için görselleri oyunların kendi çizimlerinden hazırlar:
  <slug>/img/logo.webp, hero.webp, icon.png, og.jpg, banner.webp, shot-1..5.webp
  <slug>/img/s/<ad>.webp   (oyuna özgü çizimler 192 px, ortak arayüz çizimleri)
Kaynak: C:\\Users\\user\\Desktop\\Puzzles. Bir çizim değişirse bu betik yeniden çalıştırılır."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUZ = r'C:\Users\user\Desktop\Puzzles'

COMMON = ['ui_star_full', 'ui_star_empty', 'ui_gem', 'ui_boss_badge', 'ic_limit_moves', 'ic_limit_time', 'item_hint', 'fx_star', 'fx_heart',
          'gift_closed', 'gift_open', 'ui_icon_hint', 'ui_icon_undo', 'ui_icon_reset']

GAMES = {
    'jellyjars': dict(app='jelly_jars', prefix=['jars_', 'tw_jars_'], logo='logo_jars', hero='jars_mascot_idle',
                      shots=['01_home', '02_map', '03_play_start', '04_play_select', '05_result']),
    'jellylogic': dict(app='jelly_logic', prefix=['logic_'], logo='logo_logic', hero='logic_owl_idle',
                       shots=['01_home', '02_map', '03_play_binary', '04_play_tower', '05_result']),
    'jelly' + 'loops': dict(app='jelly_loops', prefix=['loops_'], logo='logo_loops', hero='loops_hero_idle',
                            shots=['01_R_home', '02_R_map', '03_R_play_line', '04_R_play_bridge', '05_R_result']),
    'jellypark': dict(app='jelly_park', prefix=['park_'], logo='logo_park', hero='home_hero_park',
                      shots=['01_home', '02_play', '03_map', '04_cones', '05_result']),
    'jellyseek': dict(app='jelly_seek', prefix=['seek_', 'tw_seek_'], logo='logo_seek', hero='seek_hero_idle', shots=['1', '2', '3', '4', '5']),
    'jellyslide': dict(app='jelly_slide', prefix=['slide_', 'fx_'], logo='logo_slide', hero='slide_penguin_idle',
                       shots=['bg_world01', 'bg_world10', 'bg_world20', 'bg_world30', 'bg_world45']),
}


def shrink(im, w):
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    return im


def find(d, name):
    for ext in ('.png', '.webp'):
        p = os.path.join(d, name + ext)
        if os.path.exists(p):
            return p
    return None


for slug, g in GAMES.items():
    art = os.path.join(PUZ, 'apps', g['app'], 'assets', 'art')
    store = os.path.join(PUZ, 'store', g['app'])
    out = os.path.join(ROOT, slug, 'img')
    os.makedirs(os.path.join(out, 's'), exist_ok=True)
    im = shrink(Image.open(find(art, g['logo'])).convert('RGBA'), 720)
    im.save(os.path.join(out, 'logo.webp'), 'WEBP', quality=90, method=6)
    im = shrink(Image.open(find(art, g['hero'])).convert('RGBA'), 640)
    im.save(os.path.join(out, 'hero.webp'), 'WEBP', quality=90, method=6)
    names = []
    for f in sorted(os.listdir(art)):
        stem, ext = os.path.splitext(f)
        if ext.lower() not in ('.png', '.webp'):
            continue
        if any(stem.startswith(p) for p in g['prefix']) or stem in COMMON:
            names.append(stem)
    for name in names:
        im = shrink(Image.open(find(art, name)).convert('RGBA'), 256 if name.startswith('tw_') else 192)
        im.save(os.path.join(out, 's', name + '.webp'), 'WEBP', quality=88, method=6)
    icon = Image.open(os.path.join(store, 'app_icon_512.png')).convert('RGBA')
    icon.save(os.path.join(out, 'icon.png'), optimize=True)
    fg = Image.open(os.path.join(store, 'feature_graphic_title.png')).convert('RGB')
    w, h = fg.size
    cw = int(h * 1200 / 630)
    left = max(0, (w - cw) // 2)
    fg.crop((left, 0, left + min(cw, w), h)).resize((1200, 630), Image.LANCZOS).save(os.path.join(out, 'og.jpg'), quality=88, optimize=True)
    fg.resize((1024, 500), Image.LANCZOS).save(os.path.join(out, 'banner.webp'), 'WEBP', quality=84, method=6)
    for i, name in enumerate(g['shots'], 1):
        if slug == 'jellyslide':
            src = Image.open(find(art, name)).convert('RGB')
        else:
            src = Image.open(os.path.join(store, 'screenshots', 'phone', name + '.png')).convert('RGB')
        sw, sh = src.size
        tw = int(sh * 9 / 16)
        if sw > tw:  # 9:16'ya ortadan kırp
            l = (sw - tw) // 2
            src = src.crop((l, 0, l + tw, sh))
        src.resize((540, 960), Image.LANCZOS).save(os.path.join(out, 'shot-%d.webp' % i), 'WEBP', quality=82, method=6)
    tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs)
    print(slug, len(names), 'sprites', round(tot / 1024), 'KB')
