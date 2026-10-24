"""Yeni 6 Jelly sayfasındaki oynanabilir bulmacaları üretir (bir kez çalıştırılır, sabit tohum):
   puzzles_jars.json, puzzles_logic.json, puzzles_loops.json, puzzles_park.json, puzzles_seek.json, puzzles_slide.json
Kurallar oyunların kendi kurallarıdır (packages/puzzle_core). Her bulmaca burada çözücüyle doğrulanır:
Logic ve Loops tek çözümlü, Seek tahminsiz (yalnız çıkarımla), Park/Slide/Jars çözülebilir."""
import itertools
import json
import os
import random
from collections import deque

HERE = os.path.dirname(os.path.abspath(__file__))


def save(name, data):
    with open(os.path.join(HERE, 'puzzles_%s.json' % name), 'w', encoding='utf8') as f:
        json.dump(data, f, separators=(',', ':'))
    print(name, len(data))


# ------------------------------------------------------------------ JARS
CAP = 4


def jar_moves(st, locks):
    for a in range(len(st)):
        if not st[a]:
            continue
        col = st[a][-1]
        run = 0
        while run < len(st[a]) and st[a][-1 - run] == col:
            run += 1
        for b in range(len(st)):
            if a == b:
                continue
            if locks[b] is not None and locks[b] != col:
                continue
            if st[b] and st[b][-1] != col:
                continue
            room = CAP - len(st[b])
            if room <= 0:
                continue
            if not st[b] and run == len(st[a]) and not locks[b] is not None:
                continue  # boş kavanoza taşımak yararsız
            yield a, b, min(run, room)


def jar_apply(st, a, b, k):
    s = [list(j) for j in st]
    col = s[a][-1]
    for _ in range(k):
        s[a].pop()
        s[b].append(col)
    return tuple(tuple(j) for j in s)


def jar_done(st):
    return all((not j) or (len(j) == CAP and len(set(j)) == 1) for j in st)


def jar_solve(st, locks, limit=200000):
    start = tuple(tuple(j) for j in st)
    seen = {start: None}
    q = deque([start])
    while q and len(seen) < limit:
        cur = q.popleft()
        if jar_done(cur):
            path = []
            while seen[cur] is not None:
                prev, mv = seen[cur]
                path.append(mv)
                cur = prev
            return path[::-1]
        for a, b, k in jar_moves(cur, locks):
            nx = jar_apply(cur, a, b, k)
            if nx not in seen:
                seen[nx] = (cur, (a, b))
                q.append(nx)
    return None


def gen_jars():
    out = []
    specs = [
        dict(colors=3, extra=2, hidden=False, lock=False, min=6, max=14),
        dict(colors=4, extra=2, hidden=True, lock=False, min=8, max=18),
        dict(colors=4, extra=3, hidden=False, lock=True, min=9, max=20),
    ]
    rnd = random.Random(11)
    for sp in specs:
        while True:
            cols = [c for c in range(sp['colors']) for _ in range(CAP)]
            rnd.shuffle(cols)
            jars = [cols[i * CAP:(i + 1) * CAP] for i in range(sp['colors'])] + [[] for _ in range(sp['extra'])]
            locks = [None] * len(jars)
            if sp['lock']:
                locks[-1] = rnd.randrange(sp['colors'])
            if any(len(set(j)) == 1 for j in jars[:sp['colors']]):
                continue
            path = jar_solve(jars, locks)
            if path and sp['min'] <= len(path) <= sp['max']:
                out.append({'jars': jars, 'locks': locks, 'hidden': sp['hidden'], 'par': len(path)})
                break
    save('jars', out)


# ------------------------------------------------------------------ LOGIC
def logic_groups(n, br, bc, diag):
    g = [[r * n + c for c in range(n)] for r in range(n)]
    g += [[r * n + c for r in range(n)] for c in range(n)]
    for R in range(0, n, br):
        for C in range(0, n, bc):
            g.append([(R + i) * n + C + j for i in range(br) for j in range(bc)])
    if diag:
        g.append([i * n + i for i in range(n)])
        g.append([i * n + (n - 1 - i) for i in range(n)])
    return g


def logic_count(n, br, bc, diag, givens, parity, cmp_, limit=2):
    groups = logic_groups(n, br, bc, diag)
    peers = [set() for _ in range(n * n)]
    for g in groups:
        for a in g:
            for b in g:
                if a != b:
                    peers[a].add(b)
    grid = list(givens)
    lt = {}
    for a, b in cmp_:  # a < b
        lt.setdefault(a, []).append(('lt', b))
        lt.setdefault(b, []).append(('gt', a))
    cnt = [0]

    def ok(i, v):
        for p in peers[i]:
            if grid[p] == v:
                return False
        pr = parity.get(i)
        if pr == 'o' and v % 2 == 0:
            return False
        if pr == 'e' and v % 2 == 1:
            return False
        for kind, j in lt.get(i, []):
            w = grid[j]
            if w:
                if kind == 'lt' and not v < w:
                    return False
                if kind == 'gt' and not v > w:
                    return False
        return True

    def rec():
        if cnt[0] >= limit:
            return
        best, bo = -1, None
        for i in range(n * n):
            if grid[i] == 0:
                o = [v for v in range(1, n + 1) if ok(i, v)]
                if bo is None or len(o) < len(bo):
                    best, bo = i, o
                    if len(o) <= 1:
                        break
        if best < 0:
            cnt[0] += 1
            return
        for v in bo:
            grid[best] = v
            rec()
            grid[best] = 0
            if cnt[0] >= limit:
                return

    rec()
    return cnt[0]


def logic_solution(n, br, bc, diag, parity, cmp_, rnd):
    groups = logic_groups(n, br, bc, diag)
    peers = [set() for _ in range(n * n)]
    for g in groups:
        for a in g:
            for b in g:
                if a != b:
                    peers[a].add(b)
    grid = [0] * (n * n)

    def rec(i):
        if i == n * n:
            return True
        vs = list(range(1, n + 1))
        rnd.shuffle(vs)
        for v in vs:
            if any(grid[p] == v for p in peers[i]):
                continue
            grid[i] = v
            if rec(i + 1):
                return True
            grid[i] = 0
        return False

    rec(0)
    return grid


def gen_logic():
    rnd = random.Random(5)
    specs = [
        dict(key='sudoku', n=4, br=2, bc=2, diag=False, par=0, cmp=0, keep=7),
        dict(key='compare', n=4, br=2, bc=2, diag=False, par=0, cmp=5, keep=4),
        dict(key='parity', n=4, br=2, bc=2, diag=False, par=6, cmp=0, keep=4),
        dict(key='diag', n=4, br=2, bc=2, diag=True, par=0, cmp=0, keep=3),
        dict(key='sudoku', n=6, br=2, bc=3, diag=False, par=0, cmp=0, keep=15),
    ]
    out = []
    for sp in specs:
        n = sp['n']
        sol = logic_solution(n, sp['br'], sp['bc'], sp['diag'], {}, [], rnd)
        parity = {}
        for i in rnd.sample(range(n * n), sp['par']):
            parity[i] = 'o' if sol[i] % 2 else 'e'
        cmp_ = []
        pairs = []
        for r in range(n):
            for c in range(n):
                i = r * n + c
                if c + 1 < n:
                    pairs.append((i, i + 1))
                if r + 1 < n:
                    pairs.append((i, i + n))
        for a, b in rnd.sample(pairs, sp['cmp']):
            cmp_.append([a, b] if sol[a] < sol[b] else [b, a])
        givens = list(sol)
        order = list(range(n * n))
        rnd.shuffle(order)
        for i in order:
            if sum(1 for v in givens if v) <= sp['keep']:
                break
            keep = givens[i]
            givens[i] = 0
            if logic_count(n, sp['br'], sp['bc'], sp['diag'], givens, parity, cmp_) != 1:
                givens[i] = keep
        assert logic_count(n, sp['br'], sp['bc'], sp['diag'], givens, parity, cmp_) == 1
        out.append({'key': sp['key'] if not (sp['diag']) else 'diag', 'n': n, 'br': sp['br'], 'bc': sp['bc'], 'diag': sp['diag'],
                    'givens': givens, 'solution': sol, 'parity': {str(k): v for k, v in parity.items()}, 'cmp': cmp_})
    out[1]['key'] = 'compare'
    out[2]['key'] = 'parity'
    save('logic', out)


# ------------------------------------------------------------------ LOOPS (halka çiz + köprü kur)
def slither_edges(n):
    """n x n hücre, (n+1)^2 nokta. Kenar: ('h',r,c) / ('v',r,c)."""
    E = []
    for r in range(n + 1):
        for c in range(n):
            E.append(('h', r, c))
    for r in range(n):
        for c in range(n + 1):
            E.append(('v', r, c))
    return E


def cell_edges(r, c):
    return [('h', r, c), ('h', r + 1, c), ('v', r, c), ('v', r, c + 1)]


def vert_edges(n, r, c):
    es = []
    if c > 0:
        es.append(('h', r, c - 1))
    if c < n:
        es.append(('h', r, c))
    if r > 0:
        es.append(('v', r - 1, c))
    if r < n:
        es.append(('v', r, c))
    return es


def slither_count(n, clues, limit=2):
    E = slither_edges(n)
    idx = {e: i for i, e in enumerate(E)}
    val = [-1] * len(E)  # -1 bilinmiyor, 0 yok, 1 ip
    cell_of = {e: [] for e in E}
    for (r, c), k in clues.items():
        for e in cell_edges(r, c):
            cell_of[e].append((r, c))
    vert_of = {e: [] for e in E}
    verts = {}
    for r in range(n + 1):
        for c in range(n + 1):
            ve = vert_edges(n, r, c)
            verts[(r, c)] = ve
            for e in ve:
                vert_of[e].append((r, c))
    cnt = [0]

    def cell_ok(rc):
        k = clues[rc]
        on = unk = 0
        for e in cell_edges(*rc):
            v = val[idx[e]]
            if v == 1:
                on += 1
            elif v < 0:
                unk += 1
        return on <= k <= on + unk

    def vert_ok(rc):
        on = unk = 0
        for e in verts[rc]:
            v = val[idx[e]]
            if v == 1:
                on += 1
            elif v < 0:
                unk += 1
        if on > 2:
            return False
        if on == 1 and unk == 0:
            return False
        return True

    def single_loop():
        on = [e for e in E if val[idx[e]] == 1]
        if not on:
            return False
        deg = {}
        adj = {}
        for e in on:
            kind, r, c = e
            a, b = ((r, c), (r, c + 1)) if kind == 'h' else ((r, c), (r + 1, c))
            deg[a] = deg.get(a, 0) + 1
            deg[b] = deg.get(b, 0) + 1
            adj.setdefault(a, []).append(b)
            adj.setdefault(b, []).append(a)
        if any(d != 2 for d in deg.values()):
            return False
        start = next(iter(adj))
        seen = {start}
        st = [start]
        while st:
            x = st.pop()
            for y in adj[x]:
                if y not in seen:
                    seen.add(y)
                    st.append(y)
        return len(seen) == len(adj)

    def rec(i):
        if cnt[0] >= limit:
            return
        if i == len(E):
            if single_loop():
                cnt[0] += 1
            return
        for v in (1, 0):
            val[i] = v
            e = E[i]
            if all(cell_ok(rc) for rc in cell_of[e]) and all(vert_ok(rc) for rc in vert_of[e]):
                rec(i + 1)
            val[i] = -1
            if cnt[0] >= limit:
                return

    rec(0)
    return cnt[0]


def random_loop(n, rnd, fill):
    """Delikleri olmayan bağlantılı bir hücre kümesi; sınırı tek halka olmalı."""
    while True:
        cells = {(rnd.randrange(n), rnd.randrange(n))}
        target = max(3, int(n * n * fill))
        tries = 0
        while len(cells) < target and tries < 400:
            tries += 1
            r, c = rnd.choice(sorted(cells))
            dr, dc = rnd.choice([(0, 1), (1, 0), (0, -1), (-1, 0)])
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n:
                cells.add((nr, nc))
        # sınır kenarları
        edges = []
        for (r, c) in cells:
            for kind, rr, cc, nb in (('h', r, c, (r - 1, c)), ('h', r + 1, c, (r + 1, c)), ('v', r, c, (r, c - 1)), ('v', r, c + 1, (r, c + 1))):
                if nb not in cells:
                    edges.append((kind, rr, cc))
        deg = {}
        for kind, r, c in edges:
            a, b = ((r, c), (r, c + 1)) if kind == 'h' else ((r, c), (r + 1, c))
            deg[a] = deg.get(a, 0) + 1
            deg[b] = deg.get(b, 0) + 1
        if all(d == 2 for d in deg.values()):
            # tek halka mı (iç delik olmasın): bağlantılılık
            adj = {}
            for kind, r, c in edges:
                a, b = ((r, c), (r, c + 1)) if kind == 'h' else ((r, c), (r + 1, c))
                adj.setdefault(a, []).append(b)
                adj.setdefault(b, []).append(a)
            start = next(iter(adj))
            seen = {start}
            st = [start]
            while st:
                x = st.pop()
                for y in adj[x]:
                    if y not in seen:
                        seen.add(y)
                        st.append(y)
            if len(seen) == len(adj) and len(cells) >= target:
                return cells, edges


def gen_slither(n, seed, keep_frac):
    rnd = random.Random(seed)
    while True:
        cells, edges = random_loop(n, rnd, .55)
        eset = set(edges)
        clues = {}
        for r in range(n):
            for c in range(n):
                clues[(r, c)] = sum(1 for e in cell_edges(r, c) if e in eset)
        order = list(clues)
        rnd.shuffle(order)
        for rc in order:
            if len(clues) <= max(4, int(n * n * keep_frac)):
                break
            v = clues.pop(rc)
            if slither_count(n, clues) != 1:
                clues[rc] = v
        if slither_count(n, clues) == 1:
            return {'type': 'line', 'n': n, 'clues': [[r, c, k] for (r, c), k in sorted(clues.items())],
                    'solution': [list(e) for e in sorted(edges)]}


def hashi_solutions(isl, links, limit=2):
    """isl: [(r,c,k)], links: [(a,b)]; her bağ 0..2 köprü; kesişme yok, bağlantılı, sayılar tutar."""
    L = len(links)
    cross = []
    for i in range(L):
        for j in range(i + 1, L):
            a, b = links[i], links[j]
            (r1, c1, _), (r2, c2, _) = isl[a[0]], isl[a[1]]
            (r3, c3, _), (r4, c4, _) = isl[b[0]], isl[b[1]]
            h1, h2 = r1 == r2, r3 == r4
            if h1 == h2:
                continue
            if h1:
                hr, hc0, hc1, vc, vr0, vr1 = r1, min(c1, c2), max(c1, c2), c3, min(r3, r4), max(r3, r4)
            else:
                hr, hc0, hc1, vc, vr0, vr1 = r3, min(c3, c4), max(c3, c4), c1, min(r1, r2), max(r1, r2)
            if hc0 < vc < hc1 and vr0 < hr < vr1:
                cross.append((i, j))
    sols = []
    for combo in itertools.product(range(3), repeat=L):
        deg = [0] * len(isl)
        for (a, b), m in zip(links, combo):
            deg[a] += m
            deg[b] += m
        if any(deg[i] != isl[i][2] for i in range(len(isl))):
            continue
        if any(combo[i] and combo[j] for i, j in cross):
            continue
        seen = {0}
        st = [0]
        while st:
            x = st.pop()
            for (a, b), m in zip(links, combo):
                if m:
                    y = b if a == x else a if b == x else None
                    if y is not None and y not in seen:
                        seen.add(y)
                        st.append(y)
        if len(seen) == len(isl):
            sols.append(combo)
            if len(sols) >= limit:
                break
    return sols


def gen_hashi(n, k, seed, double):
    rnd = random.Random(seed)
    while True:
        cells = rnd.sample([(r, c) for r in range(n) for c in range(n)], k)
        cells.sort()
        links = []
        for a in range(k):
            for b in range(a + 1, k):
                (r1, c1), (r2, c2) = cells[a], cells[b]
                if r1 == r2 and not any(cells[x][0] == r1 and c1 < cells[x][1] < c2 for x in range(k)):
                    links.append((a, b))
                elif c1 == c2 and not any(cells[x][1] == c1 and r1 < cells[x][0] < r2 for x in range(k)):
                    links.append((a, b))
        if len(links) < k - 1 or len(links) > 11:
            continue
        # rastgele köprü sayıları ata, çözümü kontrol et
        for _ in range(40):
            combo = [rnd.choice([0, 1, 1, 2] if double else [0, 1, 1]) for _ in links]
            deg = [0] * k
            for (a, b), m in zip(links, combo):
                deg[a] += m
                deg[b] += m
            if min(deg) == 0:
                continue
            isl = [(cells[i][0], cells[i][1], deg[i]) for i in range(k)]
            sols = hashi_solutions(isl, links, 2) if double else None
            if not double:
                # yalnız tekli köprü: 0..1
                sols = [s for s in hashi_solutions(isl, links, 3000) if max(s) <= 1][:2]
            if sols and len(sols) == 1:
                return {'type': 'bridge', 'n': n, 'islands': [list(x) for x in isl], 'links': [list(l) for l in links],
                        'solution': list(sols[0]), 'double': double}


def gen_loops():
    out = [gen_slither(3, 2, .6), gen_slither(4, 7, .5), gen_slither(5, 21, .45), gen_hashi(5, 6, 4, False), gen_hashi(5, 7, 9, True)]
    save('loops', out)


# ------------------------------------------------------------------ PARK
DIRS = {'u': (-1, 0), 'd': (1, 0), 'l': (0, -1), 'r': (0, 1)}


def park_order(n, cars, cones, numbered):
    """Açgözlü sıra: yoksa None. Araç: cells (baş önde), dir, num."""
    alive = set(range(len(cars)))
    order = []
    nxt = 1
    while alive:
        moved = False
        occ = {}
        for i in alive:
            for cell in cars[i]['cells']:
                occ[tuple(cell)] = i
        for i in sorted(alive):
            car = cars[i]
            if numbered and car.get('num') and car['num'] != nxt:
                continue
            dr, dc = DIRS[car['dir']]
            r, c = car['cells'][0]
            free = True
            r += dr
            c += dc
            while 0 <= r < n and 0 <= c < n:
                if (r, c) in occ or (r, c) in cones:
                    free = False
                    break
                r += dr
                c += dc
            if free:
                alive.remove(i)
                order.append(i)
                if numbered and car.get('num'):
                    nxt += 1
                moved = True
                break
        if not moved:
            return None
    return order


def gen_park_one(n, ncars, ncones, bus, numbers, seed):
    rnd = random.Random(seed)
    while True:
        cones = set()
        occ = set()
        while len(cones) < ncones:
            cones.add((rnd.randrange(n), rnd.randrange(n)))
        occ |= cones
        cars = []
        guard = 0
        while len(cars) < ncars and guard < 400:
            guard += 1
            ln = 3 if (bus and len(cars) < bus) else 2
            d = rnd.choice('udlr')
            dr, dc = DIRS[d]
            r, c = rnd.randrange(n), rnd.randrange(n)
            cells = [(r - dr * i, c - dc * i) for i in range(ln)]  # baş (r,c), gövde arkada
            if all(0 <= a < n and 0 <= b < n and (a, b) not in occ for a, b in cells):
                cars.append({'cells': [list(x) for x in cells], 'dir': d, 'len': ln})
                occ |= set(cells)
        if len(cars) < ncars:
            continue
        for i, car in enumerate(cars):
            car['color'] = i % 8
        order = park_order(n, cars, cones, False)
        if order is None:
            continue
        free0 = sum(1 for i in range(len(cars)) if park_order(n, [cars[i]], cones, False) is not None and True)
        # kaç araç hemen çıkabilir (başka araç yokken değil, gerçek durumda)
        occ_cells = {tuple(x): i for i, car in enumerate(cars) for x in car['cells']}
        now_free = 0
        for i, car in enumerate(cars):
            dr, dc = DIRS[car['dir']]
            r, c = car['cells'][0]
            r += dr
            c += dc
            ok = True
            while 0 <= r < n and 0 <= c < n:
                if (r, c) in occ_cells or (r, c) in cones:
                    ok = False
                    break
                r += dr
                c += dc
            now_free += ok
        if now_free > max(3, ncars // 3) or now_free < 1:
            continue
        if numbers:
            # sıralı numaralar: ilk sıradaki çıkışa göre ilk 3-4 araç
            pick = order[:numbers]
            for k, i in enumerate(pick, 1):
                cars[i]['num'] = k
            if park_order(n, cars, cones, True) is None:
                continue
        return {'n': n, 'cars': cars, 'cones': [list(x) for x in sorted(cones)], 'numbered': bool(numbers)}


def gen_park():
    out = [gen_park_one(6, 8, 0, 0, 0, 3), gen_park_one(6, 8, 5, 0, 0, 8), gen_park_one(6, 8, 2, 2, 0, 12), gen_park_one(6, 9, 2, 0, 4, 17)]
    save('park', out)


# ------------------------------------------------------------------ SEEK
def nbrs(rows, cols, i):
    r, c = divmod(i, cols)
    return [(r + a) * cols + c + b for a in (-1, 0, 1) for b in (-1, 0, 1) if (a or b) and 0 <= r + a < rows and 0 <= c + b < cols]


def region_of(rows, cols, i, kind):
    r, c = divmod(i, cols)
    if kind == 'n':
        return nbrs(rows, cols, i)
    if kind == 'l':  # fener: bütün satır (kendisi hariç)
        return [r * cols + cc for cc in range(cols) if cc != c]
    if kind == 's':  # dürbün: 5x5
        return [(r + a) * cols + c + b for a in range(-2, 3) for b in range(-2, 3) if (a or b) and 0 <= r + a < rows and 0 <= c + b < cols]


def seek_solve(rows, cols, mines, kinds, starts):
    """kinds: hücre -> 'n'|'l'|'s' (özel karolar hep güvenli, baştan açık). Mantıkla bitirebilir mi?"""
    N = rows * cols
    opened = set()
    safe_known = set()
    mine_known = set()

    def open_cell(i):
        stack = [i]
        while stack:
            x = stack.pop()
            if x in opened:
                continue
            opened.add(x)
            if kinds.get(x, 'n') == 'n':
                cnt = sum(1 for y in region_of(rows, cols, x, 'n') if y in mines)
                if cnt == 0:
                    stack.extend(y for y in region_of(rows, cols, x, 'n') if y not in opened)

    for s in starts:
        open_cell(s)
    for i, k in kinds.items():
        if k in ('l', 's'):
            open_cell(i)
    total = len(mines)
    while True:
        cons = []
        for x in opened:
            reg = region_of(rows, cols, x, kinds.get(x, 'n'))
            cnt = sum(1 for y in reg if y in mines)
            unk = frozenset(y for y in reg if y not in opened and y not in mine_known)
            rem = cnt - sum(1 for y in reg if y in mine_known)
            if unk:
                cons.append((unk, rem))
        prog = False
        for unk, rem in cons:
            if rem == 0:
                for y in unk:
                    if y not in safe_known:
                        safe_known.add(y)
                        prog = True
            elif rem == len(unk):
                for y in unk:
                    if y not in mine_known:
                        mine_known.add(y)
                        prog = True
        for (a, ra), (b, rb) in itertools.permutations(cons, 2):
            if a < b:
                d = b - a
                dr = rb - ra
                if dr == 0:
                    for y in d:
                        if y not in safe_known:
                            safe_known.add(y)
                            prog = True
                elif dr == len(d):
                    for y in d:
                        if y not in mine_known:
                            mine_known.add(y)
                            prog = True
        unknown = [y for y in range(N) if y not in opened and y not in mine_known and y not in safe_known]
        if unknown and total - len(mine_known) == 0:
            for y in unknown:
                safe_known.add(y)
            prog = True
        elif unknown and total - len(mine_known) == len(unknown):
            for y in unknown:
                mine_known.add(y)
            prog = True
        newly = [y for y in safe_known if y not in opened]
        for y in newly:
            open_cell(y)
        if not prog and not newly:
            break
    return len(opened) == N - len(mines)


def gen_seek_one(rows, cols, nm, spec, seed):
    rnd = random.Random(seed)
    N = rows * cols
    while True:
        mines = set(rnd.sample(range(N), nm))
        kinds = {}
        pool = [i for i in range(N) if i not in mines]
        if spec == 'l':
            for i in rnd.sample(pool, 2):
                kinds[i] = 'l'
        if spec == 's':
            for i in rnd.sample(pool, 2):
                kinds[i] = 's'
        zeros = [i for i in pool if kinds.get(i, 'n') == 'n' and not any(y in mines for y in nbrs(rows, cols, i))]
        if not zeros:
            continue
        start = rnd.choice(zeros)
        if seek_solve(rows, cols, mines, kinds, [start]):
            # başlangıçta açılan her şeyi tahmin etmeden çözülebildi
            return {'rows': rows, 'cols': cols, 'mines': sorted(mines), 'kinds': {str(k): v for k, v in kinds.items()}, 'start': start}


def gen_seek():
    out = [gen_seek_one(5, 5, 4, 'n', 3), gen_seek_one(6, 6, 7, 'n', 5), gen_seek_one(6, 6, 7, 'l', 9), gen_seek_one(6, 6, 7, 's', 13)]
    save('seek', out)


# ------------------------------------------------------------------ SLIDE
def slide_run(n, rocks, snow, fish, warps, pos, d, fishmask, exit_, fishfull):
    r, c = pos
    dr, dc = DIRS[d]
    steps = 0
    pairs = {}
    for a, b in warps:
        pairs[tuple(a)] = tuple(b)
        pairs[tuple(b)] = tuple(a)
    while True:
        nr, nc = r + dr, c + dc
        if not (0 <= nr < n and 0 <= nc < n) or (nr, nc) in rocks:
            break
        r, c = nr, nc
        steps += 1
        if steps > 4 * n:  # ışınlanma döngüsü: oyunda da kayma durur
            break
        if (r, c) in fish:
            fishmask |= 1 << fish.index((r, c))
        if (r, c) in pairs:
            r, c = pairs[(r, c)]
        if (r, c) == exit_ and fishmask == fishfull:
            return (r, c), fishmask, True, steps
        if (r, c) in snow:
            break
    return (r, c), fishmask, False, steps


def slide_bfs(n, rocks, snow, fish, warps, start, exit_):
    full = (1 << len(fish)) - 1
    s0 = (start, 0)
    seen = {s0: 0}
    q = deque([s0])
    while q:
        pos, fm = q.popleft()
        for d in 'udlr':
            np_, nfm, done, steps = slide_run(n, rocks, snow, fish, warps, pos, d, fm, exit_, full)
            if steps == 0:
                continue
            if done:
                return seen[(pos, fm)] + 1
            if (np_, nfm) not in seen:
                seen[(np_, nfm)] = seen[(pos, fm)] + 1
                q.append((np_, nfm))
    return None


def gen_slide_one(n, nrocks, nsnow, nfish, nwarp, lo, hi, seed):
    rnd = random.Random(seed)
    cells = [(r, c) for r in range(n) for c in range(n)]
    while True:
        pick = rnd.sample(cells, nrocks + nsnow + nfish + nwarp * 2 + 2)
        it = iter(pick)
        rocks = {next(it) for _ in range(nrocks)}
        snow = {next(it) for _ in range(nsnow)}
        fish = [next(it) for _ in range(nfish)]
        warps = [(next(it), next(it)) for _ in range(nwarp)]
        start, exit_ = next(it), next(it)
        par = slide_bfs(n, rocks, snow, fish, warps, start, exit_)
        if par and lo <= par <= hi:
            return {'n': n, 'rocks': [list(x) for x in sorted(rocks)], 'snow': [list(x) for x in sorted(snow)], 'fish': [list(x) for x in fish],
                    'warps': [[list(a), list(b)] for a, b in warps], 'start': list(start), 'exit': list(exit_), 'par': par}


def gen_slide():
    out = [gen_slide_one(5, 6, 0, 0, 0, 4, 6, 1), gen_slide_one(5, 5, 2, 0, 0, 4, 7, 4), gen_slide_one(5, 5, 0, 2, 0, 5, 8, 6), gen_slide_one(6, 7, 0, 0, 1, 5, 8, 10)]
    save('slide', out)


if __name__ == '__main__':
    gen_jars()
    gen_logic()
    gen_loops()
    gen_park()
    gen_seek()
    gen_slide()
