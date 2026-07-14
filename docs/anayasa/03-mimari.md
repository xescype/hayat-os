# 03 — Kesinleşmiş Mimari (Detaylı Açıklama)

## Kuşbakışı akış
Sistem üç katmandır: **yüz** (PWA — tablet/telefon), **kalp** (GCP VM'deki backend + veritabanı +
zamanlayıcı) ve **dış akıllar/servisler** (Gemini, OpenRouter, Cloud TTS, Google Calendar, Web Push).
Yüz hiçbir dış servise doğrudan konuşmaz; her şey kalpten geçer. Bunun üç sebebi var: anahtarlar
cihazda durmaz, her çağrı sayaçtan ve defterden geçer, cihaz değişse/kaybolsa sistem etkilenmez.

## Neden sunucu var? (tablette çalışsın itirazına cevap)
Üç iş tablete taşınamaz: (1) **zamanlayıcı** — "07.30 brifing", "girilmemiş antrenmanı 20.00'de dürt",
"Pazar haftayı kur" işleri uygulama kapalıyken çalışmalı; Android arka plan işleri acımasızca öldürür.
(2) **bildirim itici** — kapalı uygulamaya dışarıdan dokunabilen el sunucudur. (3) **süreklilik** —
verinin tek gerçek kopyası, gece yedeği, model çağrılarının tek noktadan yönetimi. Kullanıcının
GÖRDÜĞÜ her şey tablette; kullanıcıyı DÜŞÜNEN kısım sunucuda.

## VM boyutlandırma mantığı
e2-micro (2 paylaşımlı vCPU, 1GB RAM) başlangıç: Node API + Postgres + Caddy bu yükü taşır çünkü
sistemde CPU-yoğun iş kalmadı — ses çözme Gemini'ye taşındı (Whisper'ın sunucudan atılma sebebi tam
buydu). RAM sıkışırsa belirtiler: OOM kill, yavaş sorgular → e2-small'a (2GB) dikey büyüme; compose
sayesinde 10 dakikalık iş. Swap dosyası (1GB) kurulumda açılır, güvenlik payı.

## Dış servislerin rolleri ve sınırları
- **Gemini Flash:** gündüz beyni. Ses dosyasını DOĞRUDAN alır (ayrı STT katmanı yok) — tek çağrıda
  transkript + yapılandırılmış çıkarım. Ucuz ve hızlı; günde onlarca çağrı normal.
- **Gemini Pro:** derin yorum (haftalık muhasebe, sezon karnesi) + gece muhasebecisinin yedeği.
  Günde 0-5 çağrı.
- **OpenRouter:** TEK görevi gece muhasebeciliği. Günde 1 (yedek denemeyle azami 2) çağrı. Sıkı
  mahremiyet ayarlarıyla (ZDR, deny, sabit sağlayıcı, fallback kapalı).
- **Cloud TTS:** Türkçe seslendirme; ücretsiz kota içinde yüzer. Önbellek zorunlu.
- **Google Calendar:** takvimin tek gerçek kaynağı — sistem kendi ajandasını icat etmez.
- **Web Push:** bildirim borusu; VAPID anahtarları sunucuda.

## "YOK" listesinin gerekçeleri
- **Lokal model yok:** çalıştıracak donanım yok (profil gerçeği). Mimari buna ağlamaz; bulut tarafı
  zaten tam kapsar. İleride donanım gelirse provider soyutlaması lokal uca da açılabilir (v4 rafı).
- **Vercel yok:** frontend statiktir, Caddy servis eder; ikinci platform = ikinci bakım yükü + göç
  planının karmaşıklaşması. Kazanım sıfıra yakın.
- **Oracle yok:** hesap platform tarafından kapatıldı; ders alındı (taşınabilirlik paranoyası).
- **Claude aboneliği backend'e bağlanmaz:** OAuth token'ı resmi istemci dışında kullanmak kullanım
  şartı ihlali ve hesap kapatma riski; Claude Code'u sunucuda abonelikle cron koşturmak gri alan +
  kırılgan (limitler ortak, oturum yenilenmesi insansız ortamda ölür). Güçlü dış akıl ihtiyacı
  OpenRouter'la, meşru ve önden ödemeli şekilde karşılanır.
- **Yüz tanıma / RuView yok (şimdilik):** kimlik işini cihazın test edilmiş biyometrisi (WebAuthn)
  daha güvenli ve sıfır maliyetle çözer; presence donanımı sistemin çekirdek değerine girmez → v4.

## Veri akışı örneği (uçtan uca, referans senaryo)
"Salondan çıkarken sesli not" → PWA kaydeder → çevrimdışıysa kuyruğa, değilse hemen API'ye →
API sayaç kontrolü → Gemini Flash'a ses + parse prompt'u → dönen intents Zod'dan geçer →
yüksek güvenliler modüllere yazılır (workout_sets, pain_logs), düşükler onay kartına →
hepsi ledger'a → cevap metni üretilir → (ayar açıksa) TTS → PWA'ya döner. Gece 02.00'de bu
kayıtlar muhasebeci paketine girer.
