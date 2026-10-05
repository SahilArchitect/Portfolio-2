// Frozen r7 prescription. Preserve all saved workouts and backups.
import { R6_PLAN } from './r6-plan.mjs';
const PLAN_VERSION = '2026-09-29-r7';
const STORAGE_KEY = 'trident-forge-v1';
// Retain historical IDs for validation and load references; only template IDs prescribe work.
const EXERCISES = {
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
const ARMS = R6_PLAN.arms;
const pushCardio =
  'After lifting: 15–20 min conversational treadmill walking or easy cycling, RPE 3–4/10, including an easy start and finish. Skip or shorten if recovery or the 120-minute ceiling requires it; log actual minutes (0 if skipped).';
const TEMPLATES = {
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

export const R7_PLAN = { version: PLAN_VERSION, exercises: EXERCISES, templates: TEMPLATES, arms: ARMS };
