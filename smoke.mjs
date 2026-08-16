// Headless smoke test of the UI script: boots the app with a stub DOM,
// clicks through home -> session A -> log sets -> finish -> history.
// Run: node smoke.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: id="logic")?>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.equal(scripts.length, 2, 'two script blocks');

const listeners = {};
const appEl = {
  innerHTML: '',
  addEventListener: (type, fn) => { listeners[type] = fn; },
};
let saved = null;
const ctx = vm.createContext({
  document: { getElementById: () => appEl, createElement: () => ({ click() {}, dataset: {} }) },
  localStorage: {
    getItem: () => saved,
    setItem: (k, v) => { saved = v; },
  },
  confirm: () => true,
  Date,
  Math,
  JSON,
  console,
});
vm.runInContext(scripts[0], ctx);
vm.runInContext(scripts[1], ctx);

// initial render = home
assert.match(appEl.innerHTML, /Session A<\/b> — Squat focus/);
assert.match(appEl.innerHTML, /Not done yet/);
assert.match(appEl.innerHTML, /Sørensen self-test/);

// click "Session A"
function click(dataset, cardDataset) {
  const btn = { dataset, closest: (sel) => (sel === 'button' ? btn : { dataset: cardDataset || {} }) };
  listeners.click({ target: btn });
}
click({ act: 'open', id: 'A' });
assert.match(appEl.innerHTML, /Session A — Squat focus/);
assert.match(appEl.innerHTML, /Goblet squat/, 'default squat variant pill');
assert.match(appEl.innerHTML, /i\.ytimg\.com\/vi\/MeIiIdhvXT4\/mqdefault\.jpg/, 'thumbnail for goblet');
assert.match(appEl.innerHTML, /First time — find a working weight/);
assert.match(appEl.innerHTML, /\+ set/);

// switch squat variant to front
click({ act: 'variant', v: 'front' }, { ex: 'a1', key: 'a1:goblet' });
assert.match(appEl.innerHTML, /i\.ytimg\.com\/vi\/v-mQm_droHg\/mqdefault\.jpg/, 'thumbnail follows variant');

// type kg + reps into bench (a2), set 1 and 2
function input(key, i, f, value) {
  const inp = { dataset: { f, i: String(i) }, value: String(value), closest: () => ({ dataset: { key } }) };
  listeners.input({ target: inp });
}
input('a2', 0, 'kg', 60); input('a2', 0, 'reps', 10);
input('a2', 1, 'kg', 60); input('a2', 1, 'reps', 10);
input('a2', 2, 'kg', 60); input('a2', 2, 'reps', 10);
assert.ok(saved.includes('"kg":60'), 'autosaved to localStorage');

// finish the workout
click({ act: 'finish' });
const state = JSON.parse(saved);
assert.equal(state.active, null);
assert.equal(state.history.length, 1);
assert.equal(state.history[0].session, 'A');
assert.deepEqual(state.history[0].ex.a2.sets, [{ kg: 60, reps: 10 }, { kg: 60, reps: 10 }, { kg: 60, reps: 10 }]);
assert.match(appEl.innerHTML, /Last done today/);

// next session A shows the double-progression target for bench
click({ act: 'open', id: 'A' });
assert.match(appEl.innerHTML, /Target: <b>62\.5 kg<\/b> × 6\+/, 'bench target went up');
assert.match(appEl.innerHTML, /Last \(.*\): 60×10, 60×10, 60×10/);

// history view lists the workout
click({ act: 'home' });
click({ act: 'history' });
assert.match(appEl.innerHTML, /Session A/);
assert.match(appEl.innerHTML, /Barbell bench press: 60×10, 60×10, 60×10/);

console.log('smoke ok');
