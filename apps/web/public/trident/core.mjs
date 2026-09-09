import { LEGACY_PLAN } from './legacy-plan.mjs';
import { PREVIOUS_PLAN } from './previous-plan.mjs';
import { R3_PLAN } from './r3-plan.mjs';
export const PLAN_VERSION = '2026-09-09-r4';
export const STORAGE_KEY = 'trident-forge-v1';
const ex = (id, min, max, overrides = {}) => ({
  ...R3_PLAN.exercises[id],
  id,
  sets: 3,
  min,
  max,
  ...overrides,
});
const current = Object.fromEntries(
  [
    ex('inclinesmith', 6, 10, {
      name: 'Incline Smith bench press',
      group: 'Chest',
      basis: 'plates',
      unilateral: false,
      cue: '15–30° incline; set safeties. Log plates added only; note machine and effective bar resistance separately. Never copy free-barbell loads.',
    }),
    ex('incline', 8, 12, {
      cue: '15–30° incline. Log kg per dumbbell; controlled, comfortable range.',
    }),
    ex('pecdeck', 10, 15),
    ex('lateral', 12, 20),
    ex('overhead', 10, 15),
    ex('rope', 10, 15),
    ex('skullcrusher', 10, 15),
    ex('pulldown', 8, 12),
    ex('row', 8, 12),
    ex('lat', 10, 15),
    ex('rear', 12, 20, {
      name: 'Reverse pec deck',
      cue: 'Controlled rear-delt fly; keep torso supported.',
    }),
    ex('shrug', 10, 15),
    ex('cabley', 12, 20),
    ex('inclinecurl', 8, 12),
    ex('hammer', 10, 15, {
      cue: 'Normal hammer curl beside torso; neutral grip. This stays in addition to Friday cross-body curls.',
    }),
    ex('preacher', 8, 12),
    ex('crosshammer', 10, 15),
    ex('hack', 6, 10, {
      name: 'Hack squat',
      cue: 'Controlled comfortable depth; log machine and plates-added convention. Leg press is a substitute.',
    }),
    ex('legpress', 10, 15, {
      name: 'Leg press',
      group: 'Legs',
      basis: 'plates',
      unilateral: false,
      cue: 'Keep pelvis supported; comfortable depth. Log machine and plates added; do not compare different sleds.',
    }),
    ex('rdl', 6, 10, {
      cue: 'Hips back, bar close; stop at controlled hamstring range. Log total bar plus plates.',
    }),
    ex('legcurl', 10, 15),
    ex('extension', 10, 15),
    ex('calf', 8, 15),
    ex('calfseat', 12, 20),
    ex('crunch', 10, 15),
    ex('kneeraise', 10, 15),
    ex('wristcurl', 12, 20),
    ex('reversewrist', 12, 20),
  ].map((e) => [e.id, e]),
);
export const EXERCISES = { ...R3_PLAN.exercises, ...current };
export const ARMS = R3_PLAN.arms;
const treadmill =
  'After lifting: treadmill 20 min at conversational effort, RPE 3–4/10. Adjust speed/incline to breathing; log minutes, speed and incline.';
export const TEMPLATES = {
  pushA: {
    name: 'Push A · Smith incline',
    day: 'Monday',
    ids: ['inclinesmith', 'pecdeck', 'lateral', 'overhead', 'rope'],
    pairing:
      'Press first. Optional lateral raise ↔ rope pushdown after overhead extensions; keep full rest before repeating each exercise.',
    cardio: treadmill,
  },
  pullA: {
    name: 'Pull A · normal hammer curls',
    day: 'Tuesday',
    ids: ['pulldown', 'row', 'rear', 'shrug', 'inclinecurl', 'hammer'],
    pairing:
      'Pulldown and row first; keep curls as separate exercises. Normal hammer curls stay beside the torso.',
    cardio: 'No required finisher. Comfortable daily walking.',
  },
  legsA: {
    name: 'Legs A · quads, abs & forearms',
    day: 'Wednesday',
    ids: ['hack', 'legcurl', 'extension', 'calf', 'crunch', 'wristcurl'],
    pairing: 'Hack squat first. Optional calves ↔ cable crunch; wrist curls last.',
    cardio:
      'No required finisher. Comfortable walking; avoid hard intervals around leg sessions.',
  },
  pushB: {
    name: 'Push B · dumbbell incline',
    day: 'Thursday',
    ids: ['incline', 'pecdeck', 'lateral', 'skullcrusher', 'rope'],
    pairing:
      'Press first. Optional lateral raise ↔ rope pushdown after skull crushers. Start skull crushers light.',
    cardio: treadmill,
  },
  pullB: {
    name: 'Pull B · cross-body hammer curls',
    day: 'Friday',
    ids: ['lat', 'row', 'rear', 'shrug', 'cabley', 'preacher', 'crosshammer'],
    pairing:
      'Pulldown and row first. Optional light cable Y-raise ↔ preacher curl after shrugs. Log both sides of cross-body curls.',
    cardio: 'No required finisher. Save grip and back recovery for Saturday RDLs.',
  },
  legsB: {
    name: 'Legs B · posterior chain, abs & forearms',
    day: 'Saturday',
    ids: ['rdl', 'legpress', 'legcurl', 'calfseat', 'kneeraise', 'reversewrist'],
    pairing:
      'RDL and leg press as straight sets; wrist extensions last. Use straps on RDL only if trained to use them and grip is limiting.',
    cardio:
      'After lifting: easy treadmill 10–15 min. From week 3, if recovered, optionally SUBSTITUTE 6 rounds of 30 sec moderate work + 90 sec easy recovery on ONE: SkiErg, light sled push/rope-pull sled, battle ropes, light kettlebell carry, or slam-rated weighted-ball slams. RPE ≤6/10, no all-out efforts. Week 7: easy walking only.',
  },
};
export function planFor(version = PLAN_VERSION) {
  if (version === LEGACY_PLAN.version) return LEGACY_PLAN;
  if (version === PREVIOUS_PLAN.version) return PREVIOUS_PLAN;
  if (version === R3_PLAN.version) return R3_PLAN;
  if (version === PLAN_VERSION)
    return { version: PLAN_VERSION, exercises: EXERCISES, templates: TEMPLATES, arms: ARMS };
  throw Error('Unsupported training revision. Preserve your backup and update the app.');
}
export function sessionName(s) {
  return planFor(s.planVersion || LEGACY_PLAN.version).templates[s.template].name;
}
export function exerciseDefinition(id, version = PLAN_VERSION) {
  return planFor(version).exercises[id];
}
export function sessionInstructions(s) {
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return 'Earlier prescription: saved exercises, reps and set counts are preserved. The six-day PPL plan applies to new sessions only.';
  if (s.week === 7)
    return 'Deload: 2 working sets per exercise, lighter loads and 4–5 RIR. Easy walking only; no conditioning intervals.';
  return (
    '3 working sets per exercise; follow each rep range. Start at 3 RIR, then use 1–3 RIR as recovered. ' +
    TEMPLATES[s.template].pairing +
    ' Rest 2–3 min for compounds, 60–120 sec for accessories. Stop within 120 min.'
  );
}
export function sessionCardio(s) {
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return 'Earlier workout: record only the cardio actually performed.';
  return s.week === 7
    ? 'Easy walking only; no conditioning intervals.'
    : TEMPLATES[s.template].cardio;
}
export function exerciseRir(s, id) {
  if (s.week === 7) return '4–5';
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return s.week === 1 ? '3–4' : s.week === 2 ? '3' : '2–3';
  if (s.week === 1) return '3';
  if (s.week === 2) return '2–3';
  if (s.week === 8) return '2';
  return [
    'inclinesmith',
    'incline',
    'pulldown',
    'row',
    'lat',
    'hack',
    'legpress',
    'rdl',
  ].includes(id)
    ? '2'
    : '1–2';
}

export const BASES = {
  stack: 'Machine stack kg',
  total: 'Total bar + plates kg',
  plates: 'Plates added kg',
  'per-dumbbell': 'Kg per dumbbell',
  'single-dumbbell': 'Single dumbbell kg',
  assistance: 'Assistance kg',
  added: 'Added kg to bodyweight',
  bodyweight: 'Bodyweight only',
};
export const localDate = (d = new Date()) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
export function addDays(date, n) {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return localDate(d);
}
export function monday(date) {
  const day = new Date(date + 'T12:00:00').getDay();
  return addDays(date, -((day + 6) % 7));
}
export function recommendedTemplate(date) {
  return (
    { 1: 'pushA', 2: 'pullA', 3: 'legsA', 4: 'pushB', 5: 'pullB', 6: 'legsB' }[
      new Date(date + 'T12:00:00').getDay()
    ] || ''
  );
}
export function newState() {
  return { version: 1, planVersion: PLAN_VERSION, sessions: [], checkins: [] };
}
export function initialStateFromHash(hash) {
  const data = newState(),
    params = new URLSearchParams(hash.replace(/^#/, '')),
    weight = params.get('weight'),
    date = params.get('date');
  if (numberIn(weight, 20, 400) && validDate(date))
    data.checkins.push({
      date,
      weight: Number(weight),
      sleep: '',
      waist: '',
      notes: 'User-reported baseline',
      updatedAt: new Date().toISOString(),
    });
  return data;
}
export function createSession(date, template, week = 1, planVersion = PLAN_VERSION) {
  const plan = planFor(planVersion);
  if (
    !plan.templates[template] ||
    !validDate(date) ||
    !Number.isInteger(week) ||
    week < 1 ||
    week > 8
  )
    throw Error('Choose a valid date, workout and week.');
  const exercises = plan.templates[template].ids.map((id) => {
    const e = plan.exercises[id];
    let count = planVersion === PLAN_VERSION && week === 7 ? 2 : e.sets;
    if (planVersion === LEGACY_PLAN.version) {
      if (id === 'legcurl' && template === 'lowerB') count = 2;
      if (week === 7 && !plan.arms.includes(id)) count = count >= 3 ? 2 : 1;
    }
    return {
      id,
      name: e.name,
      basis: e.basis,
      variation: '',
      notes: '',
      sets: Array.from({ length: count }, () => ({
        load: '',
        reps: '',
        right: '',
        rir: '',
        rirRight: '',
        done: false,
      })),
    };
  });
  return {
    id: date + '_' + template + (planVersion === LEGACY_PLAN.version ? '' : '_' + planVersion),
    date,
    template,
    week,
    planVersion,
    exercises,
    notes: '',
    cardio: '',
    pain: 'none',
    duration: '',
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };
}
export function validDate(d) {
  return (
    typeof d === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
    !isNaN(new Date(d + 'T12:00:00')) &&
    localDate(new Date(d + 'T12:00:00')) === d
  );
}
export function numberIn(v, min, max, integer = false) {
  return (
    v !== '' &&
    v !== null &&
    v !== undefined &&
    Number.isFinite(Number(v)) &&
    Number(v) >= min &&
    Number(v) <= max &&
    (!integer || Number.isInteger(Number(v)))
  );
}
export function setValid(set, e) {
  const uni = EXERCISES[e.id]?.unilateral;
  return (
    (e.basis === 'bodyweight' || numberIn(set.load, 0, 2000)) &&
    numberIn(set.reps, 1, 200, true) &&
    numberIn(set.rir, 0, 10) &&
    (!uni || (numberIn(set.right, 1, 200, true) && numberIn(set.rirRight, 0, 10)))
  );
}
export function progress(s) {
  return {
    done: s.exercises.reduce(
      (n, e) => n + e.sets.filter((x) => x.done && setValid(x, e)).length,
      0,
    ),
    total: s.exercises.reduce((n, e) => n + e.sets.length, 0),
  };
}
export function previousExercise(state, id, date) {
  return (
    state.sessions
      .filter((s) => s.date < date)
      .sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((s) =>
        s.exercises
          .filter((e) => e.id === id && e.sets.some((x) => x.done && setValid(x, e)))
          .map((e) => ({
            date: s.date,
            week: s.week,
            planVersion: s.planVersion || LEGACY_PLAN.version,
            exercise: e,
          })),
      )[0] || null
  );
}
export function formatSet(x, e) {
  const uni = EXERCISES[e.id]?.unilateral;
  const labels = {
    stack: 'machine stack',
    total: 'total bar + plates',
    plates: 'plates added',
    'per-dumbbell': 'per dumbbell',
    'single-dumbbell': 'single dumbbell',
    assistance: 'assistance',
    added: 'added to bodyweight',
  };
  const load =
    e.basis === 'bodyweight' ? 'BW' : String(x.load) + ' kg ' + (labels[e.basis] || e.basis);
  return (
    load +
    ' × ' +
    x.reps +
    (uni ? '/' + x.right + ' L/R' : '') +
    ' @ ' +
    x.rir +
    (uni ? '/' + x.rirRight + ' L/R' : '') +
    ' RIR'
  );
}
function mean(values) {
  return values.length ? values.reduce((a, b) => a + Number(b), 0) / values.length : null;
}
export function weeklySummary(state, date) {
  const start = monday(date),
    end = addDays(start, 6),
    prior = addDays(start, -7);
  const sessions = state.sessions
    .filter((s) => s.date >= start && s.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
  const checks = state.checkins
    .filter((c) => c.date >= start && c.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
  const weights = checks.filter((c) => numberIn(c.weight, 20, 400)),
    oldweights = state.checkins.filter(
      (c) => c.date >= prior && c.date < start && numberIn(c.weight, 20, 400),
    );
  const avg = mean(weights.map((x) => x.weight)),
    old = mean(oldweights.map((x) => x.weight));
  let lines = [
    '# Trident Forge weekly coaching summary',
    start + ' to ' + end + ' · plan ' + PLAN_VERSION,
    '',
    'Please evaluate recovery and performance, then suggest specific next loads, reps and any plan changes. Do not infer missing lifts or compare different machines/load conventions.',
    '',
    '## Check-in',
    'Average bodyweight: ' +
      (avg === null
        ? 'not logged'
        : avg.toFixed(2) + ' kg (' + weights.length + ' recorded days)'),
    'Previous week average: ' +
      (old === null
        ? 'not logged'
        : old.toFixed(2) + ' kg (' + oldweights.length + ' recorded days)'),
    'Average change: ' +
      (avg !== null && old !== null
        ? (avg - old).toFixed(2) + ' kg; interpret cautiously if few weigh-ins'
        : 'insufficient data'),
    'Baseline: ' +
      state.checkins
        .filter((c) => numberIn(c.weight, 20, 400))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 1)
        .map((c) => c.weight + ' kg on ' + c.date)
        .join(''),
    'Average sleep: ' +
      (mean(checks.filter((c) => numberIn(c.sleep, 0, 24)).map((c) => c.sleep))?.toFixed(1) ??
        'not logged') +
      ' hours',
    'Recorded sessions: ' +
      sessions.length +
      '; marked finished: ' +
      sessions.filter((s) => s.status === 'finished').length +
      '; current target: 6/week (do not make up completed days during the transition)',
    'Completed working sets: ' +
      sessions.reduce((n, s) => n + progress(s).done, 0) +
      ' / ' +
      sessions.reduce((n, s) => n + progress(s).total, 0) +
      ' planned in recorded sessions',
    'Current PPL templates not logged (older workouts stay under their original names): ' +
      (Object.keys(TEMPLATES)
        .filter((t) => !sessions.some((s) => s.template === t && progress(s).done > 0))
        .map((t) => TEMPLATES[t].name)
        .join(', ') || 'none'),
    'Unilateral sets count once after both sides. Warm-ups are not included.',
  ];
  for (const c of checks)
    lines.push(
      '- ' +
        c.date +
        ': weight ' +
        (c.weight || '—') +
        ' kg; sleep ' +
        (c.sleep || '—') +
        ' h; waist ' +
        (c.waist || '—') +
        ' cm; ' +
        (c.notes || ''),
    );
  for (const s of sessions) {
    const p = progress(s);
    lines.push(
      '',
      '## ' +
        s.date +
        ' · ' +
        sessionName(s) +
        ' · week ' +
        s.week +
        (s.week === 7 ? ' (DELOAD)' : '') +
        ' · prescription ' +
        (s.planVersion || LEGACY_PLAN.version),
      'Status: ' +
        s.status +
        '; sets ' +
        p.done +
        '/' +
        p.total +
        '; duration ' +
        (s.duration || 'not logged') +
        ' min; pain: ' +
        s.pain,
      'Session notes: ' + (s.notes || 'none'),
      'Cardio performed: ' + (s.cardio || 'not logged'),
    );
    for (const e of s.exercises) {
      const done = e.sets.map((x, i) =>
        x.done && setValid(x, e)
          ? 'S' + (i + 1) + ' ' + formatSet(x, e)
          : 'S' + (i + 1) + ' NOT COMPLETED',
      );
      lines.push(
        '- ' +
          e.name +
          ' (target ' +
          exerciseDefinition(e.id, s.planVersion || LEGACY_PLAN.version).min +
          '–' +
          exerciseDefinition(e.id, s.planVersion || LEGACY_PLAN.version).max +
          ' reps)' +
          (e.variation ? ' [equipment/substitution: ' + e.variation + ']' : '') +
          ': ' +
          done.join('; '),
      );
      const prev = previousExercise(state, e.id, s.date);
      if (prev)
        lines.push(
          '  Prior ' +
            prev.date +
            ' (week ' +
            prev.week +
            '): ' +
            prev.exercise.sets
              .filter((x) => x.done && setValid(x, prev.exercise))
              .map((x) => formatSet(x, prev.exercise))
              .join('; ') +
            (prev.exercise.variation ? ' [equipment: ' + prev.exercise.variation + ']' : ''),
        );
      if (e.notes) lines.push('  Notes: ' + e.notes);
    }
  }
  if (!sessions.length) lines.push('', 'No workouts logged for this week.');
  return lines.join('\n');
}
export function validateState(data) {
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.sessions) ||
    !Array.isArray(data.checkins) ||
    data.sessions.length > 3000 ||
    data.checkins.length > 10000
  )
    throw Error('Unsupported or oversized backup.');
  const ids = new Set(),
    dates = new Set();
  for (const s of data.sessions) {
    if (
      !s ||
      !validDate(s.date) ||
      typeof s.template !== 'string' ||
      typeof s.id !== 'string' ||
      ids.has(s.id) ||
      !Number.isInteger(s.week) ||
      s.week < 1 ||
      s.week > 8 ||
      !Array.isArray(s.exercises)
    )
      throw Error('Invalid workout in backup.');
    ids.add(s.id);
    const expected = createSession(
      s.date,
      s.template,
      s.week,
      s.planVersion || LEGACY_PLAN.version,
    );
    if (s.id !== expected.id) throw Error('Invalid workout identifier.');
    if (
      !['draft', 'finished'].includes(s.status) ||
      !['none', 'mild', 'stop'].includes(s.pain) ||
      !Array.isArray(s.exercises) ||
      s.exercises.length !== expected.exercises.length
    )
      throw Error('Invalid session shape.');
    if (
      typeof s.notes !== 'string' ||
      s.notes.length > 10000 ||
      (s.cardio !== undefined && (typeof s.cardio !== 'string' || s.cardio.length > 3000)) ||
      !Number.isFinite(Date.parse(s.updatedAt))
    )
      throw Error('Invalid workout notes/date.');
    for (let i = 0; i < s.exercises.length; i++) {
      const e = s.exercises[i],
        ref = expected.exercises[i];
      if (
        !e ||
        e.id !== ref.id ||
        typeof e.name !== 'string' ||
        typeof e.variation !== 'string' ||
        typeof e.notes !== 'string' ||
        !Object.hasOwn(BASES, e.basis) ||
        !Array.isArray(e.sets) ||
        e.sets.length !== ref.sets.length
      )
        throw Error('Invalid exercise in backup.');
      for (const x of e.sets)
        if (
          !x ||
          typeof x.done !== 'boolean' ||
          ['load', 'reps', 'right', 'rir', 'rirRight'].some(
            (k) => typeof x[k] !== 'string' && typeof x[k] !== 'number',
          ) ||
          (x.done && !setValid(x, e))
        )
          throw Error('Invalid set in backup.');
    }
  }
  for (const c of data.checkins) {
    if (
      !c ||
      !validDate(c.date) ||
      dates.has(c.date) ||
      !(c.weight === '' || numberIn(c.weight, 20, 400)) ||
      !(c.sleep === '' || numberIn(c.sleep, 0, 24)) ||
      !(c.waist === '' || numberIn(c.waist, 30, 250)) ||
      typeof c.notes !== 'string' ||
      !Number.isFinite(Date.parse(c.updatedAt))
    )
      throw Error('Invalid check-in in backup.');
    dates.add(c.date);
  }
  return data;
}
export function mergeState(local, incoming) {
  validateState(incoming);
  const merge = (a, b, key) => {
    const map = new Map(a.map((x) => [x[key], x]));
    for (const x of b) {
      const old = map.get(x[key]);
      if (!old || Date.parse(x.updatedAt) > Date.parse(old.updatedAt)) map.set(x[key], x);
    }
    return [...map.values()];
  };
  return {
    ...local,
    sessions: merge(local.sessions, incoming.sessions, 'id'),
    checkins: merge(local.checkins, incoming.checkins, 'date'),
  };
}
