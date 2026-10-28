import {test} from 'node:test';
import assert from 'node:assert/strict';
import {task,progress,complete,restore,move,duplicate,week,today,validate} from './model.js';
const day='2026-10-23';
test('Lima and Monday week boundaries',()=>{assert.equal(today(new Date('2026-10-24T02:00:00Z')),day);assert.equal(week('2026-10-25'),'2026-10-19');assert.equal(week('2026-10-26'),'2026-10-26');});
test('empty, exact quarters, thirds and eighths',()=>{assert.deepEqual(progress([],day),{total:0,done:0,percent:0,stage:0});for(const n of [3,4,8]){const list=Array.from({length:n},()=>task({scheduled:day}));for(let i=0;i<n;i++){complete(list[i]);const p=progress(list,day);assert.equal(p.percent,(i+1)/n*100);assert.equal(p.total,n);}assert.equal(progress(list,day).stage,4);}});
test('stable move, completion, pending subtasks, restore and JSON roundtrip',()=>{const t=task({title:'Informe',scheduled:day,week:week(day),area:'Comercial',notes:'Conservar'});t.subtasks=[{id:'sub',taskId:t.id,title:'Revisar',done:false,order:0,created:t.created,completed:null}];const id=t.id;complete(t);assert.equal(t.subtasks[0].done,false);assert.equal(progress([t],day).done,1);restore(t);assert.equal(t.state,'Pendiente');assert.equal(t.completed,null);move(t,'today','',false,day);assert.equal(t.week,week(day));move(t,'pending');assert.equal(t.id,id);assert.equal(t.area,'Comercial');assert.equal(t.notes,'Conservar');const raw={version:1,tasks:[t],projects:[]};assert.deepEqual(validate(JSON.parse(JSON.stringify(raw))),raw);});
test('subtasks do not complete parent or affect denominator',()=>{const t=task({scheduled:day,subtasks:[{done:true}]});assert.equal(t.state,'Pendiente');assert.equal(progress([t],day).done,0);assert.equal(progress([t,t],day).total,1);});
test('adding, restoring, deleting and rescheduling recompute actual population',()=>{const a=task({scheduled:day}),b=task({scheduled:day}),late=task({scheduled:'2026-10-22'});complete(a);assert.equal(progress([a],day).percent,100);assert.equal(progress([a,b,late],day).percent,1/3*100);restore(a);assert.equal(progress([a,b],day).percent,0);complete(a);move(b,'pending');assert.equal(progress([a,b],day).percent,100);assert.equal(progress([b],day).total,0);move(late,'today','',false,day);assert.equal(progress([a,late],day).percent,50);});
test('copy regenerates all IDs and resets completion',()=>{const t=task({title:'A',scheduled:day,subtasks:[{id:'s',done:true,completed:'date',order:0}]});complete(t);const copy=duplicate(t,10);assert.notEqual(copy.id,t.id);assert.notEqual(copy.subtasks[0].id,t.subtasks[0].id);assert.equal(copy.subtasks[0].taskId,copy.id);assert.equal(copy.subtasks[0].done,false);assert.equal(copy.state,'Pendiente');assert.equal(copy.completed,null);});
test('invalid and duplicate imports rejected',()=>{assert.throws(()=>validate({tasks:[]}));const t=task({title:'A'});assert.throws(()=>validate({version:1,tasks:[t,t],projects:[]}));assert.throws(()=>validate({version:1,tasks:[{...t,scheduled:'2026-02-30'}],projects:[]}));assert.throws(()=>validate({version:1,tasks:[{...t,project:'missing'}],projects:[]}));});

test('three overdue tasks completed today and one overdue pending produce 75 percent',()=>{
 const date='2026-10-27';const tasks=Array.from({length:4},()=>task({scheduled:'2026-10-23'}));
 tasks.slice(0,3).forEach(t=>{t.state='Completada';t.completed='2026-10-27T17:00:00Z';});
 assert.deepEqual(progress(tasks,date),{total:4,done:3,percent:75,stage:3});
 restore(tasks[0]);assert.equal(progress(tasks,date).percent,50);
});
test('daily progress includes work finished today without planning but excludes past history and future pending',()=>{
 const date='2026-10-27';const done=task({state:'Completada',completed:'2026-10-28T01:00:00Z'});
 const old=task({scheduled:'2026-10-23',state:'Completada',completed:'2026-10-26T18:00:00Z'}),future=task({scheduled:'2026-10-28'}),backlog=task();
 assert.deepEqual(progress([done,done,old,future,backlog],date),{total:1,done:1,percent:100,stage:4});
});
test('direct drag destinations transfer daily planning to week and then backlog without duplicating',()=>{
 const date='2026-10-27',t=task({title:'Mover',scheduled:date,notes:'Conservar',area:'Comercial'}),id=t.id;
 t.subtasks=[{id:'paso',taskId:id,title:'Paso',done:true,order:0,created:t.created,completed:t.created}];
 move(t,'week','2026-10-26',true,date);assert.equal(t.scheduled,'');assert.equal(t.week,'2026-10-26');
 move(t,'pending','',false,date);assert.equal(t.scheduled,'');assert.equal(t.week,'');assert.equal(t.id,id);assert.equal(t.notes,'Conservar');assert.equal(t.area,'Comercial');assert.equal(t.subtasks[0].done,true);
 move(t,'today','',false,date);assert.equal(t.scheduled,date);assert.equal(t.id,id);
});