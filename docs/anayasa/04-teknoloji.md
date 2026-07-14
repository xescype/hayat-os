# 04 — Teknoloji Seçimleri (Detaylı Açıklama)

Her seçimin yanında "neden bu, neden alternatifi değil" gerekçesi.

## TypeScript monorepo (pnpm workspaces)
Tek dil uçtan uca: backend, frontend ve paylaşılan tipler aynı dilde → API sözleşmesi `packages/shared`
içindeki Zod şemalarıyla TEK yerde tanımlanır, iki taraf da import eder. "Backend değişti, frontend
haberi yok" sınıfı hatalar derleme anında yakalanır. Rust backend fikri bilinçli terk edildi:
öğrenme değeri var ama 5-7 haftalık pencerede hız öldürür; Rust merakı v4'te ESP32 tarafına saklanır.

## Hono/Fastify + Zod
İkisi de hafif ve hızlı; ajan seçer, gerekçeyi README'ye yazar. Zod ZORUNLU katmandır: dıştan gelen
her veri (HTTP body, Gemini çıktısı, OpenRouter çıktısı, Calendar webhook) şemadan geçmeden iç
dünyaya giremez. Yapay zeka çıktısının şema doğrulaması özellikle kritik: model şemaya uymazsa bir
kez "şemaya uy" diye yeniden istenir, yine uymazsa iş onay kartına düşer — asla ham/bozuk JSON
veritabanına sızmaz.

## PostgreSQL 16 + Drizzle
Tek veritabanı, her şey içinde: ilişkisel veri, jsonb esnek alanlar, job kuyruğu, tam metin arama
(defter araması için `pg_trgm`/tsvector yeter — ayrı arama motoru KURULMAZ). Drizzle: hafif,
TS-native, migration'ları SQL olarak görünür — sihir yok, taşınabilirlik yüksek.

## Redis'siz kuyruk kararı
1GB RAM'li makinede her ek süreç lükstür. İş hacmi komik derecede düşük (günde onlarca job); Postgres
`jobs` tablosu + 30 saniyelik poller fazlasıyla yeter. Tasarım gerekleri: her job idempotent yazılır
(iki kez çalışsa zarar vermez), `run_after` + `locked_until` kolonlarıyla çakışma önlenir, sonuç ve
hata tabloya işlenir. VM yeniden başlarsa poller kaçanları görür ve telafi eder — "kaçırılan gece
muhasebesi ertesi gece iki günü toparlar" davranışının altyapısı budur.

## WebAuthn/passkey
Parola tabanlı giriş kurulmaz. Cihazın biyometrisi (parmak izi/yüz) passkey olarak kaydedilir;
"sadece bana açılsın" gereksinimi böylece kendi yazdığımız kırılgan bir yüz tanıma yerine işletim
sisteminin donanım destekli kilidiyle çözülür. Tek dikkat: WebAuthn https + sabit origin ister →
domain ve Caddy Faz 0'da şart. PIN yedeği (argon2) biyometrinin çalışmadığı durumlar için.

## Caddy
Nginx yerine Caddy: otomatik TLS, iki satır config. Reverse proxy + statik PWA servisi + güvenlik
başlıkları (HSTS, CSP) tek dosyada.

## libsodium ile uygulama katmanı şifreleme
Foto ve ses dosyaları diske sealed-box şifreli yazılır; anahtar `.env`'de. Neden disk şifrelemesi
değil: VM diski platform tarafından zaten şifreli olabilir ama yedekler ve göç senaryosunda dosyalar
platform dışına çıkar — uygulama katmanı şifreleme, dosyanın NEREDE olursa olsun kapalı kalmasını
sağlar. Anahtar kaybı = dosya kaybı; anahtarın yedeği kullanıcının parola kasasına (runbook'ta adım).

## PWA teknolojileri
Vite + React; service worker'da: app-shell önbelleği, IndexedDB yazma kuyruğu, Web Share Target
(not dosyaları için), Web Push aboneliği, Wake Lock (salon modu), MediaRecorder (ses). Bilinçli
sınır: Play Store paketi, Capacitor sarmalayıcı vs. YOK — tarayıcı PWA'sı bu ihtiyaç setini karşılıyor
ve dağıtım/güncelleme derdi sıfır (deploy = herkes güncel).
