/* Aither Cloud Sync — Firebase-backed through AitherBackendNew. */
(()=>{
'use strict';
const APP_ID='notes',API='https://aitherbackendnew.onrender.com',BLOCKED=/(password|token|secret|api[_-]?key|client[_-]?secret|authorization|session)/i;
const snapshot=()=>{const d={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&!BLOCKED.test(k))d[k]=localStorage.getItem(k)}return d};
const restore=d=>{if(!d||typeof d!=='object')return;Object.entries(d).forEach(([k,v])=>{if(!BLOCKED.test(k)&&typeof v==='string')try{localStorage.setItem(k,v)}catch(_){}})};
const token=()=>String(localStorage.getItem('aither-session-token')||localStorage.getItem('aither_session_token')||'').trim();
async function request(path,options={}){const c=new AbortController(),timer=setTimeout(()=>c.abort(),10000);try{const headers={Accept:'application/json','Content-Type':'application/json',...(options.headers||{})};const t=token();if(t)headers.Authorization=`Bearer ${t}`;const r=await fetch(API+path,{...options,credentials:'include',headers,cache:'no-store',signal:c.signal});let data={};try{data=await r.json()}catch{}if(!r.ok)throw Error(`HTTP ${r.status}`);return data}finally{clearTimeout(timer)}}
let last='';
async function sync(){try{const session=await request('/api/auth/session');if(!session.authenticated)return;const cloud=await request('/api/data/'+APP_ID),local=snapshot();if(cloud.updated_at&&cloud.updated_at!==last&&cloud.data&&Object.keys(cloud.data).length){restore(cloud.data);last=cloud.updated_at;return}await request('/api/data/'+APP_ID,{method:'PUT',body:JSON.stringify({data:local})});last=Date.now().toString()}catch(error){console.warn('[Aither Cloud] Sync skipped:',error?.message||error)}}
window.AitherCloud={sync,snapshot};
setTimeout(sync,250);setInterval(sync,15000);addEventListener('aither:user-changed',sync);addEventListener('storage',sync);
})();
