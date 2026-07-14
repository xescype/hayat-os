# 10 — Güvenlik ve Mahremiyet (Detaylı Açıklama)

## Tehdit modeli (neyi kimden koruyoruz)
Gerçekçi tehditler sırasıyla: (1) tabletin/telefonun başkasının eline geçmesi (aile, arkadaş, kayıp);
(2) internete açık sunucuya otomatik taramalar/botlar; (3) yapay zeka sağlayıcılarına giden veride
mahremiyet sızıntısı; (4) platform hesabı kaybı (Oracle senaryosu — bunun cevabı Bölüm 11).
Hedeflenmeyen tehdit: devlet düzeyi saldırgan, hedefli APT — bunlara karşı tasarım yapılmaz,
gereksiz karmaşıklık getirir.

## Katman 1: Kapı (kimlik)
WebAuthn tek kullanıcı için ideal: parola yok → parola çalınması yok; biyometri cihazda kalır,
sunucuya asla gitmez (sunucu yalnız public key tutar). Kayıt akışı: ilk kurulumda `SETUP_TOKEN`
(env'den, tek kullanımlık) ile passkey kaydı; sonrasında kayıt ucu KAPANIR (yeni cihaz eklemek
Ayarlar'dan, mevcut oturum + taze doğrulama ile). Oturum: httpOnly, secure, sameSite=strict cookie;
7 gün ömür; her istek yenilemez (sessiz uzatma 24 saatte bir).

## Katman 2: Kasa (hassas bölme)
Kasa içeriği: progress fotoğrafları, ağrı geçmişi ekranı, karar günlüğü. Kasa ekranları her
açılışta `userVerification: required` ile TAZE WebAuthn ister — oturum açık olsa bile. Sunucu
tarafında kasa dosyaları libsodium sealed-box şifreli; anahtar yalnız env'de. Yedeklere şifreli
halleriyle girerler (yedek çalınsa da kapalılar).

## Katman 3: Kabuk (sunucu hijyeni)
Caddy: TLS zorunlu, HSTS, makul CSP. API: origin kilidi (yalnız kendi domain), global rate limit +
auth uçlarında sıkı limit, request boyut sınırı (ses yüklemeleri için ayrı, sınırlı uç). VM:
yalnız 80/443 açık, SSH anahtar-only + fail2ban veya GCP IAP, otomatik güvenlik güncellemeleri
(unattended-upgrades). Docker imajları sürüm sabitli.

## Ekran davranışları
10 dk hareketsizlik → kilit ekranı (bellekteki hassas state temizlenir). Salon modu istisnası
blok süresiyle sınırlı ve kasa erişimi salon modunda da kapalı. Uygulama arka plana alınınca
önizleme karesinde hassas içerik görünmesin diye kasa ekranları blur işaretli.

## Mahremiyet varsayılanları özeti
Ses kayıtları: varsayılan saklanmaz. Konum: varsayılan kapalı. Foto→model: her seferinde açık onay.
Gece paketi: hassas ayıklamalı. OpenRouter: ZDR+deny+sabit sağlayıcı. Bu varsayılanların HEPSİ
Ayarlar ekranında görünür ve tek yerden yönetilir — gizlilik ayarı kod içine gömülü sürpriz olamaz.
