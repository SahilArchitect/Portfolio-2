// Frozen r6 prescription. Existing sessions and backups must retain these targets.
import { R4_PLAN } from './r4-plan.mjs';
const PLAN_VERSION = '2026-09-13-r6';
const STORAGE_KEY = 'trident-forge-v1';
const EXERCISES = {
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
const ARMS = [...R4_PLAN.arms, 'barpushdown'];
const TEMPLATES = {
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
    pairing:
      'Hack squat first. Optional calves ↔ cable crunch; reverse EZ-bar curls and ab-wheel rollouts last.',
    cardio: "No required finisher; save energy for Thursday's easy cardio.",
  },
  cardio: {
    name: 'Cardio + arms, forearms & lower traps',
    day: 'Thursday',
    kind: 'hybrid',
    ids: [
      'dbcurl',
      'hammer',
      'cgbp',
      'barpushdown',
      'wristcurl',
      'reversewrist',
      'facepull',
      'cabley',
    ],
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
export const R6_PLAN = {
  version: PLAN_VERSION,
  exercises: EXERCISES,
  templates: TEMPLATES,
  arms: ARMS,
};
