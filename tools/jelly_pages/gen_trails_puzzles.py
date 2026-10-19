"""Jelly Trails tanıtım sayfasındaki oynanabilir mini bulmacaları üretir ve doğrular.
Her bulmaca: n x n tahta, renk çiftleri; tüm kareyi dolduran çözüm vardır ve (olabildiğince) tektir.
Çıktı: puzzles_trails.json (build.py sayfaya gömer). Tohum sabit, aynı çıktıyı verir."""
import json
import os
import random
import sys

sys.setrecursionlimit(10000)
HERE = os.path.dirname(os.path.abspath(__file__))


def solve(n, pairs, limit=2):
    """pairs: [(a, b)] hücre çiftleri. Tüm kareyi dolduran çözümleri sayar (limit'e kadar)."""
    cells = n * n
    owner = [-1] * cells
    ends = {}
    for i, (a, b) in enumerate(pairs):
        owner[a] = i
        owner[b] = i
        ends[i] = (a, b)
    count = 0
    sol = None

    def nb(c):
        r, k = divmod(c, n)
        if r > 0: yield c - n
        if r < n - 1: yield c + n
        if k > 0: yield c - 1
        if k < n - 1: yield c + 1

    paths = [[a] for a, _ in pairs]

    def dfs(i):
        nonlocal count, sol
        if count >= limit:
            return
        if i == len(pairs):
            if all(o != -1 for o in owner):
                count += 1
                if sol is None:
                    sol = [list(p) for p in paths]
            return
        head = paths[i][-1]
        for m in nb(head):
            if m == ends[i][1]:
                paths[i].append(m)
                dfs(i + 1)
                paths[i].pop()
            elif owner[m] == -1:
                owner[m] = i
                paths[i].append(m)
                dfs(i)
                paths[i].pop()
                owner[m] = -1

    dfs(0)
    return count, sol


def make(n, k, seed):
    rnd = random.Random(seed)
    for _ in range(4000):
        # rastgele tam bölme: Hamilton benzeri yollar üret
        cells = list(range(n * n))
        free = set(cells)
        paths = []
        ok = True
        for _c in range(k):
            if not free:
                ok = False
                break
            start = rnd.choice(sorted(free))
            p = [start]
            free.discard(start)
            target = rnd.randint(max(3, n * n // k - 1), n * n // k + 2)
            while len(p) < target:
                r, c = divmod(p[-1], n)
                opts = [x for x in ((r - 1) * n + c if r > 0 else None, (r + 1) * n + c if r < n - 1 else None,
                                    r * n + c - 1 if c > 0 else None, r * n + c + 1 if c < n - 1 else None)
                        if x is not None and x in free]
                if not opts:
                    break
                m = rnd.choice(opts)
                p.append(m)
                free.discard(m)
            paths.append(p)
        if not ok or any(len(p) < 3 for p in paths):
            continue
        # kalan kareleri komşu yollara ekle
        guard = 0
        while free and guard < 500:
            guard += 1
            c = rnd.choice(sorted(free))
            r, cc = divmod(c, n)
            for p in rnd.sample(paths, len(paths)):
                for end in (0, -1):
                    e = p[end]
                    er, ec = divmod(e, n)
                    if abs(er - r) + abs(ec - cc) == 1:
                        if end == 0: p.insert(0, c)
                        else: p.append(c)
                        free.discard(c)
                        break
                else:
                    continue
                break
        if free:
            continue
        pairs = [(p[0], p[-1]) for p in paths]
        cnt, sol = solve(n, pairs)
        if cnt == 1:
            return pairs, sol
    return None, None


out = []
for n, k, seed in ((4, 3, 7), (5, 4, 11), (5, 4, 29), (6, 5, 5)):
    pairs, sol = make(n, k, seed)
    assert pairs, (n, k, seed)
    out.append({'n': n, 'pairs': [[a, b] for a, b in pairs], 'solution': sol})
    print(n, k, 'tek çözüm')
json.dump(out, open(os.path.join(HERE, 'puzzles_trails.json'), 'w'))
