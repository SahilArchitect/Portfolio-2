import { LEGACY_PLAN } from './legacy-plan.mjs';
import { PREVIOUS_PLAN } from './previous-plan.mjs';
import { R3_PLAN } from './r3-plan.mjs';
import { R4_PLAN } from './r4-plan.mjs';
import { R5_PLAN } from './r5-plan.mjs';
export const PLAN_VERSION = '2026-09-13-r6';
export const STORAGE_KEY = 'trident-forge-v1';
export const EXERCISES = {
  ...R4_PLAN.exercises,
  inclinesmith: {
    ...R4_PLAN.exercises.inclinesmith,
    sets: 4,
    min: 8,
    max: 12,
  },
  hack: { ...R4_PLAN.exercises.hack, sets: 4 },
  reversecurl: {
    ...R4_PLAN.exercises.reversecurl,
    sets: 3,
    group: 'Forearms',
    cue: 'Keep the wrists neutral and elbows still; use controlled elbow flexion to train brachioradialis and forearm extensors.',
  },
  rollout: {
    ...R4_PLAN.exercises.rollout,
    min: 12,
    max: 15,
  },
  skullcrusher: {
    ...R4_PLAN.exercises.skullcrusher,
    min: 10,
    max: 12,
  },
  facepull: {
    ...R4_PLAN.exercises.facepull,
    min: 12,
    max: 20,
    group: 'Rear delts',
  },
  cgbp: {
    ...R4_PLAN.exercises.cgbp,
    sets: 3,
    min: 8,
    max: 12,
    cue: 'Shoulder-width grip; use safeties or a spotter. Keep the elbows in a comfortable path.',
  },
  highlowfly: {
    id: 'highlowfly',
    name: 'High-to-low cable fly',
    sets: 3,
    min: 15,
    max: 20,
    group: 'Chest',
    basis: 'stack',
    unilateral: false,
    cue: 'Bring the handles down and inward in a controlled arc; keep shoulders comfortable and avoid turning it into a press.',
  },
  midtrapshrug: {
    id: 'midtrapshrug',
    name: 'Chest-supported incline dumbbell shrug',
    sets: 3,
    min: 10,
    max: 15,
    group: 'Middle traps',
    basis: 'per-dumbbell',
    unilateral: false,
    cue: 'Keep arms straight and retract the shoulder blades without rowing the elbows. This is the middle-trap shrug slot.',
  },
  barpushdown: {
    id: 'barpushdown',
    name: 'Straight-bar cable triceps pushdown',
    sets: 3,
    min: 10,
    max: 15,
    group: 'Triceps',
    basis: 'stack',
    unilateral: false,
    cue: 'Use a straight or angled bar, distinct from Monday’s rope attachment; keep upper arms still.',
  },
  behindwrist: {
    id: 'behindwrist',
    name: 'Behind-the-back barbell wrist curl',
    sets: 3,
    min: 12,
    max: 20,
    group: 'Forearms',
    basis: 'total',
    unilateral: false,
    cue: 'Hold the bar behind the hips with arms still; flex the wrists through a comfortable range. Use a light load and log total bar plus plates.',
  },
};
export const ARMS = [...R4_PLAN.arms, 'barpushdown'];
export const TEMPLATES = {
  push: {
    name: 'Push · Smith incline',
    day: 'Monday',
    kind: 'lifting',
    ids: ['inclinesmith', 'pecdeck', 'lateral', 'overhead', 'rope', 'highlowfly', 'skullcrusher'],
    pairing:
      'Smith press first. Optional pec deck ↔ lateral raise and high-to-low fly ↔ rope pushdown. Keep overhead extensions and skull crushers controlled; stop skull crushers if elbows hurt.',
    cardio: 'Optional 10 min easy treadmill after lifting. No intervals.',
  },
  pull: {
    name: 'Pull · normal hammer curls',
    day: 'Tuesday',
    kind: 'lifting',
    ids: ['pulldown', 'row', 'rear', 'shrug', 'inclinecurl', 'hammer', 'dbcurl', 'midtrapshrug'],
    pairing:
      'Pulldown and row first. Dumbbell shrugs target upper traps; chest-supported incline shrugs target middle traps. Keep all three curl variations distinct and controlled.',
    cardio: 'Comfortable daily walking; no required finisher.',
  },
  legs: {
    name: 'Legs · quads, abs & forearms',
    day: 'Wednesday',
    kind: 'lifting',
    ids: ['hack', 'legcurl', 'extension', 'calf', 'crunch', 'reversecurl', 'rollout'],
    pairing: 'Hack squat first. Optional calves ↔ cable crunch; reverse EZ-bar curls and ab-wheel rollouts last.',
    cardio: "No required finisher; save energy for Thursday's easy cardio.",
  },
  cardio: {
    name: 'Cardio + arms, forearms & lower traps',
    day: 'Thursday',
    kind: 'hybrid',
    ids: ['dbcurl', 'hammer', 'cgbp', 'barpushdown', 'wristcurl', 'reversewrist', 'facepull', 'cabley'],
    pairing:
      'Two biceps exercises, two triceps exercises and two forearm exercises. Pair dumbbell curl ↔ close-grip bench, hammer curl ↔ bar pushdown, and wrist curl ↔ reverse wrist curl if performance remains stable. Face pulls train rear delts; cable Y-raises provide the weekly direct lower-trap slot.',
    cardio:
      '5 min easy warm-up, 30–40 min treadmill at conversational effort (RPE 3–4/10), then 5 min cool-down. Start near 30 min. Optional 5–10 min comfortable mobility. Keep incline gentle after Wednesday legs. From week 3, only if recovered, replace up to 10 min of treadmill with easy SkiErg, light sled push/rope-pull sled, battle ropes, kettlebell carries or a taught slam-rated ball drill, RPE ≤5/10. Choose ONE; no all-out circuit.',
  },
  upper: {
    name: 'Upper · chest, back, delts & arms',
    day: 'Friday',
    kind: 'lifting',
    ids: ['incline', 'row', 'lat', 'lateral', 'rear', 'preacher', 'overhead', 'crosshammer'],
    pairing:
      'Press, row and pulldown first. Optional preacher curl ↔ overhead extension; rear-delt fly ↔ cross-body hammer curl. Three rounds per pair. Allow 85–110 min including warm-up; stop within 120 min.',
    cardio: 'No required finisher. Preserve recovery for Saturday lower.',
  },
  lower: {
    name: 'Lower · posterior chain, abs & forearms',
    day: 'Saturday',
    kind: 'lifting',
    ids: ['rdl', 'legpress', 'legcurl', 'calfseat', 'kneeraise', 'behindwrist'],
    pairing:
      'RDL and leg press as straight sets. Behind-the-back wrist curls last. Use familiar lifting straps if grip limits RDL after Friday upper.',
    cardio: 'No required finisher. Comfortable walking; Sunday is rest.',
  },
};
export function planFor(version = PLAN_VERSION) {
  if (version === LEGACY_PLAN.version) return LEGACY_PLAN;
  if (version === PREVIOUS_PLAN.version) return PREVIOUS_PLAN;
  if (version === R3_PLAN.version) return R3_PLAN;
  if (version === R4_PLAN.version) return R4_PLAN;
  if (version === R5_PLAN.version) return R5_PLAN;
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
  if (isCardio(s))
    return (
      'Cardio day: no lifting sets. Keep effort conversational; record minutes and equipment. ' +
      (s.week === 7
        ? 'Deload: 20–30 min easy walking only.'
        : 'Gym window 07:00–09:00; finish when the session is done.')
    );
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return 'Earlier prescription: saved exercises, reps and set counts are preserved. New sessions use six lifting exposures, with arms and cardio combined on Thursday.';
  if (s.week === 7)
    return 'Deload: 2 working sets per exercise, lighter loads and 4–5 RIR. Easy walking only; no conditioning intervals.';
  return (
    'Follow each prescribed set count and rep range. Start at 3 RIR, then use 1–3 RIR as recovered. ' +
    TEMPLATES[s.template].pairing +
    ' Rest 2–3 min for compounds, 60–120 sec for accessories. Stop within 120 min.'
  );
}
export function sessionCardio(s) {
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return 'Earlier workout: record only the cardio actually performed.';
  return s.week === 7
    ? requiresCardio(s)
      ? '20–30 min easy walking. No intervals; mobility is optional.'
      : 'Easy walking only; no conditioning intervals.'
    : TEMPLATES[s.template].cardio;
}
export function exerciseRir(s, id) {
  if (s.week === 7) return '4–5';
  if (![PLAN_VERSION, R5_PLAN.version, R4_PLAN.version].includes(s.planVersion))
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
    'cgbp',
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
    { 1: 'push', 2: 'pull', 3: 'legs', 4: 'cardio', 5: 'upper', 6: 'lower' }[
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
    let count =
      [PLAN_VERSION, R5_PLAN.version, R4_PLAN.version].includes(planVersion) && week === 7
        ? 2
        : e.sets;
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
  const session = {
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
  if (plan.templates[template].kind === 'hybrid') session.cardioDuration = '';
  return session;
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
export function isCardio(s) {
  return planFor(s.planVersion || LEGACY_PLAN.version).templates[s.template].kind === 'cardio';
}
export function requiresCardio(s) {
  return ['cardio', 'hybrid'].includes(
    planFor(s.planVersion || LEGACY_PLAN.version).templates[s.template].kind,
  );
}
export function isLifting(s) {
  return planFor(s.planVersion || LEGACY_PLAN.version).templates[s.template].kind !== 'cardio';
}
export function cardioValid(s) {
  return (
    requiresCardio(s) &&
    numberIn(isCardio(s) ? s.duration : s.cardioDuration, 1, 180) &&
    typeof s.cardio === 'string' &&
    s.cardio.trim().length > 0
  );
}
export function sessionActivity(s) {
  if (isCardio(s)) return 'Cardio · ' + (s.duration || '—') + ' min';
  const p = progress(s);
  return (
    p.done +
    '/' +
    p.total +
    ' sets' +
    (requiresCardio(s) ? ' · cardio ' + (s.cardioDuration || '—') + ' min' : '')
  );
}
export function sessionHasActivity(s) {
  return isCardio(s)
    ? s.status === 'finished' && cardioValid(s)
    : progress(s).done > 0 || (requiresCardio(s) && cardioValid(s));
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
      '; current target: 6 lifting exposures + 1 cardio dose/week; Thursday supplies both (do not repeat completed days during the transition)',
    'Finished lifting sessions: ' +
      sessions.filter((s) => isLifting(s) && s.status === 'finished').length +
      '/6; finished cardio doses: ' +
      sessions.filter((s) => requiresCardio(s) && s.status === 'finished' && cardioValid(s)).length +
      '/1; cardio-session minutes logged: ' +
      sessions
        .filter((s) => cardioValid(s))
        .reduce((n, s) => n + Number(isCardio(s) ? s.duration : s.cardioDuration), 0),
    'Completed working sets: ' +
      sessions.reduce((n, s) => n + progress(s).done, 0) +
      ' / ' +
      sessions.reduce((n, s) => n + progress(s).total, 0) +
      ' planned in recorded sessions',
    'Current templates not logged (older workouts stay under their original names): ' +
      (Object.keys(TEMPLATES)
        .filter(
          (t) =>
            !sessions.some(
              (s) =>
                s.template === t && s.planVersion === PLAN_VERSION && sessionHasActivity(s),
            ),
        )
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
        '; activity ' +
        sessionActivity(s) +
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
      (s.cardioDuration !== undefined &&
        !(s.cardioDuration === '' || numberIn(s.cardioDuration, 1, 180))) ||
      !Number.isFinite(Date.parse(s.updatedAt))
    )
      throw Error('Invalid workout notes/date.');
    if (requiresCardio(s) && s.status === 'finished' && !cardioValid(s))
      throw Error('Finished cardio requires 1–180 minutes and a description of activity.');
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
