import { NUTRITION_PLAN } from "./nutrition-plan.mjs";
import {
  localDate,
  addDays,
  monday,
  TEMPLATES,
  BASES,
  EXERCISES,
  progress,
  recommendedTemplate,
  scheduleFor,
  scheduledTemplate,
  scheduledSessions,
  isGymClosed,
  blockLabel,
} from "./core.mjs";
export { scheduleFor, scheduledTemplate } from './core.mjs';
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const $ = (s) => document.querySelector(s);
let apiKey = "",
  accessCode = "",
  busy = false;
try {
  accessCode = sessionStorage.getItem("trident-coach-code") || "";
} catch {}

const latestReview = (state) =>
  (state.coach?.reviews || [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
export function coachHint(state, exercise, session) {
  if (session.status === "finished" || session.week === 7) return "";
  const review = (state.coach?.reviews || [])
    .filter((r) => r.period.end < session.date)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .find((r) =>
      r.targets.some(
        (t) =>
          t.exerciseID === exercise.id &&
          t.basis === exercise.basis &&
          (!exercise.variation || t.equipment === exercise.variation),
      ),
    );
  const target = review?.targets.find(
    (t) =>
      t.exerciseID === exercise.id &&
      t.basis === exercise.basis &&
      (!exercise.variation || t.equipment === exercise.variation),
  );
  if (!target || session.date > addDays(review.period.end, 14)) return "";
  return (
    '<aside class="coach-target"><span class="eyebrow">NEXT SESSION · DEEPSEEK REVIEW</span><strong>' +
    esc(
      target.targetLoad === null
        ? target.action
        : target.targetLoad + " kg · " + target.action,
    ) +
    "</strong><p>" +
    esc(
      target.minReps +
        "–" +
        target.maxReps +
        " reps · " +
        target.rir +
        " RIR · " +
        target.basis,
    ) +
    "</p><small>" +
    esc(target.reason) +
    "</small></aside>"
  );
}
export function renderProgress(state, date) {
  const start = monday(date),
    end = addDays(start, 6),
    sessions = state.sessions.filter(
      (s) => s.date >= start && s.date <= end && s.status === "finished",
    );
  const groups = new Map();
  let volume = 0,
    working = 0;
  for (const session of sessions)
    for (const e of session.exercises) {
      const completed = e.sets.filter((x) => x.done);
      working += completed.length;
      groups.set(
        EXERCISES[e.id]?.group || "Other",
        (groups.get(EXERCISES[e.id]?.group || "Other") || 0) + completed.length,
      );
      if (!["assistance", "bodyweight"].includes(e.basis))
        volume += completed.reduce(
          (n, x) => n + Number(x.load) * Number(x.reps),
          0,
        );
    }
  const points = state.checkins
    .filter(
      (c) => c.weight !== "" && c.date >= addDays(end, -27) && c.date <= end,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  let chart =
    '<p class="subtle">Log morning bodyweights in Workout → Daily check-in to see your trend.</p>';
  if (points.length) {
    const weights = points.map((p) => Number(p.weight)),
      low = Math.min(...weights) - 0.5,
      high = Math.max(...weights) + 0.5;
    const xy = points.map((p, i) => {
      const preceding = points.filter(
        (c) => c.date >= addDays(p.date, -6) && c.date <= p.date,
      );
      const mean =
        preceding.reduce((v, c) => v + Number(c.weight), 0) / preceding.length;
      return [
        20 + (i / Math.max(points.length - 1, 1)) * 560,
        150 - ((mean - low) / (high - low)) * 120,
      ];
    });
    chart =
      '<svg role="img" aria-label="Bodyweight trend from available check-ins, seven-day average" viewBox="0 0 600 180" class="weight-chart"><line x1="20" y1="155" x2="580" y2="155" stroke="var(--line)"/><polyline fill="none" stroke="var(--lime)" stroke-width="3" points="' +
      xy.map((p) => p.join(",")).join(" ") +
      '"/>' +
      xy
        .map(
          (p) =>
            '<circle cx="' +
            p[0] +
            '" cy="' +
            p[1] +
            '" r="4" fill="var(--lime)"/>',
        )
        .join("") +
      '</svg><p class="subtle">' +
      esc(points[0].date) +
      " → " +
      esc(points.at(-1).date) +
      " · " +
      points.length +
      " observations · latest " +
      esc(points.at(-1).weight) +
      " kg. Averaged over available observations, not missing days.</p>";
  }
  const meals = (state.mealLogs || []).filter(
      (m) => m.date >= start && m.date <= end,
    ),
    days = new Set(meals.map((m) => m.date));
  return (
    '<section class="stats"><div class="stat"><strong>' +
    sessions.length +
    '</strong><small>finished workouts</small></div><div class="stat"><strong>' +
    working +
    '</strong><small>working sets</small></div><div class="stat"><strong>' +
    Math.round(volume).toLocaleString() +
    '</strong><small>recorded load × reps · kg</small></div></section><section class="progress-section"><div class="section-title"><h2>Muscle group volume</h2><span class="subtle">direct sets this week</span></div>' +
    [...groups]
      .sort((a, b) => b[1] - a[1])
      .map(
        ([g, n]) =>
          '<div class="volume-row"><span>' +
          esc(g) +
          '</span><progress value="' +
          n +
          '" max="' +
          Math.max(...groups.values(), 1) +
          '" aria-label="' +
          esc(g) +
          ' working sets"></progress><strong>' +
          n +
          "</strong></div>",
      )
      .join("") +
    (groups.size
      ? ""
      : '<p class="subtle">Finish a workout to build your weekly volume profile.</p>') +
    '</section><section class="progress-section"><h2>Bodyweight trend</h2>' +
    chart +
    '</section><section class="progress-section"><h2>Nutrition consistency</h2><p>' +
    days.size +
    "/7 days have meal records · " +
    meals.length +
    ' planned meals logged.</p><p class="subtle">' +
    (days.size
      ? "Average on logged days: " +
        Math.round(meals.reduce((v, m) => v + m.calories, 0) / days.size) +
        " kcal · " +
        (meals.reduce((v, m) => v + m.protein, 0) / days.size).toFixed(1) +
        " g protein."
      : "Your meal timeline tracks actual portions and preserves their estimates.") +
    " Missing days are unknown.</p></section>"
  );
}
export function renderToday(state, setTab, save, toast) {
  const date = localDate(),
    template = scheduledTemplate(state, date),
    start = monday(date);
  const sessions = state.sessions.filter(
    (s) => s.date >= start && s.date <= date && s.status === "finished",
  );
  const logged = (state.mealLogs || []).filter((m) => m.date === date);
  const calories = logged.reduce((v, m) => v + m.calories, 0),
    protein = logged.reduce((v, m) => v + m.protein, 0);
  const latest = latestReview(state);
  const name = state.preferences?.name || "Sahil";
  $("#app").innerHTML =
    `<div class="screen-title"><div><div class="eyebrow">${esc(new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }))}</div><h1>Show up.<br>Build forward.</h1></div><button class="profile-button" id="profile" aria-label="Open settings">${esc(name.slice(0, 1).toUpperCase())}</button></div>
  <section class="forge-hero"><img src="./art/onboarding.png" alt="" fetchpriority="high"><div class="hero-copy"><span class="pill">TRIDENT FORGE · ${esc(state.sessions.at(-1) ? blockLabel(state.sessions.at(-1)) : 'Cycle 1')}</span><h2>${template ? esc(TEMPLATES[template].name) : isGymClosed(date) ? "Sunday rest." : "Recovery is training."}</h2><p>${template ? "Your next session. Intentional reps, honest effort." : isGymClosed(date) ? "Gym closed. Pause the rotation and resume Monday. Walk, fuel and recover." : "Walk, fuel, sleep. Give adaptation room."}</p><button id="today-workout" class="primary">${template ? "Open workout →" : "View your training plan →"}</button></div></section>
  <div class="stats"><div class="stat"><strong>${sessions.length}<small> / ${scheduledSessions(state, start)}</small></strong><small>sessions this week</small></div><div class="stat"><strong>${sessions.reduce((n, s) => n + progress(s).done, 0)}</strong><small>working sets</small></div><div class="stat"><strong>${state.checkins.filter((c) => c.weight !== "").sort((a, b) => b.date.localeCompare(a.date))[0]?.weight || "—"}</strong><small>latest bodyweight · kg</small></div></div>
  <div class="section-title"><h2>Fuel the work.</h2><button id="today-nutrition">Nutrition →</button></div><section class="nutrition-glance"><div><span class="eyebrow">TODAY’S LOGGED INTAKE</span><h3>${Math.round(calories)} <small>/ ${NUTRITION_PLAN.calorieTarget.toLocaleString()} kcal</small></h3><progress max="${NUTRITION_PLAN.calorieTarget}" value="${calories}" aria-label="Logged calories"></progress></div><div><h3>${protein.toFixed(1)} g</h3><p>protein · target ${NUTRITION_PLAN.proteinRange[0]}–${NUTRITION_PLAN.proteinRange[1]} g</p><p>${logged.length}/${NUTRITION_PLAN.meals.length} planned meals logged</p></div></section>
  <div class="section-title"><h2>Training intelligence.</h2><button id="today-progress">Progress →</button></div><section class="coach-glance"><span class="eyebrow">${latest ? "LATEST REVIEW" : "YOUR DEEPSEEK COACH"}</span><h3>${latest ? esc(latest.summary) : "Let your training tell the story."}</h3><p>${latest ? esc(latest.recovery) : "Finish a workout to analyze the day. Weekly reviews connect your lifts, recovery and meals to next-session guidance."}</p><button id="today-coach" class="wide">${latest ? "Read your review" : "Connect your coach"} →</button></section>
  <p class="subtle">22:00–06:00 sleep opportunity · build from 5,000 toward 8,000–10,000 steps/day, about 1,000 at a time if recovery allows · log actual steps in Workout → Daily check-in.</p>`;
  $("#profile").onclick = () => setTab("settings");
  $("#today-workout").onclick = () => setTab("train");
  $("#today-nutrition").onclick = () => setTab("nutrition");
  $("#today-progress").onclick = () => setTab("review");
  $("#today-coach").onclick = () => setTab("review");
}
export function renderNutrition(state, save, toast) {
  let date = localDate();
  const draw = () => {
    const logs = (state.mealLogs || []).filter((m) => m.date === date),
      total = logs.reduce(
        (t, m) => ({
          calories: t.calories + m.calories,
          protein: t.protein + m.protein,
        }),
        { calories: 0, protein: 0 },
      );
    $("#app").innerHTML =
      `<div class="eyebrow">FUEL · RECOVER · REPEAT</div><h1>Eat with<br>intention.</h1><p class="muted">${esc(NUTRITION_PLAN.description)}</p><label>Meal log date<input type="date" id="meal-date" value="${date}" required></label><section class="nutrition-glance"><div><span class="eyebrow">LOGGED · ${logs.length}/${NUTRITION_PLAN.meals.length} MEALS</span><h2>${Math.round(total.calories)} <small>/ ${NUTRITION_PLAN.calorieTarget.toLocaleString()} kcal</small></h2><progress value="${total.calories}" max="${NUTRITION_PLAN.calorieTarget}" aria-label="Calorie target"></progress></div><div><h2>${total.protein.toFixed(1)} g</h2><p>protein · ${NUTRITION_PLAN.proteinRange[0]}–${NUTRITION_PLAN.proteinRange[1]} g target</p></div></section><p class="subtle">Full planned day: ≈${NUTRITION_PLAN.meals.reduce((n, m) => n + m.calories, 0).toLocaleString()} kcal · ${NUTRITION_PLAN.meals.reduce((n, m) => n + m.protein, 0).toFixed(1)} g protein · ${NUTRITION_PLAN.carbohydrates.toFixed(1)} g carbohydrate · ${NUTRITION_PLAN.fat.toFixed(1)} g fat. Estimates; packet labels and measured portions take precedence.</p>
      <div class="section-title"><h2>Meal timeline</h2><span class="pill">${date === localDate() ? "TODAY" : esc(date)}</span></div>
      <div class="meal-timeline">${NUTRITION_PLAN.meals
        .map((m) => {
          const log = logs.find((l) => l.mealID === m.id);
          return `<article class="meal-row ${log ? "eaten" : ""}"><div class="meal-time">${m.time}<span>${log ? "✓" : "○"}</span></div><div class="meal-body"><span class="eyebrow">${m.id.replaceAll("-", " ")}</span><h3>${esc(m.name)}</h3><p>${esc(m.summary)}</p><div class="macro-pills"><span>≈${m.calories} kcal</span><span>${m.protein} g protein</span></div><details><summary>Ingredients & preparation</summary><p>${esc(m.portion)}</p><ul>${m.ingredients.map((i) => `<li>${esc(i)}</li>`).join("")}</ul><ol>${m.preparation.map((i) => `<li>${esc(i)}</li>`).join("")}</ol></details><label>Portion multiplier<select data-portion="${m.id}">${[0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => `<option value="${v}" ${v === (log?.portion || 1) ? "selected" : ""}>${v}× planned serving</option>`).join("")}</select></label><button class="${log ? "" : "primary"} wide" data-meal="${m.id}">${log ? "Undo meal log" : "Mark eaten"}</button></div></article>`;
        })
        .join("")}</div>
      <section class="hint"><h3>Daily ingredients, counted once.</h3><p>${esc(NUTRITION_PLAN.batch)}</p><p>06:00 wake · 07:00–08:30 gym · finish dinner by about 20:00 · 22:00 sleep. Keep the same food allocations on rest days.</p></section><p class="subtle">Source: agreed Markdown plan · ${esc(NUTRITION_PLAN.revision)}. Meal records preserve their portion and nutrition snapshot when the plan changes.</p>`;
    $("#meal-date").onchange = (e) => {
      date = e.target.value;
      draw();
    };
    document.querySelectorAll("[data-meal]").forEach(
      (button) =>
        (button.onclick = () => {
          state.mealLogs ??= [];
          const id = button.dataset.meal,
            index = state.mealLogs.findIndex(
              (l) => l.date === date && l.mealID === id,
            );
          if (index >= 0) state.mealLogs.splice(index, 1);
          else {
            const m = NUTRITION_PLAN.meals.find((m) => m.id === id),
              portion = Number(
                document.querySelector(`[data-portion="${id}"]`).value,
              );
            state.mealLogs.push({
              id: crypto.randomUUID(),
              date,
              mealID: id,
              name: m.name,
              portion,
              calories: m.calories * portion,
              protein: m.protein * portion,
              revision: NUTRITION_PLAN.revision,
              updatedAt: new Date().toISOString(),
            });
          }
          save();
          draw();
        }),
    );
  };
  draw();
}
export function coachSettings(state, save, toast, container) {
  container.innerHTML = `<h2>DeepSeek coach</h2><p class="subtle">Training and recovery notes are sent to DeepSeek when you request a review or enable automatic reviews. Your API key stays out of backups and published code.</p><label>Private coaching access code<input id="coach-code" type="password" autocomplete="off" placeholder="For the configured private server key"></label><details><summary>Use my own DeepSeek key instead</summary><label>API key · this tab only<input id="coach-key" type="password" autocomplete="off" placeholder="sk-…"></label><p class="subtle">The key is held only in memory for this tab and sent over HTTPS to the coaching service. Reconnect after reopening.</p></details><details><summary>Your gym’s actual weight increments</summary><p class="subtle">Leave blank if unknown. Verified increments let weekly reviews suggest an exact next weight.</p><div class="grid">${Object.keys(
    BASES,
  )
    .filter((b) => b !== "bodyweight")
    .map(
      (b) =>
        "<label>" +
        BASES[b] +
        ' · kg<input data-increment="' +
        b +
        '" type="number" min="0.25" max="10" step="0.25" placeholder="Actual increment" value="' +
        (state.preferences?.equipmentIncrements?.[b] || "") +
        '"></label>',
    )
    .join(
      "",
    )}</div></details><button id="connect-coach" class="primary wide">Connect coach</button><p id="coach-status" class="subtle" role="status">${apiKey || accessCode ? "Connected for this tab." : "Enter your private access code or your own API key."}</p><label class="toggle-label"><input id="auto-coach" type="checkbox" ${state.coach?.automatic !== false ? "checked" : ""}>Review automatically after workouts and when the weekly review is due</label><p class="subtle">Weekly review runs when you next open this journal, at most once per week. It cannot run while the website is closed. Split changes are offered only after repeated evidence and apply from the next Monday.</p>`;
  $("#connect-coach").onclick = async () => {
    state.coach ??= { reviews: [], automatic: true };
    save();
    apiKey = $("#coach-key").value.trim();
    accessCode = $("#coach-code").value.trim();
    $("#coach-key").value = "";
    $("#coach-code").value = "";
    try {
      if (accessCode) sessionStorage.setItem("trident-coach-code", accessCode);
      else sessionStorage.removeItem("trident-coach-code");
    } catch {}
    if (!apiKey && !accessCode) {
      $("#coach-status").textContent = "Enter a key or private access code.";
      return;
    }
    $("#coach-status").textContent =
      "Connected for this tab. Open Progress to request your first review.";
    toast("Coach connected.");
    void automaticReviews(state, save, toast);
  };
  document.querySelectorAll("[data-increment]").forEach(
    (input) =>
      (input.onchange = () => {
        state.preferences ??= {};
        state.preferences.equipmentIncrements ??= {};
        const value = Number(input.value);
        if (Number.isFinite(value) && value >= 0.25 && value <= 10)
          state.preferences.equipmentIncrements[input.dataset.increment] =
            value;
        else
          delete state.preferences.equipmentIncrements[input.dataset.increment];
        save();
      }),
  );
  $("#auto-coach").onchange = (e) => {
    state.coach ??= { reviews: [] };
    state.coach.automatic = e.target.checked;
    save();
  };
}
export async function requestReview(state, save, mode, date = localDate()) {
  if (busy) throw Error("A review is already running.");
  busy = true;
  try {
    const start = addDays(date, -27),
      relevant = {
        version: 1,
        sessions: state.sessions.filter(
          (s) => s.date >= start && s.date <= date,
        ),
        checkins: state.checkins.filter(
          (c) => c.date >= start && c.date <= date,
        ),
      };
    const response = await fetch("/trident-coach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "x-deepseek-key": apiKey } : {}),
        ...(accessCode ? { "x-coach-token": accessCode } : {}),
      },
      body: JSON.stringify({
        mode,
        date,
        state: relevant,
        equipmentIncrements: state.preferences?.equipmentIncrements || {},
        schedule: scheduleFor(state, date),
        mealLogs: (state.mealLogs || []).filter(
          (m) => m.date >= start && m.date <= date,
        ),
      }),
      signal: AbortSignal.timeout(55000),
    });
    const result = await response.json();
    if (!response.ok) throw Error(result.error || "Review unavailable.");
    state.coach ??= { reviews: [] };
    state.coach.reviews ??= [];
    state.coach.reviews.unshift(result);
    state.coach.reviews = state.coach.reviews.slice(0, 60);
    save();
    return result;
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError")
      throw Error(
        "Review timed out. Your workout remains saved. Retry when connected.",
      );
    throw error;
  } finally {
    busy = false;
  }
}
export function mountCoach(state, save, toast, date, container) {
  const review = (state.coach?.reviews || []).find(
    (r) =>
      r.period.end >= monday(date) && r.period.end <= addDays(monday(date), 6),
  );
  container.innerHTML = `<div class="section-title"><h2>Your DeepSeek coach</h2><span class="pill">${review ? "REVIEW READY" : "TRAINING INTELLIGENCE"}</span></div><p>Review actual effort, recovery and meals. Next-session weights use comparable logged performance. Your split stays stable unless repeated evidence supports changing it.</p><div class="grid"><button id="daily-ai" class="primary">Analyze selected day</button><button id="weekly-ai">Review selected week</button></div><p class="subtle" id="ai-status" role="status"></p><details><summary>Coach connection & automatic reviews</summary><div id="coach-settings"></div></details><label>Saved reviews<select id="saved-review"><option value="">Choose a saved review</option>${(state.coach?.reviews || []).map((r) => '<option value="' + esc(r.id) + '">' + esc(r.mode + " · " + r.period.start + " to " + r.period.end) + "</option>").join("")}</select></label><div id="ai-result"></div>`;
  coachSettings(state, save, toast, $("#coach-settings"));
  const display = (r) => {
    $("#ai-result").innerHTML =
      `<article class="ai-review"><span class="eyebrow">${esc(r.mode)} · ${esc(r.period.start)} – ${esc(r.period.end)}</span><h3>${esc(r.summary)}</h3><h4>Training</h4><p>${esc(r.dailyAnalysis)}</p><h4>Recovery</h4><p>${esc(r.recovery)}</p><h4>Nutrition</h4><p>${esc(r.nutrition)}</p><h4>Your next weights</h4>${r.targets.map((t) => `<div class="load-row"><div><strong>${esc(t.name)}</strong><p>${esc(t.basis)} ${t.equipment ? "· " + esc(t.equipment) : ""}</p></div><div><strong>${esc(t.targetLoad === null ? t.action : t.targetLoad + " kg")}</strong><p>${esc(t.minReps + "–" + t.maxReps + " reps · " + t.rir + " RIR")}</p><small>${esc(t.action)}</small></div></div>`).join("")}<h4>Next week’s split</h4><p>${esc(r.split.reason)}</p>${r.split.changeNeeded ? `<div class="split-preview">${r.split.schedule.map((t, i) => `<span>${r.split.schedule.length === 8 ? "Day " + (i + 1) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}<strong>${t ? esc(TEMPLATES[t].name) : "Rest"}</strong></span>`).join("")}</div><button id="apply-split" class="wide">Use this split from next Monday</button>` : ""}<p class="subtle">Generated ${esc(new Date(r.createdAt).toLocaleString())}. Advice is based on logged data; unlogged work remains unknown.</p></article>`;
    if (r.split.changeNeeded)
      $("#apply-split").onclick = () => {
        state.coach.splitHistory ??= [];
        if (state.coach.activeSplit)
          state.coach.splitHistory.push(state.coach.activeSplit);
        state.coach.activeSplit = {
          schedule: r.split.schedule,
          effectiveDate: addDays(monday(localDate()), 7),
          reviewID: r.id,
        };
        save();
        toast(
          "Future split saved from next Monday. Past workouts keep their original plan.",
        );
      };
  };
  if (review) display(review);
  $("#saved-review").onchange = (e) => {
    const selected = (state.coach?.reviews || []).find(
      (r) => r.id === e.target.value,
    );
    if (selected) display(selected);
  };
  for (const mode of ["daily", "weekly"])
    $("#" + mode + "-ai").onclick = async () => {
      $("#daily-ai").disabled = $("#weekly-ai").disabled = true;
      $("#ai-status").textContent = "Reviewing your logged training…";
      try {
        const result = await requestReview(
          state,
          save,
          mode,
          mode === "weekly" ? addDays(monday(date), 6) : date,
        );
        display(result);
        $("#ai-status").textContent = "Review saved on this device.";
      } catch (e) {
        $("#ai-status").textContent = e.message;
      } finally {
        $("#daily-ai").disabled = $("#weekly-ai").disabled = false;
      }
    };
}
export async function automaticReviews(state, save, toast, session = null) {
  if (!state.coach?.automatic || (!apiKey && !accessCode) || busy) return;
  try {
    if (
      session &&
      !(state.coach.reviews || []).some(
        (r) => r.mode === "daily" && r.period.end === session.date,
      )
    ) {
      await requestReview(state, save, "daily", session.date);
      toast("Daily coaching review ready in Progress.");
    }
    const end = addDays(monday(localDate()), -1);
    if (
      state.sessions.some(
        (s) =>
          s.status === "finished" &&
          s.date >= addDays(end, -6) &&
          s.date <= end,
      ) &&
      !(state.coach.reviews || []).some(
        (r) => r.mode === "weekly" && r.period.end === end,
      )
    ) {
      await requestReview(state, save, "weekly", end);
      toast("Last week’s coaching review is ready in Progress.");
    }
  } catch (e) {
    toast(e.message);
  }
}
