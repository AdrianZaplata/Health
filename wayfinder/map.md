# Map: Back pain, posture, and getting strong

Label: `wayfinder:map`

## Destination

A vetted, week-1-executable plan for Adrian covering five parts: (1) a professional assessment done and its findings folded in, (2) a rehab/mobility protocol for the back and hips, (3) a gym strength program, (4) nutrition targets for building muscle, and (5) sleep and daily-habit changes. Done when each part is decided sharply enough that Adrian can start executing without further decisions.

## Notes

- Domain: personal health planning, not code. HITL tickets use `/grilling` and `/domain-modeling`; research tickets use `/research` subagents against primary sources (clinical guidelines, position stands, peer-reviewed work).
- **Standing safety framing**: Adrian's self-diagnosis (lateral pelvic tilt, pelvic torsion, gluteal amnesia, shortened hip flexors from 7+ years of right-over-left leg crossing and leaning left) is a *hypothesis*, not an established fact. Two findings make professional verification non-negotiable before heavy loading: 2–3 acute episodes severe enough to prevent movement for days, and pain in the left lower back when tightening the abdominal muscles. No ticket may resolve into a plan that skips or pre-empts the professional assessment. The agent is not a medical professional and never stands in for one.
- Standing preference: evidence-based over influencer-based. Where guidelines and the self-diagnosis narrative conflict, the map records the conflict rather than papering over it.
- Research assets live in `wayfinder/research/` on the working branch (in-repo tracker, so no throwaway branches).

## Decisions so far

<!-- one line per closed ticket: gist + link -->

- [Research: eating for muscle gain — evidence-based targets](tickets/004-research-muscle-gain-nutrition.md) — ~1.6–2.2 g/kg protein, small (+10–20%) surplus calibrated by weight trend, whole-food pattern + creatine as the only strong supplement; sleep restriction demonstrably blunts muscle growth and lowers pain thresholds, so ≥7 h/night is the top recovery lever.

## Not yet specified

- **Progression and periodization beyond the first training block** — what week 9+ looks like depends on how the first block and the rehab protocol go; can't be phrased sharply until [Draft the gym program](tickets/007-draft-gym-program.md) resolves.
- **Tracking and review cadence** — pain diary, strength numbers, body measurements, re-assessment intervals. Which signals matter depends on what the assessment finds and what the program contains.
- **Flare-up / deload protocol** — what to do when (not if) a bad week hits. Hangs on the assessment's findings about triggers and on the rehab protocol's shape.
- **Role of ongoing physio / manual therapy** — one-off assessment vs. recurring appointments; depends on what the professional recommends and on budget (surfaces in the constraints grilling).
- **Supplements** — whether anything beyond food basics (e.g. creatine, vitamin D) earns a place; downstream of the nutrition plan.

## Out of scope

- **Medical diagnosis and treatment** — verifying or refuting the pelvic-tilt/torsion hypothesis, and treating whatever is actually there, belongs to the professional Adrian sees; this map only routes to that assessment and builds around its output.
- **Competition-level physique or sport-specific training** — the goal is health, pain-free posture, strength, and looking good; anything beyond that is a different effort with a different destination.
