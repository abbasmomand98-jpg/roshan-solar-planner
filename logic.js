// Roshan — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Pakistani / Indian digit grouping: 4250 -> "4,250",
  // 720000 -> "7,20,000". Last three digits group together, then
  // groups of two — the way lakh and crore figures are written in Pakistan.
  function formatPKR(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var groups = [];
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) groups.unshift(rest);
    return groups.join(",") + "," + last3;
  }

  // Price per watt: a 5kW quote divided by 5,000 W.
  function perWattPrice(quote) {
    return Math.round(quote.price / (quote.systemKw * 1000));
  }

  // Cheapest VERIFIED quote — cheapest alone is not best value, because
  // an unverified quote (QuickSolar) can hide unbranded panels.
  function cheapestVerifiedQuote(quotes) {
    var best = null;
    quotes.forEach(function (q) {
      if (!q.verified) return;
      if (!best || q.price < best.price) best = q;
    });
    return best;
  }

  // Payback calculator. Sizing rule, fitted to the canonical example:
  // a Rs 25,000 bill needs 5kW, so 1kW per Rs 5,000 of bill, clamped to
  // 1–10kW. System cost uses the best-value rate, Rs 144,000 per kW
  // (Rs 720,000 for 5kW). Monthly saving is 87.2% of the bill
  // (Rs 21,800 of Rs 25,000) — the bill after solar is about Rs 3,200.
  // Payback months are rounded to the nearest month.
  function paybackCalc(bill) {
    var b = Math.max(0, Math.round(bill) || 0);
    var sizeKw = Math.min(10, Math.max(1, Math.round(b / 5000)));
    var cost = sizeKw * 144000;
    var saving = Math.round(b * 0.872);
    var months = saving > 0 ? Math.round(cost / saving) : 0;
    return { bill: b, sizeKw: sizeKw, cost: cost, saving: saving,
             months: months, billAfterSolar: Math.max(0, b - saving) };
  }

  // Serial lookup: case-insensitive, ignores surrounding spaces.
  // Returns the serial record, or { status: "notfound" } for unknown
  // serials — an unknown serial is never called genuine.
  function normalizeSerial(s) {
    return String(s || "").trim().toUpperCase();
  }

  function lookupSerial(serials, input) {
    var want = normalizeSerial(input);
    if (!want) return null;
    for (var i = 0; i < serials.length; i++) {
      if (normalizeSerial(serials[i].id) === want) return serials[i];
    }
    return { id: want, status: "notfound",
             title: "SERIAL NOT FOUND",
             detail: "This serial is not in the sample manufacturer database. Do not pay for these panels until the seller proves the brand in writing." };
  }

  // Risk level for a quote, from its red flags:
  // 0 flags -> LOW RISK (verified), 1–2 -> MEDIUM RISK, 3+ -> HIGH RISK.
  function riskLevel(quote) {
    var n = (quote.redFlags || []).length;
    if (n === 0) return { level: "LOW RISK", flags: 0 };
    if (n <= 2) return { level: "MEDIUM RISK", flags: n };
    return { level: "HIGH RISK", flags: n };
  }

  // Net-metering stage list with states for the tracker timeline.
  function netMeterSteps(stages, currentIndex) {
    return stages.map(function (label, i) {
      return { label: label,
               state: i < currentIndex ? "done" : (i === currentIndex ? "current" : "pending") };
    });
  }

  // Saved-quote checklist: pure toggle — returns a new array, never mutates.
  function toggleChecklist(doneIds, id) {
    var next = doneIds.slice();
    var i = next.indexOf(id);
    if (i === -1) next.push(id);
    else next.splice(i, 1);
    return next;
  }

  function checklistProgress(doneIds, docs) {
    return { done: doneIds.length, total: docs.length };
  }

  var api = { formatPKR: formatPKR, perWattPrice: perWattPrice,
              cheapestVerifiedQuote: cheapestVerifiedQuote,
              paybackCalc: paybackCalc, normalizeSerial: normalizeSerial,
              lookupSerial: lookupSerial, riskLevel: riskLevel,
              netMeterSteps: netMeterSteps,
              toggleChecklist: toggleChecklist,
              checklistProgress: checklistProgress };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.RoshanLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
