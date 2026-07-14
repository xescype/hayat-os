# 06 — Veri Modeli (Detaylı Açıklama)

## Modelin üç omurga ilkesi

### 1. Defter append-only'dir
`ledger_entries` tablosunda UPDATE ve DELETE yoktur. Düzeltme = yeni satır + eskiye `superseded_by`
işareti. Neden: (a) gece muhasebecisinin düzeltmeleri geri alınabilir olmalı (kullanıcı sabah tek
dokunuşla reddedebilir → supersede zinciri ters çevrilir); (b) "Flash ne demişti, denetçi neye
çevirdi" tarihçesi hata haritasının hammaddesi; (c) kullanıcının sözü asla kaybolmaz. Sorgular
"aktif görünüm" için `superseded_by IS NULL` filtresiyle çalışır — bunun için bir view tanımla.

### 2. Türetilmiş veri ham veriden ayrılır
`meal_logs` ham gerçektir; `nutrition_targets` türetilmiş politikadır. Kilo ham girilir; 7 günlük
ortalama SORGUDA hesaplanır, tabloda saklanmaz (tutarsızlık riski sıfırlanır). Genel kural: bir değer
başka değerlerden hesaplanabiliyorsa saklanmaz — istisna: pahalı hesaplar (sezon karnesi) sonuç
snapshot'ı olarak `seasons.meta`ya yazılabilir, kaynağı belirtilerek.

### 3. Her yapay zeka dokunuşu izlenebilir
Modül tablolarına yapay zekanın yazdığı her satır `ledger_id` taşır (hangi etkileşimden doğdu) ve
`ai_estimated`/`assumed` bayrakları tahmin karakterini işaretler. Gece muhasebecisi denetim
kapsamını bu bayraklardan kurar.

## Tablo tablo tasarım notları
- **calendar_blocks.signature:** Google event description'ına gömülen `[hayatos:<uuid>]` etiketi.
  Senk, eventleri bu imzayla eşler; imzasızlar "yabancı=kaya" sınıfına düşer. Kullanıcı description'ı
  silerse eşleşme kopar → senk bunu "yetim blok" olarak raporlar, sessizce çift kayıt üretmez.
- **tasks vs promises ayrımı:** görev kullanıcının bilinçli oluşturduğu iştir; söz, konuşmadan
  AYIKLANAN taahhüttür ve kullanıcının cümlesi aynen (`quoted_text`) saklanır — çünkü dürtme anında
  sistemin gücü o alıntıdan gelir ("'Cuma teslim ederim' demiştin").
- **bureau_files.steps jsonb:** adım dizisi esnek tutulur (her sürecin şekli farklı) ama her adımda
  üç alan zorunlu: ad, durum, topun_sahibi (ben/karşı taraf). Dürtme mantığı yalnız "karşı tarafta +
  N iş günü geçti" koşuluna bakar.
- **workout_sets:** ağırlık kg, ondalıklı (62.5). "Geçen seferki performans" sorgusu: aynı exercise_id
  için son tamamlanmış session'ın setleri — salon modunun en sıcak sorgusudur, indeksle.
- **body_metrics + progress_photos ayrımı:** sayılar normal tabloda, fotoğraflar kasada (şifreli path).
  Foto satırı asla piksel içermez, yalnız referans.
- **pain_logs.bölge:** serbest metin DEĞİL, kontrollü sözlükten (omuz-sol, omuz-sağ, bel, diz-sol...).
  Örüntü analizi ("ikinci kez, ikisi de itiş haftası") ancak kontrollü sözlükle mümkün.
- **foods.güven notu:** yapay zeka tahminli besinlerde kaynak ve varsayım metni ("porsiyon: tabldot
  varsayıldı"). Kapalı döngü, düşük güvenli kayıt oranı yüksekse ayar yapmayı reddeder.
- **sleep_logs.source:** usage(tahmin)/manual(onaylı). Toparlanma puanı onaysız tahmine %70 ağırlık verir.
- **ai_calls:** maliyet görünürlüğünün tek kaynağı. est_cost, model birim fiyat tablosundan hesaplanır
  (fiyatlar config'te, kolay güncellenir). Ayarlar ekranındaki "bu ay tahmini" bu tablodan.
- **jobs:** name, payload jsonb, run_after, locked_until, attempts, last_error, done_at.
  Tekrarlayan işler done olunca kendini yeniden zamanlar (cron ifadesi config'te).

## Migration disiplini
Şema değişikliği = migration dosyası + gerekiyorsa veri taşıma scripti + `docs/kararlar`a not.
Üretimde migration otomatik ama YIKICI değişiklik (kolon silme) iki aşamalı yapılır: önce yeni,
bir sürüm sonra eski kaldırılır.
