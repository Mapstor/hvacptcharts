# Operating-pressure pages — full rendered-text export

Extracted from the built HTML (.next/server/app). One section per page, in page order.

## /what-pressure-should-410a/

- **<title>:** R-410A Operating Pressures: High & Low Side by Temperature
- **meta description:** R-410A operating pressures at 95°F outdoors: about 114–130 psig low side and 367–419 psig high side. Chart for 65–115°F plus standing pressure.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-410A Be?

Updated October 1, 2026

R-410A A1Non-flammable

You have gauges on a home air conditioner, a number on the dial, and no easy way to place it. At 95°F outdoors R-410A reads about 72% higher on the low side and about 62% higher on the high side than R-22, so a perfectly healthy pressure can look alarming if you learned on R-22.

Guess high and you recover refrigerant chasing an overcharge that was never there; guess low and you add refrigerant on top of a full system. Either way you leave the equipment worse than you found it.

This page gives the low and high side to expect at each outdoor temperature, the standing pressure with the system off, and how R-410A lines up against R-32 and R-454B.

A healthy R-410A system runs about 114–130 psig on the low side and 367–419 psig on the high side at 95°F outdoors, with a 38–45°F indoor coil. The low side depends mainly on the indoor coil and moves far less than the high side, which climbs with the outdoor temperature. Read the chart below for your ambient.

## R-410A high and low side by outdoor temperature

Find your outdoor temperature down the left column. The high side is what tracks the weather; the low side is the number to sanity-check against your indoor coil.

| Outdoor | Low side (psig / kPa) | High side (psig / kPa) |
| 65°F18.3°C | 114–130 psig785–897 kPa | 237–275 psig1,631–1,899 kPa |
| 70°F21.1°C | 114–130 psig785–897 kPa | 255–296 psig1,761–2,044 kPa |
| 75°F23.9°C | 114–130 psig785–897 kPa | 275–319 psig1,899–2,196 kPa |
| 80°F26.7°C | 114–130 psig785–897 kPa | 296–342 psig2,044–2,357 kPa |
| 85°F29.4°C | 114–130 psig785–897 kPa | 319–367 psig2,196–2,529 kPa |
| 90°F32.2°C | 114–130 psig785–897 kPa | 342–392 psig2,357–2,705 kPa |
| 95°F35.0°C | 114–130 psig785–897 kPa | 367–419 psig2,529–2,892 kPa |
| 100°F37.8°C | 114–130 psig785–897 kPa | 392–448 psig2,705–3,088 kPa |
| 105°F40.6°C | 114–130 psig785–897 kPa | 419–478 psig2,892–3,295 kPa |
| 110°F43.3°C | 114–130 psig785–897 kPa | 448–509 psig3,088–3,512 kPa |
| 115°F46.1°C | 114–130 psig785–897 kPa | 478–543 psig3,295–3,740 kPa |

_caption / source:_ Operating pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

The low side is the same in every row because it follows the 38–45°F indoor coil, not the weather; only the high side climbs with outdoor temperature.

## Suction pressure tracks the indoor load

The low side depends mainly on the indoor coil — its temperature and airflow — not the outdoor weather, so on a properly charged system with a 38–45°F coil it sits near 114–130 psig and moves far less than the high side. A low side well below 114–130 psig points to weak evaporator airflow, a restriction, or an undercharge; well above 114–130 psig points to a high indoor load, an overcharge, or a compressor that is not pumping. Confirm with superheat before you touch the charge.

## Standing pressure (system off)

With the system off and the pressures equalized, R-410A settles to the saturation pressure at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize. This is what you read on a cold start or before recovery.

| Off temperature | Standing (psig / kPa) |
| 65°F18.3°C | 186 psig1,281 kPa |
| 70°F21.1°C | 202 psig1,391 kPa |
| 75°F23.9°C | 219 psig1,508 kPa |
| 80°F26.7°C | 237 psig1,631 kPa |
| 85°F29.4°C | 255 psig1,761 kPa |
| 90°F32.2°C | 275 psig1,899 kPa |
| 95°F35.0°C | 296 psig2,044 kPa |
| 100°F37.8°C | 319 psig2,196 kPa |
| 105°F40.6°C | 342 psig2,357 kPa |
| 110°F43.3°C | 367 psig2,529 kPa |
| 115°F46.1°C | 392 psig2,705 kPa |

_caption / source:_ Standing pressure with the system off and equalized — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## Checking the charge with these pressures

Pressure alone does not confirm a charge. On the TXV systems R-410A uses, subcooling is the primary check — measure it with the subcooling calculator and use superheat as the cross-check. The pressure diagnostic tool walks a low-side and high-side reading to the likely cause.

## R-410A vs R-32 vs R-454B at the same conditions

At the same 95°F condition R-32 runs a little above R-410A and R-454B a little below. R-410A itself is about 2% lower on the low side and about 2% lower on the high side versus R-32. The gaps are small, but the three are not interchangeable in a given system.

| Refrigerant | Low side (psig / kPa) | High side (psig / kPa) |
| R-410A | 114–130 psig785–897 kPa | 367–419 psig2,529–2,892 kPa |
| R-32 | 116–133 psig802–917 kPa | 375–429 psig2,585–2,960 kPa |
| R-454B | 103–118 psig709–812 kPa | 346–396 psig2,385–2,728 kPa |

_caption / source:_ Side by side at 95°F outdoors — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## Readings that point to a problem

Match a suspect reading to the pattern below, then confirm with a calculator before you add or remove refrigerant.

A healthy R-410A system at 95°F outdoors reads about 114–130 psig on the low side and 367–419 psig on the high side.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What should R-410A pressures be at 80, 90 and 100°F?
The low side depends mainly on the indoor coil, so it moves far less than the high side. The high side runs about 296–342 psig at 80°F, 342–392 psig at 90°F, and 392–448 psig at 100°F outdoors. Read the full chart above for every 5°F step.

**FAQ Q:** Is 400 psi on the high side normal for R-410A?
It depends on how hot it is outside. Around 100°F outdoors the normal high-side band is about 392–448 psig, so 400 sits inside it; on a mild 80°F day the band is about 296–342 psig, so 400 would be high. Check your outdoor temperature against the chart before calling it a fault — a reading far above the row for your ambient is the real warning sign.

**FAQ Q:** What is R-410A standing pressure?
With the system off and equalized, R-410A settles to its saturation pressure at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize — about 202 psig at 70°F and 219 psig at 75°F. The standing-pressure table above gives it from 65 to 115°F.

**FAQ Q:** What should R-410A suction pressure be?
About 114–130 psig on a properly charged system with a 38–45°F indoor coil. It depends mainly on the indoor coil and moves far less than the high side. A suction well below 114–130 psig usually means low evaporator airflow, a restriction, or an undercharge; well above usually means an overcharge or a compressor problem. Check superheat before adjusting.

## How these numbers are calculated

Every pressure here is R-410A's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

For the low side we read a 38–45°F indoor evaporator coil: the low side depends mainly on the indoor coil (indoor temperature and airflow) and moves far less than the high side, which we take as a condenser running 15–25°F above the outdoor air. We use 95°F as the reference because it is the outdoor temperature in the AHRI 210/240 A2 rating test (95°F outdoors, 80°F/67°F indoors).

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-410A pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- Low suction pressure: causes
- R-32 vs R-410A
- R-410A vs R-454B

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-410A → /refrigerant/r-410a/
- superheat → /superheat-calculator/
- subcooling calculator → /subcooling-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-410A pressure–temperature chart → /refrigerant/r-410a/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- Low suction pressure: causes → /low-suction-pressure/
- R-32 vs R-410A → /r-32-vs-r-410a/
- R-410A vs R-454B → /r-410a-vs-r-454b/

---

## /what-pressure-should-r22/

- **<title>:** R-22 Operating Pressures: Running, Suction & Discharge PSI
- **meta description:** Normal R-22 running pressures at 95°F outdoors: about 66–76 psig suction and 226–260 psig discharge. Chart for 65–115°F, standing pressure and fault signs.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-22 Be?

Updated October 1, 2026

R-22 A1Non-flammable

You have gauges on an older home air conditioner and a suction and discharge number you cannot quite place. What the discharge should read depends above all on how hot it is outside.

Call a normal reading a fault and you start removing or adding refrigerant that was fine; miss a real fault and the compressor pays for it. Either mistake is expensive on a system you can no longer top off casually.

This page gives the suction and discharge to expect at each outdoor temperature, the standing pressure with the system off, and the direction a reading points when it is wrong.

A healthy R-22 system runs about 66–76 psig suction and 226–260 psig discharge at 95°F outdoors, with a 38–45°F indoor coil. Suction depends mainly on the indoor coil and moves far less than discharge, which climbs with the outdoor temperature. Read the chart below for your ambient before deciding a reading is high or low.

## R-22 running pressures by outdoor temperature

Find the outdoor temperature down the left column. Suction is the number to check against your indoor coil; discharge is what should track the weather.

| Outdoor | Low side (psig / kPa) | High side (psig / kPa) |
| 65°F18.3°C | 66–76 psig453–524 kPa | 144–168 psig990–1,161 kPa |
| 70°F21.1°C | 66–76 psig453–524 kPa | 156–182 psig1,073–1,253 kPa |
| 75°F23.9°C | 66–76 psig453–524 kPa | 168–196 psig1,161–1,351 kPa |
| 80°F26.7°C | 66–76 psig453–524 kPa | 182–211 psig1,253–1,453 kPa |
| 85°F29.4°C | 66–76 psig453–524 kPa | 196–226 psig1,351–1,561 kPa |
| 90°F32.2°C | 66–76 psig453–524 kPa | 211–243 psig1,453–1,674 kPa |
| 95°F35.0°C | 66–76 psig453–524 kPa | 226–260 psig1,561–1,792 kPa |
| 100°F37.8°C | 66–76 psig453–524 kPa | 243–278 psig1,674–1,917 kPa |
| 105°F40.6°C | 66–76 psig453–524 kPa | 260–297 psig1,792–2,047 kPa |
| 110°F43.3°C | 66–76 psig453–524 kPa | 278–317 psig1,917–2,183 kPa |
| 115°F46.1°C | 66–76 psig453–524 kPa | 297–337 psig2,047–2,326 kPa |

_caption / source:_ Operating pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

The low side is the same in every row because it follows the 38–45°F indoor coil, not the weather; only the high side climbs with outdoor temperature.

## R-22 discharge (head) pressure: what pushes it up

Discharge climbs with the outdoor temperature because the condenser has to reject heat at a saturation temperature above the outside air — about 226–260 psig at 95°F and higher on a hotter day. A discharge well above the row for your ambient almost always means a condenser problem first: a dirty coil, blocked airflow, or a slow fan. Overcharge and non-condensables (air left in after a poor evacuation) come next. Address airflow before you touch the charge.

## R-22 suction pressure tracks the indoor coil more than the weather

Suction depends mainly on the indoor coil — its temperature and airflow — so on a properly charged system it stays near 66–76 psig and moves far less than discharge. A suction below 66–76 psig points to weak evaporator airflow, a restriction, or an undercharge; a suction above 66–76 psig points to a high indoor load, an overcharge, or a compressor that is not pumping. Confirm with superheat before adjusting anything.

## Standing pressure with the system off

With the system off and the pressures equalized, R-22 settles to its saturation pressure at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize. This is the reading on a cold morning or before recovery.

| Off temperature | Standing (psig / kPa) |
| 65°F18.3°C | 111 psig767 kPa |
| 70°F21.1°C | 121 psig837 kPa |
| 75°F23.9°C | 132 psig912 kPa |
| 80°F26.7°C | 144 psig990 kPa |
| 85°F29.4°C | 156 psig1,073 kPa |
| 90°F32.2°C | 168 psig1,161 kPa |
| 95°F35.0°C | 182 psig1,253 kPa |
| 100°F37.8°C | 196 psig1,351 kPa |
| 105°F40.6°C | 211 psig1,453 kPa |
| 110°F43.3°C | 226 psig1,561 kPa |
| 115°F46.1°C | 243 psig1,674 kPa |

_caption / source:_ Standing pressure with the system off and equalized — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## Servicing an R-22 system today

US production and import of HCFC-22 ended on January 1, 2020 under the EPA Class II ozone-depleting-substance phaseout. Existing R-22 equipment stays legal to run and service, but any refrigerant you add now is reclaimed R-22 or pre-2020 stock — so recover carefully and fix leaks rather than topping off.

## Readings that point to a problem

Match a suspect reading to the pattern below, then confirm with a calculator before recovering or adding refrigerant.

A healthy R-22 system at 95°F outdoors reads about 66–76 psig on the low side and 226–260 psig on the high side.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What should R-22 pressures be at 70, 80, 90 and 100°F?
Suction depends mainly on the indoor coil, so it moves far less than discharge. Discharge runs about 156–182 psig at 70°F, 182–211 psig at 80°F, 211–243 psig at 90°F, and 243–278 psig at 100°F outdoors. Read the full chart above for every 5°F step.

**FAQ Q:** What is normal R-22 head pressure?
About 226–260 psig at 95°F outdoors, rising to roughly 243–278 psig near 100°F and falling on cooler days. Head pressure is set by the condensing temperature, which sits above the outdoor air, so compare your reading to the chart row for your ambient rather than to a single number.

**FAQ Q:** What is R-22 standing pressure?
With the system off and equalized, R-22 sits at its saturation pressure for the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize — about 121 psig at 70°F and 132 psig at 75°F. The standing-pressure table above gives it from 65 to 115°F.

**FAQ Q:** What should R-22 suction pressure be?
About 66–76 psig on a properly charged system with a 38–45°F indoor coil. It depends mainly on the indoor coil and moves far less than discharge. Below 66–76 psig suspect low evaporator airflow, a restriction, or an undercharge; above 66–76 psig suspect an overcharge or a compressor problem.

**FAQ Q:** Can you still recharge a system with R-22?
Yes, but only with reclaimed R-22 or pre-2020 stock — US production and import ended on January 1, 2020. There is no ban on running or servicing existing equipment, so repairing leaks and recovering the charge matters more than ever; casual topping off wastes a supply that no longer refills.

## How these numbers are calculated

Every pressure here is R-22's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

For the low side we read a 38–45°F indoor evaporator coil: the low side depends mainly on the indoor coil (indoor temperature and airflow) and moves far less than the high side, which we take as a condenser running 15–25°F above the outdoor air. We use 95°F as the reference because it is the outdoor temperature in the AHRI 210/240 A2 rating test (95°F outdoors, 80°F/67°F indoors).

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-22 pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- Low suction pressure: causes
- R-22 vs R-410A
- R-22 vs R-407C

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-22 → /refrigerant/r-22/
- superheat → /superheat-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-22 pressure–temperature chart → /refrigerant/r-22/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- Low suction pressure: causes → /low-suction-pressure/
- R-22 vs R-410A → /r-22-vs-r-410a/
- R-22 vs R-407C → /r-22-vs-r-407c/

---

## /what-pressure-should-r32/

- **<title>:** R-32 Running Pressure: Normal Operating Pressures (Cooling)
- **meta description:** R-32 running pressure in cooling: about 116–133 psig suction and 375–429 psig high side at 95°F (35°C) outdoors. Chart for 65–115°F in psig and kPa.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-32 Be?

Updated October 1, 2026

R-32 A2LMildly flammable

You are on an R-32 system — a newer split A/C or heat pump — with gauges connected and a suction and high-side number to judge. R-32 reads a little higher than the R-410A it replaces, so the familiar targets do not quite fit.

Read it wrong and you chase a charge that was never off, or miss airflow and condenser faults that a correct baseline would have caught. On an A2L system that also means opening the circuit you did not need to open.

This page gives the suction and high side to expect at each outdoor temperature in psig and kPa, the standing pressure at room temperature, and how R-32 lines up against R-410A.

R-32 runs about 116–133 psig suction and 375–429 psig on the high side at 95°F (35°C) outdoors, with a 38–45°F indoor coil. Suction depends mainly on the indoor coil and moves far less than the high side, which climbs with the outdoor temperature. R-32 sits a little above R-410A, so read the chart for your ambient.

## R-32 running pressure in cooling

Find the outdoor temperature down the left column. Every pressure is shown in psig with the kPa (gauge) equivalent beneath it.

| Outdoor | Low side (psig / kPa) | High side (psig / kPa) |
| 65°F18.3°C | 116–133 psig802–917 kPa | 241–281 psig1,665–1,940 kPa |
| 70°F21.1°C | 116–133 psig802–917 kPa | 261–303 psig1,799–2,088 kPa |
| 75°F23.9°C | 116–133 psig802–917 kPa | 281–326 psig1,940–2,245 kPa |
| 80°F26.7°C | 116–133 psig802–917 kPa | 303–350 psig2,088–2,411 kPa |
| 85°F29.4°C | 116–133 psig802–917 kPa | 326–375 psig2,245–2,585 kPa |
| 90°F32.2°C | 116–133 psig802–917 kPa | 350–401 psig2,411–2,768 kPa |
| 95°F35.0°C | 116–133 psig802–917 kPa | 375–429 psig2,585–2,960 kPa |
| 100°F37.8°C | 116–133 psig802–917 kPa | 401–459 psig2,768–3,162 kPa |
| 105°F40.6°C | 116–133 psig802–917 kPa | 429–489 psig2,960–3,375 kPa |
| 110°F43.3°C | 116–133 psig802–917 kPa | 459–522 psig3,162–3,598 kPa |
| 115°F46.1°C | 116–133 psig802–917 kPa | 489–556 psig3,375–3,832 kPa |

_caption / source:_ Operating pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

The low side is the same in every row because it follows the 38–45°F indoor coil, not the weather; only the high side climbs with outdoor temperature.

## R-32 suction pressure

Suction depends mainly on the indoor coil — its temperature and airflow — so on a properly charged R-32 system with a 38–45°F coil it stays near 116–133 psig and moves far less than the high side. Below 116–133 psig points to weak evaporator airflow, a restriction, or an undercharge; above 116–133 psig points to a high indoor load, an overcharge, or a compressor that is not pumping. Confirm with superheat before touching the charge.

## High-side pressure as the outdoor temperature climbs

The high side tracks the outdoor air because the condenser rejects heat above ambient — about 375–429 psig at 95°F and higher on a hotter day. A high side well above the chart row for your ambient points to a dirty or blocked condenser, an overcharge, or non-condensables. Because R-32 has a higher discharge temperature than R-410A, keep condenser airflow clean.

## Standing pressure at room temperature

With the system off and equalized, R-32 settles to its saturation pressure at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize. The 68°F (20°C) and 86°F (30°C) rows are the common room-temperature checkpoints.

| Off temperature | Standing (psig / kPa) |
| 65°F18.3°C | 189 psig1,306 kPa |
| 68°F20.0°C | 199 psig1,373 kPa |
| 70°F21.1°C | 206 psig1,419 kPa |
| 75°F23.9°C | 223 psig1,539 kPa |
| 80°F26.7°C | 241 psig1,665 kPa |
| 85°F29.4°C | 261 psig1,799 kPa |
| 86°F30.0°C | 265 psig1,826 kPa |
| 90°F32.2°C | 281 psig1,940 kPa |
| 95°F35.0°C | 303 psig2,088 kPa |
| 100°F37.8°C | 326 psig2,245 kPa |
| 105°F40.6°C | 350 psig2,411 kPa |
| 110°F43.3°C | 375 psig2,585 kPa |
| 115°F46.1°C | 401 psig2,768 kPa |

_caption / source:_ Standing pressure with the system off and equalized — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## R-32 vs R-410A pressures

At the same 95°F condition R-32 runs about 2% higher on the low side and about 2% higher on the high side versus R-410A. The gap is small, but the two are not interchangeable and R-32 is A2L (mildly flammable) where R-410A is A1.

| Refrigerant | Low side (psig / kPa) | High side (psig / kPa) |
| R-32 | 116–133 psig802–917 kPa | 375–429 psig2,585–2,960 kPa |
| R-410A | 114–130 psig785–897 kPa | 367–419 psig2,529–2,892 kPa |

_caption / source:_ Side by side at 95°F outdoors — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## When R-32 readings are off

Match a suspect reading to the pattern below, then confirm with a calculator before you add or remove refrigerant.

A healthy R-32 system at 95°F outdoors reads about 116–133 psig on the low side and 375–429 psig on the high side.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What pressure should R-32 run at in cooling?
About 116–133 psig suction and 375–429 psig on the high side at 95°F (35°C) outdoors with a 38–45°F indoor coil. Suction depends mainly on the indoor coil and moves far less than the high side, which climbs with the outdoor temperature. Read the chart above for your ambient.

**FAQ Q:** What is R-32 suction pressure in bar?
About 8.0–9.2 bar (gauge) at 95°F outdoors — the same band as 116–133 psig or 802–917 kPa (gauge). Suction depends mainly on the indoor coil, so it holds near this range and moves far less than the high side.

**FAQ Q:** What is R-32 standing pressure at 20°C and 30°C?
About 199 psig at 68°F (20°C) and 265 psig at 86°F (30°C) with the system off and equalized. R-32 is a single-component refrigerant, so standing pressure is its saturation pressure at the temperature of the coolest part of the system; the table above gives it from 65 to 115°F.

**FAQ Q:** What is R-32 high-side pressure at 35°C (95°F)?
About 375–429 psig at 95°F (35°C) outdoors on a healthy system. It rises to roughly 401–459 psig near 100°F and falls on cooler days, because the condensing temperature sits above the outdoor air. Compare your reading to the chart row for your ambient.

## How these numbers are calculated

Every pressure here is R-32's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

For the low side we read a 38–45°F indoor evaporator coil: the low side depends mainly on the indoor coil (indoor temperature and airflow) and moves far less than the high side, which we take as a condenser running 15–25°F above the outdoor air. We use 95°F as the reference because it is the outdoor temperature in the AHRI 210/240 A2 rating test (95°F outdoors, 80°F/67°F indoors).

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-32 pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- R-32 vs R-410A
- R-32 vs R-454B

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-32 → /refrigerant/r-32/
- superheat → /superheat-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-32 pressure–temperature chart → /refrigerant/r-32/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- R-32 vs R-410A → /r-32-vs-r-410a/
- R-32 vs R-454B → /r-32-vs-r-454b/

---

## /what-pressure-should-r454b/

- **<title>:** R-454B Operating Pressures: Normal High & Low Side Chart
- **meta description:** R-454B operating pressures at 95°F outdoors: about 103–118 psig low side and 346–396 psig high side. Chart for 65–115°F, side by side with R-410A.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-454B Be?

Updated October 1, 2026

R-454B A2LMildly flammable

You are on an R-454B system — one of the A2L refrigerants now replacing R-410A in new equipment — with gauges connected and a reading to judge. R-454B runs close to R-410A, which is exactly why a small offset can confuse.

Read it against R-410A memory and you may add or remove refrigerant chasing a difference that is just the fluid. On an A2L system you also do not want to open the circuit unless you have to.

This page gives the low and high side to expect at each outdoor temperature, the same numbers laid next to R-410A, and the standing pressure with the system off.

R-454B runs about 103–118 psig on the low side and 346–396 psig on the high side at 95°F outdoors, with a 38–45°F indoor coil. It sits a little below R-410A on both sides. The low side depends mainly on the indoor coil and moves far less than the high side, which climbs with the outdoor temperature.

## R-454B normal operating pressures

Find the outdoor temperature down the left column. The low side depends mainly on the indoor coil; the high side is what tracks the weather.

| Outdoor | Low side (psig / kPa) | High side (psig / kPa) |
| 65°F18.3°C | 103–118 psig709–812 kPa | 223–260 psig1,540–1,793 kPa |
| 70°F21.1°C | 103–118 psig709–812 kPa | 241–280 psig1,663–1,930 kPa |
| 75°F23.9°C | 103–118 psig709–812 kPa | 260–301 psig1,793–2,074 kPa |
| 80°F26.7°C | 103–118 psig709–812 kPa | 280–323 psig1,930–2,225 kPa |
| 85°F29.4°C | 103–118 psig709–812 kPa | 301–346 psig2,074–2,385 kPa |
| 90°F32.2°C | 103–118 psig709–812 kPa | 323–370 psig2,225–2,552 kPa |
| 95°F35.0°C | 103–118 psig709–812 kPa | 346–396 psig2,385–2,728 kPa |
| 100°F37.8°C | 103–118 psig709–812 kPa | 370–422 psig2,552–2,912 kPa |
| 105°F40.6°C | 103–118 psig709–812 kPa | 396–450 psig2,728–3,106 kPa |
| 110°F43.3°C | 103–118 psig709–812 kPa | — psig— kPa |
| 115°F46.1°C | 103–118 psig709–812 kPa | — psig— kPa |

_caption / source:_ Operating pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.— outside the calculated range

The low side is the same in every row because it follows the 38–45°F indoor coil, not the weather; only the high side climbs with outdoor temperature.

## R-454B vs R-410A running pressures, 65–115°F

R-454B reads a little below R-410A at every outdoor temperature — about 10% lower on the low side and about 6% lower on the high side at the 95°F condition. The offset is small and consistent across the outdoor range.

| Outdoor | R-454B high (psig / kPa) | R-410A high (psig / kPa) |
| 65°F18.3°C | 223–260 psig1,540–1,793 kPa | 237–275 psig1,631–1,899 kPa |
| 70°F21.1°C | 241–280 psig1,663–1,930 kPa | 255–296 psig1,761–2,044 kPa |
| 75°F23.9°C | 260–301 psig1,793–2,074 kPa | 275–319 psig1,899–2,196 kPa |
| 80°F26.7°C | 280–323 psig1,930–2,225 kPa | 296–342 psig2,044–2,357 kPa |
| 85°F29.4°C | 301–346 psig2,074–2,385 kPa | 319–367 psig2,196–2,529 kPa |
| 90°F32.2°C | 323–370 psig2,225–2,552 kPa | 342–392 psig2,357–2,705 kPa |
| 95°F35.0°C | 346–396 psig2,385–2,728 kPa | 367–419 psig2,529–2,892 kPa |
| 100°F37.8°C | 370–422 psig2,552–2,912 kPa | 392–448 psig2,705–3,088 kPa |
| 105°F40.6°C | 396–450 psig2,728–3,106 kPa | 419–478 psig2,892–3,295 kPa |
| 110°F43.3°C | — psig— kPa | 448–509 psig3,088–3,512 kPa |
| 115°F46.1°C | — psig— kPa | 478–543 psig3,295–3,740 kPa |

_caption / source:_ R-454B vs R-410A high side by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.— outside the calculated range

Low side (following a 38–45°F indoor coil): R-454B 103–118 psig vs R-410A 114–130 psig.

## Suction pressure and R-454B's small glide (read dew for suction)

R-454B is a zeotropic blend with a small glide, so suction is read on the dew curve — that is the number on this page and the one to use for superheat. On a properly charged system with a 38–45°F coil the low side holds near 103–118 psig and moves far less than the high side. Below 103–118 psig points to weak airflow, a restriction, or an undercharge; above it points to an overcharge or a compressor problem. Use the superheat calculator on the dew value.

## Standing pressure

With the system off and equalized, R-454B settles across its dew-to-bubble range at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize. The small spread is the glide; read the dew end for a suction comparison.

| Off temperature | Standing (dew–bubble, psig / kPa) |
| 65°F18.3°C | 168–175 psig1,161–1,209 kPa |
| 70°F21.1°C | 183–191 psig1,263–1,313 kPa |
| 75°F23.9°C | 199–206 psig1,370–1,424 kPa |
| 80°F26.7°C | 215–223 psig1,483–1,540 kPa |
| 85°F29.4°C | 233–241 psig1,604–1,663 kPa |
| 90°F32.2°C | 251–260 psig1,730–1,793 kPa |
| 95°F35.0°C | 270–280 psig1,864–1,930 kPa |
| 100°F37.8°C | 291–301 psig2,005–2,074 kPa |
| 105°F40.6°C | 312–323 psig2,154–2,225 kPa |
| 110°F43.3°C | 335–346 psig2,311–2,385 kPa |
| 115°F46.1°C | 359–370 psig2,476–2,552 kPa |

_caption / source:_ Standing pressure with the system off and equalized — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## Checking the charge

Pressure alone does not confirm a charge. On the TXV systems R-454B uses, subcooling is the primary check — measure it with the subcooling calculator and use superheat on the dew value as the cross-check. The pressure diagnostic tool turns a low/high reading into a likely cause.

## R-454B readings that point to a problem

Match a suspect reading to the pattern below, then confirm with a calculator before you add or remove refrigerant.

A healthy R-454B system at 95°F outdoors reads about 103–118 psig on the low side and 346–396 psig on the high side.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What pressures does R-454B run at?
About 103–118 psig on the low side and 346–396 psig on the high side at 95°F outdoors with a 38–45°F indoor coil. The low side depends mainly on the indoor coil and moves far less than the high side, which climbs with the outdoor temperature. Read the chart above for your ambient.

**FAQ Q:** Does R-454B run at lower pressure than R-410A?
Slightly, yes. At the 95°F condition R-454B is about 10% lower on the low side and about 6% lower on the high side versus R-410A. The gap is small and consistent across the outdoor range.

**FAQ Q:** What is the R-454B low side at 100°F outdoors?
The low side depends mainly on the indoor coil, so it stays near 103–118 psig whether it is 100°F outside or milder — it is the high side that climbs, to about 370–422 psig at 100°F outdoors. A low side far from 103–118 psig points to an airflow, charge, or restriction problem rather than the weather.

**FAQ Q:** What is R-454B standing pressure?
With the system off and equalized, R-454B sits across a narrow dew-to-bubble range — about 183–191 psig at 70°F and 199–206 psig at 75°F. The standing-pressure table above gives it from 65 to 115°F. The small spread is the blend's glide.

## How these numbers are calculated

Every pressure here is R-454B's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

For the low side we read a 38–45°F indoor evaporator coil: the low side depends mainly on the indoor coil (indoor temperature and airflow) and moves far less than the high side, which we take as a condenser running 15–25°F above the outdoor air. We use 95°F as the reference because it is the outdoor temperature in the AHRI 210/240 A2 rating test (95°F outdoors, 80°F/67°F indoors).

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-454B pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- R-410A vs R-454B
- R-32 vs R-454B

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-454B → /refrigerant/r-454b/
- superheat calculator → /superheat-calculator/
- subcooling calculator → /subcooling-calculator/
- superheat → /superheat-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-454B pressure–temperature chart → /refrigerant/r-454b/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- R-410A vs R-454B → /r-410a-vs-r-454b/
- R-32 vs R-454B → /r-32-vs-r-454b/

---

## /what-pressure-should-r407c/

- **<title>:** R-407C Suction & Discharge Pressure Chart (Running PSI)
- **meta description:** R-407C suction and discharge pressure at 95°F outdoors: about 60–71 psig (4.2–4.9 bar) suction and 260–299 psig discharge. Chart for 65–115°F.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-407C Be?

Updated October 1, 2026

R-407C A1Non-flammable

You are on an R-407C system — an R-22 replacement found in retrofits and light-commercial AC — with gauges connected and two saturation temperatures printed on the dial. The glide is what makes R-407C confusing to read.

Read superheat off the wrong curve and you can be off by the whole glide, which is enough to condemn a good charge or clear a bad one. That mistake sends good refrigerant to a recovery tank or leaves a starving evaporator.

This page gives the suction and discharge to expect at each outdoor temperature in psig, bar and kPa, explains which curve to read for which job, and gives the standing range.

R-407C runs about 60–71 psig (4.2–4.9 bar) suction and 260–299 psig discharge at 95°F outdoors, with a 38–45°F indoor coil. At the same conditions that is about 7–8% lower on suction and about 15% higher on discharge than R-22. Because it glides, read suction on the dew curve and the liquid line on the bubble curve.

## R-407C suction and discharge pressure chart

Find the outdoor temperature down the left column. Suction is read on the dew curve; discharge tracks the weather. Bar values are in the section below to keep this chart readable on a phone.

| Outdoor | Low side (psig / kPa) | High side (psig / kPa) |
| 65°F18.3°C | 60–71 psig416–488 kPa | 166–194 psig1,143–1,338 kPa |
| 70°F21.1°C | 60–71 psig416–488 kPa | 180–209 psig1,238–1,444 kPa |
| 75°F23.9°C | 60–71 psig416–488 kPa | 194–225 psig1,338–1,555 kPa |
| 80°F26.7°C | 60–71 psig416–488 kPa | 209–242 psig1,444–1,672 kPa |
| 85°F29.4°C | 60–71 psig416–488 kPa | 225–260 psig1,555–1,794 kPa |
| 90°F32.2°C | 60–71 psig416–488 kPa | 242–279 psig1,672–1,923 kPa |
| 95°F35.0°C | 60–71 psig416–488 kPa | 260–299 psig1,794–2,059 kPa |
| 100°F37.8°C | 60–71 psig416–488 kPa | 279–319 psig1,923–2,201 kPa |
| 105°F40.6°C | 60–71 psig416–488 kPa | 299–341 psig2,059–2,349 kPa |
| 110°F43.3°C | 60–71 psig416–488 kPa | 319–364 psig2,201–2,508 kPa |
| 115°F46.1°C | 60–71 psig416–488 kPa | 341–387 psig2,349–2,668 kPa |

_caption / source:_ Operating pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

The low side is the same in every row because it follows the 38–45°F indoor coil, not the weather; only the high side climbs with outdoor temperature.

## Why R-407C needs two temperatures: glide (dew for suction, bubble for the liquid line)

R-407C is a zeotropic blend, so a single pressure has two saturation temperatures — a lower dew point (saturated vapor) and a higher bubble point (saturated liquid). The gap between them is the glide, several degrees across the working range. Use the dew curve for suction and superheat; use the bubble curve for the liquid line and subcooling. Reading the wrong curve is the classic R-407C service error.

## Running pressure in bar and kPa

At 95°F outdoors the low side is about 60–71 psig, which is 4.2–4.9 bar (gauge) or 416–488 kPa (gauge); the high side is about 260–299 psig, which is 17.9–20.6 bar (gauge) or 1,794–2,059 kPa (gauge). The chart above lists psig with kPa for every 5°F step; multiply psig by 0.0689 for bar.

## Standing pressure is a range, not one number

With the system off and equalized, R-407C does not settle to one pressure — it sits across a dew-to-bubble range at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize. The spread is the glide, so treat standing pressure as a band, not a single target.

| Off temperature | Standing (dew–bubble, psig / kPa) |
| 65°F18.3°C | 107–129 psig736–889 kPa |
| 70°F21.1°C | 117–141 psig809–969 kPa |
| 75°F23.9°C | 129–153 psig886–1,054 kPa |
| 80°F26.7°C | 141–166 psig969–1,143 kPa |
| 85°F29.4°C | 153–180 psig1,056–1,238 kPa |
| 90°F32.2°C | 167–194 psig1,149–1,338 kPa |
| 95°F35.0°C | 181–209 psig1,248–1,444 kPa |
| 100°F37.8°C | 196–225 psig1,352–1,555 kPa |
| 105°F40.6°C | 212–242 psig1,463–1,672 kPa |
| 110°F43.3°C | 229–260 psig1,579–1,794 kPa |
| 115°F46.1°C | 247–279 psig1,702–1,923 kPa |

_caption / source:_ Standing pressure with the system off and equalized — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## If the low side reads 28 psig

At 28 psig on the low side, R-407C's dew (saturated-vapor) temperature is about 10°F and its bubble (saturated-liquid) temperature about −2°F. Subtract the dew temperature from your suction-line temperature for superheat; do not use the bubble temperature there or you will read the glide as extra superheat.

## Off readings on an R-407C system

Match a suspect reading to the pattern below — reading superheat and subcooling on the dew and bubble curves respectively — then confirm with a calculator before you add or remove refrigerant.

A healthy R-407C system at 95°F outdoors reads about 60–71 psig on the low side and 260–299 psig on the high side.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What are normal R-407C suction and discharge pressures?
About 60–71 psig suction and 260–299 psig discharge at 95°F outdoors with a 38–45°F indoor coil. Suction depends mainly on the indoor coil and moves far less than discharge, which climbs with the outdoor temperature. Read the chart above for your ambient, and read suction on the dew curve.

**FAQ Q:** What is R-407C running pressure in bar?
About 4.2–4.9 bar (gauge) on the low side and 17.9–20.6 bar (gauge) on the high side at 95°F outdoors — the same as 60–71 psig and 260–299 psig. To convert any reading, multiply psig by 0.0689 to get bar (gauge).

**FAQ Q:** If the R-407C low side reads 28 psig, what is the evaporating temperature?
At 28 psig the dew (saturated-vapor) temperature is about 10°F and the bubble (saturated-liquid) temperature about −2°F. Use the dew value — about 10°F — as the evaporating temperature for superheat; the gap between the two is R-407C's glide.

**FAQ Q:** Why do R-407C gauges show two temperatures?
Because R-407C is a zeotropic blend that evaporates and condenses across a temperature range, not at one point. Every pressure has a lower dew temperature and a higher bubble temperature. Read the dew scale for suction and superheat, and the bubble scale for the liquid line and subcooling.

## How these numbers are calculated

Every pressure here is R-407C's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

For the low side we read a 38–45°F indoor evaporator coil: the low side depends mainly on the indoor coil (indoor temperature and airflow) and moves far less than the high side, which we take as a condenser running 15–25°F above the outdoor air. We use 95°F as the reference because it is the outdoor temperature in the AHRI 210/240 A2 rating test (95°F outdoors, 80°F/67°F indoors).

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-407C pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- R-22 vs R-407C
- R-407C vs R-410A

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-407C → /refrigerant/r-407c/
- superheat → /superheat-calculator/
- subcooling → /subcooling-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-407C pressure–temperature chart → /refrigerant/r-407c/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- R-22 vs R-407C → /r-22-vs-r-407c/
- R-407C vs R-410A → /r-407c-vs-r-410a/

---

## /what-pressure-should-r404a/

- **<title>:** R-404A Suction & Discharge Pressure: Freezer & Cooler Chart
- **meta description:** R-404A suction pressure: about 14–18 psig at a −20°F freezer coil and 58–66 psig at a 25°F cooler coil; discharge 273–333 psig at 95°F outdoors.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-404A Be?

Updated October 1, 2026

R-404A A1Non-flammable

You are on a commercial refrigeration rack or a walk-in — a cooler or a freezer — with gauges connected and a suction number that only makes sense once you know the box temperature it is holding.

Judge freezer suction against cooler numbers and you will call a healthy box low, or miss a real starve; on refrigerated product, a wrong call spoils a load, not just a service call.

This page separates suction by application — walk-in cooler versus walk-in freezer, at the AHRI walk-in coil temperatures — and gives discharge by outdoor temperature.

R-404A suction is about 14–18 psig at a −20°F walk-in freezer coil and 58–66 psig at a 25°F cooler coil, with discharge around 273–333 psig at 95°F outdoors. Suction is set by the box temperature, not the weather; discharge tracks the outdoor air. Match your reading to the application and ambient in the tables below.

## R-404A suction pressure: walk-in freezer vs cooler

Suction is set by the evaporator coil temperature, which is set by the box. The AHRI 1250-2020 walk-in rating points — a 25°F cooler coil and a −20°F freezer coil — give the two suction bands you check most.

| Application | Suction (psig / kPa) |
| Walk-in cooler (25°F coil) | 58–66 psig400–458 kPa |
| Walk-in freezer (-20°F coil) | 14–18 psig96–125 kPa |

_caption / source:_ Suction pressure by application (AHRI 1250-2020 walk-in coil temperatures) — AHRI 1250-2020, Tables 16 and 17

## Discharge (head) pressure by outdoor temperature

Discharge is set by the condenser, which rejects heat above the outdoor air, so it climbs with the ambient — the same on a cooler or a freezer. Find your outdoor temperature down the left column.

| Outdoor | Head (psig / kPa) |
| 65°F18.3°C | 175–220 psig1,209–1,518 kPa |
| 70°F21.1°C | 190–237 psig1,307–1,632 kPa |
| 75°F23.9°C | 204–254 psig1,410–1,753 kPa |
| 80°F26.7°C | 220–273 psig1,518–1,879 kPa |
| 85°F29.4°C | 237–292 psig1,632–2,012 kPa |
| 90°F32.2°C | 254–312 psig1,753–2,152 kPa |
| 95°F35.0°C | 273–333 psig1,879–2,298 kPa |
| 100°F37.8°C | 292–356 psig2,012–2,452 kPa |
| 105°F40.6°C | 312–379 psig2,152–2,614 kPa |
| 110°F43.3°C | 333–404 psig2,298–2,784 kPa |
| 115°F46.1°C | 356–430 psig2,452–2,962 kPa |

_caption / source:_ Head (discharge) pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## Reading a walk-in freezer: one worked example

Take a −20°F freezer coil at 95°F outdoors. Suction should read about 14–18 psig and discharge about 273–333 psig. To check superheat, look up the dew saturation temperature at your measured suction pressure and subtract it from the suction-line temperature; for subcooling, subtract the liquid-line temperature from the bubble saturation temperature at the discharge pressure. If suction is well below 14–18 psig with high superheat, suspect an undercharge, a restriction, or a frosted coil that needs a defrost.

## Superheat checks

R-404A has only a small glide, but still measure superheat on the dew curve and subcooling on the bubble curve. There is no single blanket target — follow the equipment or valve manufacturer's figure for the box and metering device. The superheat calculator and subcooling calculator do the saturation lookup for you from the measured pressure.

## Readings that point to a problem

These are refrigeration faults; match a suspect reading to the pattern below, then confirm with a calculator before adding refrigerant.

A healthy R-404A system at 95°F outdoors reads about 58–66 psig suction on a 25°F cooler coil, 14–18 psig on a −20°F freezer coil, and 273–333 psig head.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What should R-404A suction pressure be on a walk-in freezer?
About 14–18 psig at the AHRI −20°F freezer coil temperature. It is set by the box, not the weather: suction runs higher while a warm box pulls down and settles into this band once the box is at temperature. A suction well below 14–18 psig once the box is cold usually means an undercharge, a restriction, or a coil that needs defrost.

**FAQ Q:** What should R-404A pressures be on a walk-in cooler?
Suction about 58–66 psig at the AHRI 25°F cooler coil temperature, with discharge around 273–333 psig at 95°F outdoors. Cooler suction runs well above freezer suction because the box is warmer; match your reading to the application, not to a single number.

**FAQ Q:** What is normal R-404A discharge pressure?
About 273–333 psig at 95°F outdoors, rising on hotter days because the condensing temperature sits above the outdoor air. It is the same on a cooler or a freezer — discharge is set by the condenser and ambient, not the box. Read the discharge chart above for your outdoor temperature.

**FAQ Q:** What is R-404A running pressure at 95°F outdoors?
Discharge about 273–333 psig at 95°F outdoors; suction depends on the box — about 58–66 psig on a 25°F cooler coil and 14–18 psig on a −20°F freezer coil. Always pair the suction reading with the application temperature before judging it.

## How these numbers are calculated

Every pressure here is R-404A's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F; head is a condenser running 15–30°F above the outdoor air. We use 95°F as the reference because it is one of the AHRI 1250 outdoor rating temperatures for condensing units.

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-404A pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- Low suction pressure: causes
- R-404A vs R-449A

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-404A → /refrigerant/r-404a/
- AHRI 1250-2020, Tables 16 and 17 → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- superheat calculator → /superheat-calculator/
- subcooling calculator → /subcooling-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-404A pressure–temperature chart → /refrigerant/r-404a/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- Low suction pressure: causes → /low-suction-pressure/
- R-404A vs R-449A → /r-404a-vs-r-449a/

---

## /what-pressure-should-r449a/

- **<title>:** R-449A Suction & Operating Pressures: Cooler & Freezer
- **meta description:** R-449A suction pressure: about 8.1–11.6 psig at a −20°F freezer coil and 47–54 psig at a 25°F cooler coil; head 276–338 psig at 95°F outdoors.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-449A Be?

Updated October 1, 2026

R-449A A1Non-flammable

You are on an R-449A system — an R-404A replacement used in retrofits and new racks, sold as Chemours Opteon XP40 — with gauges connected and suction that looks low if you still have R-404A numbers in your head.

Compare R-449A suction to R-404A memory and you will over-add refrigerant on a box that was fine; on a rack full of product that is an expensive way to learn the fluid reads lower. (R-449A is not R-448A — Opteon XP40 is R-449A.)

This page gives R-449A suction by application at the AHRI walk-in coil temperatures, head pressure by outdoor temperature, and a direct comparison with R-404A on the same box.

R-449A suction is about 8.1–11.6 psig at a −20°F freezer coil and 47–54 psig at a 25°F cooler coil, with head around 276–338 psig at 95°F outdoors. On a retrofitted R-404A box it reads noticeably lower suction than R-404A, so compare to R-449A numbers, not to R-404A memory.

## R-449A suction pressure by application

Suction is set by the evaporator coil temperature. The AHRI 1250-2020 walk-in rating points — a 25°F cooler coil and a −20°F freezer coil — give the two suction bands you check most. Read suction on the dew curve; R-449A has real glide.

| Application | Suction (psig / kPa) |
| Walk-in cooler (25°F coil) | 47–54 psig322–374 kPa |
| Walk-in freezer (-20°F coil) | 8.1–11.6 psig56–80 kPa |

_caption / source:_ Suction pressure by application (AHRI 1250-2020 walk-in coil temperatures) — AHRI 1250-2020, Tables 16 and 17

## Head pressure by outdoor temperature

Head is set by the condenser and climbs with the outdoor air, the same on a cooler or a freezer. Find your outdoor temperature down the left column.

| Outdoor | Head (psig / kPa) |
| 65°F18.3°C | 178–223 psig1,224–1,539 kPa |
| 70°F21.1°C | 192–240 psig1,324–1,655 kPa |
| 75°F23.9°C | 207–258 psig1,428–1,777 kPa |
| 80°F26.7°C | 223–276 psig1,539–1,905 kPa |
| 85°F29.4°C | 240–296 psig1,655–2,040 kPa |
| 90°F32.2°C | 258–316 psig1,777–2,181 kPa |
| 95°F35.0°C | 276–338 psig1,905–2,328 kPa |
| 100°F37.8°C | 296–360 psig2,040–2,483 kPa |
| 105°F40.6°C | 316–384 psig2,181–2,645 kPa |
| 110°F43.3°C | 338–408 psig2,328–2,814 kPa |
| 115°F46.1°C | 360–434 psig2,483–2,991 kPa |

_caption / source:_ Head (discharge) pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## R-449A vs R-404A on the same box: glide and dew-point reading

On the same 25°F cooler coil, R-449A reads about 19% lower on suction versus R-404A and about 1% higher on the head — lower suction is normal, not an undercharge. R-449A also has real glide, so read suction on the dew curve and the liquid line on the bubble curve; using R-404A's near-azeotropic habits here misreads superheat by the glide.

| Refrigerant | Low side (psig / kPa) | High side (psig / kPa) |
| R-449A | 47–54 psig322–374 kPa | 276–338 psig1,905–2,328 kPa |
| R-404A | 58–66 psig400–458 kPa | 273–333 psig1,879–2,298 kPa |

_caption / source:_ Side by side at 95°F outdoors — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## R-449A readings that point to a problem

These are refrigeration faults; match a suspect reading to the pattern below, reading suction on the dew curve, then confirm with a calculator before adding refrigerant.

A healthy R-449A system at 95°F outdoors reads about 47–54 psig suction on a 25°F cooler coil, 8.1–11.6 psig on a −20°F freezer coil, and 276–338 psig head.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What should R-449A suction pressure be?
About 8.1–11.6 psig at a −20°F freezer coil and 47–54 psig at a 25°F cooler coil, read on the dew curve. Suction is set by the box temperature, not the weather, so pair the reading with the application before judging it. On a retrofit it will sit below the old R-404A numbers.

**FAQ Q:** What is normal R-449A head pressure?
About 276–338 psig at 95°F outdoors, rising on hotter days because the condensing temperature sits above the outdoor air. Head is set by the condenser and ambient, not the box, so it is the same on a cooler or a freezer. Read the head chart above for your outdoor temperature.

**FAQ Q:** Why does R-449A read lower suction than R-404A on the same box?
Because R-449A's saturation pressure is lower — about 19% lower at the cooler coil condition. On a retrofitted box that lower suction is expected and not an undercharge. Compare to the R-449A numbers above, and read superheat on the dew curve because R-449A glides where R-404A barely does.

## How these numbers are calculated

Every pressure here is R-449A's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F; head is a condenser running 15–30°F above the outdoor air. We use 95°F as the reference because it is one of the AHRI 1250 outdoor rating temperatures for condensing units.

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-449A pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- Low suction pressure: causes
- R-404A vs R-449A

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-449A → /refrigerant/r-449a/
- AHRI 1250-2020, Tables 16 and 17 → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-449A pressure–temperature chart → /refrigerant/r-449a/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- Low suction pressure: causes → /low-suction-pressure/
- R-404A vs R-449A → /r-404a-vs-r-449a/

---

## /what-pressure-should-r454c/

- **<title>:** R-454C Operating Pressures: Walk-In Cooler & Freezer PSI
- **meta description:** R-454C running pressures: about 5.7–8.8 psig suction at a −20°F freezer coil and 40–46 psig at a 25°F cooler coil; head 255–311 psig at 95°F outdoors.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-454C Be?

Updated October 1, 2026

R-454C A2LMildly flammable

You are on an R-454C system — a low-GWP A2L blend now going into new commercial refrigeration — with gauges connected and a big gap between the two saturation temperatures on the dial. That gap is the glide, and it is large.

Read superheat off the wrong curve on a blend that glides this much and you can be off by more than ten degrees — enough to flood or starve the evaporator while the gauge looks fine.

This page gives R-454C suction by application at the AHRI walk-in coil temperatures, head pressure by outdoor temperature, and the wide dew-to-bubble standing range.

R-454C suction is about 5.7–8.8 psig at a −20°F freezer coil and 40–46 psig at a 25°F cooler coil, with head around 255–311 psig at 95°F outdoors. It is a high-glide, low-GWP A2L blend, so read suction on the dew curve and treat standing pressure as a wide dew-to-bubble range.

## R-454C pressures for walk-in coolers and freezers

Suction is set by the evaporator coil temperature. The AHRI 1250-2020 walk-in rating points — a 25°F cooler coil and a −20°F freezer coil — give the two suction bands you check most. Read suction on the dew curve.

| Application | Suction (psig / kPa) |
| Walk-in cooler (25°F coil) | 40–46 psig273–319 kPa |
| Walk-in freezer (-20°F coil) | 5.7–8.8 psig39–61 kPa |

_caption / source:_ Suction pressure by application (AHRI 1250-2020 walk-in coil temperatures) — AHRI 1250-2020, Tables 16 and 17

## Head pressure by outdoor temperature

Head is set by the condenser and climbs with the outdoor air, the same on a cooler or a freezer. Find your outdoor temperature down the left column.

| Outdoor | Head (psig / kPa) |
| 65°F18.3°C | 166–207 psig1,141–1,429 kPa |
| 70°F21.1°C | 179–223 psig1,232–1,534 kPa |
| 75°F23.9°C | 193–239 psig1,328–1,645 kPa |
| 80°F26.7°C | 207–255 psig1,429–1,761 kPa |
| 85°F29.4°C | 223–273 psig1,534–1,883 kPa |
| 90°F32.2°C | 239–292 psig1,645–2,010 kPa |
| 95°F35.0°C | 255–311 psig1,761–2,143 kPa |
| 100°F37.8°C | 273–331 psig1,883–2,282 kPa |
| 105°F40.6°C | 292–352 psig2,010–2,427 kPa |
| 110°F43.3°C | 311–374 psig2,143–2,578 kPa |
| 115°F46.1°C | 331–397 psig2,282–2,736 kPa |

_caption / source:_ Head (discharge) pressure by outdoor temperature (65–115°F) — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## Reading gauges on a high-glide blend

R-454C evaporates and condenses across a wide temperature range, so every pressure has a lower dew temperature and a much higher bubble temperature. Use the dew curve for suction and superheat; use the bubble curve for the liquid line and subcooling. Because the glide is large, an A2L-rated manifold that shows both scales — or a calculator that does the lookup — saves you from reading the glide as superheat.

## Standing pressure: a wide dew-to-bubble range

With the system off and equalized, R-454C sits across a wide dew-to-bubble band at the temperature of the coolest part of the system (indoor or outdoor), once it has been off long enough to equalize — for example 108–137 psig at 68°F (20°C). Treat standing pressure as a range, not a single number; the spread is the glide.

| Off temperature | Standing (dew–bubble, psig / kPa) |
| 65°F18.3°C | 102–130 psig706–896 kPa |
| 70°F21.1°C | 112–141 psig773–973 kPa |
| 75°F23.9°C | 123–153 psig845–1,055 kPa |
| 80°F26.7°C | 134–166 psig922–1,141 kPa |
| 85°F29.4°C | 146–179 psig1,003–1,232 kPa |
| 90°F32.2°C | 158–193 psig1,089–1,328 kPa |
| 95°F35.0°C | 171–207 psig1,180–1,429 kPa |
| 100°F37.8°C | 185–223 psig1,277–1,534 kPa |
| 105°F40.6°C | 200–239 psig1,378–1,645 kPa |
| 110°F43.3°C | 216–255 psig1,486–1,761 kPa |
| 115°F46.1°C | 232–273 psig1,599–1,883 kPa |

_caption / source:_ Standing pressure with the system off and equalized — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

## When R-454C readings are off

These are refrigeration faults; match a suspect reading to the pattern below, reading suction on the dew curve, then confirm with a calculator before adding refrigerant.

A healthy R-454C system at 95°F outdoors reads about 40–46 psig suction on a 25°F cooler coil, 5.7–8.8 psig on a −20°F freezer coil, and 255–311 psig head.

| Fault | Suction | Head | Superheat | Subcooling | First thing to check |
| Likely undercharge | low | low | high | low | Find and fix the leak, then recharge by weight |
| Likely overcharge | high | high | low | high | Verify condenser airflow, then recover to target |
| Likely restriction or low evaporator airflow | low | normal–low | high | high | Check the filter-drier and evaporator airflow |
| Possible airflow or metering-device issue | high | low | low | low | Check the metering device and condenser airflow |

_caption / source:_ Suction, head, superheat and subcooling direction for each charge-and-system fault.

Confirm a reading before adjusting the charge: the pressure diagnostic tool, low suction pressure and high head pressure guides walk a reading to its cause.

## Frequently asked questions

**FAQ Q:** What pressures does R-454C run at in a walk-in freezer?
About 5.7–8.8 psig suction at the AHRI −20°F freezer coil temperature, read on the dew curve, with head near 255–311 psig at 95°F outdoors. Suction is set by the box, not the weather: it runs higher while a warm box pulls down and settles into this band once the box is at temperature. A reading well below it on a cold box points to an undercharge, a restriction, or a coil needing defrost.

**FAQ Q:** What is R-454C standing pressure?
A range, not one number — with the system off and equalized R-454C sits across its dew-to-bubble band, about 108–137 psig at 68°F (20°C). The standing-pressure table above gives the band from 65 to 115°F. The wide spread is R-454C's glide.

**FAQ Q:** What is R-454C saturation pressure at 20°C (68°F)?
About 108–137 psig at 68°F (20°C), given as a dew-to-bubble range because R-454C glides. The lower (dew) end is the saturated-vapor pressure; the higher (bubble) end is the saturated-liquid pressure. Use the dew end when comparing to a suction reading.

**FAQ Q:** What is R-454C discharge pressure?
About 255–311 psig at 95°F outdoors, rising on hotter days because the condensing temperature sits above the outdoor air. Head is set by the condenser and ambient, not the box, so it is the same on a cooler or a freezer. Read the head chart above for your outdoor temperature.

## How these numbers are calculated

Every pressure here is R-454C's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F; head is a condenser running 15–30°F above the outdoor air. We use 95°F as the reference because it is one of the AHRI 1250 outdoor rating temperatures for condensing units.

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-454C pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- Low suction pressure: causes
- R-454B vs R-454C

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-454C → /refrigerant/r-454c/
- AHRI 1250-2020, Tables 16 and 17 → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- superheat → /superheat-calculator/
- subcooling → /subcooling-calculator/
- pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- low suction pressure → /low-suction-pressure/
- high head pressure → /high-head-pressure-causes/
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-454C pressure–temperature chart → /refrigerant/r-454c/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- Low suction pressure: causes → /low-suction-pressure/
- R-454B vs R-454C → /r-454b-vs-r-454c/

---

## /what-pressure-should-r744/

- **<title>:** R-744 (CO₂) Pressures: Suction, High Side & Standstill
- **meta description:** R-744 (CO₂) suction runs about 420–462 psig at a 25°F cooler coil and 189–212 psig at a −20°F freezer coil; above 87.8°F the high side is transcritical.
- **JSON-LD dateModified:** 2026-10-01
- **visible Updated line:** Updated October 1, 2026

### Visible text (page order)

# What Pressure Should R-744 (CO₂) Be?

Updated October 1, 2026

R-744 A1Non-flammable

You are on a CO₂ system — a booster rack, a cascade low stage, or a transcritical gas cooler — and the gauges read several times higher than any HFC you have worked on. Nothing about the numbers is familiar.

Bring HFC instincts to CO₂ and you will misjudge both the equipment rating and the high side, which above the critical point is not a saturation pressure at all. At these pressures, that is a safety issue, not just a service one.

This page gives CO₂ suction for coolers and freezers, the subcritical high-side pressure, the critical point from the dataset, and standstill pressure — and it stops where the physics does, above the critical temperature.

R-744 (CO₂) suction runs about 420–462 psig at a 25°F cooler coil and 189–212 psig at a −20°F freezer coil — several times higher than an HFC. Below its 87.8°F critical temperature the high side is a saturation pressure; above it the system is transcritical and the high-pressure control valve, not a chart, sets the gas-cooler pressure.

## CO₂ suction pressure for coolers and freezers

Suction is set by the evaporator coil temperature, read on the dew curve at the AHRI 1250-2020 walk-in points — a 25°F cooler coil and a −20°F freezer coil. The pressures are high, but the logic is the same as any other refrigerant: the box sets suction, not the weather.

| Application | Suction (psig / kPa) |
| Walk-in cooler (25°F coil) | 420–462 psig2,898–3,183 kPa |
| Walk-in freezer (-20°F coil) | 189–212 psig1,300–1,464 kPa |

_caption / source:_ CO₂ suction pressure by application (AHRI 1250-2020 walk-in coil temperatures) — AHRI 1250-2020, Tables 16 and 17

## The high side below and above the critical point

Below the critical temperature CO₂ condenses, so the high side is a saturation (condensing) pressure — the table gives it from 40 to 85°F. As the condensing temperature approaches the critical point the pressure rises steeply.

| Condensing temperature | High side (psig / kPa) |
| 40°F4.4°C | 553 psig3,812 kPa |
| 45°F7.2°C | 594 psig4,099 kPa |
| 50°F10.0°C | 638 psig4,401 kPa |
| 55°F12.8°C | 684 psig4,719 kPa |
| 60°F15.6°C | 733 psig5,054 kPa |
| 65°F18.3°C | 784 psig5,407 kPa |
| 70°F21.1°C | 838 psig5,779 kPa |
| 75°F23.9°C | 895 psig6,170 kPa |
| 80°F26.7°C | 955 psig6,584 kPa |
| 85°F29.4°C | 1,018 psig7,021 kPa |

_caption / source:_ Subcritical high-side (condensing) pressure, 40–85°F — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

Critical point (from the dataset): 87.8°F / 1,055 psig. Above 87.8°Fthere is no saturation pressure — operation is transcritical and the high-pressure control valve, not a saturation temperature, sets the gas-cooler pressure. There is no single “normal” transcritical number.

## Standstill pressure

With the system off, CO₂ settles to its saturation pressure at the temperature of the coolest part of the system, once it has been off long enough to equalize — as long as that temperature is below the critical point. This is why CO₂ systems carry high standstill ratings and, on small systems, a relief path or a small holding unit.

| Off temperature | Standstill (psig / kPa) |
| 65°F18.3°C | 784 psig5,407 kPa |
| 70°F21.1°C | 838 psig5,779 kPa |
| 75°F23.9°C | 895 psig6,170 kPa |
| 80°F26.7°C | 955 psig6,584 kPa |
| 85°F29.4°C | 1,018 psig7,021 kPa |

_caption / source:_ Standstill (system off) saturation pressure, 65–85°F — Computed from the CoolProp 7.2.0 pressure–temperature dataset.

Above the critical temperature the fluid is supercritical, so there is no standstill saturation pressure to read.

## Frequently asked questions

**FAQ Q:** What is normal R-744 suction pressure?
About 420–462 psig at a 25°F cooler coil and 189–212 psig at a −20°F freezer coil, read on the dew curve. That is several times an HFC's suction, which is normal for CO₂ — pair the reading with the box temperature before judging it.

**FAQ Q:** What is CO₂ standstill pressure at 70°F?
About 838 psig — with the system off at 70°F, CO₂ sits at its 70°F saturation pressure. Standstill climbs quickly with temperature and only exists below the 87.8°F critical temperature; above that the fluid is supercritical and there is no standstill saturation pressure.

**FAQ Q:** Why can't a PT chart give the CO₂ high side above 87.8°F?
Because 87.8°F is CO₂'s critical temperature (1,055 psig). Above it there is no liquid–vapor boundary, so there is no saturation pressure to look up. The system runs transcritical and the high-pressure control valve sets the gas-cooler pressure for efficiency — there is no single "normal" number to read from a chart.

## How these numbers are calculated

Every pressure here is R-744's saturation pressure at the stated temperature, calculated with CoolProp 7.2.0. Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.

CO₂ suction uses the AHRI 1250-2020 walk-in coil temperatures (25°F cooler, −20°F freezer). Below the critical temperature the high side is a saturation (condensing) pressure; above it the system is transcritical and the high-pressure control valve sets the gas-cooler pressure.

Sources: CoolProp 7.2.0; AHRI 210/240-2023 (rating conditions) and AHRI 1250-2020 (walk-in ratings). Your equipment maker's charging chart or the unit data plate overrides these reference values for that specific system.

## Related

- R-744 (CO₂) pressure–temperature chart
- Superheat calculator
- Subcooling calculator
- Pressure diagnostic tool
- R-744 vs R-290

### Internal links (anchor → href)

- Home → /
- PT Charts & Tools → /pt-charts-tools-hub/
- R-744 → /refrigerant/r-744/
- AHRI 1250-2020, Tables 16 and 17 → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- rating conditions → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf
- walk-in ratings → https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf
- R-744 (CO₂) pressure–temperature chart → /refrigerant/r-744/
- Superheat calculator → /superheat-calculator/
- Subcooling calculator → /subcooling-calculator/
- Pressure diagnostic tool → /system-pressure-diagnostic-calculator/
- R-744 vs R-290 → /r-744-vs-r-290/

---

