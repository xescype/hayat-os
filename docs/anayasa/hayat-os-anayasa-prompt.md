# HAYAT OS — PROJE ANAYASASI VE İNŞA TALİMATI

> Bu doküman, tek kullanıcılık bir "kişisel hayat işletim sistemi"nin eksiksiz spesifikasyonudur.
> Sen bu projenin baş mühendisisin. Bu dokümanı ANAYASA olarak kabul et: buradaki kararlar tartışılmış ve
> mühürlenmiştir. Belirsiz bir nokta görürsen tahmin yürütme — bana sor. Anayasayla çelişen bir "daha iyi fikir"in
> varsa önce öner, onay almadan uygulama.

---

## 0. ÇALIŞMA PROTOKOLÜ (önce bunu oku)

1. **Dil:** Bütün arayüz metinleri, bildirimler, yapay zeka çıktıları ve kullanıcıyla temas eden her şey TÜRKÇE.
   Kod, değişken adları, commit mesajları İngilizce.
2. **Fazlara sadık kal:** Bölüm 13'teki faz planı sıradır. Faz N bitmeden Faz N+1'e geçme. Her fazın
   kabul kriterleri var; kriterler sağlanmadan faz "bitti" sayılmaz.
3. **Sor:** Bir kütüphane/servis kararı anayasada yoksa ve önemliyse, iki seçenek + önerinle bana sor.
   Önemsizse (lint ayarı gibi) kendin karar ver, README'ye not düş.
4. **Küçük adımlar:** Her iş birimi çalışır durumda bırakılır. "Yarısı yazılmış beş özellik" yerine
   "tamamı çalışan bir özellik".
5. **Test:** Çekirdek iş mantığı (durum motoru puanlama, kalori döngüsü, takvim senk, kota sayaçları) birim
   testli olacak. UI için test zorunlu değil.
6. **Maliyet paranoyası:** Her dış API çağrısı sayaçtan geçer (Bölüm 9.5). Sayaçsız API çağrısı yazmak yasak.
7. **Taşınabilirlik paranoyası:** Her şey Docker Compose'ta. Platforma özel bağımlılık (GCP'ye kilitlenme)
   sadece iki yerde serbest: Vertex AI/Gemini ve Cloud TTS — ikisi de soyutlama arkasında (Bölüm 9.1).
8. **Gizli anahtarlar** asla frontend'e, asla repoya girmez. `.env.example` tutulur, gerçek `.env` gitignore'da.

---

## 1. VİZYON

Tek kullanıcının (Esat) hayatını tek beyinde birleştiren kişisel asistan: takvim iskelet, spor ve beslenme
kaslar, notlar hafıza, durum motoru beyin, gece muhasebecisi vicdan, sezonlar motivasyon iskeleti.

Sistemin tek varoluş amacı, her an şu soruya cevap verebilmek: **"Esat şu an hangi durumda ve bir sonraki
en değerli hamlesi ne?"**

Tasarım felsefesi:
- **Sürtünme düşmandır.** Her kayıt işlemi ideal olarak tek dokunuş ya da tek cümle konuşmadır.
  Üç dokunuştan fazla isteyen her akış yeniden tasarlanır.
- **Sistem azarlamaz, yeniden düzenler.** Plan patladığında suçluluk üretmez; veriyi kaydeder ve düzeni
  yeniden kurar.
- **Plan da sanıktır.** Kullanıcı plana uymuyorsa bazen kullanıcı, bazen plan hatalıdır; sistem ikisini de
  sorgular (haftalık muhasebe).
- **Hiçbir akıl kayıt dışı konuşamaz.** Kullanıcının her girdisi, her yapay zeka çıkarımı, her sistem cevabı
  Defter'e işlenir (Bölüm 8.7).
- **Veri hiçbir platformun insafına emanet edilmez.** Gece yedeği dışarı alınır; sistem bir akşamda başka
  sunucuya taşınabilir olmalıdır (Oracle dersi).

---

## 2. KULLANICI PROFİLİ VE BAĞLAM

- Tek kullanıcı: Esat, 22, Düzce/Türkiye. Elektrik-Elektronik Mühendisliği öğrencisi.
- Takvim gerçeği: önümüzde ~5-7 haftalık yaz okulu dönemi; ardından zorunlu staj (25 iş günü, hafta içi
  tam gün mesai). Sistem iki farklı "sezon" düzenini desteklemek zorunda.
- Fiziksel hedef: ~1 yıllık ufukta kilo verme + kas yapma. Spor salonu üyeliği yeni başlıyor/başlayacak.
- Cihazlar: Samsung tablet (ana cihaz — uygulama burada yaşar), Android telefon (bildirim + hafif kullanım).
  Lokal model çalıştırılabilecek bir bilgisayar YOK; tüm yapay zeka bulutta.
- Kullanım deseni: sabit yer yok — kampüs, ev, salon, yolda. Bağlantı her zaman garanti değil
  (çevrimdışı tampon şart, Bölüm 12).
- Kullanıcı teknik olarak yetkin; casual Türkçe konuşur. Ses girdileri günlük konuşma dilinde, sayı ve
  terim karışık gelir ("bench 62.5'e çıktım 8-8-7").

---

## 3. KESİNLEŞMİŞ MİMARİ

```
[Tablet/Telefon: PWA] ⇄ HTTPS ⇄ [GCP VM (e2-micro → gerekirse e2-small)]
                                      ├─ Backend API (Node/TS, Docker)
                                      ├─ PostgreSQL 16 (Docker volume)
                                      ├─ Zamanlayıcı (job runner, Postgres tabanlı kuyruk)
                                      ├─ Caddy (TLS, reverse proxy)
                                      └─ Gece yedeği → Google Cloud Storage (+ 2. hedef opsiyonel)
Backend'in dış bağlantıları:
  → Vertex AI / Gemini Flash  : gündüz beyni (ses→yapılandırılmış veri, parse, tahmin)
  → Vertex AI / Gemini Pro    : derin yorum + gece muhasebecisinin YEDEĞİ
  → OpenRouter (güçlü model)  : GECE MUHASEBECİSİ (ZDR + data_collection=deny + sabit sağlayıcı)
  → Google Cloud TTS (tr-TR)  : sesli cevaplar ve sabah brifingi sesi
  → Google Calendar API       : takvimin tek gerçek kaynağıyla çift yönlü senk
  → Web Push (VAPID)          : bildirimler (uygulama kapalıyken dahi)
```

Kesin kararlar (tartışmaya kapalı):
- **Sunucu:** GCP Compute Engine, önce `e2-micro` (Always Free adayı), tıkanırsa `e2-small`. Bölge:
  Avrupa (europe-west). Kurulumdan hemen sonra GCP bütçe alarmı elle kurulacak (README'de adım adım anlat:
  aylık bütçe + %50 ve %90 e-posta uyarısı). Bu, kod değil operasyon işi ama README'de ZORUNLU bölüm.
- **Lokal model YOK.** Whisper yok, Gemma yok, XTTS yok. STT işini Gemini'nin ses girişi yapar
  (ses dosyası doğrudan modele gider, tek çağrıda hem çözüm hem anlam çıkarımı).
- **Vercel YOK.** Frontend da aynı VM'de Caddy arkasından servis edilir.
- **Oracle YOK** (hesap kapatıldı). Hiçbir Oracle servisi kullanılmaz.
- **Claude aboneliği backend'e BAĞLANMAZ.** OAuth token söküp takma, Claude Code'u sunucuda headless cron
  olarak abonelikle koşturma — ikisi de yapılmayacak. Kullanıcı isterse ileride ayrı bir Anthropic API
  hesabı ekler; sağlayıcı soyutlaması (9.1) buna hazır olmalı ama şimdi kurulmayacak.
- **Yüz tanıma / kamera kimlik doğrulama YOK** (v4 rafında). Kimlik: cihaz biyometrisi üzerinden
  WebAuthn/passkey.
- **RuView / ESP32 presence YOK** (v4 rafında).

---

## 4. TEKNOLOJİ SEÇİMLERİ (kesin)

- **Monorepo, TypeScript uçtan uca.** pnpm workspaces.
  - `apps/api` — Node 20+, Hono veya Fastify (sen seç, gerekçeyi README'ye yaz), Zod ile şema doğrulama.
  - `apps/pwa` — React + Vite + TS. Kurulabilir PWA (manifest + service worker). UI kütüphanesi hafif
    kalsın (Tailwind serbest). Koyu tema varsayılan.
  - `packages/shared` — ortak tipler, Zod şemaları, sabitler. API ve PWA aynı tipleri kullanır.
- **Veritabanı:** PostgreSQL 16. ORM: Drizzle. Migration'lar repo içinde, otomatik uygulanır.
- **İş kuyruğu/zamanlayıcı:** Ayrı bir Redis KURMA (RAM kıt). Postgres tabanlı hafif çözüm:
  `jobs` tablosu + API konteyneri içinde çalışan bir poller/cron döngüsü (örn. 30 sn'de bir due job kontrolü).
  Her zamanlanmış işin son çalışma zamanı ve sonucu tabloya işlenir; VM yeniden başlarsa kaçan işler telafi edilir.
- **Bildirim:** Web Push (VAPID anahtarları backend'de). PWA hem tablete hem telefona kurulur; iki cihaz da
  push aboneliği kaydeder. Bildirim tıklanınca ilgili ekrana derin bağlantı.
- **Kimlik:** WebAuthn/passkey (cihazın parmak izi/yüz kilidi). Tek kullanıcı; kayıt akışı ilk kurulumda
  bir defalık "setup token" ile korunur (env'den). Oturum: httpOnly cookie + kısa ömürlü JWT.
  Hassas Kasa erişimi (Bölüm 10) her seferinde taze WebAuthn doğrulaması (userVerification: required) ister.
- **TLS:** Caddy, otomatik sertifika. Alan adı: kullanıcı bir domain/DuckDNS verecek; env'den okunur.
- **Dosya depolama:** Vücut fotoğrafları ve ses kayıtları VM diskinde, uygulama katmanında şifrelenmiş
  (libsodium sealed box; anahtar env'de). Postgres'te sadece metadata.

---

## 5. DEPO YAPISI

```
hayat-os/
├─ apps/
│  ├─ api/           # backend
│  │  ├─ src/
│  │  │  ├─ modules/ # her modül kendi klasöründe: planner/, fitness/, nutrition/, ledger/ ...
│  │  │  ├─ engine/  # durum motoru
│  │  │  ├─ ai/      # sağlayıcı soyutlaması, prompt şablonları, kota sayaçları
│  │  │  ├─ jobs/    # zamanlanmış işler
│  │  │  └─ integrations/ # gcal, tts, push
│  └─ pwa/
├─ packages/shared/
├─ infra/
│  ├─ docker-compose.yml
│  ├─ Caddyfile
│  └─ backup/        # yedek scriptleri
├─ docs/             # bu anayasa + işletme rehberi (runbook)
└─ .env.example
```

---

## 6. VERİ MODELİ (çekirdek tablolar — Drizzle şemasına çevir)

Aşağıdaki alan listeleri asgaridir; ihtiyaca göre genişlet ama isimlendirme ruhunu koru.

- `users` — tek satır olacak ama tablo yine de var (id, display_name, created_at).
- `credentials` — WebAuthn credential kayıtları.
- `ledger_entries` — **DEFTER, sistemin omurgası.** (id, ts, channel[voice|text|button|system|ai],
  actor[user|flash|pro|auditor|system], raw_input text, interpretation jsonb, module_writes jsonb,
  response_text, audio_ref nullable, sensitivity[normal|sensitive], superseded_by nullable →
  gece düzeltmeleri orijinali SİLMEZ, yeni satır ekler ve eskiyi işaretler.)
- `calendar_blocks` — yerel kopya + Google eventId eşleşmesi. (id, gcal_event_id, kind[rock|sand],
  category[ders|staj|antrenman|çalışma|yemek|oyun|kişisel|bürokrasi], title, start, end, status, meta jsonb,
  signature — uygulamanın koyduğu blokları tanımak için event description'a gömülen kimlik.)
- `tasks` — (id, title, due nullable, kind[normal|promise|bureau_step], source_ledger_id, status,
  snooze_until, meta jsonb.)
- `promises` — Söz Defteri. (id, ledger_id, quoted_text — kullanıcının cümlesi AYNEN, due_guess,
  status[open|kept|broken|cancelled], resolution_note.)
- `bureau_files` — bürokrasi dosyaları. (id, title, steps jsonb[ad, durum, topun_sahibi, son_hareket_ts],
  status, next_nudge_at.)
- `exercises` — içe aktarılan egzersiz kütüphanesi (kullanıcının vereceği açık kaynak JSON veri seti,
  ~800-1300 hareket: ad, kas grupları, ekipman, talimatlar, görsel ref).
- `workout_plans`, `workout_sessions`, `workout_sets` — (session: planlanan/gerçekleşen; set: exercise_id,
  weight, reps, rpe nullable). Progressive overload hedefleri set seviyesinde hesaplanır.
- `body_metrics` — (ts, weight_kg, waist_cm nullable, ...). Kilo görünümleri HER ZAMAN 7 günlük kayan
  ortalama üzerinden sunulur.
- `progress_photos` — (ts, encrypted_path, pose_tag). Model erişimi: Bölüm 10 kuralları.
- `pain_logs` — (ts, bölge, şiddet 1-5, bağlam, ledger_id). Program filtresi bunlara bakar.
- `foods` — kişisel yemek kütüphanesi (ad, porsiyon tanımı, kcal, protein, karbonhidrat, yağ, kaynak
  [manuel|ai_tahmin], güven notu).
- `meal_logs` — (ts, food_id nullable, serbest açıklama, kcal, protein, ai_estimated bool).
- `nutrition_targets` — aktif bütçe (kcal, protein_g, geçerlilik başlangıcı, gerekçe — kapalı döngü her
  ayar değişikliğini gerekçeli satır olarak ekler; geçmiş silinmez).
- `sleep_logs` — (date, start_guess, end_guess, confirmed bool, source[usage|manual]).
- `decisions` — karar günlüğü (ts, decision_text, rationale_text, review_at nullable, outcome_note nullable).
- `seasons` — (ad, start, end, hedefler jsonb, kural_seti jsonb — kum anayasası sezona bağlı).
- `streaks` — zincirler (tür, current, best, joker_used_this_week).
- `experiments` — deney modu (hipotez, start, end, dondurulan metrikler jsonb, sonuç) — v3.
- `modes` — kriz vitesi durumu (active_mode[normal|hasta|sınav|yoğun], since, meta).
- `ai_calls` — HER model çağrısı: (ts, provider, model, purpose, input_tokens, output_tokens, est_cost,
  duration_ms, ok bool, error). Kota sayaçları buradan hesaplanır.
- `jobs` — zamanlayıcı tablosu.
- `push_subscriptions`, `notifications_log`.

---

## 7. DURUM MOTORU (çekirdek)

**Görev:** Sinyalleri toplayıp ana ekrana TEK "Şu An" kartı üretmek.

Sinyaller (v1'de ilk beşi, diğerleri faz ilerledikçe eklenir): saat/tarih, takvimdeki sıradaki kaya/kum,
bugünkü kayıt durumu (antrenman girildi mi, öğün girildi mi), kalori/protein bütçesinin durumu, açık
söz/görev/bürokrasi dürtmeleri, uyku/toparlanma puanı, aktif sezon ve vites, (opsiyonel, izinliyse) kaba konum.

Karar mantığı: kural tabanlı öncelik puanlama (LLM DEĞİL — kart üretimi deterministik ve bedava olmalı).
Öncelik sırası kabaca: (1) şu an içinde olunan blok → onun kartı; (2) 60 dk içinde başlayacak kaya →
hazırlık kartı; (3) kaçmakta olan şey (antrenman penceresi kapanıyor, öğün girilmedi + antrenmana az kaldı);
(4) açık soru/dürtme (gece muhasebecisinin soruları, söz hatırlatması); (5) hiçbiri yoksa günün özeti.

Kart formatı: tek başlık + en fazla üç satır bağlam + en fazla iki eylem butonu. Örnek:
"17.30 Antrenman (İtiş) · Proteinin 60g'da, antrenman öncesi ~400 kcal ye · [Yemek öner] [Programı gör]".

Motor bir `getNowCard()` fonksiyonudur; hem PWA ana ekranı hem bildirim üretici hem sabah brifingi aynı
fonksiyondan beslenir. Birim testleri: en az 10 senaryo (ders öncesi, antrenman günü akşamı, her şey boşken,
hasta viteste, vs.).

---

## 8. MODÜL SPESİFİKASYONLARI

### 8.1 Planlayıcı ve Takvim Senkronizasyonu
- **Tek gerçek kaynak: Google Calendar** (kullanıcının hesabı; OAuth ile bağlanır). Uygulama kendi ayrı
  ajandasını TUTMAZ; `calendar_blocks` yereldeki ayna + zengin metadata'dır.
- Çift yönlü senk: backend periyodik (5-15 dk) + push kanalı mümkünse webhook ile Google'dan çeker;
  uygulamanın oluşturduğu her event description alanına gömülü imza taşır. Kullanıcı Google Takvim'den
  uygulama bloğunu taşırsa senk bunu tanır ve iç kayıtları (antrenman seansı vs.) yeni saate bağlar.
  Kullanıcının elle eklediği yabancı etkinlikler **kaya** sayılır.
- **Kaya/Kum modeli:** kayalar (ders, staj, sınav, randevu) dokunulmaz. Kumlar (antrenman, çalışma, yemek,
  oyun) haftalık kurulumda kayaların arasına dökülür.
- **Kum anayasası** sezon kural setinden gelir; v1 varsayılanı: haftada 4 antrenman, aynı kas grubuna ardışık
  gün yok, ders çalışması sınavdan geriye yayılır, 23.00 sonrası iş planlanmaz, ders bloklarına bitişik
  yemek penceresi açılır (ders 12.00'deyse öğle 11.15'e).
- **Pazar kurulumu:** her Pazar akşamı job, gelecek haftanın taslağını kurar ve onaya sunar (bildirim +
  ekran). Kullanıcı blok kaydırırsa kalanlar yeniden dizilir.
- **Çökme yönetimi:** kaçan kum bloğu otomatik olarak haftanın kalan boşluklarına yeniden yerleştirilmeye
  çalışılır; yer yoksa hafta o kum için küçültülür ve bu, uyum metriğine işlenir (azar yok, kayıt var).

### 8.2 Görevler ve Söz Defteri
- Görevler: tarihli/tarihsiz, sesle veya elle eklenir.
- **Söz Defteri:** Flash, kullanıcının serbest konuşmalarından taahhüt cümlelerini ayıklar ("arayacağım",
  "bitiririm", "teslim ederim" kalıpları). Söz, kullanıcının cümlesi AYNEN alıntılanarak saklanır.
  Zamanı geldiğinde/geçtiğinde motor dürter: "[tarih]'te '...' demiştin — Şimdi mi / Ertele / İptal?"
  Haftalık muhasebede söz tutma oranı ayrı metrik.

### 8.3 Spor
- **Egzersiz kütüphanesi:** kullanıcının vereceği açık kaynak JSON veri setini import eden script
  (idempotent; tekrar çalıştırılabilir).
- **Salon modu:** antrenman bloğu aktifken PWA özel kılığa girer — dev yazı, tek elle kullanım,
  ekran uyanık (wake lock). Gösterilen: sıradaki hareket, hedef set×tekrar, GEÇEN SEFERKİ performans,
  ilerleme hedefi ("60×8,8,7 yaptın → bugün 60×8,8,8; geçersen 62.5"). Set girişi tek dokunuş; setler
  arası dinlenme sayacı otomatik başlar. Çevrimdışı TAM çalışır (Bölüm 12).
- **Progressive overload kuralı** (v1, basit ve deterministik): hedef tekrarların tamamı iki seans üst üste
  tamamlanırsa ağırlık %2.5-5 artar (hareket tipine göre); iki seans üst üste hedefin belirgin altıysa
  ağırlık %5-10 düşer (deload). Kural motoru; LLM karışmaz.
- **İlerleme:** kilo 7 günlük kayan ortalama grafiği; hareket bazlı tonaj/1RM-tahmini grafikleri;
  haftalık fotoğraf akışı — çekim ekranı bir önceki fotoğrafı %30 opaklıkta hayalet olarak bindirir
  (aynı poz/mesafe için).
- **Ağrı filtresi:** ağrı kaydı girilince ilgili kas grubuna/ekleme yük bindiren hareketler o haftaki
  programda işaretlenir ve kütüphaneden alternatif önerilir. Bilgi kaynağı: egzersiz metadata'sı +
  kullanıcının vereceği açık kaynak medikal bilgi tabanı (varsa). **Tanı koymak KESİNLİKLE yasak** —
  sistem yalnız "şu hareketleri bu hafta değiştirelim" der; şiddet 4-5 ağrıda "bir sağlıkçıya görün"
  notu ekler. Tekrarlayan ağrı örüntüleri gece muhasebecisine sinyal olarak gider.

### 8.4 Beslenme
- **Hedef hesaplama:** Mifflin-St Jeor + aktivite çarpanı → TDEE; kilo verme temposu haftada ~0.5 kg
  (≈ günlük 500 kcal açık, taban: kadın/erkek asgari sınırlarının altına inilmez). Protein hedefi:
  1.6-2.2 g/kg (varsayılan 1.8, ayarlanabilir). Ana ekranda iki sayı: kalan kcal, kalan protein.
- **Kayıt:** (a) kişisel yemek kütüphanesinden tek dokunuş; (b) "her zamanki" kalıpları — sistem saat+gün
  örüntüsünü öğrenir, tek butonlu onay sorusu üretir; (c) serbest metin/ses → Flash tahmini (porsiyon
  belirsizse tahmin + güven notu; gece muhasebecisi denetler); (d) fotoğraftan tahmin (v2 sonu, opsiyonel).
- **Kapalı döngü (14 günde bir job):** ortalama alım vs. kilo eğrisi karşılaştırılır. Önce kayıt tutarlılığı
  kontrol edilir (eksik günler çoksa döngü ayar YAPMAZ, "veri eksik" der). Tutarlılık yeterliyse bütçe
  100-150 kcal adımlarla ayarlanır, gerekçesiyle bildirilir ve `nutrition_targets`'a satır eklenir.
- Antrenman günü bütçesi +150-250 kcal (ayar). Akşam antrenmanı varsa gün içi protein dağılım uyarısı.
- Bildirim disiplini: gün içinde sessiz; sadece hiç kayıt yoksa akşamüstü tek dürtme + haftalık özet.
  Gece geç saatte "şu kadar kaloriniz kaldı" bildirimi YASAK.

### 8.5 Uyku ve Toparlanma
- v1 kaynağı: PWA'nın gece son etkileşim / sabah ilk etkileşim zamanları (kaba tahmin) → sabah kartında
  tek dokunuşla onay/düzeltme. (Cihaz kullanım API'sine erişim yok; dürüst tahmin + onay modeli.)
- **Toparlanma puanı** (0-100, deterministik): son 3 gece uyku süresi + son 48 saat antrenman hacmi.
  Kum dökücü düşük puanda o günkü antrenmanı hafifletir/kaydırır ve bunu gerekçeli bildirir.

### 8.6 Notlar ve Ders Katmanı
- Her dersin kartı: haftalık saatler (takvimden), sınav tarihleri, **dosya rafı**.
- Dosya girişi: PWA **Web Share Target** olarak kayıtlıdır — kullanıcı tablette herhangi bir PDF/dosyayı
  "Paylaş → Hayat OS" ile atar; sistem dosya adı + günün ders bloğuna bakarak dersi tahmin eder, emin
  değilse tek soruluk seçim sunar. (Android'de klasör izleme PWA'dan yapılamaz; paylaşım hedefi bu işin
  meşru yolu. README'ye kullanıcı için "indirdiğin notu 2 dokunuşla rafa at" akışını yaz.)
- **Samsung Notes butonu:** ders kartında "Samsung Notes'ta aç" — Android intent URL'i ile uygulamayı
  açmayı dener; başarısız olursa zarifçe düşer (buton yine de uygulama çekmecesine yönlendirir).
  Bu best-effort bir özellik; senk/entegrasyon denemesi YAPILMAZ.
- **Aralıklı tekrar (v3):** rafa düşen PDF'ten Flash 5-10 soru-cevap kartı üretir; kartlar günün ölü
  boşluklarına serpilir, sınav yaklaştıkça sıklaşır (SM-2 benzeri basit aralık algoritması yeter).

### 8.7 Defter (Ledger) ve Dışa Aktarma
- İstisnasız her etkileşim `ledger_entries`'e yazılır: kullanıcı ne dedi/ne bastı, hangi model ne anladı,
  hangi modüle ne yazıldı, sistem ne cevap verdi.
- Ses kayıtlarının saklanması AYAR: "sesleri de sakla / sadece metin" (varsayılan: sadece metin).
- **Defter ekranı:** kronolojik akış, tarih ve metin arama, kaynak modül filtresi.
- **Dışa aktarma:** tarih aralığı seç → JSON (makine) ve düz metin (insan: "13.07 09:42 — Sen: ... /
  Sistem: ...") indir. Yedeklere dahil.
- Düzeltme ilkesi: hiçbir satır silinmez/değiştirilmez; düzeltme yeni satırdır, eski satır
  `superseded_by` ile işaretlenir.

### 8.8 Ses Hattı (sıra tabanlı, GERÇEK ZAMANLI DEĞİL)
- PWA'da bas-konuş butonu → MediaRecorder ile kayıt → backend'e yükle → Flash'a SES DOSYASI olarak gönder.
- Flash'a tek prompt ile iki iş yaptırılır: (1) Türkçe transkript, (2) yapılandırılmış çıkarım.
  Çıktı şeması (Zod ile doğrulanır, bozuksa bir kez yeniden istenir):
  `{ transcript, intents: [{type: meal|workout_set|task|calendar_event|promise|pain|weight|sleep|decision|
  bureau_update|note|question|unknown, payload, confidence}] }`
- **Kural motoru önce çalışır:** sabit kalıplar ("yedim", "tamam", "X kilo", "başla/bitir") LLM'siz çözülür
  — bedava ve anında. Kalıba uymayan her şey Flash'a.
- Düşük güvenli çıkarımlar otomatik YAZILMAZ; onay kartına düşer. Yüksek güvenliler yazılır ve gece
  muhasebecisi denetler.
- Sistem cevabı: kısa Türkçe metin + (ayar açıksa) Cloud TTS sesi. TTS çıktıları hash'le önbelleklenir
  (aynı cümle iki kez sentezlenmez).

### 8.9 Bildirimler
- Sadece üç tip: (1) zamana bağlı (blok başlangıcı öncesi, ayarlanabilir önden süre), (2) kaçırılmakta olan
  şey (antrenman girilmedi, öğün hiç girilmedi, söz vadesi), (3) sabah brifingi (günde 1).
- Günlük toplam bildirim tavanı (varsayılan 6). Sessiz saatler (varsayılan 23.00-07.30) — brifing hariç
  hiçbir şey geçemez. Her bildirim `notifications_log`'a işlenir; haftalık muhasebe "hangi bildirimler hep
  yok sayılıyor" analizini yapar.

### 8.10 Sabah Brifingi
- Sabah ilk etkileşimde (veya sabit saatte push olarak) tek ekran, ~30 saniyelik: dün gece uyku onayı,
  bugünün en önemli 3 şeyi, gece muhasebecisinin düzeltme özeti + 1-3 sorusu, kritik söz/evrak, günün
  bütçeleri. "Sesli dinle" butonu → TTS.

### 8.11 Gece Muhasebecisi (OpenRouter)
- Her gece 02.00 job'ı: günün TÜM defteri + modül durum özetleri → OpenRouter üzerinden seçili güçlü modele.
- **Zorunlu istek ayarları:** `provider: { data_collection: "deny", order: [SABİT_SAĞLAYICI],
  allow_fallbacks: false }` + hesapta ZDR açık (README'de hesap ayar adımları: eğitim izni KAPALI, prompt
  logging KAPALI, %1 indirim tuzağına düşme). Model+sağlayıcı env'den: `AUDITOR_MODEL`, `AUDITOR_PROVIDER`.
- Üç görevi var: (1) **Denetim** — Flash çıkarımlarını kontrol et; bariz sayısal/takvimsel hataları düzelt
  (yeni ledger satırı + supersede), emin olmadıklarını SORU olarak ayır. (2) **Eksik avı** — söylenmiş ama
  kaydedilmemiş şeyler. (3) **Sentez** — sabah brifingi hammaddesi.
- **Yetki sınırı (koda gömülecek):** denetçi sayısal kayıtları ve takvim eşleşmelerini düzeltebilir;
  kullanıcının sözlerinin ANLAMINI yeniden yorumlayamaz, söz/karar metinlerine dokunamaz, silme yapamaz.
  Emin değilse düzeltmez, sorar. Düzeltmeler sabah brifinginde listelenir; kullanıcı tek dokunuşla geri alabilir.
- **Yedeklilik:** OpenRouter çağrısı başarısızsa (bakiye/çökme) aynı gece Gemini Pro ile koşulur ve deftere
  "yedek denetçi çalıştı" düşülür. O da başarısızsa ertesi gece iki günü birden toparlar; brifing durumu bildirir.
- Denetçi düzeltmeleri türlerine göre `ai_calls` + ayrı bir sayımda birikir → zamanla "Flash'ın hata haritası"
  raporu (v3 ekranı).

### 8.12 Haftalık Muhasebe (Pazar ritüeli)
- Pazar akşamı, hafta kurulumundan ÖNCE: plan uyumu %, kalori tutarlılığı, kilo ortalaması değişimi,
  söz tutma oranı, sürekli patlayan bloklar. Derin yorum: Gemini Pro.
- Kritik davranış: sistem **müzakere eder** — "Salı 17.30 antrenmanı 3 haftadır kaçıyor; saati kalıcı
  değiştirelim mi?" Kullanıcının itirazı ("bu hafta bayramdı, sayma") kayda geçer ve hesaba katılır.
- Haftalık dışa aktarma paketi: tek dosyada haftanın defteri + metrikler + denetim notları —
  kullanıcı bunu istediği harici akla (ör. Claude sohbetine) elle yapıştırıp ikinci görüş alabilir;
  dönen raporu "dış denetim" olarak deftere yapıştırma alanı var.

### 8.13 Sezonlar ve Zincirler
- Sezon: ad, aralık, hedefler (ör. "Yaz Okulu: 7 hafta, -3.5 kg, 26 antrenman"), kum anayasası.
  Sezon geçişinde (yaz okulu → staj) kurallar değişir; sezon sonunda **karne**: sayılar, foto karşılaştırma,
  Pro'nun sezon analizi.
- Zincirler: beslenme kaydı / antrenman uyumu / plan uyumu için ayrı sayaçlar; haftada 1 joker
  (bir kaçırma zinciri kırmaz). Kriz vitesi zinciri KIRMAZ, DONDURUR.

### 8.14 Kriz Vitesleri
- `hasta`, `sınav`, `yoğun` modları; tek dokunuş/tek cümleyle açılır. Her modun bildirim, kum ve hedef
  davranışı önceden tanımlı (hasta: antrenman donar, kalori bakım seviyesine, bildirim minimum;
  sınav: spor 2 güne iner, tekrar kartları agresifleşir; yoğun: beklentiler düşer, brifing kısalır).
- Otomatik geri dönüş kontrolü: hasta modu 5. günde sorar; çıkışta kademeli dönüş (ilk hafta ağırlıklar %80).

### 8.15 Bürokrasi Dosyaları
- Çok adımlı süreçler (staj evrakı, SGK, okul ödemeleri, pasaport...): adım listesi, her adımın durumu ve
  **topun kimde olduğu**. "Karşı tarafta" bekleyen adımlar için dürtme sayacı (varsayılan 3-4 iş günü):
  "Tein İK'dan evrak bekliyorsun, 4 iş günü oldu."

### 8.16 Karar Günlüğü
- İki cümlelik kayıt: karar + gerekçe; opsiyonel "şu tarihte hatırlat". Vadesinde motor geri getirir:
  "7 hafta önce şu gerekçeyle şunu seçmiştin — sonuç?" Kullanıcı sonuç notu düşer. Sezon karnesine girer.

### 8.17 Hayat Sorgusu (v3)
- Doğal dille kendi verini sorgulama: "omzum en son ne zaman ağrıdı?", "mayısta ortalama kaç kalori?"
- Mimari: Flash soruyu yapılandırılmış sorguya çevirir (tanımlı görünümler/fonksiyonlar üzerinden —
  serbest SQL ÜRETTİRME, güvenli sorgu kataloğu kullan), backend veriyi çeker, Flash cevabı Türkçe kurar,
  kaynak kayıtlara bağlantı verir.

### 8.18 Oyun/Ekran Bütçesi (v3)
- Oyun, haftalık bütçeli MEŞRU kum kategorisidir. Görevler tamamsa serilir; tam uyumlu haftada Cumartesi
  "hak edilmiş uzun seans" bloğu açılır. Modlama projeleri (Skyrim vb.) normal görev/proje olarak girilebilir.

---

## 9. YAPAY ZEKA KATMANI

### 9.1 Sağlayıcı Soyutlaması
- Tek arayüz: `AiProvider { complete(req), transcribeAndParse(audio, req), health() }`.
  Uygulamalar: `GeminiFlashProvider`, `GeminiProProvider`, `OpenRouterProvider`.
  Hangi işin hangi sağlayıcıya gittiği tek config dosyasında: parse→flash, deep→pro,
  auditor→openrouter(fallback: pro). Yarın Anthropic API eklemek = yeni provider + 1 satır config.

### 9.2 Prompt Şablonları (docs/prompts/ altında, Türkçe, versiyonlu)
- `parse.md` — ses/metin → intents şeması. Kurallar: uydurma yok, belirsizse confidence düşür,
  porsiyon/süre bilinmiyorsa payload'a `assumed: true` işaretle.
- `auditor.md` — denetçinin görev tanımı + YETKİ SINIRI metni (8.11) aynen gömülü + çıktı şeması
  `{corrections[], questions[], missing[], synthesis}`.
- `weekly.md`, `season.md`, `lifequery.md`.

### 9.3 Mahremiyet Yönlendirmesi
- `sensitivity=sensitive` etiketli veriler: vücut fotoğrafları ve ham konum HİÇBİR modele gitmez
  (fotoğraf yorumu istenirse kullanıcı ekranda açıkça onaylar; bu onay ledger'a işlenir).
  Ağrı/ölçüm metinleri Vertex'e gidebilir; OpenRouter'a giden gece paketinden foto/konum HER KOŞULDA ayıklanır.

### 9.4 Maliyet Korkulukları (kodda zorunlu)
- Her provider çağrısı `ai_calls`'a yazılır (yazan middleware olmadan çağrı yapmak imkânsız olacak şekilde
  tasarla). Günlük tavanlar env'den: `FLASH_DAILY_CAP` (vars. 200), `PRO_DAILY_CAP` (vars. 5),
  `AUDITOR_DAILY_CAP` (vars. 2), `TTS_DAILY_CAP` (vars. 60). Tavan aşımında çağrı reddedilir, kullanıcıya
  nazik hata + brifinge not. Aylık tahmini harcama Ayarlar ekranında görünür.

### 9.5 Hesap Tarafı (README'ye zorunlu runbook)
- GCP: bütçe + alarm kurulumu; Vertex/AI Studio anahtar alma; Cloud TTS etkinleştirme; Calendar API OAuth
  onay ekranı (kişisel, test modu yeterli).
- OpenRouter: bakiye yükleme (önden ödemeli = yapısal sigorta), eğitim izni KAPAT, prompt logging KAPAT,
  ZDR AÇ, model+sağlayıcı seçimi.

---

## 10. GÜVENLİK VE MAHREMİYET

- Tek kullanıcı; kayıt uçları setup token'sız ÇALIŞMAZ. WebAuthn zorunlu; PIN yedeği (argon2 hash).
- **Hassas Kasa:** progress fotoğrafları, ağrı geçmişi, karar günlüğü — bu ekranlar her açılışta taze
  biyometrik doğrulama ister; dosyalar diskte şifreli.
- Tüm trafik TLS; API rate limit; CORS yalnız kendi origin.
- Uygulama açık unutulursa: 10 dk hareketsizlikte kilit ekranı (salon modu istisna, süresi blokla sınırlı).

## 11. YEDEKLEME VE TAŞINABİLİRLİK
- Gece job'ı: `pg_dump` + şifreli dosya klasörü → tar → GCS bucket'a (30 gün saklama, yaşam döngüsü kuralı).
  Opsiyonel ikinci hedef (rclone ile kullanıcının seçeceği yer). Ayda bir "yedekten dönüş provası" runbook'u.
- `infra/` tek başına yeni bir VM'de sistemi ayağa kaldırabilmeli: `docker compose up` + `.env` + son yedek
  = taşınma tamam. Bunu README'de "Göç Planı" başlığıyla belgele.

## 12. ÇEVRİMDIŞI DAVRANIŞ (PWA)
- Service worker: kabuk önbellekli; salon modu, hızlı kayıt butonları, defterin son 7 günü çevrimdışı çalışır.
- Yazma işlemleri IndexedDB kuyruğuna düşer; bağlantı gelince sırayla senklenir (idempotency key ile).
- Beyin isteyen işler (ses çözme, öneri) çevrimdışıyken "işlenecekler" rafında bekler ve bunu dürüstçe gösterir.

---

## 13. FAZ PLANI VE KABUL KRİTERLERİ

**Faz 0 — İskelet (1. haftanın ilk yarısı)**
Monorepo, Docker Compose, Postgres+migration, Caddy+TLS, WebAuthn girişi, boş PWA kabuk, push aboneliği,
gece yedek job'ı, ai_calls altyapısı.
✅ Kabul: Tabletten HTTPS ile giriş yapılıyor, test bildirimi düşüyor, yedek GCS'de görünüyor.

**Faz 1 — Çekirdek düzen (1.-2. hafta)**
Google Calendar çift yönlü senk, kaya/kum + Pazar kurulumu v1, görevler, Defter altyapısı + ekranı,
Şu An kartı v1, bildirim tipleri, ses hattı v1 (bas-konuş → Flash parse → onay/kayıt), sabah brifingi (metin).
✅ Kabul: "Yarın 15.00 dişçi, Perşembe rapor teslimi" diye KONUŞUNCA takvime kaya + görev düşüyor ve ikisi de
defterde izlenebiliyor; sabah brifingi geliyor; uygulama kapalıyken blok bildirimi çalışıyor.

**Faz 2 — Beden (3.-4. hafta)**
Egzersiz import, program şablonu + salon modu (çevrimdışı), progressive overload, tartı+7g ortalama,
foto (hayalet bindirme, kasada), beslenme tam paketi (hedef, kütüphane, "her zamanki", ses/metin kayıt,
antrenman günü bütçesi), TTS sesli brifing, uyku v1.
✅ Kabul: Salonda internetsiz tam antrenman girilip sonra senkleniyor; "öğlen tavuk pilav yedim" sesi
bütçeden düşüyor; hafta sonunda ilk foto karşılaştırması alınabiliyor.

**Faz 3 — Vicdan ve sinir sistemi (5.-7. hafta)**
Gece Muhasebecisi (OpenRouter + Pro yedeği + sabah soruları), kapalı döngü (14 gün), haftalık muhasebe +
dışa aktarma paketi, Söz Defteri, sezonlar+zincirler+karne, kriz vitesleri, bürokrasi dosyaları,
karar günlüğü, notlar köprüsü (share target + ders kartları + Samsung Notes butonu), Hayat Sorgusu v1,
oyun bütçesi, ağrı filtresi.
✅ Kabul: Bir tam "gün döngüsü" uçtan uca çalışıyor: gündüz sesli kayıtlar → gece denetim → sabah brifinginde
düzeltme+soru → Pazar muhasebe → hafta kurulumu. Staj sezonuna geçiş provası yapılmış.

**Kesme kuralı:** Yaz okulu bitişine 1 hafta kala neredeysek orada durulur, Faz 3'ün kalanları rafa yazılır;
ÇALIŞAN sistem her zaman yarım vizyondan üstündür.

## 14. GELECEK RAFI (v4 — ŞİMDİ KODLANMAYACAK, sadece backlog dosyası aç)
Deney modu; kamerayla tekrar sayma/form sinyali; "ne olurdu" sezon simülasyonu; aralıklı tekrarın gelişmişi;
RuView/ESP32 presence + gece uyku sinyali; yüz tanımayla otomatik uyanma; foto→pose metrikleri;
Anthropic API'nin denetçi seçeneği olarak eklenmesi.

## 15. YAPMA LİSTESİ (non-goals)
Çok kullanıcılı yapı; herkese açık yayın; App Store/Play paketi; finans/portföy modülü; ruh hali anketleri;
sosyal özellikler; lokal model çalıştırma; Samsung Notes ile veri senkronizasyonu; gerçek zamanlı sesli diyalog;
Claude aboneliğinin programatik kullanımı.

## 16. ORTAM DEĞİŞKENLERİ (.env.example'a koy)
`DOMAIN, SETUP_TOKEN, DATABASE_URL, SODIUM_MASTER_KEY, VAPID_PUBLIC/PRIVATE, GOOGLE_OAUTH_CLIENT_ID/SECRET,
GEMINI_API_KEY (veya Vertex kimliği), GCP_TTS_KEY, GCS_BACKUP_BUCKET, OPENROUTER_API_KEY, AUDITOR_MODEL,
AUDITOR_PROVIDER, FLASH_DAILY_CAP, PRO_DAILY_CAP, AUDITOR_DAILY_CAP, TTS_DAILY_CAP, QUIET_HOURS, TZ=Europe/Istanbul`

---

## 17. İLK MESAJIN GÖREVİ
Bu anayasayı okuduktan sonra: (1) anlamadığın/çelişkili bulduğun maddeleri listele ve sor;
(2) Faz 0 için dosya-dosya iş planını çıkar; (3) onayımı aldıktan sonra Faz 0'ı kur.
Kod yazmaya benden "başla" onayı gelmeden başlama.
