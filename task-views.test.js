import {test} from 'node:test';
import assert from 'node:assert/strict';
import {task,complete,validate,progress,restore,duplicate} from './model.js';
import {inPlanningView,reorderBefore,archiveCompleted} from './task-views.js';
const context={day:'2026-10-27',selectedWeek:'2026-10-26',selectedArea:'Comercial'};
test('completed record appears in daily, weekly and area views without copies',()=>{
 const t=task({title:'Informe',scheduled:context.day,week:context.selectedWeek,area:'Comercial'}),id=t.id;complete(t);
 for(const view of ['today','week','area','done'])assert.equal(inPlanningView(t,view,context),true);
 assert.equal(t.id,id);assert.equal(inPlanningView(t,'pending',context),false);
});
test('today keeps overdue tasks finished today and excludes old completed history',()=>{
 const t=task({scheduled:'2026-10-23',state:'Completada',completed:'2026-10-27T15:00:00Z'});
 assert.equal(inPlanningView(t,'today',context),true);t.completed='2026-10-26T15:00:00Z';assert.equal(inPlanningView(t,'today',context),false);
});
test('clearing finished tasks retains their full record and leaves active and unselected tasks intact',()=>{
 const a=task({title:'A',notes:'Conservar',scheduled:context.day,area:'Comercial'}),b=task({title:'B'}),c=task({title:'C'});complete(a);complete(b);
 const completed=a.completed,previous=a.previous,records=archiveCompleted([a,b,c],[a.id,c.id]);
 assert.equal(records.length,3);assert.equal(records[0].id,a.id);assert.equal(records[0].completed,completed);assert.deepEqual(records[0].previous,previous);assert.equal(records[0].notes,'Conservar');assert.ok(records[0].archivedAt);
 assert.equal(inPlanningView(records[0],'today',context),false);assert.equal(inPlanningView(records[0],'area',context),false);assert.equal(inPlanningView(records[0],'done',context),true);
 assert.equal(records[1],b);assert.equal(records[2],c);assert.deepEqual(archiveCompleted([a,b,c],[]),[a,b,c]);
 validate(JSON.parse(JSON.stringify({version:1,tasks:records,projects:[]})));
});
test('reordering changes priority and persists unique order without losing relationships',()=>{
 const a=task({title:'A',priority:'Alta',notes:'Notas',week:context.selectedWeek},1),b=task({title:'B',priority:'Baja'},2),c=task({title:'C'},3),tasks=[a,b,c],id=a.id;
 assert.equal(reorderBefore(tasks,a,b,true),true);assert.deepEqual([...tasks].sort((a,b)=>a.order-b.order).map(t=>t.title),['B','A','C']);assert.equal(a.id,id);assert.equal(a.priority,'Baja');assert.equal(a.notes,'Notas');assert.equal(a.week,context.selectedWeek);
 validate(JSON.parse(JSON.stringify({version:1,tasks,projects:[]})));assert.equal(reorderBefore(tasks,a,a),false);
});
test('restoring by reorder preserves checklist',()=>{
 const a=task({title:'A',subtasks:[{done:false}]}),b=task({title:'B'});complete(a);reorderBefore([a,b],a,b);assert.equal(a.state,'Pendiente');assert.equal(a.completed,null);assert.equal(a.subtasks[0].done,false);
});

test('clearing preserves daily progress and restoring or duplicating resets archival status',()=>{
 const a=task({title:'A',scheduled:context.day});complete(a);const [archived]=archiveCompleted([a],[a.id]);
 assert.deepEqual(progress([archived],context.day),progress([a],context.day));
 const [again]=archiveCompleted([archived],[a.id]);assert.equal(again.archivedAt,archived.archivedAt);
 const copy=duplicate(archived,1);assert.equal(copy.archivedAt,null);assert.equal(copy.state,'Pendiente');
 restore(archived);assert.equal(archived.archivedAt,null);assert.equal(archived.state,'Pendiente');assert.equal(inPlanningView(archived,'today',context),true);
});