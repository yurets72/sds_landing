/* СпецДорСервис — общий скрипт.
   Без JS каждая страница читается полностью: подбор заменяет таблица типовых цепочек,
   форма отправляется через mailto. */

/* Адрес приёма заявок. Пока пусто — форма открывает письмо в почтовой программе.
   Чтобы заявки приходили сами, вставьте адрес формы, например "https://formspree.io/f/xxxxxxx"
   (сервис принимает POST с JSON и пересылает на почту). */
var SDS_FORM_ENDPOINT = "";
var SDS_EMAIL = "info@sdors.ru";
var SDS_PHONE = "+7 (3952) 43-67-23";

/* 1. Живая вещь: предварительный подбор цепочки ДСК (страница /dsk/) */
(function () {
  var form = document.getElementById("selector-form");
  var chain = document.getElementById("chain");
  var quote = document.getElementById("quote");
  if (!form || !chain || !quote) return;

  var ROCKS = {
    granit:     { label: "гранит", kind: "hard" },
    bazalt:     { label: "базальт", kind: "hard" },
    izvestnyak: { label: "известняк", kind: "soft" },
    rap:        { label: "фрезерованный асфальт", kind: "rap" }
  };
  var SIZES = {
    "100": { jaw: "PE-500×750",  cone: "DP-100",  screen: "3YZK1548" },
    "150": { jaw: "PE-600×900",  cone: "DP-100",  screen: "3YZK1860" },
    "250": { jaw: "PE-750×1060", cone: "DP-200",  screen: "3YZK1860" },
    "450": { jaw: "PE-900×1200", cone: "XHP-300", screen: "4YZK2160" }
  };
  var FRACS = {
    "0-5":   { label: "0–5",   decks: "3 деки" },
    "5-20":  { label: "5–20",  decks: "2 деки" },
    "20-40": { label: "20–40", decks: "2 деки" },
    "40-70": { label: "40–70", decks: "2 деки" }
  };

  function pick(name) {
    var input = form.querySelector('input[name="' + name + '"]:checked');
    return input ? input.value : null;
  }

  function build() {
    var rock = ROCKS[pick("rock")] || ROCKS.granit;
    var tph = pick("tph") || "250";
    var frac = FRACS[pick("frac")] || FRACS["5-20"];
    var size = SIZES[tph];
    var steps = [];

    if (rock.kind === "rap") {
      steps.push(["Первичное дробление", "Щековая дробилка PE-600×900 (RAP)"]);
      steps.push(["Сортировка", "Грохот 3YZK1860, " + frac.decks]);
      steps.push(["Продукт", "Фракция " + frac.label + " мм, возврат в АБЗ"]);
    } else if (rock.kind === "soft") {
      steps.push(["Первичное дробление", "Щековая дробилка " + size.jaw]);
      steps.push(["Сортировка", "Грохот " + size.screen + ", " + frac.decks]);
      steps.push(["Продукт", "Фракция " + frac.label + " мм"]);
    } else {
      steps.push(["Первичное дробление", "Щековая дробилка " + size.jaw]);
      steps.push(["Вторичное дробление", "Конусная гидравлическая " + size.cone]);
      steps.push(["Сортировка", "Грохот " + size.screen + ", " + frac.decks]);
      steps.push(["Продукт", "Фракция " + frac.label + " мм"]);
    }

    var ol = chain.querySelector("ol");
    ol.innerHTML = steps.map(function (s) {
      return "<li><span>" + s[0] + "</span><strong>" + s[1] + "</strong></li>";
    }).join("");

    var subject = "Заявка на КП: " + rock.label + ", " + tph + " т/ч, фракция " + frac.label;
    var body = "Подбор на сайте:\n" + steps.map(function (s) {
      return s[0] + ": " + s[1];
    }).join("\n") + "\n\nПлощадка и сроки:\n";
    quote.href = "mailto:" + SDS_EMAIL + "?subject=" + encodeURIComponent(subject) +
                 "&body=" + encodeURIComponent(body);

    var frame = document.querySelector(".schema3d");
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({
        type: "sds-config", rock: rock.label, tph: tph, frac: frac.label
      }, "*");
    }
  }

  form.addEventListener("change", build);
  build();
})();

/* 2. Форма заявки */
(function () {
  var form = document.getElementById("lead-form");
  if (!form) return;
  var status = document.getElementById("lead-status");
  var button = form.querySelector('button[type="submit"]');

  function setError(id, text) {
    var el = document.getElementById(id + "-error");
    if (el) el.textContent = text || "";
    var input = document.getElementById(id);
    if (input) input.setAttribute("aria-invalid", text ? "true" : "false");
  }
  function say(text, kind) {
    status.textContent = text;
    status.className = "lead-status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      company: form.elements.company.value.trim(),
      message: form.elements.message.value.trim(),
      topic: form.getAttribute("data-topic") || "Заявка с сайта"
    };
    var consent = form.elements.consent.checked;

    var ok = true;
    setError("name", ""); setError("phone", ""); setError("consent", "");
    if (!data.name) { setError("name", "Укажите имя"); ok = false; }
    if (!data.phone) { setError("phone", "Укажите телефон"); ok = false; }
    else if (!/^[\d\s+\-()]{7,20}$/.test(data.phone)) { setError("phone", "Проверьте номер: цифры, пробелы, + и скобки"); ok = false; }
    if (!consent) { setError("consent", "Нужно согласие на обработку данных"); ok = false; }
    if (!ok) { say("Исправьте отмеченные поля.", "error"); return; }

    var lines = [
      "Тема: " + data.topic,
      "Имя: " + data.name,
      "Телефон: " + data.phone,
      "Компания: " + (data.company || "не указана"),
      "Задача: " + (data.message || "не указана")
    ];

    if (SDS_FORM_ENDPOINT) {
      button.disabled = true;
      say("Отправляем…", "");
      fetch(SDS_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("bad status");
        form.reset();
        say("Заявка отправлена. Свяжемся с вами в рабочее время.", "ok");
      }).catch(function () {
        say("Не удалось отправить. Позвоните " + SDS_PHONE + " или напишите на " + SDS_EMAIL + ".", "error");
      }).then(function () { button.disabled = false; });
      return;
    }

    var subject = data.topic + " — " + data.name;
    window.location.href = "mailto:" + SDS_EMAIL + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    say("Открыли письмо с вашей заявкой — нажмите «Отправить» в почтовой программе. Если оно не открылось, позвоните " + SDS_PHONE + " или напишите на " + SDS_EMAIL + ".", "ok");
  });
})();

/* 3. Вход секций. Без JS и при reduced-motion ничего не скрывается. */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".hero, .section, .footer").forEach(function (block) {
    var parts = block.querySelectorAll("h1, h2, .support, .statement, figure, .plate-passport, .selector, .schema3d-fig, .chain-in, .spec-table, .works, .rows, .timeline, .faq-row, .contacts, .lead-form, .dir, .legal");
    parts.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      io.observe(el);
    });
  });
})();
