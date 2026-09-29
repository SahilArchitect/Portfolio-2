import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAN_VERSION,
  EXERCISES,
  TEMPLATES,
  planFor,
  createSession,
  progress,
  recommendedTemplate,
  exerciseRir,
  sessionInstructions,
  sessionCardio,
  newState,
  validateState,
  mergeState,
  cardioValid,
  cardioLogRequired,
  weeklySummary,
  sessionActivity,
  previousExercise,
  addDays,
} from '../public/trident/core.mjs';

test('r7 schedules PPL twice with 82 normal and 49 deload sets, balanced muscle coverage', () => {
  assert.equal(PLAN_VERSION, '2026-09-29-r7');
  const counts = {
    pushA: [13, 7],
    pullA: [16, 10],
    legsA: [13, 8],
    pushB: [13, 7],
    pullB: [13, 8],
    legsB: [14, 9],
  };
  const schedule = [...Object.keys(counts), ''];
  schedule.forEach((t, i) => assert.equal(recommendedTemplate(addDays('2026-09-28', i)), t));
  let total = 0,
    deloadTotal = 0;
  for (const [template, [normal, light]] of Object.entries(counts)) {
    const s = createSession('2026-09-29', template, 3);
    const d = createSession('2026-09-29', template, 7);
    assert.equal(progress(s).total, normal);
    assert.equal(progress(d).total, light);
    for (let i = 0; i < s.exercises.length; i++) {
      assert.equal(d.exercises[i].sets.length, Math.ceil(s.exercises[i].sets.length / 2));
      assert.equal(exerciseRir(d, d.exercises[i].id), '4–5');
    }
    total += normal;
    deloadTotal += light;
  }
  assert.equal(total, 82);
  assert.equal(deloadTotal, 49);
  const inventory = Object.values(TEMPLATES).flatMap((t) => t.ids.map((id) => EXERCISES[id]));
  const groupSets = (group) =>
    inventory.filter((e) => e.group === group).reduce((n, e) => n + e.sets, 0);
  for (const [group, n] of Object.entries({
    Chest: 10,
    Back: 12,
    'Side delts': 8,
    'Rear delts': 6,
    Biceps: 8,
    Triceps: 8,
    'Upper traps': 3,
    Legs: 17,
    Calves: 6,
    Core: 4,
  }))
    assert.equal(groupSets(group), n, group);
  for (const id of [
    'highlowfly',
    'skullcrusher',
    'midtrapshrug',
    'reversecurl',
    'behindwrist',
    'barpushdown',
    'crosshammer',
    'cabley',
  ])
    assert.ok(!inventory.some((e) => e.id === id), id + ' must not be extra work');
  assert.deepEqual(
    ['pushA', 'pushB'].map((t) => TEMPLATES[t].ids[0]),
    ['inclinesmith', 'incline'],
  );
  assert.deepEqual(
    ['pullA', 'pullB'].map((t) => TEMPLATES[t].ids[0]),
    ['pulldown', 'lat'],
  );
});

test('r7 effort and instructions match all eight weeks without forced failure or weekly volume inflation', () => {
  for (const [week, main, accessory] of [
    [1, '3', '3'],
    [2, '2–3', '2–3'],
    [3, '2–3', '1–2'],
    [6, '2–3', '1–2'],
    [7, '4–5', '4–5'],
    [8, '2', '2'],
  ]) {
    const s = createSession('2026-09-29', 'pushA', week);
    assert.equal(exerciseRir(s, 'inclinesmith'), main);
    assert.equal(exerciseRir(s, 'lateral'), accessory);
  }
  assert.match(
    sessionInstructions(createSession('2026-09-29', 'pushA', 3)),
    /all sets reach the rep ceiling/,
  );
  assert.match(
    sessionInstructions(createSession('2026-09-29', 'pushA', 7)),
    /half the normal sets/,
  );
  assert.match(sessionCardio(createSession('2026-09-29', 'pushA', 3)), /15–20/);
  assert.match(sessionCardio(createSession('2026-09-29', 'pushB', 7)), /10–15/);
  assert.match(sessionCardio(createSession('2026-09-29', 'legsB', 3)), /No required finisher/);
});

test('optional r7 cardio can be blank or skipped; positive minutes require actual activity and export separately', () => {
  const s = createSession('2026-09-28', 'pushA', 3);
  s.status = 'finished';
  const data = { ...newState(), sessions: [s] };
  validateState(data);
  assert.equal(cardioLogRequired(s), false);
  s.cardioDuration = '0';
  s.cardio = 'Skipped: fatigue';
  validateState(data);
  assert.equal(cardioValid(s), false);
  assert.match(weeklySummary(data, s.date), /finished cardio bouts: 0/);
  s.duration = '90';
  s.cardioDuration = '18';
  s.cardio = 'Treadmill 18 min at RPE 3, gentle incline';
  validateState(data);
  assert.ok(cardioValid(s));
  assert.match(sessionActivity(s), /cardio 18 min/);
  const report = weeklySummary(data, s.date);
  assert.match(report, /finished cardio bouts: 1/);
  assert.match(report, /cardio minutes logged: 18/);
  assert.match(report, /Completed working sets: 0 \/ 13/);
  for (const minutes of [-1, 121, 'bad', {}, []]) {
    const invalid = structuredClone(data);
    invalid.sessions[0].cardioDuration = minutes;
    assert.throws(() => validateState(invalid));
  }
  const noDescription = structuredClone(data);
  noDescription.sessions[0].cardio = ' ';
  assert.throws(() => validateState(noDescription));
  assert.equal(
    JSON.stringify(mergeState(newState(), JSON.parse(JSON.stringify(data))).sessions[0]),
    JSON.stringify(s),
  );
});

test('all seven prescriptions and all eight weeks round-trip; r6 completed hybrid and deload retain original shape', () => {
  const data = newState();
  for (const version of [
    '2026-09-08',
    '2026-09-08-r2',
    '2026-09-09-r3',
    '2026-09-09-r4',
    '2026-09-10-r5',
    '2026-09-13-r6',
    PLAN_VERSION,
  ]) {
    for (const template of Object.keys(planFor(version).templates)) {
      for (let week = 1; week <= 8; week++) {
        const s = createSession(addDays('2026-09-01', week), template, week, version);
        data.sessions.push(s);
      }
    }
  }
  const completed = createSession('2026-09-17', 'cardio', 3, '2026-09-13-r6');
  completed.status = 'finished';
  completed.cardioDuration = '40';
  completed.cardio = 'Treadmill at RPE 3';
  completed.duration = '110';
  Object.assign(completed.exercises[0].sets[0], {
    load: '12',
    reps: '10',
    rir: '2',
    done: true,
  });
  data.sessions.push(completed);
  const original = JSON.stringify(data);
  const restored = validateState(JSON.parse(original));
  assert.equal(JSON.stringify(restored), original);
  const old = createSession('2026-09-17', 'push', 7, '2026-09-13-r6');
  assert.equal(progress(old).total, 14);
  assert.equal(old.exercises[0].sets.length, 2);
  assert.equal(planFor('2026-09-13-r6').exercises.inclinesmith.sets, 4);
  assert.equal(planFor('2026-09-13-r6').exercises.inclinesmith.min, 8);
  assert.equal(EXERCISES.inclinesmith.sets, 3);
  assert.equal(EXERCISES.inclinesmith.min, 6);
  assert.equal(previousExercise(restored, 'dbcurl', '2026-09-18').exercise.sets[0].load, '12');
  const broken = structuredClone(data);
  broken.sessions.find((s) => s.planVersion === PLAN_VERSION).exercises[0].sets.push({});
  assert.throws(() => validateState(broken));
});
