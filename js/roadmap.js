/*
 * Roadmap persiapan S2 (MBA) — dibuat 25 November 2026.
 *
 * Skema:
 *   GOALS       target skor & kebiasaan yang diukur
 *   TRACKS[]    { id, name, intake, summary, milestones[] }
 *   milestone   { id, start, end (YYYY-MM-DD), cat, title, detail, tasks[], estimate }
 *     cat       "test" | "scholarship" | "admission" | "loa" | "prep" | "visa"
 *     estimate  true = tanggal perkiraan dari pola tahun sebelumnya, WAJIB dicek ulang
 *   tasks[]     { id, text } — checklist yang bisa dicentang (tersimpan di akun)
 *   SCHOLARSHIPS[]  ringkasan aturan LoA per beasiswa
 */
(function () {
  const GOALS = {
    ielts: { target: 7.5, minimum: 7.0, note: "Overall 7.5, tidak ada band di bawah 7.0. Aman untuk LPDP (min. 6.5) dan hampir semua MBA top UK/EU (umumnya 7.0)." },
    gmat: { target: 655, minimum: 615, note: "GMAT Focus 655+ (sekitar persentil 85–90). 615 adalah batas bawah kompetitif untuk MBA top UK/EU; 645–675 untuk sekolah sekelas Imperial/Warwick/Manchester." },
    daily: { accuracy: 80, note: "Akurasi kuis pagi ≥ 80% rata-rata 7 hari sebelum ujian resmi. Di bawah itu, jadwal ujian sebaiknya digeser." }
  };

  const A = {
    id: "A",
    name: "Jalur A: Intake September 2027",
    intake: "2027-09-01",
    summary: "Jalur cepat. Beasiswa utama yang masih memungkinkan adalah LPDP Tahap 1 2027. Chevening untuk intake 2027 sudah tutup (awal November 2026). Waktu belajar sangat ketat: IELTS dalam ±7 minggu dan GMAT dalam ±3 bulan.",
    milestones: [
      { id: "A1", start: "2026-11-25", end: "2026-12-14", cat: "prep", title: "Diagnostik & shortlist kampus",
        detail: "Ukur posisi awal sebelum membuat jadwal belajar detail.",
        tasks: [
          { id: "A1-1", text: "Kerjakan GMAT Focus Official Practice Exam 1 (gratis di mba.com) dan catat skor per section" },
          { id: "A1-2", text: "Kerjakan 1 IELTS Academic mock lengkap (Reading + Listening berwaktu, Writing dinilai)" },
          { id: "A1-3", text: "Shortlist 6–8 MBA: 2 reach, 3 target, 2–3 safe (cek syarat pengalaman kerja & skor rata-rata)" },
          { id: "A1-4", text: "Cek daftar kampus tujuan LPDP terbaru dan pastikan program MBA pilihan termasuk" },
          { id: "A1-5", text: "Siapkan CV versi MBA (1 halaman, berbasis pencapaian dengan angka)" }
        ] },
      { id: "A2", start: "2026-12-01", end: "2026-12-15", cat: "test", title: "Daftar jadwal IELTS & GMAT",
        detail: "Kursi IELTS di Jakarta/Surabaya bisa penuh menjelang Januari. Pesan sekarang.",
        tasks: [
          { id: "A2-1", text: "Booking IELTS Academic (IDP atau British Council) untuk pertengahan Januari 2027" },
          { id: "A2-2", text: "Booking GMAT Focus (test center atau online) untuk akhir Februari 2027" },
          { id: "A2-3", text: "Pastikan nama di paspor sama persis dengan pendaftaran tes" }
        ] },
      { id: "A3", start: "2027-01-11", end: "2027-01-24", cat: "test", title: "Ujian IELTS Academic",
        detail: "Target 7.5 overall. Hasil computer-delivered keluar ±3–5 hari, cukup cepat untuk LPDP Tahap 1.",
        tasks: [
          { id: "A3-1", text: "2 minggu terakhir: 1 full mock per 3 hari, fokus Writing Task 2" },
          { id: "A3-2", text: "Ambil tes IELTS" },
          { id: "A3-3", text: "Jika ada band < 7.0, booking ulang segera (One Skill Retake jika tersedia)" }
        ] },
      { id: "A4", start: "2027-01-15", end: "2027-02-28", cat: "scholarship", estimate: true, title: "LPDP Tahap 1 2027: pendaftaran",
        detail: "Perkiraan dari pola tahun-tahun sebelumnya (pendaftaran sekitar Januari–Februari). LoA TIDAK wajib saat mendaftar untuk skema reguler luar negeri, tetapi LoA unconditional wajib sebelum keberangkatan. Selalu cek panduan resmi tahun berjalan di lpdp.kemenkeu.go.id.",
        tasks: [
          { id: "A4-1", text: "Baca panduan LPDP 2027 resmi: syarat IELTS, usia, daftar kampus, dokumen" },
          { id: "A4-2", text: "Tulis esai: komitmen kembali & kontribusi untuk Indonesia (draf 1, review, final)" },
          { id: "A4-3", text: "Siapkan surat rekomendasi, ijazah & transkrip terlegalisir, surat sehat, surat bebas narkoba" },
          { id: "A4-4", text: "Submit pendaftaran sebelum batas waktu" }
        ] },
      { id: "A5", start: "2027-02-22", end: "2027-03-31", cat: "test", title: "GMAT Focus: percobaan 1 & 2",
        detail: "Target 655. Jika percobaan pertama di bawah target, ulang setelah jeda minimal 16 hari (aturan GMAT).",
        tasks: [
          { id: "A5-1", text: "Official Practice Exam 2 seminggu sebelum ujian (harus ≥ target − 20)" },
          { id: "A5-2", text: "Ambil GMAT Focus percobaan 1" },
          { id: "A5-3", text: "Analisis Enhanced Score Report, perbaiki section terlemah" },
          { id: "A5-4", text: "Percobaan 2 (jika perlu) paling lambat akhir Maret" }
        ] },
      { id: "A6", start: "2027-03-01", end: "2027-04-30", cat: "scholarship", estimate: true, title: "LPDP: seleksi bakat skolastik & substansi",
        detail: "Perkiraan: seleksi administrasi → tes bakat skolastik → wawancara substansi. Latihan soal TBS (verbal, kuantitatif, penalaran) bisa memakai kebiasaan kuis pagi ini.",
        tasks: [
          { id: "A6-1", text: "Latihan tes bakat skolastik LPDP (3 paket simulasi)" },
          { id: "A6-2", text: "Mock interview substansi: 3 sesi dengan alumni/awardee" }
        ] },
      { id: "A7", start: "2027-03-01", end: "2027-04-30", cat: "admission", title: "Aplikasi MBA (UK/EU Round 3–4)",
        detail: "Untuk intake 2027 yang realistis adalah program MBA satu tahun di UK/EU yang masih membuka ronde akhir (banyak yang rolling sampai April–Mei). MBA dua tahun di AS (ronde 3) sangat kompetitif dan kurang cocok dengan timeline LPDP.",
        tasks: [
          { id: "A7-1", text: "Tulis esai MBA per sekolah (why MBA, why now, why this school, career goals)" },
          { id: "A7-2", text: "Minta 2 rekomendasi profesional (atasan langsung) minimal 4 minggu sebelum deadline" },
          { id: "A7-3", text: "Submit 4–6 aplikasi" },
          { id: "A7-4", text: "Persiapan interview MBA (STAR stories: leadership, failure, conflict, impact)" }
        ] },
      { id: "A8", start: "2027-04-15", end: "2027-06-30", cat: "loa", title: "Offer & LoA unconditional",
        detail: "Offer pertama biasanya conditional (menunggu ijazah/skor bahasa). Penuhi syarat secepatnya agar menjadi unconditional, yang dibutuhkan untuk LPDP dan visa.",
        tasks: [
          { id: "A8-1", text: "Terima offer dan bayar deposit (cek kebijakan refund jika beasiswa gagal)" },
          { id: "A8-2", text: "Penuhi syarat → dapatkan LoA unconditional" },
          { id: "A8-3", text: "Unggah LoA ke sistem LPDP" }
        ] },
      { id: "A9", start: "2027-05-15", end: "2027-06-30", cat: "scholarship", estimate: true, title: "Pengumuman LPDP & persiapan keberangkatan",
        detail: "Perkiraan pengumuman akhir Tahap 1. Awardee mengikuti Persiapan Keberangkatan (PK).",
        tasks: [
          { id: "A9-1", text: "Ikuti PK LPDP" },
          { id: "A9-2", text: "Rencana cadangan jika gagal: lanjut ke Jalur B (intake 2028)" }
        ] },
      { id: "A10", start: "2027-06-15", end: "2027-08-31", cat: "visa", title: "Visa, akomodasi, berangkat",
        detail: "UK: Student visa butuh CAS dari kampus (keluar setelah unconditional offer & deposit). Proses visa ±3 minggu.",
        tasks: [
          { id: "A10-1", text: "Terima CAS / dokumen visa dari kampus" },
          { id: "A10-2", text: "Ajukan visa pelajar" },
          { id: "A10-3", text: "Booking akomodasi & tiket" }
        ] },
      { id: "A11", start: "2027-09-01", end: "2027-09-30", cat: "admission", title: "Mulai kuliah",
        detail: "Intake September 2027.", tasks: [] }
    ]
  };

  const B = {
    id: "B",
    name: "Jalur B: Intake September 2028",
    intake: "2028-09-01",
    summary: "Jalur cadangan sekaligus jalur dengan peluang lebih tinggi. Skor IELTS/GMAT dari Jalur A tetap dipakai (berlaku 2 tahun untuk IELTS, 5 tahun untuk GMAT). Membuka Chevening, LPDP Tahap 2/2028, dan MBA ronde 1–2.",
    milestones: [
      { id: "B1", start: "2027-02-01", end: "2027-04-30", cat: "scholarship", estimate: true, title: "Australia Awards & Fulbright (opsional)",
        detail: "Perkiraan pendaftaran Februari–April untuk keberangkatan tahun berikutnya. Catatan: kedua beasiswa ini sering membatasi atau tidak mendanai MBA. Cek bidang yang didukung sebelum mendaftar.",
        tasks: [
          { id: "B1-1", text: "Cek apakah program bisnis/MBA pilihan memenuhi syarat AAS/Fulbright tahun ini" }
        ] },
      { id: "B2", start: "2027-06-01", end: "2027-07-31", cat: "scholarship", estimate: true, title: "LPDP Tahap 2 2027",
        detail: "Perkiraan Juni–Juli. Cocok jika Jalur A gagal atau LoA 2027 tidak didapat. LoA tidak wajib saat mendaftar.",
        tasks: [
          { id: "B2-1", text: "Perbarui esai LPDP berdasarkan feedback Tahap 1 (jika ikut)" },
          { id: "B2-2", text: "Submit LPDP Tahap 2" }
        ] },
      { id: "B3", start: "2027-08-01", end: "2027-11-05", cat: "scholarship", estimate: true, title: "Chevening 2028/29",
        detail: "Biasanya buka awal Agustus dan tutup awal November. Syarat: pengalaman kerja minimal 2 tahun (2.800 jam), pilih 3 program di UK, dan LoA unconditional wajib diperoleh sebelum batas pertengahan Juli 2028. Banyak MBA melebihi batas biaya kuliah Chevening, jadi pilih program yang biayanya masuk atau kampus mitra.",
        tasks: [
          { id: "B3-1", text: "Pilih 3 program UK (minimal 1 yang biayanya di bawah batas Chevening)" },
          { id: "B3-2", text: "Tulis 4 esai Chevening: leadership, networking, studying in the UK, career plan" },
          { id: "B3-3", text: "Submit Chevening sebelum deadline November" }
        ] },
      { id: "B4", start: "2027-09-01", end: "2028-01-31", cat: "admission", title: "Aplikasi MBA Round 1–2 (UK/EU/US)",
        detail: "Round 1 sekitar September–Oktober, Round 2 sekitar Januari. Peluang diterima dan mendapat beasiswa kampus paling tinggi di ronde 1–2.",
        tasks: [
          { id: "B4-1", text: "Submit Round 1 untuk 2–3 sekolah" },
          { id: "B4-2", text: "Submit Round 2 untuk sisa sekolah" }
        ] },
      { id: "B5", start: "2028-01-15", end: "2028-02-28", cat: "scholarship", estimate: true, title: "LPDP Tahap 1 2028",
        detail: "Kesempatan LPDP berikutnya untuk intake 2028.",
        tasks: [{ id: "B5-1", text: "Submit LPDP Tahap 1 2028 (jika belum lolos)" }] },
      { id: "B6", start: "2028-02-01", end: "2028-07-15", cat: "loa", title: "LoA unconditional (batas Chevening)",
        detail: "Chevening mensyaratkan unconditional offer dari salah satu dari 3 pilihan sebelum batas pertengahan Juli 2028.",
        tasks: [{ id: "B6-1", text: "Dapatkan LoA unconditional dan unggah ke portal beasiswa" }] },
      { id: "B7", start: "2028-09-01", end: "2028-09-30", cat: "admission", title: "Mulai kuliah", detail: "Intake September 2028.", tasks: [] }
    ]
  };

  const SCHOLARSHIPS = [
    { name: "LPDP (reguler, luar negeri)", window: "Perkiraan 2× setahun: Jan–Feb dan Jun–Jul", loa: "Tidak wajib saat daftar. LoA unconditional wajib sebelum berangkat.", english: "IELTS min. 6.5 (cek panduan tahun berjalan)", mba: "Ya, untuk kampus yang ada di daftar tujuan LPDP", status: "Target utama Jalur A" },
    { name: "Chevening (UK)", window: "Perkiraan Agu–awal Nov", loa: "Tidak wajib saat daftar. Unconditional offer wajib sebelum pertengahan Juli tahun berikutnya.", english: "Mengikuti syarat kampus", mba: "Bisa, tetapi ada batas biaya kuliah", status: "Intake 2027 sudah tutup → Jalur B" },
    { name: "Australia Awards", window: "Perkiraan Feb–Apr", loa: "Tidak (kampus diatur setelah terpilih)", english: "IELTS 6.5 untuk postgraduate", mba: "Umumnya terbatas; cek bidang prioritas", status: "Opsional (Jalur B)" },
    { name: "Fulbright (AS)", window: "Perkiraan Feb–Apr", loa: "Tidak (penempatan dibantu)", english: "TOEFL iBT / IELTS", mba: "Sering dikecualikan; cek pengumuman", status: "Opsional (Jalur B)" }
  ];

  const WEEKLY = [
    { phase: "Fase 1 (25 Nov–18 Jan): IELTS sprint", load: "06:00 kuis 10 soal (20 mnt) · Sen–Jum malam 60 mnt IELTS (Writing 3×, Reading 2×) · Sabtu: 1 mock IELTS · Minggu: 90 mnt GMAT Quant dasar" },
    { phase: "Fase 2 (19 Jan–28 Feb): GMAT core + LPDP", load: "06:00 kuis · Sen–Jum malam 75 mnt GMAT (Quant 2×, Verbal 2×, DI 1×) · Sabtu: esai LPDP · Minggu: 1 section GMAT berwaktu" },
    { phase: "Fase 3 (Mar–Apr): GMAT final + aplikasi MBA", load: "06:00 kuis · Malam 45 mnt review error log · Akhir pekan: esai MBA & persiapan interview" }
  ];

  window.ROADMAP = { GOALS: GOALS, TRACKS: [A, B], SCHOLARSHIPS: SCHOLARSHIPS, WEEKLY: WEEKLY, createdAt: "2026-11-25" };
})();
