# 1A — Defter (Ledger) Altyapısı + Ekranı — Tasarım

> Faz 1 ilk dilimi. Faz 0 iskelet mühürlendi (`github.com/xescype/hayat-os`).
> Anayasa: Bölüm 6 (veri modeli), 8.7 (Defter), 9.3 (mahremiyet), 5 (modül düzeni).

## Context (neden bu iş)
Defter, sistemin **omurgası** (Bölüm 8.7): her etkileşim — kullanıcı girdisi, AI çıkarımı, sistem
cevabı — buraya işlenir. "Hiçbir akıl kayıt dışı konuşamaz." Faz 0'da ledger tablosu YOK; diğer tüm
Faz 1 dilimleri (Calendar, görevler, ses hattı, Şu An kartı, brifing) buna yazacak. Bu yüzden 1A ilk.
1A tek başına değerli olsun diye iki yazıcı: **kullanıcı metin-notu** (channel=text) + **sistem
olayları** (login, yedek → channel=system). Ekran: kronolojik akış + arama + filtre + dışa aktarma.

## Kapsam
İÇİNDE: ledger şeması + append-only trigger, `writeLedger`/`supersede` servisi, metin-not + sistem
yazıcıları, Defter ekranı (Gece Matbaası), arama/filtre (pg_trgm), dışa aktarma (JSON+düz metin),
test harness + testler, CI test job.
DIŞINDA (sonraki dilimler): Calendar senk, görevler, ses/parse, Şu An kartı, bildirimler, brifing,
gece muhasebecisi. supersede **primitifi** kurulur ve testlenir ama Faz 3'e kadar UI'da kullanılmaz.

---

## 1. Şema (`apps/api/migrations/0001_ledger.sql`, hand-written + journal entry)

`CREATE EXTENSION IF NOT EXISTS pg_trgm;`

```
ledger_entries
  id            uuid pk default gen_random_uuid()
  ts            timestamptz not null default now()  -- OLAY zamani (cevrimdisi senk gecmise yazabilir)
  channel       text not null        -- voice|text|button|system|ai   (CHECK)
  actor         text not null        -- user|flash|pro|auditor|system  (CHECK)
  raw_input     text                 -- kullanicinin dedigi/bastigi (system'de null)
  interpretation jsonb               -- AI cikarimi (1A'da null)
  module_writes jsonb                -- uretilen modul satirlari [{table,id}]
  response_text text                 -- sistem cevabi
  audio_ref     text                 -- ses ref (ses saklama ayari; 1A'da null)
  sensitivity   text not null default 'normal'  -- normal|sensitive  (CHECK)
  superseded_by uuid references ledger_entries(id)  -- ESKI satir YENI'yi isaret eder
  created_at    timestamptz not null default now()  -- DB insert ani (degismez)
  CHECK (superseded_by IS NULL OR superseded_by <> id)
```

**ts vs created_at sözleşmesi (migration'a yorum):** `ts` = olayın gerçekleştiği an; çevrimdışı
kuyruk sonradan senklerken geçmişe yazabilir. `created_at` = satırın DB'ye düştüğü an, asla değişmez.
Kronolojik akış `ts`'e göre; denetim/sıra `created_at`'e göre.

**Indexler:**
```
ledger_ts_idx        (ts desc)
ledger_active_idx    (ts desc) WHERE superseded_by IS NULL     -- aktif gorunum (kismi)
ledger_channel_idx   (channel, ts desc)
ledger_superseded_idx(superseded_by)
ledger_trgm_idx      GIN (raw_input gin_trgm_ops, response_text gin_trgm_ops)
```

**Append-only koruma (DB trigger — savunma derinliği):** `BEFORE UPDATE` trigger yalnız
`superseded_by` NULL→non-null geçişine izin verir; başka her kolon değişikliğini ve zaten dolu
`superseded_by`'ın değişimini REDDEDER. `BEFORE DELETE` trigger her silmeyi REDDEDER. (Uygulama
katmanı da yalnız insert/supersede yapar; trigger sigortadır.) Bu istisna `docs/kararlar.md`'ye
"append-only ledger" olarak işlenir.

`channel`/`actor`/`sensitivity` değerleri `packages/shared` sabitlerinden (`LEDGER_CHANNELS`,
`LEDGER_ACTORS`, `SENSITIVITY`); CHECK'ler bu değerleri sabitler.

---

## 2. Yazma API (`apps/api/src/modules/ledger/`)

Modül düzeni (Bölüm 5): `schema.ts` · `service.ts` · `routes.ts` · `*.test.ts`. Modüller
`ledger.service`'i import eder; ledger tablosuna çapraz sorgu YOK.

```
writeLedger(input): Promise<{ id }>
  - Zod dogrulama (channel/actor/sensitivity enum, metin alanlari).
  - append-only INSERT. sensitivity cagiricidan (kaynak belirler, Bolum 9.3); varsayilan 'normal'.
  - opsiyonel ts override (cevrimdisi senk); yoksa now().

supersede(oldId, newInput): Promise<{ id }>
  - transaction:
      insert new (writeLedger) -> newId
      UPDATE ledger_entries SET superseded_by=newId WHERE id=oldId AND superseded_by IS NULL
      rowcount === 0  => throw ("zaten duzeltilmis"); tx ROLLBACK (sarkan yeni satir yok)
  - ATOMIK: ayri SELECT yok; yaris yok.
  - zincir A->B->C: aktif = superseded_by IS NULL olan (C).

listActive({ cursor?, limit }): superseded_by IS NULL, ts desc, cursor sayfalama.
search({ q?, from?, to?, channel? }): pg_trgm (raw_input+response_text) + tarih + kanal.
getChain(id): supersede zincirini takip (test + ileride UI).
exportRange({ from?, to?, format }): Bolum 4.
```

**1A yazıcıları:**
- Metin-not route → `writeLedger({ channel:'text', actor:'user', raw_input })`.
- Yedek job (`jobs/backup.ts`) — **başarı VE başarısızlık** → `writeLedger({ channel:'system',
  actor:'system', response_text })` (notifications_log'a EK).
- Login + kayıt (`auth/webauthn` finish) → `writeLedger({ channel:'system', actor:'system',
  response_text:'Giris yapildi' })`.

Tüm ledger route'ları oturum korumalı (`readSession`).

---

## 3. Defter Ekranı (`apps/pwa`, Gece Matbaası token'ları)

**Navigasyon:** App'e iki-görünüm anahtarı — `Panel` (Faz 0 kabuğu) ↔ `Defter`, üstte hairline sekme.
(Şu An kartı 1E'de Panel'i devralır.)

**Bileşenler** (hepsi `docs/gorsel-kimlik.md` token'ları; sabit hex YOK):
- **Not girişi (üst):** `Input` + gönder → `POST /api/ledger/note` → satır `stagger-in` ile listeye.
- **Araç çubuğu:** metin kutusu (debounced, pg_trgm) · tarih aralığı · kanal chip'leri (`Badge`).
- **Akış (aktif, ts desc):** `LedgerRow` — sol: `ts` tabular + kanal/aktör `Badge`; orta: `raw_input`
  → "Sen: …", `response_text` → "Sistem: …"; `sensitivity=sensitive` → `accent-deep` ince işaret.
  Aralar hairline; gölge yok.
- **Sayfalama:** cursor (`ts` desc), "Daha fazla" butonu.
- **Dışa aktar** butonu → Bölüm 4.

**Boş durumlar (tek satır, tipografik):** boş defter → "Defter boş — ilk notu yaz."; boş filtre
sonucu → "Bu filtreyle kayıt yok."

**Ayar turu (kabul maddesi):** değerler v0; ilk gerçek Defter ekranında kullanıcıyla punto/yoğunluk/
renk ayar turu yapılır.

**Sensitive-akış politikası (kararlar.md notu):** Faz 2'de sensitive yazıcılar (ağrı/foto/karar)
gelince Defter akışında maskeleme/taze-biyometrik-doğrulama kararı verilecek; 1A'da yalnız görsel işaret.

---

## 4. Dışa Aktarma

`GET /api/ledger/export?from&to&format=json|text` (oturum korumalı, `Content-Disposition: attachment`).
`from`/`to` opsiyonel (yoksa tümü).

**JSON (makine) — TAM kayıt:** aralıktaki **tüm** satırlar (aktif + superseded), tüm kolonlar
(`superseded_by`, `module_writes`, `interpretation`, `sensitivity` dahil). Zaman **ISO-8601 UTC**
(makine formatı evrensel). Dosya: `defter-<from>_<to>.json`.

**Düz metin (insan) — okunur çizelge:** yalnız **aktif** satırlar, ts artan. Saatler **Europe/Istanbul**'a
çevrilir. Dosya başına tek satır başlık: `Defter — 01.07.2026 → 14.07.2026, Europe/Istanbul`. Satır
formatı: `13.07 09:42 — Sen: <raw_input>` · `/ Sistem: <response_text>`; sistem satırı (raw_input yok):
`13.07 09:42 — Sistem: <response_text>`. Dosya: `defter-<from>_<to>.txt`.

Ledger Postgres'te → `pg_dump` yedeğine zaten dahil; export = kullanıcı indirmesi. Mahremiyet: kimlikli
kendi indirmesi, tüm satırlar dahil (Bölüm 9.3 modele-gönderim kuralı export'u kapsamaz). Hacim
büyürse stream (dev not; Faz 1 düşük hacim → bellekte topla).

---

## 5. Test Stratejisi

**Saf birim (DB yok):** düz-metin biçimleyici (Istanbul tz, başlık, "Sen/Sistem" varyantları) ·
`writeLedger` Zod doğrulama (geçersiz enum red, sensitivity default, ts override) · cursor encode/decode.

**Entegrasyon (gerçek Postgres):** harness `apps/api/test/db.ts` — `TEST_DATABASE_URL` (`hayatos_test`),
vitest `globalSetup` DB oluştur+migrate, test başına `ledger_entries` truncate. Faz 0'ın DB'siz testleri
ayrı dosyalarda, bozulmaz.
- **supersede primitifi (tam):** superseded SİLİNMEZ/işaretlenir · aktif görünüm doğru filtreler ·
  zincir A→B→C `getChain`, aktif=C · zaten-superseded → rowcount=0, tx rollback · `CHECK(superseded_by<>id)`.
- **Append-only trigger:** içerik UPDATE red · DELETE red · `superseded_by` NULL→id izin (tek sefer) ·
  id→başka red.
- **Konvansiyon (yazıcı-unutması sigortası):** `backup başarılı → system satırı` · `backup başarısız →
  hata satırı` · `login → system satırı`.
- **Arama/filtre:** pg_trgm substring · tarih aralığı · kanal · `listActive` cursor (superseded hariç).
  **Türkçe vaka testleri:** `istanbul`→`İstanbul`, `antrenman`→`ANTRENMANIMDAKİ`, `ağrı`→`omuz ağrısı`.
- **Export:** JSON superseded İÇERİR + ISO UTC · düz metin aktif-only + Istanbul + başlık.

**Türkçe-I riski (karar spec'e):** pg_trgm/`lower()` varsayılan locale'de `İ/I/ı/i` katlaması yanlış
olabilir. Vaka testleri kırılırsa çözüm: yazım+sorgu anında **arama-normalizasyonu** (Türkçe-farkında
casefold: `İ→i`, `I→ı` ya da her ikisini ASCII `i`'ye indirge) uygulanır; tercih edilen çözüm ve
gerekçesi `docs/kararlar.md`'ye işlenir. İlk deneme: `lower()` + testte gözlem; gerekirse normalize kolonu.

**CI test job (`.github/workflows`):** Postgres 16 service'li ayrı job — migrate + `pnpm -r test`
(`TEST_DATABASE_URL` service'e bağlı). Mevcut build-images job'ına ek.

---

## Kabul Kriterleri (1A biter)
1. `0001_ledger.sql` uygulanır: `ledger_entries` + trigger + pg_trgm index. (append-only trigger testli)
2. PWA Defter ekranından metin notu → akışta görünür (channel=text).
3. Yedek (başarılı+başarısız) ve login → ledger system satırları; **konvansiyon testleri yeşil**.
4. Arama Türkçe substring bulur (vaka testleri yeşil); tarih + kanal filtresi çalışır.
5. **supersede primitifi + append-only trigger testleri yeşil.**
6. Export JSON (UTC, superseded dahil) + düz metin (Istanbul + başlık) indirilebilir/doğru.
7. Defter ekranı Gece Matbaası token'larıyla; **kullanıcıyla ayar turu yapılmış**.
8. CI test job yeşil.

## Doğrulama
Lokal: `docker compose up -d db` + `TEST_DATABASE_URL` → `pnpm --filter @hayatos/api test` (birim+entegrasyon).
Ekran: PWA'dan not yaz → Defter'de gör → ara/filtrele → export indir → düz metinde Istanbul saati doğrula.
Konvansiyon: yedek job tetikle + login ol → Defter'de system satırları.
