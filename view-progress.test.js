import {test} from 'node:test';
import assert from 'node:assert/strict';
import {task,restore} from './model.js';
import {viewProgress,archiveCompleted,inPlanningView} from './task-views.js';
const context={day:'2026-10-27',selectedWeek:'2026-10-26',selectedArea:''};
function fixtures(){return [
 task({title:'Hoy completada',scheduled:context.day,week:context.selectedWeek,area:'Comercial',state:'Completada',completed:'2026-10-27T15:00:00Z'}),
 task({title:'Hoy pendiente',scheduled:context.day,week:context.selectedWeek,area:'Comercial'}),
 task({title:'Semana siguiente',scheduled:'2026-11-03',week:'2026-11-02',area:'Gerencia'}),
 task({title:'Pendiente finalizada',area:'Gerencia',state:'Completada',completed:'2026-10-26T15:00:00Z'}),
 task({title:'Pendiente sin plan'}),
 task({title:'Meta finalizada',scheduled:'2026-10-30',week:context.selectedWeek,area:'Comercial',state:'Completada',completed:'2026-10-26T16:00:00Z'}),
 task({title:'Otra pendiente sin plan'})
];}
test('same records give progress for the selected daily, weekly, pending and area scope',()=>{
 const tasks=fixtures();
 assert.deepEqual(viewProgress(tasks,'today',context),{total:2,done:1,percent:50,stage:2});
 assert.deepEqual(viewProgress(tasks,'week',context),{total:3,done:2,percent:2/3*100,stage:2});
 assert.deepEqual(viewProgress(tasks,'pending',context),{total:3,done:1,percent:1/3*100,stage:1});
 assert.deepEqual(viewProgress(tasks,'area',context),{total:5,done:3,percent:60,stage:2});
});
test('week and area selectors determine the denominator and empty scopes stay idle',()=>{
 const tasks=fixtures();
 assert.deepEqual(viewProgress(tasks,'week',{...context,selectedWeek:'2026-11-02'}),{total:1,done:0,percent:0,stage:0});
 assert.equal(viewProgress(tasks,'area',{...context,selectedArea:'Comercial'}).percent,2/3*100);
 assert.equal(viewProgress(tasks,'area',{...context,selectedArea:'Gerencia'}).percent,50);
 assert.deepEqual(viewProgress(tasks,'area',{...context,selectedArea:'Operativo'}),{total:0,done:0,percent:0,stage:0});
});
test('archiving preserves every scope progress, duplicate visibility does not double count and restoring recalculates',()=>{
 const tasks=fixtures(),archived=archiveCompleted(tasks,tasks.map(t=>t.id));
 for(const view of ['today','week','pending','area'])assert.deepEqual(viewProgress(archived,view,context),viewProgress(tasks,view,context));
 assert.equal(inPlanningView(archived[0],'week',context),false);
 assert.deepEqual(viewProgress([...archived,archived[0]],'week',context),viewProgress(tasks,'week',context));
 restore(archived[0]);assert.equal(viewProgress(archived,'today',context).percent,0);assert.equal(viewProgress(archived,'week',context).done,1);
});
