// Roshan — Solar Panel Planner & Scam Checker (UX Concept).
// IMPORTANT: every quote, serial number, installer, figure and city
// below is SAMPLE data invented for this UX concept demo. No real
// installer, panel serial, or person appears anywhere. Roshan is an
// unofficial concept, not a solar company: always confirm prices,
// warranties and net-metering status with the installer and your
// electricity provider before paying anyone anything.

// Canonical 5kW quotes — the same figures appear in the mockups, the
// case study slides and the copy pack. Per-watt price is the quote
// divided by 5,000 W: 720,000 / 5,000 = Rs 144/W, 850,000 / 5,000 =
// Rs 170/W, 640,000 / 5,000 = Rs 128/W.
var QUOTES = [
  {
    id: "solarcare",
    installer: "SolarCare",
    city: "Lahore",
    price: 720000,
    systemKw: 5,
    panel: "Longi Hi-MO 7",
    warranty: "25-year warranty",
    verified: true,
    bestValue: true,
    redFlags: []
  },
  {
    id: "sunworks",
    installer: "SunWorks",
    city: "Islamabad",
    price: 850000,
    systemKw: 5,
    panel: "Jinko Tiger Neo",
    warranty: "Verified installer",
    verified: true,
    bestValue: false,
    redFlags: []
  },
  {
    id: "quicksolar",
    installer: "QuickSolar",
    city: "Karachi",
    price: 640000,
    systemKw: 5,
    panel: "Unbranded panels",
    warranty: "NO warranty card",
    verified: false,
    bestValue: false,
    redFlags: ["no-ntn", "cash-advance", "no-warranty", "unbranded"]
  }
];

// The canonical payback example. Demo "today" is pinned to 8 Nov 2026:
// a Rs 25,000/month WAPDA bill -> 5kW -> saves Rs 21,800/month ->
// payback 720,000 / 21,800 = 33 months. Panels last 25 years.
var PAYBACK_EXAMPLE = {
  bill: 25000,
  systemKw: 5,
  saving: 21800,
  cost: 720000,
  months: 33,
  billAfterSolar: 3200
};

// Panel serial lookup — the same two serials appear in the mockups,
// slides and copy. Unknown serials are "not found", never "genuine".
var SERIALS = [
  {
    id: "ROS-2026-4812",
    status: "genuine",
    title: "GENUINE — LONGI HI-MO 7",
    detail: "Serial verified in the manufacturer database. Safe to buy."
  },
  {
    id: "ROS-2026-077",
    status: "counterfeit",
    title: "COUNTERFEIT WARNING",
    detail: "Serial not found in the manufacturer database. Do not pay for these panels. Walk away — and report the seller."
  }
];

// Net metering — sample average approval 45 days; stages Applied ->
// Inspection -> Meter installed -> Billing started. The sample
// application is at Inspection on 8 Nov 2026.
var NETMETER_STAGES = ["Applied", "Inspection", "Meter installed", "Billing started"];
var NETMETER_AVERAGE_DAYS = 45;
var NETMETER_SAMPLE = {
  applicant: "Ahmed, Rawalpindi",
  systemKw: 5,
  installer: "SolarCare, Lahore",
  appliedDate: "24 Oct 2026",
  currentStage: 1, // 0-based index into NETMETER_STAGES: Inspection
  note: "Inspection is booked — the DISCO team visits your roof to check the panels and the meter point."
};

// Installer verification — what a verified installer can show.
var INSTALLERS = [
  { name: "SolarCare", city: "Lahore", verified: true,
    proofs: ["NTN on file", "Warranty card in writing", "Written contract", "Net-metering help included"] },
  { name: "SunWorks", city: "Islamabad", verified: true,
    proofs: ["NTN on file", "Warranty card in writing", "Written contract"] },
  { name: "QuickSolar", city: "Karachi", verified: false,
    proofs: ["No NTN shown", "No warranty card", "Cash-only advance demanded"] }
];

// Scam spotter — each flag carries a sample example. The four flags
// named in the brief (no NTN, cash-only advance, no warranty card,
// "German panels" with no brand proof) are first.
var REDFLAGS = [
  { id: "no-ntn", flag: "No NTN number",
    example: "A real installer is a registered business and can show its NTN. QuickSolar showed none." },
  { id: "cash-advance", flag: "Cash-only advance payment",
    example: "An advance paid in cash, with no receipt, is gone if the installer vanishes. Insist on a bank transfer and a written receipt." },
  { id: "no-warranty", flag: "No warranty card",
    example: "QuickSolar's Rs 640,000 quote comes with no warranty card at all — if a panel fails in year two, there is nothing to claim on." },
  { id: "unbranded", flag: "\u201cGerman panels\u201d with no brand proof",
    example: "Ahmed was quoted Rs 950,000 for \u201cGerman panels\u201d that had no brand printed on them. A real panel brand — Longi, Jinko — is printed on the panel and on the warranty card." },
  { id: "no-contract", flag: "No written contract",
    example: "A quote on WhatsApp is not a contract. A real installer gives you a signed, written quote listing the panel brand, inverter, warranty and net-metering timeline." },
  { id: "too-cheap", flag: "A quote far below the market",
    example: "Rs 640,000 for a 5kW system when verified installers charge Rs 720,000–850,000 usually means unbranded panels, a small inverter, or corners cut on wiring." },
  { id: "pressure", flag: "Pressure to pay today",
    example: "\u201cThis price is only for today\u201d is a pressure tactic. A genuine quote stays valid for days — take it home and compare it in Roshan first." },
  { id: "no-netmeter", flag: "No net-metering help",
    example: "Net metering takes about 45 days on average and needs paperwork with your DISCO. An installer who will not help with it leaves you paying full bills for months." }
];

// Saved-quote checklist — tick each step off before paying an
// installer. Persisted in localStorage by app.js.
var CHECKLIST = [
  { id: "ntn", label: "Asked for the installer's NTN number" },
  { id: "warranty", label: "Got the warranty card in writing (25 years, panel brand named)" },
  { id: "serial", label: "Checked the panel serial number in Roshan" },
  { id: "quote-written", label: "Got a written quote naming the panel brand and inverter" },
  { id: "netmeter", label: "Net-metering timeline written into the contract" },
  { id: "no-cash", label: "No cash advance before installation — bank transfer with receipt" }
];

var CITIES = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Rawalpindi", "Quetta"];

if (typeof module !== "undefined") {
  module.exports = { QUOTES: QUOTES, PAYBACK_EXAMPLE: PAYBACK_EXAMPLE,
    SERIALS: SERIALS, NETMETER_STAGES: NETMETER_STAGES,
    NETMETER_AVERAGE_DAYS: NETMETER_AVERAGE_DAYS,
    NETMETER_SAMPLE: NETMETER_SAMPLE, INSTALLERS: INSTALLERS,
    REDFLAGS: REDFLAGS, CHECKLIST: CHECKLIST, CITIES: CITIES };
}
