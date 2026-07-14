# 00 — Çalışma Protokolü (Detaylı Açıklama)

Bu dosya, anayasanın 0. bölümündeki 8 kuralın her birinin **neden var olduğunu** ve ajanın (kodlama
yapay zekasının) bunları pratikte nasıl uygulayacağını açıklar. Bu kurallar süs değil; her biri
projenin ölme biçimlerinden birine karşı aşıdır.

## Kural 1 — Dil ayrımı: Arayüz Türkçe, kod İngilizce
Kullanıcıyla temas eden HER metin Türkçedir: buton yazıları, bildirimler, hata mesajları, yapay zeka
cevapları, brifing metinleri, e-postalar. Kod tarafı (değişken, fonksiyon, tablo adı, commit, yorum
satırı) İngilizce kalır — çünkü kod evrenseldir, araç zinciri İngilizceyle çalışır, ileride başka
araçlara/ajanlara devri kolay olur. Sık yapılan hata: hata mesajlarını İngilizce bırakmak. Backend'de
hata üretilen her nokta, kullanıcıya gidecekse Türkçe mesaj taşımalı; log'a gidecekse İngilizce olabilir.
Yapay zeka prompt şablonları Türkçe yazılır çünkü kullanıcının Türkçe konuşmasını Türkçe bağlamda
işlemek çıktı kalitesini yükseltir.

## Kural 2 — Fazlara sadakat
Faz planı (Bölüm 13) bir sıralamadır, menü değildir. "Faz 2'deki salon modu daha eğlenceli, önce onu
yapayım" cazibesi projeyi öldüren şeydir: temel (kimlik, defter, takvim) olmadan üstteki her şey
çürük zemine dikilir. Ajan her oturuma "şu an hangi fazdayız, o fazın kabul kriterlerinden hangileri
eksik" diye başlamalıdır. Faz atlama isteği kullanıcıdan gelirse bile ajan bir kez uyarır ("şu temel
eksik, önce onu bitirmemizi öneririm"), kullanıcı ısrar ederse uyar ve uygula.

## Kural 3 — Sorma disiplini
İki tür karar vardır: mimari etkisi olanlar (kütüphane seçimi, şema değişikliği, dış servis ekleme)
ve önemsizler (lint kuralı, dosya adı, renk tonu). Birinciler için format: "Seçenek A: ..., Seçenek B: ...,
önerim B çünkü ...". İkinciler için: karar ver, README'nin "Kararlar" bölümüne tek satır not düş.
Amaç kullanıcıyı mikro kararlarla boğmadan büyük kararlardan haberdar tutmak.

## Kural 4 — Her adım çalışır durumda biter
"Beş özelliğin yarısı" durumu, kullanıcının sistemi test edememesi ve motivasyonun ölmesi demektir.
Her çalışma oturumu, deploy edilebilir bir durumda kapanır: migration'lar uygulanmış, testler geçmiş,
compose ayağa kalkıyor. Yarım iş bırakmak gerekiyorsa feature flag arkasına alınır.

## Kural 5 — Test kapsamı: çekirdek mantık
Test yazılacak yerler bilinçli seçilmiştir: durum motoru puanlaması, kalori kapalı döngüsü, progressive
overload kuralı, takvim senk eşleştirmesi, kota sayaçları, kural motoru kalıpları. Bunların ortak
özelliği: sessizce yanlış çalışabilmeleri. UI bozulursa göze batar; puanlama yanlışsa aylarca fark
edilmez ve veri çürür. Test verisi: gerçekçi Türkçe girdiler kullan ("62.5'e çıktım 8-8-7" gibi).

## Kural 6 — Maliyet paranoyası
Hiçbir dış API çağrısı doğrudan yapılmaz; hepsi sayaç middleware'inden geçer (Bölüm 09 dosyasında
detay). Bunun mimari karşılığı: `fetch`'in kendisini sarmalayan bir istemci sınıfı dışında provider
SDK'sı import etmek yasaktır. Kod incelemesinde ilk bakılacak şey budur. Sebep: kredili bulut
hesabında sayaçsız bir döngü hatası, bir gecede aylık bütçeyi yakabilir.

## Kural 7 — Taşınabilirlik paranoyası
Oracle deneyiminin dersi: platform seni sevmeyi bırakabilir. Bu yüzden sistemin GCP'ye "duygusal bağı"
olmayacak: compose + .env + son yedek üçlüsü herhangi bir Ubuntu makinesinde sistemi diriltebilmeli.
GCP'ye özel iki bağımlılık (Gemini/Vertex, Cloud TTS) provider soyutlaması arkasında durur; üçüncü bir
GCP servisi eklemek anayasa değişikliği ister.

## Kural 8 — Sır yönetimi
.env asla commit edilmez; .env.example her yeni değişkenle güncellenir. Frontend'e giden config'te
anahtar olamaz — PWA'nın ihtiyaç duyduğu tek "sır" VAPID public key'dir (adı üstünde, public).
Yapay zeka anahtarları, OAuth secret'ları, şifreleme anahtarı yalnız API konteynerinin ortamında yaşar.
