# Backlog / Gelecek Rafı

## 1A Defter — ertelenen minörler (kod incelemesinden, hiçbiri engelleyici değil)
Kaynak: `.superpowers/sdd/2026-07-16-1a-defter/progress.md`. Her madde task numarasıyla; 1A kapanış incelemesinde tekrar triyaj edilir.
- **[Task 1]** `packages/shared/src/normalize.test.ts` — boş string ve saf-ASCII girdi için kenar-durum testi yok. `normalizeSearch` total fonksiyon olduğu için risk düşük.
- **[Task 1]** `packages/shared/src/normalize.ts` — `FOLD` tablosu düz object literal. Bugün gerçek risk yok (anahtarlar tek kod noktası); tablo genişletilirse `Object.create(null)` düşünülebilir.
- **[Task 2]** `packages/shared/src/ledger-schema.test.ts` — trim-boş reddi ile geçerli-içerik kabulü tek `it` bloğunda; ayrılırsa hata izolasyonu netleşir. (Plandan miras.)
- **[Task 2]** `sensitivity` varsayılanının **değeri** (`"normal"`) test edilmiyor, yalnız parse başarısı doğrulanıyor.
- **[Task 3]** `apps/api/migrations/0001_ledger.sql` — `ledger_append_only()` adı yalnız DELETE yarısını anlatıyor; fonksiyon içerik-değişmezliğini de kontrol ediyor. İsim netliği.
- **[Task 3]** Aynı dosya — self-FK `ON DELETE no action`, trigger DELETE'i zaten kestiği için yapısı gereği atıl. Zararsız, niyeti belgeliyor.
- **[Task 4]** `apps/api/tsconfig.json` — `rootDir: "."` bugün zararsız (`build`/`typecheck` ikisi de `--noEmit`); ileride gerçek emit açılırsa çıktı `dist/src/...` altına iner, o gün ele alınmalı.
- **[Task 4]** `apps/api/src/db/client.ts` uzun ömürlü havuzu itest sonunda kapatılmıyor; suite vitest'in process'i sonlandırmasına güveniyor. Şu an temiz çıkıyor — ileride uzun transaction'lı bir itest asılırsa **ilk bakılacak yer burası**.
- **[Task 5]** `apps/api/src/modules/ledger/service.itest.ts` — açıkça verilen `ts` değerinin satıra bozulmadan indiği test edilmiyor (yalnız kod incelemesiyle doğrulandı).
- **[Task 5]** `service.ts` — `.returning()` sonrası `row!.id` non-null assertion. Bugün güvenli; insert'e koşullu bir yol eklenirse kırılgan.
- **[Task 5 → Task 2 sınırı, GİZLİ TUZAK]** `packages/shared/src/schemas.ts` — `ts: z.coerce.date().optional()` `.nullable()` değil ve `new Date(null)` hata atmak yerine epoch (`1970-01-01`) üretiyor. Bugün TS çağrıcıları tetikleyemez, ama **ileride bir HTTP ucu gevşek JSON'dan `ts: null` geçirirse** satıra sessizce 1970 yazılır (DB varsayılanı devreye girmez). `ts` dışarıdan alınmaya başladığı gün `.nullable()` + açık red şart.
- **[Task 4]** `.pnpm-store/` (62MB) repo kökünde beliriyor; kökeni belirsiz, `.gitignore`'a alındı. Başka makinede/CI'da tekrarlarsa yanlış yapılandırılmış store-dir işareti olabilir.

## v4 (anayasa Bölüm 14 — şimdi kodlanmayacak)
- Deney modu
- Kamerayla tekrar sayma / form sinyali
- "Ne olurdu" sezon simülasyonu
- Aralıklı tekrarın gelişmişi
- RuView/ESP32 presence + gece uyku sinyali
- Yüz tanımayla otomatik uyanma
- Foto → pose metrikleri
- Anthropic API'nin denetçi seçeneği olarak eklenmesi

## Faz 3'ten ertelenenler (kesme kuralı devreye girerse)
_(boş — kesme anında doldurulur)_
