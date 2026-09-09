import test from 'node:test';
import assert from 'node:assert/strict';
import { exerciseRir } from '../public/trident/core.mjs';
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
  sessionInstructions,
  sessionCardio,
  recommendedTemplate,
  PLAN_VERSION,
  planFor,
} from '../public/trident/core.mjs';
test('six-day PPL starts now with movement-specific targets and a genuine deload', () => {
  const days = ['pushA', 'pullA', 'legsA', 'pushB', 'pullB', 'legsB', ''];
  days.forEach((name, i) => assert.equal(recommendedTemplate(addDays('2026-09-07', i)), name));
  const counts = { pushA: 15, pullA: 18, legsA: 18, pushB: 15, pullB: 21, legsB: 18 };
  for (const [name, count] of Object.entries(counts)) {
    const s = createSession('2026-09-09', name);
    assert.equal(progress(s).total, count);
    assert.equal(progress(createSession('2026-09-09', name, 7)).total, (count * 2) / 3);
    for (const e of s.exercises) {
      assert.equal(e.sets.length, 3);
      assert.ok(EXERCISES[e.id].min < EXERCISES[e.id].max);
    }
  }
  assert.throws(() => createSession('2026-09-09', 'upperA'));
  assert.match(sessionInstructions(createSession('2026-09-09', 'pushA', 7)), /2 working sets/);
});
test('weekly inventory retains both hammer curls, shrugs and forearms without a chest press machine', () => {
  const weekly = Object.keys(TEMPLATES).flatMap(
    (t) => createSession('2026-09-09', t).exercises,
  );
  for (const id of [
    'inclinesmith',
    'incline',
    'inclinecurl',
    'preacher',
    'hammer',
    'crosshammer',
    'overhead',
    'skullcrusher',
    'rope',
    'shrug',
    'wristcurl',
    'reversewrist',
    'cabley',
  ])
    assert.ok(
      weekly.some((e) => e.id === id),
      id,
    );
  const count = (group) =>
    weekly
      .filter((e) => EXERCISES[e.id].group === group)
      .reduce((n, e) => n + e.sets.length, 0);
  for (const [group, n] of Object.entries({
    Biceps: 12,
    Triceps: 12,
    Core: 6,
    Forearms: 6,
    Chest: 12,
    Back: 12,
    Traps: 9,
    Legs: 18,
    Calves: 6,
    Delts: 12,
  }))
    assert.equal(count(group), n, group);
  assert.equal(weekly.filter((e) => e.id === 'shrug').length, 2);
  assert.equal(weekly.filter((e) => e.id === 'pecdeck').length, 2);
  assert.equal(
    weekly.reduce((n, e) => n + e.sets.length, 0),
    105,
  );
  assert.ok(TEMPLATES.pullA.ids.includes('hammer'));
  assert.ok(TEMPLATES.pullB.ids.includes('crosshammer'));
  assert.ok(!weekly.some((e) => /chest press machine/i.test(e.name)));
  const smith = createSession('2026-09-09', 'pushA').exercises[0];
  assert.equal(smith.id, 'inclinesmith');
  assert.equal(smith.basis, 'plates');
  const data = newState();
  const old = createSession('2026-09-08', 'upperB', 1, '2026-09-09-r3');
  Object.assign(old.exercises[0].sets[0], { load: '40', reps: '12', rir: '2', done: true });
  data.sessions = [old];
  assert.equal(previousExercise(data, smith.id, '2026-09-09'), null);
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
  const updated = createSession('2026-09-07', 'pushA');
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
test('r2 Friday backups coexist with r3 without adding exercises to saved sessions', () => {
  const old = createSession('2026-09-11', 'upperB', 7, '2026-09-08-r2');
  const current = createSession('2026-09-11', 'upperB', 7, '2026-09-09-r3');
  Object.assign(old.exercises[0].sets[0], { load: '40', reps: '12', rir: '4', done: true });
  const data = newState();
  data.sessions = [old, current];
  const restored = validateState(JSON.parse(JSON.stringify(data)));
  assert.equal(progress(old).total, 29);
  assert.equal(progress(current).total, 33);
  assert.notEqual(old.id, current.id);
  assert.equal(old.exercises[0].id, 'row');
  assert.equal(old.exercises[0].sets[0].load, '40');
  assert.equal(sessionName(old), 'Back, pec deck + arms');
  assert.doesNotMatch(sessionInstructions(old), /reduced set counts/);
  const report = weeklySummary(data, '2026-09-13');
  assert.match(report, /prescription 2026-09-08-r2/);
  assert.match(report, /prescription 2026-09-09-r3/);
});
test('bodyweight accepts zero external load; unilateral completion needs both sides', () => {
  const lower = createSession('2026-09-09', 'legsB'),
    p = lower.exercises.find((e) => e.id === 'kneeraise');
  Object.assign(p.sets[0], { reps: '12', rir: '3', done: true });
  assert.ok(setValid(p.sets[0], p));
  const b = createSession('2026-09-09', 'pushA').exercises.find((e) => e.id === 'lateral');
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
  const state = initialStateFromHash('#weight=95.92&date=2026-09-08');
  const old = createSession('2026-09-07', 'upperA', 1, '2026-09-08'),
    current = createSession('2026-09-11', 'pullB');
  const a = old.exercises.find((e) => e.id === 'preacher'),
    b = current.exercises.find((e) => e.id === 'preacher');
  Object.assign(a.sets[0], { load: '30', reps: '10', rir: '3', done: true });
  Object.assign(b.sets[0], { load: '32.5', reps: '10', rir: '2', done: true });
  b.variation = 'Gym A';
  current.pain = 'mild';
  state.sessions = [old, current];
  state.checkins.push({
    date: '2026-09-09',
    weight: '95.50',
    sleep: '8',
    waist: '',
    notes: '',
    updatedAt: new Date().toISOString(),
  });
  const report = weeklySummary(state, '2026-09-13');
  assert.match(report, /2026-09-07 to 2026-09-13/);
  assert.match(report, /95.71 kg \(2 recorded days\)/);
  assert.match(report, /32.5 kg total bar \+ plates/);
  assert.match(report, /Prior 2026-09-07/);
  assert.match(report, /NOT COMPLETED/);
  assert.match(report, /pain: mild/);
  assert.match(report, /target 10–15 reps/);
  assert.match(report, /target 8–12 reps/);
  assert.match(report, /prescription 2026-09-09-r4/);
  assert.equal(previousExercise(state, 'preacher', '2026-09-11').date, '2026-09-07');
});
test('backup round-trip and merging preserve newer entries and reject invalid imports', () => {
  const state = newState(),
    s = createSession('2026-09-09', 'legsA');
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
test('effort targets match the new progression while historical RIR guidance stays intact', () => {
  for (const [week, press, curl] of [
    [1, '3', '3'],
    [2, '2–3', '2–3'],
    [3, '2', '1–2'],
    [7, '4–5', '4–5'],
    [8, '2', '2'],
  ]) {
    const s = createSession('2026-09-09', 'pushA', week);
    assert.equal(exerciseRir(s, 'inclinesmith'), press);
    assert.equal(exerciseRir(s, 'rope'), curl);
  }
  assert.equal(
    exerciseRir(createSession('2026-09-09', 'upperA', 2, '2026-09-09-r3'), 'incline'),
    '3',
  );
});

test('all historical revisions round-trip without rewriting completed logs or deload prescriptions', () => {
  const data = newState();
  for (const version of ['2026-09-08', '2026-09-08-r2', '2026-09-09-r3', PLAN_VERSION]) {
    for (const template of Object.keys(planFor(version).templates)) {
      for (const week of [1, 7]) {
        const s = createSession(
          week === 1 ? '2026-09-09' : '2026-09-10',
          template,
          week,
          version,
        );
        const e = s.exercises[0];
        Object.assign(e.sets[0], {
          load: '20',
          reps: '10',
          right: '10',
          rir: '3',
          rirRight: '3',
          done: true,
        });
        if (version !== PLAN_VERSION) delete s.cardio; // Real older backups have no cardio field.
        data.sessions.push(s);
      }
    }
  }
  const original = JSON.stringify(data);
  const restored = validateState(JSON.parse(original));
  assert.equal(JSON.stringify(restored), original);
  const merged = mergeState(newState(), restored);
  assert.equal(merged.sessions.length, 42);
  assert.equal(
    merged.sessions.reduce((n, s) => n + progress(s).done, 0),
    42,
  );
  const bad = structuredClone(data);
  bad.sessions[0].template = 'pushA';
  assert.throws(() => validateState(bad));
});
test('cardio prescription and actual log stay separate from sets and survive export/import', () => {
  const data = newState(),
    s = createSession('2026-09-12', 'legsB');
  data.sessions = [s];
  assert.match(sessionCardio(s), /SkiErg/);
  assert.match(sessionCardio(s), /SUBSTITUTE/);
  assert.doesNotMatch(sessionCardio(createSession('2026-09-12', 'legsB', 7)), /SkiErg/);
  s.cardio = 'Treadmill 12 min, 4 km/h, 2% incline, RPE 3';
  assert.equal(progress(s).total, 18);
  assert.equal(progress(s).done, 0);
  const restored = validateState(JSON.parse(JSON.stringify(data)));
  assert.equal(restored.sessions[0].cardio, s.cardio);
  assert.match(weeklySummary(restored, '2026-09-13'), /Cardio performed: Treadmill 12 min/);
  assert.match(weeklySummary(restored, '2026-09-13'), /current target: 6\/week/);
  for (const bad of [5, {}, 'x'.repeat(3001)]) {
    const broken = structuredClone(data);
    broken.sessions[0].cardio = bad;
    assert.throws(() => validateState(broken));
  }
});
