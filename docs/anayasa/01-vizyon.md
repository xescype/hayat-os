# 01 — Vizyon (Detaylı Açıklama)

## Sistemin tek cümlelik tanımı
Hayat OS bir "uygulamalar koleksiyonu" değildir; kullanıcının hayat verisinin tek gövdede aktığı ve
her an tek bir çıktı üreten bir organizmadır: **"şu an yapılacak en değerli şey."**

## Metaforun ciddiyeti: organlar
Anayasadaki "takvim iskelet, spor-beslenme kaslar, notlar hafıza, motor beyin, muhasebeci vicdan"
metaforu mimari bir gerçeğe işaret eder: modüller birbirinin verisini GÖRÜR. Piyasadaki ayrı ayrı
uygulamaların (takvim + fitness + kalori + not) yapamadığı şey tam budur — ağrı kaydı program
değişikliğine, program takvime, takvim bildirime tek zincirde dokunamaz. Hayat OS'in bütün varlık
sebebi bu zinciri kapatmaktır. Bu yüzden "modülü ayrı mikroservis yapalım" gibi öneriler REDDEDİLİR:
tek süreç, tek veritabanı, tam görüş.

## Tasarım ilkelerinin pratiği

### "Sürtünme düşmandır"
Ölçü: bir kaydın maliyeti = dokunuş sayısı + düşünme süresi. Hedefler: yemek kaydı ≤1 dokunuş
(örüntü onayı) veya 1 cümle ses; set kaydı ≤2 dokunuş; söz/görev = 0 dokunuş (konuşmadan ayıklanır).
Bir ekran tasarlarken sorulacak soru: "Bu akış 30 gün sonra da yapılır mı, yoksa üşenilir mi?"
Üşenilecekse sistem oradan kör kalır ve kapalı döngüler bozulur — yani sürtünme bir UX konusu değil,
veri bütünlüğü konusudur.

### "Sistem azarlamaz, yeniden düzenler"
Kaçırılan antrenman karşısında iki dünya: (a) kırmızı çarpı + suçluluk → 3 haftada terk;
(b) sessiz yeniden yerleştirme + kayıt → sistem yaşar, veri birikir. Her bildirimin, her metnin tonu
buna göre yazılır: tespit + çözüm, asla yargı. "Antrenmanı kaçırdın!" değil, "Salı antrenmanın
Perşembe 18.00'e taşındı."

### "Plan da sanıktır"
Uyumsuzluk verisi iki yönlü okunur. Üç hafta üst üste patlayan blok, kullanıcının tembelliği değil
planın gerçek dışılığı olabilir. Haftalık muhasebenin müzakere karakteri buradan gelir: sistem planı
savunmaz, gerçeğe göre revize ettirir. Bu ilke koda "kalıcı kural değişikliği öner" davranışı olarak girer.

### "Hiçbir akıl kayıt dışı konuşamaz"
Defter (ledger) bir özellik değil, sistemin omurgasıdır. Yapay zekanın her çıkarımı, her düzeltmesi,
kullanıcının her girdisi oraya işlenir. Bu üç şey sağlar: (1) güven — kullanıcı sistemin ne anladığını
her zaman denetleyebilir; (2) denetlenebilirlik — gece muhasebecisinin hammaddesi; (3) tarih —
Hayat Sorgusu'nun ve sezon karnelerinin veri kaynağı.

### "Veri platforma emanet edilmez"
Oracle olayı: platform tek taraflı kapattı, veri riske girdi. Ders mimariye gömülür: gece yedeği
platform DIŞINA çıkar, göç planı belgelidir, sistem bir akşamda taşınabilir. "Bulut zaten güvenli"
argümanı bu projede geçersizdir — bulut, hesabını kapatmadığı sürece güvenlidir.

## Başarı tanımı
Teknik metrik değil, davranışsal: yaz okulu sonunda kullanıcı sistemi hâlâ HER GÜN kullanıyorsa ve
"şu an ne yapmalıyım" sorusunu kafasında değil kartta çözüyorsa sistem başarılıdır. İkincil metrikler:
kayıt tutarlılığı ≥%80, haftalık muhasebe ritüeli hiç atlanmamış, en az bir kapalı döngü ayarı
(kalori bütçesi) gerçek veriden tetiklenmiş.
