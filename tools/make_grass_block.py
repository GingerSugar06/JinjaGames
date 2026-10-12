"""Çimen bloğu ikonunu üretir (assets/img/). Mojang dokusu kullanılmaz: 16x16 doku
burada sabit tohumla çizilir, sonra izometrik küp olarak piksel piksel boyanır."""
import os, random
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'img')
os.makedirs(OUT, exist_ok=True)
r = random.Random(1709)

GRASS = [(95, 159, 53), (111, 180, 63), (79, 138, 43), (124, 194, 74), (86, 143, 47), (101, 168, 57)]
DIRT = [(134, 96, 67), (121, 85, 58), (149, 112, 79), (107, 74, 49), (160, 122, 85), (128, 90, 62)]
STONE_FLECK = [(118, 118, 118), (96, 96, 96)]

def pick(pal, w):
    return r.choices(pal, weights=w)[0]

top = [[pick(GRASS, [5, 3, 3, 1, 3, 3]) for _ in range(16)] for _ in range(16)]
side = [[pick(DIRT, [6, 4, 3, 2, 1, 4]) for _ in range(16)] for _ in range(16)]
for x in range(16):
    for y in range(16):
        if r.random() < .025: side[y][x] = r.choice(STONE_FLECK)
    drip = 3 + r.choice([0, 0, 1, 1, 2, -1])
    for y in range(drip):
        side[y][x] = pick(GRASS, [5, 2, 4, 1, 3, 3])
    if r.random() < .5:
        side[drip][x] = GRASS[2]

def tex_png(m, name):
    im = Image.new('RGB', (16, 16))
    for y in range(16):
        for x in range(16): im.putpixel((x, y), m[y][x])
    im.save(os.path.join(OUT, name))

tex_png(top, 'grass-top.png')
tex_png(side, 'grass-side.png')

def shade(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)

def block(s):
    W = 32 * s
    im = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = 16 * s
    P = lambda u, v: (cx + (u - v) * s, (u + v) * s / 2)
    L = lambda u, v: (cx - 16 * s + u * s, 8 * s + u * s / 2 + v * s)
    R = lambda u, v: (cx + u * s, 16 * s - u * s / 2 + v * s)
    for v in range(16):
        for u in range(16):
            d.polygon([P(u, v), P(u + 1, v), P(u + 1, v + 1), P(u, v + 1)], fill=top[v][u])
            d.polygon([L(u, v), L(u + 1, v), L(u + 1, v + 1), L(u, v + 1)], fill=shade(side[v][u], .82))
            d.polygon([R(u, v), R(u + 1, v), R(u + 1, v + 1), R(u, v + 1)], fill=shade(side[v][15 - u], .64))
    return im

big = block(16)                      # 512px kaynak
big.save(os.path.join(OUT, 'grass-block.png'), optimize=True)
for n in (128, 64):
    big.resize((n, n), Image.LANCZOS).save(os.path.join(OUT, f'grass-block-{n}.png'), optimize=True)
print('ok', OUT)
