import {
  PLAN_VERSION,
  STORAGE_KEY,
  EXERCISES,
  TEMPLATES,
  BASES,
  ARMS,
  localDate,
  addDays,
  monday,
  recommendedTemplate,
  newState,
  initialStateFromHash,
  createSession,
  numberIn,
  setValid,
  progress,
  previousExercise,
  formatSet,
  weeklySummary,
  validateState,
  mergeState,
} from './core.mjs';
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
let state,
  blocked = false,
  rawBackup = '',
  tab = 'train',
  activeId = null,
  reviewDate = localDate(),
  timerEnd = 0,
  toastTimeout;
try {
  rawBackup = localStorage.getItem(STORAGE_KEY) || '';
  state = rawBackup ? validateState(JSON.parse(rawBackup)) : initialStateFromHash(location.hash);
  if (location.hash.startsWith('#weight='))
    history.replaceState(null, '', location.pathname + location.search);
} catch {
  state = newState();
  blocked = true;
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => ($('#toast').hidden = true), 5500);
}
function save() {
  if (blocked) {
    $('#save-status').textContent = 'NOT SAVED · see Backup';
    $('#save-status').classList.add('error');
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $('#save-status').textContent = 'Saved on this device';
    $('#save-status').classList.remove('error');
    return true;
  } catch {
    $('#save-status').textContent = 'NOT SAVED · export backup';
    $('#save-status').classList.add('error');
    toast('Storage is unavailable or full. Export a backup now; current edits are only in memory.');
    return false;
  }
}
function touch(s) {
  s.updatedAt = new Date().toISOString();
  save();
}
function session() {
  return state.sessions.find((s) => s.id === activeId);
}
const dateLabel = (d) =>
  new Date(d + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
function options(items, selected) {
  return Object.entries(items)
    .map(
      ([v, n]) =>
        '<option value="' +
        esc(v) +
        '"' +
        (v === String(selected) ? ' selected' : '') +
        '>' +
        esc(n) +
        '</option>',
    )
    .join('');
}
function field(label, id, value = '', type = 'text', extra = '') {
  return (
    '<label>' +
    label +
    '<input id="' +
    id +
    '" type="' +
    type +
    '" value="' +
    esc(value) +
    '" ' +
    extra +
    '></label>'
  );
}
function setTab(next) {
  tab = next;
  activeId = null;
  render();
  window.scrollTo(0, 0);
}
function render() {
  document.querySelectorAll('[data-tab]').forEach((b) => {
    if (b.dataset.tab === tab) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (blocked && tab !== 'settings') {
    $('#app').innerHTML =
      '<div class="card"><h1>Your saved log needs attention.</h1><p>Nothing has been overwritten. Open Backup & help to recover your data or reload if another tab changed it.</p><button id="recover">Open backup tools</button></div>';
    $('#recover').onclick = () => setTab('settings');
    return;
  }
  if (tab === 'train') activeId ? renderSession() : renderHome();
  if (tab === 'history') renderHistory();
  if (tab === 'review') renderReview();
  if (tab === 'settings') renderSettings();
}
function checkinForm(date) {
  const c = state.checkins.find((c) => c.date === date) || {};
  return (
    '<form id="checkin-form"><div class="grid">' +
    field('Date', 'check-date', date, 'date', 'required') +
    field(
      'Bodyweight · kg',
      'check-weight',
      c.weight,
      'number',
      'inputmode="decimal" step="0.01" min="20" max="400"',
    ) +
    field(
      'Sleep · hours',
      'check-sleep',
      c.sleep,
      'number',
      'inputmode="decimal" step="0.1" min="0" max="24"',
    ) +
    field(
      'Waist · cm, optional',
      'check-waist',
      c.waist,
      'number',
      'inputmode="decimal" step="0.1" min="30" max="250"',
    ) +
    '</div><label>Recovery / food / symptoms<textarea id="check-notes" maxlength="3000" placeholder="Energy, soreness, digestion, or anything worth reviewing…">' +
    esc(c.notes || '') +
    '</textarea></label><button class="primary wide">Save check-in</button></form>'
  );
}
function bindCheckin() {
  $('#check-date').onchange = (e) => {
    const c = state.checkins.find((c) => c.date === e.target.value) || {};
    for (const f of ['weight', 'sleep', 'waist', 'notes']) $('#check-' + f).value = c[f] ?? '';
  };
  $('#checkin-form').onsubmit = (e) => {
    e.preventDefault();
    const c = {
      date: $('#check-date').value,
      weight: $('#check-weight').value,
      sleep: $('#check-sleep').value,
      waist: $('#check-waist').value,
      notes: $('#check-notes').value,
      updatedAt: new Date().toISOString(),
    };
    if (!c.weight && !c.sleep && !c.waist && !c.notes) {
      toast('Enter at least one check-in value.');
      return;
    }
    state.checkins = state.checkins.filter((x) => x.date !== c.date);
    state.checkins.push(c);
    if (save()) toast('Check-in saved.');
  };
}
function renderHome() {
  const today = localDate(),
    rec = recommendedTemplate(today),
    weekStart = monday(today);
  const todaySessions = state.sessions.filter((s) => s.date === today),
    weekSessions = state.sessions.filter(
      (s) => s.date >= weekStart && s.date <= addDays(weekStart, 6),
    );
  const weight = state.checkins
    .filter((c) => numberIn(c.weight, 20, 400))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const last = state.sessions.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  const week = Math.min(8, Math.max(1, last?.week || 1));
  $('#app').innerHTML =
    '<div class="eyebrow">' +
    esc(dateLabel(today)) +
    ' · THE WORK IS YOURS</div><section class="hero"><div class="mark">Ψ</div><span class="pill">8-WEEK GREEK-PHYSIQUE BLOCK</span><h1 style="margin-top:20px">Build with<br>intention.</h1><p style="margin-bottom:0">' +
    (rec
      ? esc(TEMPLATES[rec].name) + ' is on the plan today.'
      : 'A recovery day. Walk, rest and come back ready.') +
    '</p></section>' +
    '<div class="stats"><div class="stat"><strong>' +
    esc(weight?.weight || '—') +
    '</strong><small>latest kg' +
    (weight ? ' · ' + esc(weight.date.slice(5)) : '') +
    '</small></div><div class="stat"><strong>' +
    weekSessions.filter((s) => s.status === 'finished').length +
    ' / 5</strong><small>sessions this week</small></div><div class="stat"><strong>' +
    weekSessions.reduce((n, s) => n + progress(s).done, 0) +
    '</strong><small>working sets logged</small></div></div>' +
    '<div class="weekstrip">' +
    Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      return (
        '<div class="day' +
        (d === today ? ' active' : '') +
        (state.sessions.some((s) => s.date === d && progress(s).done) ? ' trained' : '') +
        '">' +
        ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i] +
        '<strong>' +
        Number(d.slice(8)) +
        '</strong>' +
        (recommendedTemplate(d) ? 'LIFT' : 'REST') +
        '</div>'
      );
    }).join('') +
    '</div>' +
    (todaySessions.length
      ? '<div class="section-title"><h2>Your sessions today</h2></div>' +
        todaySessions
          .map(
            (s) =>
              '<button class="history-item" data-open="' +
              s.id +
              '"><small>' +
              esc(s.status) +
              '</small><strong>' +
              esc(TEMPLATES[s.template].name) +
              '</strong>' +
              progress(s).done +
              '/' +
              progress(s).total +
              ' sets · tap to resume or edit</button>',
          )
          .join('')
      : '') +
    '<section class="card"><h2>Open a workout</h2><p class="subtle">Choose another date for a missed log. Existing sessions reopen without resetting.</p><form id="start-form">' +
    field('Workout date', 'workout-date', today, 'date', 'required') +
    '<div class="grid"><label>Session<select id="template" required>' +
    options(
      Object.fromEntries(Object.entries(TEMPLATES).map(([id, t]) => [id, t.name])),
      rec || 'upperA',
    ) +
    '</select></label><label>Training week<select id="week">' +
    options(
      Object.fromEntries(
        Array.from({ length: 8 }, (_, i) => [
          String(i + 1),
          'Week ' + (i + 1) + (i === 6 ? ' · deload' : ''),
        ]),
      ),
      week,
    ) +
    '</select></label></div><button class="primary wide">Open workout ↗</button></form></section>' +
    '<section class="card"><h2>Daily check-in</h2>' +
    checkinForm(today) +
    '</section><p class="subtle">No prescribed starting loads: use your warm-ups to find a weight with the planned reps in reserve. Record your actual working sets.</p>';
  $('#start-form').onsubmit = (e) => {
    e.preventDefault();
    const date = $('#workout-date').value,
      t = $('#template').value,
      w = Number($('#week').value);
    const id = date + '_' + t;
    let s = state.sessions.find((s) => s.id === id);
    if (!s) {
      s = createSession(date, t, w);
      state.sessions.push(s);
      save();
    }
    activeId = id;
    render();
    window.scrollTo(0, 0);
  };
  $('#workout-date').onchange = (e) => {
    const r = recommendedTemplate(e.target.value);
    if (r) $('#template').value = r;
  };
  document
    .querySelectorAll('[data-open]')
    .forEach((b) => (b.onclick = () => openSession(b.dataset.open)));
  bindCheckin();
}
function openSession(id) {
  activeId = id;
  tab = 'train';
  render();
  window.scrollTo(0, 0);
}
function exerciseCard(e, i, s) {
  const def = EXERCISES[e.id],
    previous = previousExercise(state, e.id, s.date),
    done = e.sets.filter((x) => x.done && setValid(x, e)).length;
  let text =
    '<section class="card exercise-card" id="ex-' +
    i +
    '"><div class="exercise-head"><div><span class="tag">' +
    esc(def.group) +
    (ARMS.includes(e.id) ? ' · ARM BLOCK' : '') +
    '</span><h3>' +
    esc(e.name) +
    '</h3></div><span class="count" id="count-' +
    i +
    '">' +
    done +
    '/' +
    e.sets.length +
    '</span></div><p class="subtle">' +
    e.sets.length +
    ' working set' +
    (e.sets.length > 1 ? 's' : '') +
    ' · ' +
    def.min +
    '–' +
    def.max +
    ' reps' +
    (def.unilateral ? ' each side' : '') +
    ' · ' +
    (s.week === 7 ? '4–5' : s.week === 1 ? '3–4' : s.week === 2 ? '3' : '2–3') +
    ' RIR</p>';
  if (def.cue) text += '<p class="subtle">' + esc(def.cue) + '</p>';
  text += previous
    ? '<div class="last">LAST · ' +
      esc(previous.date) +
      ' · W' +
      previous.week +
      '<br>' +
      esc(
        previous.exercise.sets
          .filter((x) => x.done && setValid(x, previous.exercise))
          .map((x) => formatSet(x, previous.exercise))
          .join(' · '),
      ) +
      (previous.exercise.variation ? '<br>Equipment: ' + esc(previous.exercise.variation) : '') +
      '<br><button data-copy="' +
      i +
      '">Use last weights only</button></div>'
    : '<p class="last">First entry. Choose load from your warm-ups; keep reps in reserve.</p>';
  text +=
    '<label>How this load is measured<select data-ex="' +
    i +
    '" data-exfield="basis">' +
    options(BASES, e.basis) +
    '</select></label>';
  e.sets.forEach((x, j) => {
    const input = (name, label, value, extra = '') =>
      '<label>' +
      label +
      '<input aria-label="' +
      esc(e.name) +
      ' set ' +
      (j + 1) +
      ' ' +
      label +
      '" type="number" inputmode="' +
      (name === 'reps' || name === 'right' ? 'numeric' : 'decimal') +
      '" data-ex="' +
      i +
      '" data-set="' +
      j +
      '" data-field="' +
      name +
      '" value="' +
      esc(value) +
      '" ' +
      extra +
      '></label>';
    text +=
      '<div class="set' +
      (x.done ? ' done' : '') +
      '" id="set-' +
      i +
      '-' +
      j +
      '"><span class="tag">SET ' +
      (j + 1) +
      '</span><div class="set-fields">' +
      input(
        'load',
        e.basis === 'bodyweight' ? 'BW' : 'KG',
        x.load,
        'min="0" max="2000" step="0.01"' + (e.basis === 'bodyweight' ? ' disabled' : ''),
      ) +
      input('reps', def.unilateral ? 'REPS L' : 'REPS', x.reps, 'min="1" max="200" step="1"') +
      input('rir', def.unilateral ? 'RIR L' : 'RIR', x.rir, 'min="0" max="10" step="0.5"') +
      '<button class="done-button" data-done="' +
      i +
      ':' +
      j +
      '" aria-label="Mark ' +
      esc(e.name) +
      ' set ' +
      (j + 1) +
      ' done" aria-pressed="' +
      x.done +
      '">' +
      (x.done ? '✓' : '○') +
      '</button></div>';
    if (def.unilateral)
      text +=
        '<div class="sidefields">' +
        input('right', 'REPS R', x.right, 'min="1" max="200" step="1"') +
        input('rirRight', 'RIR R', x.rirRight, 'min="0" max="10" step="0.5"') +
        '</div><p class="subtle">Use the same load on both sides. If different, describe both loads in notes.</p>';
    text += '</div>';
  });
  return (
    text +
    '<details><summary>Equipment, substitution & notes</summary><label>Machine / substituted exercise<input data-ex="' +
    i +
    '" data-exfield="variation" maxlength="250" placeholder="e.g. assisted dip machine, Gym A" value="' +
    esc(e.variation) +
    '"></label><label>Exercise notes<textarea data-ex="' +
    i +
    '" data-exfield="notes" maxlength="3000" placeholder="Technique, pain, left/right loads, next coach target…">' +
    esc(e.notes) +
    '</textarea></label></details><button data-rest="' +
    (ARMS.includes(e.id) && !['cgbp', 'dip'].includes(e.id) ? 90 : 120) +
    '" style="margin-top:10px">Rest timer</button></section>'
  );
}
function updateProgress(s) {
  const p = progress(s);
  $('#session-progress').textContent = p.done + ' / ' + p.total + ' sets';
  $('#progress-bar').style.width = (100 * p.done) / p.total + '%';
  s.exercises.forEach((e, i) => {
    $('#count-' + i).textContent =
      e.sets.filter((x) => x.done && setValid(x, e)).length + '/' + e.sets.length;
  });
}
function renderSession() {
  const s = session();
  if (!s) {
    activeId = null;
    render();
    return;
  }
  const p = progress(s);
  $('#app').innerHTML =
    '<button class="back" id="back">← Workout overview</button><div class="eyebrow">' +
    esc(dateLabel(s.date)) +
    ' · WEEK ' +
    s.week +
    (s.week === 7 ? ' · DELOAD' : '') +
    '</div><h1>' +
    esc(TEMPLATES[s.template].name) +
    '</h1><p class="subtle">Only working sets go here. RIR means clean reps you could still do. Tap the circle after a complete set.</p><div class="hint">' +
    (s.week === 7
      ? 'Deload: lighter loads and 4–5 RIR. Set counts are already reduced.'
      : 'Arms: one working set per exercise. Four isolation superset pairs, one round each. Rest 90–120 sec after a pair; 2–3 min for compounds.') +
    '</div><div class="sticky"><div class="row"><h2 id="session-progress">' +
    p.done +
    ' / ' +
    p.total +
    ' sets</h2><button data-rest="90">90s rest</button></div><div class="progress"><span id="progress-bar" style="width:' +
    (p.done / p.total) * 100 +
    '%"></span></div></div>' +
    s.exercises.map((e, i) => exerciseCard(e, i, s)).join('') +
    '<section class="card"><h2>Session reflection</h2><div class="grid">' +
    field(
      'Duration · minutes',
      'duration',
      s.duration,
      'number',
      'min="0" max="500" step="1" inputmode="numeric"',
    ) +
    '<label>Joint discomfort<select id="pain">' +
    options(
      { none: 'None', mild: 'Mild / worth reviewing', stop: 'Stopped or changed exercise' },
      s.pain,
    ) +
    '</select></label></div><label>Notes for your weekly review<textarea id="session-notes" maxlength="5000" placeholder="Energy, difficult lifts, skipped work, why you stopped…">' +
    esc(s.notes) +
    '</textarea></label><button class="primary wide" id="finish">' +
    (s.status === 'finished' ? 'Update finished session' : 'Finish session') +
    '</button><p class="subtle" style="margin:12px 0 0">Drafts save as you type. Finishing keeps missing sets visible; it never fills them in.</p></section>';
  $('#back').onclick = () => {
    activeId = null;
    render();
  };
  document.querySelectorAll('[data-field]').forEach(
    (input) =>
      (input.oninput = () => {
        const ei = +input.dataset.ex,
          si = +input.dataset.set,
          e = s.exercises[ei],
          x = e.sets[si];
        x[input.dataset.field] = input.value;
        if (x.done && !setValid(x, e)) {
          x.done = false;
          const b = document.querySelector('[data-done="' + ei + ':' + si + '"]');
          b.setAttribute('aria-pressed', 'false');
          b.textContent = '○';
          $('#set-' + ei + '-' + si).classList.remove('done');
        }
        touch(s);
        updateProgress(s);
      }),
  );
  document.querySelectorAll('[data-exfield]').forEach(
    (input) =>
      (input.oninput = () => {
        const e = s.exercises[+input.dataset.ex];
        e[input.dataset.exfield] = input.value;
        if (input.dataset.exfield === 'basis') {
          e.sets.forEach((x) => (x.done = false));
          touch(s);
          renderSession();
        } else touch(s);
      }),
  );
  document.querySelectorAll('[data-done]').forEach(
    (b) =>
      (b.onclick = () => {
        const [ei, si] = b.dataset.done.split(':').map(Number),
          e = s.exercises[ei],
          x = e.sets[si];
        if (!x.done && !setValid(x, e)) {
          toast(
            'Enter load, reps and RIR' +
              (EXERCISES[e.id].unilateral ? ' for both sides' : '') +
              ' before marking this set done.',
          );
          return;
        }
        x.done = !x.done;
        touch(s);
        b.setAttribute('aria-pressed', x.done);
        b.textContent = x.done ? '✓' : '○';
        $('#set-' + ei + '-' + si).classList.toggle('done', x.done);
        updateProgress(s);
      }),
  );
  document.querySelectorAll('[data-copy]').forEach(
    (b) =>
      (b.onclick = () => {
        const i = +b.dataset.copy,
          e = s.exercises[i],
          previous = previousExercise(state, e.id, s.date)?.exercise;
        if (!previous) return;
        if (
          e.sets.some((x) => x.load !== '' || x.done) &&
          !confirm(
            'Replace weights in this exercise with the previous entry? Reps and RIR stay; completion marks will be cleared.',
          )
        )
          return;
        e.basis = previous.basis;
        e.variation = previous.variation;
        e.sets.forEach((x, j) => {
          x.load = (previous.sets[j] || previous.sets[0]).load;
          x.done = false;
        });
        touch(s);
        renderSession();
        $('#ex-' + i).scrollIntoView({ block: 'start' });
        toast('Previous weights copied. This is a reference, not a prescribed increase.');
      }),
  );
  $('#duration').oninput = (e) => {
    s.duration = e.target.value;
    touch(s);
  };
  $('#pain').onchange = (e) => {
    s.pain = e.target.value;
    touch(s);
    if (s.pain === 'stop')
      toast(
        'Stop the provoking exercise. Include symptoms in your review; do not force the planned load.',
      );
  };
  $('#session-notes').oninput = (e) => {
    s.notes = e.target.value;
    touch(s);
  };
  $('#finish').onclick = () => {
    const p = progress(s);
    if (
      p.done < p.total &&
      !confirm(
        'Finish with ' +
          (p.total - p.done) +
          ' uncompleted sets? They will be shown as missing in your review.',
      )
    )
      return;
    s.status = 'finished';
    touch(s);
    activeId = null;
    render();
    window.scrollTo(0, 0);
    toast('Session saved. Review or edit it in History.');
  };
  bindTimers();
}
function renderHistory() {
  const list = state.sessions.slice().sort((a, b) => b.date.localeCompare(a.date));
  $('#app').innerHTML =
    '<div class="eyebrow">THE RECORD</div><h1>Every rep<br>has a history.</h1><p class="muted">Open any session to review or correct it. Workouts stay on this device.</p>' +
    list
      .map((s) => {
        const p = progress(s);
        return (
          '<button class="history-item" data-open="' +
          s.id +
          '"><div class="row"><small>' +
          esc(dateLabel(s.date)) +
          ' · week ' +
          s.week +
          '</small><span class="pill">' +
          esc(s.status) +
          '</span></div><strong>' +
          esc(TEMPLATES[s.template].name) +
          '</strong><span class="subtle">' +
          p.done +
          '/' +
          p.total +
          ' sets' +
          (s.pain !== 'none' ? ' · joint discomfort noted' : '') +
          '</span></button>'
        );
      })
      .join('') +
    (!list.length ? '<div class="empty">Your first workout starts the story.</div>' : '');
  document
    .querySelectorAll('[data-open]')
    .forEach((b) => (b.onclick = () => openSession(b.dataset.open)));
}
function renderReview() {
  const report = weeklySummary(state, reviewDate);
  $('#app').innerHTML =
    '<div class="eyebrow">LIFT → LOG → REVIEW</div><h1>Your next week<br>starts here.</h1><p class="muted">Send this summary to your coach for specific next-load guidance. It includes actual lifts, prior entries, RIR, missing sets and recovery.</p><div class="card">' +
    field('Select any date in the review week', 'review-date', reviewDate, 'date') +
    '<div class="row"><button id="prev-week">← Previous</button><span class="subtle">' +
    esc(monday(reviewDate)) +
    '</span><button id="next-week">Next →</button></div></div><div class="grid" style="margin-bottom:12px"><button class="primary" id="share-report">Share summary ↥</button><button id="copy-report">Copy text</button></div><button class="wide" id="download-report">Save summary as a file</button><p class="subtle" style="margin-top:12px">Share or paste this into our chat each week. Save a backup in Backup & help as well.</p><textarea id="report" class="report" aria-label="Weekly coaching summary" readonly>' +
    esc(report) +
    '</textarea>';
  $('#review-date').onchange = (e) => {
    if (e.target.value) {
      reviewDate = e.target.value;
      renderReview();
    }
  };
  $('#prev-week').onclick = () => {
    reviewDate = addDays(reviewDate, -7);
    renderReview();
  };
  $('#next-week').onclick = () => {
    reviewDate = addDays(reviewDate, 7);
    renderReview();
  };
  $('#copy-report').onclick = async () => {
    try {
      await navigator.clipboard.writeText(report);
      toast('Summary copied. Paste it into our chat.');
    } catch {
      $('#report').focus();
      $('#report').select();
      toast('Select and copy the summary below.');
    }
  };
  $('#share-report').onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Trident weekly review', text: report });
      } catch (e) {
        if (e.name !== 'AbortError') toast('Share was unavailable. Use Copy text or Save summary.');
      }
    } else $('#copy-report').click();
  };
  $('#download-report').onclick = () =>
    download(report, 'trident-week-' + monday(reviewDate) + '.md', 'text/markdown');
}
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function renderSettings() {
  $('#app').innerHTML =
    '<div class="eyebrow">KEEP YOUR PROGRESS</div><h1>Yours to keep.<br>Easy to carry.</h1>' +
    (blocked
      ? '<div class="hint warning"><strong>Saving is paused.</strong> Existing browser data is protected. Download the original data below, or reload if you opened another tab. You can restore a valid backup after reviewing it.</div>'
      : '') +
    '<section class="card"><h2>Weekly backup</h2><p>Save a JSON backup to Files or iCloud Drive every week. It restores all workouts and check-ins.</p><button class="primary wide" id="backup">Save full backup ↥</button>' +
    (blocked
      ? '<button class="wide" id="raw-backup" style="margin-top:10px">Download original browser data</button>'
      : '') +
    '<p class="subtle" style="margin:14px 0 0">Logs are stored in this browser on this device. Clearing website data, private browsing, switching app addresses or losing the phone can remove access. There is no automatic cloud sync.</p></section>' +
    '<section class="card"><h2>Restore a backup</h2><p class="subtle">Choose a Trident JSON file. You will review its counts before restoring. Matching sessions/check-ins use the newer edit; other entries are retained.</p><input id="import-file" type="file" accept=".json,application/json" aria-label="Choose Trident backup"><div id="import-preview"></div></section>' +
    '<section class="card"><h2>On your iPhone</h2><ol><li>Open the app in Safari.</li><li>Tap Share, then Add to Home Screen.</li><li>Open it from that icon and use that same place for logging.</li><li>Open once online before relying on offline access.</li></ol><p class="subtle">Offline readiness: <strong id="offline-status">checking…</strong>. Rest timers catch up after you unlock your phone; there are no background alarms.</p></section>' +
    '<section class="card"><h2>How to log accurately</h2><p><strong>kg:</strong> choose per dumbbell, total bar + plates, machine stack, assistance or bodyweight. Less assistance means a harder rep.</p><p><strong>RIR:</strong> clean reps still available. A set at 10 reps with 2 RIR means you could likely do 12 clean reps.</p><p><strong>Unilateral lifts:</strong> enter both sides, including RIR. One logged set represents the pair. Note unequal loads.</p><p><strong>Equipment:</strong> record your machine or substitution. Numbers from different machines are not automatically comparable.</p><p><strong>Week 7:</strong> choose it when starting a session; the tracker applies deload set counts. Keep the prescribed lighter load and 4–5 RIR.</p><p><strong>Next weights:</strong> use the weekly export for coaching. “Use last weights” only copies your record; it does not prescribe an increase.</p></section><footer>TRIDENT FORGE · plan ' +
    PLAN_VERSION +
    '<br>No analytics. No workout data is sent to a server by this app.<br>Source and operating guide are in your fitness project.</footer>';
  $('#backup').onclick = async () => {
    const content = JSON.stringify(state, null, 2),
      name = 'trident-backup-' + localDate() + '.json';
    const file = new File([content], name, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Trident backup' });
        return;
      } catch (e) {
        if (e.name === 'AbortError') return;
      }
    }
    download(content, name, 'application/json');
  };
  if (blocked)
    $('#raw-backup').onclick = () =>
      download(rawBackup, 'trident-original-recovery.json', 'application/json');
  $('#import-file').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 10000000) throw Error('File is too large (maximum 10 MB).');
      const incoming = validateState(JSON.parse(await file.text()));
      $('#import-preview').innerHTML =
        '<div class="hint" style="margin-top:12px">' +
        incoming.sessions.length +
        ' workouts and ' +
        incoming.checkins.length +
        ' check-ins.<br>' +
        (blocked
          ? 'This will restore the backup as your active data.'
          : 'Newer matching entries will win; other records stay.') +
        '</div><button class="primary wide" id="confirm-import" style="margin-top:12px">Restore these records</button>';
      $('#confirm-import').onclick = () => {
        const next = blocked ? incoming : mergeState(state, incoming);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          state = next;
          blocked = false;
          save();
          renderSettings();
          toast('Backup restored.');
        } catch {
          toast('Could not write restored data. Original records remain intact.');
        }
      };
    } catch (err) {
      $('#import-preview').textContent = 'Could not import: ' + err.message;
    }
  };
  if ('serviceWorker' in navigator)
    navigator.serviceWorker
      .getRegistration()
      .then(async (r) => {
        const cached = await caches.match(new URL('./index.html', location.href).href);
        const el = $('#offline-status');
        if (el)
          el.textContent =
            r?.active && cached ? 'ready on this browser' : 'open online and reload once';
      })
      .catch(() => {
        if ($('#offline-status')) $('#offline-status').textContent = 'not available';
      });
  else $('#offline-status').textContent = 'not available; use HTTPS';
}
function bindTimers() {
  document.querySelectorAll('[data-rest]').forEach(
    (b) =>
      (b.onclick = () => {
        timerEnd = Date.now() + Number(b.dataset.rest) * 1000;
        $('#timer').hidden = false;
        tick();
      }),
  );
}
function tick() {
  if (!timerEnd) return;
  const seconds = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
  $('#timer-value').textContent = seconds
    ? String(Math.floor(seconds / 60)).padStart(2, '0') +
      ':' +
      String(seconds % 60).padStart(2, '0')
    : 'Ready';
}
$('#timer-add').onclick = () => {
  timerEnd = Math.max(timerEnd, Date.now()) + 30000;
  tick();
};
$('#timer-close').onclick = () => {
  timerEnd = 0;
  $('#timer').hidden = true;
};
setInterval(tick, 500);
document.addEventListener('visibilitychange', tick);
document.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    rawBackup = e.newValue || '';
    blocked = true;
    $('#save-status').textContent = 'Another tab changed data';
    $('#save-status').classList.add('error');
    toast('Another tab changed your log. Reload this tab before editing. Saving here is paused.');
  }
});
if (!blocked) save();
else $('#save-status').textContent = 'Recovery needed';
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:')
  navigator.serviceWorker.register('./sw.js').catch(() => {
    if ($('#offline-status')) $('#offline-status').textContent = 'not ready';
  });
