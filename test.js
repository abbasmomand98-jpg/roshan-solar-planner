// Roshan smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. Cheapest VERIFIED quote = SolarCare, Rs 720,000 (not the cheapest overall).
var best = L.cheapestVerifiedQuote(data.QUOTES);
eq(best.installer, "SolarCare", "cheapest verified quote is SolarCare");
eq(best.price, 720000, "SolarCare quote is Rs 720,000");
eq(best.city, "Lahore", "SolarCare is in Lahore");
eq(best.panel, "Longi Hi-MO 7", "SolarCare installs Longi Hi-MO 7");
eq(best.warranty, "25-year warranty", "SolarCare gives a 25-year warranty");
eq(best.verified, true, "SolarCare is verified");
eq(best.bestValue, true, "SolarCare carries the best-value flag");
eq(L.cheapestVerifiedQuote(data.QUOTES).id, "solarcare", "cheapest verified quote id is solarcare");

// 2. Per-watt prices for the same 5kW system.
eq(L.perWattPrice(data.QUOTES[0]), 144, "SolarCare: Rs 720,000 / 5,000 W = Rs 144/W");
eq(L.perWattPrice(data.QUOTES[1]), 170, "SunWorks: Rs 850,000 / 5,000 W = Rs 170/W");
eq(L.perWattPrice(data.QUOTES[2]), 128, "QuickSolar: Rs 640,000 / 5,000 W = Rs 128/W");
eq(data.QUOTES[1].installer, "SunWorks", "second quote is SunWorks");
eq(data.QUOTES[1].price, 850000, "SunWorks quote is Rs 850,000");
eq(data.QUOTES[1].panel, "Jinko Tiger Neo", "SunWorks installs Jinko Tiger Neo");
eq(data.QUOTES[1].verified, true, "SunWorks is verified");
eq(data.QUOTES[2].installer, "QuickSolar", "third quote is QuickSolar");
eq(data.QUOTES[2].price, 640000, "QuickSolar quote is Rs 640,000");
eq(data.QUOTES[2].panel, "Unbranded panels", "QuickSolar panels are unbranded");
eq(data.QUOTES[2].warranty, "NO warranty card", "QuickSolar gives no warranty card");
eq(data.QUOTES[2].verified, false, "QuickSolar is unverified");

// 3. Payback maths: Rs 720,000 / Rs 21,800 = 33 months.
var p = L.paybackCalc(25000);
eq(p.bill, 25000, "canonical bill is Rs 25,000");
eq(p.sizeKw, 5, "Rs 25,000 bill needs a 5kW system");
eq(p.cost, 720000, "5kW system costs Rs 720,000 at the best-value rate");
eq(p.saving, 21800, "monthly saving is Rs 21,800");
eq(p.months, 33, "payback is 33 months (720,000 / 21,800)");
eq(p.billAfterSolar, 3200, "bill after solar is about Rs 3,200");
eq(720000 / 21800 > 33 && 720000 / 21800 < 34, true, "720,000 / 21,800 sits between 33 and 34 months");
deep(data.PAYBACK_EXAMPLE, { bill: 25000, systemKw: 5, saving: 21800,
  cost: 720000, months: 33, billAfterSolar: 3200 }, "canonical payback example matches");
var p2 = L.paybackCalc(15000);
eq(p2.sizeKw, 3, "Rs 15,000 bill needs a 3kW system");
eq(p2.cost, 432000, "3kW system costs Rs 432,000");
eq(p2.saving, 13080, "Rs 15,000 bill saves Rs 13,080 a month");
var p0 = L.paybackCalc(0);
eq(p0.months, 0, "a zero bill has no payback");

// 4. Serial checker: ROS-2026-4812 genuine, ROS-2026-077 counterfeit, unknown not-found.
var genuine = L.lookupSerial(data.SERIALS, "ROS-2026-4812");
eq(genuine.status, "genuine", "ROS-2026-4812 is genuine");
eq(genuine.title, "GENUINE — LONGI HI-MO 7", "genuine serial title");
var genuineLower = L.lookupSerial(data.SERIALS, "ros-2026-4812");
eq(genuineLower.status, "genuine", "serial lookup is case-insensitive");
var genuineSpaced = L.lookupSerial(data.SERIALS, "  ROS-2026-4812  ");
eq(genuineSpaced.status, "genuine", "serial lookup ignores surrounding spaces");
var fake = L.lookupSerial(data.SERIALS, "ROS-2026-077");
eq(fake.status, "counterfeit", "ROS-2026-077 is counterfeit");
eq(fake.title, "COUNTERFEIT WARNING", "counterfeit serial title");
ok(fake.detail.indexOf("not found in the manufacturer database") !== -1,
   "counterfeit detail says the serial is not in the database");
var unknown = L.lookupSerial(data.SERIALS, "ROS-2026-999");
eq(unknown.status, "notfound", "an unknown serial is not-found, never genuine");
eq(unknown.title, "SERIAL NOT FOUND", "unknown serial title");
eq(L.lookupSerial(data.SERIALS, ""), null, "empty serial returns null");
eq(L.lookupSerial(data.SERIALS, "   "), null, "blank serial returns null");
eq(L.lookupSerial(data.SERIALS, null), null, "null serial returns null");
eq(data.SERIALS.length, 2, "exactly two known sample serials");

// 5. Scam spotter flags QuickSolar HIGH RISK.
var riskQ = L.riskLevel(data.QUOTES[2]);
eq(riskQ.level, "HIGH RISK", "QuickSolar is HIGH RISK");
eq(riskQ.flags, 4, "QuickSolar carries 4 red flags");
eq(L.riskLevel(data.QUOTES[0]).level, "LOW RISK", "SolarCare is LOW RISK");
eq(L.riskLevel(data.QUOTES[1]).level, "LOW RISK", "SunWorks is LOW RISK");
eq(data.REDFLAGS.length, 8, "spotter lists 8 red flags");
ok(data.REDFLAGS.some(function (r) { return r.id === "no-ntn"; }),
   "spotter includes the no-NTN flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "cash-advance"; }),
   "spotter includes the cash-only advance flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "no-warranty"; }),
   "spotter includes the no-warranty-card flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "unbranded"; }),
   "spotter includes the German-panels-with-no-brand-proof flag");
ok(data.REDFLAGS.every(function (r) { return r.example.length > 10; }),
   "every red flag carries a concrete example");

// 6. Net metering: 45-day average, 4 stages, sample at Inspection.
eq(data.NETMETER_AVERAGE_DAYS, 45, "net-metering average approval is 45 days");
deep(data.NETMETER_STAGES, ["Applied", "Inspection", "Meter installed", "Billing started"],
     "net-metering stages in order");
eq(data.NETMETER_SAMPLE.currentStage, 1, "sample application is at Inspection");
var steps = L.netMeterSteps(data.NETMETER_STAGES, 1);
eq(steps[0].state, "done", "Applied is done");
eq(steps[1].state, "current", "Inspection is current");
eq(steps[2].state, "pending", "Meter installed is pending");
eq(steps[3].state, "pending", "Billing started is pending");

// 7. Pakistani digit grouping.
eq(L.formatPKR(750), "750", "Rs 750 needs no separator");
eq(L.formatPKR(21800), "21,800", "Rs 21,800");
eq(L.formatPKR(720000), "7,20,000", "Rs 720,000 in Pakistani grouping");
eq(L.formatPKR(850000), "8,50,000", "Rs 850,000 in Pakistani grouping");
eq(L.formatPKR(950000), "9,50,000", "Rs 950,000 (Ahmed's door-to-door quote)");

// 8. Installer verification data.
eq(data.INSTALLERS.length, 3, "three installers listed");
eq(data.INSTALLERS[0].verified, true, "SolarCare verified");
eq(data.INSTALLERS[2].verified, false, "QuickSolar unverified");
ok(data.INSTALLERS[0].proofs.indexOf("NTN on file") !== -1, "SolarCare shows an NTN");

// 9. Checklist toggle is pure and progress counts.
var start = ["ntn", "warranty"];
var added = L.toggleChecklist(start, "serial");
deep(added, ["ntn", "warranty", "serial"], "toggle adds a missing check");
deep(start, ["ntn", "warranty"], "toggle never mutates the original list");
deep(L.toggleChecklist(start, "ntn"), ["warranty"], "toggle removes a done check");
deep(L.checklistProgress(["ntn", "warranty"], data.CHECKLIST), { done: 2, total: 6 },
     "progress is 2 of 6 checks");
deep(L.checklistProgress([], data.CHECKLIST), { done: 0, total: 6 }, "progress starts at 0 of 6");
eq(data.CHECKLIST.length, 6, "checklist has 6 safety checks");

// 10. Cities: the six canonical cities.
deep(data.CITIES, ["Lahore", "Karachi", "Islamabad", "Peshawar", "Rawalpindi", "Quetta"],
     "six cities in order");

// 11. Every element id referenced by app.js exists in index.html.
var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var appJs = fs.readFileSync(__dirname + "/app.js", "utf8");
var ids = {};
var m;
var idRe = /el\("([^"]+)"\)/g;
while ((m = idRe.exec(appJs)) !== null) ids[m[1]] = true;
var idList = Object.keys(ids);
ok(idList.length >= 12, "app.js references at least 12 element ids (" + idList.length + " found)");
idList.forEach(function (id) {
  ok(html.indexOf('id="' + id + '"') !== -1, "index.html defines id " + id);
});
["data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(html.indexOf('src="' + f + '"') !== -1, "index.html loads " + f);
});

// 12. HTML tag balance: every opened tag is closed (void elements excluded).
var voidTags = { meta: 1, link: 1, input: 1, br: 1, hr: 1, img: 1 };
var stack = [];
var tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
while ((m = tagRe.exec(html)) !== null) {
  var tag = m[1].toLowerCase();
  var raw = m[0];
  if (voidTags[tag]) continue;
  if (raw[1] === "/") {
    eq(stack.pop(), tag, "closing tag </" + tag + "> matches the last opened tag");
  } else if (raw[raw.length - 2] !== "/") {
    stack.push(tag);
  }
}
eq(stack.length, 0, "no unclosed tags remain (stack empty)");

console.log("\n" + n + " assertions passed.");
