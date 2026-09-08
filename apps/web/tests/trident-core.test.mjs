import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newState,
  initialStateFromHash,
  createSession,
  progress,
  ARMS,
  EXERCISES,
  TEMPLATES,
  setValid,
  weeklySummary,
  monday,
  addDays,
  validateState,
  mergeState,
  previousExercise,
  exerciseDefinition,
  sessionName,
} from '../public/trident/core.mjs';
test('revised templates enforce 3-set isolations, 4×12 compounds and unchanged deload counts', () => {
  const compounds = ['incline', 'pulldown', 'hack', 'cgbp', 'row', 'lat', 'rdl', 'split'];
  for (const [name, count] of Object.entries({
    upperA: 26,
    lowerA: 16,
    arms: 28,
    upperB: 29,
    lowerB: 20,
  })) {
    const s = createSession('2026-09-08', name);
    assert.equal(progress(s).total, count);
    assert.equal(progress(createSession('2026-09-08', name, 7)).total, count);
    for (const e of s.exercises) {
      assert.ok(e.sets.length >= 3);
      assert.ok(EXERCISES[e.id].min >= 10);
      if (compounds.includes(e.id)) {
        assert.equal(e.sets.length, 4);
        assert.equal(EXERCISES[e.id].min, 12);
        assert.equal(EXERCISES[e.id].max, 12);
      } else assert.equal(e.sets.length, 3);
      assert.notEqual(e.id, 'yraise');
    }
    if (['upperA', 'upperB', 'arms'].includes(name))
      assert.equal(s.exercises.filter((e) => ARMS.includes(e.id)).length, 4);
  }
});
test('weekly exercise inventory and muscle totals match the agreed rotation', () => {
  const weekly = Object.keys(TEMPLATES).flatMap((t) => createSession('2026-09-08', t).exercises);
  for (const id of [
    'inclinecurl',
    'preacher',
    'hammer',
    'dbcurl',
    'crosshammer',
    'overhead',
    'skullcrusher',
    'rope',
    'cgbp',
  ])
    assert.ok(
      weekly.some((e) => e.id === id),
      id,
    );
  const count = (group) =>
    weekly.filter((e) => EXERCISES[e.id].group === group).reduce((n, e) => n + e.sets.length, 0);
  assert.equal(count('Biceps'), 18);
  assert.equal(count('Triceps'), 19);
  assert.equal(count('Core'), 9);
  assert.equal(count('Forearms'), 6);
  assert.equal(weekly.filter((e) => e.id === 'pecdeck').length, 2);
});
test('historical sessions and backups retain their original sets, names and rep targets', () => {
  for (const [t, count] of Object.entries({
    upperA: 24,
    lowerA: 14,
    arms: 21,
    upperB: 24,
    lowerB: 14,
  })) {
    const old = createSession('2026-09-07', t, 1, '2026-09-08'),
      deload = createSession('2026-09-07', t, 7, '2026-09-08');
    assert.equal(progress(old).total, count);
    assert.ok(progress(deload).total < count);
    const state = newState();
    state.sessions = [old, { ...deload, id: '2026-09-08_' + t, date: '2026-09-08' }];
    validateState(state);
  }
  const old = createSession('2026-09-07', 'upperA', 1, '2026-09-08');
  assert.equal(exerciseDefinition('incline', old.planVersion).min, 6);
  assert.equal(old.exercises[0].sets.length, 2);
  const updated = createSession('2026-09-07', 'upperA');
  assert.notEqual(old.id, updated.id);
  const mixed = newState();
  mixed.sessions = [old, updated];
  validateState(mixed);
  assert.equal(
    sessionName(createSession('2026-09-07', 'upperB', 1, '2026-09-08')),
    'Upper B + arms',
  );
  assert.throws(() => createSession('2026-09-07', 'upperA', 1, 'unknown'));
});
test('bodyweight accepts zero external load; unilateral completion needs both sides', () => {
  const lower = createSession('2026-09-08', 'lowerA'),
    p = lower.exercises.find((e) => e.id === 'rollout');
  Object.assign(p.sets[0], { reps: '12', rir: '3', done: true });
  assert.ok(setValid(p.sets[0], p));
  const b = createSession('2026-09-08', 'upperA').exercises.find((e) => e.id === 'lateral');
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
test('summary includes actual conventions, prior sessions, omissions, pain, targets and weight averages', () => {
  const state = initialStateFromHash('#weight=100&date=2026-09-08');
  const old = createSession('2026-09-07', 'upperA', 1, '2026-09-08'),
    current = createSession('2026-09-11', 'upperB');
  const a = old.exercises.find((e) => e.id === 'preacher'),
    b = current.exercises.find((e) => e.id === 'preacher');
  Object.assign(a.sets[0], { load: '30', reps: '10', rir: '3', done: true });
  Object.assign(b.sets[0], { load: '32.5', reps: '10', rir: '2', done: true });
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
  assert.match(report, /target 10–15 reps/);
  assert.match(report, /target 10–12 reps/);
  assert.match(report, /prescription 2026-09-08-r2/);
  assert.equal(previousExercise(state, 'preacher', '2026-09-11').date, '2026-09-07');
});
test('backup round-trip and merging preserve newer entries and reject invalid imports', () => {
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
test('public app starts empty; validated setup fragments seed only local baseline data', () => {
  assert.equal(newState().checkins.length, 0);
  const seeded = initialStateFromHash('#weight=100&date=2026-09-08');
  assert.equal(seeded.checkins[0].weight, 100);
  assert.equal(initialStateFromHash('#weight=bad&date=2026-09-08').checkins.length, 0);
  assert.equal(initialStateFromHash('#weight=100&date=2026-02-31').checkins.length, 0);
  validateState(seeded);
});
