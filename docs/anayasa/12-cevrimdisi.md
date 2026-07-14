# 12 — Çevrimdışı Davranış (Detaylı Açıklama)

## Neden birinci sınıf gereksinim
Kullanım deseni (kampüs-salon-yol) + salonların tipik sinyal karanlığı: en değerli kayıt anları,
bağlantının en zayıf olduğu anlardır. Çevrimdışılık "hata durumu" değil, normal çalışma modudur.

## Katman katman strateji
- **Kabuk:** service worker, uygulama kabuğunu (HTML/JS/CSS) önbellekler; uygulama internetsiz AÇILIR.
- **Okuma:** kritik veri önceden indirilir: bugünün + yarının blokları, aktif antrenman programı ve
  son performanslar (blok-30dk prefetch), defterin son 7 günü, yemek kütüphanesi. IndexedDB'de tutulur.
- **Yazma:** her yazma işlemi önce IndexedDB kuyruğuna, sonra senkronizasyona. Kuyruk kaydı:
  `{clientId(uuid), type, payload, createdAt}`. Bağlantı gelince sırayla POST edilir.
- **Idempotency:** her yazma isteği `clientId` taşır; sunucu aynı clientId'yi ikinci kez görürse
  yeni kayıt AÇMAZ, ilk sonucu döner. Böylece "gönderdim mi acaba" belirsizliğinde çift kayıt imkânsız.
- **Çatışma:** tek kullanıcı + tek aktif cihaz pratiğinde çatışma nadirdir; politika basit tutulur:
  son yazan kazanır, İSTİSNA takvim (Google kazanır) ve ledger (append-only, çatışma kavramı yok).

## Dürüst arayüz
Çevrimdışıyken durum çubuğu bunu gösterir; beyin isteyen işler (ses çözümü, öneri) "işlenecekler"
rafında sayaçla bekler ve bağlantıda otomatik akar. Motor kartı eldeki son snapshot'la üretilir ve
"● çevrimdışı veri" rozetini taşır — sistem asla güncelmiş gibi davranmaz.

## Ses kayıtlarının çevrimdışı hali
Kayıt cihazda güvenle bekler (IndexedDB, boyut sınırı ve toplam kota ile); kullanıcı isterse
bekleyen sesin transkript öncesi metin özetini göremez (henüz beyin görmedi) ama kaydın varlığını
ve sırasını görür. Kota dolarsa en eski İŞLENMİŞ sesler silinir, işlenmemişler asla.
