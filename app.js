// Roshan — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-08 so the sample figures (Rs 720,000 best
// value, 33-month payback, 45-day net metering) stay stable no matter when
// you open it.
(function () {
  var L = window.RoshanLogic;
  var TODAY = "2026-11-08";
  var STORE_KEY = "roshan-checklist-done";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveDone(d) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {}
  }
  var doneIds = loadDone();

  // ---- Quote comparator ----
  function renderQuotes() {
    var best = L.cheapestVerifiedQuote(QUOTES);
    var box = el("quote-list");
    box.innerHTML = "";
    QUOTES.forEach(function (q) {
      var risk = L.riskLevel(q);
      var div = document.createElement("div");
      div.className = "quote" + (q.verified ? " verified" : " unverified") +
        (best && q.id === best.id ? " best" : "");
      var html = "<h3>" + q.installer + " <span class='city'>" + q.city + "</span></h3>" +
        "<p class='price'>" + rs(q.price) + " <span>" + L.perWattPrice(q) +
        " / W</span></p>" +
        "<p>" + q.panel + " · " + q.warranty + "</p>" +
        "<p class='risk'>" + (q.verified ? "✓ VERIFIED INSTALLER" : "! UNVERIFIED — RED FLAG") +
        " · " + risk.level + "</p>";
      if (best && q.id === best.id) {
        html += "<p class='best-badge'>★ BEST VALUE — cheapest verified quote</p>";
      }
      if (!q.verified) {
        html += "<p>Cheapest — but risky. Unbranded panels, no warranty card, no brand proof.</p>";
      }
      div.innerHTML = html;
      box.appendChild(div);
    });
    el("quote-summary").textContent = "Best value: " + best.installer + ", " +
      best.city + " — " + rs(best.price) + " for a " + best.systemKw +
      "kW system (" + L.perWattPrice(best) + " / W, " + best.panel + ", " +
      best.warranty + "). QuickSolar is cheaper at " +
      rs(QUOTES[2].price) + ", but it is unverified and HIGH RISK.";
  }
  renderQuotes();

  // ---- Payback calculator ----
  function renderPayback() {
    var bill = parseInt(el("bill-input").value, 10);
    if (isNaN(bill) || bill < 0) bill = 0;
    var p = L.paybackCalc(bill);
    var box = el("payback-result");
    if (bill <= 0) {
      box.innerHTML = '<div class="alert notfound"><strong>Enter your monthly WAPDA bill</strong>' +
        "<p>Type the bill you pay most months — Roshan sizes the system from it.</p></div>";
      return;
    }
    box.innerHTML =
      '<div class="alert ok"><strong>You save ' + rs(p.saving) + " a month</strong>" +
      "<p>Recommended system: " + p.sizeKw + " kW · bill after solar: about " +
      rs(p.billAfterSolar) + " a month.</p></div>" +
      '<div class="alert warn"><strong>PAYBACK IN ' + p.months + " MONTHS</strong>" +
      "<p>" + rs(p.cost) + " ÷ " + rs(p.saving) + " = " + p.months +
      " months. Panels last 25 years — after payback, about " +
      Math.max(0, 25 * 12 - p.months) + " months of near-free power.</p></div>";
  }
  el("bill-btn").addEventListener("click", renderPayback);
  el("bill-input").addEventListener("input", renderPayback);
  el("bill-input").value = String(PAYBACK_EXAMPLE.bill);
  renderPayback();

  // ---- Panel serial checker ----
  function renderSerial(rec) {
    var box = el("serial-result");
    if (!rec) {
      box.innerHTML = '<div class="alert notfound"><strong>Enter a panel serial number</strong>' +
        "<p>It is printed on the back of the panel and on the warranty card.</p></div>";
      return;
    }
    var cls = rec.status === "genuine" ? "ok" : "risk";
    var mark = rec.status === "genuine" ? "✓ " : "! ";
    box.innerHTML = '<div class="alert ' + cls + '"><strong>' + mark + rec.title + "</strong>" +
      "<p>" + rec.detail + "</p>" +
      "<p>Checked 8 Nov 2026 (sample data).</p></div>";
  }

  function doSerial() {
    renderSerial(L.lookupSerial(SERIALS, el("serial-input").value));
  }
  el("serial-btn").addEventListener("click", doSerial);
  el("serial-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doSerial();
  });
  el("serial-input").value = "ROS-2026-4812";
  doSerial();

  // ---- Net-metering tracker ----
  function renderNetMeter() {
    var s = NETMETER_SAMPLE;
    var steps = L.netMeterSteps(NETMETER_STAGES, s.currentStage);
    var html = '<div class="alert warn"><strong>Average approval: ' +
      NETMETER_AVERAGE_DAYS + " days</strong>" +
      "<p>Sample application: " + s.applicant + " · " + s.systemKw + "kW · " +
      s.installer + " · applied " + s.appliedDate + ". " + s.note + "</p></div>" +
      '<div class="timeline">';
    steps.forEach(function (st) {
      html += '<div class="step ' + st.state + '"><span class="dot">' +
        (st.state === "done" ? "✓" : (st.state === "current" ? "●" : "")) +
        "</span>" + st.label + "</div>";
    });
    html += "</div>";
    el("netmeter-result").innerHTML = html;
  }
  renderNetMeter();

  // ---- Installer verification ----
  var il = el("installer-list");
  INSTALLERS.forEach(function (inst) {
    var div = document.createElement("div");
    div.className = "installer" + (inst.verified ? " verified" : " unverified");
    var html = "<h3>" + inst.name + ", " + inst.city + " — " +
      (inst.verified ? "✓ VERIFIED" : "! UNVERIFIED") + "</h3><ul class='checks'>";
    inst.proofs.forEach(function (p) {
      html += '<li class="' + (inst.verified ? "ok" : "bad") + '">' +
        (inst.verified ? "✓ " : "! ") + p + "</li>";
    });
    div.innerHTML = html + "</ul>";
    il.appendChild(div);
  });

  // ---- Saved-quote checklist (persisted in localStorage) ----
  function renderChecklist() {
    var list = el("checklist");
    list.innerHTML = "";
    CHECKLIST.forEach(function (item) {
      var li = document.createElement("li");
      var done = doneIds.indexOf(item.id) !== -1;
      li.className = done ? "done" : "";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = done;
      cb.setAttribute("aria-label", item.label);
      cb.addEventListener("change", function () {
        doneIds = L.toggleChecklist(doneIds, item.id);
        saveDone(doneIds);
        renderChecklist();
      });
      var span = document.createElement("span");
      span.textContent = item.label;
      li.appendChild(cb);
      li.appendChild(span);
      list.appendChild(li);
    });
    var p = L.checklistProgress(doneIds, CHECKLIST);
    el("checklist-progress").textContent = p.done + " of " + p.total +
      " safety checks done — tick them all off before paying an installer.";
  }
  renderChecklist();

  // ---- Scam spotter ----
  var rf = el("red-flags");
  REDFLAGS.forEach(function (r) {
    var li = document.createElement("li");
    li.innerHTML = "<strong>⚠ " + r.flag + "</strong> — " + r.example;
    rf.appendChild(li);
  });

  el("reset-demo").addEventListener("click", function () {
    doneIds = [];
    saveDone(doneIds);
    el("bill-input").value = String(PAYBACK_EXAMPLE.bill);
    el("serial-input").value = "ROS-2026-4812";
    renderQuotes();
    renderPayback();
    doSerial();
    renderNetMeter();
    renderChecklist();
  });
})();
