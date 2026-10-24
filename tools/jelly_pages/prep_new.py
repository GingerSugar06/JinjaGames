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


def slide_scene(art, bgname, n, out):
    """Slide'ın mağaza ekran görüntüsü yok: oyunun kendi çizimlerinden (dünya arka planı, buz karoları, kayalar, penguenler...) 9:16 sahne."""
    W, H = 1080, 1920
    bg = Image.open(find(art, bgname)).convert('RGB')
    s = max(W / bg.width, H / bg.height)
    bg = bg.resize((round(bg.width * s), round(bg.height * s)), Image.LANCZOS)
    bg = bg.crop(((bg.width - W) // 2, 0, (bg.width - W) // 2 + W, H))
    im = bg.convert('RGBA')

    def spr(name, size):
        a = Image.open(find(art, name)).convert('RGBA')
        return a.resize((size, size), Image.LANCZOS)
    N = 5 if n != 4 else 6
    T = 164 if N == 5 else 138
    bx, by = (W - N * T) // 2, 640
    # tahta zemini
    pad = 26
    from PIL import ImageDraw, ImageFilter
    panel = Image.new('RGBA', (N * T + pad * 2, N * T + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(panel)
    d.rounded_rectangle([0, 0, panel.width - 1, panel.height - 1], radius=64, fill=(235, 245, 255, 190), outline=(255, 255, 255, 230), width=6)
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
    sh.paste(Image.new('RGBA', panel.size, (40, 70, 140, 90)), (bx - pad, by - pad + 18))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(22)))
    im.alpha_composite(panel, (bx - pad, by - pad))
    for r in range(N):
        for c in range(N):
            im.alpha_composite(spr('slide_ice_a' if (r + c) % 2 == 0 else 'slide_ice_b', T), (bx + c * T, by + r * T))
    layouts = {
        1: dict(rocks=[(0, 1), (1, 3), (2, 0), (3, 4), (4, 2)], exit=(0, 4), pen=(4, 0), extra=[]),
        2: dict(rocks=[(1, 1), (3, 3)], exit=(0, 0), pen=(4, 4), extra=[('slide_snow', (1, 3)), ('slide_snow', (3, 1)), ('slide_fish_0', (2, 2)), ('slide_fish_1', (0, 3))]),
        3: dict(rocks=[(0, 2), (2, 1), (3, 3), (4, 0)], exit=(0, 0), pen=(4, 4), extra=[('slide_warp_0', (1, 4)), ('slide_warp_0', (3, 0))]),
        4: dict(rocks=[(1, 2), (3, 4), (5, 1), (4, 0)], exit=(0, 5), pen=(5, 5), extra=[('slide_seal_idle', (2, 3)), ('slide_arrow', (4, 2)), ('slide_bumper_idle', (1, 5))]),
        5: dict(rocks=[(1, 2), (3, 1), (2, 4)], exit=(0, 0), pen=(4, 4), extra=[('slide_key', (4, 1)), ('slide_gate_closed', (1, 0)), ('slide_btn_1', (3, 3)), ('slide_twin_idle', (0, 4))]),
    }
    L = layouts[n]
    k = 0
    for (r, c) in L['rocks']:
        im.alpha_composite(spr('slide_rock_%d' % (k % 3), T), (bx + c * T, by + r * T))
        k += 1
    er, ec = L['exit']
    im.alpha_composite(spr('slide_exit_open', T), (bx + ec * T, by + er * T))
    for name, (r, c) in L['extra']:
        im.alpha_composite(spr(name, T), (bx + c * T, by + r * T))
    pr, pc = L['pen']
    im.alpha_composite(spr('slide_penguin_idle', T + 10), (bx + pc * T - 5, by + pr * T - 10))
    # üstte mutlu penguen ve üç yıldız
    im.alpha_composite(spr('slide_penguin_happy', 330), ((W - 330) // 2, 170))
    for i in range(3):
        im.alpha_composite(spr('ui_star_full', 130), (W // 2 - 195 + i * 130, 490))
    im.convert('RGB').resize((540, 960), Image.LANCZOS).save(os.path.join(out, 'shot-%d.webp' % n), 'WEBP', quality=84, method=6)


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
        im = shrink(Image.open(find(art, name)).convert('RGBA'), 512 if name.endswith('_board_frame') else 256 if name.startswith('tw_') else 192)
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
            slide_scene(art, name, i, out)
            continue
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
