export const ACCOUNTS_KEY='mi-jornada-accounts-v1';
export const SESSION_KEY='mi-jornada-session-v1';
export const LEGACY_DATA_KEY='mi-jornada-v1';

export const accountDataKey=id=>`${LEGACY_DATA_KEY}:account:${id}`;
export const normalizeName=value=>String(value??'').trim().replace(/\s+/g,' ');
export const validPin=pin=>/^\d{4}$/.test(String(pin));

export async function hashPin(pin){
  if(!validPin(pin))throw Error('El PIN debe tener 4 dígitos.');
  const bytes=new TextEncoder().encode(`mi-jornada-local:${pin}`);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}

export async function createRegistry(now=new Date().toISOString()){
  return {version:1,accounts:[{id:'admin',name:'Administrador',role:'admin',pinHash:await hashPin('1608'),order:0,created:now,updated:now}]};
}

export function validateRegistry(value){
  if(!value||value.version!==1||!Array.isArray(value.accounts)||!value.accounts.length)throw Error('El registro de cuentas no es válido.');
  const ids=new Set();let admins=0;
  value.accounts.forEach((a,index)=>{
    if(!a||!/^[-_a-zA-Z0-9]+$/.test(a.id)||ids.has(a.id))throw Error('Hay una cuenta inválida o repetida.');
    if(!normalizeName(a.name)||!['admin','user'].includes(a.role)||!/^[a-f0-9]{64}$/.test(a.pinHash))throw Error('Los datos de una cuenta no son válidos.');
    if(a.role==='admin')admins++;
    ids.add(a.id);a.order=Number.isFinite(a.order)?a.order:index;
  });
  if(admins!==1)throw Error('Debe existir una sola cuenta administradora.');
  return value;
}

export async function ensureRegistry(storage){
  const raw=storage.getItem(ACCOUNTS_KEY);
  const registry=raw?validateRegistry(JSON.parse(raw)):await createRegistry();
  if(!raw)storage.setItem(ACCOUNTS_KEY,JSON.stringify(registry));
  const legacy=storage.getItem(LEGACY_DATA_KEY),adminKey=accountDataKey('admin');
  if(legacy&&!storage.getItem(adminKey))storage.setItem(adminKey,legacy);
  if(legacy)storage.removeItem(LEGACY_DATA_KEY);
  return registry;
}

export async function verifyAccount(registry,id,pin){
  const account=registry.accounts.find(a=>a.id===id);
  return account&&validPin(pin)&&account.pinHash===await hashPin(pin)?account:null;
}

export async function makeAccount({id,name,pin,now=new Date().toISOString()}){
  const clean=normalizeName(name);
  if(!clean)throw Error('Escribe el nombre de la cuenta.');
  if(!/^[-_a-zA-Z0-9]+$/.test(id))throw Error('El identificador de la cuenta no es válido.');
  return {id,name:clean,role:'user',pinHash:await hashPin(pin),order:0,created:now,updated:now};
}
