# Runbook Log

Operasyon kanıtları buraya tarihle işlenir (bütçe alarmı ekran görüntüsü, yedek dönüş provası, göç provası).

## Bekleyen (domain günü)
- [ ] GCP bütçe alarmı kuruldu — ekran görüntüsü.
- [ ] İlk production yedeği GCS'de görüldü + indirilip açıldı.
- [ ] Aylık yedek dönüş provası (restore drill).

## Faz 0 (lokal)
- [x] Lokal `docker compose up` → migrate + servisler ayakta. (2026-07-14)
- [ ] localhost WebAuthn kayıt + giriş. (kullanıcı tarayıcı turunda)
- [x] Yedek job → gerçek GCS bucket'ında age-şifreli tar; indirilip açıldı, `pg_restore -l` 6 tablo. (2026-07-14, bucket `odaproject-backup-esat`, obj `backup-2026-07-14T15-01-42-165Z.tar.age`)

## KRİTİK: age private anahtarı yedekle
`infra/secrets/age-key.txt` = yedekleri çözen TEK anahtar (gitignore'lu, tek kopya). Parola kasasına kopyala. Kaybı = tüm yedekler açılamaz. Public (`age1nvhk...`) `.env` `BACKUP_AGE_KEY`'de.
