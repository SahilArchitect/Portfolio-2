import { LEGACY_PLAN } from './legacy-plan.mjs';
import { PREVIOUS_PLAN } from './previous-plan.mjs';
import { R3_PLAN } from './r3-plan.mjs';
import { R4_PLAN } from './r4-plan.mjs';
import { R5_PLAN } from './r5-plan.mjs';
import { R6_PLAN } from './r6-plan.mjs';
export const PLAN_VERSION = '2026-09-29-r7';
export const STORAGE_KEY = 'trident-forge-v1';
// Retain historical IDs for validation and load references; only template IDs prescribe work.
export const EXERCISES = {
  ...R6_PLAN.exercises,
  inclinesmith: {
    ...R6_PLAN.exercises.inclinesmith,
    sets: 3,
    min: 6,
    max: 10,
    cue: '15–30° incline; set safeties. Log plates added only and identify the Smith machine. Lower through a comfortable range; no grinding.',
  },
  incline: { ...R6_PLAN.exercises.incline, sets: 3, min: 8, max: 12 },
  pecdeck: { ...R6_PLAN.exercises.pecdeck, sets: 2, min: 10, max: 15 },
  lateral: {
    ...R6_PLAN.exercises.lateral,
    sets: 4,
    min: 12,
    max: 20,
    group: 'Side delts',
    cue: 'Raise in a comfortable plane without heaving or shrugging. Log both sides; one set includes both arms. Dumbbells are a practical substitute.',
  },
  overhead: { ...R6_PLAN.exercises.overhead, sets: 2, min: 10, max: 15 },
  rope: {
    ...R6_PLAN.exercises.rope,
    sets: 2,
    min: 10,
    max: 15,
    cue: 'Keep upper arms steady; extend the elbows without leaning your body into the stack.',
  },
  pulldown: {
    ...R6_PLAN.exercises.pulldown,
    sets: 3,
    min: 8,
    max: 12,
    cue: 'Reach overhead comfortably, then drive elbows down without torso heaving. Use a grip that your shoulders tolerate.',
  },
  row: {
    ...R6_PLAN.exercises.row,
    sets: 3,
    min: 8,
    max: 12,
    cue: 'Keep chest supported. Let shoulder blades move, then pull with elbows about 30–60° from the torso; no forced retraction.',
  },
  rear: {
    ...R6_PLAN.exercises.rear,
    sets: 3,
    min: 12,
    max: 20,
    group: 'Rear delts',
  },
  inclinecurl: { ...R6_PLAN.exercises.inclinecurl, sets: 2, min: 8, max: 12 },
  preacher: {
    ...R6_PLAN.exercises.preacher,
    sets: 2,
    min: 8,
    max: 12,
    cue: 'Keep upper arms supported and use a comfortable extended-elbow position; no bouncing. Log total bar plus plates.',
  },
  hammer: {
    ...R6_PLAN.exercises.hammer,
    sets: 2,
    min: 10,
    max: 15,
    cue: 'Curl beside the torso with a neutral grip; keep shoulders still. Train both arms with controlled reps.',
  },
  shrug: {
    ...R6_PLAN.exercises.shrug,
    sets: 3,
    min: 10,
    max: 15,
    group: 'Upper traps',
  },
  cabley: {
    ...R6_PLAN.exercises.cabley,
    sets: 2,
    min: 12,
    max: 20,
    group: 'Lower traps',
    cue: 'Use a light load; reach into a comfortable Y and let shoulder blades rotate upward. This is an emphasis, not isolation of one trap region.',
  },
  lat: {
    ...R6_PLAN.exercises.lat,
    sets: 3,
    min: 10,
    max: 15,
    cue: 'Reach up comfortably and pull elbow toward the hip without twisting. Record both sides; one set includes both arms.',
  },
  hack: { ...R6_PLAN.exercises.hack, sets: 3, min: 6, max: 10 },
  legcurl: {
    ...R6_PLAN.exercises.legcurl,
    sets: 3,
    min: 10,
    max: 15,
    cue: 'Keep hips against the pad; use a controlled comfortable range without bouncing.',
  },
  extension: {
    ...R6_PLAN.exercises.extension,
    sets: 2,
    min: 10,
    max: 15,
    cue: 'Align the knee with the machine pivot; lift and lower under control in a tolerable range.',
  },
  calf: {
    ...R6_PLAN.exercises.calf,
    sets: 3,
    min: 8,
    max: 15,
    cue: 'Keep knees nearly straight; lower heels into a comfortable stretch and rise without bouncing.',
  },
  calfseat: {
    ...R6_PLAN.exercises.calfseat,
    sets: 3,
    min: 12,
    max: 20,
    cue: 'Use a comfortable heel stretch and controlled rise; avoid short bouncing reps.',
  },
  crunch: {
    ...R6_PLAN.exercises.crunch,
    sets: 2,
    min: 10,
    max: 15,
    cue: 'Flex the trunk by bringing ribs toward pelvis; avoid turning this into a hip hinge.',
  },
  kneeraise: { ...R6_PLAN.exercises.kneeraise, sets: 2, min: 10, max: 15 },
};
export const ARMS = R6_PLAN.arms;
const pushCardio =
  'After lifting: 15–20 min conversational treadmill walking or easy cycling, RPE 3–4/10, including an easy start and finish. Skip or shorten if recovery or the 120-minute ceiling requires it; log actual minutes (0 if skipped).';
export const TEMPLATES = {
  pushA: {
    name: 'Push A · upper chest & side delts',
    day: 'Monday',
    kind: 'lifting',
    ids: ['inclinesmith', 'lateral', 'pecdeck', 'overhead', 'rope'],
    pairing:
      'Smith press first, then lateral raises. Optional pec deck ↔ pushdown after straight sets for priority lifts. No supersets required.',
    cardio: pushCardio,
  },
  pullA: {
    name: 'Pull A · lats, rear delts & upper traps',
    day: 'Tuesday',
    kind: 'lifting',
    ids: ['pulldown', 'row', 'rear', 'inclinecurl', 'hammer', 'shrug'],
    pairing:
      'Pulldown and supported row as straight sets. Curls follow back work; shrugs last. Use straps if grip limits the target muscle.',
    cardio: 'No required finisher. Keep normal daily walking consistent.',
  },
  legsA: {
    name: 'Legs A · quads, hamstrings & calves',
    day: 'Wednesday',
    kind: 'lifting',
    ids: ['hack', 'legcurl', 'extension', 'calf', 'crunch'],
    pairing:
      'Hack squat first. Optional calves ↔ cable crunch if both stations are available and performance stays stable.',
    cardio: 'No required finisher. Comfortable daily walking.',
  },
  pushB: {
    name: 'Push B · upper chest & side delts',
    day: 'Thursday',
    kind: 'lifting',
    ids: ['incline', 'lateral', 'pecdeck', 'overhead', 'rope'],
    pairing:
      'Incline dumbbells first, then lateral raises. Repeat familiar accessories; optional pec deck ↔ pushdown. Keep each equipment/load convention consistent.',
    cardio: pushCardio,
  },
  pullB: {
    name: 'Pull B · lats, rear delts & arms',
    day: 'Friday',
    kind: 'lifting',
    ids: ['lat', 'row', 'rear', 'preacher', 'hammer'],
    pairing:
      'Single-arm pulldown and supported row first. One unilateral set includes both sides. Optional rear-delt fly ↔ preacher curl; No extra trap-isolation slot.',
    cardio: 'No required finisher. Preserve recovery for Saturday legs.',
  },
  legsB: {
    name: 'Legs B · posterior chain & quads',
    day: 'Saturday',
    kind: 'lifting',
    ids: ['rdl', 'legpress', 'legcurl', 'calfseat', 'kneeraise'],
    pairing:
      'RDL and leg press as straight sets. Optional seated calves ↔ knee raises. Use familiar straps if grip limits RDL; do not force a lower-back stretch.',
    cardio: 'No required finisher. Sunday is rest.',
  },
};
export function planFor(version = PLAN_VERSION) {
  if (version === LEGACY_PLAN.version) return LEGACY_PLAN;
  if (version === PREVIOUS_PLAN.version) return PREVIOUS_PLAN;
  if (version === R3_PLAN.version) return R3_PLAN;
  if (version === R4_PLAN.version) return R4_PLAN;
  if (version === R5_PLAN.version) return R5_PLAN;
  if (version === R6_PLAN.version) return R6_PLAN;
  if (version === PLAN_VERSION)
    return {
      version: PLAN_VERSION,
      exercises: EXERCISES,
      templates: TEMPLATES,
      arms: ARMS,
    };
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
    return 'Earlier prescription: saved exercises, reps and set counts are preserved. New sessions use Push/Pull/Legs twice weekly; resume saved workouts without repeating completed days.';
  if (s.week === 7)
    return 'Deload: half the normal sets, rounded up (2→1, 3→2, 4→2), at 4–5 RIR. Reduce load as needed. Easy cardio only.';
  return (
    'Week 1: 3 RIR; week 2: 2–3; weeks 3–6: compounds 2–3, accessories 1–2; week 8: 2. Add load only when all sets reach the rep ceiling at target RIR. ' +
    TEMPLATES[s.template].pairing +
    ' Rest 2–3 min for compounds (up to 4 if needed), 90–120 sec for accessories. Budget 60–95 min lifting; finish within 120 min including cardio.'
  );
}
export function sessionCardio(s) {
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return 'Earlier workout: record only the cardio actually performed.';
  if (s.week === 7)
    return ['pushA', 'pushB'].includes(s.template)
      ? 'Optional 10–15 min easy walking; reduce or skip if tired. Log actual minutes, 0 if skipped.'
      : 'Comfortable walking only; no required finisher.';
  return TEMPLATES[s.template].cardio;
}
export function exerciseRir(s, id) {
  if (s.week === 7) return '4–5';
  if (![PLAN_VERSION, R6_PLAN.version, R5_PLAN.version, R4_PLAN.version].includes(s.planVersion))
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
    ? s.planVersion === PLAN_VERSION
      ? '2–3'
      : '2'
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
    let count =
      [R6_PLAN.version, R5_PLAN.version, R4_PLAN.version].includes(planVersion) && week === 7
        ? 2
        : e.sets;
    if (planVersion === PLAN_VERSION && week === 7) count = Math.ceil(e.sets / 2);
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
  if (plan.templates[template].kind === 'hybrid' || planVersion === PLAN_VERSION)
    session.cardioDuration = '';
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
    (typeof v === 'string' || typeof v === 'number') &&
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
    (requiresCardio(s) || s.planVersion === PLAN_VERSION) &&
    numberIn(
      isCardio(s) ? s.duration : s.cardioDuration,
      1,
      s.planVersion === PLAN_VERSION ? 120 : 180,
    ) &&
    typeof s.cardio === 'string' &&
    s.cardio.trim().length > 0
  );
}
export function cardioLogRequired(s) {
  return (
    requiresCardio(s) ||
    (s.planVersion === PLAN_VERSION &&
      s.cardioDuration !== '' &&
      s.cardioDuration !== undefined &&
      Number(s.cardioDuration) !== 0)
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
    (requiresCardio(s) || cardioValid(s) ? ' · cardio ' + (s.cardioDuration || '—') + ' min' : '')
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
      '; current target: 6 lifting sessions/week (PPL twice); 2 easy cardio bouts planned after push days, reduced or skipped if recovery requires; do not repeat completed days during transition',
    'Finished lifting sessions: ' +
      sessions.filter((s) => isLifting(s) && s.status === 'finished').length +
      '/6; finished cardio bouts: ' +
      sessions.filter((s) => s.status === 'finished' && cardioValid(s)).length +
      ' (2 planned); cardio minutes logged: ' +
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
              (s) => s.template === t && s.planVersion === PLAN_VERSION && sessionHasActivity(s),
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
        !(
          s.cardioDuration === '' ||
          numberIn(
            s.cardioDuration,
            s.planVersion === PLAN_VERSION ? 0 : 1,
            s.planVersion === PLAN_VERSION ? 120 : 180,
          )
        )) ||
      !Number.isFinite(Date.parse(s.updatedAt))
    )
      throw Error('Invalid workout notes/date.');
    if (cardioLogRequired(s) && s.status === 'finished' && !cardioValid(s))
      throw Error('Logged cardio requires valid minutes and a description of activity.');
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
