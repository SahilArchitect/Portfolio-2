export const PLAN_VERSION = '2026-09-08';
export const STORAGE_KEY = 'trident-forge-v1';
const ex = (id, name, sets, min, max, group, basis = 'stack', unilateral = false, cue = '') => ({
  id,
  name,
  sets,
  min,
  max,
  group,
  basis,
  unilateral,
  cue,
});
export const EXERCISES = Object.fromEntries(
  [
    ex(
      'incline',
      'Incline dumbbell press',
      2,
      6,
      10,
      'Chest',
      'per-dumbbell',
      false,
      '15–30° bench. Keep 2–3 clean reps in reserve.',
    ),
    ex(
      'pullup',
      'Neutral-grip pull-up',
      3,
      6,
      10,
      'Back',
      'assistance',
      false,
      'Record assistance removed by the machine, or switch to bodyweight / added kg.',
    ),
    ex(
      'row',
      'Chest-supported row',
      2,
      8,
      12,
      'Back',
      'stack',
      false,
      'Use the same machine or note your equipment change.',
    ),
    ex(
      'smith',
      'Low-incline Smith press',
      2,
      8,
      12,
      'Chest',
      'total',
      false,
      'Record total external load including the known bar load; note machine convention.',
    ),
    ex('highrow', 'Chest-supported high row', 3, 8, 12, 'Back', 'stack'),
    ex(
      'lat',
      'Single-arm cable lat pulldown',
      2,
      10,
      15,
      'Back',
      'stack',
      true,
      'Log left and right repetitions.',
    ),
    ex('lateral', 'Cable lateral raise', 3, 12, 20, 'Delts', 'stack', true),
    ex('rear', 'Reverse pec deck', 2, 12, 20, 'Delts', 'stack'),
    ex('rearfly', 'Cable rear-delt fly', 2, 12, 20, 'Delts', 'stack', true),
    ex('dblateral', 'Dumbbell lateral raise', 3, 12, 20, 'Delts', 'per-dumbbell'),
    ex(
      'shrug',
      'Dumbbell shrug',
      4,
      10,
      15,
      'Traps',
      'per-dumbbell',
      false,
      'Elevate smoothly. No shoulder rolling.',
    ),
    ex(
      'yraise',
      'Prone Y-raise',
      2,
      12,
      20,
      'Traps',
      'per-dumbbell',
      false,
      'Light load; allow shoulder blades to rotate upward.',
    ),
    ex(
      'hack',
      'Hack squat / leg press',
      3,
      6,
      10,
      'Legs',
      'plates',
      false,
      'Note machine and sled convention for comparable logs.',
    ),
    ex('legcurl', 'Seated leg curl', 3, 10, 15, 'Legs', 'stack'),
    ex('extension', 'Leg extension', 2, 10, 15, 'Legs', 'stack'),
    ex('calf', 'Standing calf raise', 3, 8, 15, 'Calves', 'stack'),
    ex(
      'rollout',
      'Ab wheel rollout',
      3,
      6,
      12,
      'Core',
      'bodyweight',
      false,
      'Stop before your lower back sags.',
    ),
    ex('rdl', 'Romanian deadlift', 3, 6, 10, 'Legs', 'total'),
    ex(
      'split',
      'Bulgarian split squat',
      3,
      8,
      12,
      'Legs',
      'per-dumbbell',
      true,
      'Repetitions and RIR for both legs.',
    ),
    ex('calfseat', 'Seated calf raise', 3, 10, 20, 'Calves', 'plates'),
    ex('crunch', 'Cable crunch', 3, 10, 15, 'Core', 'stack'),
    ex(
      'cgbp',
      'Close-grip bench press',
      1,
      6,
      10,
      'Triceps',
      'total',
      false,
      'Shoulder-width grip; use safeties or a spotter. No failure.',
    ),
    ex(
      'dip',
      'Upright parallel-bar dip',
      1,
      6,
      12,
      'Triceps',
      'assistance',
      false,
      'Use assistance and comfortable depth. No forced shoulder stretch.',
    ),
    ex(
      'inclinecurl',
      'Incline dumbbell curl',
      1,
      8,
      12,
      'Biceps',
      'per-dumbbell',
      false,
      'Pair A · overhead cable extension. One working round.',
    ),
    ex(
      'overhead',
      'Overhead cable extension',
      1,
      10,
      15,
      'Triceps',
      'stack',
      false,
      'Pair A · incline curl.',
    ),
    ex(
      'preacher',
      'Preacher curl',
      1,
      10,
      15,
      'Biceps',
      'total',
      false,
      'Pair B · rope pushdown. Note EZ-bar total or machine change.',
    ),
    ex('rope', 'Rope pushdown', 1, 10, 15, 'Triceps', 'stack', false, 'Pair B · preacher curl.'),
    ex(
      'bayesian',
      'Bayesian cable curl',
      1,
      10,
      15,
      'Biceps',
      'stack',
      true,
      'Pair C · dumbbell overhead extension.',
    ),
    ex(
      'dboverhead',
      'Dumbbell overhead extension',
      1,
      10,
      15,
      'Triceps',
      'single-dumbbell',
      false,
      'Pair C · Bayesian curl. Log the single dumbbell used.',
    ),
    ex(
      'spider',
      'Spider curl',
      1,
      10,
      15,
      'Biceps',
      'per-dumbbell',
      false,
      'Pair D · reverse-grip pushdown.',
    ),
    ex(
      'reversepush',
      'Reverse-grip pushdown',
      1,
      12,
      20,
      'Triceps',
      'stack',
      false,
      'Pair D · spider curl. Comfortable wrists.',
    ),
    ex('hammer', 'Dumbbell hammer curl', 1, 10, 15, 'Biceps', 'per-dumbbell'),
    ex('reversecurl', 'Reverse EZ-bar curl', 1, 12, 20, 'Biceps', 'total'),
  ].map((e) => [e.id, e]),
);
export const ARMS = [
  'cgbp',
  'dip',
  'inclinecurl',
  'overhead',
  'preacher',
  'rope',
  'bayesian',
  'dboverhead',
  'spider',
  'reversepush',
  'hammer',
  'reversecurl',
];
export const TEMPLATES = {
  upperA: {
    name: 'Upper A + arms',
    day: 'Monday',
    ids: ['incline', 'pullup', 'row', ...ARMS, 'lateral', 'rear'],
  },
  lowerA: {
    name: 'Lower A + abs',
    day: 'Tuesday',
    ids: ['hack', 'legcurl', 'extension', 'calf', 'rollout'],
  },
  arms: {
    name: 'Arms, delts & traps',
    day: 'Wednesday',
    ids: [...ARMS, 'dblateral', 'shrug', 'yraise'],
  },
  upperB: {
    name: 'Upper B + arms',
    day: 'Friday',
    ids: ['smith', 'highrow', 'lat', ...ARMS, 'lateral', 'rearfly'],
  },
  lowerB: {
    name: 'Lower B + abs',
    day: 'Saturday',
    ids: ['rdl', 'split', 'legcurl', 'calfseat', 'crunch'],
  },
};
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
    { 1: 'upperA', 2: 'lowerA', 3: 'arms', 5: 'upperB', 6: 'lowerB' }[
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
export function createSession(date, template, week = 1) {
  if (!TEMPLATES[template] || !validDate(date) || !Number.isInteger(week) || week < 1 || week > 8)
    throw Error('Choose a valid date, workout and week.');
  const exercises = TEMPLATES[template].ids.map((id) => {
    const e = EXERCISES[id];
    let count = id === 'legcurl' && template === 'lowerB' ? 2 : e.sets;
    if (week === 7 && !ARMS.includes(id)) count = count >= 3 ? 2 : 1;
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
    id: date + '_' + template,
    date,
    template,
    week,
    planVersion: PLAN_VERSION,
    exercises,
    notes: '',
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
          .map((e) => ({ date: s.date, week: s.week, exercise: e })),
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
      (avg === null ? 'not logged' : avg.toFixed(2) + ' kg (' + weights.length + ' recorded days)'),
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
      '; target: 5/week',
    'Completed working sets: ' +
      sessions.reduce((n, s) => n + progress(s).done, 0) +
      ' / ' +
      sessions.reduce((n, s) => n + progress(s).total, 0) +
      ' planned in recorded sessions',
    'Missing session templates: ' +
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
        TEMPLATES[s.template].name +
        ' · week ' +
        s.week +
        (s.week === 7 ? ' (DELOAD)' : ''),
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
      !TEMPLATES[s.template] ||
      s.id !== s.date + '_' + s.template ||
      ids.has(s.id) ||
      !Number.isInteger(s.week) ||
      s.week < 1 ||
      s.week > 8 ||
      !Array.isArray(s.exercises)
    )
      throw Error('Invalid workout in backup.');
    ids.add(s.id);
    const expected = createSession(s.date, s.template, s.week);
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
