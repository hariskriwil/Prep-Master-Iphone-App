/*
 * Roadmap persiapan S2 (MBA) — diperbarui 25 November 2026.
 * Profil: pengalaman kerja 3,5 tahun (±4,5 tahun saat masuk 2028), belum pernah GMAT,
 * target MBA Amerika Serikat (M7) atau universitas QS top 10.
 *
 * Skema:
 *   PROFILE     fakta profil yang dipakai untuk menyusun roadmap
 *   GOALS       target skor & kebiasaan yang diukur
 *   SCHOOLS[]   { name, country, format, rounds, note }
 *   TRACKS[]    { id, name, intake, summary, milestones[] }
 *   milestone   { id, start, end (YYYY-MM-DD), cat, title, detail, tasks[], estimate }
 *     cat       "test" | "scholarship" | "admission" | "loa" | "prep" | "visa"
 *     estimate  true = tanggal perkiraan dari pola tahun sebelumnya, WAJIB dicek ulang
 *   tasks[]     { id, text } — checklist yang bisa dicentang (tersimpan di akun)
 *   RULES{trackId: gate[]}  syarat skor resmi + tenggat per jalur (mesin rekomendasi)
 *   ASSUMPTIONS laju kenaikan skor yang dipakai untuk menilai "masih terkejar"
 *   GMAT_HEAVY_TASKS  task yang, jika dicentang, menggeser kuis pagi ke 3 IELTS + 7 GMAT
 *   SCHOLARSHIPS[]  ringkasan aturan LoA per beasiswa
 */
(function () {
  const PROFILE = {
    workYears: 3.5,
    targets: "MBA Amerika Serikat (M7) atau universitas QS top 10",
    gmat: "Belum pernah",
    english: "Belum pernah tes"
  };

  const GOALS = {
    ielts: { target: 7.5, minimum: 7.0, note: "Overall 7.5, tidak ada band di bawah 7.0. Memenuhi LPDP (min. 6.5) dan syarat bahasa sekolah M7, Oxford, Cambridge, Imperial dan NUS." },
    gmat: { target: 695, minimum: 665, note: "GMAT Focus 695 (sekitar persentil 98). Rata-rata kelas M7 kira-kira di kisaran 675–705 (cek class profile terbaru tiap sekolah). Dengan 665 Anda masih bersaing, tetapi esai dan rekomendasi harus sangat kuat." },
    daily: { accuracy: 85, note: "Akurasi kuis pagi ≥ 85% rata-rata 7 hari sebelum ujian resmi. Di bawah itu, jadwal ujian sebaiknya digeser." }
  };

  const SCHOOLS = [
    { name: "Harvard Business School", country: "AS", format: "MBA 2 tahun · mulai Agustus", rounds: "R1 ±awal Sep, R2 ±awal Jan", note: "Esai tunggal terbuka. Ada need-based fellowship." },
    { name: "Stanford GSB", country: "AS", format: "MBA 2 tahun · mulai Sep", rounds: "R1 ±pertengahan Sep, R2 ±awal Jan", note: "Paling selektif. Bisa sekaligus daftar Knight-Hennessy (deadline ±Okt)." },
    { name: "Wharton (UPenn)", country: "AS", format: "MBA 2 tahun · mulai Agustus", rounds: "R1 ±Sep, R2 ±Jan", note: "Team-Based Discussion sebagai interview." },
    { name: "Chicago Booth, Kellogg, Columbia, MIT Sloan", country: "AS", format: "MBA 2 tahun (Kellogg punya opsi 1 tahun)", rounds: "R1 ±Sep–Okt, R2 ±Jan", note: "Lengkapi M7. Columbia punya opsi intake Januari." },
    { name: "Oxford Saïd, Cambridge Judge", country: "UK · QS top 10", format: "MBA 1 tahun · mulai Sep", rounds: "Bertahap Sep–Apr", note: "Biaya lebih rendah total. Masuk opsi Chevening." },
    { name: "Imperial College Business School", country: "UK · QS top 10", format: "MBA 1 tahun · mulai Sep", rounds: "Bertahap Okt–Mei", note: "Cadangan kuat; rolling admission." },
    { name: "NUS Business School", country: "Singapura · QS top 10", format: "MBA 17 bulan · mulai Agustus", rounds: "Bertahap Okt–Mar", note: "Dekat rumah, jaringan Asia Tenggara." }
  ];

  const P = {
    id: "P",
    name: "Jalur Utama: Intake Agustus/September 2028",
    intake: "2028-08-15",
    summary: "Direkomendasikan. MBA top AS paling realistis lewat Round 1 (September 2027), dan Anda akan punya ±4,5 tahun pengalaman saat masuk, pas dengan profil kelas M7. Ada waktu 9 bulan untuk mengejar GMAT 695, yang biasanya butuh 3–6 bulan belajar serius dan 2 kali tes.",
    milestones: [
      { id: "P1", start: "2026-11-25", end: "2026-12-21", cat: "prep", title: "Diagnostik & riset sekolah",
        detail: "Ukur posisi awal dulu. Skor diagnostik menentukan berapa jam belajar GMAT yang dibutuhkan per minggu.",
        tasks: [
          { id: "P1-1", text: "Daftar akun mba.com dan kerjakan GMAT Focus Official Practice Exam 1 (gratis), catat skor per section" },
          { id: "P1-2", text: "Kerjakan 1 IELTS Academic mock lengkap (Reading + Listening berwaktu, Writing dinilai)" },
          { id: "P1-3", text: "Baca class profile terbaru: HBS, Stanford, Wharton, Booth, Kellogg, Columbia, Sloan, Oxford, Cambridge, Imperial, NUS" },
          { id: "P1-4", text: "Tentukan cerita karier: Anda yang sekarang → MBA → tujuan 5 tahun (1 paragraf)" },
          { id: "P1-5", text: "Cek daftar kampus tujuan LPDP terbaru, pastikan sekolah pilihan masuk" }
        ] },
      { id: "P2", start: "2027-01-04", end: "2027-03-14", cat: "test", title: "IELTS selesai lebih dulu",
        detail: "IELTS lebih cepat dikuasai daripada GMAT. Menyelesaikannya duluan membebaskan April–Agustus untuk GMAT. Skor berlaku 2 tahun, aman sampai keberangkatan 2028.",
        tasks: [
          { id: "P2-1", text: "Booking IELTS Academic (IDP atau British Council) untuk Februari–Maret 2027" },
          { id: "P2-2", text: "Ambil tes IELTS (target 7.5, tiap band ≥ 7.0)" },
          { id: "P2-3", text: "Jika ada band < 7.0, ulang (atau One Skill Retake) sebelum April" }
        ] },
      { id: "P3", start: "2026-12-01", end: "2027-08-15", cat: "test", title: "GMAT Focus: belajar & 2 kali tes",
        detail: "Fondasi Quant dan Verbal Desember–Maret, intensif April–Juni. Tes pertama sekitar Juni, tes kedua Juli–Agustus. Gunakan bahan resmi (GMAT Official Guide, Official Practice Exams 1–6). Kuis pagi di aplikasi ini adalah kebiasaan harian, bukan pengganti bahan resmi.",
        tasks: [
          { id: "P3-1", text: "Beli GMAT Official Guide (Focus) + paket Official Practice Exams 3–6" },
          { id: "P3-2", text: "Selesaikan fondasi Quant (aritmetika, aljabar, word problems) sebelum April" },
          { id: "P3-3", text: "Buat error log: setiap soal salah dicatat penyebabnya (konsep, kecerobohan, waktu)" },
          { id: "P3-4", text: "Official Practice Exam ≥ 685 dua kali berturut-turut sebelum booking tes" },
          { id: "P3-5", text: "Tes GMAT Focus pertama (target Juni 2027)" },
          { id: "P3-6", text: "Tes kedua (Juli–Agustus) jika di bawah 695; jeda minimal 16 hari" }
        ] },
      { id: "P4", start: "2027-02-01", end: "2027-06-30", cat: "prep", title: "Profil & jaringan",
        detail: "Komite admisi M7 menilai dampak kerja dan kepemimpinan, bukan hanya skor. Manfaatkan sisa waktu kerja sebelum aplikasi untuk menambah bukti.",
        tasks: [
          { id: "P4-1", text: "Ambil 1 proyek kepemimpinan di kantor dengan hasil terukur (angka, tim, dampak)" },
          { id: "P4-2", text: "Hadiri info session online / MBA fair (mis. QS World MBA Tour Jakarta)" },
          { id: "P4-3", text: "Ngobrol dengan 2 alumni/mahasiswa tiap sekolah prioritas (catat insight untuk esai 'why us')" },
          { id: "P4-4", text: "Pilih 2 pemberi rekomendasi (atasan langsung) dan beri tahu timeline Anda" }
        ] },
      { id: "P5", start: "2027-06-01", end: "2027-07-31", cat: "scholarship", estimate: true, title: "LPDP Tahap 2 2027 (opsional, lebih awal)",
        detail: "LoA tidak wajib saat mendaftar. Mendaftar lebih awal memberi kepastian dana sebelum aplikasi MBA. Cek dulu aturan batas waktu mulai studi bagi awardee agar cocok dengan intake Agustus 2028; jika tidak cocok, pakai LPDP Tahap 1 2028.",
        tasks: [
          { id: "P5-1", text: "Cek aturan batas mulai studi LPDP untuk awardee 2027" },
          { id: "P5-2", text: "Submit LPDP Tahap 2 2027 (jika aturannya cocok)" }
        ] },
      { id: "P6", start: "2027-06-15", end: "2027-09-10", cat: "admission", title: "Esai, rekomendasi, resume",
        detail: "Esai biasanya rilis Juni–Juli. Target: draf final semua sekolah R1 2 minggu sebelum deadline.",
        tasks: [
          { id: "P6-1", text: "Resume MBA 1 halaman berbasis pencapaian" },
          { id: "P6-2", text: "Esai HBS & Stanford (What matters most) draf 1 → 3 putaran revisi" },
          { id: "P6-3", text: "Esai Wharton/Booth/Kellogg/Columbia/Sloan sesuai pilihan R1" },
          { id: "P6-4", text: "Brief untuk pemberi rekomendasi (contoh pencapaian, tenggat)" }
        ] },
      { id: "P7", start: "2027-09-01", end: "2027-10-15", cat: "admission", estimate: true, title: "Round 1: submit 4–5 sekolah",
        detail: "Perkiraan deadline R1: HBS ±awal September, Stanford & Wharton ±September, sekolah M7 lain September–Oktober, Oxford/Cambridge tahap 1 ±September, Imperial/NUS ronde 1 ±Oktober. Knight-Hennessy (Stanford) ±awal Oktober.",
        tasks: [
          { id: "P7-1", text: "Submit R1 sekolah prioritas 1–2 (mis. HBS, Stanford)" },
          { id: "P7-2", text: "Submit R1 sekolah 3–5 (M7 lain dan/atau Oxford, Cambridge)" },
          { id: "P7-3", text: "Submit Knight-Hennessy jika daftar Stanford" }
        ] },
      { id: "P8", start: "2027-08-01", end: "2027-11-05", cat: "scholarship", estimate: true, title: "Chevening 2028/29 (jika UK masuk daftar)",
        detail: "Hanya untuk Oxford/Cambridge/Imperial. Biasanya buka awal Agustus, tutup awal November. Syarat pengalaman kerja 2 tahun sudah terpenuhi. Biaya MBA umumnya melebihi batas tuition Chevening, jadi siapkan kombinasi dengan beasiswa kampus.",
        tasks: [
          { id: "P8-1", text: "Tentukan 3 program UK dan submit Chevening" }
        ] },
      { id: "P9", start: "2027-10-01", end: "2027-12-20", cat: "loa", title: "Interview & keputusan Round 1",
        detail: "Interview undangan Oktober–November, keputusan R1 sekitar Desember. Admit dari sekolah AS praktis sudah menjadi LoA; dokumen I-20 menyusul setelah deposit dan bukti dana.",
        tasks: [
          { id: "P9-1", text: "Latihan interview: 8–10 cerita STAR (kepemimpinan, gagal, konflik, dampak)" },
          { id: "P9-2", text: "Mock interview dengan alumni atau konsultan" },
          { id: "P9-3", text: "Simpan surat admit sebagai LoA untuk LPDP" }
        ] },
      { id: "P10", start: "2027-12-01", end: "2028-01-15", cat: "admission", estimate: true, title: "Round 2: sekolah cadangan",
        detail: "Jika R1 belum berhasil, submit R2 untuk 2–4 sekolah lain (perkiraan deadline awal Januari). Gunakan feedback dari interview R1.",
        tasks: [
          { id: "P10-1", text: "Submit R2 untuk 2–4 sekolah" }
        ] },
      { id: "P11", start: "2028-01-15", end: "2028-02-28", cat: "scholarship", estimate: true, title: "LPDP Tahap 1 2028 (dengan LoA)",
        detail: "Jalur pendanaan utama jika belum didapat di 2027. Mendaftar dengan admit M7 membuat posisi Anda jauh lebih kuat.",
        tasks: [
          { id: "P11-1", text: "Submit LPDP Tahap 1 2028 + unggah LoA" },
          { id: "P11-2", text: "Latihan tes bakat skolastik & wawancara substansi" }
        ] },
      { id: "P12", start: "2028-03-01", end: "2028-05-31", cat: "scholarship", title: "Keputusan R2, pengumuman LPDP, beasiswa kampus",
        detail: "Bandingkan paket dana (LPDP, fellowship kampus). Deposit kursi di sekolah pilihan.",
        tasks: [
          { id: "P12-1", text: "Bayar deposit sekolah pilihan" },
          { id: "P12-2", text: "Ajukan need-based / merit fellowship kampus jika ada" }
        ] },
      { id: "P13", start: "2028-05-01", end: "2028-07-31", cat: "visa", title: "I-20, visa F-1, berangkat",
        detail: "Jadwal wawancara visa di Kedutaan Besar AS Jakarta bisa panjang. Booking segera setelah I-20 terbit. Untuk UK: CAS dan Student visa.",
        tasks: [
          { id: "P13-1", text: "Terima I-20 (AS) atau CAS (UK)" },
          { id: "P13-2", text: "Bayar SEVIS fee & jadwalkan wawancara visa F-1" },
          { id: "P13-3", text: "Ikuti PK LPDP, booking akomodasi & tiket" }
        ] },
      { id: "P14", start: "2028-08-15", end: "2028-09-30", cat: "admission", title: "Mulai kuliah",
        detail: "MBA AS umumnya mulai Agustus; UK dan NUS Agustus–September.", tasks: [] }
    ]
  };

  const S = {
    id: "S",
    name: "Jalur Kilat: Intake Agustus/September 2027",
    intake: "2027-08-20",
    summary: "Terbuka jika skor naik cepat: IELTS 7.0+ sebelum pertengahan Februari dan GMAT resmi 655+ sebelum akhir Maret 2027. Sasaran: Round 3 sekolah AS (Stanford, Wharton, Booth, Kellogg, Sloan, sekitar April; HBS tidak punya Round 3) serta tahap akhir Oxford, Cambridge, Imperial dan NUS. Kursi Round 3 sedikit, jadi kirim aplikasi ke 5–6 sekolah sekaligus. Dana: LPDP Tahap 1 2027.",
    milestones: [
      { id: "S1", start: "2026-12-01", end: "2026-12-15", cat: "test", title: "Booking IELTS & GMAT sekarang",
        detail: "IELTS pertengahan Januari, GMAT akhir Februari.",
        tasks: [
          { id: "S1-1", text: "Booking IELTS untuk pertengahan Januari 2027" },
          { id: "S1-2", text: "Booking GMAT Focus untuk akhir Februari 2027" }
        ] },
      { id: "S2", start: "2027-01-11", end: "2027-01-24", cat: "test", title: "Tes IELTS",
        detail: "Hasil computer-delivered ±3–5 hari, sempat untuk LPDP Tahap 1.",
        tasks: [{ id: "S2-1", text: "Ambil tes IELTS (target 7.5)" }] },
      { id: "S3", start: "2027-01-15", end: "2027-02-28", cat: "scholarship", estimate: true, title: "LPDP Tahap 1 2027",
        detail: "LoA tidak wajib saat daftar; unconditional wajib sebelum berangkat.",
        tasks: [{ id: "S3-1", text: "Submit LPDP Tahap 1 2027" }] },
      { id: "S4", start: "2027-02-22", end: "2027-03-31", cat: "test", title: "GMAT Focus", detail: "Satu kali tes, maksimal satu ulangan sebelum akhir Maret.",
        tasks: [{ id: "S4-1", text: "Ambil GMAT Focus" }] },
      { id: "S5", start: "2027-03-01", end: "2027-04-30", cat: "admission", estimate: true, title: "US Round 3 + tahap akhir UK/NUS",
        detail: "Perkiraan: Round 3 sekolah AS sekitar awal–pertengahan April; Oxford, Cambridge dan Imperial tahap terakhir Maret–April; NUS ronde terakhir sekitar Maret. Esai disiapkan sejak Januari.",
        tasks: [
          { id: "S5-1", text: "Esai & rekomendasi siap paling lambat pertengahan Maret" },
          { id: "S5-2", text: "Submit Round 3 ke 2–3 sekolah AS" },
          { id: "S5-3", text: "Submit tahap akhir ke 2–3 sekolah UK/NUS" }
        ] },
      { id: "S6", start: "2027-04-15", end: "2027-06-30", cat: "loa", title: "Offer & LoA unconditional", detail: "Penuhi syarat offer secepatnya.",
        tasks: [{ id: "S6-1", text: "Dapatkan LoA unconditional dan unggah ke LPDP" }] },
      { id: "S7", start: "2027-06-01", end: "2027-08-15", cat: "visa", title: "I-20/CAS, visa, berangkat", detail: "Visa F-1 AS: booking wawancara segera setelah I-20 terbit.", tasks: [{ id: "S7-1", text: "Ajukan visa pelajar" }] },
      { id: "S8", start: "2027-08-20", end: "2027-09-30", cat: "admission", title: "Mulai kuliah", detail: "Jika tidak berhasil, semua skor dan esai dipakai ulang di Jalur Januari 2028 atau Agustus 2028.", tasks: [] }
    ]
  };

  const J = {
    id: "J",
    name: "Jalur Januari 2028: Columbia J-Term",
    intake: "2028-01-05",
    summary: "Mulai 7 bulan lebih cepat dari Jalur Utama. Columbia Business School (M7) punya intake Januari: program dipadatkan ±16–20 bulan tanpa magang musim panas. Cocok jika tidak pindah bidang karier atau perusahaan Anda menunggu. Syarat: GMAT resmi 675+ sebelum pertengahan September 2027. Aplikasi Round 1 untuk Agustus 2028 dikirim bersamaan sebagai cadangan.",
    milestones: [
      { id: "J1", start: "2026-11-25", end: "2026-12-21", cat: "prep", title: "Diagnostik & riset sekolah", detail: "Sama dengan Jalur Utama.",
        tasks: [{ id: "J1-1", text: "GMAT Official Practice Exam 1 + mock IELTS, catat skornya di aplikasi" }] },
      { id: "J2", start: "2027-01-04", end: "2027-03-14", cat: "test", title: "Tes IELTS", detail: "Target 7.5, tiap band ≥ 7.0.",
        tasks: [{ id: "J2-1", text: "Ambil tes IELTS" }] },
      { id: "J3", start: "2026-12-01", end: "2027-08-31", cat: "test", title: "GMAT Focus: tes 1 ±Mei, tes 2 ±Juli", detail: "Satu bulan lebih awal dari Jalur Utama karena deadline J-Term awal Oktober.",
        tasks: [
          { id: "J3-1", text: "Official Practice Exam ≥ 685 dua kali berturut-turut" },
          { id: "J3-2", text: "Tes GMAT Focus pertama (±Mei 2027)" },
          { id: "J3-3", text: "Tes kedua (±Juli 2027) jika di bawah target" }
        ] },
      { id: "J4", start: "2027-06-01", end: "2027-07-31", cat: "scholarship", estimate: true, title: "LPDP Tahap 2 2027",
        detail: "LoA tidak wajib saat daftar. Pengumuman diperkirakan akhir tahun, mendekati mulai kuliah Januari. Cek aturan batas mulai studi.",
        tasks: [{ id: "J4-1", text: "Submit LPDP Tahap 2 2027" }] },
      { id: "J5", start: "2027-05-15", end: "2027-09-30", cat: "admission", title: "Esai & rekomendasi", detail: "Esai Columbia biasanya rilis sekitar Mei–Juni.",
        tasks: [{ id: "J5-1", text: "Esai Columbia final" }, { id: "J5-2", text: "Esai Round 1 sekolah lain (cadangan Agustus 2028)" }] },
      { id: "J6", start: "2027-09-01", end: "2027-10-10", cat: "admission", estimate: true, title: "Submit Columbia J-Term + Round 1 cadangan",
        detail: "Perkiraan deadline J-Term ±awal Oktober.",
        tasks: [{ id: "J6-1", text: "Submit Columbia J-Term" }, { id: "J6-2", text: "Submit Round 1 untuk 2–3 sekolah lain" }] },
      { id: "J7", start: "2027-10-01", end: "2027-11-30", cat: "loa", estimate: true, title: "Interview & keputusan J-Term", detail: "Admit = LoA. Langsung proses I-20.",
        tasks: [{ id: "J7-1", text: "Interview Columbia" }, { id: "J7-2", text: "Deposit & unggah LoA ke LPDP" }] },
      { id: "J8", start: "2027-11-15", end: "2027-12-31", cat: "visa", title: "I-20, visa F-1, berangkat", detail: "Waktu visa sempit; booking wawancara hari yang sama I-20 terbit.",
        tasks: [{ id: "J8-1", text: "Wawancara visa F-1" }] },
      { id: "J9", start: "2028-01-05", end: "2028-01-31", cat: "admission", title: "Mulai kuliah", detail: "Columbia J-Term.", tasks: [] }
    ]
  };

  /*
   * Gerbang skor per jalur (dipakai mesin rekomendasi di app.js).
   * gate: { test: "gmat"|"ielts", min: skor resmi minimum, by: tenggat skor resmi, why }
   * Urutan TRACK_ORDER = dari intake tercepat ke paling lambat.
   */
  const RULES = {
    S: [
      { test: "ielts", min: 7.0, by: "2027-02-15", why: "agar sempat daftar LPDP Tahap 1 2027" },
      { test: "gmat", min: 655, by: "2027-03-31", why: "agar sempat US Round 3 dan tahap akhir UK" }
    ],
    J: [
      { test: "ielts", min: 7.0, by: "2027-07-15", why: "agar sempat LPDP Tahap 2 2027" },
      { test: "gmat", min: 675, by: "2027-09-15", why: "agar sempat deadline Columbia J-Term" }
    ],
    P: [
      { test: "ielts", min: 7.0, by: "2027-08-15", why: "sebelum Round 1" },
      { test: "gmat", min: 665, by: "2027-08-25", why: "agar sempat Round 1 (Round 2 masih bisa sampai ±Desember)" }
    ]
  };
  const TRACK_ORDER = ["S", "J", "P"];

  // Asumsi laju kenaikan dengan belajar serius 10–15 jam/minggu. Dipakai untuk menilai apakah target masih terkejar.
  const ASSUMPTIONS = {
    gmatPointsPerWeek: 8,
    ieltsBandPerWeek: 0.1,
    bufferWeeks: 2,
    note: "Asumsi kasar: GMAT Focus naik ±8 poin/minggu dan IELTS ±0.5 band per 5 minggu dengan belajar 10–15 jam/minggu. Dikurangi 2 minggu untuk booking tes dan keluarnya skor."
  };

  // Task yang menandai IELTS sudah selesai → kuis pagi bergeser ke 3 IELTS + 7 GMAT.
  const GMAT_HEAVY_TASKS = ["P2-2", "S2-1", "J2-1"];

  const SCHOLARSHIPS = [
    { name: "LPDP (reguler, luar negeri)", window: "Perkiraan 2× setahun: Jan–Feb dan Jun–Jul", loa: "Tidak wajib saat daftar. LoA wajib sebelum berangkat.", english: "IELTS min. 6.5 (cek panduan tahun berjalan)", mba: "Ya, untuk kampus di daftar tujuan LPDP (sekolah M7 umumnya masuk; cek daftar terbaru)", status: "Dana utama" },
    { name: "Knight-Hennessy (Stanford)", window: "Perkiraan deadline ±awal Oktober", loa: "Daftar bersamaan dengan aplikasi Stanford GSB", english: "Mengikuti Stanford", mba: "Ya", status: "Jika daftar Stanford" },
    { name: "Fellowship kampus (HBS, Wharton, dll.)", window: "Otomatis / setelah admit", loa: "Setelah admit", english: "–", mba: "Ya (need-based atau merit)", status: "Pelengkap LPDP" },
    { name: "Chevening (UK)", window: "Perkiraan Agu–awal Nov", loa: "Unconditional offer sebelum ±pertengahan Juli tahun berikutnya", english: "Mengikuti kampus", mba: "Bisa, tetapi ada batas tuition", status: "Hanya jika Oxford/Cambridge/Imperial" },
    { name: "Fulbright (AS)", window: "Perkiraan Feb–Apr", loa: "Tidak", english: "TOEFL iBT / IELTS", mba: "Biasanya tidak mendanai MBA", status: "Tidak disarankan untuk MBA" }
  ];

  const WEEKLY = [
    { phase: "Fase 1 (25 Nov–Mar 2027): IELTS selesai + fondasi GMAT", load: "06:00 kuis 10 soal (±20 mnt) · Sen–Jum malam 60 mnt (IELTS 3×, GMAT Quant 2×) · Sabtu: mock IELTS · Minggu: 2 jam GMAT Official Guide" },
    { phase: "Fase 2 (Apr–Agu 2027): GMAT intensif", load: "06:00 kuis 3 IELTS + 7 GMAT (otomatis setelah tes IELTS dicentang) · Sen–Jum malam 90 mnt GMAT · Sabtu: Official Practice Exam / section berwaktu · Minggu: review error log" },
    { phase: "Fase 3 (Jun–Okt 2027): esai & Round 1", load: "06:00 kuis · Malam 60 mnt esai · Akhir pekan: revisi esai, ngobrol dengan alumni, persiapan interview" }
  ];

  window.ROADMAP = { PROFILE: PROFILE, GOALS: GOALS, SCHOOLS: SCHOOLS, TRACKS: [S, J, P], RULES: RULES, TRACK_ORDER: TRACK_ORDER, ASSUMPTIONS: ASSUMPTIONS, GMAT_HEAVY_TASKS: GMAT_HEAVY_TASKS, SCHOLARSHIPS: SCHOLARSHIPS, WEEKLY: WEEKLY, createdAt: "2026-11-25" };
})();
