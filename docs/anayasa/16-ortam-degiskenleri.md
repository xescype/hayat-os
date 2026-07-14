# 16 — Ortam Değişkenleri (Detaylı Açıklama)

Her değişken: ne işe yarar, nereden alınır, format/dikkat notu.

| Değişken | Açıklama |
|---|---|
| `DOMAIN` | Sistemin https adresi (ör. hayat.ornek.dev). Caddy TLS ve WebAuthn origin'i buna kilitlenir; sonradan değiştirmek passkey'leri geçersizleştirir — baştan doğru seç. |
| `SETUP_TOKEN` | İlk passkey kaydını koruyan tek kullanımlık uzun rastgele dize. Kurulumdan sonra işlevsizdir ama env'de kalabilir. |
| `DATABASE_URL` | Postgres bağlantısı (compose içi: `postgres://...@db:5432/hayatos`). |
| `SODIUM_MASTER_KEY` | Dosya şifrelemenin ana anahtarı (32 bayt, base64). ÜRETİM: `openssl rand -base64 32`. KAYBI = foto/ses dosyalarının kaybı. Parola kasasına yedeklenmesi runbook'un 1. maddesi. |
| `BACKUP_AGE_KEY` | Yedek tar'larını şifreleyen age anahtarı (public kısmı env'de yeter; private kısım SADECE parola kasasında). |
| `VAPID_PUBLIC` / `VAPID_PRIVATE` | Web Push anahtar çifti (`npx web-push generate-vapid-keys`). Public frontend'e gider (tek meşru "frontend sırrı"). |
| `GOOGLE_OAUTH_CLIENT_ID` / `SECRET` | Calendar API için OAuth istemcisi (GCP Console → Credentials). Redirect URI: `https://DOMAIN/api/oauth/google/callback`. Onay ekranı "test" modunda kalabilir. |
| `GEMINI_API_KEY` | AI Studio anahtarı VEYA Vertex kimliği (service account). Vertex tercihi: ücretli/kurumsal veri politikası. Hangisi seçildiyse README'ye yazılır. |
| `GCP_TTS_KEY` | Cloud TTS erişimi (service account json path'i veya API key). Ses adı config'te: tr-TR neural bir ses. |
| `GCS_BACKUP_BUCKET` | Yedek kovası adı. Yaşam döngüsü kuralı (30 gün / aylıklar 12 ay) kurulumda elle tanımlanır (runbook). |
| `OPENROUTER_API_KEY` | Önden ödemeli bakiyeli hesap. Hesap ayarları (eğitim izni kapalı, logging kapalı, ZDR açık) runbook'ta ekran adımlarıyla. |
| `AUDITOR_MODEL` / `AUDITOR_PROVIDER` | Gece muhasebecisinin modeli ve SABİTLENMİŞ sağlayıcısı (ör. `anthropic/claude-x` gibi model slug'ı + sağlayıcı adı). "Yarışma modu" sonucu buraya yazılır. |
| `FLASH_DAILY_CAP` (200) / `PRO_DAILY_CAP` (5) / `AUDITOR_DAILY_CAP` (2) / `TTS_DAILY_CAP` (60) | Günlük çağrı tavanları. Değerler deneyimle ayarlanır; tavan felsefesi 09'da. |
| `QUIET_HOURS` | Sessiz saat aralığı, "23:00-07:30" formatı. Brifing istisnası kodda. |
| `TZ` | `Europe/Istanbul`. TÜM zamanlayıcı mantığı bu dilime göre; sunucu UTC'de kalır, dönüşüm uygulamada. |

Disiplin: yeni env değişkeni eklemek = .env.example + bu dosya + README kurulum bölümü aynı PR'da
güncellenir; biri eksikse PR tamam sayılmaz.
