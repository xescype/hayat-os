# katkı

oda tek kişilik bir sistem, ama bakmak, sormak, düzeltmek serbest.

- küçük bir düzeltme: doğrudan pull request aç.
- büyük bir değişiklik: önce bir issue aç, konuşalım.
- mimari kararlar `docs/kararlar.md` ve `docs/anayasa/` altında. değişiklik bunlarla çelişmesin.
- commit mesajı kısa ve düz: ne değişti, neden.
- testler ve tip kontrolü geçmeden merge yok:

```
pnpm -r test
pnpm -r typecheck
```

*Festina lente*
Acele et, ama yavaşça.

---

**in short (english).** small fixes: open a pull request. bigger changes: open an issue first.
read `docs/kararlar.md` before changing architecture. `pnpm -r test` and `pnpm -r typecheck` must pass.
