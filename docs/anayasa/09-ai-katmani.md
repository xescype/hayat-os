# 09 — Yapay Zeka Katmanı (Detaylı Açıklama)

## Sağlayıcı soyutlamasının anatomisi
`AiProvider` arayüzünün varlık sebebi üçlüdür: (1) model değiştirmek konfig değişikliği olsun,
kod değişikliği değil; (2) her çağrı tek boğazdan geçsin (sayaç + defter + hata yönetimi);
(3) yarın eklenecek sağlayıcı (ör. Anthropic API) mevcut koda dokunmasın. Uygulama detayı:
provider'lar `ai/providers/` altında, iş-sağlayıcı eşlemesi `ai/routing.ts`'te tek nesne:
`{ parse: 'flash', deep: 'pro', auditor: 'openrouter', auditorFallback: 'pro', lifequery: 'flash' }`.

## Prompt şablonları rejimi
Şablonlar `docs/prompts/`ta markdown olarak yaşar, koda gömülmez — kullanıcı okuyabilir, sürüm
geçmişi git'te izlenir. Her şablonun başında sözleşme bloğu: girdi değişkenleri, beklenen çıktı
şeması (Zod adıyla), yasaklar. Ortak yasaklar her şablonda tekrarlanır: UYDURMA YOK (bilinmeyen
değer null + assumed işareti), kullanıcı sözünü yeniden yazma YOK, Türkçe çıktı, şema dışı metin YOK.
Parse şablonu az-örnekli (few-shot) çalışır: 6-10 gerçekçi Türkçe örnek (yemek, set, söz, ağrı,
karışık cümle, alakasız gevezelik→note) şablonun içindedir ve test seti bu örneklerle paraleldir.

## Çıktı doğrulama boru hattı
Model çıktısı → JSON parse → Zod şema → başarısızsa TEK yeniden deneme ("şu şemaya uy" + hata) →
yine başarısızsa: parse işlerinde onay kartına düşür, denetçide Pro yedeğine geç, derin yorumda
kullanıcıya dürüst hata. Hiçbir koşulda şemasız veri modüle yazılmaz. Her doğrulama başarısızlığı
ai_calls'a `ok=false` + sebep olarak işlenir — hata haritası buradan da beslenir.

## Maliyet middleware'i
Tasarım: provider'ların `complete()` metodu, `withMetering(purpose)` sarmalayıcısı olmadan
ÇAĞRILAMAZ (tip sisteminde zorla: ham metot private). Sarmalayıcı sırasıyla: günlük tavan kontrolü
(purpose bazlı) → çağrı → token/maliyet hesabı → ai_calls insert → hata sınıflaması (kota/ağ/model).
Tavana takılan çağrının kullanıcı yüzü naziktir: "Bugünlük yapay zeka bütçesi doldu; bu iş yarın
sabaha kuyruklandı" + brifing notu. Fiyat tablosu `ai/pricing.ts`te elle güncellenir; bilinmeyen
model için muhafazakâr varsayılan fiyat kullanılır (sürpriz iyimserlik yerine sürpriz kötümserlik).

## Mahremiyet yönlendirmesi — uygulama kuralları
- sensitivity alanı ledger'a yazım ANINDA belirlenir (kaynağa göre: pain→sensitive, foto→sensitive,
  decision→sensitive, konum→sensitive; gerisi normal).
- Gece paketi derleyicisi bir FİLTRE fonksiyonundan geçer; filtre testlidir: pakete foto path'i,
  konum, karar metni sızdıran her değişiklik testte patlar.
- Foto yorumu akışı: kullanıcı kasada "bu karşılaştırmayı yorumlat" der → onay diyaloğu hangi
  sağlayıcıya gideceğini AÇIKÇA yazar → onay ledger'a işlenir → yalnız o istekte foto gönderilir.
- OpenRouter istek gövdesinde `provider: {data_collection:"deny", order:[AUDITOR_PROVIDER],
  allow_fallbacks:false}` sabittir; bu üçlü olmadan OpenRouter çağrısı yapan kod merge EDİLEMEZ.

## Model seçim protokolü (denetçi için)
İlk 2 hafta denetçi Gemini Pro'yla çalışır (OpenRouter kurulumu Faz 3'te). OpenRouter devreye
girince "yarışma modu" job'ı: aynı gece paketi iki modele, çıktılar yan yana bir karşılaştırma
ekranında; kullanıcı 3-5 gece sonunda kalıcı modeli seçer, seçim env'e yazılır. Sistem kendi model
seçiminin test ortamıdır — dışarıdan benchmark'a güvenilmez, kendi verinde kim iyi ona bakılır.
