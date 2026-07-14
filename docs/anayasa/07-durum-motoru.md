# 07 — Durum Motoru (Detaylı Açıklama)

## Görev tanımı ve sınırı
Motor tek bir saf fonksiyondur: `getNowCard(snapshot) → Card`. Snapshot, modül servislerinin
sağladığı okumalardan derlenir (saat, aktif blok, sıradaki blok, bugünkü kayıt durumları, bütçeler,
açık dürtmeler, toparlanma puanı, aktif sezon+vites, opsiyonel konum sınıfı). Motor YAZMAZ, sadece
karar üretir — bu yüzden yüzlerce senaryo milisaniyede test edilir.

## Neden LLM değil kural motoru?
Kart günde onlarca kez, anında ve bedava üretilmeli; ayrıca DETERMİNİSTİK olmalı — aynı durumda aynı
kart. LLM'e yaptırılan kart üretimi hem maliyet hem tutarsızlık (her seferinde farklı üslup/öncelik)
getirir. LLM'in yeri içerik zenginleştirmedir (yemek önerisi metni gibi), önceliklendirme değil.

## Öncelik merdiveni (v1 — kod bunun birebir karşılığı olmalı)
1. **İçinde bulunulan blok** → bloğun kendi kartı (salon modu, ders kartı, çalışma kartı).
2. **≤60 dk sonra başlayan kaya** → hazırlık kartı; beslenme penceresi kesişiyorsa yemek önerisi eklenir.
3. **Kaçmakta olan şey** (kapanış sırasıyla): antrenman penceresi daralıyor; antrenman öncesi öğün
   penceresi kapanıyor; gün bitiyor ve hiç öğün kaydı yok.
4. **Açık dürtmeler:** muhasebeci soruları > söz vadesi > bürokrasi dürtmesi > görev vadesi.
5. **Varsayılan:** günün kalan akışı özeti + bütçe durumu.
Vites etkisi: hasta modunda 1-3 kademeleri bastırılır, kart dinlenme odaklıdır; sınav modunda ders/tekrar
kartları 3. kademeye yükselir.

## Kart sözleşmesi
```
Card { title, lines[≤3], actions[≤2] {label, intent}, tone: normal|urgent|calm, sourceSignals[] }
```
`sourceSignals` hata ayıklama içindir: kartın NEDEN bu kart olduğu ekranda (geliştirici modunda)
görünür — "motor niye bunu gösterdi" sorusu asla kara kutu kalmaz.

## Tüketiciler
Aynı fonksiyondan üç tüketici beslenir: (1) PWA ana ekranı (poll/refresh ile), (2) bildirim üretici
(kart tone=urgent'a döndüğünde ve tavan/sessiz saat kuralları izin verdiğinde push), (3) sabah
brifingi (günün ilk kartı + gece çıktılarıyla zenginleştirilmiş kompozisyon). Tek kaynak ilkesi:
bildirimin söylediği ile ekranın gösterdiği asla çelişmez.

## Zorunlu test senaryoları (en az bunlar)
ders öncesi 45 dk + protein geride; antrenman günü akşam, kayıt yok; her şey boş Pazar öğleni;
hasta vitesi + antrenman saati; sınav haftası + boş 20 dk; gece 23.30 (sessiz saat) + söz vadesi;
muhasebeci sorusu + yaklaşan kaya çakışması (soru kaybolmamalı, kuyruklanmalı); çevrimdışı snapshot
(eldeki son veriyle kart yine üretilir, "güncel olmayabilir" işaretiyle).
