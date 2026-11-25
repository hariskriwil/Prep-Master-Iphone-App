/*
 * Generator soal GMAT Focus Quantitative (Problem Solving).
 * Setiap generator menerima rng() (0..1, deterministik per tanggal) dan
 * mengembalikan objek Question dengan angka baru + pembahasan bertahap.
 * id berbentuk "GQ-<kode>-<hash parameter>" sehingga soal yang salah bisa
 * diulang persis sama lewat spaced repetition.
 */
(function () {
  function int(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  function fmt(n) {
    if (typeof n === "string") return n;
    const r = Math.round(n * 100) / 100;
    return r.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  function frac(n, d) {
    const g = gcd(n, d); n /= g; d /= g;
    return d === 1 ? String(n) : n + "/" + d;
  }
  function comb(n, k) { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); }

  // Bangun 5 pilihan unik dari jawaban benar + distraktor, lalu acak.
  function choices(rng, correct, distractors, show) {
    show = show || fmt;
    const c = show(correct);
    const set = [c];
    distractors.forEach(function (d) { const s = show(d); if (set.indexOf(s) < 0 && set.length < 5) set.push(s); });
    let bump = 1;
    while (set.length < 5) {
      const s = show(typeof correct === "number" ? correct + bump * (bump % 2 ? 1 : -1) * Math.max(1, Math.round(Math.abs(correct) * 0.1)) : correct + bump);
      if (set.indexOf(s) < 0) set.push(s);
      bump++;
    }
    for (let i = set.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = set[i]; set[i] = set[j]; set[j] = t; }
    return { choices: set, answer: set.indexOf(c) };
  }

  const G = [];

  // 1. Persentase berantai
  G.push({ code: "PCT", type: "Percent", difficulty: 2, make: function (rng) {
    const a = pick(rng, [10, 20, 25, 30, 40, 50]);
    const b = pick(rng, [10, 20, 25, 30, 40]);
    const net = (1 + a / 100) * (1 - b / 100) - 1;
    const pct = Math.round(net * 10000) / 100;
    const show = function (x) { return (x > 0 ? "+" : "") + fmt(x) + "%"; };
    const c = choices(rng, pct, [a - b, -(b - a) * 0 + (a - b) + 1, Math.round(((1 + a / 100) * (1 + b / 100) - 1) * 10000) / 100, -pct, a * b / 100], show);
    return { key: a + "-" + b, prompt: "The price of a laptop was increased by " + a + "% and then the new price was decreased by " + b + "%. By what percent did the final price change relative to the original price?", choices: c.choices, answer: c.answer,
      explanation: "Jangan menjumlahkan persen secara langsung (" + a + "% − " + b + "% = " + (a - b) + "% itu jebakan).<br>Pakai faktor pengali: 1.0 × " + (1 + a / 100) + " × " + (1 - b / 100) + " = " + fmt(1 + net) + ".<br>Perubahan = " + fmt(1 + net) + " − 1 = " + fmt(net) + " → <b>" + show(pct) + "</b>.",
      tip: "Perubahan persen berturut-turut: kalikan faktornya (1 + r₁)(1 + r₂)." };
  } });

  // 2. Campuran larutan
  G.push({ code: "MIX", type: "Mixture", difficulty: 2, make: function (rng) {
    const x = pick(rng, [10, 20, 30, 40]); const y = pick(rng, [10, 20, 30, 60]);
    const p = pick(rng, [10, 15, 20, 25]); const qv = pick(rng, [30, 40, 50, 60]);
    const res = (x * p + y * qv) / (x + y);
    const show = function (v) { return fmt(v) + "%"; };
    const c = choices(rng, res, [(p + qv) / 2, (x * qv + y * p) / (x + y), res + 5, res - 5], show);
    return { key: [x, y, p, qv].join("-"), prompt: x + " liters of a " + p + "% salt solution are mixed with " + y + " liters of a " + qv + "% salt solution. What is the salt concentration of the resulting mixture?", choices: c.choices, answer: c.answer,
      explanation: "Garam total = " + x + "×" + p + "% + " + y + "×" + qv + "% = " + fmt(x * p / 100) + " + " + fmt(y * qv / 100) + " = " + fmt((x * p + y * qv) / 100) + " liter.<br>Volume total = " + (x + y) + " liter.<br>Konsentrasi = " + fmt((x * p + y * qv) / 100) + " / " + (x + y) + " = <b>" + show(res) + "</b>.<br>Jebakan: rata-rata biasa (" + show((p + qv) / 2) + ") hanya benar jika volumenya sama.",
      tip: "Weighted average: hasil selalu lebih dekat ke komponen yang volumenya lebih besar." };
  } });

  // 3. Work rate
  G.push({ code: "WORK", type: "Work rate", difficulty: 2, make: function (rng) {
    const pairs = [[3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [6, 3], [20, 30], [5, 20]];
    const pr = pick(rng, pairs); const a = pr[0], b = pr[1];
    const t = a * b / (a + b);
    const show = function (v) { return fmt(v) + " hours"; };
    const c = choices(rng, t, [(a + b) / 2, Math.abs(a - b), a + b, Math.min(a, b) / 2], show);
    return { key: a + "-" + b, prompt: "Machine A can complete a job in " + a + " hours, and Machine B can complete the same job in " + b + " hours. Working together at their constant rates, how many hours will the two machines take to complete the job?", choices: c.choices, answer: c.answer,
      explanation: "Rate A = 1/" + a + " job/jam, rate B = 1/" + b + " job/jam.<br>Rate gabungan = 1/" + a + " + 1/" + b + " = " + frac(a + b, a * b) + " job/jam.<br>Waktu = 1 ÷ rate = " + frac(a * b, a + b) + " = <b>" + show(t) + "</b>.<br>Cek cepat: hasil harus lebih kecil dari waktu mesin tercepat (" + Math.min(a, b) + " jam).",
      tip: "Rumus singkat dua pekerja: T = ab / (a + b)." };
  } });

  // 4. Kecepatan rata-rata pulang-pergi
  G.push({ code: "SPD", type: "Rates", difficulty: 2, make: function (rng) {
    const pr = pick(rng, [[40, 60], [30, 60], [60, 90], [45, 90], [20, 30], [50, 75], [36, 60]]);
    const v1 = pr[0], v2 = pr[1];
    const avg = 2 * v1 * v2 / (v1 + v2);
    const show = function (v) { return fmt(v) + " km/h"; };
    const c = choices(rng, avg, [(v1 + v2) / 2, avg + 2, avg - 3, v2 - v1 + v1 / 2], show);
    return { key: v1 + "-" + v2, prompt: "A cyclist rides from town P to town Q at an average speed of " + v1 + " km/h and returns along the same route at an average speed of " + v2 + " km/h. What is the average speed for the entire round trip?", choices: c.choices, answer: c.answer,
      explanation: "Kecepatan rata-rata = total jarak / total waktu, BUKAN rata-rata kecepatan.<br>Misal jarak = d. Waktu = d/" + v1 + " + d/" + v2 + ".<br>Rata-rata = 2d ÷ (d/" + v1 + " + d/" + v2 + ") = 2·" + v1 + "·" + v2 + "/(" + v1 + " + " + v2 + ") = <b>" + show(avg) + "</b>.<br>Jebakan: (" + v1 + " + " + v2 + ")/2 = " + fmt((v1 + v2) / 2) + ".",
      tip: "Untuk jarak sama, rata-rata kecepatan = harmonic mean: 2ab/(a + b)." };
  } });

  // 5. Bunga majemuk
  G.push({ code: "CI", type: "Interest", difficulty: 2, make: function (rng) {
    const P = pick(rng, [1000, 2000, 5000, 10000]); const r = pick(rng, [5, 10, 20]); const n = 2;
    const A = P * Math.pow(1 + r / 100, n);
    const show = function (v) { return "$" + fmt(v); };
    const c = choices(rng, A, [P * (1 + r * n / 100), P * Math.pow(1 + r / 100, 3), A - P, P + P * r / 100], show);
    return { key: P + "-" + r, prompt: "An investment of $" + fmt(P) + " earns " + r + "% annual interest, compounded annually. What is the value of the investment after 2 years?", choices: c.choices, answer: c.answer,
      explanation: "A = P(1 + r)ⁿ = " + fmt(P) + " × " + (1 + r / 100) + "² = " + fmt(P) + " × " + fmt(Math.pow(1 + r / 100, 2)) + " = <b>" + show(A) + "</b>.<br>Bunga sederhana akan memberi " + show(P * (1 + r * n / 100)) + "; selisihnya adalah bunga atas bunga.",
      tip: "Compound: kalikan faktor (1 + r) sebanyak n kali." };
  } });

  // 6. Rasio
  G.push({ code: "RAT", type: "Ratio", difficulty: 1, make: function (rng) {
    const a = int(rng, 2, 7); let b = int(rng, 2, 9); if (b === a) b = a + 1;
    const k = int(rng, 4, 12); const T = (a + b) * k;
    const diff = Math.abs(a - b) * k;
    const c = choices(rng, diff, [Math.abs(a - b), a * k, b * k, T / 2 - diff], fmt);
    return { key: [a, b, k].join("-"), prompt: "In a class of " + T + " students, the ratio of students who study finance to students who study marketing is " + a + " : " + b + ". Every student studies exactly one of the two subjects. How many more students study " + (a > b ? "finance" : "marketing") + " than " + (a > b ? "marketing" : "finance") + "?", choices: c.choices, answer: c.answer,
      explanation: "Total bagian = " + a + " + " + b + " = " + (a + b) + ". Satu bagian = " + T + " / " + (a + b) + " = " + k + ".<br>Finance = " + a * k + ", marketing = " + b * k + ".<br>Selisih = |" + a + " − " + b + "| × " + k + " = <b>" + diff + "</b>.",
      tip: "Rasio → cari nilai satu bagian dulu." };
  } });

  // 7. Sistem persamaan
  G.push({ code: "SYS", type: "Algebra", difficulty: 1, make: function (rng) {
    const x = int(rng, 3, 15); const y = int(rng, 1, x - 1);
    const S = x + y, D = x - y, P = x * y;
    const c = choices(rng, P, [S * D, x * x - y * y + 1, S + D, (S * S - D * D) / 2], fmt);
    return { key: x + "-" + y, prompt: "If x + y = " + S + " and x − y = " + D + ", what is the value of xy?", choices: c.choices, answer: c.answer,
      explanation: "Jumlahkan kedua persamaan: 2x = " + (S + D) + " → x = " + x + ".<br>Maka y = " + S + " − " + x + " = " + y + ".<br>xy = " + x + " × " + y + " = <b>" + P + "</b>.<br>Cara cepat: xy = [(x + y)² − (x − y)²]/4 = (" + S * S + " − " + D * D + ")/4 = " + P + ".",
      tip: "Identitas berguna: (x + y)² − (x − y)² = 4xy." };
  } });

  // 8. Sisa bagi
  G.push({ code: "REM", type: "Number properties", difficulty: 2, make: function (rng) {
    const d = pick(rng, [5, 7, 8, 9, 11]); const r = int(rng, 2, d - 1); const k = int(rng, 2, 6);
    const ans = (k * r) % d;
    const c = choices(rng, ans, [k * r, r, (ans + 1) % d, (r + k) % d], fmt);
    return { key: [d, r, k].join("-"), prompt: "When the positive integer n is divided by " + d + ", the remainder is " + r + ". What is the remainder when " + k + "n is divided by " + d + "?", choices: c.choices, answer: c.answer,
      explanation: "Tulis n = " + d + "q + " + r + ". Maka " + k + "n = " + d + "(" + k + "q) + " + k * r + ".<br>Sisa ditentukan oleh " + k * r + " mod " + d + " = <b>" + ans + "</b>.<br>Cek dengan angka: n = " + r + " → " + k + "n = " + k * r + " → " + k * r + " ÷ " + d + " sisa " + ans + ".",
      tip: "Untuk soal remainder, uji dengan n terkecil yang memenuhi (n = sisa itu sendiri)." };
  } });

  // 9. Peluang tanpa pengembalian
  G.push({ code: "PROB", type: "Probability", difficulty: 2, make: function (rng) {
    const r = int(rng, 3, 7); const b = int(rng, 2, 6); const n = r + b;
    const num = r * (r - 1), den = n * (n - 1);
    const show = function (v) { return v; };
    const correct = frac(num, den);
    const d1 = frac(r * r, n * n), d2 = frac(r, n), d3 = frac(r - 1, n - 1), d4 = frac(2 * r, n * (n - 1) || 1);
    const c = choices(rng, correct, [d1, d2, d3, d4], show);
    return { key: r + "-" + b, prompt: "A bag contains " + r + " red marbles and " + b + " blue marbles. Two marbles are drawn at random without replacement. What is the probability that both marbles are red?", choices: c.choices, answer: c.answer,
      explanation: "Ambilan 1 merah: " + r + "/" + n + ". Setelah itu tersisa " + (r - 1) + " merah dari " + (n - 1) + ".<br>P = " + r + "/" + n + " × " + (r - 1) + "/" + (n - 1) + " = " + num + "/" + den + " = <b>" + correct + "</b>.<br>Jebakan: (" + r + "/" + n + ")² hanya berlaku jika bola dikembalikan.",
      tip: "Without replacement: penyebut dan pembilang berkurang setiap ambilan." };
  } });

  // 10. Kombinasi
  G.push({ code: "COMB", type: "Combinatorics", difficulty: 2, make: function (rng) {
    const n = int(rng, 6, 10); const k = int(rng, 2, 4);
    const ans = comb(n, k); let perm = 1; for (let i = 0; i < k; i++) perm *= (n - i);
    const c = choices(rng, ans, [perm, n * k, comb(n, k - 1), Math.pow(n, k) > 9999 ? ans * 2 : Math.pow(n, k)], fmt);
    return { key: n + "-" + k, prompt: "A committee of " + k + " people is to be selected from a group of " + n + " candidates. How many different committees are possible?", choices: c.choices, answer: c.answer,
      explanation: "Urutan tidak penting (komite), jadi kombinasi: C(" + n + ", " + k + ") = " + n + "! / (" + k + "!·" + (n - k) + "!) = " + perm + " / " + (perm / ans) + " = <b>" + ans + "</b>.<br>Jebakan: " + perm + " adalah permutasi (jika urutan/jabatan dibedakan).",
      tip: "Tanya diri: apakah memilih A lalu B berbeda dengan B lalu A? Jika tidak → kombinasi." };
  } });

  // 11. Eksponen
  G.push({ code: "EXP", type: "Exponents", difficulty: 2, make: function (rng) {
    const a = int(rng, 2, 6), b = int(rng, 2, 5), c3 = int(rng, 1, 3);
    const ans = a + 2 * b - 3 * c3;
    const c = choices(rng, ans, [a + b - c3, a + 2 * b + 3 * c3, a * 2 * b / (3 * c3), a + b * 2 - c3], fmt);
    return { key: [a, b, c3].join("-"), prompt: "If 2<sup>" + a + "</sup> × 4<sup>" + b + "</sup> ÷ 8<sup>" + c3 + "</sup> = 2<sup>k</sup>, what is the value of k?", choices: c.choices, answer: c.answer,
      explanation: "Samakan basis: 4 = 2², 8 = 2³.<br>2<sup>" + a + "</sup> × 2<sup>" + 2 * b + "</sup> ÷ 2<sup>" + 3 * c3 + "</sup> = 2<sup>" + a + " + " + 2 * b + " − " + 3 * c3 + "</sup>.<br>k = <b>" + ans + "</b>.",
      tip: "Soal eksponen GMAT hampir selalu diselesaikan dengan menyamakan basis." };
  } });

  // 12. Banyaknya kelipatan
  G.push({ code: "MULT", type: "Number properties", difficulty: 1, make: function (rng) {
    const k = pick(rng, [3, 4, 6, 7, 9]); const lo = int(rng, 10, 60); const hi = lo + int(rng, 60, 200);
    const first = Math.ceil(lo / k) * k, last = Math.floor(hi / k) * k;
    const ans = (last - first) / k + 1;
    const c = choices(rng, ans, [ans - 1, ans + 1, Math.round((hi - lo) / k), Math.floor(hi / k)], fmt);
    return { key: [k, lo, hi].join("-"), prompt: "How many multiples of " + k + " are there between " + lo + " and " + hi + ", inclusive?", choices: c.choices, answer: c.answer,
      explanation: "Kelipatan pertama ≥ " + lo + ": " + first + ". Kelipatan terakhir ≤ " + hi + ": " + last + ".<br>Jumlah = (" + last + " − " + first + ")/" + k + " + 1 = <b>" + ans + "</b>.<br>Jangan lupa \"+ 1\" (inclusive counting).",
      tip: "Rumus banyak suku: (terakhir − pertama)/beda + 1." };
  } });

  // 13. Markup & diskon
  G.push({ code: "PROF", type: "Percent", difficulty: 2, make: function (rng) {
    const m = pick(rng, [20, 25, 40, 50, 60]); const d = pick(rng, [10, 20, 25]);
    const profit = Math.round(((1 + m / 100) * (1 - d / 100) - 1) * 10000) / 100;
    const show = function (v) { return fmt(v) + "%"; };
    const c = choices(rng, profit, [m - d, m * (1 - d / 100), profit + 5, m], show);
    return { key: m + "-" + d, prompt: "A retailer marks up the cost of a jacket by " + m + "% to set its list price, then sells it at a " + d + "% discount off the list price. The retailer's profit is what percent of the cost?", choices: c.choices, answer: c.answer,
      explanation: "Misal cost = 100. List price = " + (100 + m) + ". Harga jual = " + (100 + m) + " × " + (1 - d / 100) + " = " + fmt((100 + m) * (1 - d / 100)) + ".<br>Profit = " + fmt((100 + m) * (1 - d / 100) - 100) + " dari cost 100 → <b>" + show(profit) + "</b>.",
      tip: "Soal persen tanpa angka absolut: pakai basis 100." };
  } });

  // 14. Himpunan beririsan
  G.push({ code: "SETS", type: "Overlapping sets", difficulty: 2, make: function (rng) {
    const N = pick(rng, [100, 120, 150, 200]); const both = int(rng, 10, 30);
    const A = both + int(rng, 20, 40), B = both + int(rng, 15, 35);
    const neither = N - (A + B - both);
    const c = choices(rng, both, [A + B - N, N - A - B + neither, neither, A + B - both], fmt);
    return { key: [N, A, B, both].join("-"), prompt: "Of the " + N + " employees at a firm, " + A + " speak English, " + B + " speak Mandarin, and " + neither + " speak neither language. How many employees speak both English and Mandarin?", choices: c.choices, answer: c.answer,
      explanation: "Total = A + B − Both + Neither.<br>" + N + " = " + A + " + " + B + " − Both + " + neither + ".<br>Both = " + A + " + " + B + " + " + neither + " − " + N + " = <b>" + both + "</b>.",
      tip: "Dua himpunan: Total = A + B − Both + Neither." };
  } });

  // 15. Akar persamaan kuadrat
  G.push({ code: "QUAD", type: "Algebra", difficulty: 3, make: function (rng) {
    const p = int(rng, 1, 7), r = int(rng, 1, 7) * (rng() < 0.5 ? -1 : 1);
    const s = p + r, prod = p * r;
    const ans = p * p + r * r;
    const c = choices(rng, ans, [s * s, s * s + 2 * prod, Math.abs(s * s - prod), (p + r) * (p - r) + 2 * r * r + 1], fmt);
    const bTerm = s === 0 ? "" : (s > 0 ? " − " + s + "x" : " + " + (-s) + "x");
    const cTerm = prod >= 0 ? " + " + prod : " − " + (-prod);
    return { key: p + "_" + r, prompt: "If a and b are the two roots of x²" + bTerm + cTerm + " = 0, what is the value of a² + b²?", choices: c.choices, answer: c.answer,
      explanation: "Vieta: a + b = " + s + ", ab = " + prod + ".<br>a² + b² = (a + b)² − 2ab = " + s * s + " − (" + 2 * prod + ") = <b>" + ans + "</b>.<br>Cek: akar-akarnya " + p + " dan " + r + " → " + p * p + " + " + r * r + " = " + ans + ".",
      tip: "x² − (a + b)x + ab = 0. Hubungkan dengan (a + b)² − 2ab." };
  } });

  // 16. Rata-rata
  G.push({ code: "MEAN", type: "Statistics", difficulty: 1, make: function (rng) {
    const n = int(rng, 4, 7); const m = int(rng, 60, 85); const target = m + int(rng, 1, 4);
    const ans = target * (n + 1) - m * n;
    const c = choices(rng, ans, [target, target + (target - m), m * (n + 1) - target * n + 2 * target, ans - n], fmt);
    return { key: [n, m, target].join("-"), prompt: "A student's average score on " + n + " tests is " + m + ". What score must the student earn on the next test to raise the average of all " + (n + 1) + " tests to " + target + "?", choices: c.choices, answer: c.answer,
      explanation: "Total sekarang = " + n + " × " + m + " = " + n * m + ".<br>Total yang dibutuhkan = " + (n + 1) + " × " + target + " = " + (n + 1) * target + ".<br>Skor tes berikutnya = " + (n + 1) * target + " − " + n * m + " = <b>" + ans + "</b>.<br>Cara cepat: " + target + " + " + n + " × (" + target + " − " + m + ") = " + ans + ".",
      tip: "Rata-rata → ubah ke total (sum = mean × n)." };
  } });

  window.QUANT_GENERATORS = G.map(function (g) {
    return {
      code: g.code, type: g.type, difficulty: g.difficulty,
      make: function (rng) {
        const o = g.make(rng);
        return { id: "GQ-" + g.code + "-" + o.key, exam: "GMAT", section: "Quant", type: g.type, difficulty: g.difficulty, prompt: o.prompt, choices: o.choices, answer: o.answer, explanation: o.explanation, tip: o.tip, generated: true };
      }
    };
  });
})();
