# Prep Master S2

Web app untuk persiapan S2 (MBA AS / QS top 10): kuis pagi 10 soal (5 IELTS + 5 GMAT Focus), pembahasan setiap soal, spaced repetition untuk soal yang salah, progres per skill, dan roadmap beasiswa/LoA. "Kunci HP" dibuat gratis dengan app Shortcuts iPhone (lihat tab **Setup**).

Roadmap lengkap: [docs/ROADMAP-S2.md](docs/ROADMAP-S2.md)

## Struktur
```
index.html          tampilan (4 tab: Hari ini, Progres, Roadmap, Setup)
js/bank-ielts.js    88 soal IELTS: 8 passage Reading (32), Vocabulary (24), Grammar (20), Writing (12)
js/bank-gmat.js     62 soal GMAT: Data Sufficiency (20), Critical Reasoning (24), Reading Comp (6 passage, 18)
js/generators.js    16 generator soal Quant (angka baru setiap hari, pembahasan otomatis)
js/roadmap.js       target skor, sekolah target, Jalur Utama (2028) & Jalur Cepat (2027), aturan LoA per beasiswa
js/config.js        link aplikasi (dipakai di instruksi Shortcuts)
js/app.js           penyusun soal harian, penilaian, spaced repetition, penyimpanan, tampilan
```

## Model data
Satu soal (`Question`): `id, exam, section, type, difficulty (1-3), passage?, prompt, choices[], answer, explanation, tip?`.

State pengguna (satu dokumen, disinkronkan ke akun lewat db artifact, cadangan di localStorage):
`{ track, checklist{taskId}, seen{qid: tanggal}, srs{qid: {box, due, q?}}, days{tanggal: {items[10], review[], answers{qid: {c, ok, t}}, done, sum}} }`

## Aturan harian
- Komposisi awal: IELTS = 2 Reading (satu passage) + Vocabulary + Grammar + Writing; GMAT = 2 Quant + DS + CR + RC.
- Setelah tes IELTS dicentang di Roadmap: 3 IELTS (2 Reading + 1 bergiliran) + 7 GMAT (3 Quant, 2 DS, CR, RC).
- Soal GMAT tingkat 2–3 diprioritaskan (target 695).
- Soal salah diulang setelah 1, 3, 7, lalu 16 hari (maks. 2 ulangan per ujian per hari).
- Kode buka harian = `(yyyyMMdd × 37 + 4242) mod 9973`, rumus yang sama dipakai shortcut "Gerbang Prep".

## Menambah soal
Tambahkan objek ke `js/bank-ielts.js` atau `js/bank-gmat.js` dengan `id` unik. Soal baru otomatis diprioritaskan karena belum pernah muncul.
