# Kararlar (ADR-hafif)

Format: tarih · karar · gerekçe · alternatif.

## 2026-07-13 — Sunucu: GCP us-central1 e2-micro (Always Free)
Bütçe $0 önceliği. Bedel: ~130-160ms gecikme + 1GB RAM (swap şart). Alternatif: europe-west e2-micro (~$8/ay, düşük gecikme) reddedildi.

## 2026-07-13 — Gemini: Vertex AI (us-central1)
Kullanıcının GCP kredisi var + Vertex veriyi eğitime kullanmaz + tek GCP projesi/IAM. AI Studio ücretsiz kotası bazı bölgelerde eğitir → mahremiyet (9.3) ihlali. Sağlayıcı soyutlaması (9.1) ile AI Studio'ya geçiş = 1 satır config. Not: GCP trial kredisi tek seferlik/90 gün, aylık resetlenmez.

## 2026-07-13 — Calendar OAuth: Production (unverified)
Spec detay dosyaları (13/16/03) "test modu yeter" diyor — GEÇERSİZ. Test modunda refresh token 7 günde ölür, senk haftalık patlar. Production'da (doğrulanmamış olsa da, tek kullanıcı) token ölmez. Kararı kullanıcı onayladı.

## 2026-07-13 — Şifreleme: AES-256-GCM (Node yerleşik), sealed-box DEĞİL
Spec "sealed-box" diyordu ama sealed-box asimetrik (keypair ister); env'deki tek simetrik master key için yanlış. Plan `crypto_secretbox` idi; libsodium-wrappers'ın ESM alt-import'u bozuk (vitest'te yüklenmiyor) olduğu için Node yerleşik **AES-256-GCM**'e geçildi — aynı derecede doğru authenticated symmetric cipher, sıfır bağımlılık, ESM/wasm derdi yok. Anahtar env: `SODIUM_MASTER_KEY` (32 bayt base64, isim korundu).

## 2026-07-13 — Build: VM'de build YOK
1GB RAM'de pnpm build OOM. İmaj GitHub Actions → GHCR; VM `docker compose pull && up`. Faz 0 lokalde build serbest (güçlü makine). compose override ile ayrılır.

## 2026-07-14 — Faz 0 ortamı: Lokal (Windows Docker Desktop), localhost
localhost güvenli bağlam → WebAuthn + SW çalışır, domain şimdi alınmaz. TLS + çift-cihaz push → domain gününe ertelendi. Yedek kriteri ertelenmedi (gerçek GCS bucket'ına test).

## 2026-07-14 — Faz 0 yedek sonucu: notifications_log + başarısızlıkta push
ledger + sabah brifingi entegrasyonu Faz 1'de gelir. ledger tablosu Faz 0 asgarisine ALINMADI (anayasa Bölüm 13 Faz 0 listesine sadık).

## 2026-07-14 — Framework: Hono + Node 22 LTS
1GB RAM'de hafif, TS-native. Alternatif Fastify — Hono daha hafif seçildi.

## 2026-07-16 — Urun adi "Oda", kod adi "hayat-os"
Kullaniciya gorunen urun adi **Oda**. Kod tarafi degismez: repo/paket (`@hayatos/*`)/DB/imaj (`hayatos-api`,`hayatos-caddy`) adlari AYNI kalir. "Oda" yalniz kullanici-yuzu metinlerde: PWA manifest `name`/`short_name`, giris ekrani basligi, bildirim basliklari, README ilk satiri. Esleme `docs/glossary.md`'ye eklendi. (1A plani: manifest/baslik guncellemesi kucuk madde.)

## 2026-07-16 — Turkce-I arama katlamasi: hepsi ASCII 'i'
Defter aramasinda `I/İ/ı/i` sorunu icin karar: **hepsini ASCII `i`'ye katla** (yazimda normalize kolon `search_norm` + sorguda ayni katlama). Gerekce: kisisel defterde yanlis-NEGATIF (kaydi bulamamak) > yanlis-pozitif; genis eslesme tercih edilir. `İstanbul/ISTANBUL/istanbul` hepsi `istanbul`'a katlanir, `agri/AGRI` -> `agri`. Turkce karakterler de ASCII'ye indirgenir (ç->c, ş->s, ğ->g, ü->u, ö->o, ı/İ->i). Ham `raw_input` DEGISMEZ; yalniz arama kolonu normalize.

## 2026-07-16 — GCP "Agent Platform" yeniden adlandirma (not)
Vertex AI / `aiplatform` ve `roles/aiplatform.user` konsolda "Agent Platform" / "Agent Platform User" olarak gorunuyor. **ID'ler ayni** (`aiplatform.googleapis.com`, `roles/aiplatform.user`) — kod/IAM degismez, yalniz UI etiketi degisti.

## 2026-07-16 — Vertex ses spike SONUC (BASARILI, 1D icin altin bilgi)
Turkce test sesi -> Gemini Flash -> tek cagride transkript+intent. Yontem: GCP TTS(tr-TR) ile ses uret ->
Vertex `generateContent` (REST + google-auth token, `@google-cloud/vertexai` SDK'siz; audio `inlineData:
{mimeType:'audio/mp3', data:<base64>}` + `generationConfig.responseMimeType:'application/json'`).
- **Model:** `gemini-2.5-flash` ✅. `gemini-2.0-flash`, `-2.0-flash-001`, `-1.5-flash-002`, `gemini-flash-latest` -> **404** (us-central1'de yok/erisim yok). **Karar: routing.ts'te flash modeli `gemini-2.5-flash`** (pricing.ts guncelle).
- **Dogruluk:** sayilar birebir (62.5, [8,8,7], 15:00), Turkce karakter saglam (Oglen/disim). Intent ayrimi dogru: workout_set + meal + calendar_event.
- **GECIKME kritik:** `thinkingConfig.thinkingBudget=0` -> ~5.6s; varsayilan (thinking acik) -> ~15.6s (thoughts ~1995 token). **Karar: ses hattinda (1D) thinkingBudget=0/dusuk** (gecikme > marjinal transkript kalitesi). Tradeoff: thinking kapaliyken transkript hafif bozuldu ("cektim"->"aciktim") + spurious `pain` intent'i.
- **Prompt dersi:** ornekteki bos `payload:{}` -> model bos payload+conf 0 dondurdu. **parse.md (Bolum 9.2) DOLU few-shot ister** (gercek payload'li 6-10 Turkce ornek). Kural-motoru on-gecisi (Bolum 8.8) + confidence esigi spurious intent'leri keser.
- **Maliyet:** ses ~225 token / ~6sn konusma; toplam istek ~346 in + ~170-274 out. Cok ucuz. est_cost withMetering ile 1D'de ai_calls'a yazilir (metering yolu Faz 0'da kanitli). Not: bu spike sirasinda Docker daemon cokmustu, ai_calls insert'i host'tan yapilmadi.
- **API surprizi:** REST `.../publishers/google/models/<MODEL>:generateContent`; model ID versiyonu onemli. `@google-cloud/vertexai` SDK'siz REST yeterli (sadece google-auth-library). Host node (esbuild'siz) + `npm i google-auth-library` ile Docker'siz kosuldu.

## 2026-07-14 — Sır hijyeni (kural)
Bir olay sonrası: sır üretiminde `echo` + `.env` diff/read değerleri transcript'e düşürdü. Kurallar:
- Sır ASLA stdout'a basılmaz. Değerler bir script içinde üretilip `.env`'e doğrudan yazılır; script yalnız "rotated OK" gibi değersiz onay basar. `.env`'i okuma/diff'leme (grep ile uzunluk kontrolü bile riskli).
- **IDE/harness açık `.env`'i her değişiklikte otomatik diff'ler** → tool ile yapılan her `.env` yazımı değerleri gösterir; bu kaçınılmaz. Sonuç: **bu lokal oturumdaki tüm sırlar "dev-only/yanmış" kabul edilir.**
- **Üretim sırları domain gününde VM üzerinde üretilir, hiçbir zaman bu sohbete/transcript'e girmez.** Lokal sırları prod'a taşıma.
- age private (`infra/secrets/age-key.txt`) parola kasasına; repoya/env'e girmez. GCP SA json yalnız `infra/secrets/`.
- Rotasyon lokal'de döngüye sokulmaz (aynı IDE-diff hook'u tekrar sızdırır) — yanmış say, prod'da taze üret.

## 2026-07-14 — Konteynerde pnpm 9 (packageManager pnpm@9.15.4)
pnpm 10+ postinstall build script'lerini varsayılan bloklar (`ERR_PNPM_IGNORED_BUILDS`, esbuild). `pnpm.onlyBuiltDependencies` alanı 11'de beklenen etkiyi vermedi. Dockerfile `corepack enable` `packageManager` alanını okur → **pnpm 9.15.4** build script'lerini varsayılan çalıştırır, gate yok. Not: Windows host'ta `pnpm install` zaten Defender+esbuild EPERM ile bloklu (bkz memory windows-esbuild-defender); build/test/typecheck Docker'da.

## 2026-07-14 — Migration'lar elle yazıldı (drizzle-kit'siz)
drizzle-kit iki ekstra esbuild sürümü çekiyordu + host install'ı zorlaştırıyordu. `apps/api/migrations/0000_init.sql` + `meta/_journal.json` elle yazıldı; boot'ta postgres-js migrator uygular (drizzle-kit'e gerek yok). Şema değişince: ya elle yeni `NNNN_*.sql` + journal entry ekle, ya da geçici `pnpm add -D drizzle-kit && db:generate`. `drizzle.config.ts` ileride generate için duruyor.

## 2026-07-14 — Font: Geist (öneri) vs Space Grotesk
Geist üstün tabular rakam + UI-odaklı; sayı-ağırlıklı ekran için. İlk gerçek ekranda ikisi yan yana denenip kesinleşecek. `--font-sans` ile tek noktadan değişir.
