import { R4_PLAN } from './r4-plan.mjs';

// Frozen five-lift plus cardio prescription. Never rewrite saved r5 sessions.
export const R5_PLAN = {
  version: '2026-09-10-r5',
  exercises: { ...R4_PLAN.exercises },
  templates: {
    push: {
      name: 'Push · Smith incline',
      day: 'Monday',
      kind: 'lifting',
      ids: ['inclinesmith', 'pecdeck', 'lateral', 'overhead', 'rope'],
      pairing:
        'Smith press first. Optional lateral raise ↔ rope pushdown after overhead extensions; keep full rest between sets of each muscle.',
      cardio: 'Optional 10 min easy treadmill after lifting. No intervals.',
    },
    pull: {
      name: 'Pull · normal hammer curls',
      day: 'Tuesday',
      kind: 'lifting',
      ids: ['pulldown', 'row', 'rear', 'shrug', 'inclinecurl', 'hammer'],
      pairing:
        'Pulldown and row first. Normal hammer curls remain separate from Friday cross-body curls. Finish with controlled curls.',
      cardio: 'Comfortable daily walking; no required finisher.',
    },
    legs: {
      name: 'Legs · quads, abs & forearms',
      day: 'Wednesday',
      kind: 'lifting',
      ids: ['hack', 'legcurl', 'extension', 'calf', 'crunch', 'wristcurl'],
      pairing: 'Hack squat first. Optional calves ↔ cable crunch; supported wrist curls last.',
      cardio: "No required finisher; save energy for Thursday's easy cardio.",
    },
    cardio: {
      name: 'Cardio · treadmill & mobility',
      day: 'Thursday',
      kind: 'cardio',
      ids: [],
      pairing:
        'No lifting sets today. Record actual cardio minutes, equipment, effort and any mobility performed.',
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
      ids: ['rdl', 'legpress', 'legcurl', 'calfseat', 'kneeraise', 'reversewrist'],
      pairing:
        'RDL and leg press as straight sets. Wrist extensions last. Use familiar lifting straps if grip limits RDL after Friday upper.',
      cardio: 'No required finisher. Comfortable walking; Sunday is rest.',
    },
  },
  arms: R4_PLAN.arms,
};
