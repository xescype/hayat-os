# 15 — Yapma Listesi / Non-Goals (Detaylı Açıklama)

Non-goal listesi, kapsam sürünmesine karşı anayasal settir. Her maddenin gerekçesi:

- **Çok kullanıcılı yapı / halka açık yayın / mağaza paketi:** Sistemin gücü tek kullanıcıya
  radikal uyumundan gelir ("her zamanki kahvaltı" gibi). Genelleştirme her modülü sulandırır ve
  güvenlik/uyumluluk yükü getirir. Bu bir ÜRÜN değil, kişisel altyapıdır.
- **Finans/portföy modülü:** Kullanıcı bu işi zaten ayrı araçlarla yapıyor; buraya taşımak odağı
  bulandırır. Bu uygulama BEDENİN ve ZAMANIN uygulamasıdır. (Karar günlüğü finansal kararları
  metin olarak alabilir — o kadar.)
- **Ruh hali anketleri:** Günlük "nasılsın 1-5" soruları hızla angaryaya döner ve veri kalitesi
  çöker; uyku + plan uyumu dolaylı ama dürüst sinyaldir.
- **Sosyal/paylaşım özellikleri:** Tek kullanıcılık bilinçli tasarımdır; dış motivasyon mekaniği
  (arkadaşla yarış vs.) sezon/zincir mekaniğiyle içeriden çözülür.
- **Lokal model çalıştırma:** Donanım yok (bugünün gerçeği). Donanım gelirse bu madde rafa taşınır —
  ama bugün mimariyi "belki bir gün lokal" diye karmaşıklaştırmak yasak.
- **Samsung Notes ile veri senkronizasyonu:** Public API yok; hack'ler kırılgan. Buton (aç/git) +
  Share Target (dosya al) meşru sınırdır. Bu sınır README'de kullanıcıya da dürüstçe yazılır.
- **Gerçek zamanlı sesli diyalog:** Sıra tabanlı hat (konuş→işle→cevapla) kullanım senaryosunu tam
  karşılar; gerçek zamanlılık maliyet, karmaşıklık ve kırılganlık getirir, değer getirmez.
- **Claude aboneliğinin programatik kullanımı:** Token söküp takma = kullanım şartı ihlali + hesap
  riski; abonelikle headless cron = gri ve kırılgan. Güçlü dış akıl ihtiyacının meşru yolları:
  OpenRouter (kurulu), ayrı Anthropic API (rafta), haftalık paketin elle sohbete yapıştırılması
  (her zaman serbest ve deftere "dış denetim" olarak girer).
- **Tanı koyan sağlık özellikleri:** Ağrı filtresi program DÜZENLER, teşhis etmez; şiddetli/tekrarlayan
  durumda "sağlıkçıya görün" der. Bu çizgi etik ve pratik olarak sabittir.

Bu listeye madde eklemek serbest, çıkarmak anayasa değişikliğidir (kullanıcı onayı + gerekçe kaydı).
