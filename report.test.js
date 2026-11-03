import {test} from 'node:test';
import assert from 'node:assert/strict';
import {task} from './model.js';
import {dailyReport} from './report.js';
const day='2026-10-27';
const morning=new Date('2026-10-27T17:00:00Z'); // 12:00 en Lima
test('report matches requested date and activity format using completion date in Lima',()=>{
 const tasks=[task({title:'Reuniones con las empresas',state:'Completada',scheduled:'2026-10-20',completed:'2026-10-27T14:00:00Z'}),task({title:'Diapositivas empresa',state:'Completada',completed:'2026-10-28T01:00:00Z'}),task({title:'Pasé varios reportes',scheduled:day},1),task({title:'Revisar el caso de Rebeca',scheduled:'2026-10-26'},2)];
 assert.equal(dailyReport(tasks,day,morning).text,'**27/10/2026 - MAÑANA**\n- Reuniones con las empresas\n- Diapositivas empresa\n- Pasé varios reportes (PENDIENTE)\n- Revisar el caso de Rebeca (PENDIENTE)');
});
test('report excludes other completion days, future tasks and unscheduled backlog, deduplicates IDs',()=>{
 const a=task({title:'Hoy',scheduled:day}),others=[task({title:'Ayer',state:'Completada',completed:'2026-10-26T15:00:00Z',scheduled:day}),task({title:'Mañana',scheduled:'2026-10-28'}),task({title:'Sin programar'})];
 assert.deepEqual(dailyReport([a,a,...others],day,morning),{text:'**27/10/2026 - MAÑANA**\n- Hoy (PENDIENTE)',completed:0,pending:1});
});
test('empty report has the date and no invented activities',()=>{assert.deepEqual(dailyReport([],day,morning),{text:'**27/10/2026 - MAÑANA**',completed:0,pending:0});});
test('report changes from MAÑANA to TARDE at 4 pm in Lima',()=>{
 assert.match(dailyReport([],day,new Date('2026-10-27T20:59:00Z')).text,/MAÑANA/);
 assert.match(dailyReport([],day,new Date('2026-10-27T21:00:00Z')).text,/TARDE/);
});
