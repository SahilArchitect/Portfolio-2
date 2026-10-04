import { setValid, exerciseDefinition } from './core.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=s=>String(s||'').trim().toLowerCase();
export function comparable(a,b){return a.id===b.id&&a.basis===b.basis&&normalized(a.variation)===normalized(b.variation);}
export function estimatedMax(set,exercise){
 if(!['total','per-dumbbell','single-dumbbell'].includes(exercise.basis))return null;
 const reps=exerciseDefinition(exercise.id).unilateral?Math.min(Number(set.reps),Number(set.right)):Number(set.reps), load=Number(set.load);
 if(!setValid(set,exercise)||reps<1||reps>10||load<=0)return null;
 return reps===1?load:load*(1+reps/30);
}
export function history(state,exercise,before=null){
 return state.sessions.filter(s=>!before||s.date<before).sort((a,b)=>b.date.localeCompare(a.date)).flatMap(s=>s.exercises.filter(e=>comparable(e,exercise)).map(e=>({date:s.date,exercise:e,sets:e.sets.filter(x=>x.done&&setValid(x,e))}))).filter(h=>h.sets.length);
}
export function recordBadge(state,exercise,session){
 const current=exercise.sets.filter(x=>x.done&&setValid(x,exercise));if(!current.length)return '';
 const prior=history(state,exercise,session.date).flatMap(h=>h.sets);if(!prior.length)return 'First comparable performance';
 if(exercise.basis==='assistance'){if(Math.min(...current.map(x=>Number(x.load)))<Math.min(...prior.map(x=>Number(x.load))))return 'Less assistance recorded';return '';}
 if(exercise.basis!=='bodyweight'&&Math.max(...current.map(x=>Number(x.load)))>Math.max(...prior.map(x=>Number(x.load))))return 'Load PR · same equipment';
 const repetitions = x => exerciseDefinition(exercise.id).unilateral ? Math.min(Number(x.reps),Number(x.right)) : Number(x.reps);
 if(current.some(x=>{const matches=prior.filter(p=>Number(p.load)===Number(x.load));return matches.length>0 && repetitions(x)>Math.max(...matches.map(repetitions));}))return 'Rep PR · same load';
 return '';
}
export function openExerciseHistory(state,exercise){
 let dialog=document.querySelector('#exercise-history');if(!dialog){dialog=document.createElement('dialog');dialog.id='exercise-history';document.body.append(dialog);}
 const entries=history(state,exercise);
 dialog.innerHTML='<div class="row"><h2>'+esc(exercise.name)+'</h2><button id="close-exercise-history" aria-label="Close exercise history">×</button></div><p class="subtle">Comparable records · '+esc(exercise.basis)+' · '+esc(exercise.variation||'equipment not specified')+'</p>'+entries.map(h=>'<article class="history-entry"><strong>'+esc(h.date)+'</strong>'+h.sets.map(x=>{const estimate=estimatedMax(x,exercise);return '<p>'+esc(exercise.basis==='bodyweight'?'Bodyweight':x.load+' kg')+' × '+esc(x.reps)+' reps · '+esc(x.rir)+' RIR'+(exerciseDefinition(exercise.id).unilateral?' · right '+esc(x.right)+' reps':'')+(estimate?' · estimated 1RM '+estimate.toFixed(1)+' kg':'')+'</p>';}).join('')+'</article>').join('')+(entries.length?'':'<p>Log your first set to establish a baseline.</p>')+'<p class="subtle">1RM estimates use Epley for 1–10 reps on supported external-load bases. Machine stacks, added plates and assistance are excluded. Numbers remain specific to their load convention.</p>';
 dialog.showModal();document.querySelector('#close-exercise-history').onclick=()=>dialog.close();
}
