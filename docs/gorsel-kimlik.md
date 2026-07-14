# Görsel Kimlik — "Gece Matbaası" (v0)

> Değerler **v0**. İlk gerçek ekranlarda kullanıcıyla ayar turu yapılacak. Tailwind config bu dosyanın
> tek gerçek kaynağıdır (`apps/pwa/tailwind.config.ts` buradan türetilir). Değişiklik önce burada.

## Felsefe
Karanlık, sessiz, matbaa disiplininde bir yüzey. Süs yok; hiyerarşi punto ve boşlukla kurulur.
Sistem azarlamaz — arayüz de bağırmaz. Kritik sayılar (kalori, kilo, ağırlık) ekranın yıldızıdır.

## Zemin ve yüzey
- Sayfa zemini: dikey gradyan `#0A0A0C → #141418` (üstten alta).
- Yüzey/kart dolgusu: zeminin bir tık üstü, düz renk (gölge YOK).
- Bölücüler: hairline `rgba(255,255,255,0.08)`, 1px.
- **Gölge YASAK.** Derinlik hairline + yüzey tonuyla kurulur.

## Geometri
- Köşe yarıçapı: TEK değer, `--radius: 5px` (4-6px bandı; tek değer kullan).
- Boşluk skalası: 4px taban (4, 8, 12, 16, 24, 32, 48...).

## Renk
Nötr gri skalası + **TEK vurgu ailesi: kızıl-bordo.** Kahve/kehribar/altın YASAK.

| Rol | Token | Değer |
|---|---|---|
| Zemin üst | `--bg-top` | `#0A0A0C` |
| Zemin alt | `--bg-bottom` | `#141418` |
| Yüzey | `--surface` | `#161619` |
| Hairline | `--hairline` | `rgba(255,255,255,0.08)` |
| Metin ana | `--text` | `#EDEDEF` |
| Metin ikincil | `--text-dim` | `#9A9AA2` |
| Metin soluk | `--text-faint` | `#6A6A72` |
| Vurgu (başlık/vurgu metni) | `--accent` | `#C4374A` (açık kızıl-bordo) |
| Vurgu detay (çizgi/etiket) | `--accent-deep` | `#7A2230` (koyu bordo) |
| Vurgu dolgu (geniş yüzey) | `--accent-fill` | `#5A1A26` (derin bordo) |

Gri skala (nötr, mavi/sıcak kaymaz): `#0A0A0C · #141418 · #1E1E22 · #2A2A30 · #3A3A42 · #6A6A72 · #9A9AA2 · #EDEDEF`.

## Tipografi
- **TEK grotesk aile.** Aday: **Geist** (öneri) vs **Space Grotesk**.
  - Öneri **Geist**: üstün tabular rakamlar, UI-odaklı, sayı-ağırlıklı ekranlarda net.
  - Space Grotesk: "daha karakterli matbaa" alternatifi — ilk ekranda yan yana bakılacak.
  - `--font-sans` değişkeni ile tek noktadan değiştirilir.
- **Tabular rakamlar zorunlu:** `font-variant-numeric: tabular-nums` (sayılar hizalı akar).
- Serif YOK.
- Hiyerarşi punto şiddetiyle: dev başlık / küçük sıkı gövde. Ara kademe azalt.
  - `display` ~48-64px (kritik sayılar), `h1` ~28px, `h2` ~20px, `body` ~14px, `label` ~12px sıkı.

## Animasyon — cömert ama tek dilli
- Easing TEK tip: `ease-out`, süre 150-250ms (`--ease: cubic-bezier(0.16,1,0.3,1)`, `--dur: 200ms`).
- Giriş: stagger 30-50ms (liste öğeleri sırayla belirir).
- Önemli olay: TEK seferlik shine-sweep (parıltı geçişi).
- Sayı değişimi: sayı rulosu (roll) animasyonu.
- **YASAK:** paralaks, sonsuz döngü süs, dekoratif hareket.

## Bileşen seti (Faz 0 kabuğuna dahil)
kart · buton (primary=accent dolgu, ghost=hairline) · girdi · rozet · hairline divider.
Hepsi yukarıdaki token'ları kullanır; sabit hex gömmek YASAK.
