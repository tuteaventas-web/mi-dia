export const CLOUD_URL='https://mi-dia-sync.divinegecko33.chatgpt.site/api/cloud';
export const CLOUD_TOKEN='mi-dia-cloud-token-v1';
async function call(path='',options={}){const r=await fetch(CLOUD_URL+path,options);const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.error||'No se pudo conectar con la sincronización.');return body;}
export const cloudAccounts=()=>call('?action=accounts');
export const cloudLogin=(id,pinHash)=>call('',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'login',id,pinHash})});
const auth=token=>({'content-type':'application/json','authorization':`Bearer ${token}`});
export const cloudData=token=>call('',{headers:auth(token)});
export const cloudSave=(token,data)=>call('',{method:'PUT',headers:auth(token),body:JSON.stringify({data})});
export const cloudMigrate=(token,registry,datasets)=>call('',{method:'POST',headers:auth(token),body:JSON.stringify({action:'migrate',registry,datasets})});
export const cloudUpsert=(token,account)=>call('',{method:'POST',headers:auth(token),body:JSON.stringify({action:'account',account})});
export const cloudDelete=(token,id)=>call(`?id=${encodeURIComponent(id)}`,{method:'DELETE',headers:auth(token)});
