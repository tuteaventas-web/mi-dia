import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountDataKey,createRegistry,ensureRegistry,makeAccount,verifyAccount,validateRegistry} from './accounts.js';

test('default administrator uses PIN 1608 and datasets are separated',async()=>{
  const registry=await createRegistry('2026-10-27T00:00:00.000Z');
  assert.equal((await verifyAccount(registry,'admin','1608')).name,'Administrador');
  assert.equal(await verifyAccount(registry,'admin','1609'),null);
  assert.notEqual(accountDataKey('admin'),accountDataKey('ada'));
});

test('legacy data migrates once to administrator without changing content',async()=>{
  const map=new Map([['mi-jornada-v1','{"version":1,"tasks":[{"id":"x"}],"projects":[]}']]);
  const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
  await ensureRegistry(storage);
  assert.equal(map.has('mi-jornada-v1'),false);
  assert.match(map.get(accountDataKey('admin')),/"id":"x"/);
});

test('advisor accounts require name and four digit PIN',async()=>{
  const account=await makeAccount({id:'ada',name:'  Ada  López ',pin:'1234',now:'2026-10-27T00:00:00.000Z'});
  assert.equal(account.name,'Ada López');
  assert.equal((await verifyAccount({accounts:[account]},'ada','1234')).id,'ada');
  await assert.rejects(()=>makeAccount({id:'x',name:'X',pin:'12'}),/4 dígitos/);
  assert.equal(validateRegistry({version:1,accounts:[{...(await createRegistry()).accounts[0]}]}).version,1);
});
