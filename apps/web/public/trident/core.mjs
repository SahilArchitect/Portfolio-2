import { LEGACY_PLAN } from './legacy-plan.mjs';
import { PREVIOUS_PLAN } from './previous-plan.mjs';
import { R3_PLAN } from './r3-plan.mjs';
import { R4_PLAN } from './r4-plan.mjs';
import { R5_PLAN } from './r5-plan.mjs';
import { R6_PLAN } from './r6-plan.mjs';
import { R7_PLAN } from './r7-plan.mjs';
export const PLAN_VERSION = '2026-10-05-r8';
export const STORAGE_KEY = 'trident-forge-v1';
// Retain historical IDs for validation and load references; only template IDs prescribe work.
export const EXERCISES = {
  ...R7_PLAN.exercises,
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
  overhead: { ...R6_PLAN.exercises.overhead, sets: 3, min: 10, max: 15 },
  rope: {
    ...R6_PLAN.exercises.rope,
    sets: 3,
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
  inclinecurl: { ...R6_PLAN.exercises.inclinecurl, sets: 3, min: 8, max: 12 },
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
    sets: 3,
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
  chestpress: {
    id: 'chestpress', name: 'Machine chest press', sets: 2, min: 8, max: 12,
    group: 'Chest', basis: 'stack', unilateral: false,
    cue: 'Choose a comfortable horizontal press path and record the machine. A flat dumbbell press is a substitute; select per-dumbbell load and note the change.',
  },
  straightlat: {
    id: 'straightlat', name: 'Straight-arm cable pulldown', sets: 2, min: 12, max: 15,
    group: 'Back', basis: 'stack', unilateral: false,
    cue: 'Keep a small fixed elbow bend and bring arms toward hips without turning it into a pushdown or swinging the torso.',
  },
  shoulderpress: {
    id: 'shoulderpress', name: 'Seated machine shoulder press', sets: 2, min: 8, max: 12,
    group: 'Shoulders', basis: 'stack', unilateral: false,
    cue: 'Use a comfortable grip and controlled overhead range; no forced depth. Record the machine; stop if shoulder symptoms appear.',
  },
  lowhighfly: {
    id: 'lowhighfly', name: 'Low-to-high cable fly', sets: 2, min: 12, max: 15,
    group: 'Chest', basis: 'stack', unilateral: false,
    cue: 'Bring both handles up and inward in a controlled arc; use a comfortable shoulder range. Log stack kg per side consistently.',
  },
  widerow: {
    id: 'widerow', name: 'Wide-grip seated cable row', sets: 3, min: 8, max: 12,
    group: 'Back', basis: 'stack', unilateral: false,
    cue: 'Use a comfortable wider handle and supported upright torso; let shoulder blades move without heaving. Record handle and machine.',
  },
  lateralpull: {
    ...R7_PLAN.exercises.lateral,
    id: 'lateralpull', sets: 3, min: 15, max: 20,
    cue: 'Light cable lateral raise after pulling. Record both sides; one set includes both arms. Match the setup across pull days.',
  },
};
export const ARMS = R6_PLAN.arms;
const pushCardio =
  'After lifting: 15–20 min conversational treadmill walking or easy cycling, RPE 3–4/10, including an easy start and finish. Skip or shorten if recovery or the 120-minute ceiling requires it; log actual minutes (0 if skipped).';
export const TEMPLATES = {
  pushA: {
    name: 'Push A · upper chest & side delts',
    day: 'Day 1',
    kind: 'lifting',
    ids: ['inclinesmith', 'lateral', 'chestpress', 'pecdeck', 'overhead'],
    pairing:
      'Smith press first, then lateral raises and horizontal chest press. Optional pec deck ↔ overhead extension. Keep priority lifts as straight sets.',
    cardio: pushCardio,
  },
  pullA: {
    name: 'Pull A · lats, rear delts & side delts',
    day: 'Day 2',
    kind: 'lifting',
    ids: ['pulldown', 'row', 'straightlat', 'rear', 'inclinecurl', 'lateralpull'],
    pairing:
      'Pulldown and supported row as straight sets, then straight-arm pulldown. Curl after back work; light lateral raises last. No shrugs.',
    cardio: 'No required finisher. Keep normal daily walking consistent.',
  },
  legsA: {
    name: 'Legs A · quads, hamstrings & calves',
    day: 'Day 3',
    kind: 'lifting',
    ids: ['hack', 'legcurl', 'extension', 'calf', 'crunch'],
    pairing:
      'Hack squat first. Optional calves ↔ cable crunch if both stations are available and performance stays stable.',
    cardio: 'No required finisher. Comfortable daily walking.',
  },
  pushB: {
    name: 'Push B · upper chest & side delts',
    day: 'Day 5',
    kind: 'lifting',
    ids: ['incline', 'lateral', 'shoulderpress', 'lowhighfly', 'rope'],
    pairing:
      'Incline dumbbells first, then lateral raises and machine shoulder press. Optional cable fly ↔ rope pushdown. No extra Y-raise or duplicate lateral slot.',
    cardio: pushCardio,
  },
  pullB: {
    name: 'Pull B · lats, rear delts & arms',
    day: 'Day 6',
    kind: 'lifting',
    ids: ['lat', 'widerow', 'rear', 'preacher', 'hammer', 'lateralpull'],
    pairing:
      'Single-arm pulldown and wide cable row first. One unilateral set includes both sides. Optional rear fly ↔ preacher curl; light lateral raises last.',
    cardio: 'No required finisher. Preserve recovery for the next leg session.',
  },
  legsB: {
    name: 'Legs B · posterior chain & quads',
    day: 'Day 7',
    kind: 'lifting',
    ids: ['rdl', 'legpress', 'legcurl', 'calfseat', 'kneeraise'],
    pairing:
      'RDL and leg press as straight sets. Optional seated calves ↔ knee raises. Use familiar straps if grip limits RDL; do not force a lower-back stretch.',
    cardio: 'No required finisher. Day 8 is rest.',
  },
};
export function planFor(version = PLAN_VERSION) {
  if (version === LEGACY_PLAN.version) return LEGACY_PLAN;
  if (version === PREVIOUS_PLAN.version) return PREVIOUS_PLAN;
  if (version === R3_PLAN.version) return R3_PLAN;
  if (version === R4_PLAN.version) return R4_PLAN;
  if (version === R5_PLAN.version) return R5_PLAN;
  if (version === R6_PLAN.version) return R6_PLAN;
  if (version === R7_PLAN.version) return R7_PLAN;
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
export const VOLUME_PHASES = {
  entry: 'Entry · 2 sets per exercise (64/cycle)',
  foundation: 'Foundation · 10 side-delt sets (85/cycle)',
  build: 'Build · 12 side-delt sets (87/cycle)',
  full: 'Full · 14 side-delt sets (89/cycle)',
};
export function defaultVolumePhase(week) {
  return week === 1 ? 'foundation' : week === 2 ? 'build' : 'full';
}
export function prescribedSets(version, template, id, week, phase = defaultVolumePhase(week)) {
  const e = exerciseDefinition(id, version);
  if (version === R7_PLAN.version) return week === 7 ? Math.ceil(e.sets / 2) : e.sets;
  if (version !== PLAN_VERSION) return e.sets;
  if (!Object.hasOwn(VOLUME_PHASES, phase)) throw Error('Choose a valid volume phase.');
  if (week === 7) return Math.ceil(e.sets / 2);
  if (phase === 'entry') return Math.min(2, e.sets);
  if (id === 'lateral') return phase === 'foundation' ? 3 : 4;
  if (id === 'lateralpull') return phase === 'full' ? 3 : 2;
  return e.sets;
}
export function supportsOptionalCardio(s) {
  return [PLAN_VERSION, R7_PLAN.version].includes(s.planVersion);
}
export function sessionInstructions(s) {
  if (isCardio(s))
    return (
      'Cardio day: no lifting sets. Keep effort conversational; record minutes and equipment. ' +
      (s.week === 7
        ? 'Deload: 20–30 min easy walking only.'
        : 'Gym window 07:00–09:00; finish when the session is done.')
    );
  if (s.planVersion === R7_PLAN.version)
    return s.week === 7
      ? 'Deload: half the normal sets, rounded up (2→1, 3→2, 4→2), at 4–5 RIR. Reduce load as needed.'
      : 'Earlier r7 prescription: Week 1: 3 RIR; week 2: 2–3; weeks 3–6: compounds 2–3, accessories 1–2; week 8: 2. Add load only when all sets reach the rep ceiling at target RIR. ' + R7_PLAN.templates[s.template].pairing;
  if ((s.planVersion || LEGACY_PLAN.version) !== PLAN_VERSION)
    return 'Earlier prescription: saved exercises, reps and set counts are preserved. New sessions use an eight-day Push/Pull/Legs/rest rotation; resume saved workouts without repeating completed days.';
  if (s.week === 7)
    return 'Deload: half the normal sets, rounded up (2→1, 3→2, 4→2), at 4–5 RIR. Reduce load as needed. Easy cardio only.';
  return (
    VOLUME_PHASES[s.volumePhase || defaultVolumePhase(s.week)] + '. Advance volume only after a full cycle of stable performance, tolerable soreness and no joint pain; hold the phase if recovery is poor. Cycle 1: 3 RIR; cycle 2: 2–3; cycles 3–6: compounds 2–3, accessories 1–2; cycle 8: 2. Entry sessions always use 3 RIR. Add load only when all sets reach the rep ceiling at target RIR. ' +
    TEMPLATES[s.template].pairing +
    ' Rest 2–3 min for compounds (up to 4 if needed), 90–120 sec for accessories. Budget 60–95 min lifting; finish within 120 min including cardio.'
  );
}
export function sessionCardio(s) {
  if (![PLAN_VERSION, R7_PLAN.version].includes(s.planVersion || LEGACY_PLAN.version))
    return 'Earlier workout: record only the cardio actually performed.';
  if (s.week === 7)
    return ['pushA', 'pushB'].includes(s.template)
      ? 'Optional 10–15 min easy walking; reduce or skip if tired. Log actual minutes, 0 if skipped.'
      : 'Comfortable walking only; no required finisher.';
  return planFor(s.planVersion).templates[s.template].cardio;
}
export function exerciseRir(s, id) {
  if (s.week === 7) return '4–5';
  if (s.planVersion === PLAN_VERSION && s.volumePhase === 'entry') return '3';
  if (![PLAN_VERSION, R7_PLAN.version, R6_PLAN.version, R5_PLAN.version, R4_PLAN.version].includes(s.planVersion))
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
    'chestpress',
    'shoulderpress',
    'widerow',
  ].includes(id)
    ? supportsOptionalCardio(s)
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
export const CYCLE_START = '2026-10-05';
export const CYCLE_SCHEDULE = ['pushA', 'pullA', 'legsA', null, 'pushB', 'pullB', 'legsB', null];
export function isGymClosed(date) {
  if (!validDate(date)) throw Error('Choose a valid date.');
  return new Date(date + 'T12:00:00Z').getUTCDay() === 0;
}
export function cycleDay(date, anchor = CYCLE_START) {
  if (!validDate(date) || !validDate(anchor)) throw Error('Choose valid cycle dates.');
  const elapsed = Math.round((Date.parse(date + 'T12:00:00Z') - Date.parse(anchor + 'T12:00:00Z')) / 86400000);
  // Count rotation days in [anchor, date), excluding Sundays. Reverse the
  // interval for dates before the anchor so past-date suggestions stay stable.
  const days = Math.abs(elapsed), first = elapsed < 0 ? date : anchor;
  const weekday = new Date(first + 'T12:00:00Z').getUTCDay();
  const sundays = Math.floor(days / 7) + (days % 7 > (7 - weekday) % 7 ? 1 : 0);
  const rotationDays = elapsed - Math.sign(elapsed) * sundays;
  return ((rotationDays % 8) + 8) % 8;
}
export function recommendedTemplate(date, anchor = CYCLE_START) {
  const day = cycleDay(date, anchor);
  return isGymClosed(date) ? '' : CYCLE_SCHEDULE[day] || '';
}
export function scheduleFor(state, date) {
  const change = state.coach?.activeSplit;
  if (change && change.schedule.length === 8 && date >= change.effectiveDate) return change.schedule;
  return CYCLE_SCHEDULE;
}
export function scheduledTemplate(state, date) {
  const schedule = scheduleFor(state, date);
  const change = state.coach?.activeSplit;
  const anchor = change && change.schedule.length === 8 && date >= change.effectiveDate ? change.effectiveDate : state.preferences?.cycleStart || CYCLE_START;
  const day = cycleDay(date, anchor);
  return isGymClosed(date) ? null : schedule[day];
}
export function scheduledSessions(state, start, days = 7) {
  return Array.from({ length: days }, (_, i) => scheduledTemplate(state, addDays(start, i))).filter(Boolean).length;
}
export function blockLabel(s) {
  return (s.planVersion === PLAN_VERSION ? 'Cycle ' : 'Week ') + s.week;
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
export function createSession(date, template, week = 1, planVersion = PLAN_VERSION, volumePhase = defaultVolumePhase(week)) {
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
    if ([PLAN_VERSION, R7_PLAN.version].includes(planVersion))
      count = prescribedSets(planVersion, template, id, week, volumePhase);
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
  if (planVersion === PLAN_VERSION) session.volumePhase = volumePhase;
  if (plan.templates[template].kind === 'hybrid' || supportsOptionalCardio(session))
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
    (requiresCardio(s) || supportsOptionalCardio(s)) &&
    numberIn(
      isCardio(s) ? s.duration : s.cardioDuration,
      1,
      supportsOptionalCardio(s) ? 120 : 180,
    ) &&
    typeof s.cardio === 'string' &&
    s.cardio.trim().length > 0
  );
}
export function cardioLogRequired(s) {
  return (
    requiresCardio(s) ||
    (supportsOptionalCardio(s) &&
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
    'Average steps: ' +
      (mean(checks.filter((c) => numberIn(c.steps, 0, 100000, true)).map((c) => c.steps))?.toFixed(0) ?? 'not logged') +
      '; build gradually from the reported 5,000/day baseline toward 8,000–10,000/day as recovery permits',
    'Recorded sessions: ' +
      sessions.length +
      '; marked finished: ' +
      sessions.filter((s) => s.status === 'finished').length +
      '; current target: ' + scheduledSessions(state, start) + ' lifting sessions in this calendar week; 6 per eight-day PPL/rest cycle (eight rotation days, excluding Sundays); Sunday is fixed rest because the gym is closed; pause the rotation and resume Monday, retaining both rotation recovery days; easy cardio after push sessions, reduced or skipped if recovery requires; do not repeat completed days during transition',
    'Finished lifting sessions: ' +
      sessions.filter((s) => isLifting(s) && s.status === 'finished').length +
      '/' + scheduledSessions(state, start) + '; finished cardio bouts: ' +
      sessions.filter((s) => s.status === 'finished' && cardioValid(s)).length +
      ' (optional after push sessions); cardio minutes logged: ' +
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
        ' · ' + blockLabel(s) +
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
      s.volumePhase,
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
            supportsOptionalCardio(s) ? 0 : 1,
            supportsOptionalCardio(s) ? 120 : 180,
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
      !(c.steps === undefined || c.steps === '' || numberIn(c.steps, 0, 100000, true)) ||
      typeof c.notes !== 'string' ||
      !Number.isFinite(Date.parse(c.updatedAt))
    )
      throw Error('Invalid check-in in backup.');
    dates.add(c.date);
  }
  if (data.mealLogs !== undefined) {
    if (!Array.isArray(data.mealLogs) || data.mealLogs.length > 20000) throw Error('Invalid meal backup.');
    const mealIDs = new Set();
    for (const meal of data.mealLogs) {
      const unique = meal.date + '_' + meal.mealID;
      if (!meal || !validDate(meal.date) || typeof meal.id !== 'string' || typeof meal.mealID !== 'string' ||
          typeof meal.name !== 'string' || typeof meal.revision !== 'string' || typeof meal.calories !== 'number' || typeof meal.protein !== 'number' || !numberIn(meal.portion,0.25,3) ||
          !numberIn(meal.calories,0,10000) || !numberIn(meal.protein,0,1000) || mealIDs.has(unique) || !Number.isFinite(Date.parse(meal.updatedAt))) throw Error('Invalid meal record.');
      mealIDs.add(unique);
    }
  }
  if (data.coach !== undefined) {
    if (!data.coach || typeof data.coach !== 'object' || !Array.isArray(data.coach.reviews) || data.coach.reviews.length > 60 ||
        JSON.stringify(data.coach).length > 500000 || /"(?:apiKey|accessCode|DEEPSEEK_API_KEY)"/.test(JSON.stringify(data.coach))) throw Error('Invalid coaching backup.');
    for (const review of data.coach.reviews) {
      if (!review || !['daily','weekly'].includes(review.mode) || !validDate(review.period?.start) || !validDate(review.period?.end) ||
          typeof review.createdAt !== 'string' || !Number.isFinite(Date.parse(review.createdAt)) ||
          ['summary','dailyAnalysis','nutrition','recovery'].some(k=>typeof review[k] !== 'string') || !Array.isArray(review.targets) || !review.split || typeof review.split.reason !== 'string') throw Error('Invalid coaching review.');
    }
    for (const review of data.coach.reviews) for (const target of review.targets) {
      if (!target || typeof target.exerciseID !== 'string' || !Object.hasOwn(EXERCISES,target.exerciseID) ||
          typeof target.name !== 'string' || typeof target.action !== 'string' || !Object.hasOwn(BASES,target.basis) || typeof target.equipment !== 'string' ||
          !(target.targetLoad === null || (typeof target.targetLoad === 'number' && numberIn(target.targetLoad,0,2000))) ||
          !numberIn(target.minReps,1,200,true) || !numberIn(target.maxReps,1,200,true)) throw Error('Invalid coaching target.');
    }
    const active = data.coach.activeSplit;
    if (active && (!validDate(active.effectiveDate) || !Array.isArray(active.schedule) || ![7,8].includes(active.schedule.length) || active.schedule.some(id=>id!==null&&!Object.hasOwn(TEMPLATES,id)))) throw Error('Invalid future split.');
  }
  if (data.preferences?.cycleStart !== undefined && !validDate(data.preferences.cycleStart)) throw Error('Invalid cycle start date.');
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
    mealLogs: merge((local.mealLogs || []).map(m=>({...m,mergeKey:m.date+'_'+m.mealID})), (incoming.mealLogs || []).map(m=>({...m,mergeKey:m.date+'_'+m.mealID})), 'mergeKey').map(({mergeKey,...m})=>m),
    coach: (local.coach || incoming.coach) ? {
      ...(incoming.coach || {}), ...(local.coach || {}),
      reviews: merge((local.coach?.reviews || []).map(r=>({...r,updatedAt:r.createdAt})), (incoming.coach?.reviews || []).map(r=>({...r,updatedAt:r.createdAt})), 'id').sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,60).map(({updatedAt,...r})=>r)
    } : undefined,
    preferences: local.preferences || incoming.preferences,
  };
}
