import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newState,
  initialStateFromHash,
  createSession,
  progress,
  ARMS,
  EXERCISES,
  setValid,
  weeklySummary,
  monday,
  addDays,
  validateState,
  mergeState,
  previousExercise,
} from '../public/trident/core.mjs';
test('all five templates match the reviewed plan and deload preserves arm slots', () => {
  for (const [name, count] of Object.entries({
    upperA: 24,
    lowerA: 14,
    arms: 21,
    upperB: 24,
    lowerB: 14,
  })) {
    const s = createSession('2026-09-08', name);
    assert.equal(progress(s).total, count);
    const deload = createSession('2026-09-08', name, 7);
    assert.ok(progress(deload).total < count);
    if (name === 'upperA' || name === 'upperB' || name === 'arms') {
      assert.equal(s.exercises.filter((e) => ARMS.includes(e.id)).length, 12);
      assert.ok(s.exercises.filter((e) => ARMS.includes(e.id)).every((e) => e.sets.length === 1));
      assert.equal(deload.exercises.filter((e) => ARMS.includes(e.id)).length, 12);
    }
  }
});
test('bodyweight accepts zero external load; unilateral completion requires both sides', () => {
  const s = createSession('2026-09-08', 'upperA');
  const p = s.exercises.find((e) => e.id === 'pullup');
  p.basis = 'bodyweight';
  Object.assign(p.sets[0], { reps: '8', rir: '3', done: true });
  assert.ok(setValid(p.sets[0], p));
  const b = s.exercises.find((e) => e.id === 'bayesian');
  Object.assign(b.sets[0], { load: '5', reps: '12', rir: '2', done: true });
  assert.equal(setValid(b.sets[0], b), false);
  Object.assign(b.sets[0], { right: '11', rirRight: '1' });
  assert.ok(setValid(b.sets[0], b));
  b.sets[0].load = '-1';
  assert.equal(setValid(b.sets[0], b), false);
});
test('week boundaries stay Monday–Sunday across year/month transitions', () => {
  assert.equal(monday('2027-01-01'), '2026-12-28');
  assert.equal(addDays('2026-12-28', 6), '2027-01-03');
});
test('summary includes actual conventions, prior sessions, omitted sets, pain and averaged weigh-ins', () => {
  const state = newState();
  state.checkins.push({
    date: '2026-09-08',
    weight: 100,
    sleep: '',
    waist: '',
    notes: 'baseline',
    updatedAt: new Date().toISOString(),
  });
  const old = createSession('2026-09-07', 'upperA'),
    current = createSession('2026-09-11', 'upperB');
  const a = old.exercises.find((e) => e.id === 'cgbp'),
    b = current.exercises.find((e) => e.id === 'cgbp');
  Object.assign(a.sets[0], { load: '30', reps: '8', rir: '3', done: true });
  Object.assign(b.sets[0], { load: '32.5', reps: '8', rir: '2', done: true });
  b.variation = 'Gym A';
  current.pain = 'mild';
  state.sessions = [old, current];
  state.checkins.push({
    date: '2026-09-09',
    weight: '99.50',
    sleep: '8',
    waist: '',
    notes: '',
    updatedAt: new Date().toISOString(),
  });
  const report = weeklySummary(state, '2026-09-13');
  assert.match(report, /2026-09-07 to 2026-09-13/);
  assert.match(report, /99.75 kg \(2 recorded days\)/);
  assert.match(report, /32.5 kg total bar \+ plates/);
  assert.match(report, /Prior 2026-09-07/);
  assert.match(report, /NOT COMPLETED/);
  assert.match(report, /pain: mild/);
  assert.equal(previousExercise(state, 'cgbp', '2026-09-11').date, '2026-09-07');
  assert.equal(previousExercise(state, 'cgbp', '2026-09-07'), null);
});
test('backup round-trip and merge retain newer records without duplicating sessions', () => {
  const state = newState(),
    s = createSession('2026-09-08', 'lowerA');
  state.sessions.push(s);
  validateState(JSON.parse(JSON.stringify(state)));
  const incoming = structuredClone(state);
  incoming.sessions[0].updatedAt = '2099-01-01T00:00:00Z';
  incoming.sessions[0].notes = 'newer';
  const merged = mergeState(state, incoming);
  assert.equal(merged.sessions.length, 1);
  assert.equal(merged.sessions[0].notes, 'newer');
  assert.equal(state.sessions[0].notes, '');
  assert.throws(() => validateState({ version: 99, sessions: [], checkins: [] }));
  const broken = structuredClone(state);
  broken.sessions[0].exercises[0].sets[0].done = true;
  assert.throws(() => validateState(broken));
  const dup = structuredClone(state);
  dup.sessions.push(structuredClone(s));
  assert.throws(() => validateState(dup));
});

test('public app starts empty; a validated setup fragment seeds a local baseline', () => {
  assert.equal(newState().checkins.length, 0);
  const seeded = initialStateFromHash('#weight=100&date=2026-09-08');
  assert.equal(seeded.checkins[0].weight, 100);
  assert.equal(initialStateFromHash('#weight=bad&date=2026-09-08').checkins.length, 0);
  assert.equal(initialStateFromHash('#weight=100&date=2026-02-31').checkins.length, 0);
  validateState(seeded);
});
