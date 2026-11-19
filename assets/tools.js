/* ===== احتراف أدوات DIALux evo: البيانات والتفاعل =====
   الاختصارات من جدول DIAL الرسمي (Version 2, DIALux evo 11.1 Patch 1).
   أسماء الأدوات من مواد DIALux الرسمية وصفحة جديد الإصدار 14. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const kbd = (s) => s ? s.split(" / ").map(k => `<kbd>${k}</kbd>`).join(" ") : "";
  const LVL = { 1: ["l1", "أساسي"], 2: ["l2", "مهم"], 3: ["l3", "متقدم"] };

  /* ---------- المظهر والقائمة ---------- */
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("dx-theme", next); } catch (e) {}
  });
  const sidebar = $("#sidebar");
  $("#menuBtn").addEventListener("click", () => sidebar.classList.toggle("open"));
  $$("#nav a").forEach(a => a.addEventListener("click", () => sidebar.classList.remove("open")));
  const navLinks = $$("#nav a");
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-30% 0px -60% 0px" });
  $$("section.lesson").forEach(s => io.observe(s));

  /* ---------- تشريح الواجهة ---------- */
  const zones = {
    menu: ["شريط القوائم", "File و Edit و View و ?", ["File: مشروع جديد <kbd>Ctrl + N</kbd>، فتح <kbd>Ctrl + O</kbd>، حفظ <kbd>Ctrl + S</kbd>، والاستيراد والإعدادات", "Edit: تراجع وإعادة ونسخ", "View: إظهار اللوحات وطرق العرض", "?: المساعدة والمجتمع <kbd>F1</kbd>"], "الإعدادات ← Keyboard تعرض كل الاختصارات، أو اضغط <kbd>Ctrl + F1</kbd>."],
    modes: ["شريط الأوضاع", "مراحل العمل بالترتيب", ["Project: بيانات المشروع ومعامل الصيانة", "Construction: النموذج الهندسي", "Light: الكشافات وتوزيعها", "Calculation objects: أسطح الحساب والمراقبون", "Export و Documentation: المخرجات"], "انتقل بين الأوضاع من اليمين إلى اليسار في الواجهة الإنجليزية، فهذا ترتيب العمل الطبيعي."],
    tools: ["لوحة الأدوات والخصائص", "تتغير حسب الوضع والعنصر المحدد", ["أدوات الوضع الحالي (مثل Storey and building construction)", "خصائص العنصر المحدد: الأبعاد، الارتفاع، المادة، الكشاف", "حقول إدخال رقمية للدقة بدل السحب بالفأرة"], "اكتب القيم رقمياً كلما أمكن، ففيها الدقة. استخدم <kbd>Tab</kbd> للتنقل بين حقول المناور (Manipulator)."],
    cad: ["منطقة الرسم (CAD)", "ثنائية أو ثلاثية الأبعاد", ["المسقط <kbd>Ctrl + Num 5</kbd>، والعرض ثلاثي الأبعاد <kbd>Ctrl + Num 0</kbd>", "الواجهات: أمام <kbd>Ctrl + Num 8</kbd>، خلف <kbd>Ctrl + Num 2</kbd>، يسار <kbd>Ctrl + Num 4</kbd>، يمين <kbd>Ctrl + Num 6</kbd>", "احتواء الكل <kbd>Ctrl + *</kbd>، وتبويب رسم جديد <kbd>Ctrl + T</kbd>"], "افتح تبويبين: مسقط للرسم، وثلاثي الأبعاد للتحقق، وبدّل بينهما بدل تغيير العرض كل مرة."],
    tree: ["شجرة المشروع والقوائم", "هيكل المشروع: مبانٍ، طوابق، غرف، كشافات", ["تحديد أي عنصر بسرعة دون البحث في الرسم", "قائمة الكشافات (Luminaire list): تصفية وترتيب ومقارنة", "في الإصدار 14: زر الفأرة الأيمن على غرفة لحسابها منفصلة"], "سمِّ الغرف بأسماء المخطط (<kbd>F2</kbd> لإعادة التسمية)، فتظهر بنفس الأسماء في التقرير."],
    status: ["شريط الحالة ومراقب النتائج", "حالة الحساب والرسائل", ["أيقونات الإصدار 14: محسوب، غير محسوب، قديم (Outdated)", "عدد الكشافات البديلة المتبقية من IFC", "رسائل البرنامج والتنبيهات"], "لا تُخرج تقريراً وأي نتيجة معلّمة بأنها قديمة: أعد الحساب أولاً."]
  };
  function showZone(k) {
    const z = zones[k];
    $$("#appMock .z").forEach(e => e.classList.toggle("on", e.dataset.z === k));
    $("#anatomyInfo").innerHTML = `<div class="kicker">${z[1]}</div><h3 style="margin-top:2px">${z[0]}</h3>
      <ul style="padding-inline-start:20px;margin:6px 0">${z[2].map(x => `<li>${x}</li>`).join("")}</ul>
      <div class="callout tip" style="margin-bottom:0"><b>نصيحة المحترف</b>${z[3]}</div>`;
  }
  $$("#appMock .z").forEach(e => e.addEventListener("click", () => showZone(e.dataset.z)));
  showZone("cad");

  /* ---------- الاختصارات ---------- */
  const keys = [
    ["مساعدة", "المساعدة في مجتمع DIALux", "F1"], ["مساعدة", "عرض قائمة الاختصارات", "Ctrl + F1"],
    ["المشروع", "مشروع جديد فارغ", "Ctrl + N"], ["المشروع", "فتح مشروع", "Ctrl + O"], ["المشروع", "حفظ المشروع", "Ctrl + S"],
    ["الانتقال للأدوات", "Storey and building construction", "Shift + Alt + R"], ["الانتقال للأدوات", "Spaces", "Shift + Alt + S"],
    ["الانتقال للأدوات", "Furniture and objects", "Shift + Alt + O"], ["الانتقال للأدوات", "Apertures (الفتحات)", "Shift + Alt + W"],
    ["الانتقال للأدوات", "Materials (المواد)", "Shift + Alt + M"], ["الانتقال للأدوات", "Helplines and labeling", "Shift + Alt + T"],
    ["الانتقال للأدوات", "Views (العروض المحفوظة)", "Shift + Alt + V"], ["الانتقال للأدوات", "Luminaires (الكشافات)", "Shift + Alt + L"],
    ["الانتقال للأدوات", "Luminaires مع فتح اختيار الكشاف", "Shift + Alt + F"], ["الانتقال للأدوات", "Calculation objects", "Shift + Alt + C"],
    ["الانتقال للأدوات", "Page selection (صفحات التقرير)", "Shift + Alt + D"], ["الانتقال للأدوات", "Project overview", "Shift + Alt + P"],
    ["الانتقال للأدوات", "الأداة السابقة", "Shift + Alt + Z"], ["الانتقال للأدوات", "الأداة التالية", "Shift + Alt + Y"],
    ["منطقة الرسم", "مناور التحريك", "Ctrl + Shift + T"], ["منطقة الرسم", "مناور التدوير", "Ctrl + Shift + R"],
    ["منطقة الرسم", "مناور التوزيع الشبكي", "Ctrl + Shift + G"], ["منطقة الرسم", "مناور الدائرة", "Ctrl + Shift + O"],
    ["منطقة الرسم", "المناور التالي أو حقل الإدخال التالي", "Tab"], ["منطقة الرسم", "لصق عنصر منسوخ عند موضع الفأرة", "Ctrl + M"],
    ["منطقة الرسم", "تكبير / تصغير منطقة الرسم", "Ctrl + + / Ctrl + -"], ["منطقة الرسم", "تبويب جديد لمنطقة الرسم", "Ctrl + T"],
    ["منطقة الرسم", "إغلاق تبويب منطقة الرسم", "Ctrl + W"], ["منطقة الرسم", "تكرار آخر إجراء", "F12"],
    ["رسم المضلعات", "إنهاء المضلع وإغلاقه", "Ctrl + Shift + C"], ["رسم المضلعات", "إنهاء المضلع دون إغلاق", "Ctrl + Shift + E"],
    ["رسم المضلعات", "إضافة نقطة", "Ctrl + Shift + A"], ["رسم المضلعات", "حذف نقطة", "Ctrl + Shift + X"],
    ["الحساب", "بدء الحساب", "Ctrl + Shift + Space"], ["الحساب", "إيقاف الحساب", "Ctrl + Shift + Q"], ["الحساب", "حذف كل النتائج", "Ctrl + Shift + Back"],
    ["شجرة المشروع", "إعادة تسمية العنصر", "F2"], ["الكتالوجات", "حذف عنصر من الكتالوج", "Delete"],
    ["العروض", "المسقط الأفقي", "Ctrl + Num 5"], ["العروض", "العرض ثلاثي الأبعاد", "Ctrl + Num 0"],
    ["العروض", "واجهة أمامية / خلفية", "Ctrl + Num 8 / Ctrl + Num 2"], ["العروض", "واجهة يسار / يمين", "Ctrl + Num 4 / Ctrl + Num 6"],
    ["العروض", "احتواء كل المحتوى في الشاشة", "Ctrl + *"], ["العروض", "حفظ أو تحديث عرض للتقرير (1–0)", "Ctrl + 1"],
    ["العروض", "استرجاع عرض محفوظ (1–0)", "Alt + 1"],
    ["الإظهار", "نظام الإحداثيات", "F2"], ["الإظهار", "الخطوط المساعدة", "F3"], ["الإظهار", "أسطح العمل", "F4"], ["الإظهار", "العرض السلكي", "F5"],
    ["الإظهار", "النتائج", "F6"], ["الإظهار", "الرسومات", "F7"], ["الإظهار", "منحنيات التوزيع الضوئي", "F8"], ["الإظهار", "الألوان الكاذبة", "F9"],
    ["الإظهار", "اتجاه الكشافات", "Ctrl + R"],
    ["التوثيق", "تكبير الصفحة 100٪", "Ctrl + 1"], ["التوثيق", "عرض الصفحة بعرضها الكامل", "Ctrl + 2"], ["التوثيق", "عرض الصفحة كاملة", "Ctrl + 3"],
    ["التوثيق", "إظهار أو إخفاء إعدادات الصفحة الحالية", "F2"], ["التوثيق", "تعديل الصورة التالية / السابقة", "Alt + Right / Alt + Left"],
    ["الواجهة", "ملء الشاشة", "F11"], ["الواجهة", "تكبير / تصغير عناصر الواجهة", "Shift + + / Shift + -"], ["الواجهة", "إعادة حجم الواجهة الافتراضي", "Shift + *"]
  ];
  const kcats = [...new Set(keys.map(k => k[0]))];
  $("#keyCat").innerHTML += kcats.map(c => `<option>${c}</option>`).join("");
  function renderKeys() {
    const q = $("#keySearch").value.trim().toLowerCase(), c = $("#keyCat").value;
    const rows = keys.filter(k => (!c || k[0] === c) && (!q || k.join(" ").toLowerCase().includes(q)));
    $("#keyBody").innerHTML = rows.length ? rows.map(k => `<tr><td>${k[0]}</td><td>${k[1]}</td><td>${kbd(k[2])}</td></tr>`).join("")
      : `<tr><td colspan="3" style="text-align:center;color:var(--muted)">لا توجد نتائج</td></tr>`;
  }
  $("#keySearch").addEventListener("input", renderKeys);
  $("#keyCat").addEventListener("change", renderKeys);
  renderKeys();

  const flash = [
    ["حفظ المشروع", "Ctrl + S"], ["بدء الحساب", "Ctrl + Shift + Space"], ["المسقط الأفقي", "Ctrl + Num 5"], ["العرض ثلاثي الأبعاد", "Ctrl + Num 0"],
    ["احتواء كل المحتوى", "Ctrl + *"], ["إظهار الألوان الكاذبة", "F9"], ["إظهار النتائج", "F6"], ["أداة الكشافات", "Shift + Alt + L"],
    ["أداة المواد", "Shift + Alt + M"], ["Storey and building construction", "Shift + Alt + R"], ["Calculation objects", "Shift + Alt + C"],
    ["صفحات التقرير", "Shift + Alt + D"], ["مناور التحريك", "Ctrl + Shift + T"], ["مناور التدوير", "Ctrl + Shift + R"], ["إنهاء المضلع وإغلاقه", "Ctrl + Shift + C"]
  ];
  let fi = 0;
  function showFlash() {
    $("#flashCount").textContent = `بطاقة ${fi + 1} من ${flash.length}`;
    $("#flashQ").textContent = flash[fi][0];
    $("#flashA").innerHTML = `<span style="color:var(--muted)">ما الاختصار؟</span>`;
  }
  $("#flashShow").addEventListener("click", () => { $("#flashA").innerHTML = kbd(flash[fi][1]); });
  $("#flashNext").addEventListener("click", () => { fi = (fi + 1) % flash.length; showFlash(); });
  showFlash();

  /* ---------- الأهم أولاً ---------- */
  const ess = [
    ["Project overview + Maintenance factor", "بيانات التقرير ومعامل الصيانة الذي يحدد صحة كل الأرقام.", "Shift + Alt + P"],
    ["Import (DWG / DXF)", "أساس النموذج. مقياس خاطئ يفسد المشروع كله.", ""],
    ["Storey and building construction", "يبني المبنى والطوابق والغرف التي تُحسب.", "Shift + Alt + R"],
    ["Materials", "الانعكاسات تغيّر نتائج الداخلي بوضوح.", "Shift + Alt + M"],
    ["Luminaire import", "الملف الضوئي الصحيح هو أساس التقرير.", "Shift + Alt + F"],
    ["Rectangular arrangement", "توزيع أغلب الفراغات المنتظمة.", "Ctrl + Shift + G"],
    ["Line arrangement", "الممرات والمستودعات والإنارة الخطية.", ""],
    ["Move & rotate", "الدقة في المواضع والاتجاهات.", "Ctrl + Shift + T / Ctrl + Shift + R"],
    ["Working planes + Calculation surfaces", "أين يُقاس الضوء وبأي متطلبات.", "Shift + Alt + C"],
    ["Start calculation", "الحساب بعد كل تعديل مؤثر.", "Ctrl + Shift + Space"],
    ["False colours & results", "قراءة النتيجة بالعين وليس بالأرقام فقط.", "F9 / F6"],
    ["Page selection + PDF", "تقرير مركّز يُعتمد.", "Shift + Alt + D"]
  ];
  $("#essBody").innerHTML = ess.map((e, i) => `<tr><td class="num">${i + 1}</td><td class="ltr" style="font-family:var(--font)">${e[0]}</td><td style="white-space:normal">${e[1]}</td><td>${kbd(e[2]) || "—"}</td></tr>`).join("");

  /* أدوات مشتركة للنسخة الاحترافية */
  window.DXT = { $, $$, store, kbd, LVL };
})();
