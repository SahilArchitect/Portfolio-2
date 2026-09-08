import { LEGACY_PLAN } from './legacy-plan.mjs';
export const PLAN_VERSION = '2026-09-08-r2';
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
const current = Object.fromEntries(
  [
    ex(
      'incline',
      'Low-incline dumbbell press',
      4,
      12,
      12,
      'Chest',
      'per-dumbbell',
      false,
      'Use a lighter load for 4 × 12. Comfortable 15–30° incline.',
    ),
    ex(
      'pulldown',
      'Neutral-grip lat pulldown',
      4,
      12,
      12,
      'Back',
      'stack',
      false,
      'Drive elbows toward hips. Avoid torso heaving.',
    ),
    ex(
      'pecdeck',
      'Pec deck fly',
      3,
      10,
      12,
      'Chest',
      'stack',
      false,
      'Comfortable stretch; avoid forcing the shoulder behind the torso.',
    ),
    ex('lateral', 'Cable lateral raise', 3, 10, 12, 'Delts', 'stack', true),
    ex(
      'inclinecurl',
      'Incline dumbbell curl',
      3,
      10,
      12,
      'Biceps',
      'per-dumbbell',
      false,
      'Arms slightly behind torso; no forced shoulder stretch.',
    ),
    ex(
      'preacher',
      'Preacher EZ-bar curl',
      3,
      10,
      12,
      'Biceps',
      'total',
      false,
      'Include the bar weight. Supported upper arms; no bounce.',
    ),
    ex(
      'overhead',
      'Overhead cable triceps extension',
      3,
      10,
      12,
      'Triceps',
      'stack',
      false,
      'Controlled elbow flexion; comfortable overhead reach.',
    ),
    ex('rope', 'Cable rope pushdown', 3, 10, 12, 'Triceps', 'stack'),
    ex(
      'hack',
      'Hack squat / leg press',
      4,
      12,
      12,
      'Legs',
      'plates',
      false,
      'Record the machine and sled convention.',
    ),
    ex('legcurl', 'Seated leg curl', 3, 10, 12, 'Legs', 'stack'),
    ex('calf', 'Standing calf raise', 3, 12, 15, 'Calves', 'stack'),
    ex(
      'rollout',
      'Ab wheel rollout',
      3,
      10,
      12,
      'Core',
      'bodyweight',
      false,
      'Use a shorter rollout to keep the trunk controlled.',
    ),
    ex(
      'wristcurl',
      'Supported wrist curl',
      3,
      12,
      15,
      'Forearms',
      'per-dumbbell',
      false,
      'Forearms supported. Comfortable wrist flexion; note bar versus dumbbells.',
    ),
    ex(
      'cgbp',
      'Close-grip bench press',
      4,
      12,
      12,
      'Triceps',
      'total',
      false,
      'First exercise today. Shoulder-width grip; safeties or spotter.',
    ),
    ex(
      'dbcurl',
      'Dumbbell curl',
      3,
      10,
      12,
      'Biceps',
      'per-dumbbell',
      false,
      'Reps per arm; controlled supination without torso swing.',
    ),
    ex('hammer', 'Dumbbell hammer curl', 3, 10, 12, 'Biceps', 'per-dumbbell'),
    ex(
      'skullcrusher',
      'EZ-bar skull crusher',
      3,
      10,
      12,
      'Triceps',
      'total',
      false,
      'Start light. Controlled path clear of the face; do not train through elbow pain.',
    ),
    ex('dblateral', 'Dumbbell lateral raise', 3, 10, 12, 'Delts', 'per-dumbbell'),
    ex(
      'shrug',
      'Dumbbell shrug',
      3,
      10,
      12,
      'Traps',
      'per-dumbbell',
      false,
      'Smooth shoulder elevation; no rolling.',
    ),
    ex(
      'facepull',
      'Cable face pull',
      3,
      10,
      12,
      'Delts / traps',
      'stack',
      false,
      'Pull toward forehead with comfortable shoulder rotation.',
    ),
    ex(
      'cabley',
      'Cable Y-raise',
      3,
      10,
      12,
      'Traps',
      'stack',
      true,
      'Light load; reach upward and allow scapular rotation. This replaces prone Y-raises.',
    ),
    ex('crunch', 'Cable crunch', 3, 10, 12, 'Core', 'stack'),
    ex(
      'row',
      'Chest-supported row',
      4,
      12,
      12,
      'Back',
      'stack',
      false,
      'Elbows about 45–70°; controlled reach and retraction.',
    ),
    ex('lat', 'Single-arm cable lat pulldown', 4, 12, 12, 'Back', 'stack', true),
    ex('rearfly', 'Cable rear-delt fly', 3, 10, 12, 'Delts', 'stack', true),
    ex(
      'crosshammer',
      'Cross-body dumbbell hammer curl',
      3,
      10,
      12,
      'Biceps',
      'per-dumbbell',
      true,
      'Curl toward the opposite upper chest without shrugging or twisting.',
    ),
    ex(
      'rdl',
      'Romanian deadlift',
      4,
      12,
      12,
      'Legs',
      'total',
      false,
      'Modest load for twelve controlled reps. Bar close; hinge through hips.',
    ),
    ex(
      'split',
      'Supported Bulgarian split squat',
      4,
      12,
      12,
      'Legs',
      'per-dumbbell',
      true,
      'Use support to keep balance from limiting leg work.',
    ),
    ex('calfseat', 'Seated calf raise', 3, 12, 15, 'Calves', 'plates'),
    ex(
      'kneeraise',
      'Hanging knee raise',
      3,
      10,
      12,
      'Core',
      'bodyweight',
      false,
      'Curl the pelvis upward without swinging. Captain’s chair is an alternative.',
    ),
    ex(
      'reversewrist',
      'Supported reverse wrist curl',
      3,
      12,
      15,
      'Forearms',
      'per-dumbbell',
      false,
      'Light load; supported forearms and comfortable wrist extension.',
    ),
  ].map((e) => [e.id, e]),
);
export const EXERCISES = { ...LEGACY_PLAN.exercises, ...current };
export const ARMS = [...new Set([...LEGACY_PLAN.arms, 'dbcurl', 'crosshammer', 'skullcrusher'])];
export const TEMPLATES = {
  upperA: {
    name: 'Upper A + arms',
    day: 'Monday',
    ids: [
      'incline',
      'pulldown',
      'pecdeck',
      'lateral',
      'inclinecurl',
      'overhead',
      'preacher',
      'rope',
    ],
    pairing:
      'Incline curl ↔ overhead cable extension; preacher curl ↔ rope pushdown. Three rounds per pair.',
  },
  lowerA: {
    name: 'Lower A + abs & forearms',
    day: 'Tuesday',
    ids: ['hack', 'legcurl', 'calf', 'rollout', 'wristcurl'],
    pairing:
      'Straight sets on hack squat. Calves and wrist work may alternate after the main lifts.',
  },
  arms: {
    name: 'Arms, delts, traps & abs',
    day: 'Wednesday',
    ids: [
      'cgbp',
      'dbcurl',
      'skullcrusher',
      'hammer',
      'dblateral',
      'shrug',
      'facepull',
      'cabley',
      'crunch',
    ],
    pairing:
      'Close-grip bench first. DB curl ↔ skull crusher; hammer curl ↔ lateral raise. Three rounds per accessory pair.',
  },
  upperB: {
    name: 'Back, pec deck + arms',
    day: 'Friday',
    ids: [
      'row',
      'lat',
      'pecdeck',
      'lateral',
      'rearfly',
      'preacher',
      'overhead',
      'crosshammer',
      'rope',
    ],
    pairing:
      'Preacher curl ↔ overhead cable extension; cross-body hammer curl ↔ rope pushdown. Three rounds per pair.',
  },
  lowerB: {
    name: 'Lower B + abs & forearms',
    day: 'Saturday',
    ids: ['rdl', 'split', 'legcurl', 'calfseat', 'kneeraise', 'reversewrist'],
    pairing:
      'RDL and split squat as straight sets. Finish with controlled core and wrist-extension work.',
  },
};
export function planFor(version = PLAN_VERSION) {
  if (version === LEGACY_PLAN.version) return LEGACY_PLAN;
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
    return (
      'Earlier prescription: original exercises and set counts are preserved. New sessions use the revised 3-set / 4-set plan.' +
      (s.week === 7 ? ' This older deload used reduced set counts.' : '')
    );
  if (s.week === 7)
    return 'Easier week: keep 4 sets for compounds and 3 for isolations; use lighter loads and 4–5 RIR. No finishers.';
  return (
    'Compounds 4 × 12; isolations 3 × 10–12 (calves/wrists 12–15). ' +
    TEMPLATES[s.template].pairing +
    ' Rest 90–120 sec after pairs; 2–3 min for compounds.'
  );
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
export function createSession(date, template, week = 1, planVersion = PLAN_VERSION) {
  const plan = planFor(planVersion);
  if (!TEMPLATES[template] || !validDate(date) || !Number.isInteger(week) || week < 1 || week > 8)
    throw Error('Choose a valid date, workout and week.');
  const exercises = plan.templates[template].ids.map((id) => {
    const e = plan.exercises[id];
    let count = e.sets;
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
      !TEMPLATES[s.template] ||
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
