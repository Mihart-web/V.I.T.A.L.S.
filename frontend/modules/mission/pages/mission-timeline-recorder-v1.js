/* V.I.T.A.L.S. timeline recorder v1. Read-only toward other application stores.
   Writes only vitals.mission.timeline.*; no fabricated physiological readings. */
(()=>{'use strict';
const STORAGE='vitals.mission.timeline.history.v1';
const CURRENT='vitals.mission.timeline.current.v1';
const ENDINGS='vitals.mission.timeline.archivedEndings.v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){console.warn('Timeline storage unavailable',e);return false}};
const nowISO=()=>new Date().toISOString();
const validDate=s=>Number.isFinite(Date.parse(s||''));
const clock=(run)=>Math.max(0,Number(run.accumulatedMs)||0)+(run.phase==='RUNNING'&&validDate(run.startedAt)?Math.max(0,Date.now()-Date.parse(run.startedAt)):0);
const profileCrew=m=>{
  const keys=['vitals.mission.crew.v1.'+String(m.destination||'').toLowerCase(),'vitals.mission.crew.v1'];
  for(const k of keys){const v=read(k);if(v&&Array.isArray(v.members)&&String(v.destination||'').toLowerCase()===String(m.destination||'').toLowerCase()&&String(v.missionName||'')===String(m.name||'')&&(!v.missionId||String(v.missionId)===String(m.id)))return v.members.length;}
  return null;
};
function countAlerts(m){
 const e=read('vitals.alerts.engineEvents.v1.'+encodeURIComponent(m.id));
 const v=read('vitals.mission.visualDemoEvents.v2.'+encodeURIComponent(m.id));
 return {engine:e&&e.missionId===m.id&&Array.isArray(e.events)?e.events.length:0,visual:Array.isArray(v)?v.filter(x=>x&&x.missionId===m.id&&x.provenance==='visual_demo_only').length:0};
}
function observe(){
 const mission=read('vitals.mission.active.v1');if(!mission?.id)return;
 const run=read('vitals.mission.runState.v1.'+encodeURIComponent(mission.id));
 if(!run||run.missionId!==mission.id||!['RUNNING','PAUSED','ENDED'].includes(run.phase))return;
 const endings=read(ENDINGS)||{};
 const endSignature=run.phase==='ENDED'?String(run.updatedAt||'no-date')+'|'+String(run.accumulatedMs||0):'';
 if(run.phase==='ENDED'&&endings[mission.id]===endSignature)return;
 const all=read(CURRENT)||{};let s=all[mission.id];
 // Every new RUNNING state following an ENDED state gets a distinct session ID.
 if(!s||s.phase==='ENDED'&&run.phase==='RUNNING'){
   s={id:'session-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),missionId:mission.id,missionName:String(mission.name||mission.id),destination:String(mission.destination||'UNKNOWN'),startedAt:validDate(run.startedAt)?run.startedAt:validDate(run.updatedAt)?run.updatedAt:nowISO(),capturedAt:nowISO(),events:[],phase:null,elapsedMs:0};
 }
 const changed=s.phase!==run.phase;
 s.missionName=String(mission.name||mission.id);s.destination=String(mission.destination||'UNKNOWN');
 s.plannedDurationDays=Number.isFinite(Number(mission.durationDays))?Number(mission.durationDays):null;
 s.crewCount=profileCrew(mission);s.elapsedMs=clock(run);s.lastSeenAt=nowISO();
 s.alerts=countAlerts(mission);
 if(changed){
   const descriptions={RUNNING:s.phase==='PAUSED'?'SIMULATION RESUMED':'SIMULATION RUNNING',PAUSED:'SIMULATION PAUSED',ENDED:'SIMULATION ENDED'};
   s.events.push({at:validDate(run.updatedAt)?run.updatedAt:nowISO(),elapsedMs:s.elapsedMs,label:descriptions[run.phase],source:'mission_run_state'});
   s.events=s.events.slice(-200);
 }
 s.phase=run.phase;
 if(run.phase==='ENDED'){
   s.endedAt=validDate(run.updatedAt)?run.updatedAt:nowISO();
   const history=Array.isArray(read(STORAGE))?read(STORAGE):[];
   const i=history.findIndex(x=>x.id===s.id);
   if(i<0)history.unshift(s);else history[i]=s;
   if(write(STORAGE,history)){delete all[mission.id];endings[mission.id]=endSignature;write(ENDINGS,endings)}
 }else all[mission.id]=s;
 write(CURRENT,all);
}
window.VitalsMissionTimeline={observe};
for(const id of ['begin','pause','resume','end']){
 const b=document.getElementById(id);if(b)b.addEventListener('click',()=>setTimeout(observe,80));
}
window.addEventListener('pageshow',observe);
window.addEventListener('storage',e=>{if(e.key?.startsWith('vitals.mission.'))observe()});
window.addEventListener('beforeunload',observe);
observe();setInterval(observe,1500);
})();
