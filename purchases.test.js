import {test} from 'node:test';
import assert from 'node:assert/strict';
import {purchaseExcelReport} from './purchases.js';

test('purchase report is tab separated for direct Excel paste',()=>{
 const blocks=[{id:'b1',date:'2026-10-28'}];
 const items=[{blockId:'b1',status:'bought',name:'Chocman',real:'3.70',realDate:'2026-10-28'},{blockId:'b1',status:'planned',name:'Pendiente',real:''}];
 const report=purchaseExcelReport(blocks,items,'10.00','2026-10-28','2026-10-28');
 assert.match(report.text,/Productos\tP\. Unit\.\tCant\.\tP\. Total/);
 assert.match(report.text,/Chocman\t3,70\t1\t3,70/);
 assert.match(report.text,/VUELTO\t\t\t6,30/);
 assert.doesNotMatch(report.text,/S\/\./);
 assert.doesNotMatch(report.text,/Pendiente/);
});
test('optional fare belongs to its block and changes the reported balance',()=>{
 const blocks=[{id:'b1',date:'2026-11-14',fareEnabled:true,fare:'5.50'},{id:'b2',date:'2026-11-15',fareEnabled:false,fare:'8.00'}];
 const report=purchaseExcelReport(blocks,[], '10.00');
 assert.match(report.text,/Pasaje \(2026-11-14\)\t5,50\t1\t5,50/);
 assert.doesNotMatch(report.text,/2026-11-15/);
 assert.equal(report.total,5.5);
 assert.equal(report.balance,4.5);
});
