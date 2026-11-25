/*
 * Prep Master — logika aplikasi.
 *
 * STATE (satu dokumen JSON per pengguna, disimpan di db artifact
 * data/users/<id>/progress dan di-cache di localStorage):
 * {
 *   v: 1,
 *   updatedAt: epoch ms,
 *   track: "A" | "B",                     // jalur roadmap yang dipilih
 *   checklist: { [taskId]: true },        // centang tugas roadmap
 *   seen: { [questionId]: "YYYY-MM-DD" }, // terakhir kali soal muncul
 *   srs: { [questionId]: { box: 0..3, due: "YYYY-MM-DD", q?: Question } },
 *                                         // antrean ulang soal yang salah (1-3-7-16 hari)
 *   days: { "YYYY-MM-DD": {
 *     items: [questionId x10], review: [questionId], gen: { [id]: Question },
 *     answers: { [questionId]: { c: index dipilih, ok: bool, t: epoch ms } },
 *     done: bool, finishedAt: epoch ms,
 *     sum: { total, correct, by: { [kind]: [benar, total] } }
 *   } }
 * }
 */
(function () {
  "use strict";

  const IELTS = window.BANK_IELTS, GMAT = window.BANK_GMAT, GENS = window.QUANT_GENERATORS, RM = window.ROADMAP;
  const STATIC_Q = {};
  IELTS.questions.concat(GMAT.questions).forEach(function (q) { STATIC_Q[q.id] = q; });
  const PASSAGES = Object.assign({}, IELTS.passages, GMAT.passages);
  const STORE_KEY = "prepmaster.v1";
  const INTERVALS = [1, 3, 7, 16];
  const LETTERS = ["A", "B", "C", "D", "E"];
  const KIND_LABEL = {
    Reading: "IELTS Reading", Vocabulary: "IELTS Vocabulary", Grammar: "IELTS Grammar", Writing: "IELTS Writing",
    Quant: "GMAT Quant", DS: "GMAT Data Sufficiency", CR: "GMAT Critical Reasoning", RC: "GMAT Reading Comp."
  };
  const KIND_ORDER = ["Reading", "Vocabulary", "Grammar", "Writing", "Quant", "DS", "CR", "RC"];
  const APP_URL = window.PREP_APP_URL || "";

  // ---------- util ----------
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  // Konten soal boleh memuat <b>, <br>, <sup>, <i> saja; selebihnya di-escape.
  function rich(s) { return esc(s).replace(/&lt;(\/?)(b|br|sup|i|em|strong)\s*\/?&gt;/g, "<$1$2>").replace(/\n\n/g, "</p><p>"); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function keyOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseKey(k) { const p = k.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(k, n) { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  function fmtDate(k, withDay) { const d = parseKey(k); return (withDay ? DAYS[d.getDay()] + ", " : "") + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function fmtShort(k) { const d = parseKey(k); return d.getDate() + " " + MONTHS[d.getMonth()]; }
  function unlockCode(k) { return (Number(k.replace(/-/g, "")) * 37 + 4242) % 9973; }

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shuffle(arr, rng) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function kindOf(q) {
    if (q.exam === "IELTS") return q.section;
    if (q.section === "Quant") return "Quant";
    if (q.type === "DS") return "DS";
    if (q.type === "RC") return "RC";
    return "CR";
  }

  // ---------- state ----------
  function emptyState() { return { v: 1, updatedAt: 0, track: "A", checklist: {}, seen: {}, srs: {}, days: {} }; }
  function loadLocal() { try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function normalize(s) { const e = emptyState(); s = s && typeof s === "object" ? s : {}; Object.keys(e).forEach(function (k) { if (s[k] == null) s[k] = e[k]; }); return s; }
  let state = normalize(loadLocal());
  let today = keyOf(new Date());

  function countAnswers(d) { return d && d.answers ? Object.keys(d.answers).length : 0; }
  function merge(local, remote) {
    local = normalize(local); remote = normalize(remote);
    const newer = (remote.updatedAt || 0) >= (local.updatedAt || 0) ? remote : local;
    const older = newer === remote ? local : remote;
    const out = Object.assign(emptyState(), newer);
    out.seen = Object.assign({}, older.seen, newer.seen);
    out.days = Object.assign({}, older.days);
    Object.keys(newer.days).forEach(function (k) {
      if (!out.days[k] || countAnswers(newer.days[k]) >= countAnswers(out.days[k])) out.days[k] = newer.days[k];
    });
    return out;
  }

  function getQ(id, day) {
    if (STATIC_Q[id]) return STATIC_Q[id];
    if (day && day.gen && day.gen[id]) return day.gen[id];
    if (state.srs[id] && state.srs[id].q) return state.srs[id].q;
    return null;
  }

  // ---------- penyusun soal harian ----------
  function pickFresh(pool, rng, n, exclude) {
    const order = shuffle(pool, rng).filter(function (q) { return !exclude.has(q.id); });
    order.sort(function (a, b) { const x = state.seen[a.id] || "", y = state.seen[b.id] || ""; return x < y ? -1 : x > y ? 1 : 0; });
    const out = order.slice(0, n);
    out.forEach(function (q) { exclude.add(q.id); });
    return out;
  }
  function pickFromPassage(bank, rng, n, exclude) {
    const ids = shuffle(Object.keys(bank.passages), rng);
    let best = null, bestScore = -1;
    ids.forEach(function (pid) {
      const qs = bank.questions.filter(function (q) { return q.passage === pid && !exclude.has(q.id); });
      const unseen = qs.filter(function (q) { return !state.seen[q.id]; }).length;
      const oldest = qs.reduce(function (m, q) { const s = state.seen[q.id] || ""; return s < m ? s : m; }, "9999");
      const score = qs.length >= n ? unseen * 100000 + (99999999 - Number((oldest === "" ? "00000000" : oldest.replace(/-/g, "")))) / 1000 : -1;
      if (score > bestScore) { bestScore = score; best = pid; }
    });
    if (!best) return [];
    return pickFresh(bank.questions.filter(function (q) { return q.passage === best; }), rng, n, exclude);
  }

  function buildDay(key) {
    const rng = mulberry(hashStr("prep:" + key));
    const due = Object.keys(state.srs).filter(function (id) { return state.srs[id].due <= key && getQ(id); })
      .sort(function (a, b) { return state.srs[a].due < state.srs[b].due ? -1 : 1; });
    const revI = due.filter(function (id) { return getQ(id).exam === "IELTS"; }).slice(0, 2);
    const revG = due.filter(function (id) { return getQ(id).exam === "GMAT"; }).slice(0, 2);
    const exclude = new Set(due);
    const gen = {};
    // soal generator yang diulang disalin ke hari ini agar tetap bisa ditampilkan
    revI.concat(revG).forEach(function (id) { const q = getQ(id); if (q && q.generated) gen[id] = q; });

    function reduce(need, ids) {
      ids.forEach(function (id) {
        const k = kindOf(getQ(id));
        if (need[k] > 0) need[k]--;
        else { const top = Object.keys(need).sort(function (a, b) { return need[b] - need[a]; })[0]; need[top]--; }
      });
      return need;
    }
    const byKind = function (bank, kind) { return bank.questions.filter(function (q) { return kindOf(q) === kind; }); };

    const nI = reduce({ Reading: 2, Vocabulary: 1, Grammar: 1, Writing: 1 }, revI);
    const ielts = revI.slice();
    if (nI.Reading > 0) pickFromPassage(IELTS, rng, nI.Reading, exclude).forEach(function (q) { ielts.push(q.id); });
    ["Vocabulary", "Grammar", "Writing"].forEach(function (k) { if (nI[k] > 0) pickFresh(byKind(IELTS, k), rng, nI[k], exclude).forEach(function (q) { ielts.push(q.id); }); });

    const nG = reduce({ Quant: 2, DS: 1, CR: 1, RC: 1 }, revG);
    const gmat = revG.slice();
    if (nG.Quant > 0) {
      const gens = shuffle(GENS, rng);
      let made = 0;
      for (let i = 0; i < gens.length && made < nG.Quant; i++) {
        const q = gens[i].make(rng);
        if (!exclude.has(q.id)) { gen[q.id] = q; gmat.push(q.id); exclude.add(q.id); made++; }
      }
    }
    if (nG.DS > 0) pickFresh(byKind(GMAT, "DS"), rng, nG.DS, exclude).forEach(function (q) { gmat.push(q.id); });
    if (nG.CR > 0) pickFresh(byKind(GMAT, "CR"), rng, nG.CR, exclude).forEach(function (q) { gmat.push(q.id); });
    if (nG.RC > 0) pickFromPassage(GMAT, rng, nG.RC, exclude).forEach(function (q) { gmat.push(q.id); });

    return { items: ielts.concat(gmat), review: revI.concat(revG), gen: gen, answers: {}, done: false };
  }

  function summarize(day) {
    const by = {}; let correct = 0;
    day.items.forEach(function (id) {
      const q = getQ(id, day); const a = day.answers[id]; if (!q || !a) return;
      const k = kindOf(q); by[k] = by[k] || [0, 0]; by[k][1]++; if (a.ok) { by[k][0]++; correct++; }
    });
    return { total: day.items.length, correct: correct, by: by };
  }

  function prune() {
    Object.keys(state.days).forEach(function (k) {
      const d = state.days[k];
      if (k !== today && d.gen) { if (d.done && !d.sum) d.sum = summarize(d); delete d.gen; }
      if (daysBetween(k, today) > 90 && d.answers) { if (!d.sum) d.sum = summarize(d); delete d.answers; delete d.items; delete d.review; }
    });
  }

  function ensureToday() {
    today = keyOf(new Date());
    if (!state.days[today]) { prune(); state.days[today] = buildDay(today); save(); }
    return state.days[today];
  }

  function answer(id, idx) {
    const day = state.days[today];
    if (!day || day.answers[id]) return;
    const q = getQ(id, day); if (!q) return;
    const ok = idx === q.answer;
    day.answers[id] = { c: idx, ok: ok, t: Date.now() };
    state.seen[id] = today;
    const s = state.srs[id];
    if (!ok) {
      const entry = { box: 0, due: addDays(today, 1) };
      if (q.generated) entry.q = q;
      state.srs[id] = entry;
    } else if (s) {
      const box = s.box + 1;
      if (box >= INTERVALS.length) delete state.srs[id];
      else state.srs[id] = Object.assign({}, s, { box: box, due: addDays(today, INTERVALS[box]) });
    }
    if (day.items.every(function (i) { return day.answers[i]; })) {
      day.done = true; day.finishedAt = Date.now(); day.sum = summarize(day);
    }
    save();
  }

  // ---------- penyimpanan: localStorage + db artifact ----------
  let docRef = null, writing = false, pending = false, timer = null;
  function save() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
    if (docRef) { clearTimeout(timer); timer = setTimeout(flush, 700); }
  }
  async function flush() {
    if (!docRef) return;
    if (writing) { pending = true; return; }
    writing = true;
    try { await docRef.set(JSON.parse(JSON.stringify(state))); setSync("cloud"); }
    catch (e) {
      if (e && e.code === "unavailable") { setTimeout(function () { pending = true; }, 1500 + Math.random() * 1500); setSync("retry"); }
      else if (e && (e.code === "invalid_argument" || e.code === "revoked" || e.code === "not_granted")) { docRef = null; setSync("local"); }
      else setSync("retry");
    }
    writing = false;
    if (pending) { pending = false; flush(); }
  }
  function setSync(s) {
    const b = $("#sync"); if (!b) return;
    const map = { cloud: ["Tersimpan di akun", "ok"], local: ["Hanya di perangkat ini", "warn"], retry: ["Menunggu sinkron", "warn"], loading: ["Menyambung…", ""] };
    b.textContent = map[s][0]; b.dataset.state = map[s][1];
  }
  async function initCloud() {
    if (!window.claude || typeof window.claude.use !== "function") { setSync("local"); return; }
    setSync("loading");
    try {
      const res = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      const db = res[0], user = res[1];
      if (!db || !user) { setSync("local"); return; }
      const uid = await user.id();
      if (!uid) { setSync("local"); return; }
      const ref = db.doc("data/users/" + uid + "/progress");
      const snap = await Promise.race([ref.get(), new Promise(function (_, rej) { setTimeout(function () { rej({ code: "timeout" }); }, 10000); })]);
      docRef = ref;
      if (snap.exists) {
        state = merge(state, snap.data());
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
      }
      setSync("cloud");
      ensureToday();
      flush();
      renderAll();
    } catch (e) { setSync(e && e.code === "timeout" ? "retry" : "local"); }
  }

  // ---------- UI: hari ini ----------
  const ui = { cur: null, open: {} };

  function difficultyDots(n) { let s = ""; for (let i = 1; i <= 3; i++) s += '<i class="dot' + (i <= n ? " on" : "") + '"></i>'; return '<span class="diff" aria-label="Tingkat ' + n + ' dari 3">' + s + "</span>"; }

  function renderToday() {
    const day = ensureToday();
    const root = $("#view-today"); root.innerHTML = "";
    const answered = countAnswers(day);
    const head = el("section", "today-head");
    head.innerHTML =
      '<p class="eyebrow">Sesi pagi · ' + esc(fmtDate(today, true)) + "</p>" +
      "<h1>" + (day.done ? "Sesi hari ini selesai" : answered ? "Lanjutkan, " + (10 - answered) + " soal lagi" : "10 soal sebelum mulai hari") + "</h1>" +
      '<p class="lede">' + (day.done ? "Kode buka sudah aktif. Pembahasan semua soal ada di bawah." : "5 IELTS + 5 GMAT. Aplikasi lain di HP terbuka setelah Anda memasukkan kode yang muncul di akhir sesi.") + "</p>";
    root.appendChild(head);

    // bar progres 10 segmen
    const bar = el("ol", "segbar");
    day.items.forEach(function (id, i) {
      const q = getQ(id, day); const a = day.answers[id];
      const li = el("li");
      const b = el("button", "seg " + (q ? q.exam.toLowerCase() : "") + (a ? (a.ok ? " ok" : " bad") : "") + (ui.cur === i && !day.done ? " cur" : ""));
      b.type = "button";
      b.setAttribute("aria-label", "Soal " + (i + 1) + (a ? (a.ok ? ", benar" : ", salah") : ", belum dijawab"));
      b.innerHTML = '<span class="segn">' + (i + 1) + "</span>";
      b.addEventListener("click", function () { ui.cur = i; if (day.done) { ui.open[id] = true; renderToday(); const t = document.getElementById("rv-" + i); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); } else renderToday(); });
      li.appendChild(b); bar.appendChild(li);
    });
    root.appendChild(bar);
    const legend = el("p", "seglegend", '<span><i class="sw ielts"></i>IELTS</span><span><i class="sw gmat"></i>GMAT</span><span><i class="sw okc"></i>Benar</span><span><i class="sw badc"></i>Salah</span>');
    root.appendChild(legend);

    if (day.done) { renderDone(root, day); return; }

    if (ui.cur == null || ui.cur >= day.items.length) {
      ui.cur = day.items.findIndex(function (id) { return !day.answers[id]; });
      if (ui.cur < 0) ui.cur = 0;
      bar.children[ui.cur].firstChild.classList.add("cur");
    }
    root.appendChild(questionCard(day, ui.cur));
  }

  function questionCard(day, i) {
    const id = day.items[i]; const q = getQ(id, day);
    const card = el("article", "qcard " + q.exam.toLowerCase());
    const a = day.answers[id];
    const isReview = day.review && day.review.indexOf(id) >= 0;
    card.innerHTML =
      '<header class="qmeta"><span class="exam">' + esc(q.exam) + '</span><span class="kind">' + esc(KIND_LABEL[kindOf(q)]) + (q.type && q.type.indexOf("CR-") === 0 ? " · " + esc(q.type.slice(3)) : q.type === "TFNG" ? " · True/False/Not Given" : "") + "</span>" +
      (isReview ? '<span class="chip review">Ulangan</span>' : "") + difficultyDots(q.difficulty) + '<span class="qnum">' + (i + 1) + "/10</span></header>";
    if (q.passage && PASSAGES[q.passage]) {
      const p = PASSAGES[q.passage];
      const det = el("details", "passage");
      det.open = !a;
      det.innerHTML = "<summary>Bacaan: " + esc(p.title) + "</summary><div class=\"ptext\"><p>" + rich(p.text) + "</p></div>";
      card.appendChild(det);
    }
    card.appendChild(el("div", "prompt", "<p>" + rich(q.prompt) + "</p>"));
    const list = el("div", "choices"); list.setAttribute("role", "group"); list.setAttribute("aria-label", "Pilihan jawaban");
    q.choices.forEach(function (c, ci) {
      const b = el("button", "choice"); b.type = "button"; b.id = "c-" + i + "-" + ci;
      b.innerHTML = '<span class="letter">' + LETTERS[ci] + '</span><span class="ctext">' + rich(c) + "</span>";
      if (a) {
        b.disabled = true;
        if (ci === q.answer) b.classList.add("correct");
        else if (ci === a.c) b.classList.add("wrong");
      } else {
        b.addEventListener("click", function () { answer(id, ci); renderToday(); renderProgress(); });
      }
      list.appendChild(b);
    });
    card.appendChild(list);

    if (a) {
      const fb = el("div", "feedback " + (a.ok ? "ok" : "bad"));
      fb.innerHTML = "<strong>" + (a.ok ? "Benar." : "Belum tepat.") + "</strong> " + (a.ok ? "" : "Jawaban benar: " + LETTERS[q.answer] + ". Soal ini akan muncul lagi besok.");
      card.appendChild(fb);
      const ex = explanationBlock(q, ui.open[id]);
      card.appendChild(ex);
      const nav = el("div", "qnav");
      const next = day.items.findIndex(function (x, j) { return j > i && !day.answers[x]; });
      const first = day.items.findIndex(function (x) { return !day.answers[x]; });
      const target = next >= 0 ? next : first;
      const btn = el("button", "primary", target >= 0 ? "Soal berikutnya" : "Lihat hasil");
      btn.type = "button";
      btn.addEventListener("click", function () { ui.cur = target >= 0 ? target : null; renderToday(); window.scrollTo({ top: 0, behavior: "smooth" }); });
      nav.appendChild(btn);
      card.appendChild(nav);
    }
    return card;
  }

  function explanationBlock(q, open) {
    const det = el("details", "explain");
    if (open) det.open = true;
    det.innerHTML = "<summary>Pembahasan</summary><div class=\"exbody\"><p>" + rich(q.explanation) + "</p>" + (q.tip ? '<p class="tip"><b>Strategi:</b> ' + rich(q.tip) + "</p>" : "") + "</div>";
    det.addEventListener("toggle", function () { ui.open[q.id] = det.open; });
    return det;
  }

  function renderDone(root, day) {
    const sum = day.sum || summarize(day);
    const code = unlockCode(today);
    const done = el("section", "donecard");
    const pct = Math.round(sum.correct / sum.total * 100);
    done.innerHTML =
      '<div class="score"><span class="big">' + sum.correct + '</span><span class="of">/ ' + sum.total + '</span><span class="pct">' + pct + "%</span></div>" +
      '<div class="code"><p class="eyebrow">Kode buka hari ini</p><p class="codeval" id="codeval">' + code + '</p><button type="button" class="ghost" id="copycode">Salin kode</button></div>' +
      '<p class="muted small">Masukkan kode ini saat Shortcuts "Gerbang Prep" memintanya. Kode berganti setiap hari.</p>';
    root.appendChild(done);
    $("#copycode", done).addEventListener("click", function (ev) {
      const b = ev.currentTarget;
      navigator.clipboard.writeText(String(code)).then(function () { b.textContent = "Tersalin"; }, function () {
        const r = document.createRange(); r.selectNodeContents($("#codeval")); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Terpilih, salin manual";
      });
    });

    const h = el("h2", "sect", "Pembahasan");
    root.appendChild(h);
    const list = el("ol", "reviewlist");
    day.items.forEach(function (id, i) {
      const q = getQ(id, day); const a = day.answers[id]; if (!q || !a) return;
      const li = el("li", "rv " + (a.ok ? "ok" : "bad")); li.id = "rv-" + i;
      const det = el("details");
      if (ui.open[id]) det.open = true;
      det.addEventListener("toggle", function () { ui.open[id] = det.open; });
      const summaryText = q.prompt.replace(/<br>[\s\S]*$/, "").replace(/<[^>]+>/g, "");
      det.innerHTML =
        '<summary><span class="mark" aria-hidden="true">' + (a.ok ? "✓" : "✕") + '</span><span class="rvmeta">' + (i + 1) + ". " + esc(KIND_LABEL[kindOf(q)]) + '</span><span class="rvq">' + esc(summaryText.length > 90 ? summaryText.slice(0, 88) + "…" : summaryText) + "</span></summary>";
      const body = el("div", "rvbody");
      if (q.passage && PASSAGES[q.passage]) body.appendChild(el("details", "passage", "<summary>Bacaan: " + esc(PASSAGES[q.passage].title) + '</summary><div class="ptext"><p>' + rich(PASSAGES[q.passage].text) + "</p></div>"));
      body.appendChild(el("div", "prompt", "<p>" + rich(q.prompt) + "</p>"));
      const ul = el("ul", "rvchoices");
      q.choices.forEach(function (c, ci) {
        const cls = ci === q.answer ? "correct" : ci === a.c ? "wrong" : "";
        ul.appendChild(el("li", cls, '<span class="letter">' + LETTERS[ci] + "</span><span>" + rich(c) + "</span>" + (ci === a.c ? '<span class="you">Jawaban Anda</span>' : "")));
      });
      body.appendChild(ul);
      body.appendChild(el("div", "exbody", "<p>" + rich(q.explanation) + "</p>" + (q.tip ? '<p class="tip"><b>Strategi:</b> ' + rich(q.tip) + "</p>" : "")));
      det.appendChild(body);
      li.appendChild(det);
      list.appendChild(li);
    });
    root.appendChild(list);
    const nextDay = el("p", "muted small center", "Sesi berikutnya disusun otomatis besok pagi. Soal yang salah masuk antrean ulang (1, 3, 7, lalu 16 hari).");
    root.appendChild(nextDay);
  }

  // ---------- UI: progres ----------
  function allDaySums() {
    return Object.keys(state.days).sort().map(function (k) {
      const d = state.days[k];
      const s = d.sum || (d.items ? summarize(d) : null);
      return { key: k, done: !!d.done, sum: s, answered: countAnswers(d) };
    });
  }
  function streak() {
    let n = 0; let k = state.days[today] && state.days[today].done ? today : addDays(today, -1);
    while (state.days[k] && state.days[k].done) { n++; k = addDays(k, -1); }
    return n;
  }

  function renderProgress() {
    const root = $("#view-progress"); if (!root) return;
    root.innerHTML = "";
    const sums = allDaySums();
    let total = 0, correct = 0; const by = {};
    sums.forEach(function (d) { if (!d.sum) return; Object.keys(d.sum.by).forEach(function (k) { by[k] = by[k] || [0, 0]; by[k][0] += d.sum.by[k][0]; by[k][1] += d.sum.by[k][1]; total += d.sum.by[k][1]; correct += d.sum.by[k][0]; }); });
    const last7 = sums.filter(function (d) { return daysBetween(d.key, today) < 7 && d.sum && d.answered; });
    let c7 = 0, t7 = 0; last7.forEach(function (d) { c7 += d.sum.correct; t7 += Object.keys(d.sum.by).reduce(function (m, k) { return m + d.sum.by[k][1]; }, 0); });
    const acc7 = t7 ? Math.round(c7 / t7 * 100) : null;
    const dueCount = Object.keys(state.srs).length;

    root.appendChild(el("section", "pagehead", '<p class="eyebrow">Progres</p><h1>Kebiasaan pagi Anda</h1>'));
    const kpis = el("div", "kpis");
    [["Streak", streak() + " hari", "Sesi selesai berturut-turut"],
     ["Akurasi 7 hari", acc7 == null ? "–" : acc7 + "%", "Target " + RM.GOALS.daily.accuracy + "% sebelum ujian resmi"],
     ["Soal dijawab", String(total), correct + " benar sejak mulai"],
     ["Antrean ulang", String(dueCount), "Soal salah yang akan diulang"]].forEach(function (k) {
      kpis.appendChild(el("div", "kpi", '<p class="klabel">' + k[0] + '</p><p class="kval">' + esc(k[1]) + '</p><p class="ksub">' + esc(k[2]) + "</p>"));
    });
    root.appendChild(kpis);

    // grafik 14 hari
    const days = []; for (let i = 13; i >= 0; i--) days.push(addDays(today, -i));
    const W = 340, H = 140, padL = 24, padB = 22, bw = (W - padL - 4) / 14;
    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Skor 14 hari terakhir">';
    [0, 5, 10].forEach(function (v) { const y = H - padB - v / 10 * (H - padB - 10); svg += '<line class="grid" x1="' + padL + '" x2="' + W + '" y1="' + y + '" y2="' + y + '"/><text class="axis" x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + v + "</text>"; });
    const ty = H - padB - 8 / 10 * (H - padB - 10);
    svg += '<line class="target" x1="' + padL + '" x2="' + W + '" y1="' + ty + '" y2="' + ty + '"/><text class="axis tlabel" x="' + (W - 2) + '" y="' + (ty - 4) + '" text-anchor="end">target 8</text>';
    days.forEach(function (k, i) {
      const d = state.days[k]; const s = d ? (d.sum || (d.items ? summarize(d) : null)) : null;
      const v = s ? s.correct : 0;
      const x = padL + 2 + i * bw; const h = v / 10 * (H - padB - 10);
      if (d && countAnswers(d) + (d.sum ? 1 : 0) > 0) svg += '<rect class="bar' + (k === today ? " now" : "") + '" x="' + (x + 2) + '" y="' + (H - padB - h) + '" width="' + (bw - 4) + '" height="' + Math.max(h, 1.5) + '" rx="2"><title>' + fmtShort(k) + ": " + v + "/10</title></rect>";
      else svg += '<rect class="empty" x="' + (x + 2) + '" y="' + (H - padB - 1.5) + '" width="' + (bw - 4) + '" height="1.5"/>';
      if (i % 3 === 1 || k === today) svg += '<text class="axis" x="' + (x + bw / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + parseKey(k).getDate() + "</text>";
    });
    svg += "</svg>";
    root.appendChild(el("section", "panel", "<h2>Skor 14 hari terakhir</h2><div class=\"chart\">" + svg + "</div>"));

    // per skill
    const skills = el("section", "panel");
    let html = "<h2>Akurasi per skill</h2><ul class=\"skills\">";
    KIND_ORDER.forEach(function (k) {
      const v = by[k]; const p = v && v[1] ? Math.round(v[0] / v[1] * 100) : null;
      const state2 = p == null ? "" : p >= 80 ? "good" : p >= 60 ? "mid" : "low";
      html += '<li><span class="sname">' + esc(KIND_LABEL[k]) + '</span><span class="track"><span class="fill ' + state2 + '" style="width:' + (p || 0) + '%"></span></span><span class="sval">' + (p == null ? "–" : p + "%") + '</span><span class="scount">' + (v ? v[1] : 0) + " soal</span></li>";
    });
    html += "</ul><p class=\"muted small\">Hijau ≥ 80%, kuning 60–79%, merah &lt; 60%. Skill merah adalah prioritas belajar malam.</p>";
    skills.innerHTML = html;
    root.appendChild(skills);

    const g = RM.GOALS;
    root.appendChild(el("section", "panel goals",
      "<h2>Target skor</h2><div class=\"goalgrid\">" +
      '<div class="goal"><p class="klabel">IELTS Academic</p><p class="kval">' + g.ielts.target + '</p><p class="ksub">min. tiap band ' + g.ielts.minimum + "</p><p class=\"small\">" + esc(g.ielts.note) + "</p></div>" +
      '<div class="goal"><p class="klabel">GMAT Focus</p><p class="kval">' + g.gmat.target + '</p><p class="ksub">batas bawah ' + g.gmat.minimum + "</p><p class=\"small\">" + esc(g.gmat.note) + "</p></div></div>"));
  }

  // ---------- UI: roadmap ----------
  const CAT = { test: "Tes", scholarship: "Beasiswa", admission: "Kampus", loa: "LoA", prep: "Persiapan", visa: "Visa" };
  function renderRoadmap() {
    const root = $("#view-roadmap"); root.innerHTML = "";
    const track = RM.TRACKS.find(function (t) { return t.id === state.track; }) || RM.TRACKS[0];
    root.appendChild(el("section", "pagehead", '<p class="eyebrow">Roadmap S2 · MBA</p><h1>Dari hari ini sampai hari pertama kuliah</h1>'));

    const tog = el("div", "toggle"); tog.setAttribute("role", "tablist");
    RM.TRACKS.forEach(function (t) {
      const b = el("button", t.id === track.id ? "on" : "", esc(t.id === "A" ? "Intake 2027" : "Intake 2028"));
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(t.id === track.id)); b.id = "track-" + t.id;
      b.addEventListener("click", function () { state.track = t.id; save(); renderRoadmap(); });
      tog.appendChild(b);
    });
    root.appendChild(tog);

    const allTasks = track.milestones.reduce(function (m, s) { return m.concat(s.tasks); }, []);
    const doneTasks = allTasks.filter(function (t) { return state.checklist[t.id]; }).length;
    const nextM = track.milestones.find(function (m) { return m.end >= today; });
    const toStart = daysBetween(today, track.intake);
    root.appendChild(el("section", "panel trackhead",
      "<h2>" + esc(track.name) + "</h2><p>" + esc(track.summary) + "</p>" +
      '<div class="kpis three">' +
      '<div class="kpi"><p class="klabel">Menuju kuliah</p><p class="kval">' + toStart + ' hari</p><p class="ksub">' + esc(fmtDate(track.intake)) + "</p></div>" +
      '<div class="kpi"><p class="klabel">Checklist</p><p class="kval">' + doneTasks + "/" + allTasks.length + '</p><p class="ksub">tugas selesai</p></div>' +
      '<div class="kpi"><p class="klabel">Berikutnya</p><p class="kval sm">' + (nextM ? esc(nextM.title) : "–") + '</p><p class="ksub">' + (nextM ? (nextM.start > today ? "mulai " + daysBetween(today, nextM.start) + " hari lagi" : "sedang berjalan, s.d. " + esc(fmtShort(nextM.end))) : "") + "</p></div></div>"));

    const tl = el("ol", "timeline");
    track.milestones.forEach(function (m) {
      const status = m.end < today ? "past" : m.start <= today ? "now" : "next";
      const li = el("li", "ms " + status + " cat-" + m.cat);
      const head = '<div class="msdate">' + esc(fmtShort(m.start)) + (m.end !== m.start ? " – " + esc(fmtShort(m.end)) : "") + " " + parseKey(m.end).getFullYear() + "</div>" +
        '<div class="mstitle"><span class="chip cat">' + CAT[m.cat] + "</span>" + (m.estimate ? '<span class="chip est">Perkiraan</span>' : "") + (status === "now" ? '<span class="chip nowc">Sekarang</span>' : "") + "<h3>" + esc(m.title) + "</h3></div><p>" + esc(m.detail) + "</p>";
      li.innerHTML = head;
      if (m.tasks.length) {
        const ul = el("ul", "tasks");
        m.tasks.forEach(function (t) {
          const lab = el("li");
          const cb = document.createElement("input"); cb.type = "checkbox"; cb.id = "task-" + t.id; cb.checked = !!state.checklist[t.id];
          cb.addEventListener("change", function () { if (cb.checked) state.checklist[t.id] = true; else delete state.checklist[t.id]; save(); renderRoadmap(); });
          const l = el("label", null, esc(t.text)); l.htmlFor = cb.id;
          lab.appendChild(cb); lab.appendChild(l); ul.appendChild(lab);
        });
        li.appendChild(ul);
      }
      tl.appendChild(li);
    });
    root.appendChild(tl);

    let tbl = '<div class="tablewrap"><table><thead><tr><th>Beasiswa</th><th>Jendela daftar</th><th>Perlu LoA?</th><th>Bahasa</th><th>MBA</th><th>Status</th></tr></thead><tbody>';
    RM.SCHOLARSHIPS.forEach(function (s) { tbl += "<tr><td><b>" + esc(s.name) + "</b></td><td>" + esc(s.window) + "</td><td>" + esc(s.loa) + "</td><td>" + esc(s.english) + "</td><td>" + esc(s.mba) + "</td><td>" + esc(s.status) + "</td></tr>"; });
    tbl += "</tbody></table></div>";
    root.appendChild(el("section", "panel", "<h2>Beasiswa & aturan LoA</h2>" + tbl + '<p class="muted small">Tanggal bertanda "Perkiraan" disusun dari pola tahun-tahun sebelumnya. Cek situs resmi (lpdp.kemenkeu.go.id, chevening.org, australiaawardsindonesia.org, aminef.or.id) sebelum menjadwalkan.</p>'));

    let wk = "<h2>Ritme belajar mingguan</h2><ul class=\"weekly\">";
    RM.WEEKLY.forEach(function (w) { wk += "<li><b>" + esc(w.phase) + "</b><span>" + esc(w.load) + "</span></li>"; });
    root.appendChild(el("section", "panel", wk + "</ul>"));
  }

  // ---------- UI: setup ----------
  function renderSetup() {
    const root = $("#view-setup");
    const codeToday = unlockCode(today);
    const url = APP_URL || "(link artifact ini)";
    $("#appurl", root).textContent = url;
    $("#codetoday", root).textContent = String(codeToday);
  }

  // ---------- routing ----------
  const VIEWS = ["today", "progress", "roadmap", "setup"];
  function route() {
    const h = (location.hash || "").replace("#", "");
    const v = VIEWS.indexOf(h) >= 0 ? h : "today";
    VIEWS.forEach(function (x) {
      $("#view-" + x).hidden = x !== v;
      const t = $("#tab-" + x); if (t) { t.setAttribute("aria-current", x === v ? "page" : "false"); }
    });
    window.scrollTo(0, 0);
  }

  function renderHeader() {
    $("#hdate").textContent = fmtDate(today, true);
    const s = streak();
    $("#hstreak").textContent = s + " hari";
  }

  function renderAll() { ensureToday(); renderHeader(); renderToday(); renderProgress(); renderRoadmap(); renderSetup(); }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && keyOf(new Date()) !== today) { ui.cur = null; ui.open = {}; renderAll(); }
  });
  window.addEventListener("hashchange", route);

  const copyUrl = document.getElementById("copyurl");
  if (copyUrl) copyUrl.addEventListener("click", function () {
    const t = $("#appurl").textContent;
    navigator.clipboard.writeText(t).then(function () { copyUrl.textContent = "Tersalin"; }, function () {
      const r = document.createRange(); r.selectNodeContents($("#appurl")); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); copyUrl.textContent = "Terpilih, salin manual";
    });
  });

  renderAll();
  route();
  initCloud();

  // dipakai untuk pengujian lokal
  window.__prep = { buildDay: buildDay, unlockCode: unlockCode, getState: function () { return state; } };
})();
