import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAN_VERSION, EXERCISES, TEMPLATES, CYCLE_SCHEDULE, CYCLE_START,
  createSession, planFor, progress, recommendedTemplate, scheduledTemplate,
  scheduledSessions, addDays, cycleDay, isGymClosed, newState, validateState, mergeState,
  exerciseRir, sessionInstructions, cardioValid, cardioLogRequired, weeklySummary,
} from '../public/trident/core.mjs';
import { validateSchedule, analyze } from '../src/lib/trident/coach.mjs';

test('PPL pauses on Sundays across anchors, months, leap days and year boundaries', () => {
  assert.equal(PLAN_VERSION, '2026-10-05-r8');
  for (const anchor of [CYCLE_START, '2026-12-29', '2028-02-26', '2026-10-11']) {
    let expectedDay = -Array.from({length: 20}, (_, i) => addDays(anchor, i - 20)).filter(d => !isGymClosed(d)).length;
    for (let day = -20; day < 80; day++) {
      const date = addDays(anchor, day);
      assert.equal(cycleDay(date, anchor), ((expectedDay % 8) + 8) % 8);
      assert.equal(recommendedTemplate(date, anchor), isGymClosed(date) ? '' : CYCLE_SCHEDULE[((expectedDay % 8) + 8) % 8] || '');
      if (!isGymClosed(date)) expectedDay++;
    }
  }
  assert.equal(recommendedTemplate('2026-10-11'), '');
  assert.equal(recommendedTemplate('2026-10-12'), 'legsB');
  assert.equal(recommendedTemplate('2026-10-13'), '');
  assert.equal(recommendedTemplate('2026-10-14'), 'pushA');
  assert.throws(() => cycleDay('2026-02-30'));
});

test('anchor changes preserve saved sessions and exclude Sunday from weekly targets', () => {
  const data = newState();
  const saved = createSession('2026-10-05', 'pushA', 1);
  data.sessions.push(saved);
  const original = JSON.stringify(saved);
  data.preferences = { cycleStart: '2026-10-06' };
  assert.equal(scheduledTemplate(data, '2026-10-06'), 'pushA');
  assert.equal(scheduledTemplate(data, '2026-10-09'), null);
  assert.equal(JSON.stringify(saved), original);
  assert.equal(scheduledSessions(newState(), '2026-10-05'), 5);
  assert.equal(scheduledSessions(newState(), '2026-10-12'), 4);
  data.preferences.cycleStart = 'bad';
  assert.throws(() => validateState(data));
});

test('Sunday pauses accepted splits too, preserves historical Sunday logs and keeps both cycle rests', () => {
  const data = newState();
  data.sessions.push(createSession('2026-10-11', 'legsB', 1));
  const saved = JSON.stringify(data.sessions);
  data.coach = {reviews: [], activeSplit: {effectiveDate: '2026-10-11', schedule: [...CYCLE_SCHEDULE]}};
  assert.equal(scheduledTemplate(data, '2026-10-11'), null);
  assert.equal(scheduledTemplate(data, '2026-10-12'), 'pushA');
  assert.equal(scheduledTemplate(data, '2026-10-15'), null);
  assert.equal(scheduledTemplate(data, '2026-10-18'), null);
  assert.equal(scheduledTemplate(data, '2026-10-19'), 'legsB');
  assert.equal(scheduledTemplate(data, '2026-10-20'), null);
  assert.equal(scheduledTemplate(data, '2026-10-21'), 'pushA');
  const restored = validateState(JSON.parse(JSON.stringify(data)));
  assert.equal(JSON.stringify(restored.sessions), saved);
  assert.match(weeklySummary(data, '2026-10-12'), /Sunday is fixed rest because the gym is closed/);
});

test('volume phases prescribe 64/85/87/89 cycle sets, with 55 deload sets and correct muscle inventory', () => {
  for (const [phase, expected, lateral] of [['entry',64,8], ['foundation',85,10], ['build',87,12], ['full',89,14]]) {
    const sessions = Object.keys(TEMPLATES).map(t => createSession(CYCLE_START, t, 3, PLAN_VERSION, phase));
    assert.equal(sessions.reduce((n,s) => n + progress(s).total, 0), expected);
    assert.equal(sessions.flatMap(s => s.exercises).filter(e => ['lateral','lateralpull'].includes(e.id)).reduce((n,e)=>n+e.sets.length,0), lateral);
    assert.equal(Object.keys(TEMPLATES).map(t => createSession(CYCLE_START,t,7,PLAN_VERSION,phase)).reduce((n,s)=>n+progress(s).total,0),55);
  }
  const inventory = Object.values(TEMPLATES).flatMap(t => t.ids.map(id => EXERCISES[id]));
  const sets = group => inventory.filter(e=>e.group===group).reduce((n,e)=>n+e.sets,0);
  assert.equal(sets('Chest'),12);
  assert.equal(sets('Back'),14);
  assert.equal(sets('Side delts'),14);
  assert.equal(sets('Biceps'),7);
  assert.equal(sets('Triceps'),6);
  for (const id of ['shrug','cabley','midtrapshrug']) assert.ok(!inventory.some(e=>e.id===id));
});

test('phase can be held independently of cycle number; stored targets and entry effort survive restore', () => {
  const data = newState();
  for (const phase of ['entry','foundation','build','full']) {
    const s = createSession(addDays(CYCLE_START, data.sessions.length), 'pullA', 6, PLAN_VERSION, phase);
    data.sessions.push(s);
    assert.equal(s.volumePhase,phase);
  }
  const restored = mergeState(newState(),validateState(JSON.parse(JSON.stringify(data))));
  assert.deepEqual(restored.sessions,data.sessions);
  assert.equal(restored.sessions[1].exercises.at(-1).sets.length,2);
  assert.equal(exerciseRir(restored.sessions[0],'pulldown'),'3');
  assert.match(sessionInstructions(restored.sessions[1]),/hold the phase/);
  assert.throws(()=>createSession(CYCLE_START,'pushA',3,PLAN_VERSION,'invalid'));
});

test('all eight revisions and every numbered block survive backup; historical r7 cardio stays optional', () => {
  const data = newState();
  for (const version of ['2026-09-08','2026-09-08-r2','2026-09-09-r3','2026-09-09-r4','2026-09-10-r5','2026-09-13-r6','2026-09-29-r7',PLAN_VERSION])
    for (const t of Object.keys(planFor(version).templates))
      for (let week=1;week<=8;week++) data.sessions.push(createSession(addDays(CYCLE_START,week),t,week,version));
  assert.equal(JSON.stringify(validateState(JSON.parse(JSON.stringify(data)))),JSON.stringify(data));
  const r7 = createSession(CYCLE_START,'pushA',3,'2026-09-29-r7');
  assert.equal(progress(r7).total,13);
  r7.cardioDuration='0';
  assert.equal(cardioLogRequired(r7),false);
  assert.equal(cardioValid(r7),false);
  r7.cardioDuration='18';r7.cardio='Easy treadmill';
  assert.equal(cardioValid(r7),true);
});

test('actual steps validate, merge and appear in weekly summaries without inventing missing days', () => {
  const data = newState();
  data.checkins.push({date:CYCLE_START,weight:'',sleep:'8',waist:'',steps:'6500',notes:'Good recovery',updatedAt:new Date().toISOString()});
  const restored=mergeState(newState(),validateState(JSON.parse(JSON.stringify(data))));
  assert.equal(restored.checkins[0].steps,'6500');
  assert.match(weeklySummary(restored,CYCLE_START),/Average steps: 6500/);
  for(const bad of [-1,3.5,100001,'invalid']) {const copy=structuredClone(data);copy.checkins[0].steps=bad;assert.throws(()=>validateState(copy));}
  delete data.checkins[0].steps;
  validateState(data);
  assert.match(weeklySummary(data,CYCLE_START),/Average steps: not logged/);
});

test('new reports use cycle labels and calendar-week targets; preserved seven-day proposals do not override new rotation', () => {
  const data=newState(); data.sessions.push(createSession('2026-10-13','pushA',2));
  assert.match(weeklySummary(data,'2026-10-13'),/current target: 4 lifting sessions in this calendar week/);
  assert.match(weeklySummary(data,'2026-10-13'),/Cycle 2/);
  data.coach={reviews:[],activeSplit:{effectiveDate:'2026-10-05',schedule:['pushA','pullA','legsA','pushB','pullB','legsB',null]}};
  validateState(data);
  assert.equal(scheduledTemplate(data,'2026-10-08'),null);
  assert.deepEqual(validateSchedule(CYCLE_SCHEDULE),CYCLE_SCHEDULE);
});

test('coach uses current diet targets and eight-day context, and rejects compression into seven days', async () => {
  const data=newState();
  for(let i=0;i<21;i++) {
    const date=addDays('2026-09-15',i),template=recommendedTemplate(date);
    if(template){const s=createSession(date,template,3);s.status='finished';data.sessions.push(s);}
    data.checkins.push({date,weight:'',sleep:'5',waist:'',notes:'Low recovery',updatedAt:new Date().toISOString()});
  }
  let prompt='',context;
  const request=async(url,options)=>{const sent=JSON.parse(options.body);prompt=sent.messages[0].content;context=JSON.parse(sent.messages[1].content);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({summary:'Review',dailyAnalysis:'Keep the rotation',nutrition:'Use current plan',recovery:'Rest',split:{changeNeeded:true,reason:'Fatigue',schedule:['pushA','pullA','legsA',null,null,null,null]}})}}]}),{status:200});};
  const response=await analyze({mode:'weekly',date:'2026-10-05',state:data},new Headers({'x-deepseek-key':'test-key-at-least-16'}),{},request);
  assert.equal(context.splitEvidence.eligible,true);
  assert.deepEqual(context.currentSchedule,CYCLE_SCHEDULE);
  assert.match(prompt,/supplied plan calorieTarget/);
  assert.match(prompt,/never compress the cycle into seven days/);
  assert.match(prompt,/Sunday is fixed rest because the gym is closed/);
  assert.equal(response.split.changeNeeded,false);
});
