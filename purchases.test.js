import {test} from 'node:test';
import assert from 'node:assert/strict';
import {purchaseExcelReport} from './purchases.js';

test('purchase report is tab separated for direct Excel paste',()=>{
 const blocks=[{id:'b1',date:'2026-10-28'}];
 const items=[{blockId:'b1',status:'bought',name:'Chocman',real:'3.70',realDate:'2026-10-28'},{blockId:'b1',status:'planned',name:'Pendiente',real:''}];
 const report=purchaseExcelReport(blocks,items,'10.00','2026-10-28','2026-10-28');
 assert.match(report.text,/Productos\tP\. Unit\. \(S\/\.\)\tCant\.\tP\. Total \(S\/\.\)/);
 assert.match(report.text,/Chocman\t3,70\t1\t3,70/);
 assert.match(report.text,/VUELTO \(S\/\.\)\t\t\t6,30/);
 assert.doesNotMatch(report.text,/Pendiente/);
});
