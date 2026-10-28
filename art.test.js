import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runner,scene,SPRITE_FRAMES} from './art.js';
import {progress,task,complete} from './model.js';
test('local sprite asset has alpha and dimensions divisible into the intended grid',()=>{
 const png=readFileSync(new URL('./assets/hiker-poses.png',import.meta.url));
 assert.equal(png.toString('ascii',1,4),'PNG');assert.equal(png.readUInt32BE(16),1774);assert.equal(png.readUInt32BE(20),887);assert.equal(png[25],6);
 const background=readFileSync(new URL('./assets/mountain-trail.png',import.meta.url));assert.ok(background.length>1000);
 assert.ok(SPRITE_FRAMES.flat().every(index=>Number.isInteger(index)&&index>=0&&index<12));
});
test('two of three daily tasks selects running at 67 percent with a faster cadence',()=>{
 const day='2026-10-27',tasks=Array.from({length:3},()=>task({scheduled:day}));complete(tasks[0]);complete(tasks[1]);
 const p=progress(tasks,day);assert.equal(Math.round(p.percent),67);assert.deepEqual(SPRITE_FRAMES[p.stage],[8,9,10,11]);
 assert.match(scene(p),/--cadence:.32s/);assert.match(runner(3),/--cadence:.24s/);
});
test('idle and reduced motion are static while walking and running have animation frames',()=>{
 assert.doesNotMatch(runner(0),/runner moving/);
 for(const stage of [1,2,3]){assert.match(runner(stage),/runner moving/);assert.equal((runner(stage).match(/class="motion-frame/g)||[]).length,stage===1?2:4);const staticPose=runner(stage,0,0,1,false);assert.doesNotMatch(staticPose,/runner moving/);assert.equal((staticPose.match(/class="motion-frame/g)||[]).length,1);}
 assert.match(scene({done:1,total:1,percent:100,stage:4}),/celebrate/);assert.match(scene({done:0,total:0,percent:0,stage:0}),/0 de 0 tareas completadas, 0 por ciento/);
});

test('running uses a separate four-frame sheet with transparency',()=>{
 const png=readFileSync(new URL('./assets/hiker-run-cycle.png',import.meta.url));assert.equal(png.readUInt32BE(16),1254);assert.equal(png.readUInt32BE(20),1254);assert.equal(png[25],6);
 for(const stage of [2,3]){assert.equal(new Set(SPRITE_FRAMES[stage]).size,4);assert.match(runner(stage),/hiker-run-cycle.png/);}
});