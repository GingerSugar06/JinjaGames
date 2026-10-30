"""Ana sayfaya 'Açık kaynak' bölümü ekler (Stüdyo'dan önce): GitHub profili https://github.com/JinjaGames ve açık kaynak araçlar.
Bir kez çalıştırılır. Depo bilgileri GitHub'daki README'lerden alındı. Sitede üçüncü taraf isteği olmasın diye GitHub'dan canlı veri
çekilmez, avatar kullanılmaz: kartlar statiktir, bağlantılar dışarı açılır."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'index.html')
t = open(P, encoding='utf8', newline='').read()
if 'id="opensource"' in t:
    raise SystemExit('zaten uygulanmış')
NL = '\r\n' if '\r\n' in t else '\n'
t = t.replace('\r\n', '\n')


def sub1(old, new):
    global t
    assert old in t, old[:80]
    t = t.replace(old, new, 1)


GH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>'

REPOS = [
    ('GinDPI', 'GinDPI', 'Discord, Roblox and Wattpad without a driver',
     'Discord, Roblox ve Wattpad için sürücüsüz',
     'A Windows tool that reaches blocked sites like Discord, Roblox and Wattpad without any driver, and only touches the sites you pick. Everything else goes through untouched.',
     'Discord, Roblox ve Wattpad gibi engelli sitelere sürücü kurmadan ulaşan bir Windows aracı. Yalnızca seçtiğin siteleri etkiler, geri kalan her şey olduğu gibi gider.',
     'Flutter · Windows'),
    ('VoiceScribe', 'Voice Scribe', 'Offline speech-to-text', 'Çevrimdışı konuşmadan metne',
     'Record from the microphone or drop an audio or video file and get a transcript in Turkish, English or auto-detected. The audio never leaves your computer.',
     'Mikrofondan kaydet ya da bir ses veya video dosyası bırak; Türkçe, İngilizce ya da otomatik algılanan bir döküm al. Ses hiçbir zaman bilgisayarından çıkmaz.',
     'Flutter · Windows, macOS'),
    ('FileConverter', 'File Converter', 'Convert files from the right-click menu', 'Sağ tıkla dosya dönüştür',
     'Right-click a file, pick a format and it is converted on your own computer. Nothing is uploaded anywhere.',
     'Bir dosyaya sağ tıkla, formatı seç, dönüştürme kendi bilgisayarında yapılır. Hiçbir yere yükleme yok.',
     'Python · Windows'),
    ('IP_Finder', 'IP Finder', 'Look up an IP address', 'Bir IP adresini sorgula',
     'A small Python tool that shows information about an IP address, yours or someone else\'s.',
     'Kendi ya da başkasının IP adresi hakkında bilgi gösteren küçük bir Python aracı.',
     'Python'),
]
cards = ''
for repo, name, kind_en, kind_tr, en, tr, tags in REPOS:
    cards += '''          <a class="oss-card rv" href="https://github.com/JinjaGames/%s" target="_blank" rel="noopener">
            <span class="oss-path">JinjaGames/%s</span>
            <h3>%s</h3>
            <p class="en">%s</p><p class="tr">%s</p>
            <span class="oss-tags"><span>%s</span><span>MIT</span></span>
            <span class="oss-go"><span class="en i">View on GitHub</span><span class="tr i">GitHub'da gör</span> <span aria-hidden="true">&nearr;</span></span>
          </a>
''' % (repo, repo, name, en, tr, tags)

section = '''  <!-- AÇIK KAYNAK -->
  <section id="opensource" class="blk">
    <div class="wrap">
      <div class="head rv">
        <span class="label"><span class="en i">Open source</span><span class="tr i">Açık kaynak</span></span>
        <div>
          <h2 class="en">Built in the open, <span class="hl">free to use.</span></h2>
          <h2 class="tr">Açıkta yapılan, <span class="hl">özgürce kullanılan.</span></h2>
          <p class="en">Between games I build small desktop tools and publish them on GitHub under the MIT license. Read the code, use it, change it, make it better.</p>
          <p class="tr">Oyunların arasında küçük masaüstü araçları yapıp GitHub'da MIT lisansıyla yayınlıyorum. Kodu oku, kullan, değiştir, daha iyisini yap.</p>
        </div>
      </div>
      <div class="oss">
        <a class="oss-main rv" href="https://github.com/JinjaGames/PlayHub" target="_blank" rel="noopener">
          <span class="oss-bar" aria-hidden="true"><i></i><i></i><i></i><span>JinjaGames/PlayHub</span></span>
          <span class="oss-body">
            <span class="oss-star"><span class="en i">Featured</span><span class="tr i">Öne çıkan</span></span>
            <h3>Play Hub</h3>
            <p class="en">One Steam toolbox for Windows in a clean, light window: manage your playtime and your achievements, and see the hours add up. It replaces my earlier Idle Hub, Hour Booster and Trophy Room with a single app.</p>
            <p class="tr">Windows için, temiz ve hafif bir pencerede tek Steam araç kutusu: oyun süreni ve başarımlarını yönet, saatlerin nasıl biriktiğini gör. Önceki Idle Hub, Hour Booster ve Trophy Room araçlarının yerini tek bir uygulamayla alır.</p>
            <span class="oss-tags"><span>Flutter · Windows 10/11</span><span>MIT</span><span class="en i">English · Türkçe</span><span class="tr i">İngilizce · Türkçe</span></span>
            <span class="oss-cmd"><b>$</b> git clone github.com/JinjaGames/PlayHub<i class="cur" aria-hidden="true"></i></span>
          </span>
        </a>
        <div class="oss-grid">
''' + cards + '''        </div>
      </div>
      <div class="oss-foot rv">
        <span class="oss-mark">%s</span>
        <div class="oss-ft"><b>github.com/JinjaGames</b><span class="en">Every repository, and everything new, lives here.</span><span class="tr">Bütün depolar ve yeni çıkan her şey burada.</span></div>
        <a class="btn p" href="https://github.com/JinjaGames" target="_blank" rel="noopener"><span class="en i">Visit my GitHub</span><span class="tr i">GitHub'ıma git</span> <span class="arw">&nearr;</span></a>
      </div>
    </div>
  </section>

''' % GH

css = '''/* Açık kaynak bölümü */
.oss{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;align-items:stretch}
.oss-main{display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#0F1214;color:#E9E6E2;border:1px solid #232830;box-shadow:var(--shadow-1);transition:transform .45s var(--ease),box-shadow .45s var(--ease)}
.oss-main:hover{transform:translateY(-5px);box-shadow:var(--shadow-2)}
.oss-bar{display:flex;align-items:center;gap:7px;padding:13px 16px;background:#171B20;border-bottom:1px solid #232830;font-family:var(--f-mono);font-size:12px;color:#8C95A1}
.oss-bar i{width:11px;height:11px;border-radius:50%;background:#3A424D}
.oss-bar i:nth-child(1){background:#F16A5C}.oss-bar i:nth-child(2){background:#E3B341}.oss-bar i:nth-child(3){background:#45D49A}
.oss-bar span{margin-left:10px}
.oss-body{display:flex;flex-direction:column;gap:14px;padding:34px 34px 30px;flex:1}
.oss-star{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#F16A5C}
.oss-main h3{font-size:clamp(40px,4.6vw,60px);line-height:.95;letter-spacing:-.04em;color:#fff}
.oss-main p{font-size:16.5px;line-height:1.65;color:rgba(233,230,226,.8);max-width:520px}
.oss-tags{display:flex;flex-wrap:wrap;gap:8px}
.oss-tags span{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.04em;padding:5px 11px;border-radius:999px;border:1px solid currentColor;opacity:.75}
.oss-cmd{margin-top:auto;padding:14px 16px;border-radius:8px;background:#0A0C0E;border:1px solid #232830;font-family:var(--f-mono);font-size:13.5px;color:#C9D1D9;overflow-x:auto;white-space:nowrap}
.oss-cmd b{color:#45D49A;margin-right:8px}
.oss-cmd .cur{display:inline-block;width:8px;height:15px;margin-left:4px;vertical-align:-2px;background:#C9D1D9;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.oss-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.oss-card{display:flex;flex-direction:column;gap:10px;padding:24px 22px 20px;border-radius:14px;background:var(--surface);border:1px solid var(--line);transition:transform .4s var(--ease),border-color .3s,box-shadow .4s var(--ease)}
.oss-card:hover{transform:translateY(-5px);border-color:var(--brand);box-shadow:var(--shadow-1)}
.oss-path{font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;color:var(--ink-3)}
.oss-card h3{font-size:24px;letter-spacing:-.025em}
.oss-card p{font-size:14.5px;line-height:1.6;color:var(--ink-2)}
.oss-card .oss-tags span{color:var(--ink-3)}
.oss-go{margin-top:auto;padding-top:6px;font-weight:600;font-size:14.5px;color:var(--brand)}
.oss-go span[aria-hidden]{display:inline-block;transition:transform .3s var(--ease)}
.oss-card:hover .oss-go span[aria-hidden]{transform:translate(3px,-3px)}
.oss-foot{margin-top:14px;display:flex;align-items:center;gap:22px;flex-wrap:wrap;padding:24px 28px;border:1px solid var(--line-2);border-radius:14px;background:linear-gradient(120deg,rgba(var(--brand-rgb),.07),transparent 55%),var(--surface)}
.oss-mark{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:var(--bg);flex-shrink:0}
.oss-mark svg{width:26px;height:26px;fill:currentColor}
.oss-ft{flex:1 1 260px;min-width:0}
.oss-ft b{display:block;font-family:var(--f-mono);font-size:16px;font-weight:600;letter-spacing:-.01em}
.oss-ft span{color:var(--ink-2);font-size:15px}
@media(max-width:960px){.oss{grid-template-columns:1fr}}
@media(max-width:680px){.oss-grid{grid-template-columns:1fr}.oss-body{padding:26px 22px 24px}.oss-foot{padding:20px}.oss-foot .btn{width:100%;justify-content:center}}
'''
sub1('.allgames{margin-top:44px;', css + '.allgames{margin-top:44px;')
sub1('  <!-- STÜDYO -->', section + '  <!-- STÜDYO -->')
# JSON-LD ve alt bilgi
sub1('"sameAs":["https://www.instagram.com/jinja.games/",', '"sameAs":["https://github.com/JinjaGames","https://www.instagram.com/jinja.games/",')
i = t.rindex('      <a href="https://www.instagram.com/jinja.games/" target="_blank" rel="noopener">Instagram</a>\n')
t = t[:i] + '      <a href="https://github.com/JinjaGames" target="_blank" rel="noopener">GitHub</a>\n' + t[i:]
open(P, 'w', encoding='utf8', newline='').write(t.replace('\n', NL))
print('ok')
