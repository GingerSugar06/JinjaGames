"""6 yeni Jelly oyun sayfasını üretir (jellyjars, jellylogic, jellyloops, jellypark, jellyseek, jellyslide):
   <slug>/index.html  ->  https://jinjagames.com/<slug>/

Sırayla: extract_new.py (oyun metinleri), prep_new.py (görseller), gen_new_puzzles.py (demo bulmacaları; bir kez),
build_new.py. Ortak iskelet game.html + base.css/base.js; her oyunun kendine özgü CSS, hero sahnesi, oynanabilir demo
ve betiği g_<slug>.txt içinde ('@@@ ADI' ile ayrılmış bölümler). Sayfaları elle değil bu betiklerle değiştir.
Google Play bağlantısı yayına çıkınca PLAY_URL'ye yazılıp betik çalıştırılır."""
import json
import os
import re

import build as B  # ortak HEAD / NAV / FOOT / CTA (build.py artık yalnız doğrudan çalıştırılınca sayfa üretir)

HERE = B.HERE
ROOT = B.ROOT

PLAY_URL = {s: '' for s in ('jellyjars', 'jellylogic', 'jellyloops', 'jellypark', 'jellyseek', 'jellyslide')}

FAMILY = [
    ('jellytrails', 'Jelly Trails', 'Color connect', 'Renk bağlama'),
    ('jellypipes', 'Jelly Pipes', 'Water pipes', 'Su boruları'),
    ('jellyjars', 'Jelly Jars', 'Sort puzzle', 'Ayırma bulmacası'),
    ('jellylogic', 'Jelly Logic', 'Sudoku', 'Sudoku'),
    ('jellyloops', 'Jelly Loops', 'Thread puzzle', 'İp bulmacası'),
    ('jellypark', 'Jelly Park', 'Car jam', 'Araba trafiği'),
    ('jellyseek', 'Jelly Seek', 'Hidden sweets', 'Gizli şekerler'),
    ('jellyslide', 'Jelly Slide', 'Ice puzzle', 'Buz bulmacası'),
]


def theme(light, dark):
    def block(t):
        return ('--bg:%(bg)s; --bg-soft:%(soft)s; --surface:%(surface)s; --ink:%(ink)s; --ink-2:%(ink2)s; --ink-3:%(ink3)s;\n'
                '  --line:%(line)s; --line-2:%(line2)s;\n'
                '  --accent:%(accent)s; --accent-2:%(accent2)s; --accent-rgb:%(argb)s; --on-accent:%(on)s;\n'
                '  --pop:%(pop)s; --pop-rgb:%(prgb)s;\n'
                '  --nav-bg:rgba(%(bgrgb)s,.78); --nav-bg-solid:rgba(%(bgrgb)s,.97);\n'
                '  --sky1:%(sky1)s; --sky2:%(sky2)s; --sky3:%(sky3)s;') % t
    return (':root{\n  ' + block(light) + '\n  --shadow-1:0 2px 4px rgba(40,30,30,.04),0 14px 34px rgba(%(argb)s,.12);\n  --shadow-2:0 26px 64px rgba(%(argb)s,.22);\n'
            % light + '  --W:1180px; --ease:cubic-bezier(.22,1,.36,1); --navh:74px; --r:28px;\n'
            "  --f-body:'Nunito',-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;\n"
            "  --f-display:'Fraunces',Georgia,'Times New Roman',serif;\n}\n"
            'html[data-theme="dark"]{\n  color-scheme:dark;\n  ' + block(dark) + '\n  --shadow-1:0 2px 4px rgba(0,0,0,.3),0 14px 34px rgba(0,0,0,.34);\n  --shadow-2:0 26px 64px rgba(0,0,0,.55);\n}')


GAMES = {}

GAMES['jellyjars'] = dict(
    name='Jelly Jars', app='jelly_jars', ext='Sort puzzle', pkg='com.jinjagames.jellyjars',
    light=dict(bg='#FFF8EE', soft='#FFEEDB', surface='#FFFFFF', ink='#3A2412', ink2='#6B4B33', ink3='#7A5A42', line='#F3DFC6', line2='#E6C9A2',
               accent='#B8470A', accent2='#D4590F', argb='184,71,10', on='#FFFFFF', pop='#FF5C8A', prgb='255,92,138', bgrgb='255,248,238',
               sky1='#FFE3B0', sky2='#FFDCCB', sky3='#FFF1E4'),
    dark=dict(bg='#1E140D', soft='#271A10', surface='#2F2015', ink='#FFF3E4', ink2='#E3CBB0', ink3='#B99E83', line='#402C1B', line2='#55391F',
              accent='#FFB45E', accent2='#FFC983', argb='255,180,94', on='#2A1606', pop='#FF8FB0', prgb='255,143,176', bgrgb='30,20,13',
              sky1='#3A2312', sky2='#43261A', sky3='#2A1A12'),
    title='Jelly Jars: Sort Puzzle | Cozy Jelly Sorting Game for Android | JinjaGames',
    desc='Jelly Jars is a relaxing sorting puzzle for Android. Pour glossy jelly layers between glass jars until every jar is one colour. 500 handcrafted levels across 50 sweet worlds. Free, in six languages.',
    og_title='Jelly Jars: Ayırma Bulmacası | JinjaGames',
    og_desc='Jöle katmanlarını kavanozlar arasında dök, her kavanoz tek renk olsun. 500 bölüm, 50 dünya. Android için ücretsiz bulmaca.',
    ld_desc='A relaxing sorting puzzle: pour glossy jelly layers between glass jars until every jar holds a single colour. 500 handcrafted levels in 50 worlds.',
    claim=('Pour. Sort. Smile!', 'Dök. Ayır. Gülümse!'),
    lead=('A relaxing sorting puzzle. Tap a jar, tap where to pour: the jar tips over, a ribbon of glossy jelly flows in and the layers stack up. Sort them until every jar holds just one colour.',
          'Rahatlatıcı bir ayırma bulmacası. Bir kavanoza dokun, nereye dökeceğine dokun: kavanoz yatar, parlak bir jöle şeridi akar ve katmanlar üst üste dizilir. Her kavanoz tek renk olana kadar ayır.'),
    twist_h=('Four twists, <span class="hl">one at a time.</span>', 'Dört sürpriz, <span class="hl">tek tek gelir.</span>'),
    lab=[('hidden', 'tw_jars_hidden', 21, None), ('cap', 'tw_jars_cap', 61, None), ('lock', 'tw_jars_lock', 101, None), ('mix', 'tw_jars_mix', 141, None)],
    calm=['jars_layer_3', 'jars_layer_6', 'jars_layer_8'],
    win_img='jars_mascot_win', win=('Jars sorted!', 'Kavanozlar tamam!', 'Every jar holds a single colour.', 'Her kavanoz tek renk oldu.'),
    shots_alt=['Home screen', 'World map', 'A level just started', 'Picking up a jar', 'Level complete'],
    gal=('From the game', 'Oyundan'),
    cta=('Almost on Google Play.', 'Neredeyse Google Play\'de.',
         'Jelly Jars is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new twist? Write to us.',
         'Jelly Jars\'ın Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir sürpriz için fikrin varsa bize yaz.'),
    puzzles='jars',
)

GAMES['jellylogic'] = dict(
    name='Jelly Logic', app='jelly_logic', ext='Sudoku', pkg='com.jinjagames.jellylogic',
    light=dict(bg='#F8F5FF', soft='#EEE8FF', surface='#FFFFFF', ink='#241E4A', ink2='#554D80', ink3='#675F92', line='#E6DEFA', line2='#D2C6F2',
               accent='#5A47C9', accent2='#7260DB', argb='90,71,201', on='#FFFFFF', pop='#FFB020', prgb='255,176,32', bgrgb='248,245,255',
               sky1='#DDD8FF', sky2='#F1E6FF', sky3='#FFF1D2'),
    dark=dict(bg='#14122A', soft='#1B1836', surface='#231F42', ink='#F1EEFF', ink2='#CBC5EC', ink3='#A29BCB', line='#2F2A58', line2='#3F3875',
              accent='#A9A2FF', accent2='#C2BDFF', argb='169,162,255', on='#181433', pop='#FFC857', prgb='255,200,87', bgrgb='20,18,42',
              sky1='#24204A', sky2='#2D2358', sky3='#2B1F3C'),
    title='Jelly Logic: Sudoku Puzzles | Cozy Sudoku with a Wise Owl for Android | JinjaGames',
    desc='Jelly Logic is a calm, cozy sudoku game for Android starring a wise jelly owl. Cages, diagonals, odd-even and jigsaw twists, 500 handcrafted levels from 4x4 to 9x9. Free, in six languages.',
    og_title='Jelly Logic: Sudoku Bulmacaları | JinjaGames',
    og_desc='Bilge bir jöle baykuşla sakin sudoku: kafesler, çaprazlar, tek-çift ve yapboz bölgeleri. 500 bölüm. Android için ücretsiz.',
    ld_desc='A calm, cozy sudoku starring a wise jelly owl. Every level is a real sudoku with exactly one solution, growing from 4x4 to 9x9 with fresh twists. 500 handcrafted levels in 50 worlds.',
    claim=('Think. Solve. Smile.', 'Düşün. Çöz. Gülümse.'),
    lead=('Every board is a real sudoku with exactly one solution, growing from tiny 4x4 to full 9x9, and every level adds its own twist. No guessing, no rush, just the quiet joy of working it out.',
          'Her tahta tek çözümlü gerçek bir sudoku; minik 4x4\'ten tam 9x9\'a büyür ve her bölüm kendi sürprizini ekler. Tahmin yok, acele yok; yalnızca çözmenin sessiz keyfi.'),
    twist_h=('Six rules, <span class="hl">one at a time.</span>', 'Altı kural, <span class="hl">tek tek gelir.</span>'),
    lab=[('sudoku', 'logic_cell_given', 1, 'sudoku'), ('compare', 'tw_logic_compare', 11, 'compare'), ('parity', 'tw_logic_parity', 31, 'parity'),
         ('diag', 'tw_logic_diag', 61, 'diag'), ('cage', 'tw_logic_cage', 101, 'cage'), ('jigsaw', 'tw_logic_jigsaw', 151, 'jigsaw')],
    calm=['logic_owl_think', 'logic_owl_idle', 'logic_owl_wink'],
    win_img='logic_owl_win', win=('Solved!', 'Çözüldü!', 'Every number found its place.', 'Her sayı yerini buldu.'),
    shots_alt=['Home screen', 'World map', 'A sudoku level', 'A bigger sudoku level', 'Level complete'],
    gal=('From the game', 'Oyundan'),
    cta=('Almost on Google Play.', 'Neredeyse Google Play\'de.',
         'Jelly Logic is in release preparation for Google Play. Want to know the day it lands, or have a rule you would love to see? Write to us.',
         'Jelly Logic\'in Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da görmek istediğin bir kural için bize yaz.'),
    puzzles='logic',
)

GAMES['jellyloops'] = dict(
    name='Jelly Loops', app='jelly_loops', ext='Thread puzzle', pkg='com.jinjagames.jellyloops',
    light=dict(bg='#FFF5F9', soft='#FFE6F0', surface='#FFFFFF', ink='#3E1830', ink2='#6E4560', ink3='#7E5572', line='#FAD9E8', line2='#F0BED5',
               accent='#C2306F', accent2='#D8478A', argb='194,48,111', on='#FFFFFF', pop='#FFC24A', prgb='255,194,74', bgrgb='255,245,249',
               sky1='#FFD3E6', sky2='#FFE6F1', sky3='#FFF4DC'),
    dark=dict(bg='#1F0F19', soft='#2A1421', surface='#341A29', ink='#FFEFF6', ink2='#E9C7D9', ink3='#BE98AE', line='#4A2438', line2='#5F2F49',
              accent='#FF8FBF', accent2='#FFAAD0', argb='255,143,191', on='#3A0E24', pop='#FFD27A', prgb='255,210,122', bgrgb='31,15,25',
              sky1='#3A1730', sky2='#43183A', sky3='#35172B'),
    title='Jelly Loops: Thread Puzzle | Cozy Loop Puzzles for Android | JinjaGames',
    desc='Jelly Loops is a calm line-puzzle game for Android starring a chubby jelly thread spool. Draw one glossy thread loop that fits every number. 500 handcrafted levels. Free, in six languages.',
    og_title='Jelly Loops: İp Bulmacası | JinjaGames',
    og_desc='İpi çek, halkayı kapat. İncilerle, düğümlerle, deliklerle tek çözümlü sakin halka bulmacaları, 500 bölüm. Android için ücretsiz.',
    ld_desc='A calm loop puzzle: draw a single glossy thread loop that fits every number, with pearls, knots, holes and stitches along the way. 500 handcrafted levels in 50 worlds, every puzzle with exactly one solution.',
    claim=('Pull the thread. Close the loop.', 'İpi çek. Halkayı kapat.'),
    lead=('Draw a single glossy loop of thread between the dots. The numbers tell how many threads touch each square, and the loop must close without crossing itself. Every puzzle has exactly one solution.',
          'Noktalar arasında tek bir parlak ip halkası çiz. Sayılar her karenin kaç ipe değdiğini söyler; halka kendini kesmeden kapanmalı. Her bulmacanın tek bir çözümü var.'),
    twist_h=('Six twists, <span class="hl">one at a time.</span>', 'Altı sürpriz, <span class="hl">tek tek gelir.</span>'),
    lab=[('pearl', 'tw_loops_pearl', 21, None), ('wall', 'tw_loops_wall', 61, None), ('stitch', 'tw_loops_stitch', 101, None),
         ('knot', 'tw_loops_knot', 141, None), ('hole', 'tw_loops_hole', 181, None), ('parity', 'tw_loops_parity', 221, None)],
    calm=['loops_hero_idle', 'loops_hero_happy', 'loops_hero_win'],
    win_img='loops_hero_win', win=('Loop closed!', 'Halka kapandı!', 'Every number is happy.', 'Her sayı yerini buldu.'),
    shots_alt=['Home screen', 'World map', 'A loop puzzle', 'Level complete'],
    gal=('From the game', 'Oyundan'),
    cta=('Almost on Google Play.', 'Neredeyse Google Play\'de.',
         'Jelly Loops is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new twist? Write to us.',
         'Jelly Loops\'un Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir sürpriz için fikrin varsa bize yaz.'),
    puzzles='loops',
)

GAMES['jellypark'] = dict(
    name='Jelly Park', app='jelly_park', ext='Car jam', pkg='com.jinjagames.jellypark',
    light=dict(bg='#FFFBEF', soft='#FFF0C9', surface='#FFFFFF', ink='#3A2A10', ink2='#6A5230', ink3='#7A6240', line='#F6E6B8', line2='#EBD28C',
               accent='#D1342F', accent2='#E04A44', argb='209,52,47', on='#FFFFFF', pop='#2FA8E6', prgb='47,168,230', bgrgb='255,251,239',
               sky1='#BFE6FF', sky2='#FFF0BF', sky3='#FFE3DC'),
    dark=dict(bg='#1E1710', soft='#281E14', surface='#32261A', ink='#FFF4E2', ink2='#E6D2B0', ink3='#BCA784', line='#46351F', line2='#5C4727',
              accent='#FF8A7D', accent2='#FFA79C', argb='255,138,125', on='#3A0F0B', pop='#6CC4F2', prgb='108,196,242', bgrgb='30,23,16',
              sky1='#1F3042', sky2='#3A2E1A', sky3='#3A2320'),
    title='Jelly Park: Car Jam | Cute Parking Lot Puzzle for Android | JinjaGames',
    desc='Jelly Park is a cheerful car-jam puzzle for Android. Tap the squishy jelly cars to honk and drive them out of the packed parking lot. 500 handcrafted levels. Free, in six languages.',
    og_title='Jelly Park: Araba Trafiği | JinjaGames',
    og_desc='Sıkışmış jöle arabalara dokun, korna çalıp otoparktan çıksınlar. 500 bölüm, 50 dünya. Android için ücretsiz bulmaca.',
    ld_desc='A cheerful car-jam puzzle: tap a jelly car and, if its road is clear, it honks and drives out. Figure out the right order and get every car home. 500 handcrafted levels in 50 worlds.',
    claim=('Honk, roll and clear the lot!', 'Korna çal, yuvarlan, otoparkı boşalt!'),
    lead=('The parking lot is packed with squishy jelly cars. Tap a car and, if the road ahead is clear, it honks and drives out. A blocked car just bonks and wiggles. Find the right order and get every car home.',
          'Otopark ezilebilir jöle arabalarla dolu. Bir arabaya dokun; önü açıksa korna çalıp çıkar. Sıkışık araba yalnızca "bonk" der ve sallanır. Doğru sırayı bul, her arabayı eve gönder.'),
    twist_h=('Twelve twists, <span class="hl">one at a time.</span>', 'On iki sürpriz, <span class="hl">tek tek gelir.</span>'),
    lab=[('cones', 'park_cone_0', 21, None), ('bus', 'park_car3_orange', 61, None), ('number', 'park_num_badge', 101, 'number'), ('arrow', 'park_arrow', 141, None),
         ('gate', 'park_gate_blue', 181, None), ('sleep', 'park_sleep2', 221, None), ('bridge', 'park_bridge', 261, None), ('frozen', 'park_ice2', 301, None),
         ('traffic', 'park_truck', 341, None), ('honk', 'park_honk', 381, None), ('tow', 'park_tow', 421, None), ('round', 'park_round', 461, None)],
    calm=['park_car2_mint', 'park_car2_yellow', 'park_car2_pink'],
    win_img='park_car2_red', win=('Lot cleared!', 'Otopark boşaldı!', 'Every car is on its way home.', 'Her araba eve gidiyor.'),
    shots_alt=['Home screen', 'A level in progress', 'World map', 'Cones on the road', 'Level complete'],
    gal=('From the game', 'Oyundan'),
    cta=('Almost on Google Play.', 'Neredeyse Google Play\'de.',
         'Jelly Park is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new vehicle? Write to us.',
         'Jelly Park\'ın Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir araç için fikrin varsa bize yaz.'),
    puzzles='park',
)

GAMES['jellyseek'] = dict(
    name='Jelly Seek', app='jelly_seek', ext='Hidden sweets', pkg='com.jinjagames.jellyseek',
    light=dict(bg='#F4FFF6', soft='#E1F8E7', surface='#FFFFFF', ink='#12301F', ink2='#3F6350', ink3='#4F7360', line='#CFEFD8', line2='#A9DFBC',
               accent='#1A7F4F', accent2='#2A9A63', argb='26,127,79', on='#FFFFFF', pop='#FF6FA8', prgb='255,111,168', bgrgb='244,255,246',
               sky1='#C6F1D3', sky2='#E6FAD2', sky3='#FFF3D1'),
    dark=dict(bg='#0E1D14', soft='#13281B', surface='#193423', ink='#EAFFF1', ink2='#BCE3CB', ink3='#8FBBA0', line='#21412E', line2='#2C5640',
              accent='#6FE0A6', accent2='#93EBBE', argb='111,224,166', on='#0B2E1C', pop='#FF9CC2', prgb='255,156,194', bgrgb='14,29,20',
              sky1='#143A26', sky2='#1C3F22', sky3='#2A3A1E'),
    title='Jelly Seek: Hidden Sweets | Cozy Logic Puzzle for Android | JinjaGames',
    desc='Jelly Seek is a cosy logic puzzle for Android. Open tiles, follow the numbers and find every hidden sweet without waking a sour jelly. No guessing. 500 handcrafted levels. Free, in six languages.',
    og_title='Jelly Seek: Gizli Şekerler | JinjaGames',
    og_desc='Karoları aç, sayıları izle, her gizli şekeri bul. Tahmin yok, yalnızca mantık. 500 bölüm. Android için ücretsiz.',
    ld_desc='A cosy logic puzzle with a sweet twist: little jelly surprises hide under the tiles. Open a tile, read its number and work out which tiles are safe. Every level can be solved by logic alone. 500 handcrafted levels in 50 worlds.',
    claim=('Seek, deduce and smile!', 'Ara, çıkarım yap, gülümse!'),
    lead=('Little jelly surprises hide under the tiles of every board. Open a tile and its number tells you how many surprises lurk right next to it. Use the clues to find every sweet without waking a single sour jelly.',
          'Her tahtada karoların altında minik jöle sürprizler saklanır. Bir karoyu aç; sayısı yanında kaç sürpriz olduğunu söyler. İpuçlarıyla her şekeri bul, tek bir ekşi jöleyi bile uyandırma.'),
    twist_h=('Four twists, <span class="hl">one at a time.</span>', 'Dört sürpriz, <span class="hl">tek tek gelir.</span>'),
    lab=[('lantern', 'tw_seek_lantern', 21, None), ('camp', 'tw_seek_camp', 61, None), ('spyglass', 'tw_seek_spyglass', 101, None), ('scale', 'tw_seek_scale', 141, None)],
    calm=['seek_sweet_0', 'seek_sweet_1', 'seek_sweet_3'],
    win_img='seek_hero_win', win=('All sweets found!', 'Tüm şekerler bulundu!', 'Not a single sour jelly woke up.', 'Tek bir ekşi jöle bile uyanmadı.'),
    shots_alt=['Home screen', 'World map', 'A level in progress', 'A harder board', 'Level complete'],
    gal=('From the game', 'Oyundan'),
    cta=('Almost on Google Play.', 'Neredeyse Google Play\'de.',
         'Jelly Seek is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new clue? Write to us.',
         'Jelly Seek\'in Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir ipucu için fikrin varsa bize yaz.'),
    puzzles='seek',
)

GAMES['jellyslide'] = dict(
    name='Jelly Slide', app='jelly_slide', ext='Ice puzzle', pkg='com.jinjagames.jellyslide',
    light=dict(bg='#F3F8FF', soft='#E2EDFF', surface='#FFFFFF', ink='#172544', ink2='#46557A', ink3='#566589', line='#D5E3FA', line2='#B9CFF2',
               accent='#3560D8', accent2='#4C77EC', argb='53,96,216', on='#FFFFFF', pop='#FF7FB0', prgb='255,127,176', bgrgb='243,248,255',
               sky1='#C9E2FF', sky2='#E3E7FF', sky3='#F6E8FF'),
    dark=dict(bg='#0C1526', soft='#111D34', surface='#17253F', ink='#EDF3FF', ink2='#C0CDE8', ink3='#93A3C6', line='#233456', line2='#2F4570',
              accent='#9DB8FF', accent2='#B8CDFF', argb='157,184,255', on='#0E1B3A', pop='#FF9CC4', prgb='255,156,196', bgrgb='12,21,38',
              sky1='#142748', sky2='#1B2850', sky3='#2A2250'),
    title='Jelly Slide: Ice Puzzle | Cozy Sliding Penguin Game for Android | JinjaGames',
    desc='Jelly Slide is a cozy sliding puzzle for Android. Swipe a jelly penguin across the ice until it reaches the exit hole. 500 handcrafted levels across 50 frosty worlds. Free, in six languages.',
    og_title='Jelly Slide: Buz Bulmacası | JinjaGames',
    og_desc='Jöle penguenini buzun üstünde kaydır, çıkış deliğine ulaştır. 500 bölüm, 50 buzlu dünya. Android için ücretsiz bulmaca.',
    ld_desc='A cozy sliding puzzle: swipe a jelly penguin and it glides until something stops it. Plan your path and reach the glowing exit hole. 500 handcrafted levels in 50 frosty worlds.',
    claim=('Swipe, slide and bump!', 'Kaydır, süzül, çarp!'),
    lead=('Your jelly penguin glides in one direction until something stops it, so every swipe is a small decision. Plan your path, reach the glowing exit hole and watch your penguin cheer.',
          'Jöle penguenin bir şey durdurana kadar tek yöne kayar; yani her kaydırış küçük bir karar. Yolunu planla, parlayan çıkış deliğine ulaş ve penguenin sevincini izle.'),
    twist_h=('Twelve twists, <span class="hl">one at a time.</span>', 'On iki sürpriz, <span class="hl">tek tek gelir.</span>'),
    lab=[('snow', 'slide_snow', 21, None), ('fish', 'slide_fish_0', 61, None), ('crack', 'slide_crack_0', 101, None), ('warp', 'slide_warp_0', 141, None),
         ('bumper', 'slide_bumper_idle', 181, None), ('arrow', 'slide_arrow', 221, None), ('twin', 'slide_twin_idle', 261, None), ('key', 'slide_key', 301, None),
         ('seal', 'slide_seal_idle', 341, None), ('button', 'slide_btn_0', 381, None), ('gate', 'slide_gate_closed', 421, None), ('ball', 'slide_snowball', 461, None)],
    calm=['slide_penguin_idle', 'slide_penguin_happy', 'slide_twin_idle'],
    win_img='slide_penguin_happy', win=('Made it!', 'Başardın!', 'The penguin dives into the exit hole.', 'Pengüen çıkış deliğine daldı.'),
    shots_alt=['Rocks and an exit hole', 'Snow piles and fish', 'Warp holes', 'A seal, an arrow tile and a bumper', 'A key, a gate, a button and a twin penguin'],
    gal=('Scenes', 'Sahneler'),
    cta=('Almost on Google Play.', 'Neredeyse Google Play\'de.',
         'Jelly Slide is in release preparation for Google Play. Want to know the day it lands, or have an idea for a new twist? Write to us.',
         'Jelly Slide\'ın Google Play yayın hazırlığı sürüyor. Çıktığı günü öğrenmek ya da yeni bir sürpriz için fikrin varsa bize yaz.'),
    puzzles='slide',
)

GAMES['jellyslide']['win'] = ('Made it!', 'Başardın!', 'The penguin dives into the exit hole.', 'Penguen çıkış deliğine daldı.')


# ---- mini sanat parçaları (lab için) ----
def img(n, cls=''):
    return '<img%s src="img/s/%s.webp" alt="" width="192" height="192" loading="lazy">' % (' class="%s"' % cls if cls else '', n)


def minigrid(rows, cols, cells, cls='mg'):
    """cells: her hücre için (sprite, metin) ya da None; satır-sütun sırası."""
    out = '<div class="%s" style="--c:%d">' % (cls, cols)
    for c in cells:
        sp, tx = c
        out += '<span>%s%s</span>' % (img(sp), '<b>%s</b>' % tx if tx else '')
    return out + '</div>'


LAB_ART = {
    'logic': {
        'sudoku': minigrid(4, 4, [('logic_cell_given', '1'), ('logic_cell_normal', ''), ('logic_cell_normal', ''), ('logic_cell_given', '4'),
                                  ('logic_cell_normal', ''), ('logic_cell_given', '4'), ('logic_cell_given', '1'), ('logic_cell_normal', ''),
                                  ('logic_cell_normal', ''), ('logic_cell_given', '1'), ('logic_cell_normal', ''), ('logic_cell_normal', ''),
                                  ('logic_cell_given', '4'), ('logic_cell_normal', ''), ('logic_cell_normal', ''), ('logic_cell_given', '2')]),
        'compare': '<span class="art-row cmp">%s%s%s</span>' % (img('logic_cell_given') + '<b>2</b>', img('logic_cmp_left', 'cmpi'), img('logic_cell_normal') + '<b>?</b>'),
        'parity': '<span class="art-row par"><span class="sq"><b>3</b></span><span class="ci"><b>4</b></span></span>',
        'diag': minigrid(4, 4, [('logic_cell_selected' if r == c or r + c == 3 else 'logic_cell_normal', '') for r in range(4) for c in range(4)]),
        'cage': '<div class="mg cagebox" style="--c:3">' + ''.join('<span>%s%s</span>' % (img('logic_cell_hint' if (r, c) in ((0, 0), (0, 1), (1, 0)) else 'logic_cell_normal'),
                                                                                 '<i>9</i>' if (r, c) == (0, 0) else '') for r in range(3) for c in range(3)) + '</div>',
        'jigsaw': minigrid(4, 4, [(['logic_cell_given', 'logic_cell_hint', 'logic_cell_same', 'logic_cell_selected'][{(0, 0): 0, (0, 1): 0, (0, 2): 1, (0, 3): 1, (1, 0): 0, (1, 1): 2, (1, 2): 1, (1, 3): 1,
                                                                                                                      (2, 0): 2, (2, 1): 2, (2, 2): 3, (2, 3): 3, (3, 0): 2, (3, 1): 3, (3, 2): 3, (3, 3): 3}[(r, c)]], '')
                                  for r in range(4) for c in range(4)]),
    },
    'loops': {
        'pearl': '<span class="art-row">%s%s</span>' % (img('loops_pearl_white'), img('loops_pearl_black')),
        'bridge': '<span class="art-row">%s%s%s</span>' % (img('loops_island_ok'), '<img class="brg" src="img/s/loops_bridge_1.webp" alt="" loading="lazy">', img('loops_island_ok')),
        'double': '<span class="art-row">%s%s%s</span>' % (img('loops_island_ok'), '<img class="brg" src="img/s/loops_bridge_2.webp" alt="" loading="lazy">', img('loops_island_ok')),
    },
    'park': {'number': '<span class="art-row">%s%s%s</span>' % (img('park_car2_red'), img('park_num_badge'), img('park_car2_blue'))},
}


def lab_art(g, strings):
    pass


def build_game(slug, g):
    app = g['app']
    short = slug.replace('jelly', '')
    strings = json.load(open(os.path.join(HERE, 'strings_jelly%s.json' % short), encoding='utf8'))
    tabs, panes = [], []
    arts = LAB_ART.get(short, {})
    for key, sprite, level, art in g['lab']:
        nm, ds = strings['twist.' + key], strings['twist.' + key + '.desc']
        tabs.append('          <button class="lab-tab" type="button" role="tab"><img src="img/s/%s.webp" alt="" width="192" height="192" loading="lazy"><span><span class="en i">%s</span><span class="tr i">%s</span></span></button>'
                    % (sprite, B.esc(nm['en']), B.esc(nm['tr'])))
        art_html = arts[art] if art and art in arts else '<img src="img/s/%s.webp" alt="" width="256" height="256" loading="lazy">' % sprite
        first = '<span class="en i">First shows up at level %d</span><span class="tr i">İlk %d. bölümde karşına çıkar</span>' % (level, level)
        if level == 1:
            first = '<span class="en i">The base rule, from level 1</span><span class="tr i">Temel kural, 1. bölümden itibaren</span>'
        panes.append('''          <div class="lab-pane" role="tabpanel">
            <div class="lab-art">%s</div>
            <div>
              <h3><span class="en i">%s</span><span class="tr i">%s</span></h3>
              <p class="en">%s</p>
              <p class="tr">%s</p>
              <p class="lab-tip">%s</p>
            </div>
          </div>''' % (art_html, B.esc(nm['en']), B.esc(nm['tr']), B.esc(ds['en']), B.esc(ds['tr']), first))
    gallery = '\n'.join('      <button type="button" data-full="img/shot-%d.webp" aria-label="%s"><img src="img/shot-%d.webp" alt="%s" width="540" height="960" loading="lazy"></button>'
                        % (i, g['shots_alt'][i - 1], i, g['shots_alt'][i - 1]) for i in range(1, len(g['shots_alt']) + 1))
    play = PLAY_URL[slug]
    if play:
        play_btn = ('<a class="btn p" href="%s" target="_blank" rel="noopener"><span class="en i">Get it on Google Play</span>'
                    '<span class="tr i">Google Play\'den indir</span> <span class="arw">&rarr;</span></a>' % play)
    else:
        play_btn = ('<span class="btn soon"><span class="dotlive" aria-hidden="true"></span><span class="en i">Coming soon to Google Play</span>'
                    '<span class="tr i">Yakında Google Play\'de</span></span>')
    ld = ('{"@context":"https://schema.org","@graph":[{"@type":"MobileApplication","name":"%(name)s","url":"https://jinjagames.com/%(slug)s/",'
          '"image":"https://jinjagames.com/%(slug)s/img/og.jpg","description":"%(ld_desc)s","applicationCategory":"GameApplication",'
          '"genre":"Puzzle","operatingSystem":"Android","inLanguage":["en","tr","de","es","pt","fr"],"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},'
          '"author":{"@type":"Organization","name":"JinjaGames"},"publisher":{"@type":"Organization","name":"JinjaGames","url":"https://jinjagames.com/"}},'
          '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"JinjaGames","item":"https://jinjagames.com/"},'
          '{"@type":"ListItem","position":2,"name":"Games","item":"https://jinjagames.com/games/"},'
          '{"@type":"ListItem","position":3,"name":"%(name)s","item":"https://jinjagames.com/%(slug)s/"}]}]}') % dict(g, slug=slug)
    family = '\n'.join('        <a href="../%s/"><img src="../%s/img/icon.png" alt="" width="72" height="72" loading="lazy"><span>%s<small><span class="en i">%s</span><span class="tr i">%s</span></small></span></a>'
                       % (s, s, n, e, t) for s, n, e, t in FAMILY if s != slug)
    calm = ''.join('<img src="img/s/%s.webp" alt="">' % c for c in g['calm'])
    w = g['win']
    win = '''            <div class="win" id="win"><div>
              <img class="wm" src="img/s/%s.webp" alt="">
              <div class="stars"><img src="img/s/ui_star_full.webp" alt=""><img src="img/s/ui_star_full.webp" alt=""><img src="img/s/ui_star_full.webp" alt=""></div>
              <h3 class="en">%s</h3><h3 class="tr">%s</h3>
              <p class="en">%s</p><p class="tr">%s</p>
              <button class="btn p" id="b-next" type="button"><span class="en i">Next puzzle</span><span class="tr i">Sonraki bulmaca</span> <span class="arw">&rarr;</span></button>
            </div></div>''' % (g['win_img'], w[0], w[1], w[2], w[3])
    parts = {}
    cur = None
    for line in open(os.path.join(HERE, 'g_%s.txt' % slug), encoding='utf8').read().split('\n'):
        m = re.match(r'@@@ (\w+)\s*$', line)
        if m:
            cur = m.group(1)
            parts[cur] = []
        elif cur:
            parts[cur].append(line)
    parts = {k: '\n'.join(v).strip('\n') for k, v in parts.items()}
    parts['TRY'] = parts['TRY'].replace('@@WIN@@', win)
    puzzles = open(os.path.join(HERE, 'puzzles_%s.json' % g['puzzles']), encoding='utf8').read()
    tags = {
        'slug': slug, 'name': g['name'], 'name_q': g['name'].replace(' ', '%20'), 'title': g['title'], 'desc': g['desc'], 'og_title': g['og_title'],
        'og_desc': g['og_desc'], 'bg': g['light']['bg'], 'd_bg': g['dark']['bg'], 'ld': ld,
        'claim_en': g['claim'][0], 'claim_tr': g['claim'][1], 'lead_en': g['lead'][0], 'lead_tr': g['lead'][1],
        'twist_h_en': g['twist_h'][0], 'twist_h_tr': g['twist_h'][1], 'gal_eyebrow_en': g['gal'][0], 'gal_eyebrow_tr': g['gal'][1],
        'cta_h_en': g['cta'][0], 'cta_h_tr': g['cta'][1], 'cta_p_en': g['cta'][2], 'cta_p_tr': g['cta'][3],
    }
    html = B.read('game.html')
    foot = B.FOOT.replace('<a href="privacy/">', '<a href="privacy/">')
    html = (html.replace('@@HEAD@@', B.HEAD).replace('@@NAV@@', B.NAV).replace('@@FOOT@@', foot).replace('@@PRIVACY@@', PRIVACY).replace('@@CTA@@', B.CTA)
            .replace('@@THEME@@', theme(g['light'], g['dark'])).replace('@@BASE_CSS@@', B.read('base.css')).replace('@@BASE_JS@@', B.read('base.js'))
            .replace('@@GAME_CSS@@', parts.get('CSS', '')).replace('@@HERO_DECO@@', parts.get('HERO_DECO', '')).replace('@@HERO_STAGE@@', parts['HERO_STAGE'])
            .replace('@@TRY@@', parts['TRY']).replace('@@GAME_JS@@', parts['JS']).replace('@@LAB_TABS@@', '\n'.join(tabs)).replace('@@LAB_PANES@@', '\n'.join(panes))
            .replace('@@GALLERY@@', gallery).replace('@@PLAY_BTN@@', play_btn).replace('@@FAMILY@@', family).replace('@@CALM_ROW@@', calm).replace('@@PUZZLES@@', puzzles))
    html = B.sub(html, tags)
    left = set(re.findall(r'@@(\w+)@@', html))
    assert not left, left
    out = os.path.join(ROOT, slug, 'index.html')
    open(out, 'w', encoding='utf8', newline='\n').write(html)
    print('ok', slug, round(len(html) / 1024), 'KB')


CK = B.CK
PRIVACY = B.PRIVACY

if __name__ == '__main__':
    import sys
    only = sys.argv[1:] or list(GAMES)
    for s in only:
        build_game(s, GAMES[s])
