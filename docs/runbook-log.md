# Runbook Log

Operasyon kanıtları buraya tarihle işlenir (bütçe alarmı ekran görüntüsü, yedek dönüş provası, göç provası).

## Bekleyen (domain günü)
- [ ] GCP bütçe alarmı kuruldu — ekran görüntüsü.
- [ ] İlk production yedeği GCS'de görüldü + indirilip açıldı.
- [ ] Aylık yedek dönüş provası (restore drill).

## Faz 0 (lokal)
- [ ] Lokal `docker compose up` → migrate + servisler ayakta.
- [ ] localhost WebAuthn kayıt + giriş.
- [ ] Yedek job → gerçek GCS bucket'ında age-şifreli tar; indirilip açıldı.
