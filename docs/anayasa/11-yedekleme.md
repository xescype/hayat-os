# 11 — Yedekleme ve Taşınabilirlik (Detaylı Açıklama)

## İlkenin kökü
Oracle olayı: platform tek taraflı hesap kapattı, itiraz sonuçsuz. Çıkarılan kural mimariye
gömülüdür: sistemin hayatta kalması HİÇBİR platformun iyi niyetine bağlı olamaz. Bunun iki bacağı:
dışarı alınan yedek + belgelenmiş göç planı.

## Gece yedek boru hattı
Job (03.30): (1) `pg_dump -Fc` → (2) şifreli dosya klasörü (foto/ses zaten şifreli) + dump tek tar'a
→ (3) tar'ın kendisi ayrıca yaşlandırılmış anahtarla şifrelenir (age/gpg) → (4) GCS bucket'a yükleme
(yaşam döngüsü: 30 gün sonra otomatik silme; ilk yedek + her ayın 1'i "aylık" etiketiyle 12 ay
tutulur) → (5) sonuç ledger'a sistem satırı olarak düşer; BAŞARISIZLIK sabah brifingine uyarı olarak
çıkar (sessiz çürüyen yedek, olmayan yedekten tehlikelidir). Opsiyonel ikinci hedef: rclone ile
kullanıcının seçeceği yer (Drive/başka bucket) — config'te açılır.

## Dönüş provası (restore drill)
Ayda bir, runbook'taki adımlarla BOŞ bir yerel/geçici ortamda son yedekten ayağa kaldırma denenir:
compose up → dump restore → uygulamaya giriş → rastgele 3 kayıt kontrolü. Prova yapılmamış yedek,
yedek sayılmaz. Prova sonucu docs/runbook-log.md'ye tarihle işlenir; sistem 35 gün provasız kalırsa
brifing hatırlatır.

## Göç Planı (README zorunlu bölümü)
Hedef: herhangi bir Ubuntu 24 makinesinde 1 saat içinde tam dirilme. Adımlar: (1) VM/makine hazırla,
Docker kur; (2) repo klonla; (3) .env'i parola kasandan geri koy (kritik: SODIUM_MASTER_KEY ve
age anahtarı olmadan dosyalar AÇILAMAZ — anahtar yedeği runbook'un 1. maddesidir); (4) son yedeği
indir, restore scriptini çalıştır; (5) DNS'i yeni IP'ye çevir; (6) Google OAuth redirect URI ve
webhook adresini güncelle; (7) sağlık kontrol listesi. Platforma özel tek bağ (Gemini/TTS) göçten
etkilenmez — onlar API'dir, sunucu değil.

## Neyin yedeklenmediği (bilinçli)
Google Calendar içeriği yedeklenmez (kaynağı Google, meta bizde); TTS önbelleği yedeklenmez
(yeniden üretilir); Docker imajları yedeklenmez (registry'den çekilir). Yedek küçük ve hızlı kalır.
