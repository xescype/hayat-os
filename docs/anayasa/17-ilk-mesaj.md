# 17 — İlk Mesajın Görevi / Başlangıç Protokolü (Detaylı Açıklama)

Bu bölüm, anayasayı alan kodlama ajanının İLK oturumda ne yapacağını tarif eder. Amacı: "anladım,
başlıyorum" deyip yanlış temele beton dökmesini engellemek.

## Adım 1 — Anlama kanıtı (kod yazmadan)
Ajan anayasayı okur ve İKİ liste çıkarır: (a) çelişkili/belirsiz bulduğu maddeler — soru formatında,
her soruya kendi önerisi ekli; (b) "kritik varsayımlarım" — anayasada açıkça yazmayan ama uygulamada
karar gerektiren 5-10 nokta (ör. hangi HTTP çatısı, hangi UI kiti, sesin azami süresi). Bu listeler
kullanıcıya sunulur. Soru YOKSA bu bir uyarı işaretidir — bu boyutta bir spesifikasyonda soru
çıkmaması, yüzeysel okumaya delalettir.

## Adım 2 — Faz 0 iş planı
Onaylanan cevaplarla ajan, Faz 0'ın dosya-dosya planını çıkarır: oluşturulacak dosyalar, sırası,
her adımın "bitti" tanımı, tahmini oturum sayısı. Plan, Bölüm 13'ün Faz 0 kontrol listesiyle
eşleştirilir (domain/TLS, bütçe alarmı, ilk yedek, çift cihaz push).

## Adım 3 — "Başla" onayı
Kod, kullanıcıdan açık "başla" gelmeden yazılmaz. Bu kural ilk oturuma özgü değildir ama ilk
oturumda kutsaldır: temel kararları kullanıcı görmeden atılan iskelet, en pahalı geri dönüştür.

## Devam eden oturumların ritmi
Her oturum açılışı: "Faz X'teyiz; kabul kriterlerinden şunlar yeşil, şunlar eksik; bugün şunu
öneriyorum." Her oturum kapanışı: çalışır durum + kısa özet + docs/kararlar güncellemesi.
Kullanıcı araya yeni fikir attığında ajanın görevi önce SINIFLANDIRMAK: bu Faz N işi mi, raf mı,
anayasa değişikliği mi — sonra uygun yere yazmak. Fikri kaybetmek de, plana sızdırmak da hatadır.

## Ajanın kırmızı çizgileri (özet hatırlatma)
Sayaçsız API çağrısı yazmaz; şemasız model çıktısı işlemez; ledger'da update/delete yapmaz;
OpenRouter'ı mahremiyet üçlüsüz çağırmaz; fazı atlamaz; sormadan mimari karar değiştirmez;
kullanıcıya emrivaki yapmaz — öneri sunar, onay bekler.
