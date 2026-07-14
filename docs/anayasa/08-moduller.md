# 08 — Modül Spesifikasyonları (Detaylı Açıklama)

Bu dosya, anayasadaki 18 alt modülün her birinin tasarım gerekçesini ve uygulama inceliklerini açar.

## 8.1 Planlayıcı ve Takvim
Google Calendar'ın tek gerçek kaynak olması "kolaylık" değil, senkron cehenneminden kaçıştır: iki
ajanda tutan her sistem eninde sonunda çelişir. Yerel `calendar_blocks` bir AYNA + metadata deposudur;
çelişkide Google kazanır, yerel meta yeni event'e yeniden bağlanır. Senk döngüsü: syncToken ile artımlı
çekim; webhook (push channel) kurulabiliyorsa gecikme saniyelere iner, kurulamıyorsa 5-15 dk polling
kabul edilir. Kum dökücünün algoritması açgözlü (greedy) yerleştirme + kural kontrolüdür; optimizasyon
mükemmelliği aranmaz — "makul hafta + kullanıcı düzeltmesi" hedefi yeterlidir, çünkü Pazar onay ekranı
zaten insan denetimi içerir. Çökme yönetiminde yeniden yerleştirme EN FAZLA hafta sonuna kadar bakar;
haftalar arası borç taşınmaz (borç birikimi sistemi suçluluk makinesine çevirir).

## 8.2 Görevler ve Söz Defteri
Söz ayıklama parse prompt'unun bir intent'idir; kalıp ipuçları (gelecek zaman + birinci tekil +
eylem) prompt'ta örneklerle verilir. Yanlış pozitif ("belki yaparım" gibi) maliyeti düşük tutulur:
söz oluşurken bildirim ATILMAZ, sadece deftere düşer; kullanıcı Söz ekranında yanlışları tek dokunuşla
iptal eder. Dürtme yalnız vade tahmini geçince başlar. Söz metriği haftalık muhasebede "tutulan/verilen"
oranı olarak görünür — amaç utandırmak değil, kullanıcının kendi ağzından çıkanla yüzleşme aynası.

## 8.3 Spor
Salon modunun çevrimdışı-tam çalışması pazarlıksızdır: salon = en kötü sinyal ortamı + en yüksek
kayıt anı. Bu yüzden aktif antrenman verisi (program, geçen seferki setler) blok başlamadan ÖNCE
cihaza önceden indirilir (prefetch job'ı: blok-30dk). Progressive overload kuralının deterministik
olması bilinçli: kas gelişiminin motoru tutarlılıktır, "akıllı" dalgalanma değil; LLM'in fikri ancak
haftalık muhasebede programın KENDİSİ hakkında olabilir. Hayalet fotoğraf bindirme websel olarak
basittir (önceki foto, opacity 0.3, üstte canlı kamera) ama karşılaştırılabilirlik değerini katlar.
Ağrı filtresinde eşleştirme egzersiz metadata'sındaki kas/eklem etiketleriyle yapılır; medikal bilgi
tabanı METİN kaynağıdır (alternatif önerisinin açıklaması için), karar kaynağı değildir.

## 8.4 Beslenme
"Her zamanki" mekanizması şöyle öğrenir: aynı gün-tipi + saat penceresi + benzer kayıt 3 kez
tekrarlanınca kalıp adayı doğar; 5 kezde tek-buton onay sorusu aktifleşir. Kalıplar kullanıcıya
Ayarlar'da görünür ve silinebilir (kara kutu yasak). Kapalı döngünün "önce tutarlılık kontrolü"
adımı sistemin dürüstlük sigortasıdır: eksik veriyle bütçe kısan sistem, kullanıcıyı gerçekte
olmayan bir platoya karşı aç bırakır. Ayar adımı ±100-150 kcal ile sınırlıdır ve iki döngü (28 gün)
üst üste aynı yönde ayar gerekirse sistem "hedef temposunu konuşalım" kartı çıkarır — sonsuz kısma
spirali donanımsal olarak engellenir. Asgari taban (erkek ~1500 kcal) kodda sabittir; döngü bunun
altına ASLA inmez.

## 8.5 Uyku ve Toparlanma
PWA'nın görebildiği tek şey kendi etkileşim zamanlarıdır; bu dürüstçe "tahmin" olarak sunulur ve
tek dokunuş onay istenir. Toparlanma puanı formülü basit tutulur (v1): uyku saati hedeften sapma
puanı + son 48 saat tonaj yükü puanı; 0-100 ölçeği. Puanın TEK tüketicisi kum dökücü ve motor
kartıdır; kullanıcıya "skorun 62" diye sayı fetişi yapılmaz, etkisi gösterilir ("dün az uyudun,
bugünkü antrenmanı hafiflettim").

## 8.6 Notlar ve Ders
Web Share Target, PWA'nın Android paylaşım menüsüne girmesidir — "indirilen dosyayı otomatik algıla"
isteğinin tarayıcı dünyasındaki meşru karşılığı (arka planda klasör izleme PWA'da yoktur; bunu
dürüstçe kabul edip 2-dokunuşluk akışı cilalamak, yarım çalışan bir hack'ten iyidir). Ders tahmini:
paylaşım anındaki aktif/yakın ders bloğu + dosya adında ders anahtar kelimesi; ikisi çelişirse sor.
Samsung Notes butonu intent denemesidir; başarı garanti edilmez ve edilmediği README'de yazar —
beklenti yönetimi de tasarımın parçasıdır.

## 8.7 Defter
Defterin ürün karşılığı "hayatın işlem günlüğü"dür: sohbet geçmişi + kayıt geçmişi + düzeltme
geçmişi tek zaman çizgisinde. Dışa aktarmada insan formatı bilinçli sade tutulur (tarih — konuşan:
metin); JSON formatı ise supersede zincirini ve module_writes'ı tam içerir. Ses saklama ayarı
kapalıyken ses dosyası transkript sonrası SİLİNİR (disk ve mahremiyet); açıkken şifreli klasöre gider.

## 8.8 Ses Hattı
Kural motoru → LLM sıralaması maliyet VE hız içindir: "yedim", "tamam", "58.4" gibi girdilerin
Gemini'ye gitmesi israftır. Kural seti packages/shared'da regex+parser olarak yaşar ve testlidir.
Flash'ın intent şemasında `confidence` zorunludur; eşik (vars. 0.75) config'tedir. Onay kartı UX'i:
"Şunu anladım: [öğle: tavuk pilav ~650 kcal] — Doğru / Düzelt". Cevap üretiminde şablon önceliklidir
(deterministik metinler), LLM cevabı yalnız serbest sorulara.

## 8.9 Bildirimler
Bildirim ekonomisi ilkesi: her bildirim bir güven harcamasıdır. Tavan (6/gün) ve sessiz saatler
kodda zorlanır; hiçbir modül doğrudan push atamaz, hepsi notification servisinden geçer (tavan
muhasebesi tek yerde). Haftalık muhasebedeki "yok sayılan bildirim" analizi, tıklanma/görülme
verisiyle beslenir ve sistemin kendi gürültüsünü kısmasına yarar: 3 hafta üst üste yok sayılan
bildirim tipi otomatik olarak "haftalık özete taşınsın mı" önerisi doğurur.

## 8.10 Sabah Brifingi
Brifing bir RAPOR değil KAPI'dır: 30 saniyede günü açar ve gece muhasebesinin insan onayı adımını
taşır. Sıralama sabittir: uyku onayı → günün 3'ü → düzeltmeler → sorular (≤3) → bütçeler. Soru
sayısı 3'ü aşarsa kalanlar ertesi güne kuyruklanır — sabah sorgu odasına çevrilmez. TTS versiyonu
aynı içeriğin seslendirilmiş halidir; ayrı metin yazılmaz (tek kaynak).

## 8.11 Gece Muhasebecisi
Yetki sınırının kodda zorlanması şöyle: denetçi çıktısındaki `corrections[]` yalnız beyaz-listeli
alanları hedefleyebilir (sayısal değerler, tarih/saat eşleşmeleri, kategori düzeltmeleri);
promise.quoted_text, decisions.*, ledger raw_input KARA listededir — denetçi bunlara düzeltme
önerirse sistem uygulamaz, soruya çevirir. Bu, "kalem kullanıcıda kalır" ilkesinin teknik karşılığı.
Paket hazırlanırken sensitivity=sensitive satırlar ve foto referansları AYIKLANIR (OpenRouter'a
gitmez). Denetçi çıktısı da Zod'dan geçer; bozuksa bir tekrar, sonra Pro yedeğine düşüş.

## 8.12 Haftalık Muhasebe
Müzakere mekanik olarak şudur: sistem önerisi (örn. blok saatini değiştir) bir "pending_change"
kaydı olur; kullanıcı onaylar/reddeder/karşı öneri yazar; sonuç sezon kural setine işlenir ve
KAYNAĞIYLA saklanır ("3 hafta uyumsuzluk verisi üzerine, 12.07 muhasebesinde"). Böylece kurallar
zamanla kullanıcının gerçek hayatının kalıbını alır ve her kuralın bir hikâyesi olur.

## 8.13 Sezonlar ve Zincirler
Zincirdeki joker OTOMATİK harcanır (kullanıcı "joker kullanıyorum" demek zorunda değil — sürtünme
ilkesi) ve brifingde bilgi verilir. Vites dondurması zincir matematiğinde "duraklatılmış gün"
sayılır, ne kırar ne uzatır. Sezon karnesi üretimi Pro'ya gider; foto karşılaştırması karnede
YALNIZ kullanıcı kasayı açıp onaylarsa yer alır.

## 8.14 Kriz Vitesleri
Vites tek cümleyle de açılır ("hastayım" → parse intent'i) — kriz anında menü gezdirmek tasarım
hatasıdır. Her vitesin çıkış protokolü tanımlıdır; özellikle hastalık çıkışındaki %80 kademeli
dönüş, "ilk gün eski ağırlıklara saldırıp sakatlanma" klasiğine karşı korumadır.

## 8.15 Bürokrasi Dosyaları
Bu modülün değeri veri yapısında değil, DÜRTME sahipliğindedir: kafada taşınan "acaba İK döndü mü"
yükünü sisteme devreder. Dürtme metinleri eylem önerir ("bugün aramak ister misin? numara kartta").
Tamamlanan dosya arşive düşer ve benzer süreç tekrar açıldığında (ör. yeni dönem staj evrakı) eski
dosya şablon olarak önerilir.

## 8.16 Karar Günlüğü
İki cümle zorunluluğu bilinçli minimalizmdir: uzun form istemek kayıt oranını öldürür. review_at
verilmemişse sistem karar tipine göre tahmin önerir (finansal: 3 ay; program: 1 ay). Kararlar
Hassas Kasa kapsamındadır.

## 8.17 Hayat Sorgusu
Serbest SQL ürettirmeme kararı güvenlik + doğruluk içindir: LLM'in halüsinasyon SQL'i sessiz yanlış
cevap üretir. Bunun yerine ~20 parametrik sorgu kataloğu (ağrı geçmişi, ortalama alım, antrenman
uyumu, kilo eğrisi, defter araması...) tanımlanır; Flash soruyu katalog+parametreye eşler,
eşleyemezse dürüstçe "bunu henüz soramıyorum" der ve istek v4 rafına loglanır (katalog gerçek
taleple büyür).

## 8.18 Oyun Bütçesi
Oyunun meşrulaştırılması davranışsal tasarımdır: sistem hayatın tamamını temsil etmezse, temsil
etmediği kısım gölgede büyür ve sistemi yener. "Hak edilmiş uzun seans" pekiştirme mekaniğidir;
ceza mekaniği YOKTUR (bütçe aşımı sadece veriye işlenir, kısıtlama/kilitleme yapılmaz — sistem
ebeveyn değil ortak).
