# 13 — Faz Planı ve Kabul Kriterleri (Detaylı Açıklama)

## Fazlamanın mantığı
Sıralama "kolaydan zora" değil, **bağımlılık ve değer** sırasıdır: Faz 0 olmadan hiçbir şey deploy
edilemez; Faz 1 tek başına bile "hayatı düzene sokan" asgari üründür (takvim+ses+bildirim+defter);
Faz 2 kullanıcının fiziksel hedefine hizmet eder ve Faz 1'in ses/defter altyapısına biner; Faz 3
"vicdan ve sinir sistemi"dir — ancak yaşayan bir gövdeye takılabilir. Her faz kendi başına
KULLANILABİLİR bir sistem bırakır; proje herhangi bir fazda dursa bile çöp üretmemiş olur.

## Faz 0 incelikleri (1. haftanın ilk yarısı)
En sık yapılan hata burayı "sıkıcı diye" aceleye getirmektir. Kontrol listesi: domain + Caddy TLS
ÇALIŞIYOR (WebAuthn https ister, ertelenemez); bütçe alarmı KURULDU (README adımları uygulandı,
ekran görüntüsü runbook-log'a); ilk yedek GCS'de GÖRÜLDÜ ve indirilip açıldı; push test bildirimi
iki cihazda da düştü. Bu dördü yeşil olmadan Faz 1 başlamaz.

## Faz 1 incelikleri (1.-2. hafta)
Kabul senaryosu bilinçli olarak SES üzerinden yazıldı çünkü ses hattı bütün zinciri (PWA→API→
sayaç→Flash→Zod→modül→ledger→cevap) uçtan uca test eder. Google OAuth onay ekranı "test modu"nda
bırakılabilir (tek kullanıcı, yeterli) — production doğrulaması gereksiz bürokrasi. Pazar kurulumu
v1'de mükemmellik aranmaz: kaba yerleştirme + onay ekranı yeter; incelik haftalık muhasebe verisi
biriktikçe gelir.

## Faz 2 incelikleri (3.-4. hafta)
Salon modu ilk gerçek antrenmandan ÖNCE sahada test edilir (evde uçak modunda tam prova). Egzersiz
import scripti kullanıcının vereceği veri setinin alan eşlemesini README'de belgeler (hangi alan
nereye). Beslenmede "her zamanki" kalıpları bu fazda ÖĞRENMEYE başlar (öneri üretmesi için 1-2
haftalık veri gerekir — bu gecikme normaldir ve kullanıcıya söylenir). Foto akışı kasa şifrelemesi
HAZIR olmadan açılmaz.

## Faz 3 incelikleri (5.-7. hafta)
Sıralama önerisi: gece muhasebecisi → sabah brifingi entegrasyonu → haftalık muhasebe → söz defteri
→ sezon/zincir → geri kalanlar. Çünkü muhasebeci-brifing ikilisi "gün döngüsü" kabul senaryosunun
kalbidir. OpenRouter "yarışma modu" (09'da) burada koşulur. Staj sezonu provası: gerçek staj
tarihleriyle sahte bir sezon kurulur, hafta taslağı üretilir, kullanıcı bakar — geçiş günü sürpriz
yaşanmaz.

## Kesme kuralının ciddiyeti
"Yaz okulu bitişine 1 hafta kala dur" kuralı pazarlıksızdır. Durulan noktada: yarım özellikler
feature flag arkasına, kalanlar docs/backlog.md'ye taşınır, sistem "bitmiş küçük" olarak stabilize
edilir. Staj döneminde geliştirme temposu düşer; ÇALIŞAN sistemin staj sezonunda veri toplaması,
eksik özellikten değerlidir.

## Fazlar arası ritüel
Her faz kapanışında 30 dakikalık retro: ne planlandı/ne çıktı, hangi tahmin şaştı, kararlar
docs/kararlar'a. Bu, projenin kendi haftalık muhasebe felsefesinin geliştirme sürecine uygulanmasıdır.
