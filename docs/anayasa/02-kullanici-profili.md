# 02 — Kullanıcı Profili ve Bağlam (Detaylı Açıklama)

Profil bilgisi süs değildir; her maddesi bir tasarım kararına gerekçedir. Bu dosya o eşleşmeleri açıklar.

## Tek kullanıcı = radikal sadeleşme
Çok kullanıcılı sistemlerin taşıdığı yükün tamamı atılır: kayıt/onboarding akışları, roller, izin
matrisleri, tenant izolasyonu, GDPR panelleri. Bunun karşılığında kazanılan şey: kişiselleşme
varsayılan olabilir. "Her zamanki kahvaltı" gibi özellikler ancak tek kullanıcıda anlamlıdır.
Kod tarafında `users` tablosu yine de tutulur (ileride veri modeli bozulmasın diye) ama bütün sorgular
tek kullanıcı varsayabilir.

## Sezon gerçeği: yaz okulu → staj
İki dönemin ritmi taban tabana zıt: yaz okulu = parçalı ders blokları, esnek gündüz; staj = 08.30-17.30
kaya bloğu, akşama sıkışan hayat. Sistem bu geçişi ÖNCEDEN bilir; sezon mekanizması (8.13) tam bu
yüzden çekirdekte, süs olarak değil. Staj sezonuna geçiş provası Faz 3 kabul kriteridir.

## Fiziksel hedefin çift doğası: kilo ver + kas yap
Bu ikili hedef beslenme modülünün iki sayılı tasarımını (kalori VE protein) zorunlu kılar. Sadece
kalori takip eden sistemde açıkta kas da erir; protein hedefi bu yüzden birinci sınıf vatandaştır.
Progressive overload otomasyonu da aynı hedeften türer: kas sinyali korunmadan açıkta antrenman
yapmak kilo kaybını "kötü kilo kaybı" yapar.

## Cihaz gerçeği: tablet + telefon, bilgisayar yok
Lokal model çalıştırılamaz → tüm yapay zeka bulutta (mimari karar 3'ün kökü). PWA iki cihaza da
kurulur; tablet ana yüz (salon modu, ders rafları), telefon bildirim + hızlı kayıt ucudur. Arayüz
tablet-öncelikli ama telefon genişliğinde de kullanılır olmalı (responsive zorunlu).

## Hareketlilik gerçeği: sabit yer yok
Kampüs-ev-salon-yol dörtgeni iki gereksinim doğurur: (1) sunucu taraflı kalp — bildirim ve zamanlayıcı
konumdan bağımsız çalışır; (2) çevrimdışı tampon — salonun bodrumunda internet yokken set kaydı
kaybolmaz (Bölüm 12). Konum farkındalığı OPSİYONEL iyileştirmedir; izin verilmezse saat+takvim
tahmini aynı işi kabaca görür.

## Dil ve konuşma deseni
Kullanıcı casual Türkçe, sayı-terim karışık konuşur. Bunun teknik sonuçları: parse prompt'u Türkçe
örneklerle beslenir; sayı formatları (62.5 / 62,5), set kalıpları (8-8-7, 3x8), Türkçe yemek adları
test setinde yer alır. "Anlaşılmadı" cevabı yerine düşük güvenli çıkarım + onay kartı tercih edilir.

## Teknik yetkinlik
Kullanıcı geliştirici seviyesinde teknik olduğu için: hata mesajları teknik detay içerebilir
(ayarlarda "geliştirici modu" ile), runbook'lar CLI adımları içerebilir, kurulum sihirbazına yatırım
yapılmaz — README yeterlidir.
