# Block One — workout logger

Single-page workout logger for the Block One gym program
([issue #15](https://github.com/AdrianZaplata/Health/issues/15), program:
[`wayfinder/research/007-program-draft.md`](https://github.com/AdrianZaplata/Health/blob/main/wayfinder/research/007-program-draft.md)).

- `index.html` — the whole app: sessions A/B/C, per-set kg/reps logging with
  autosave to `localStorage` (key `blockone.v1`), last-session comparison,
  double-progression targets, history + JSON export. No build step, no
  dependencies; only external requests are YouTube thumbnails (`i.ytimg.com`).
- `test.mjs` — unit tests for the pure-logic block (`<script id="logic">`):
  program data integrity, all 23 video ids, double-progression rule.
- `smoke.mjs` — headless UI smoke test (stub DOM, real event handlers).

Run tests: `node test.mjs && node smoke.mjs`

This branch is the GitHub Pages source; it deliberately contains nothing else
from the repo (the repo is private, the published site is not).
