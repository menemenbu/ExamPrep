# Ders sayfası taslağı

Yeni ders eklemek için:

1. `lesson-template.html` dosyasını `outputs/` içine yeni ve benzersiz bir HTML adıyla kopyala.
2. Köşeli parantezli alanları doldur; her konu için `Konu anlatımı`, `Çözümlü örnekler` ve `Kısa test` içeriklerini ayrı panellere yerleştir. Üç içerik türünü tek bir panelde birleştirme.
3. Ortak görünüm için `lesson-ui.css` bağlantısını koru. Paylaşılan renk, ölçü ve bileşen değişikliklerini `templates/lesson-ui.css` dosyasında yap.
4. Yeni sayfanın tamamlanma takibi gerekiyorsa `outputs/progress.js` içindeki `pages` listesine sayfa adı, ders anahtarı ve test bilgilerini ekle.
5. `python templates/sync_lessons.py --styles-only` komutuyla ortak stili iki klasöre aktar. Sayfayı yayıma almak için `python templates/sync_lessons.py <dosya-adı.html>` çalıştır; bu, ortak stili yeniler ve yalnızca adı verilen sayfayı `publish/` klasörüne kopyalar.

Mevcut derslerin içerikleri ayrı dosyalarda kalır; yeni dersler bu ortak taslaktan başlar. `sources/` klasöründeki eşitlenmiş kaynak dosyaları değiştirilmez.
