/* ===== تفاعل مع الهندسة الكهربائية — التفاعل ===== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const metric = (k, v, unit = "") => `<div class="metric"><div class="k">${k}</div><div class="v">${v}${unit ? ` <small>${unit}</small>` : ""}</div></div>`;
  const deg = (r) => r * 180 / Math.PI, rad = (d) => d * Math.PI / 180;

  /* ---------- المظهر والقائمة ---------- */
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("dx-theme", next); } catch (e) {}
  });
  const sidebar = $("#sidebar");
  $("#menuBtn").addEventListener("click", () => sidebar.classList.toggle("open"));
  $$("#nav a").forEach(a => a.addEventListener("click", () => sidebar.classList.remove("open")));

  /* ---------- التقدم ---------- */
  const lessons = $$("section.lesson").map(s => s.id);
  let done = store.get("dx-done", []);
  function renderProgress() {
    const n = done.filter(id => lessons.includes(id)).length;
    $("#progressBar").style.width = (n / lessons.length * 100) + "%";
    $("#progressLabel").textContent = `${n} من ${lessons.length} دروس`;
    $$("#nav a").forEach(a => a.classList.toggle("done", done.includes(a.getAttribute("href").slice(1))));
    $$(".done-btn").forEach(b => {
      const d = done.includes(b.dataset.done);
      b.classList.toggle("is-done", d);
      b.classList.toggle("ghost", !d);
      b.textContent = d ? "✓ تم — اضغط للإلغاء" : "✓ أنهيت هذا الدرس";
    });
  }
  $$(".done-btn").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.done;
    done = done.includes(id) ? done.filter(x => x !== id) : done.concat(id);
    store.set("dx-done", done);
    renderProgress();
  }));
  renderProgress();

  /* القسم النشط في القائمة */
  const navLinks = $$("#nav a");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  $$("section.lesson").forEach(s => io.observe(s));

  /* ---------- مختبر المفاهيم ---------- */
  function renderLab() {
    const I = +$("#labIr").value, h = +$("#labHr").value, d = +$("#labDr").value;
    $("#labI").textContent = fmt(I); $("#labH").textContent = h; $("#labD").textContent = d;
    const th = Math.atan2(d, h);
    const E = I * Math.pow(Math.cos(th), 3) / (h * h);
    const E0 = I / (h * h);
    // الرسم
    const W = 600, G = 225, scale = Math.min(180 / h, 400 / Math.max(d, 1), 40);
    const lx = 130, ly = G - h * scale, px = lx + d * scale;
    $("#labSvg").innerHTML = `
      <defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".04"/></linearGradient></defs>
      <rect x="0" y="${G}" width="${W}" height="35" fill="var(--surface-2)"/>
      <line x1="0" y1="${G}" x2="${W}" y2="${G}" stroke="var(--border)" stroke-width="2"/>
      <line x1="${lx}" y1="${G}" x2="${lx}" y2="${ly}" stroke="var(--muted)" stroke-width="3"/>
      <polygon points="${lx},${ly + 6} ${lx - 70},${G} ${lx + 70 + d * scale * 0.3},${G}" fill="url(#beam)"/>
      <rect x="${lx - 16}" y="${ly - 6}" width="32" height="10" rx="3" fill="var(--text)"/>
      <line x1="${lx}" y1="${ly + 4}" x2="${px}" y2="${G}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="5 4"/>
      <circle cx="${px}" cy="${G}" r="6" fill="var(--accent)"/>
      <text class="svg-small" x="${lx - 10}" y="${(ly + G) / 2}" text-anchor="end" direction="ltr">h = ${h} m</text>
      <text class="svg-small" x="${(lx + px) / 2}" y="${G + 22}" text-anchor="middle" direction="ltr">${d > 0 ? "d = " + d + " m" : ""}</text>
      <text class="svg-label" x="${Math.min(px + 12, W - 130)}" y="${G - 14}" direction="ltr" font-weight="700">E ≈ ${fmt(E, 1)} lx</text>
      <text class="svg-small" x="${W - 10}" y="18" text-anchor="end" direction="ltr">θ = ${fmt(deg(th), 1)}°</text>`;
    $("#labRes").innerHTML =
      metric("الإضاءة عند النقطة", fmt(E, 1), "lx") +
      metric("أسفل الكشاف مباشرة", fmt(E0, 1), "lx") +
      metric("زاوية السقوط θ", fmt(deg(th), 1), "°") +
      metric("نسبة النقطة إلى الأسفل", fmt(E / E0 * 100, 0), "%");
  }
  ["#labIr", "#labHr", "#labDr"].forEach(s => $(s).addEventListener("input", renderLab));
  renderLab();

  /* ---------- محاكاة الواجهة ---------- */
  const mock = $("#dxMock");
  mock.innerHTML = `<div class="bar">${DX.modes.map((m, i) => `<button data-i="${i}" class="${i === 1 ? "on" : ""}">${m.name}</button>`).join("")}</div><div class="body" id="dxBody"></div>`;
  function showMode(i) {
    const m = DX.modes[i];
    $$(".bar button", mock).forEach((b, j) => b.classList.toggle("on", j === i));
    $("#dxBody").innerHTML = `<h4>${m.ar} <span class="en" style="color:#aaa;font-size:.85em">(${m.name})</span></h4>
      <div>${m.what}</div><ul>${m.tools.map(t => `<li>${t}</li>`).join("")}</ul>
      <div style="margin-top:8px;color:#f2b33d">💡 ${m.tip}</div>`;
  }
  $$(".bar button", mock).forEach(b => b.addEventListener("click", () => showMode(+b.dataset.i)));
  showMode(1);

  /* ---------- شاشة البداية ---------- */
  function showStart(k) {
    $$("#startTabs .tab").forEach(t => t.setAttribute("aria-selected", t.dataset.k === k));
    $("#startChooser").innerHTML = DX.startOptions.map(o => {
      const fit = o.for.includes(k);
      return `<div class="card" style="${fit ? "border-color:var(--accent)" : "opacity:.55"}">
        <b class="en">${o.name}</b> ${fit ? '<span class="pill ok">مناسب</span>' : ""}<br>
        <span style="color:var(--muted)">${o.ar}</span><div>${o.use}</div></div>`;
    }).join("");
  }
  $$("#startTabs .tab").forEach(t => t.addEventListener("click", () => showStart(t.dataset.k)));
  showStart("buildings");

  /* ---------- سير العمل ---------- */
  let step = 0;
  $("#stepList").innerHTML = DX.workflow.map((s, i) => `<button data-i="${i}"><span class="n">${i + 1}</span>${s.t}</button>`).join("");
  function showStep(i) {
    step = Math.max(0, Math.min(DX.workflow.length - 1, i));
    const s = DX.workflow[step];
    $$("#stepList button").forEach((b, j) => b.classList.toggle("on", j === step));
    $("#stepPanel").innerHTML = `<div class="kicker">المرحلة ${step + 1} من ${DX.workflow.length}</div><h3>${s.t}</h3>${s.body}
      <div class="callout bad"><b>⚠️ الخطأ الشائع</b>${s.pit}</div>
      <div class="step-nav"><button class="btn ghost" id="stPrev" ${step === 0 ? "disabled" : ""}>→ السابق</button>
      <button class="btn" id="stNext" ${step === DX.workflow.length - 1 ? "disabled" : ""}>التالي ←</button></div>`;
    $("#stPrev").onclick = () => showStep(step - 1);
    $("#stNext").onclick = () => showStep(step + 1);
  }
  $$("#stepList button").forEach(b => b.addEventListener("click", () => showStep(+b.dataset.i)));
  showStep(0);

  /* ---------- جدول المباني ---------- */
  const cats = [...new Set(DX.indoor.map(r => r.cat))];
  $("#indoorCat").innerHTML += cats.map(c => `<option>${c}</option>`).join("");
  function renderIndoor() {
    const q = $("#indoorSearch").value.trim(), c = $("#indoorCat").value;
    const rows = DX.indoor.filter(r => (!c || r.cat === c) && (!q || (r.space + r.cat).includes(q)));
    $("#indoorBody").innerHTML = rows.length ? rows.map(r => `<tr><td>${r.cat}</td><td>${r.space}</td>
      <td class="num">${r.em}</td><td class="num">${r.ugr ?? "—"}</td><td class="num">${r.uo.toFixed(2)}</td><td class="num">${r.ra}</td></tr>`).join("")
      : `<tr><td colspan="6" style="text-align:center;color:var(--muted)">لا توجد نتائج</td></tr>`;
  }
  $("#indoorSearch").addEventListener("input", renderIndoor);
  $("#indoorCat").addEventListener("change", renderIndoor);
  renderIndoor();

  /* ---------- الملاعب: الجداول ---------- */
  const usage = { I: "منافسات عالية المستوى (وطنية/دولية) بلا بث", II: "منافسات متوسطة، أندية ودوريات محلية", III: "تدريب، مدارس، ترفيه" };
  const sportKeys = Object.keys(DX.sports);
  $("#sportTabs").innerHTML = sportKeys.map((k, i) => `<button class="tab" data-k="${k}" aria-selected="${i === 0}">${DX.sports[k].name}</button>`).join("");
  function showSport(k) {
    const s = DX.sports[k];
    $$("#sportTabs .tab").forEach(t => t.setAttribute("aria-selected", t.dataset.k === k));
    $("#sportBody").innerHTML = ["I", "II", "III"].map(c => `<tr${c === "II" ? ' class="hl"' : ""}><td><b>الفئة ${c}</b></td><td>${usage[c]}</td>
      <td class="num">${s[c][0]}</td><td class="num">${s[c][1].toFixed(1)}</td><td class="num">${s[c][2]}</td></tr>`).join("");
    $("#sportNote").innerHTML = `المقاس: <span class="en">${s.size}</span> · الوهج: ${s.gr}`;
  }
  $$("#sportTabs .tab").forEach(t => t.addEventListener("click", () => showSport(t.dataset.k)));
  showSport("football");

  /* ---------- الطرق: الجداول ---------- */
  function showRoad(k) {
    $$("#roadTabs .tab").forEach(t => t.setAttribute("aria-selected", t.dataset.k === k));
    const t = $("#roadTable");
    if (k === "M") {
      t.innerHTML = `<thead><tr><th>الفئة</th><th class="num">Lav ≥ (cd/m²)</th><th class="num">Uo ≥</th><th class="num">Ul ≥</th><th class="num">fTI ≤ (%)</th><th class="num">REI ≥</th></tr></thead><tbody>` +
        DX.roadM.map(r => `<tr><td><b>${r.c}</b></td><td class="num">${r.L.toFixed(2)}</td><td class="num">${r.Uo.toFixed(2)}</td><td class="num">${r.Ul.toFixed(2)}</td><td class="num">${r.TI}</td><td class="num">${r.REI.toFixed(2)}</td></tr>`).join("") + "</tbody>";
      $("#roadNote").textContent = "M1 للطرق السريعة عالية الحركة ← M6 للطرق المحلية الهادئة. تُقيَّم بالنصوع لأن السائق يرى سطح الطريق.";
    } else if (k === "C") {
      t.innerHTML = `<thead><tr><th>الفئة</th><th class="num">Ē ≥ (lx)</th><th class="num">Uo ≥</th></tr></thead><tbody>` +
        DX.roadC.map(r => `<tr><td><b>${r.c}</b></td><td class="num">${r.E}</td><td class="num">0.40</td></tr>`).join("") + "</tbody>";
      $("#roadNote").textContent = "للتقاطعات والدوارات ومناطق التعارض حيث لا يصلح حساب النصوع. تُقيَّم بالإضاءة الأفقية.";
    } else if (k === "P") {
      t.innerHTML = `<thead><tr><th>الفئة</th><th class="num">Ē ≥ (lx)</th><th class="num">Emin ≥ (lx)</th></tr></thead><tbody>` +
        DX.roadP.map(r => `<tr><td><b>${r.c}</b></td><td class="num">${r.E}</td><td class="num">${r.Emin}</td></tr>`).join("") + "</tbody>";
      $("#roadNote").textContent = "للأرصفة وممرات المشاة والدراجات والطرق السكنية منخفضة السرعة. قد تُضاف متطلبات إضاءة رأسية لتمييز الوجوه.";
    } else {
      t.innerHTML = `<thead><tr><th>النوع (EN 12464-2)</th><th class="num">Em ≥ (lx)</th><th class="num">Uo ≥</th><th class="num">Ra ≥</th></tr></thead><tbody>` +
        DX.parkingOut.map(r => `<tr><td>${r.t}</td><td class="num">${r.E}</td><td class="num">${r.Uo.toFixed(2)}</td><td class="num">${r.Ra}</td></tr>`).join("") + "</tbody>";
      $("#roadNote").textContent = "المواقف المكشوفة تُصمم بـ Outdoor and building planning مع سطح حساب أفقي على مستوى الأرض.";
    }
  }
  $$("#roadTabs .tab").forEach(t => t.addEventListener("click", () => showRoad(t.dataset.k)));
  showRoad("M");

  /* ---------- الاختبار ---------- */
  let answers = store.get("dx-quiz", {});
  function renderQuiz() {
    $("#quizBox").innerHTML = DX.quiz.map((q, qi) => {
      const ans = answers[qi];
      return `<div class="card quiz-q ${ans !== undefined ? "answered" : ""}"><div class="q">${qi + 1}. ${q.q}</div><div class="opts">` +
        q.o.map((o, oi) => {
          let cls = "";
          if (ans !== undefined) { if (oi === q.a) cls = "correct"; else if (oi === ans) cls = "wrong"; }
          return `<button class="opt ${cls}" data-q="${qi}" data-o="${oi}" ${ans !== undefined ? "disabled" : ""}>${o}</button>`;
        }).join("") + `</div><div class="explain">${ans === q.a ? "✓ صحيح. " : ans !== undefined ? "✗ الإجابة الصحيحة مظللة بالأخضر. " : ""}${q.e}</div></div>`;
    }).join("");
    const answered = Object.keys(answers).length;
    const correct = Object.entries(answers).filter(([qi, a]) => DX.quiz[qi] && DX.quiz[qi].a === a).length;
    $("#quizScore").textContent = `النتيجة: ${correct} / ${DX.quiz.length}` + (answered === DX.quiz.length ? (correct >= DX.quiz.length * 0.8 ? " · ممتاز 🎉" : " · راجع الدروس وأعد المحاولة") : "");
    $$("#quizBox .opt").forEach(b => b.addEventListener("click", () => {
      answers[b.dataset.q] = +b.dataset.o; store.set("dx-quiz", answers); renderQuiz();
    }));
  }
  $("#quizReset").addEventListener("click", () => { answers = {}; store.set("dx-quiz", answers); renderQuiz(); });
  renderQuiz();

  /* ---------- القاموس ---------- */
  function renderGlossary() {
    const q = $("#glSearch").value.trim().toLowerCase();
    const items = DX.glossary.filter(g => !q || g.join(" ").toLowerCase().includes(q));
    $("#glBox").innerHTML = items.length ? items.map(([ar, en, unit, d]) =>
      `<div class="glossary-item"><b>${ar}<span class="en">${en}</span></b> ${unit !== "—" ? `<code>${unit}</code>` : ""}<div style="color:var(--muted)">${d}</div></div>`).join("")
      : `<p style="color:var(--muted)">لا توجد نتائج.</p>`;
  }
  $("#glSearch").addEventListener("input", renderGlossary);
  renderGlossary();

  /* أدوات مشتركة للنسخة الاحترافية */
  window.DXU = { $, $$, fmt, store, metric, deg, rad };
})();
