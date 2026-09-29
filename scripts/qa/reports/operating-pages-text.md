# Operating-pressure pages — rendered text export

Generated from the module + content for 9 pages.

## /what-pressure-should-410a/

- **Title:** R-410A Operating Pressures: High & Low Side by Temperature
- **Meta:** R-410A operating pressures at 95°F outdoors: about 114–130 psig low side and 367–419 psig high side. Chart for 65–115°F plus standing pressure.
- **H1:** What Pressure Should R-410A Be?

**Intro**

You have gauges on a home air conditioner, a number on the dial, and no easy way to place it. R-410A reads far higher than the R-22 systems most rules of thumb were written for, so a perfectly healthy pressure can look alarming.

Guess high and you vent refrigerant chasing an overcharge that was never there; guess low and you add refrigerant on top of a full system. Either way you leave the equipment worse than you found it.

This page gives the low and high side to expect at each outdoor temperature, the standing pressure with the system off, and how R-410A lines up against R-32 and R-454B — every number computed from the saturation dataset.

**Answer block**

**A healthy R-410A system runs about 114–130 psig on the low side and 367–419 psig on the high side at 95°F outdoors**, with a 38–45°F indoor coil. The low side barely moves with the weather because it follows the indoor coil; the high side climbs with the outdoor temperature, so read it against the chart below for your ambient.

**Section H2s**

- R-410A high and low side by outdoor temperature  _(residential-chart — Operating pressure by outdoor temperature (65–115°F))_
- Suction pressure tracks the indoor load  _(prose)_
- Standing pressure (system off)  _(standing — Standing pressure, system off and equalized)_
- Checking the charge with these pressures  _(prose)_
- R-410A vs R-32 vs R-454B at the same conditions  _(comparison-anchor — Side by side at 95°F outdoors)_
- Readings that point to a problem  _(prose)_

**FAQ**

- **Q:** What should R-410A pressures be at 80, 90 and 100°F?
  **A:** The low side stays near 114–130 psig at any outdoor temperature — only the high side moves. The high side runs about 296–342 psig at 80°F, 342–392 psig at 90°F, and 392–448 psig at 100°F outdoors. Read the full chart above for every 5°F step.
- **Q:** Is 400 psi on the high side normal for R-410A?
  **A:** It depends on how hot it is outside. Around 100°F outdoors the normal high-side band is about 392–448 psig, so 400 sits inside it; on a mild 80°F day the band is about 296–342 psig, so 400 would be high. Check your outdoor temperature against the chart before calling it a fault — a reading far above the row for your ambient is the real warning sign.
- **Q:** What is R-410A standing pressure?
  **A:** With the system off and equalized, R-410A settles to its saturation pressure at the coil temperature — about 219 psig near room temperature. The standing-pressure table above gives it from 65 to 115°F. A standing pressure far from the value for the ambient means the charge or the temperature is not what you think.
- **Q:** What should R-410A suction pressure be?
  **A:** About 114–130 psig on a properly charged system with a 38–45°F indoor coil, and it barely changes with the outdoor temperature because it follows the coil. A suction well below 114–130 psig usually means low evaporator airflow, a restriction, or an undercharge; well above usually means an overcharge or a compressor problem. Check [superheat](/superheat-calculator/) before adjusting.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-410A — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Residential cooling assumes a 38–45°F indoor evaporator coil for the low side (so it barely moves with the weather) and a condenser running 15–25°F above the outdoor air for the high side. The 95°F anchor is the AHRI 210/240 A2 rating condition (95°F outdoor, 80°F/67°F indoor).

---

## /what-pressure-should-r22/

- **Title:** R-22 Operating Pressures: Running, Suction & Discharge PSI
- **Meta:** Normal R-22 running pressures at 95°F outdoors: about 66–76 psig suction and 226–260 psig discharge. Chart for 65–115°F, standing pressure and fault signs.
- **H1:** What Pressure Should R-22 Be?

**Intro**

You have gauges on an older home air conditioner and a suction and discharge number you cannot quite place. Most R-22 charts float free of the one thing that actually sets the readings: how hot it is outside.

Call a normal reading a fault and you start removing or adding refrigerant that was fine; miss a real fault and the compressor pays for it. Either mistake is expensive on a system you can no longer top off casually.

This page gives the suction and discharge to expect at each outdoor temperature, the standing pressure with the system off, and the direction a reading points when it is wrong — every number computed from the saturation dataset.

**Answer block**

**A healthy R-22 system runs about 66–76 psig suction and 226–260 psig discharge** at 95°F outdoors, with a 38–45°F indoor coil. Suction follows the indoor coil and hardly moves with the weather; discharge climbs with the outdoor temperature. Read the chart below for your ambient before deciding a reading is high or low.

**Section H2s**

- R-22 running pressures by outdoor temperature  _(residential-chart — Operating pressure by outdoor temperature (65–115°F))_
- R-22 discharge (head) pressure: what pushes it up  _(prose)_
- R-22 suction pressure follows the indoor coil, not the weather  _(prose)_
- Standing pressure with the system off  _(standing — Standing pressure, system off and equalized)_
- Servicing an R-22 system today  _(prose)_
- Readings that point to a problem  _(prose)_

**FAQ**

- **Q:** What should R-22 pressures be at 70, 80, 90 and 100°F?
  **A:** Suction stays near 66–76 psig at any outdoor temperature — only discharge moves. Discharge runs about 156–182 psig at 70°F, 182–211 psig at 80°F, 211–243 psig at 90°F, and 243–278 psig at 100°F outdoors. Read the full chart above for every 5°F step.
- **Q:** What is normal R-22 head pressure?
  **A:** About 226–260 psig at 95°F outdoors, rising to roughly 243–278 psig near 100°F and falling on cooler days. Head pressure is set by the condensing temperature, which sits above the outdoor air, so compare your reading to the chart row for your ambient rather than to a single number.
- **Q:** What is R-22 standing pressure?
  **A:** With the system off and equalized, R-22 sits at its saturation pressure for the coil temperature — about 132 psig near room temperature. The standing-pressure table above gives it from 65 to 115°F. A standing pressure far from the value for the ambient means the charge or the temperature is not what you think.
- **Q:** What should R-22 suction pressure be?
  **A:** About 66–76 psig on a properly charged system with a 38–45°F indoor coil, and it barely changes with the outdoor temperature because it follows the coil. Below 66–76 psig suspect low evaporator airflow, a restriction, or an undercharge; above 66–76 psig suspect an overcharge or a compressor problem.
- **Q:** Can you still recharge a system with R-22?
  **A:** Yes, but only with reclaimed, recycled, or stockpiled R-22 — US production and import ended on January 1, 2020. There is no ban on running or servicing existing equipment, so repairing leaks and recovering the charge matters more than ever; casual topping off wastes a supply that no longer refills.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-22 — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Residential cooling assumes a 38–45°F indoor evaporator coil for the low side (so it barely moves with the weather) and a condenser running 15–25°F above the outdoor air for the high side. The 95°F anchor is the AHRI 210/240 A2 rating condition (95°F outdoor, 80°F/67°F indoor).

---

## /what-pressure-should-r32/

- **Title:** R-32 Running Pressure: Normal Operating Pressures (Cooling)
- **Meta:** R-32 running pressure in cooling: about 116–133 psig suction and 375–429 psig high side at 95°F (35°C) outdoors. Chart for 65–115°F in psig and kPa.
- **H1:** What Pressure Should R-32 Be?

**Intro**

You are on an R-32 system — a newer split A/C or heat pump — with gauges connected and a suction and high-side number to judge. R-32 reads a little higher than the R-410A it replaces, so the familiar targets do not quite fit.

Read it wrong and you chase a charge that was never off, or miss airflow and condenser faults that a correct baseline would have caught. On an A2L system that also means opening the circuit you did not need to open.

This page gives the suction and high side to expect at each outdoor temperature in psig and kPa, the standing pressure at room temperature, and how R-32 lines up against R-410A — all from the saturation dataset.

**Answer block**

**R-32 runs about 116–133 psig suction and 375–429 psig on the high side** at 95°F (35°C) outdoors, with a 38–45°F indoor coil. Suction follows the indoor coil and barely moves with the weather; the high side climbs with the outdoor temperature. R-32 sits a little above R-410A at the same conditions, so read the chart below for your ambient.

**Section H2s**

- R-32 running pressure in cooling  _(residential-chart — Operating pressure by outdoor temperature (65–115°F))_
- R-32 suction pressure  _(prose)_
- High-side pressure as the outdoor temperature climbs  _(prose)_
- Standing pressure at room temperature  _(standing — Standing pressure, system off and equalized)_
- R-32 vs R-410A pressures  _(comparison-anchor — Side by side at 95°F outdoors)_

**FAQ**

- **Q:** What pressure should R-32 run at in cooling?
  **A:** About 116–133 psig suction and 375–429 psig on the high side at 95°F (35°C) outdoors with a 38–45°F indoor coil. Suction stays near 116–133 psig across the weather because it follows the coil; the high side is what climbs with the outdoor temperature. Read the chart above for your ambient.
- **Q:** What is R-32 suction pressure in bar?
  **A:** About 8.0–9.2 bar(gauge) at 95°F outdoors — the same band as 116–133 psig or 802–917 kPa(gauge). Suction is set by the indoor coil, so it holds near this range regardless of the outdoor temperature.
- **Q:** What is R-32 standing pressure at 20°C and 30°C?
  **A:** About 199 psig at 68°F (20°C) and 265 psig at 86°F (30°C) with the system off and equalized. R-32 is a single-component refrigerant, so standing pressure is just its saturation pressure at the coil temperature; the table above gives it from 65 to 115°F.
- **Q:** What is R-32 high-side pressure at 35°C (95°F)?
  **A:** About 375–429 psig at 95°F (35°C) outdoors on a healthy system. It rises to roughly 401–459 psig near 100°F and falls on cooler days, because the condensing temperature sits above the outdoor air. Compare your reading to the chart row for your ambient.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-32 — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Residential cooling assumes a 38–45°F indoor evaporator coil for the low side (so it barely moves with the weather) and a condenser running 15–25°F above the outdoor air for the high side. The 95°F anchor is the AHRI 210/240 A2 rating condition (95°F outdoor, 80°F/67°F indoor).

---

## /what-pressure-should-r454b/

- **Title:** R-454B Operating Pressures: Normal High & Low Side Chart
- **Meta:** R-454B operating pressures at 95°F outdoors: about 103–118 psig low side and 346–396 psig high side. Chart for 65–115°F, side by side with R-410A.
- **H1:** What Pressure Should R-454B Be?

**Intro**

You are on an R-454B system — one of the A2L refrigerants now replacing R-410A in new equipment — with gauges connected and a reading to judge. R-454B runs close to R-410A, which is exactly why a small offset can confuse.

Read it against R-410A memory and you may add or remove refrigerant chasing a difference that is just the fluid. On an A2L system you also do not want to open the circuit unless you have to.

This page gives the low and high side to expect at each outdoor temperature, the same numbers laid next to R-410A, and the standing pressure with the system off — all computed from the saturation dataset.

**Answer block**

**R-454B runs about 103–118 psig on the low side and 346–396 psig on the high side** at 95°F outdoors, with a 38–45°F indoor coil. It sits a little below R-410A on both sides. The low side follows the indoor coil and barely moves with the weather; the high side climbs with the outdoor temperature.

**Section H2s**

- R-454B normal operating pressures  _(residential-chart — Operating pressure by outdoor temperature (65–115°F))_
- R-454B vs R-410A running pressures, 65–115°F  _(comparison-chart — High side by outdoor temperature (65–115°F))_
- Suction pressure and R-454B's small glide (read dew for suction)  _(prose)_
- Standing pressure  _(standing — Standing pressure, system off and equalized)_
- Checking the charge  _(prose)_

**FAQ**

- **Q:** What pressures does R-454B run at?
  **A:** About 103–118 psig on the low side and 346–396 psig on the high side at 95°F outdoors with a 38–45°F indoor coil. The low side follows the indoor coil and barely moves with the weather; the high side climbs with the outdoor temperature. Read the chart above for your ambient.
- **Q:** Does R-454B run at lower pressure than R-410A?
  **A:** Slightly, yes. At the 95°F condition R-454B is about -9.7% on the low side and -5.7% on the high side versus R-410A. The gap is small and consistent across the outdoor range, so R-410A-rated gauges, hoses, and recovery equipment are appropriate for R-454B.
- **Q:** What is the R-454B low side at 100°F outdoors?
  **A:** The low side follows the indoor coil, so it stays near 103–118 psig whether it is 100°F outside or milder — it is the high side that climbs, to about 370–422 psig at 100°F outdoors. A low side far from 103–118 psig points to an airflow, charge, or restriction problem rather than the weather.
- **Q:** What is R-454B standing pressure?
  **A:** With the system off and equalized, R-454B sits across a narrow dew-to-bubble range — about 199–206 psig near room temperature. The standing-pressure table above gives it from 65 to 115°F. The small spread is the blend's glide.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-454B — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Residential cooling assumes a 38–45°F indoor evaporator coil for the low side (so it barely moves with the weather) and a condenser running 15–25°F above the outdoor air for the high side. The 95°F anchor is the AHRI 210/240 A2 rating condition (95°F outdoor, 80°F/67°F indoor).

**Dataset gaps (render as —):**

- r-454b residential high side, outdoor 110°F: outside the calculated range
- r-454b residential high side, outdoor 115°F: outside the calculated range

---

## /what-pressure-should-r407c/

- **Title:** R-407C Suction & Discharge Pressure Chart (Running PSI)
- **Meta:** R-407C suction and discharge pressure at 95°F outdoors: about 60–71 psig (4.2–4.9 bar) suction and 260–299 psig discharge. Chart for 65–115°F.
- **H1:** What Pressure Should R-407C Be?

**Intro**

You are on an R-407C system — usually an R-22 retrofit or light-commercial AC — with gauges connected and two saturation temperatures printed on the dial. The glide is what makes R-407C confusing to read.

Read superheat off the wrong curve and you can be off by the whole glide, which is enough to condemn a good charge or clear a bad one. That mistake sends good refrigerant to a recovery tank or leaves a starving evaporator.

This page gives the suction and discharge to expect at each outdoor temperature in psig, bar and kPa, explains which curve to read for which job, and gives the standing range — all computed from the saturation dataset.

**Answer block**

**R-407C runs about 60–71 psig (4.2–4.9 bar) suction and 260–299 psig discharge** at 95°F outdoors, with a 38–45°F indoor coil. It is an R-22 retrofit that runs at similar pressures and uses R-22-rated equipment. Because it glides, read suction on the dew curve and the liquid line on the bubble curve.

**Section H2s**

- R-407C suction and discharge pressure chart  _(residential-chart — Operating pressure by outdoor temperature (65–115°F))_
- Why R-407C needs two temperatures: glide (dew for suction, bubble for the liquid line)  _(prose)_
- Running pressure in bar and kPa  _(prose)_
- Standing pressure is a range, not one number  _(standing — Standing pressure, system off and equalized)_
- If the low side reads 28 psig  _(prose)_

**FAQ**

- **Q:** What are normal R-407C suction and discharge pressures?
  **A:** About 60–71 psig suction and 260–299 psig discharge at 95°F outdoors with a 38–45°F indoor coil. Suction follows the indoor coil and holds across the weather; discharge climbs with the outdoor temperature. Read the chart above for your ambient, and read suction on the dew curve.
- **Q:** What is R-407C running pressure in bar?
  **A:** About 4.2–4.9 bar(gauge) on the low side and 17.9–20.6 bar(gauge) on the high side at 95°F outdoors — the same as 60–71 psig and 260–299 psig. To convert any reading, multiply psig by 0.0689 to get bar(gauge).
- **Q:** If the R-407C low side reads 28 psig, what is the evaporating temperature?
  **A:** At 28 psig the dew (saturated-vapor) temperature is about 10°F and the bubble (saturated-liquid) temperature about −2°F. Use the dew value — about 10°F — as the evaporating temperature for superheat; the gap between the two is R-407C's glide.
- **Q:** Why do R-407C gauges show two temperatures?
  **A:** Because R-407C is a zeotropic blend that evaporates and condenses across a temperature range, not at one point. Every pressure has a lower dew temperature and a higher bubble temperature. Read the dew scale for suction and superheat, and the bubble scale for the liquid line and subcooling.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-407C — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Residential cooling assumes a 38–45°F indoor evaporator coil for the low side (so it barely moves with the weather) and a condenser running 15–25°F above the outdoor air for the high side. The 95°F anchor is the AHRI 210/240 A2 rating condition (95°F outdoor, 80°F/67°F indoor).

---

## /what-pressure-should-r404a/

- **Title:** R-404A Suction & Discharge Pressure: Freezer & Cooler Chart
- **Meta:** R-404A suction pressure: about 14–18 psig at a −20°F freezer coil and 58–66 psig at a 25°F cooler coil; discharge 273–333 psig at 95°F outdoors.
- **H1:** What Pressure Should R-404A Be?

**Intro**

You are on a commercial refrigeration rack or a walk-in — a cooler or a freezer — with gauges connected and a suction number that only makes sense once you know the box temperature it is holding.

Judge freezer suction against cooler numbers and you will call a healthy box low, or miss a real starve; on refrigerated product, a wrong call spoils a load, not just a service call.

This page separates suction by application — walk-in cooler versus walk-in freezer, at the AHRI walk-in coil temperatures — and gives discharge by outdoor temperature, all computed from the saturation dataset.

**Answer block**

**R-404A suction is about 14–18 psig at a −20°F walk-in freezer coil and 58–66 psig at a 25°F cooler coil**, with discharge around 273–333 psig at 95°F outdoors. Suction is set by the box temperature, not the weather; discharge tracks the outdoor air. Match your reading to the application and ambient in the tables below.

**Section H2s**

- R-404A suction pressure: walk-in freezer vs cooler  _(application-suction — Suction pressure by application (AHRI 1250 walk-in coil temperatures))_
- Discharge (head) pressure by outdoor temperature  _(commercial-head-chart — Head (discharge) pressure by outdoor temperature (65–115°F))_
- Reading a walk-in freezer: one worked example  _(prose)_
- Superheat checks  _(prose)_
- Readings that point to a problem  _(prose)_

**FAQ**

- **Q:** What should R-404A suction pressure be on a walk-in freezer?
  **A:** About 14–18 psig at the AHRI −20°F freezer coil temperature. Suction is set by the box, not the weather, so it holds near this band while the freezer is pulled down. A suction well below 14–18 psig usually means an undercharge, a restriction, or a coil that needs defrost.
- **Q:** What should R-404A pressures be on a walk-in cooler?
  **A:** Suction about 58–66 psig at the AHRI 25°F cooler coil temperature, with discharge around 273–333 psig at 95°F outdoors. Cooler suction runs well above freezer suction because the box is warmer; match your reading to the application, not to a single number.
- **Q:** What is normal R-404A discharge pressure?
  **A:** About 273–333 psig at 95°F outdoors, rising on hotter days because the condensing temperature sits above the outdoor air. It is the same on a cooler or a freezer — discharge is set by the condenser and ambient, not the box. Read the discharge chart above for your outdoor temperature.
- **Q:** What is R-404A running pressure at 95°F outdoors?
  **A:** Discharge about 273–333 psig at 95°F outdoors; suction depends on the box — about 58–66 psig on a 25°F cooler coil and 14–18 psig on a −20°F freezer coil. Always pair the suction reading with the application temperature before judging it.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-404A — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F. Head uses a condenser running 15–30°F above the outdoor air; the 95°F anchor is an AHRI 1250 outdoor condensing-unit rating point.

---

## /what-pressure-should-r449a/

- **Title:** R-449A Suction & Operating Pressures: Cooler & Freezer
- **Meta:** R-449A suction pressure: about 8.1–12 psig at a −20°F freezer coil and 47–54 psig at a 25°F cooler coil; head 276–338 psig at 95°F outdoors.
- **H1:** What Pressure Should R-449A Be?

**Intro**

You are on an R-449A system — often a retrofitted R-404A rack, sold as Chemours Opteon XP40 — with gauges connected and suction that looks low if you still have R-404A numbers in your head.

Compare R-449A suction to R-404A memory and you will over-add refrigerant on a box that was fine; on a rack full of product that is an expensive way to learn the fluid reads lower. (R-449A is not R-448A — Opteon XP40 is R-449A.)

This page gives R-449A suction by application at the AHRI walk-in coil temperatures, head pressure by outdoor temperature, and a direct comparison with R-404A on the same box — all computed from the saturation dataset.

**Answer block**

**R-449A suction is about 8.1–12 psig at a −20°F freezer coil and 47–54 psig at a 25°F cooler coil**, with head around 276–338 psig at 95°F outdoors. On a retrofitted R-404A box it reads noticeably lower suction than R-404A, so compare to R-449A numbers, not to R-404A memory.

**Section H2s**

- R-449A suction pressure by application  _(application-suction — Suction pressure by application (AHRI 1250 walk-in coil temperatures))_
- Head pressure by outdoor temperature  _(commercial-head-chart — Head (discharge) pressure by outdoor temperature (65–115°F))_
- R-449A vs R-404A on the same box: glide and dew-point reading  _(comparison-anchor — Side by side at 95°F outdoors)_

**FAQ**

- **Q:** What should R-449A suction pressure be?
  **A:** About 8.1–12 psig at a −20°F freezer coil and 47–54 psig at a 25°F cooler coil, read on the dew curve. Suction is set by the box temperature, not the weather, so pair the reading with the application before judging it. On a retrofit it will sit below the old R-404A numbers.
- **Q:** What is normal R-449A head pressure?
  **A:** About 276–338 psig at 95°F outdoors, rising on hotter days because the condensing temperature sits above the outdoor air. Head is set by the condenser and ambient, not the box, so it is the same on a cooler or a freezer. Read the head chart above for your outdoor temperature.
- **Q:** Why does R-449A read lower suction than R-404A on the same box?
  **A:** Because R-449A's saturation pressure is lower — about -19.4% at the cooler coil condition. On a retrofitted box that lower suction is expected and not an undercharge. Compare to the R-449A numbers above, and read superheat on the dew curve because R-449A glides where R-404A barely does.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-449A — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F. Head uses a condenser running 15–30°F above the outdoor air; the 95°F anchor is an AHRI 1250 outdoor condensing-unit rating point.

---

## /what-pressure-should-r454c/

- **Title:** R-454C Operating Pressures: Walk-In Cooler & Freezer PSI
- **Meta:** R-454C running pressures: about 5.7–8.8 psig suction at a −20°F freezer coil and 40–46 psig at a 25°F cooler coil; head 255–311 psig at 95°F outdoors.
- **H1:** What Pressure Should R-454C Be?

**Intro**

You are on an R-454C system — a low-GWP A2L blend now going into new commercial refrigeration — with gauges connected and a big gap between the two saturation temperatures on the dial. That gap is the glide, and it is large.

Read superheat off the wrong curve on a blend that glides this much and you can be off by more than ten degrees — enough to flood or starve the evaporator while the gauge looks fine.

This page gives R-454C suction by application at the AHRI walk-in coil temperatures, head pressure by outdoor temperature, and the wide dew-to-bubble standing range — all computed from the saturation dataset.

**Answer block**

**R-454C suction is about 5.7–8.8 psig at a −20°F freezer coil and 40–46 psig at a 25°F cooler coil**, with head around 255–311 psig at 95°F outdoors. It is a high-glide, low-GWP A2L blend, so read suction on the dew curve and treat standing pressure as a wide dew-to-bubble range.

**Section H2s**

- R-454C pressures for walk-in coolers and freezers  _(application-suction — Suction pressure by application (AHRI 1250 walk-in coil temperatures))_
- Head pressure by outdoor temperature  _(commercial-head-chart — Head (discharge) pressure by outdoor temperature (65–115°F))_
- Reading gauges on a high-glide blend  _(prose)_
- Standing pressure: a wide dew-to-bubble range  _(standing — Standing pressure, system off and equalized)_

**FAQ**

- **Q:** What pressures does R-454C run at in a walk-in freezer?
  **A:** About 5.7–8.8 psig suction at the AHRI −20°F freezer coil temperature, read on the dew curve, with head near 255–311 psig at 95°F outdoors. Suction is set by the box and holds near this band while the freezer is pulled down; a reading well below it points to an undercharge, a restriction, or a coil needing defrost.
- **Q:** What is R-454C standing pressure?
  **A:** A range, not one number — with the system off and equalized R-454C sits across its dew-to-bubble band, about 108–137 psig at 68°F (20°C). The standing-pressure table above gives the band from 65 to 115°F. The wide spread is R-454C's glide.
- **Q:** What is R-454C saturation pressure at 20°C (68°F)?
  **A:** About 108–137 psig at 68°F (20°C), given as a dew-to-bubble range because R-454C glides. The lower (dew) end is the saturated-vapor pressure; the higher (bubble) end is the saturated-liquid pressure. Use the dew end when comparing to a suction reading.
- **Q:** What is R-454C discharge pressure?
  **A:** About 255–311 psig at 95°F outdoors, rising on hotter days because the condensing temperature sits above the outdoor air. Head is set by the condenser and ambient, not the box, so it is the same on a cooler or a freezer. Read the head chart above for your outdoor temperature.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-454C — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F. Head uses a condenser running 15–30°F above the outdoor air; the 95°F anchor is an AHRI 1250 outdoor condensing-unit rating point.

---

## /what-pressure-should-r744/

- **Title:** R-744 (CO₂) Pressures: Suction, High Side & Standstill
- **Meta:** R-744 (CO₂) suction runs about 420–462 psig at a 25°F cooler coil and 189–212 psig at a −20°F freezer coil; above 87.8°F the high side is transcritical.
- **H1:** What Pressure Should R-744 (CO₂) Be?

**Intro**

You are on a CO₂ system — a booster rack, a cascade low stage, or a transcritical gas cooler — and the gauges read several times higher than any HFC you have worked on. Nothing about the numbers is familiar.

Bring HFC instincts to CO₂ and you will misjudge both the equipment rating and the high side, which above the critical point is not a saturation pressure at all. On a system this stiff, that is a safety issue, not just a service one.

This page gives CO₂ suction for coolers and freezers, the subcritical high-side pressure, the critical point from the dataset, and standstill pressure — and it stops where the physics does, above the critical temperature.

**Answer block**

**R-744 (CO₂) suction runs about 420–462 psig at a 25°F cooler coil and 189–212 psig at a −20°F freezer coil** — several times higher than an HFC. Below its 87.8°F critical temperature the high side is a saturation pressure; above it the system is transcritical and the high-pressure control valve, not a chart, sets the gas-cooler pressure.

**Section H2s**

- CO₂ suction pressure for coolers and freezers  _(co2-suction — CO₂ suction pressure by application (AHRI 1250 walk-in coil temperatures))_
- The high side below and above the critical point  _(co2-highside — Subcritical high-side (condensing) pressure, 40–85°F)_
- Standstill pressure  _(co2-standstill — Standstill saturation pressure, 65–85°F)_

**FAQ**

- **Q:** What is normal R-744 suction pressure?
  **A:** About 420–462 psig at a 25°F cooler coil and 189–212 psig at a −20°F freezer coil, read on the dew curve. That is several times an HFC's suction, which is normal for CO₂ — pair the reading with the box temperature before judging it.
- **Q:** What is CO₂ standstill pressure at 70°F?
  **A:** About 838 psig — with the system off at 70°F, CO₂ sits at its 70°F saturation pressure. Standstill climbs quickly with temperature and only exists below the 87.8°F critical temperature; above that the fluid is supercritical and there is no standstill saturation pressure.
- **Q:** Why can't a PT chart give the CO₂ high side above 87.8°F?
  **A:** Because 87.8°F is CO₂'s critical temperature (1055 psig). Above it there is no liquid–vapor boundary, so there is no saturation pressure to look up. The system runs transcritical and the high-pressure control valve sets the gas-cooler pressure for efficiency — there is no single "normal" number to read from a chart.

**How these numbers are calculated**

Every pressure on this page is a saturation lookup on the CoolProp 7.2.0-verified pressure–temperature dataset for R-744 — no typed-in values. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

CO₂ suction uses the AHRI 1250-2020 walk-in coil temperatures (25°F cooler, −20°F freezer). Below the critical temperature the high side is a saturation (condensing) pressure; above it the system is transcritical and the high-pressure control valve sets the gas-cooler pressure.

---
