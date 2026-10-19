"""Jelly sayfaları için görselleri hazırlar (oyunların kendi çizimlerinden):
  <slug>/img/logo.webp       oyun logosu (şeffaf)
  <slug>/img/s/<ad>.webp     mekanik / karakter çizimleri (şeffaf, 192 px)
  <slug>/img/icon.png, og.jpg, banner.webp, shot-N.webp   (mağaza dosyalarından)
Kaynak: C:\\Users\\user\\Desktop\\Puzzles. Bir çizim değişirse bu betik yeniden çalıştırılır."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUZ = r'C:\Users\user\Desktop\Puzzles'

GAMES = {
    'jellytrails': {
        'app': 'jelly_trails', 'store': 'jelly_trails', 'logo': 'logo_trails.png',
        'shots': ['01_R_home', '02_R_map2', '03_R_play24', '04_R_play30', '05_R_res30'],
        'sprites': ['flow_node_%d_idle' % i for i in range(8)] + ['flow_node_%d_done' % i for i in range(8)] + [
            'flow_fence', 'flow_turncap_badge', 'flow_gate_0', 'flow_gate_1', 'flow_gate_2', 'flow_door_closed', 'flow_door_open',
            'flow_key_badge', 'flow_bridge', 'flow_wanderer_idle', 'flow_wanderer_hop', 'flow_multi_triple_idle', 'flow_multi_quad_idle',
            'flow_triple_idle', 'flow_quad_idle', 'flow_stone', 'flow_straight', 'flow_turn', 'flow_portal_0', 'flow_portal_1', 'flow_portal_2',
            'ui_star_full', 'ui_star_empty', 'ui_gem', 'item_hint', 'ui_boss_badge', 'fx_star', 'fx_heart', 'gift_closed', 'gift_open',
            'ui_icon_hint', 'ic_timer', 'ic_limit_moves', 'ic_limit_time'],
    },
    'jellypipes': {
        'app': 'jelly_pipes', 'store': 'jelly_pipes', 'logo': 'logo_pipes.png',
        'shots': ['01_Q_home', '02_Q_map3', '03_Q_play21', '04_Q_play30', '05_Q_res30'],
        'sprites': ['pipe_source', 'pipe_source_1', 'pipe_source_2', 'pipe_flower_bud', 'pipe_flower_open', 'pipe_flower_bud_c0',
                    'pipe_flower_open_c0', 'pipe_flower_bud_c1', 'pipe_flower_open_c1', 'pipe_flower_bud_c2', 'pipe_flower_open_c2',
                    'pipe_flower_bud_dual', 'pipe_flower_open_dual', 'pipe_lock', 'pipe_frozen_cross', 'pipe_frozen_elbow', 'pipe_ice',
                    'pipe_heat_badge_0', 'pipe_valve', 'pipe_pump_active', 'pipe_pump_idle', 'pipe_cactus', 'pipe_cactus_wet', 'pipe_wheel',
                    'pipe_swap_badge', 'pipe_link_badge', 'pipe_worn_0', 'pipe_worn_3', 'pipe_bridge_badge', 'flow_stone',
                    'flow_portal_0', 'flow_portal_1', 'flow_portal_2', 'fx_bubble', 'fx_drop', 'fx_petal_0', 'fx_petal_1', 'fx_petal_2',
                    'ui_star_full', 'ui_star_empty', 'ui_gem', 'item_hint', 'ui_boss_badge', 'gift_closed', 'gift_open',
                    'ic_limit_moves', 'ic_limit_time'],
    },
}


def shrink(im, w):
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    return im


for slug, g in GAMES.items():
    art = os.path.join(PUZ, 'apps', g['app'], 'assets', 'art')
    store = os.path.join(PUZ, 'store', g['store'])
    out = os.path.join(ROOT, slug, 'img')
    for d in ('s',):
        os.makedirs(os.path.join(out, d), exist_ok=True)
    # logo
    im = shrink(Image.open(os.path.join(art, g['logo'])).convert('RGBA'), 720)
    im.save(os.path.join(out, 'logo.webp'), 'WEBP', quality=90, method=6)
    # çizimler
    for name in g['sprites']:
        p = os.path.join(art, name + '.png')
        if not os.path.exists(p):
            print('YOK', slug, name)
            continue
        im = shrink(Image.open(p).convert('RGBA'), 192)
        im.save(os.path.join(out, 's', name + '.webp'), 'WEBP', quality=88, method=6)
    # mağaza dosyaları
    icon = Image.open(os.path.join(store, 'app_icon_512.png')).convert('RGBA')
    icon.save(os.path.join(out, 'icon.png'), optimize=True)
    fg = Image.open(os.path.join(store, 'feature_graphic_title.png')).convert('RGB')
    w, h = fg.size
    cw = int(h * 1200 / 630)
    left = max(0, (w - cw) // 2)
    fg.crop((left, 0, left + min(cw, w), h)).resize((1200, 630), Image.LANCZOS).save(os.path.join(out, 'og.jpg'), quality=88, optimize=True)
    fg.resize((1024, 500), Image.LANCZOS).save(os.path.join(out, 'banner.webp'), 'WEBP', quality=84, method=6)
    for i, name in enumerate(g['shots'], 1):
        im = Image.open(os.path.join(store, 'screenshots', 'phone', name + '.png')).convert('RGB').resize((540, 960), Image.LANCZOS)
        im.save(os.path.join(out, 'shot-%d.webp' % i), 'WEBP', quality=82, method=6)
    tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs)
    print(slug, 'ok', round(tot / 1024), 'KB')
