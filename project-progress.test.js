import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectProgress} from './project-progress.js';
test('all projects appear including empty and completed projects',()=>{
 const projects=[{id:'a',name:'A',state:'Activo'},{id:'b',name:'B',state:'Completado'}];
 const tasks=[{id:'1',project:'a',state:'Completada'},{id:'2',project:'a',state:'En espera'},{id:'3',project:'other',state:'Completada'}];
 const result=projectProgress(projects,tasks);assert.equal(result.length,2);assert.deepEqual(result[0],{...projects[0],total:2,done:1,percent:50});assert.deepEqual(result[1],{...projects[1],total:0,done:0,percent:0});
});
test('progress counts each main task once regardless of date, view or checklist',()=>{
 const a={id:'1',project:'p',state:'Completada',scheduled:'2026-01-01'},b={id:'2',project:'p',state:'Pendiente',scheduled:'2027-01-01',subtasks:[{done:true}]};
 let result=projectProgress([{id:'p'}],[a,a,b])[0];assert.equal(result.total,2);assert.equal(result.percent,50);
 a.state='Pendiente';result=projectProgress([{id:'p'}],[a,b])[0];assert.equal(result.percent,0);
});
