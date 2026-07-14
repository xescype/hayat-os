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

## 2026-07-14 — Konteynerde pnpm 9 (packageManager pnpm@9.15.4)
pnpm 10+ postinstall build script'lerini varsayılan bloklar (`ERR_PNPM_IGNORED_BUILDS`, esbuild). `pnpm.onlyBuiltDependencies` alanı 11'de beklenen etkiyi vermedi. Dockerfile `corepack enable` `packageManager` alanını okur → **pnpm 9.15.4** build script'lerini varsayılan çalıştırır, gate yok. Not: Windows host'ta `pnpm install` zaten Defender+esbuild EPERM ile bloklu (bkz memory windows-esbuild-defender); build/test/typecheck Docker'da.

## 2026-07-14 — Migration'lar elle yazıldı (drizzle-kit'siz)
drizzle-kit iki ekstra esbuild sürümü çekiyordu + host install'ı zorlaştırıyordu. `apps/api/migrations/0000_init.sql` + `meta/_journal.json` elle yazıldı; boot'ta postgres-js migrator uygular (drizzle-kit'e gerek yok). Şema değişince: ya elle yeni `NNNN_*.sql` + journal entry ekle, ya da geçici `pnpm add -D drizzle-kit && db:generate`. `drizzle.config.ts` ileride generate için duruyor.

## 2026-07-14 — Font: Geist (öneri) vs Space Grotesk
Geist üstün tabular rakam + UI-odaklı; sayı-ağırlıklı ekran için. İlk gerçek ekranda ikisi yan yana denenip kesinleşecek. `--font-sans` ile tek noktadan değişir.
