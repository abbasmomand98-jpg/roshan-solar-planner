# Roshan — Solar Panel Planner & Scam Checker (UX Concept)

**Live demo:** https://abbasmomand98-jpg.github.io/roshan-solar-planner/
**Code:** https://github.com/abbasmomand98-jpg/roshan-solar-planner

Roshan is a solar planner and scam checker for Pakistan. Families spend Rs 300,000–800,000 on home solar with no way to tell a real panel from a fake one: quotes for the same 5kW system differ by lakhs, nobody shows the payback math, and net-metering applications sit for months — while winter load-shedding makes solar urgent. Door-to-door installers sell "German panels" that are unbranded, take advance cash, and vanish.

Roshan compares installer quotes side by side, calculates your payback in months, checks a panel serial number before you pay, tracks your net-metering application, verifies installers, and keeps a safety checklist to tick off before paying anyone anything.

## How it works

Open `index.html` in a browser — no build step, no framework, just HTML, CSS and JavaScript. The demo is split into three files so each part is easy to read and change:

- `data.js` — all the sample data: the three 5kW quotes, the two panel serials, the net-metering stages, the eight scam red flags, and the safety checklist.
- `logic.js` — all the rules, with no DOM code at all: per-watt prices, the cheapest-verified-quote rule, the payback calculator, the serial lookup, the risk levels, and the checklist toggle. Because it touches no DOM, it can be tested in Node with `node test.js`.
- `app.js` — the page wiring only: it reads the data, calls the logic, and renders the results into the page. Demo "today" is pinned to 8 Nov 2026 so the sample figures stay stable.

Try it with the sample figures:

1. **Quote compare** — SolarCare in Lahore quotes Rs 720,000 (Longi Hi-MO 7, 25-year warranty, verified, Rs 144/W) and wins best value. SunWorks in Islamabad quotes Rs 850,000 (Jinko Tiger Neo, verified, Rs 170/W). QuickSolar in Karachi quotes Rs 640,000 (unbranded panels, no warranty card, unverified, Rs 128/W) — cheapest, but flagged HIGH RISK.
2. **Payback calculator** — enter a Rs 25,000 monthly WAPDA bill: Roshan recommends a 5kW system, saving Rs 21,800 a month, so Rs 720,000 ÷ Rs 21,800 = a 33-month payback. The panels last 25 years.
3. **Serial checker** — type `ROS-2026-4812` and it comes back GENUINE Longi Hi-MO 7, verified in the manufacturer database. Type `ROS-2026-077` and it warns COUNTERFEIT — the serial is not in the database. Any other serial comes back "not found", never "genuine".
4. **Net-metering tracker** — the sample application (Ahmed, Rawalpindi, 5kW, applied 24 Oct 2026) is at Inspection, on the way to Meter installed and Billing started. Average approval: 45 days.
5. **Safety checklist** — tick off the six checks (NTN, warranty card in writing, serial checked, written quote, net-metering timeline, no cash advance) before paying an installer. Your ticks are saved in the browser with localStorage.

Run the tests with `node test.js` — they assert every canonical figure above, plus that all element IDs referenced by `app.js` exist in `index.html` and that the HTML tags balance.

## What you can learn from this project

- **Separating data, logic, and rendering.** `data.js` holds facts, `logic.js` holds rules, `app.js` holds rendering. When the facts change (a new installer, a new price), only `data.js` changes. When a rule changes (how payback is calculated), only `logic.js` changes. This is the single most useful habit in front-end work.
- **Pure functions are testable functions.** Every rule in `logic.js` takes inputs and returns outputs — no DOM, no dates from the clock, no hidden state. That is why `node test.js` can check the payback maths (720,000 ÷ 21,800 = 33 months) without opening a browser.
- **"Cheapest verified" beats "cheapest".** The quote comparer does not pick the lowest price — it picks the lowest price *among verified installers*. Building a rule like that into code is how a design opinion ("verified matters more than cheap") becomes a working product.
- **Never trust user input — normalise it.** The serial checker upper-cases the input and trims spaces, so `ros-2026-4812` still matches. And an unknown serial returns "not found", never a guess.
- **Pakistani number formatting.** `formatPKR` groups digits the way Pakistan writes lakhs — 720,000 becomes "7,20,000". Small detail, big difference in whether a number reads as real to a Pakistani user.
- **localStorage for a checklist.** The safety checklist survives a page refresh because `app.js` saves the ticked items under one key (`roshan-checklist-done`) and loads them back on start.

## Sample-data honesty note

Every quote, serial number, installer, figure and city in this demo is invented sample data for an unofficial UX concept. No real installer, panel serial, or person appears anywhere. Roshan is not a solar company — always confirm prices, warranties and net-metering status with the installer and your electricity provider before paying anyone anything.

## Fork it and make it yours

This project is a pattern, not just a demo: a **compare → calculate → verify** tool for any purchase where sellers hide the truth. Fork the repo and adapt it to a problem people face where you live — compare generator prices and fuel costs, verify medicine batch numbers, check school fee structures, or compare water tanker rates in your city. Keep the data in `data.js`, the rules in `logic.js`, and the honesty note — and the same pattern will work for your problem too.

---

Roshan is an unofficial UX concept by Muhammad Abbas Khan.
Available for new projects: abbasmomand98@gmail.com
