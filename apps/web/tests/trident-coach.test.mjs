import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, loadTargets, splitEvidence, validateSchedule } from '../src/lib/trident/coach.mjs';
import { newState, createSession, validateState, mergeState } from '../public/trident/core.mjs';
import { NUTRITION_PLAN } from '../public/trident/nutrition-plan.mjs';
const session=()=>{const s=createSession('2026-10-01','pushA',1);s.status='finished';for(const e of s.exercises){e.variation='same gym machine';for(const x of e.sets)Object.assign(x,{load:20,reps:20,rir:3,right:20,rirRight:3,done:true});}return s;};
const state=()=>{const x=newState();x.sessions=[session()];return x;};
const output={summary:'Controlled training.',dailyAnalysis:'Keep the same equipment.',nutrition:'Log measured meals.',recovery:'Recover between sessions.',split:{changeNeeded:true,reason:'Change requested by model',schedule:['pushA','pullA','legsA',null,null,null,null]}};
const mocked=async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(output)}}]});
test('S+ banana, oats, soya, paneer, rice and flax diet matches the agreed schedule and macros',()=>{
 assert.equal(NUTRITION_PLAN.revision,'2026-10-05-splus-dairy-flax');
 assert.equal(NUTRITION_PLAN.meals.length,6);
 assert.equal(NUTRITION_PLAN.meals.reduce((n,m)=>n+m.calories,0),2078);
 const protein=NUTRITION_PLAN.meals.reduce((n,m)=>n+m.protein,0);
 assert.ok(protein>=150&&protein<=160);
 assert.equal(NUTRITION_PLAN.carbohydrates,245);assert.equal(NUTRITION_PLAN.fat,58);
 assert.equal(NUTRITION_PLAN.meals.find(m=>m.id==='pre-workout').time,'06:25');
 assert.equal(NUTRITION_PLAN.meals.find(m=>m.id==='post-workout').time,'08:30');
 assert.equal(NUTRITION_PLAN.meals.find(m=>m.id==='breakfast').time,'08:45');
 assert.ok(NUTRITION_PLAN.meals.find(m=>m.id==='lunch').ingredients.includes('55 g dry soya chunks'));
 assert.ok(NUTRITION_PLAN.meals.find(m=>m.id==='lunch').ingredients.includes('70 g dry rice'));
 assert.ok(NUTRITION_PLAN.meals.find(m=>m.id==='dinner').ingredients.includes('55 g dry soya chunks'));
 const ingredients=NUTRITION_PLAN.meals.flatMap(m=>m.ingredients);
 assert.equal(ingredients.filter(i=>i.toLowerCase().includes('soya chunks')).length,2);
 assert.equal(ingredients.filter(i=>i.includes('lower-fat paneer')).length,2);
 assert.equal(ingredients.filter(i=>i.includes('70 g dry rice')).length,2);
 assert.equal(ingredients.filter(i=>i.includes('75 g cucumber')).length,2);
 assert.ok(ingredients.includes('36 g OWN cocoa plant protein'));
 for(const excluded of ['masoor','moong','lentil','edamame','palak','spinach','carrot'])
  assert.ok(ingredients.every(i=>!i.toLowerCase().includes(excluded)),excluded);
});
test('all sets and both unilateral sides must meet targets; no invented weight increments',()=>{
 const data=state();const targets=loadTargets(data,'2026-10-04');assert.ok(targets.some(t=>t.action==='smallest equipment increment'));assert.ok(targets.filter(t=>t.action==='smallest equipment increment').every(t=>t.targetLoad===null));
 data.sessions[0].exercises[0].sets[0].reps=1;assert.equal(loadTargets(data,'2026-10-04')[0].action,'hold and build reps');
 const lateral=data.sessions[0].exercises.find(e=>e.id==='lateral');lateral.sets[0].right=1;assert.equal(loadTargets(data,'2026-10-04').find(t=>t.exerciseID==='lateral').action,'hold and build reps');
});
test('pain, deload and incomplete sets cannot trigger increases',()=>{
 const data=state();data.sessions[0].pain='mild';assert.ok(loadTargets(data,'2026-10-04').every(t=>t.action==='review pain'&&t.targetLoad===null));
 data.sessions[0].pain='none';data.sessions[0].week=7;assert.ok(loadTargets(data,'2026-10-04').every(t=>t.action==='hold after deload'));
});
test('split schedule must retain balanced groups and at least one rest day',()=>{
 assert.equal(validateSchedule(['pushA','pushB',null,null,null,null,null]),null);assert.equal(validateSchedule(['pushA','pullA','legsA','pushA',null,null,null]),null);assert.ok(validateSchedule(['pushA','pullA','legsA',null,null,null,null]));assert.equal(splitEvidence(state(),'2026-10-04').eligible,false);
});
test('server refuses missing key and protects configured paid key with private access code',async()=>{
 await assert.rejects(()=>analyze({mode:'daily',date:'2026-10-01',state:state()},new Headers(),{},mocked),{status:503});
 await assert.rejects(()=>analyze({mode:'daily',date:'2026-10-01',state:state()},new Headers(),{DEEPSEEK_API_KEY:'sk-test-with-no-real-value',TRIDENT_COACH_TOKEN:'private'},mocked),{status:401});
});
test('model cannot change a split without longitudinal evidence, or override weight guidance',async()=>{
 let sent;
 const response=await analyze({mode:'weekly',date:'2026-10-04',state:state()},new Headers({'x-coach-token':'private'}),{DEEPSEEK_API_KEY:'sk-test-with-no-real-value',TRIDENT_COACH_TOKEN:'private'},async(url,options)=>{sent=JSON.parse(options.body);return mocked();});
 assert.equal(response.split.changeNeeded,false);assert.equal(response.split.schedule,null);assert.equal(sent.model,'deepseek-flash');assert.equal(sent.response_format.type,'json_object');assert.equal(sent.messages.length,2);assert.ok(response.targets.length);assert.ok(!JSON.stringify(response).includes('sk-test'));
});
test('malformed model output and provider failures give retryable errors',async()=>{
 const body={mode:'daily',date:'2026-10-01',state:state()},headers=new Headers({'x-deepseek-key':'sk-test-with-no-real-value'});
 await assert.rejects(()=>analyze(body,headers,{},async()=>Response.json({choices:[{finish_reason:'length',message:{content:'{}'}}]})),{status:502});
 await assert.rejects(()=>analyze(body,headers,{},async()=>new Response('',{status:402})),{status:502});
});
test('meal snapshots backup and merge; malformed new records cannot overwrite logs',()=>{
 const data=state();data.mealLogs=[{id:'meal1',date:'2026-10-04',mealID:'breakfast',name:'Oats',portion:1,calories:570,protein:22.6,revision:'2026-10-04-buffalo-oats-soya-wraps',updatedAt:new Date().toISOString()}];assert.equal(validateState(data).mealLogs.length,1);assert.equal(data.mealLogs[0].calories,570);assert.equal(data.mealLogs[0].revision,'2026-10-04-buffalo-oats-soya-wraps');
 const incoming=structuredClone(data);incoming.mealLogs[0].id='meal2';incoming.mealLogs[0].updatedAt=new Date(Date.now()+1000).toISOString();assert.equal(mergeState(data,incoming).mealLogs.length,1);
 incoming.mealLogs[0].calories=-1;assert.throws(()=>validateState(incoming));
});

test('verified equipment increment yields an exact weight; assistance decreases rather than increases',()=>{
 const data=state();data.sessions[0].exercises[0].basis='total';
 assert.equal(loadTargets(data,'2026-10-04',{total:1})[0].targetLoad,21);
 data.sessions[0].exercises[0].basis='assistance';
 assert.equal(loadTargets(data,'2026-10-04',{assistance:1})[0].targetLoad,19);
 assert.equal(loadTargets(data,'2026-10-04',{assistance:1})[0].action,'reduce assistance');
 assert.equal(loadTargets(data,'2026-10-04',{assistance:10})[0].targetLoad,null);
});

test('ramping sets keep their individual reference loads instead of prescribing the heaviest load throughout',()=>{
 const data=state();data.sessions[0].exercises[0].sets[0].load=10;
 const target=loadTargets(data,'2026-10-04')[0];assert.equal(target.targetLoad,null);assert.equal(target.action,'repeat comparable set loads');assert.equal(target.referenceSets[0].load,10);
});

test('PR markers compare reps at the same load and both unilateral sides',async()=>{
 const {recordBadge,estimatedMax}=await import('../public/trident/analytics.mjs');
 const data=state(),previous=data.sessions[0],current=structuredClone(previous);current.date='2026-10-04';
 const ex=current.exercises[0];previous.exercises[0].sets.forEach(x=>{x.load=30;x.reps=10;});ex.sets.forEach(x=>{x.load=30;x.reps=8;});ex.sets[0].load=20;
 assert.equal(recordBadge(data,ex,current),'');ex.sets[1].reps=11;assert.equal(recordBadge(data,ex,current),'Rep PR · same load');
 const unilateral=current.exercises.find(e=>e.id==='lateral');previous.exercises.find(e=>e.id==='lateral').sets.forEach(x=>{x.reps=20;x.right=20;});unilateral.sets.forEach(x=>{x.reps=21;x.right=10;});assert.equal(recordBadge(data,unilateral,current),'');
 assert.equal(estimatedMax({...ex.sets[0],load:100,reps:5,rir:2}, {...ex,basis:'total'}),100*(1+5/30));assert.equal(estimatedMax({...ex.sets[0],load:100,reps:12,rir:2},{...ex,basis:'total'}),null);
});
