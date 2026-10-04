// Current master plan: near-1,850 kcal version; rounded food estimates, C/F unverified.
export const NUTRITION_PLAN = {
  "revision": "2026-10-04-dal-black-beans-low-soy",
  "calorieTarget": 1850,
  "proteinMinimum": 130,
  "proteinRange": [
    130,
    150
  ],
  "estimated": true,
  "carbohydrates": null,
  "fat": null,
  "description": "Dal, black beans, dahi and small soy portions. One scoop. One banana. One small roti.",
  "batch": "150 g dry split yellow moong + 50 g dry soy + 200 g cooking vegetables + 2 g oil total, including tadka, plus seasonings. Divide equally between lunch and dinner. Each meal adds 50 g cooked drained black beans, 150 g salad and 50 g plain buffalo-milk dahi. Lunch alone adds one roti from 25 g dry atta. Refrigerate the dinner portion promptly and reheat thoroughly.",
  "meals": [
    {
      "id": "pre-workout",
      "name": "Pre-workout banana",
      "time": "06:20",
      "summary": "One banana before the gym; black coffee if wanted.",
      "portion": "100 g peeled banana",
      "ingredients": [
        "100 g peeled banana",
        "Optional black coffee without milk or sugar"
      ],
      "preparation": [
        "Measure the banana without its peel.",
        "This is the only banana allocated for the day."
      ],
      "calories": 91,
      "protein": 1.4,
      "style": "sunrise",
      "symbol": "sunrise.fill"
    },
    {
      "id": "post-workout",
      "name": "Post-workout shake",
      "time": "08:30",
      "summary": "One 36 g OWN cocoa scoop in water, immediately after returning.",
      "portion": "36 g OWN plant protein + 300 ml water",
      "ingredients": [
        "36 g OWN cocoa plant protein",
        "300 ml water",
        "Usual 3–5 g creatine, if continuing"
      ],
      "preparation": [
        "Mix the measured scoop with water.",
        "This is the only protein scoop allocated for the day."
      ],
      "calories": 132,
      "protein": 24,
      "style": "snack",
      "symbol": "cup.and.saucer.fill"
    },
    {
      "id": "breakfast",
      "name": "Buffalo-milk protein oats",
      "time": "08:45",
      "summary": "Pintola HP oats with measured buffalo milk.",
      "portion": "50 g oats + 250 ml milk",
      "ingredients": [
        "50 g Pintola high-protein oats",
        "250 ml local dairy buffalo milk"
      ],
      "preparation": [
        "Prepare oats with the measured buffalo milk.",
        "No breakfast banana, honey, added nuts, peanut butter or sugar are allocated in this near-1,850 kcal version."
      ],
      "calories": 464,
      "protein": 21.2,
      "style": "griddle",
      "symbol": "sun.max.fill"
    },
    {
      "id": "lunch",
      "name": "Lunch · dal, roti and bean salad",
      "time": "13:00",
      "summary": "Moong dal, small soy keema, black-bean salad and dahi, with one small roti.",
      "portion": "75 g dry dal + 25 g dry soy + 50 g cooked black beans + one 25 g-atta roti",
      "ingredients": [
        "25 g dry ordinary atta (one small roti)",
        "75 g dry split yellow moong dal",
        "25 g dry soy chunks (maximum per meal)",
        "50 g cooked, drained black beans",
        "100 g cooking vegetables (including onion and tomato)",
        "150 g salad",
        "50 g plain homemade buffalo-milk dahi",
        "1 g oil total, including dal tadka and soy cooking",
        "Spices, ginger-garlic and lemon; 10 kcal allowance"
      ],
      "preparation": [
        "Cook the measured dry dal until soft. Weigh beans cooked and drained.",
        "Boil soy as directed, rinse, squeeze firmly and mince finely.",
        "Cook the dal and keema using the shared 1 g oil allowance; no extra tadka oil or ghee.",
        "Mix the fully cooked beans into the salad and serve dahi alongside.",
        "Make one small roti from 25 g dry atta, without ghee.",
        "For a daily batch, use 150 g dry dal, 50 g dry soy, 200 g vegetables and 2 g oil. Split equally and refrigerate dinner promptly."
      ],
      "calories": 633,
      "protein": 43.3,
      "style": "bowl",
      "symbol": "fork.knife"
    },
    {
      "id": "dinner",
      "name": "Dinner · dal and bean salad",
      "time": "19:30",
      "summary": "Moong dal, small soy keema, black-bean salad and dahi; no roti allocated.",
      "portion": "75 g dry dal + 25 g dry soy + 50 g cooked black beans",
      "ingredients": [
        "75 g dry split yellow moong dal",
        "25 g dry soy chunks (maximum per meal)",
        "50 g cooked, drained black beans",
        "100 g cooking vegetables (including onion and tomato)",
        "150 g salad",
        "50 g plain homemade buffalo-milk dahi",
        "1 g oil total, including dal tadka and soy cooking",
        "Spices, ginger-garlic and lemon; 10 kcal allowance"
      ],
      "preparation": [
        "Cook the measured dry dal until soft. Weigh beans cooked and drained.",
        "Boil soy as directed, rinse, squeeze firmly and mince finely.",
        "Cook the dal and keema using the shared 1 g oil allowance; no extra tadka oil or ghee.",
        "Mix the fully cooked beans into the salad and serve dahi alongside.",
        "Reheat the refrigerated dinner portion thoroughly. No extra oil or roti is allocated.",
        "For a daily batch, use 150 g dry dal, 50 g dry soy, 200 g vegetables and 2 g oil. Split equally and refrigerate dinner promptly."
      ],
      "calories": 542,
      "protein": 40.7,
      "style": "evening",
      "symbol": "moon.stars.fill"
    }
  ]
};
