/* BaneBender mod wikisi: elle yazılmış içerik.
   Kaynak: her modun CurseForge açıklaması ve mod dosyalarının kendisi (dil dosyaları, dokular).
   Sayılar ve adlar oradan alındı; açıklamada olmayan bir özellik buraya yazılmaz.
   İndirme sayıları 12 Ekim 2026 tarihli CurseForge profilinden. */
window.BB_PROFILE = {
  handle: 'BaneBender',
  curseforge: 'https://www.curseforge.com/members/banebender/projects',
  instagram: 'https://www.instagram.com/banebender/',
  youtube: 'https://www.youtube.com/@banebender',
  bio: 'Here’s mod in your eye',
  downloads: '1.3K',
  asOf: '2026-10-12'
};

window.BB_CATS = [
  { id: 'all', en: 'All mods', tr: 'Tüm modlar' },
  { id: 'adventure', en: 'Bosses & structures', tr: 'Boss ve yapılar' },
  { id: 'creatures', en: 'Creatures', tr: 'Yaratıklar' },
  { id: 'magic', en: 'Magic & myth', tr: 'Büyü ve mit' },
  { id: 'tech', en: 'Tech & storage', tr: 'Teknoloji ve depo' },
  { id: 'utility', en: 'Quality of life', tr: 'Kolaylık' },
  { id: 'loot', en: 'Loot & economy', tr: 'Ganimet ve ekonomi' },
  { id: 'horror', en: 'Horror', tr: 'Korku' }
];

window.BB_MODS = [
/* ------------------------------------------------------------------ */
{
  slug: 'pale-contagion', cats: ['creatures', 'horror', 'adventure'], dl: 7, released: '2026-10-09',
  tag: { en: 'A parasite outbreak that spreads further every day.', tr: 'Her gün biraz daha yayılan bir parazit salgını.' },
  lede: {
    en: 'The infection starts where the pale research facilities stand and creeps outward day after day, corrupting soil, sand and stone and darkening the world as it goes. Almost nothing that lives is safe: zombies, villagers, cows and creepers all have infected, biome specific variants.',
    tr: 'Enfeksiyon soluk araştırma tesislerinin olduğu yerde başlar ve gün geçtikçe dışarı doğru sürünür; toprağı, kumu ve taşı bozar, geçtiği yerde dünyayı karartır. Yaşayan hemen hiçbir şey güvende değil: zombilerin, köylülerin, ineklerin ve creeper’ların biyoma özgü enfekte türleri var.'
  },
  sections: [
    { h: { en: 'How the outbreak works', tr: 'Salgın nasıl işler' }, list: [
      { en: 'The infection spreads further every day: the longer a world runs, the more of it turns.', tr: 'Enfeksiyon her gün biraz daha yayılır: dünya ne kadar uzun yaşarsa o kadar fazlası döner.' },
      { en: 'Infected ground corrupts soil, sand and stone and darkens the world around it.', tr: 'Enfekte zemin toprağı, kumu ve taşı bozar, çevresindeki dünyayı karartır.' },
      { en: 'Nearly every creature has an infected variant that matches its biome.', tr: 'Neredeyse her yaratığın, biyomuna uyan enfekte bir türü var.' },
      { en: 'On top of the infected mobs come hundreds of parasite species and their bosses.', tr: 'Enfekte yaratıkların üstüne yüzlerce parazit türü ve onların boss’ları gelir.' }
    ] },
    { h: { en: 'Pale research facilities', tr: 'Soluk araştırma tesisleri' }, p: {
      en: 'The outbreak broke loose in the labs. Facilities range from a small field outpost to a domed campus, with loot inside and parasites roaming free. They are both the most dangerous and the most rewarding places in an infected world.',
      tr: 'Salgın laboratuvarlarda patlak verdi. Tesisler küçük bir saha karakolundan kubbeli bir kampüse kadar uzanır; içeride ganimet, ortalıkta serbestçe dolaşan parazitler vardır. Enfekte bir dünyanın hem en tehlikeli hem de en kazançlı yerleridir.' } },
    { h: { en: 'Fighting back', tr: 'Karşı koymak' }, p: {
      en: 'Weapons, armour, machines and recipes of its own give you the tools to push the infection back. The item list below is a sample taken straight from the mod’s textures.',
      tr: 'Kendine ait silahlar, zırhlar, makineler ve tarifler enfeksiyonu geri itmen için araç verir. Aşağıdaki eşya listesi doğrudan modun dokularından alınmış bir örnektir.' } }
  ],
  bestiary: { title: { en: 'A few of the infected and the parasites', tr: 'Enfektelerden ve parazitlerden birkaçı' }, limit: 48, sample: true }
},
/* ------------------------------------------------------------------ */
{
  slug: 'frontier-structures', cats: ['adventure'], dl: 173, released: '2026-10-07',
  tag: { en: '70 hand built structures, ten bosses and the roads between them.', tr: 'Elle kurulmuş 70 yapı, on boss ve aralarındaki yollar.' },
  lede: {
    en: 'Frontier makes exploring the world worth the walk. Seventy hand built structures adapt to the terrain and take their wood and stone from the biome, and ten bosses wait in lairs ringed by camps and linked by paths. It needs no other mods.',
    tr: 'Frontier, dünyayı keşfetmeyi yürümeye değer kılar. Elle kurulmuş yetmiş yapı araziye uyum sağlar, ahşabını ve taşını biyomdan alır; on boss ise etrafı kamplarla çevrili, yollarla birbirine bağlı inlerinde bekler. Başka hiçbir moda ihtiyaç duymaz.'
  },
  sections: [
    { h: { en: 'Structures that feel lived in', tr: 'İçinde yaşanmış gibi yapılar' }, list: [
      { en: 'Interiors are alive, with villagers, animals, furniture and traps.', tr: 'İç mekânlar canlı: köylüler, hayvanlar, mobilyalar ve tuzaklar.' },
      { en: 'Every chest, barrel, furnace, smoker, blast furnace, dispenser and brewing stand is filled to suit the place: ore for the blacksmith, meals for the inn, fish for the dock, potion ingredients for the alchemist.', tr: 'Her sandık, varil, fırın, tütsüleyici, maden ocağı, fırlatıcı ve iksir standı yere uygun doldurulmuştur: demirciye cevher, hana yemek, iskeleye balık, simyacıya iksir malzemesi.' },
      { en: 'Each structure picks its wood and stone from the biome it stands in.', tr: 'Her yapı ahşabını ve taşını bulunduğu biyomdan seçer.' }
    ] },
    { h: { en: 'All 70 structures', tr: '70 yapının tamamı' }, chips: 'structures' },
    { h: { en: 'Testing and commands', tr: 'Test ve komutlar' }, table: {
      cols: [{ en: 'Command', tr: 'Komut' }, { en: 'What it does', tr: 'Ne yapar' }],
      rows: [
        ['/frontier tp <id>', { en: 'Teleports you to the nearest structure of that type.', tr: 'Seni o türdeki en yakın yapıya ışınlar.' }],
        ['/frontier place <id>', { en: 'Builds a structure where you stand.', tr: 'Durduğun yere bir yapı kurar.' }],
        ['/frontier boss <id>', { en: 'Summons a boss.', tr: 'Bir boss çağırır.' }],
        ['/frontier list', { en: 'Lists every structure id.', tr: 'Bütün yapı kimliklerini listeler.' }]
      ] }, note: { en: 'The “Structure Mod” world type sits next to Superflat on the Create World screen: normal terrain, only this mod’s structures, placed more densely. Every boss, creature and weapon is in the Frontier creative tab, spawn eggs included.', tr: '“Structure Mod” dünya tipi, Dünya Oluştur ekranında Superflat’ın yanında durur: normal arazi, yalnız bu modun yapıları, daha sık yerleştirilmiş. Bütün boss’lar, yaratıklar ve silahlar, yumurtalar dahil, Frontier yaratıcı sekmesinde.' } }
  ],
  bosses: {
    title: { en: 'Ten bosses, ten ways to kill them', tr: 'On boss, onları yenmenin on yolu' },
    intro: { en: 'Each boss has a custom model, full animation, a boss bar, a second phase at half health and its own set of attacks. Ordinary blows are heavily reduced, so you have to find the opening. Hints appear on the action bar.', tr: 'Her boss’un özel modeli, tam animasyonu, can çubuğu, canı yarıya inince ikinci evresi ve kendine ait saldırıları var. Sıradan vuruşlar büyük ölçüde azaltılır; açığı bulman gerekir. İpuçları eylem çubuğunda görünür.' },
    list: [
      { e: 0, lair: 'Sun Pyramid', how: { en: 'Knock his scarab bolts back at him.', tr: 'Bok böceği oklarını ona geri savur.' }, drop: 'Sunbrand Khopesh', power: { en: 'Solar Flare: burns, blinds and hurls back everything close.', tr: 'Güneş Patlaması: yakındaki her şeyi yakar, kör eder ve geri savurur.' } },
      { e: 1, lair: 'Dread Castle', how: { en: 'Hit his back, or lure his charge into a wall.', tr: 'Sırtından vur ya da hücumunu bir duvara çek.' }, drop: 'Dread Greatblade', power: { en: 'Dread Dash: lunge forward, cutting down what is in the way.', tr: 'Dehşet Atılışı: öne atıl, yoldakileri biç.' } },
      { e: 2, lair: 'Elder Grove', how: { en: 'Axes and fire.', tr: 'Balta ve ateş.' }, drop: 'Heartwood Blade', power: { en: 'Bloom: heals you and allies, tangles enemies.', tr: 'Çiçeklenme: seni ve dostlarını iyileştirir, düşmanları dolar.' } },
      { e: 3, lair: 'Frost Citadel', how: { en: 'Melt his ice carapace with fire, lava or explosions.', tr: 'Buz kabuğunu ateş, lav ya da patlamayla erit.' }, drop: 'Glacier Cleaver', power: { en: 'Frost Nova: a burst of cold that freezes all around.', tr: 'Ayaz Novası: etraftaki her şeyi donduran soğuk patlaması.' } },
      { e: 4, lair: 'Bog Throne', how: { en: 'Strike his throat while his mouth is open.', tr: 'Ağzı açıkken boğazına vur.' }, drop: 'Mire Fang', power: { en: 'Bog Cloud: a lingering cloud of poison.', tr: 'Bataklık Bulutu: kalıcı bir zehir bulutu.' } },
      { e: 5, lair: 'Spinner’s Lair', how: { en: 'Light her lair with torches, lanterns or glowstone.', tr: 'İnini meşale, fener ya da ışık taşıyla aydınlat.' }, drop: 'Venomstinger', power: { en: 'Web Snare: webs and poisons every enemy nearby.', tr: 'Ağ Tuzağı: yakındaki her düşmanı ağa sarar ve zehirler.' } },
      { e: 6, lair: 'Wyvern Roost', how: { en: 'Shoot her wings with arrows while she hovers.', tr: 'Havada asılı dururken kanatlarına ok at.' }, drop: 'Wyrmflame Edge', power: { en: 'Dragon’s Breath: three fireballs in a fan.', tr: 'Ejder Nefesi: yelpaze biçiminde üç ateş topu.' } },
      { e: 7, lair: 'Jade Naga Temple', how: { en: 'Raise a shield against her gaze so it turns back on her.', tr: 'Bakışına kalkan kaldır, bakışı ona geri dönsün.' }, drop: 'Serpent’s Kiss', power: { en: 'Petrifying Gaze: whatever you look at turns to stone.', tr: 'Taşlaştıran Bakış: baktığın şey taşa döner.' } },
      { e: 8, lair: 'Kraken’s Sunken Temple', how: { en: 'Only a trident pierces her hide.', tr: 'Derisini yalnız üç dişli mızrak deler.' }, drop: 'Tidebreaker', power: { en: 'Tidal Wave: throws every enemy around you away.', tr: 'Gelgit Dalgası: etrafındaki her düşmanı uzağa savurur.' } },
      { e: 9, lair: 'Lich Crypt', how: { en: 'Smash his phylacteries first.', tr: 'Önce ruh kaplarını parçala.' }, drop: 'Soulreaper', power: { en: 'Soul Harvest: drinks life from every enemy close by.', tr: 'Ruh Hasadı: yakındaki her düşmandan can emer.' } }
    ],
    outro: { en: 'Every boss weapon has an effect on each hit and an active power on right click, with a 20 second cooldown. Bosses also drop diamonds, emeralds and themed loot. Each lair has its own creature: the Tomb Mummy, Hollow Squire, Thornling, Rime Hound, Bog Leaper, Lair Weaver, Ember Whelp, Jade Viper, Brine Wretch and Crypt Acolyte. They keep spawning inside the lair, and the bosses call them in during the fight.', tr: 'Her boss silahının her vuruşta bir etkisi ve sağ tıkta 20 saniye bekleme süreli bir gücü var. Boss’lar elmas, zümrüt ve temaya uygun ganimet de bırakır. Her inin kendi yaratığı var: Mezar Mumyası, Boş Silahtar, Dikenli Fidan, Kırağı Köpeği, Bataklık Sıçrayıcı, Yuva Dokumacısı, Kor Yavrusu, Yeşim Engerek, Tuzlu Sefil ve Mezar Yardımcısı. İnde doğmaya devam ederler ve boss’lar dövüş sırasında onları yardıma çağırır.' }
  }
},
/* ------------------------------------------------------------------ */
{
  slug: 'pantheon-of-legends', cats: ['magic', 'adventure'], dl: 65, released: '2026-10-04',
  tag: { en: 'Turkic and Greek mythology: 15 animated gods and legends.', tr: 'Türk ve Yunan mitolojisi: animasyonlu 15 tanrı ve efsane.' },
  lede: {
    en: 'Mythos brings myth themed boss fights, structures and gear from two mythologies, with more to come. Each of the 15 bosses has eight custom animated attacks, its own battle theme and a death fanfare, and each has a weakness and a special finishing condition you have to work out.',
    tr: 'Mythos, iki mitolojiden mit temalı boss dövüşleri, yapılar ve teçhizat getiriyor; daha fazlası yolda. 15 boss’un her birinin özel animasyonlu sekiz saldırısı, kendi savaş müziği ve ölüm fanfarı var; hepsinin bir zayıf noktası ve senin çözmen gereken özel bir bitiriş koşulu bulunuyor.'
  },
  sections: [
    { h: { en: 'Structures and roads', tr: 'Yapılar ve yollar' }, p: { en: 'Every boss waits in its own structure, and roads and camps lead up to it. Each boss also comes with its own kind of guard creature.', tr: 'Her boss kendi yapısında bekler; oraya yollar ve kamplar götürür. Her boss’un kendine özgü bir muhafız yaratığı da vardır.' } },
    { h: { en: 'The 15 shrines', tr: '15 tapınak' }, chips: 'structures' },
    { h: { en: 'Loot and powers', tr: 'Ganimet ve güçler' }, list: [
      { en: 'Bosses drop materials, hearts, weapons, charms, potions and full armour sets with set bonuses.', tr: 'Boss’lar malzeme, kalp, silah, tılsım, iksir ve set bonuslu tam zırh takımları bırakır.' },
      { en: 'Hearts craft into powerful cores, and each realm ends in a transcendent final weapon and talisman.', tr: 'Kalpler güçlü çekirdeklere dönüşür; her diyar aşkın bir son silah ve tılsımla biter.' },
      { en: 'Weapons, staffs and talismans have active powers on cooldowns: calling lightning, tidal waves, curses, arrow barrages and charming enemies.', tr: 'Silahların, asaların ve tılsımların bekleme süreli aktif güçleri var: yıldırım çağırmak, gelgit dalgaları, lanetler, ok yağmurları ve düşmanları büyülemek.' },
      { en: 'Item rarities run Common, Rare, Epic, Legendary, Mythic and Transcendent.', tr: 'Eşya nadirlikleri: Sıradan, Nadir, Destansı, Efsanevi, Mitik ve Aşkın.' }
    ] }
  ],
  bosses: {
    title: { en: 'Gods and legends, and how they fall', tr: 'Tanrılar, efsaneler ve nasıl düştükleri' },
    intro: { en: 'The hints below come from the mod itself: each one is what the game tells you in the middle of the fight.', tr: 'Aşağıdaki ipuçları modun kendisinden: her biri dövüşün ortasında oyunun sana söylediği şey.' },
    realms: [
      { name: { en: 'Turkic realm', tr: 'Türk diyarı' }, list: [
        { e: 0, lair: 'Tulpar’s Steppe Shrine', how: { en: 'It glides over blades. Shoot its wings with arrows while it flies, and bring it to the ground for the last blow.', tr: 'Kılıçların üstünden süzülür. Uçarken kanatlarına ok at; son darbe için onu yere indir.' } },
        { e: 1, lair: 'Asena’s Moonlit Den', how: { en: 'Her pack shields her. Cut down the wolf headed warriors first; she cannot fall while her pack lives.', tr: 'Sürüsü onu korur. Önce kurt başlı savaşçıları indir; sürüsü yaşarken düşmez.' } },
        { e: 2, lair: 'Tepegöz Cavern', how: { en: 'His hide is like a cliff. Only an arrow or spell in his eye hurts him; blind him for the final blow.', tr: 'Derisi yar gibi. Onu yalnız gözüne isabet eden ok ya da büyü yaralar; son darbe için kör et.' } },
        { e: 3, lair: 'House of the Al Karısı', how: { en: 'She fears iron. Only an iron blade truly cuts her, and only cold iron finishes her.', tr: 'Demirden korkar. Onu gerçekten yalnız demir kılıç keser, bitiren de soğuk demirdir.' } },
        { e: 4, lair: 'Yelbeğen’s Storm Peak', how: { en: 'Stand beside a lightning rod when she calls her lightning, and overload her with her own storm.', tr: 'Yıldırımını çağırdığında bir paratonerin yanında dur, onu kendi fırtınasıyla aşırı yükle.' } },
        { e: 5, lair: 'Abra’s Sunken Lake', how: { en: 'The water guards her. Lure her out onto dry land, where she gasps.', tr: 'Su onu korur. Onu kuru toprağa çek; orada nefessiz kalır.' } },
        { e: 6, lair: 'Arçura’s Dark Grove', how: { en: 'Bark turns blades. Use an axe or fire.', tr: 'Kabuğu kılıcı döndürür. Balta ya da ateş kullan.' } },
        { e: 7, lair: 'Palace of Şahmaran', how: { en: 'Circle round and strike her back, or turn her gaze with a raised shield. The queen falls only to a blow from behind.', tr: 'Etrafından dolanıp sırtından vur ya da kaldırdığın kalkanla bakışını geri çevir. Kraliçe yalnız arkadan gelen darbeyle düşer.' } }
      ] },
      { name: { en: 'Greek realm', tr: 'Yunan diyarı' }, list: [
        { e: 8, lair: 'Zeus’s Olympus Peak', how: { en: 'Strike when he has thrown his thunderbolt or crashed to the earth; turn his thunderbolt back on him.', tr: 'Yıldırımını fırlattığında ya da yere çakıldığında vur; yıldırımını ona geri çevir.' } },
        { e: 9, lair: 'Palace of Hera', how: { en: 'Her curse weighs on your blows. Drink milk to lift it, and strike while her veil is down.', tr: 'Laneti vuruşlarına çöker. Kaldırmak için süt iç, peçesi indiğinde vur.' } },
        { e: 10, lair: 'Poseidon’s Sea Temple', how: { en: 'Lure him out of the water and wait until he has spent a wave. Only a trident finishes the god of the sea.', tr: 'Onu sudan çıkar ve bir dalgayı harcamasını bekle. Deniz tanrısını yalnız üç dişli mızrak bitirir.' } },
        { e: 11, lair: 'Gate of Hades', how: { en: 'Darkness shields him: bring light, and he will try to put it out.', tr: 'Karanlık onu korur: ışık getir, o da söndürmeye çalışacak.' } },
        { e: 12, lair: 'Athena’s Parthenon', how: { en: 'The Aegis stops everything from the front. Split it with an axe, or strike from behind.', tr: 'Aegis önden gelen her şeyi durdurur. Baltayla yar ya da arkadan vur.' } },
        { e: 13, lair: 'Apollon’s Delphi', how: { en: 'He slips every sword. Only an arrow finishes the god of light.', tr: 'Her kılıçtan sıyrılır. Işık tanrısını yalnız ok bitirir.' } },
        { e: 14, lair: 'Aphrodite’s Rose Garden', how: { en: 'Block her gaze with a shield or a carved pumpkin. To finish her, wear the pumpkin.', tr: 'Bakışını kalkanla ya da oyulmuş balkabağıyla engelle. Bitirmek için balkabağını giy.' } }
      ] }
    ]
  }
},
/* ------------------------------------------------------------------ */
{
  slug: 'towers', cats: ['adventure'], dl: 40, released: '2026-10-04',
  tag: { en: 'Nine unbreakable towers, rising hazards and a boss on every roof.', tr: 'Kırılmaz dokuz kule, yükselen tehlikeler ve her çatıda bir boss.' },
  lede: {
    en: 'Nine huge towers stand across the dimensions: three in the Overworld, three in the Nether and three in the End. Every floor is full of spawners and holds a chest, and the top floor is an open roof where an animated boss waits with its own attacks and beams.',
    tr: 'Boyutlara yayılmış dokuz dev kule: üçü Overworld’de, üçü Nether’da, üçü End’de. Her kat spawner’larla dolu ve birer sandık taşıyor; en üst kat açık bir çatı ve orada kendi saldırıları ve ışınlarıyla animasyonlu bir boss bekliyor.'
  },
  sections: [
    { h: { en: 'The gate', tr: 'Kapı' }, p: { en: 'Each tower has its own unbreakable gate out front. Look at it and it shows the tower’s name, floor count and danger; press E or right click to step inside. The tower itself cannot be damaged.', tr: 'Her kulenin önünde kendine ait kırılmaz bir kapı var. Ona baktığında kulenin adını, kat sayısını ve tehlikesini gösterir; içeri girmek için E’ye bas ya da sağ tıkla. Kulenin kendisine zarar verilemez.' } },
    { h: { en: 'All nine towers', tr: 'Dokuz kulenin tamamı' }, towers: true },
    { h: { en: 'Rewards', tr: 'Ödüller' }, p: { en: 'When a boss falls, its hazard ends and a loot chest appears on the roof. Each boss also drops its own gear: shards, a tool and armour set crafted from those shards, and a unique weapon (warhammer, trident, scythe, katana, staff and more) with a right click power. The End towers spawn six creatures that exist only there: the Void Stalker, Chorus Hopper, Rift Wisp, Purpur Guard, Obsidian Crawler and Eclipse Hound.', tr: 'Bir boss düştüğünde tehlikesi biter ve çatıda bir ganimet sandığı belirir. Her boss kendi teçhizatını da bırakır: parçalar, o parçalardan yapılan alet ve zırh seti ve sağ tık gücü olan eşsiz bir silah (savaş çekici, üç dişli mızrak, tırpan, katana, asa ve daha fazlası). End kuleleri yalnız orada var olan altı yaratık doğurur: Boşluk Avcısı, Korus Sıçrayıcı, Yarık Ruhu, Purpur Muhafız, Obsidyen Sürüngeni ve Tutulma Tazısı.' } },
    { h: { en: 'Placing towers', tr: 'Kule yerleştirme' }, p: { en: 'Towers can be placed anywhere with /towers place or /place structure, and the Nether and End towers also work in the Overworld.', tr: 'Kuleler /towers place ya da /place structure ile her yere yerleştirilebilir; Nether ve End kuleleri Overworld’de de çalışır.' } }
  ],
  towerList: [
    { dim: 'Overworld', name: 'Warden’s Keep', floors: 5, boss: 'The Stone Warden', hz: { en: 'Spawners guard every floor.', tr: 'Her katı spawner’lar korur.' }, img: null },
    { dim: 'Overworld', name: 'Rusted Spire', floors: 10, boss: 'The Rust Colossus', hz: { en: 'Rust eats your armour: every piece loses 1 durability every 2 seconds until the Colossus falls.', tr: 'Pas zırhını yer: Kolos düşene kadar her parça 2 saniyede bir 1 dayanıklılık kaybeder.' } },
    { dim: 'Overworld', name: 'Tidal Spire', floors: 10, boss: 'The Tide Sovereign', hz: { en: 'Water seeps up from the ground floor, slowly but without end.', tr: 'Su zemin kattan yavaşça ama durmaksızın yükselir.' } },
    { dim: 'Nether', name: 'Ember Keep', floors: 5, boss: 'The Ember Executioner', hz: { en: 'Nether brick, guarded by blazes and wither skeletons.', tr: 'Nether tuğlası; blaze’ler ve wither iskeletleri korur.' }, img: 'ember' },
    { dim: 'Nether', name: 'Magma Spire', floors: 10, boss: 'The Magma Tyrant', hz: { en: 'The heat cracks armour: 5 durability every 2 seconds.', tr: 'Sıcak zırhı çatlatır: 2 saniyede bir 5 dayanıklılık.' }, img: 'magma' },
    { dim: 'Nether', name: 'Inferno Spire', floors: 10, boss: 'The Inferno Overlord', hz: { en: 'Lava wells up from the ground floor, faster than any water.', tr: 'Lav zemin kattan, her sudan daha hızlı yükselir.' }, img: 'inferno' },
    { dim: 'End', name: 'Purpur Keep', floors: 7, boss: 'The Void Sentinel', hz: { en: 'Creatures of the End pour from the spawners.', tr: 'Spawner’lardan End yaratıkları akar.' }, img: 'purpur' },
    { dim: 'End', name: 'Crystal Spire', floors: 12, boss: 'The Crystal Regent', hz: { en: 'The crystals drain armour: 8 durability every 3 seconds.', tr: 'Kristaller zırhı emer: 3 saniyede bir 8 dayanıklılık.' }, img: 'crystal' },
    { dim: 'End', name: 'Abyssal Tower', floors: 12, boss: 'The Abyss Devourer', hz: { en: 'The void itself rises from the ground and tears at all it touches.', tr: 'Boşluğun kendisi yerden yükselir, dokunduğu her şeyi parçalar.' }, img: 'abyss' }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'elemental-arcana', cats: ['magic'], dl: 82, released: '2026-10-03',
  tag: { en: 'Six elements, 150+ spells, wands, wizards and towers.', tr: 'Altı element, 150+ büyü, asalar, büyücüler ve kuleler.' },
  lede: {
    en: 'A complete magic system built on six elements: Water, Air, Fire, Earth, Cursed and Wood. Nothing is unlocked at the start. You learn spells from books and cast them with a wand of the right tier, and every spell has its own animation: tidal waves, falling meteors, tornadoes, rising spikes and much more.',
    tr: 'Altı element üzerine kurulmuş eksiksiz bir büyü sistemi: Su, Hava, Ateş, Toprak, Lanet ve Ağaç. Başlangıçta hiçbir şey açık değil. Büyüleri kitaplardan öğrenir, doğru kademede bir asayla yaparsın; her büyünün kendi animasyonu var: gelgit dalgaları, düşen meteorlar, hortumlar, yükselen dikenler ve çok daha fazlası.'
  },
  sections: [
    { h: { en: 'The six elements', tr: 'Altı element' }, elements: true },
    { h: { en: 'Learning spells', tr: 'Büyü öğrenmek' }, list: [
      { en: 'Find spell books in chests, get them as wizard drops, or craft them at the Magic Workbench with an element crystal and a blank tome.', tr: 'Büyü kitaplarını sandıklarda bul, büyücülerden düşür ya da Büyü Tezgâhı’nda bir element kristali ve boş bir ciltle yap.' },
      { en: 'Each element has Apprentice, Adept and Master wands, plus the Arcane wands. Element wands boost the spells of their own element.', tr: 'Her elementin Çırak, Usta ve Üstat asaları var; bir de Gizemli asalar. Element asaları kendi elementinin büyülerini güçlendirir.' },
      { en: 'Spell swords add the element’s effect to melee hits, and while you hold one your spell list turns into that element’s sword arts.', tr: 'Büyü kılıçları yakın dövüş vuruşlarına elementin etkisini ekler; birini tutarken büyü listen o elementin kılıç sanatlarına dönüşür.' }
    ] },
    { h: { en: 'Hand magic (R key)', tr: 'El büyüsü (R tuşu)' }, table: {
      cols: [{ en: 'Spell', tr: 'Büyü' }, { en: 'What it does', tr: 'Ne yapar' }],
      rows: [
        ['Air Scooter', { en: 'Sit on a ball of wind and race along the ground and straight up walls, faster the longer you go straight.', tr: 'Bir rüzgâr topunun üstüne otur; yerde ve dik duvarlarda yarış, düz gittikçe hızlan.' }],
        ['Tidal Surf', { en: 'Ride a wave under your feet, gliding over land and skimming across water.', tr: 'Ayağının altındaki dalgaya bin; karada süzül, suyun üstünde kay.' }],
        ['Flame Jet', { en: 'Burst forward on a jet of flame for a few seconds, burning what you pass.', tr: 'Birkaç saniye bir alev jetiyle öne fırla, geçtiğin yeri yak.' }],
        ['Earth Pillar', { en: 'Stamp the ground and ride a stone pillar six blocks into the air.', tr: 'Yere bas ve bir taş sütunla altı blok havaya yüksel.' }],
        ['Vine Grapple', { en: 'Throw a vine at a block, get pulled to it and hop two blocks up on arrival.', tr: 'Bir bloğa sarmaşık at, ona çekil ve varınca iki blok zıpla.' }],
        ['Shadow Dash', { en: 'Vanish in smoke and step out up to sixteen blocks ahead.', tr: 'Dumanda kaybol ve on altı bloğa kadar ileride belir.' }]
      ] }, note: { en: 'There are also small hand attacks (Water Whip, Air Slap, Fire Flick, Stone Jab, Curse Sting, Thorn Flick) that deal very little damage.', tr: 'Çok az hasar veren küçük el saldırıları da var (Su Kırbacı, Hava Tokadı, Ateş Fiskesi, Taş Yumruğu, Lanet İğnesi, Diken Fiskesi).' } },
    { h: { en: 'Spellbook sample', tr: 'Büyü kitabından örnekler' }, chips: 'spells' },
    { h: { en: 'The world', tr: 'Dünya' }, p: { en: 'The Overworld, Nether and End each get their own coloured element flowers, element ores, magic crystals and tree families (a white special tree in the End, and one tree in thirty carries crystal leaves). Six elemental wizards and five magical structures make exploring worth it: the Wizard Tower, Elemental Shrine, Ruined Library, Ember Sanctum and Void Observatory.', tr: 'Overworld, Nether ve End’in her birinin kendi renkli element çiçekleri, element cevherleri, büyü kristalleri ve ağaç aileleri var (End’de beyaz özel bir ağaç; her otuz ağaçtan biri kristal yapraklı). Altı elementel büyücü ve beş büyülü yapı keşfi değerli kılıyor: Büyücü Kulesi, Elementel Tapınak, Yıkık Kütüphane, Kor Sığınağı ve Boşluk Gözlemevi.' } }
  ],
  bestiary: { title: { en: 'Who you will meet', tr: 'Karşılaşacakların' }, exclude: ['Spell'] }
},
/* ------------------------------------------------------------------ */
{
  slug: 'power-generators', cats: ['tech'], dl: 124, released: '2026-10-03',
  tag: { en: 'Sun, wind, coal and water power, and everything you can run on it.', tr: 'Güneş, rüzgâr, kömür ve su enerjisi; onunla çalışan her şey.' },
  lede: {
    en: 'Build a power grid out of sun, wind, coal and water, then spend that power on gear that never breaks, machines that do your mining and hauling, a storage network, cameras that watch your base and an economy that turns electricity into items. Everything runs on Forge Energy (FE), so it works with Thermal, Mekanism, Immersive Engineering and anything else that speaks FE.',
    tr: 'Güneşten, rüzgârdan, kömürden ve sudan bir enerji şebekesi kur; sonra o enerjiyi hiç kırılmayan teçhizata, kazıyı ve taşımayı senin yerine yapan makinelere, bir depolama ağına, üssünü izleyen kameralara ve elektriği eşyaya çeviren bir ekonomiye harca. Her şey Forge Energy (FE) ile çalışır; Thermal, Mekanism, Immersive Engineering ve FE konuşan her şeyle uyumludur.'
  },
  sections: [
    { h: { en: 'Making power', tr: 'Enerji üretmek' }, table: {
      cols: [{ en: 'Generator', tr: 'Jeneratör' }, { en: 'Output and rules', tr: 'Üretim ve kurallar' }],
      rows: [
        ['Solar Panel V1–V5', { en: '100 to 25,600 FE/t at noon. Needs open sky, drops in rain, nothing at night.', tr: 'Öğle vakti 100 ile 25.600 FE/t. Açık gökyüzü ister, yağmurda düşer, gece üretmez.' }],
        ['Wind Turbine V1–V5', { en: '80 to 20,480 FE/t, works at night too. Faster the higher you build, and in storms.', tr: '80 ile 20.480 FE/t, gece de çalışır. Ne kadar yükseğe kurarsan ve fırtınada daha hızlı.' }],
        ['Coal Generator', { en: '200 FE/t from any furnace fuel. Works underground.', tr: 'Her fırın yakıtından 200 FE/t. Yeraltında çalışır.' }],
        ['Water Generator V1–V3', { en: 'The primitive start, with no energy core in its recipes. A water bucket turns the mill wheel; a pointed dripstone above keeps it topped up.', tr: 'İlkel başlangıç; tariflerinde enerji çekirdeği yok. Bir kova su çarkı döndürür; üstündeki sivri damlataş onu kendiliğinden doldurur.' }]
      ] }, note: { en: 'Every tier is four times the one below and needs the previous tier to craft, so the grid grows step by step.', tr: 'Her kademe bir alttakinin dört katıdır ve yapımı için bir önceki kademe gerekir; şebeke adım adım büyür.' } },
    { h: { en: 'Storing and moving it', tr: 'Depolamak ve taşımak' }, list: [
      { en: 'Energy Bank V1–V5: 100,000 up to 25,600,000 FE, with a comparator output.', tr: 'Enerji Bankası V1–V5: 100.000’den 25.600.000 FE’ye, karşılaştırıcı çıkışlı.' },
      { en: 'Energy Cable: 100,000 FE/t. A light chases along the cable in the direction the power flows.', tr: 'Enerji Kablosu: 100.000 FE/t. Kablo boyunca enerjinin aktığı yönde bir ışık koşar.' },
      { en: 'Charging Station (four slots) and Charge Pad (charges every player within three blocks).', tr: 'Şarj İstasyonu (dört yuva) ve Şarj Pedi (üç blok içindeki her oyuncuyu şarj eder).' }
    ] },
    { h: { en: 'Gear that runs on power', tr: 'Enerjiyle çalışan teçhizat' }, list: [
      { en: 'Two generations of tools, armour, sword, shield, bow and crossbow spend FE instead of durability: they never break, they just stop when empty.', tr: 'İki nesil alet, zırh, kılıç, kalkan, yay ve arbalet dayanıklılık yerine FE harcar: asla kırılmaz, boşalınca durur.' },
      { en: 'Jetpack V1–V3 gives creative style flight for as long as it has charge.', tr: 'Jetpack V1–V3, şarjı yettikçe yaratıcı mod tarzı uçuş verir.' },
      { en: 'Free enchantments: conflicting ones become modes you flip with the Y key (Fortune or Silk Touch, Sharpness, Smite or Bane).', tr: 'Bedava büyüler: çakışanlar Y tuşuyla değiştirdiğin modlara dönüşür (Servet ya da İpeksi Dokunuş; Keskinlik, Kutsal ya da Baş Belası).' },
      { en: 'Overcharge above 90%: mining speed doubles, and a full V2 armour set flies and soaks up 95% of incoming damage.', tr: '%90 üstü aşırı şarj: kazı hızı ikiye katlanır; tam V2 zırh seti uçar ve gelen hasarın %95’ini emer.' }
    ] },
    { h: { en: 'Machines, storage and cameras', tr: 'Makineler, depo ve kameralar' }, list: [
      { en: 'Area Breaker: mark a rectangle with frame blocks and it digs everything inside down to bedrock.', tr: 'Alan Kırıcı: çerçeve bloklarla bir dikdörtgen çiz, içindeki her şeyi ana kayaya kadar kazar.' },
      { en: 'Seated Block Breaker V1–V4: sit on it, drive with WASD and break whatever is in front of you.', tr: 'Oturaklı Blok Kırıcı V1–V4: üstüne otur, WASD ile sür, önündeki her şeyi kır.' },
      { en: 'Storage network: an Inventory Connector joins every touching inventory into one store, with a Storage Terminal and a Crafting Terminal that refills its own grid.', tr: 'Depolama ağı: Envanter Bağlayıcı temas eden her envanteri tek depoda birleştirir; Depo Terminali ve kendi ızgarasını dolduran Üretim Terminali ile.' },
      { en: 'Cameras: a Camera Monitor holds 6 or 12 cameras; tap one and look through it, zoom up to 8×.', tr: 'Kameralar: Kamera Monitörü 6 ya da 12 kamera tutar; birine dokun, onun gözünden bak, 8×’e kadar yakınlaştır.' }
    ] },
    { h: { en: 'TF: turning power into items', tr: 'TF: enerjiyi eşyaya çevirmek' }, p: { en: 'TF is the mod’s second currency, and the only way to make it is to burn the power you generated. Around 980 vanilla items are priced, raw materials by hand and everything else from its own recipe. Boss loot is worth nothing, and so is anything made from it, so there are no dupe loops. A TF Terminal locked to an item sells you copies for TF.', tr: 'TF modun ikinci para birimi ve onu üretmenin tek yolu ürettiğin enerjiyi yakmak. Yaklaşık 980 vanilla eşyanın fiyatı var; ham maddeler elle, gerisi kendi tarifinden hesaplanıyor. Boss ganimeti ve ondan yapılan her şey değersiz; böylece kopyalama döngüsü yok. Bir eşyaya kilitlenen TF Terminali sana o eşyanın kopyasını TF karşılığında satar.' } },
    { h: { en: 'Good to know', tr: 'Bilmekte fayda var' }, list: [
      { en: 'Needs to be installed on the server and on every client.', tr: 'Sunucuda ve her istemcide kurulu olması gerekir.' },
      { en: '36 advancements in their own tab; Jade and JEI/EMI tooltip support.', tr: 'Kendi sekmesinde 36 başarı; Jade ve JEI/EMI ipucu desteği.' },
      { en: 'English and Turkish, both written by hand.', tr: 'İngilizce ve Türkçe, ikisi de elle yazılmış.' }
    ] }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'all-irons', cats: ['tech', 'utility'], dl: 116, released: '2026-10-03',
  tag: { en: 'Started as “better chests” and kept going.', tr: '“Daha iyi sandıklar” diye başladı ve durmadı.' },
  lede: {
    en: 'Irones is storage that works for you, furnaces with opinions, twenty nine wands, full tool and armour sets in new materials, and a pile of small things you will not want to play without.',
    tr: 'Irones; senin için çalışan depolama, kendi fikri olan fırınlar, yirmi dokuz asa, yeni malzemelerden tam alet ve zırh setleri ve onsuz oynamak istemeyeceğin bir yığın küçük şey.'
  },
  warn: { en: 'Not compatible with the Punchy mod.', tr: 'Punchy moduyla uyumlu değil.' },
  sections: [
    { h: { en: 'Storage', tr: 'Depolama' }, p: { en: 'Twenty nine tiers of chest, and every one also comes as a barrel and a shulker box, holding up to 108 slots. Most of them do a job: the magnet chest hoovers up dropped items, the compressor packs nine of anything into its block, the blacksmith chest mends your tools, the crystal chest shows what is inside, the ender chest shares one inventory with every other one. Later tiers sort themselves, cook their contents, feed you, bone meal your crops, bottle loose experience and more.', tr: 'Yirmi dokuz kademe sandık; her biri varil ve shulker kutusu olarak da var ve 108 yuvaya kadar tutuyor. Çoğu bir iş yapar: mıknatıs sandık yere düşenleri toplar, sıkıştırıcı dokuz tane olanı bloğuna paketler, demirci sandığı aletlerini onarır, kristal sandık içini gösterir, ender sandığı tek envanteri diğer hepsiyle paylaşır. Üst kademeler kendini düzenler, içindekini pişirir, seni doyurur, ekinlerine kemik tozu atar, ortadaki deneyimi şişeler ve dahası.' } },
    { h: { en: 'Furnaces with opinions', tr: 'Kendi fikri olan fırınlar' }, p: { en: 'Twenty six of them, from a copper furnace a touch quicker than vanilla to a star furnace that cooks instantly and needs no fuel. Fortune doubles ores, coke and soul make coal last longer, frost needs no fuel at all, blaze burns literally anything. Every one switches between furnace, smoker and blast furnace with a button.', tr: 'Yirmi altı tane: vanilladan biraz hızlı bakır fırından anında pişiren ve yakıt istemeyen yıldız fırına kadar. Servet fırını cevheri ikiye katlar, kok ve ruh fırınları kömürü uzatır, ayaz fırını hiç yakıt istemez, blaze fırını kelimenin tam anlamıyla her şeyi yakar. Hepsi bir düğmeyle fırın, tütsüleyici ve maden ocağı arasında geçiş yapar.' } },
    { h: { en: 'Wands', tr: 'Asalar' }, p: { en: 'Construction wands in four tiers with angel, destruction and exchange cores, plus small single job wands with no energy to manage: protection, swapping, moving, illumination, capturing, teleportation, recall, freezing, healing, rotation, growth, harvest, vein, smelting, and five for getting about: hook, leap, phase, ascend and swift.', tr: 'Melek, yıkım ve takas çekirdekli dört kademe inşa asası; bir de enerji derdi olmayan tek işli küçük asalar: koruma, yer değiştirme, taşıma, aydınlatma, yakalama, ışınlanma, geri çağırma, dondurma, iyileştirme, döndürme, büyütme, hasat, damar, eritme ve hareket için beş tane: kanca, sıçrama, faz, yükseliş ve çeviklik.' } },
    { h: { en: 'Tools, armour, weapons and the rest', tr: 'Aletler, zırhlar, silahlar ve gerisi' }, list: [
      { en: 'Full sets in coal, copper, amethyst, lapis, redstone, quartz and emerald, plus compressed versions of all eleven metals.', tr: 'Kömür, bakır, ametist, lapis, kızıltaş, kuvars ve zümrütten tam setler; bir de on bir metalin sıkıştırılmış sürümleri.' },
      { en: 'The All Tool: pickaxe, axe, shovel, hoe and sword in one, in twenty three materials.', tr: 'Hepsi Bir Alet: kazma, balta, kürek, çapa ve kılıç bir arada, yirmi üç malzemede.' },
      { en: 'Daggers, katanas, greatswords, boomerangs, seven shield shapes, longbows, heavy crossbows and spears.', tr: 'Hançerler, katanalar, büyük kılıçlar, bumeranglar, yedi kalkan biçimi, uzun yaylar, ağır arbaletler ve mızraklar.' },
      { en: 'Backpacks with crafting and smelting upgrades, pocket workbenches and anvils, charms, a dowsing rod, a magnet glove and twenty one apples with an ore cow to match each one.', tr: 'Üretim ve eritme yükseltmeli sırt çantaları, cep tezgâhları ve örsleri, tılsımlar, bir maden çubuğu, mıknatıs eldiveni ve her birine uygun bir cevher ineğiyle yirmi bir elma.' }
    ] }
  ],
  bestiary: { title: { en: 'The ore cows (and friends)', tr: 'Cevher inekleri (ve arkadaşları)' }, exclude: ['Thrown Weapon', 'Dynamite', 'Explosive Arrow'] }
},
/* ------------------------------------------------------------------ */
{
  slug: 'hard-mobs-and-bosses', cats: ['adventure', 'creatures'], dl: 249, released: '2026-10-03',
  tag: { en: 'The night was too easy. Not anymore.', tr: 'Gece fazla kolaydı. Artık değil.' },
  lede: {
    en: 'Four elite monsters roam the world alongside the vanilla ones, and three bosses answer only when you call them yourself. Beat them, and their remains become the strongest gear in the game. No dependencies, no GeckoLib: just drop it in.',
    tr: 'Dört seçkin canavar vanilla yaratıklarla birlikte dünyayı dolaşıyor; üç boss ise yalnız sen çağırınca geliyor. Onları yen; kalıntıları oyunun en güçlü teçhizatına dönüşsün. Bağımlılık yok, GeckoLib yok: at ve oyna.'
  },
  sections: [
    { h: { en: 'The elites', tr: 'Seçkinler' }, cards: [
      { t: 'Emberling', en: 'A small fire elemental. Spits embers from range, sets the ground alight as it chases you, and hates the rain. Common in the Nether, rare in the Overworld.', tr: 'Küçük bir ateş elementali. Uzaktan kor tükürür, peşinden koşarken zemini tutuşturur ve yağmurdan nefret eder. Nether’da yaygın, Overworld’de nadir.' },
      { t: 'Bone Brute', en: 'An overgrown skeleton built out of smaller ones. Fires five bone volleys, shrugs off arrows and knockback, and its hits wither. At half health the skeletons it was made from climb out.', tr: 'Küçük iskeletlerden yapılmış devasa bir iskelet. Beşli kemik yaylımı atar, okları ve geri itmeyi umursamaz, vuruşları soldurur. Canı yarıya inince içinden onu oluşturan iskeletler çıkar.' },
      { t: 'Shade Stalker', en: 'Tall, thin, and it will not let you keep your distance. It blinks onto you when you run and slips away when you hit it. Its hits blind.', tr: 'Uzun, ince ve mesafeni korumana izin vermez. Kaçarken üstüne ışınlanır, vurunca sıyrılır. Vuruşları kör eder.' },
      { t: 'Stone Maul', en: 'Slow, armoured and immovable. Every few seconds it slams the ground and throws everyone nearby into the air.', tr: 'Yavaş, zırhlı ve yerinden oynamaz. Birkaç saniyede bir yere vurur ve yakındaki herkesi havaya fırlatır.' }
    ] },
    { h: { en: 'The bosses', tr: 'Boss’lar' }, p: { en: 'Bosses never spawn on their own. Craft a totem from elite drops and use it in the right place: each boss only answers in its own realm. Every boss has a health bar, a second phase at half health, and cannot be cheesed off a ledge.', tr: 'Boss’lar kendiliğinden doğmaz. Seçkinlerin düşürdüklerinden bir totem yap ve doğru yerde kullan: her boss yalnız kendi diyarında cevap verir. Her boss’un can çubuğu, canı yarıya inince ikinci evresi var ve bir çıkıntıdan hileyle indirilemez.' }, cards: [
      { t: 'Ashen Monarch', sub: 'Nether · 400 HP', en: 'Ember volleys at range, a line of flame pillars up close. Enraged, it burns everything around it and calls Emberlings to its side.', tr: 'Uzakta kor yaylımları, yakında bir sıra alev sütunu. Öfkelenince etrafındaki her şeyi yakar ve Emberling’leri yanına çağırır.' },
      { t: 'Frost Sovereign', sub: { en: 'Cold biomes · 320 HP', tr: 'Soğuk biyomlar · 320 HP' }, en: 'Icicle fans you cannot strafe out of, a freezing nova, and an ice cage that locks you in place.', tr: 'Yana kaçamayacağın buz sarkıtı yelpazeleri, donduran bir nova ve seni yerinde kilitleyen bir buz kafes.' },
      { t: 'Void Colossus', sub: 'The End · 500 HP', en: 'Homing void bolts, a gravity pulse that drags you back in, and it blinks straight onto anyone who runs. Enraged, Shade Stalkers join the fight.', tr: 'Hedef arayan boşluk okları, seni geri çeken bir yerçekimi dalgası ve kaçanın üstüne doğrudan ışınlanma. Öfkelenince Shade Stalker’lar dövüşe katılır.' }
    ] },
    { h: { en: 'The rewards', tr: 'Ödüller' }, list: [
      { en: 'Emberblade: every hit burns; every third hit erupts in a ring of fire.', tr: 'Emberblade: her vuruş yakar; her üçüncü vuruş bir ateş halkasıyla patlar.' },
      { en: 'Frostmaul: slow and brutal, it freezes what it hits.', tr: 'Frostmaul: yavaş ve acımasız, vurduğunu dondurur.' },
      { en: 'Void Reaper: steals life, and right click blinks you forward.', tr: 'Void Reaper: can çalar, sağ tık seni ileri ışınlar.' },
      { en: 'Doom Armor: forged from all three boss cores. Above netherite; the full set gives 30% less damage, no fall damage, no burning, plus Strength II, Speed I and Haste II.', tr: 'Doom Zırhı: üç boss çekirdeğinden dövülür. Netherite’in üstünde; tam set %30 daha az hasar, düşme hasarı yok, yanma yok, ayrıca Güç II, Hız I ve Çeviklik II verir.' },
      { en: 'Doom tools mine anything; the Doomblade burns, freezes and drains life, and every third hit sets off fire, frost and void at once.', tr: 'Doom aletleri her şeyi kazar; Doomblade yakar, dondurur ve can emer; her üçüncü vuruşta ateşi, ayazı ve boşluğu aynı anda patlatır.' },
      { en: 'A 14 advancement tree tracks your climb from your first Emberling to the Doomblade.', tr: '14 başarılık bir ağaç, ilk Emberling’inden Doomblade’e kadar tırmanışını izler.' }
    ] }
  ],
  spriteExclude: ['Thorn', 'Storm', 'Blight']
},
/* ------------------------------------------------------------------ */
{
  slug: 'real-animals', cats: ['creatures'], dl: 81, released: '2026-10-08',
  tag: { en: 'Real world wildlife, each in its own biome.', tr: 'Gerçek dünyanın vahşi yaşamı, her biri kendi biyomunda.' },
  lede: {
    en: 'Real Animals fills the gaps in vanilla Minecraft’s wildlife with real world creatures: savanna giants, jungle primates, big cats, polar and shore mammals, birds, reptiles and sea giants, all spawning in fitting biomes.',
    tr: 'Real Animals, vanilla Minecraft’ın vahşi yaşamındaki boşlukları gerçek dünya canlılarıyla dolduruyor: savan devleri, orman primatları, büyük kediler, kutup ve kıyı memelileri, kuşlar, sürüngenler ve deniz devleri; hepsi uygun biyomlarda doğuyor.'
  },
  sections: [
    { h: { en: 'Every animal', tr: 'Her hayvan' }, p: { en: 'Every animal has a custom blocky model and animations, colour variants, and drops such as ivory, horn, fur, fangs and seafood you can cook. Butterflies come in eight colours; scorpions hunt at night and crabs walk sideways.', tr: 'Her hayvanın özel bloklu modeli ve animasyonları, renk çeşitleri ve fildişi, boynuz, kürk, diş, pişirilebilir deniz ürünü gibi düşürdükleri var. Kelebekler sekiz renkte; akrepler gece avlanır, yengeçler yan yürür.' } },
    { h: { en: 'Venom', tr: 'Zehir' }, p: { en: 'Scorpion stingers and venom craft into a poison dagger, poison arrows and poison potions.', tr: 'Akrep iğnesi ve zehri; zehirli hançer, zehirli ok ve zehir iksirine dönüşür.' } },
    { h: { en: 'Good to know', tr: 'Bilmekte fayda var' }, p: { en: 'Spawn eggs for every animal are in the creative tab. English and Turkish included.', tr: 'Her hayvanın yumurtası yaratıcı sekmesinde. İngilizce ve Türkçe dahil.' } }
  ],
  bestiary: { title: { en: 'The full roster', tr: 'Tam liste' } }
},
/* ------------------------------------------------------------------ */
{
  slug: 'variantide', cats: ['creatures'], dl: 7, released: '2026-10-09',
  tag: { en: 'Zombie, Creeper, Skeleton and Spider: 15 variants each, 60 in all.', tr: 'Zombi, Creeper, İskelet ve Örümcek: her birine 15 tür, toplam 60.' },
  lede: {
    en: 'Variantide gives four vanilla mobs fifteen unique variants each. Every variant has its own spawn rules, abilities and effects: frost zombies freeze you, toxic creepers leave radiation clouds, sniper skeletons shoot from far away and web spiders pin you in place.',
    tr: 'Variantide dört vanilla yaratığa onar beşer eşsiz tür veriyor. Her türün kendi doğma kuralları, yetenekleri ve etkileri var: ayaz zombiler seni dondurur, zehirli creeper’lar radyasyon bulutu bırakır, keskin nişancı iskeletler çok uzaktan vurur, ağ örümcekleri seni yerine çiviler.'
  },
  sections: [
    { h: { en: 'Where they spawn', tr: 'Nerede doğarlar' }, p: { en: 'Spawns depend on biome, weather, light and depth, and vanilla mobs still spawn when no variant fits. The rarest variants drop special materials: Toxic Shards, Frozen Cores, Charged Cores, Spider Crystals, Soul Bones and Void Essence.', tr: 'Doğma; biyoma, havaya, ışığa ve derinliğe bağlı; hiçbir tür uymadığında vanilla yaratıklar yine doğar. En nadir türler özel malzeme düşürür: Zehirli Parça, Donmuş Çekirdek, Yüklü Çekirdek, Örümcek Kristali, Ruh Kemiği ve Boşluk Özü.' } },
    { h: { en: 'Status effects', tr: 'Durum etkileri' }, chipsList: ['Freeze', 'Radiation', 'Plague', 'Venom', 'Shock'] },
    { h: { en: 'All 60 variants', tr: '60 türün tamamı' }, variants: true },
    { h: { en: 'Configurable', tr: 'Ayarlanabilir' }, p: { en: 'Every variant’s stats, spawn chance and abilities can be changed in the config file.', tr: 'Her türün değerleri, doğma şansı ve yetenekleri ayar dosyasından değiştirilebilir.' } }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'seraph', cats: ['horror'], dl: 43, released: '2026-10-04',
  tag: { en: 'A dream, a white rabbit and a moon that watches.', tr: 'Bir rüya, beyaz bir tavşan ve izleyen bir ay.' },
  lede: {
    en: 'Find an abandoned church, read the book in its chest, and fall asleep. You wake up with a white rabbit beside a sign, a black screen that says RUN, and the crosses behind you turned upside down. From then on the world is not quite the same.',
    tr: 'Terk edilmiş bir kilise bul, sandığındaki kitabı oku ve uykuya dal. Bir tabelanın yanında beyaz bir tavşanla, KAÇ yazan siyah bir ekranla ve arkanda ters dönmüş haçlarla uyanırsın. O andan sonra dünya pek de aynı değil.'
  },
  sections: [
    { h: { en: 'What changes', tr: 'Neler değişir' }, list: [
      { en: 'Signs appear on trees that only you can see.', tr: 'Ağaçlarda yalnız senin görebildiğin tabelalar belirir.' },
      { en: 'A figure stands crucified in the far fields.', tr: 'Uzak tarlalarda çarmıha gerilmiş bir figür durur.' },
      { en: 'Animals show you what they really are when you strike them.', tr: 'Hayvanlar onlara vurduğunda gerçekte ne olduklarını gösterir.' },
      { en: 'Every mistake you make shakes your actual game window, not just the screen.', tr: 'Yaptığın her hata yalnız ekranı değil, oyun pencerenin kendisini sarsar.' },
      { en: 'Over ten days the moon grows an eye and six wings.', tr: 'On gün içinde aya bir göz ve altı kanat çıkar.' }
    ] },
    { h: { en: 'Who is talking?', tr: 'Konuşan kim?' }, p: { en: 'Is it God, an angel, the devil, or only your own head? You never find out. Every voice speaks under the same scrambled name, and they all contradict each other. One begs you not to follow the rabbit; another tells you to.', tr: 'Tanrı mı, bir melek mi, şeytan mı, yoksa yalnızca kendi kafan mı? Asla öğrenemezsin. Her ses aynı karışık adla konuşur ve hepsi birbiriyle çelişir. Biri tavşanı izlememen için yalvarır, bir diğeri izlemeni söyler.' }, quotes: ['Do not follow the rabbit.', 'Follow the rabbit.', 'You can close this window. You cannot close me.', 'The moon is different tonight.'] },
    { h: { en: 'Features', tr: 'Özellikler' }, list: [
      { en: 'Two kinds of churches: one with a glowstone and water portal to heaven, one with a ladder to nowhere.', tr: 'İki tür kilise: birinde cennete açılan ışık taşı ve sudan bir geçit, ötekinde hiçbir yere çıkmayan bir merdiven.' },
      { en: 'Over a dozen events: madness, dreams, Gabriel, verses, the white rabbit, and a fake system error from your own computer.', tr: 'Bir düzineden fazla olay: delilik, rüyalar, Cebrail, ayetler, beyaz tavşan ve kendi bilgisayarından gelen sahte bir sistem hatası.' },
      { en: 'A fog dream where you must choose whether to follow the rabbit.', tr: 'Tavşanı izleyip izlemeyeceğini seçmen gereken sisli bir rüya.' },
      { en: 'A rewritten main menu.', tr: 'Yeniden yazılmış bir ana menü.' },
      { en: 'Multiplayer ready: signs and rabbits are visible only to the player they were made for.', tr: 'Çok oyunculuya hazır: tabelalar ve tavşanlar yalnız kimin için yaratıldılarsa ona görünür.' },
      { en: 'Everything can be triggered with /horror mod events <event>.', tr: 'Her şey /horror mod events <olay> ile tetiklenebilir.' }
    ] }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'card-lootbags', cats: ['loot'], dl: 131, released: '2026-10-03',
  tag: { en: 'Loot bags that deal three cards. One of them is face down.', tr: 'Üç kart dağıtan ganimet torbaları. Biri ters kapalı.' },
  lede: {
    en: 'Things you kill drop loot bags. Right click one and a three card screen opens: the two left cards show exactly what they give, and the right one is face down. The face down card is drawn from a better pool, but you only find out what it holds once you take it.',
    tr: 'Öldürdüklerin ganimet torbası düşürür. Birine sağ tıkla, üç kartlı bir ekran açılır: soldaki iki kart tam olarak ne verdiğini gösterir, sağdaki ters kapalıdır. Kapalı kart daha iyi bir havuzdan çekilir ama ne olduğunu ancak aldıktan sonra öğrenirsin.'
  },
  sections: [
    { h: { en: 'Four grades', tr: 'Dört derece' }, grades: true, note: { en: 'An ordinary kill drops a bag 45% of the time; weak mobs mostly give V1, tougher ones reach the higher grades. Anything with a boss bar leaves three bags, one of them a guaranteed V4.', tr: 'Sıradan bir öldürme %45 ihtimalle torba düşürür; zayıf yaratıklar çoğunlukla V1 verir, güçlüler üst derecelere ulaşır. Can çubuğu olan her şey üç torba bırakır, biri garantili V4.' } },
    { h: { en: 'Rerolls', tr: 'Yeniden çekmeler' }, p: { en: 'Rerolls let you redraw a card you do not want. Two bags of the same grade craft into one reroll of the grade above, and one bag broken down gives two rerolls of the grade below. Right click a reroll and it goes into an invisible bank; every bag of that grade then shows the count under its cards. Death does not take them away.', tr: 'Yeniden çekme, istemediğin bir kartı yeniden çekmeni sağlar. Aynı dereceden iki torba bir üst derecede bir yeniden çekmeye dönüşür; tek bir torbayı bozmak bir alt derecede iki yeniden çekme verir. Bir yeniden çekmeye sağ tıkla, görünmez bir bankaya gider; o dereceden her torba artık sayıyı kartlarının altında gösterir. Ölüm onları elinden almaz.' } },
    { h: { en: 'Loot Bag Chance', tr: 'Ganimet Torbası Şansı' }, table: {
      cols: [{ en: 'Level', tr: 'Seviye' }, { en: 'Bag drop chance', tr: 'Torba düşme şansı' }],
      rows: [['I', '60%'], ['II', '75%'], ['III', '90%'], ['IV', '100%']] },
      note: { en: 'An enchantment that only comes out of loot bags. It goes on swords, axes, bows and crossbows; the enchanting table, villagers and chest loot never hand it out.', tr: 'Yalnız ganimet torbalarından çıkan bir büyü. Kılıç, balta, yay ve arbalete gider; büyü masası, köylüler ve sandık ganimeti onu asla vermez.' } },
    { h: { en: 'The mace', tr: 'Topuz' }, p: { en: 'The mace, wind charges and the mace enchantments have no recipes and no other source: loot bags are the only way to get them. The mace hits brutally hard when it lands from a fall, harder the further you fell. Density, Breach and Wind Burst books come out of bags too. The mace itself only drops from V3 and V4 bags.', tr: 'Topuzun, rüzgâr yüklerinin ve topuz büyülerinin tarifi ve başka bir kaynağı yok: onları almanın tek yolu ganimet torbaları. Topuz bir düşüşten inerken acımasızca sert vurur; ne kadar yüksekten düştüysen o kadar sert. Density, Breach ve Wind Burst kitapları da torbalardan çıkar. Topuzun kendisi yalnız V3 ve V4 torbalarından düşer.' } },
    { h: { en: 'Also in the mod', tr: 'Modda ayrıca' }, p: { en: 'A two second banner showing what you just won, twelve advancements, and bag sounds that only the player who opened it can hear. No library dependencies.', tr: 'Ne kazandığını iki saniye gösteren bir şerit, on iki başarı ve yalnız açan oyuncunun duyduğu torba sesleri. Kütüphane bağımlılığı yok.' } }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'gilded-gambit', cats: ['loot'], dl: 5, released: '2026-10-09',
  tag: { en: 'Coins from structure chests, a roulette table and the Gambler.', tr: 'Yapı sandıklarından altınlar, bir rulet masası ve Kumarbaz.' },
  lede: {
    en: 'Gilded Gambit adds a risk and reward economy. Coins can only be found in the loot chests of vanilla structures. Spend them on rare goods, or gamble them first and hope to come out richer.',
    tr: 'Gilded Gambit bir risk ve ödül ekonomisi ekliyor. Altınlar yalnızca vanilla yapıların ganimet sandıklarında bulunur. Onları nadir mallara harca ya da önce kumara bas ve daha zengin çıkmayı um.'
  },
  warn: { en: 'All coins are virtual and exist only inside the game. There is no real money gambling of any kind.', tr: 'Bütün altınlar sanaldır ve yalnız oyunun içinde var. Hiçbir türde gerçek parayla kumar yok.' },
  sections: [
    { h: { en: 'Coins', tr: 'Altınlar' }, list: [
      { en: 'Coins spawn only in structure chests: dungeons, mineshafts, shipwrecks, desert temples, woodland mansions, ancient cities, Nether fortresses, bastions and End cities.', tr: 'Altınlar yalnız yapı sandıklarında çıkar: zindanlar, maden geçitleri, batık gemiler, çöl tapınakları, orman konakları, antik şehirler, Nether kaleleri, burçlar ve End şehirleri.' },
      { en: 'Harder structures give bigger stacks. Mobs and other chests never drop coins.', tr: 'Zorlu yapılar daha büyük yığın verir. Yaratıklar ve diğer sandıklar asla altın düşürmez.' },
      { en: 'Right click coins to bank them. Your balance is saved with the world and survives death and relogging.', tr: 'Bankaya yatırmak için altına sağ tıkla. Bakiyen dünyayla kaydedilir; ölümden ve yeniden girişten etkilenmez.' }
    ] },
    { h: { en: 'Roulette Table', tr: 'Rulet Masası' }, p: { en: 'A European 0 to 36 wheel with animated spins. Pick one of six bets: Red, Black, Odd, Even, 1 to 18 or 19 to 36. Win and you get double your stake back; lose, or land on the green zero, and the stake is gone. Spins are decided on the server, so the odds cannot be cheated.', tr: 'Animasyonlu dönüşlü, 0 ile 36 arası Avrupa çarkı. Altı bahisten birini seç: Kırmızı, Siyah, Tek, Çift, 1 ile 18 ya da 19 ile 36. Kazanırsan yatırdığının iki katını alırsın; kaybedersen ya da yeşil sıfıra düşerse yatırdığın gider. Dönüşler sunucuda belirlenir; olasılıkla hile yapılamaz.' } },
    { h: { en: 'The Gambler', tr: 'Kumarbaz' }, p: { en: 'A black suited villager in gold glasses who sells rare goods for coins. He cannot be killed and never despawns. Find him in villages, use a spawn egg, or place a Roulette Table next to any villager to give them the job. His shop: iron, gold, diamonds and ancient debris; netherite ingots and Nether stars; Totems of Undying, enchanted golden apples and Elytra.', tr: 'Siyah takım elbiseli, altın gözlüklü, nadir malları altınla satan bir köylü. Öldürülemez ve asla kaybolmaz. Onu köylerde bul, yumurtasını kullan ya da herhangi bir köylünün yanına Rulet Masası koyup ona bu işi ver. Dükkânı: demir, altın, elmas ve antik kalıntı; netherite külçesi ve Nether yıldızı; Ölümsüzlük Totemi, büyülü altın elma ve Elytra.' } },
    { h: { en: 'Configurable', tr: 'Ayarlanabilir' }, p: { en: 'Coin chances and amounts per structure, minimum and maximum bets, and the whole shop list with prices are in the config file.', tr: 'Yapı başına altın şansı ve miktarı, en düşük ve en yüksek bahis, fiyatlarıyla bütün dükkân listesi ayar dosyasında.' } }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'chest-hauler', cats: ['utility'], dl: 25, released: '2026-10-04', video: '_3SAY40VBbQ',
  tag: { en: 'Pick up a chest with everything in it. Put it down anywhere.', tr: 'Bir sandığı içindekilerle kaldır. İstediğin yere bırak.' },
  lede: {
    en: 'Right click a chest and you lift it whole: items, custom name and all. Right click the ground and it goes back down exactly as it was.',
    tr: 'Bir sandığa sağ tıkla, onu bütünüyle kaldırırsın: eşyaları, özel adı, her şeyiyle. Yere sağ tıkla, tam olduğu gibi geri iner.'
  },
  sections: [
    { h: { en: 'Five tiers', tr: 'Beş kademe' }, p: { en: 'Wooden, iron, golden, diamond and netherite, crafted from sticks plus an ingot (a diamond for the diamond one).', tr: 'Tahta, demir, altın, elmas ve netherite; çubuklar artı bir külçeyle yapılır (elmas olanda bir elmas).' } },
    { h: { en: 'Details that matter', tr: 'Önemli ayrıntılar' }, list: [
      { en: 'Twenty chest colours: the hauled chest shows its main colour on the tool’s icon, so you can see what you are carrying.', tr: 'Yirmi sandık rengi: taşınan sandık ana rengini aletin simgesinde gösterir; ne taşıdığını görürsün.' },
      { en: 'Works with modded chests, including Irones’ metal chests. Ender chests and shulker boxes cannot be picked up.', tr: 'Irones’un metal sandıkları dahil, modlu sandıklarla çalışır. Ender sandıkları ve shulker kutuları kaldırılamaz.' },
      { en: 'Safe to use: anyone who has the chest open gets the screen closed when you lift it, so nothing can be taken twice.', tr: 'Güvenli: sandığı kaldırdığında onu açık tutan herkesin ekranı kapanır; hiçbir şey iki kez alınamaz.' }
    ] }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'uncraft-and-unfurnace', cats: ['utility'], dl: 103, released: '2026-10-03',
  tag: { en: 'Two blocks that let you change your mind.', tr: 'Fikrini değiştirmene izin veren iki blok.' },
  lede: {
    en: 'Minecraft is very good at letting you build things. It is not good at letting you change your mind. This mod adds the two blocks that undo it.',
    tr: 'Minecraft bir şeyler yapmana izin vermekte çok iyi. Fikrini değiştirmene izin vermekte değil. Bu mod, yapılanı geri alan iki bloğu ekliyor.'
  },
  sections: [
    { h: { en: 'Uncrafting Table', tr: 'Ters Üretim Masası' }, list: [
      { en: 'Drop an item in and its ingredients appear in the grid, faded. Nothing is spent until you reach in and take one of them.', tr: 'Bir eşya koy, malzemeleri ızgarada soluk görünür. Birini alana kadar hiçbir şey harcanmaz.' },
      { en: 'No experience cost, ever. Damage and enchantments do not matter: a worn pickaxe still gives back every ingot and stick.', tr: 'Deneyim bedeli asla yok. Hasar ve büyüler önemli değil: yıpranmış bir kazma bile her külçeyi ve çubuğu geri verir.' },
      { en: 'Put a book in the left slot and the enchantments move onto an enchanted book instead of being lost. Mending survives the trip.', tr: 'Sol yuvaya bir kitap koy, büyüler kaybolmak yerine büyülü kitaba geçer. Mending de yolculuktan sağ çıkar.' },
      { en: 'Netherite gear gives back the upgrade template, the diamond item and the netherite ingot.', tr: 'Netherite teçhizat yükseltme şablonunu, elmas eşyayı ve netherite külçesini geri verir.' }
    ] },
    { h: { en: 'Unfurnace', tr: 'Ters Fırın' }, p: { en: 'A furnace running backwards. Feed it fuel and it undoes smelting: cooked food back to raw, glass back to sand, ingots back to raw metal, stone back to cobblestone, charcoal back to a log. Its mouth glows cold instead of hot while it works.', tr: 'Tersine çalışan bir fırın. Yakıt ver, eritmeyi geri alsın: pişmiş yemek çiğe, cam kuma, külçe ham metale, taş parke taşına, odun kömürü kütüğe. Çalışırken ağzı sıcak değil soğuk parlar.' } },
    { h: { en: 'Nothing is duplicated', tr: 'Hiçbir şey kopyalanmaz' }, p: { en: 'Both blocks refuse trades that would print items out of nothing. Ores are never handed back, and neither are tools and armour from smelting. Shulker boxes and other containers keep their contents. Both read the recipes the game has actually loaded, so items from other mods and datapacks come apart correctly with no patches.', tr: 'İki blok da yoktan eşya basacak takasları reddeder. Cevherler asla geri verilmez, eritilen alet ve zırhlar da. Shulker kutuları ve diğer kaplar içindekileri korur. İkisi de oyunun gerçekten yüklediği tarifleri okur; diğer modlardan ve veri paketlerinden gelen eşyalar yamasız doğru ayrışır.' } },
    { h: { en: 'Recipes', tr: 'Tarifler' }, recipes: true },
    { h: { en: 'Advancements', tr: 'Başarılar' }, chipsList: ['Second Thoughts', 'Some Disassembly Required', 'Unbaked', 'Ghostwriter', 'The Whole Nine', 'Ingot Refund', 'Scrapyard'] }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'veinminer-all-types', cats: ['utility'], dl: 90, released: '2026-09-14',
  tag: { en: 'Break a whole vein, fell a whole tree, dig a whole tunnel.', tr: 'Bütün bir damarı kır, bütün bir ağacı devir, bütün bir tüneli kaz.' },
  lede: {
    en: 'Mine one ore and the connected ores of the same type come with it. Hold the Veinminer key and every touching log or ore breaks at once, with a delayed tree fall, and the mining shape can be changed on the fly.',
    tr: 'Bir cevheri kaz, aynı türden bağlı cevherler de onunla gelsin. Veinminer tuşunu basılı tut; birbirine değen her kütük ya da cevher bir anda kırılsın, ağaç gecikmeli devrilsin; kazı şekli anında değiştirilebilir.'
  },
  sections: [
    { h: { en: 'Thirteen shapes', tr: 'On üç şekil' }, p: { en: 'Sneak and scroll (or use the arrow keys) to switch shapes. The HUD shows how many blocks will break, how many leaves come with a tree and how many uses your tool has left.', tr: 'Şekil değiştirmek için eğil ve tekerleği çevir (ya da ok tuşlarını kullan). Ekran göstergesi kaç bloğun kırılacağını, ağaçla kaç yaprağın geleceğini ve aletinin kaç kullanımı kaldığını gösterir.' }, shapes: ['Connected', 'Trees and Ores', 'Tool', 'Tunnel', 'Wide Tunnel (3x3)', 'Wall', 'Layer', 'Column', 'Pit', 'Trench', 'Escape Stairs', 'Cube (3x3x3)', 'Sphere'] },
    { h: { en: 'Block limit', tr: 'Blok sınırı' }, p: { en: 'Cycle the block limit with one key, or type an exact number with another, up to 1024. Leave it empty for automatic.', tr: 'Blok sınırını bir tuşla döngüyle değiştir ya da başka bir tuşla 1024’e kadar tam bir sayı yaz. Otomatik için boş bırak.' } },
    { h: { en: 'Trees that fall properly', tr: 'Düzgün devrilen ağaçlar' }, p: { en: 'A tree will not fall while its trunk still reaches the ground, and the HUD tells you so. Connected logs are counted before you swing.', tr: 'Gövdesi hâlâ yere değiyorsa ağaç devrilmez; gösterge bunu sana söyler. Bağlı kütükler sen vurmadan sayılır.' } },
    { h: { en: 'Languages', tr: 'Diller' }, p: { en: 'The interface ships in 24 languages, from Arabic to Vietnamese.', tr: 'Arayüz Arapçadan Vietnamcaya 24 dilde geliyor.' } }
  ]
},
/* ------------------------------------------------------------------ */
{
  slug: 'flesh-tanner', cats: ['utility'], dl: 13, released: '2026-10-07',
  tag: { en: 'Cook rotten flesh, get leather.', tr: 'Çürük eti pişir, deri al.' },
  lede: {
    en: 'Flesh Tanner turns useless zombie drops into something worth keeping. Smelt rotten flesh in a furnace, blast furnace, smoker or campfire and it comes out as ordinary leather, the same item cows drop.',
    tr: 'Flesh Tanner, zombilerin işe yaramaz düşürdüklerini saklamaya değer bir şeye çeviriyor. Çürük eti fırında, maden ocağında, tütsüleyicide ya da kamp ateşinde erit; ineklerin düşürdüğüyle aynı sıradan deri olarak çıksın.'
  },
  sections: [
    { h: { en: 'That is the whole mod', tr: 'Modun tamamı bu' }, p: { en: 'No new items, no new blocks, no configuration: just four cooking recipes that work with everything leather already works with.', tr: 'Yeni eşya yok, yeni blok yok, ayar yok: derinin zaten işe yaradığı her şeyle çalışan dört pişirme tarifi.' }, cook: true }
  ]
}
];
