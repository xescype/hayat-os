# 05 — Depo Yapısı (Detaylı Açıklama)

## Yapının felsefesi
Klasörler teknik katmana göre değil, ALAN'a göre bölünür: `modules/nutrition` içinde o modülün
route'ları, servisleri, şema parçaları ve testleri birlikte yaşar. Sebep: bu projede değişiklikler
hep "modül bazlı" gelir ("beslenmeye şunu ekle"); alan bazlı yapı, bir işin dokunacağı dosyaları
tek klasörde toplar ve ajanın bağlam yükünü düşürür.

## Klasör sorumlulukları
- `apps/api/src/modules/*` — her modül: `routes.ts` (HTTP yüzeyi), `service.ts` (iş mantığı),
  `schema.ts` (Drizzle tablo tanımları), `*.test.ts`. Modüller birbirinin servisini import edebilir
  (tek süreç, organizma ilkesi) ama TABLOSUNA doğrudan sorgu atamaz — veri erişimi sahibinin
  servisinden geçer. Bu kural, "kim neyi değiştiriyor" izlenebilirliğini korur.
- `apps/api/src/engine/` — durum motoru. Modüllerden SİNYAL OKUR ama hiçbir tabloya yazmaz;
  saf fonksiyon karakteri test edilebilirliğinin anahtarıdır.
- `apps/api/src/ai/` — provider soyutlaması, prompt yükleyici, sayaç middleware'i, çıktı şemaları.
  Provider SDK importları YALNIZ burada yaşayabilir (Kural 6'nın kod karşılığı).
- `apps/api/src/jobs/` — her zamanlanmış iş ayrı dosya: `nightlyAuditor.ts`, `weeklyReview.ts`,
  `sundayPlanner.ts`, `backup.ts`, `calendarSync.ts`, `nutritionLoop.ts`. Job dosyası ince kalır;
  asıl mantık modül servisindedir (job = tetikleyici).
- `apps/api/src/integrations/` — gcal, tts, push istemcileri. Dış dünyanın tuhaflıkları (token
  yenileme, retry, webhook doğrulama) burada hapsolur; modüller temiz arayüz görür.
- `packages/shared/` — Zod şemaları, TS tipleri, sabitler (kategori isimleri, mod adları), yardımcılar.
  KURAL: shared hiçbir şeye bağımlı olamaz (ne api'ye ne pwa'ya); bağımlılık oku tek yönlüdür.
- `infra/` — compose, Caddyfile, yedek scriptleri, VM kurulum notları. Göç Planı'nın yaşadığı yer.
- `docs/` — anayasa + bu açıklama dosyaları + runbook + "Kararlar" kaydı (ADR-hafif format:
  tarih, karar, gerekçe, alternatif).

## İsimlendirme ve stil
Dosyalar camelCase değil kebab-case (`nightly-auditor.ts` da kabul; ajan seçer, tutarlı kalır).
Tablolar snake_case, TS tipleri PascalCase. Türkçe kavramların kod adları İngilizce karşılıklarıyla:
Defter=ledger, Söz=promise, Kaya/Kum=rock/sand, Vites=mode, Sezon=season, Kasa=vault, Muhasebeci=auditor.
Bu sözlük `docs/glossary.md`'ye yazılır ki UI metni ile kod terimi eşleşmesi kaybolmasın.
