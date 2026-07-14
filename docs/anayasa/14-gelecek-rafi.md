# 14 — Gelecek Rafı / v4 Backlog (Detaylı Açıklama)

Raf, "hayır" değil "şimdi değil" listesidir. Her kalemin yanına ön koşulu yazılmıştır — raftan
inme kararı keyfe değil ön koşula bağlanır.

- **Deney modu** (kontrollü kişisel deneyler): Ön koşul: en az 6-8 haftalık temiz metrik geçmişi
  (kıyas dönemi olmadan deney anlamsız). Tasarım çekirdeği hazır: experiments tablosu şemada duruyor.
- **Kamerayla tekrar sayma / form sinyali:** Ön koşul: salon modunun alışkanlık haline gelmesi +
  tarayıcıda poz tahmini performans testi. Beklenti yönetimi: tekrar sayma gerçekçi, milimetrik form
  hakemliği değil.
- **"Ne olurdu" sezon simülasyonu:** Ön koşul: kum dökücünün en az bir gerçek sezon geçirmiş olması
  (simülasyon, kalibre olmamış dökücüyle yanıltır). Staj geçişinde el yordamı provası zaten Faz 3'te.
- **Aralıklı tekrarın gelişmişi** (kart kalitesi, ders bazlı istatistik): Ön koşul: v3'teki basit
  halinin gerçekten kullanılması — kullanılmayan özelliğin gelişmişi yapılmaz.
- **RuView/ESP32 presence + gece uyku sinyali:** Ön koşul: donanımın edinilmesi + staj sonrası zaman.
  Değer sırası bilinçli: gece uyku ölçümü (hareketsiz insan = CSI'ın iyi olduğu senaryo) presence
  süsünden ÖNCE gelir — toparlanma puanını tahminden ölçüme yükseltir. Rust merakının meşru adresi.
- **Yüz tanımayla otomatik uyanma / ekran karşılama:** Ön koşul: presence altyapısı. Kimlik işi
  değil (o WebAuthn'da kaldı), konfor katmanı.
- **Foto→poz metrikleri** (omuz/bel oranı vb.): Ön koşul: en az 12 haftalık foto arşivi + kullanıcının
  bu metriklere gerçekten bakacağının kanıtı.
- **Anthropic API'nin denetçi seçeneği olarak eklenmesi:** Ön koşul: kullanıcının ayrı API hesabı
  açma kararı. Teknik maliyet düşük (yeni provider + config) — karar tamamen bütçe/tercih meselesi.

Raf yönetimi: her muhasebe döneminde rafa göz atılır ama raftan indirme ancak mevcut sistemin
kabul kriterleri yeşilken yapılır. Raf, yarım işlerin meşrulaştırma aracı değildir.
