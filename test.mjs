// Tests for the pure-logic block of index.html.
// Run: node test.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const m = html.match(/<script id="logic">([\s\S]*?)<\/script>/);
assert.ok(m, 'index.html contains a <script id="logic"> block');

const ctx = vm.createContext({});
vm.runInContext(m[1], ctx);
const { PROGRAM, thumb, exKey, lastFor, suggestTarget } = ctx;

// vm-context values have foreign prototypes; JSON round-trip before deep compares.
const plain = (v) => JSON.parse(JSON.stringify(v));

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log(`ok - ${name}`);
}

// ---- program data integrity ----------------------------------------------

test('three sessions A, B, C', () => {
  assert.deepEqual(plain(PROGRAM.sessions.map(s => s.id)), ['A', 'B', 'C']);
});

test('every exercise is well-formed', () => {
  const ids = new Set();
  for (const s of PROGRAM.sessions) {
    for (const ex of s.exercises) {
      assert.ok(ex.id && !ids.has(ex.id), `unique id (${ex.id})`);
      ids.add(ex.id);
      assert.ok(ex.name, `${ex.id} has a name`);
      assert.ok(ex.sets >= 2, `${ex.id} has >= 2 sets`);
      assert.ok(Array.isArray(ex.range) && ex.range[0] <= ex.range[1], `${ex.id} has a valid range`);
      assert.ok(typeof ex.unit === 'string', `${ex.id} has a unit`);
      assert.ok(ex.tags, `${ex.id} has purpose tags`);
      if (!ex.bodyweight) assert.ok(ex.inc === 2.5 || ex.inc === 5, `${ex.id} has a 2.5/5 kg increment`);
      const vids = ex.variants ? ex.variants.map(v => v.video) : [ex.video];
      for (const v of vids) assert.match(v, /^[\w-]{11}$/, `${ex.id} video id`);
      if (ex.variants) for (const v of ex.variants) assert.ok(v.id && v.name, `${ex.id} variant shape`);
    }
  }
});

test('all 23 verified video ids from the program draft are present', () => {
  const expected = new Set([
    'MeIiIdhvXT4', 'v-mQm_droHg', 'bEv6CCg2BC8', 'vcBig73ojpE', 'vmX58YYK3-8',
    'YYWhkctnP2o', 'HBYGeyb4sSM', 'VAPN4CmUWqk', 'S1QbyYZaXIg', 'PWJU5grrh4Y',
    '2yjwXTZQDDI', 'CAwf7n6Luuc', 'S_uZP4UH6J0', 'GFqfIInCuUQ', '_oyxCn2iSjU',
    'hChjZQhX1Ls', 'oFtfkSElE0s', 'K5n2vg3oZa4', 'tqECKZxlCKE', 'Jfp4b5Olc7A',
    'GzmlxvSFE7A', 'pgrWjBfaFe8', 'G93cNF8gl4o',
  ]);
  const found = new Set();
  for (const s of PROGRAM.sessions)
    for (const ex of s.exercises)
      for (const v of ex.variants ? ex.variants.map(x => x.video) : [ex.video]) found.add(v);
  for (const x of PROGRAM.extras || []) found.add(x.video);
  assert.deepEqual(plain([...found].sort()), [...expected].sort());
});

test('thumb builds a ytimg url', () => {
  assert.equal(thumb('abcDEF123-_'), 'https://i.ytimg.com/vi/abcDEF123-_/mqdefault.jpg');
});

// ---- history lookup --------------------------------------------------------

const squat = PROGRAM.sessions[0].exercises[0]; // variants, lower body, inc 5
const bench = PROGRAM.sessions[0].exercises.find(e => e.id === 'a2'); // inc 2.5
const plank = PROGRAM.sessions[0].exercises.find(e => e.bodyweight);

test('exKey separates variants, passes plain exercises through', () => {
  assert.equal(exKey(bench), 'a2');
  assert.equal(exKey(squat, 'goblet'), `${squat.id}:goblet`);
});

test('lastFor finds the most recent entry for a key', () => {
  const history = [
    { ex: { 'a1:goblet': { sets: [{ kg: 20, reps: 10 }] } } },
    { ex: { a2: { sets: [{ kg: 60, reps: 8 }] } } },
    { ex: { 'a1:goblet': { sets: [{ kg: 24, reps: 8 }] } } },
  ];
  assert.equal(lastFor(history, 'a1:goblet').sets[0].kg, 24);
  assert.equal(lastFor(history, 'a2').sets[0].kg, 60);
  assert.equal(lastFor(history, 'a1:front'), null);
});

// ---- double progression ----------------------------------------------------

test('no history -> no target', () => {
  assert.equal(suggestTarget(bench, null), null);
  assert.equal(suggestTarget(bench, { sets: [] }), null);
});

test('all sets at top of range -> +2.5 kg upper', () => {
  const t = suggestTarget(bench, { sets: [{ kg: 60, reps: 10 }, { kg: 60, reps: 10 }, { kg: 60, reps: 11 }] });
  assert.deepEqual(plain(t), { kg: 62.5, reps: bench.range[0], up: true });
});

test('all sets at top of range -> +5 kg lower', () => {
  const t = suggestTarget(squat, { sets: [{ kg: 40, reps: 10 }, { kg: 40, reps: 10 }, { kg: 40, reps: 10 }] });
  assert.deepEqual(plain(t), { kg: 45, reps: squat.range[0], up: true });
});

test('fewer sets than prescribed -> no increase even if all logged sets hit top', () => {
  const t = suggestTarget(bench, { sets: [{ kg: 60, reps: 10 }] });
  assert.deepEqual(plain(t), { kg: 60, reps: bench.range[1], up: false });
});

test('not all sets at top -> repeat the weight, chase top of range', () => {
  const t = suggestTarget(bench, { sets: [{ kg: 60, reps: 10 }, { kg: 60, reps: 9 }, { kg: 60, reps: 8 }] });
  assert.deepEqual(plain(t), { kg: 60, reps: bench.range[1], up: false });
});

test('mixed loads use the heaviest set as the base', () => {
  const t = suggestTarget(bench, { sets: [{ kg: 55, reps: 10 }, { kg: 60, reps: 8 }] });
  assert.deepEqual(plain(t), { kg: 60, reps: bench.range[1], up: false });
});

test('bodyweight/timed work gets no kg target', () => {
  assert.equal(suggestTarget(plank, { sets: [{ reps: 30 }, { reps: 30 }, { reps: 30 }] }), null);
});

test('sets without reps are ignored', () => {
  assert.equal(suggestTarget(bench, { sets: [{ kg: 60 }] }), null);
});

console.log(`\n${passed} tests passed`);
