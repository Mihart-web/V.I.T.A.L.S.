/* V.I.T.A.L.S. Data Integration Layer V1.
   Read-only adapters for synthetic / self-reported sources. Not clinical triage.
   No data writing outside the existing Alert Engine event store. */
(()=>{'use strict';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const str=v=>String(v??'').trim();
const array=v=>Array.isArray(v)?v:[];
const finite=v=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const time=v=>{const d=Date.parse(v||'');return Number.isFinite(d)?d:0};
const iso=v=>new Date(v).toISOString();
const catalogs=[
 {name:'Wearable',key:'vitals.devices.wrist.observations.v5',kind:'wrist'},
 {name:'BioLoad',key:'vitals.devices.bioload.observations.v6',kind:'bio'},
 {name:'Digital Twin V9',key:'vitals.digitalTwin.missionSimulation.v9',kind:'twin'},
 {name:'Focus',key:'vitals.focus.sessions.v1',kind:'focus'},
 {name:'Working memory',key:'vitals.cognitive.working-memory.sessions.v1',kind:'memory'},
 {name:'Reaction time',key:'vitals.cognitive.reaction.sessions.v1',kind:'reaction'},
 {name:'Wellbeing',key:'vitals.cognitive.wellbeing.sessions.v1',kind:'wellbeing'}
];
const categories={
 heart_rate:{label:'Heart rate',unit:'bpm',low:50,high:120,below:'ALR-002',above:'ALR-001'},
 spo2:{label:'Oxygen saturation',unit:'%',low:94,below:'ALR-011'},
 respiratory_rate:{label:'Respiratory rate',unit:'/min',low:10,high:24,below:'ALR-013',above:'ALR-012'},
 activation:{label:'Muscle activation',unit:'a.u.',low:20,below:'ALR-021'},
 asymmetry:{label:'Left / right muscle difference',unit:'%',high:14,above:'ALR-023'},
 motion:{label:'Motion activity',unit:'a.u.',low:12,below:'ALR-024'}
};
function collection(key){return array(read(key))}
function scan(missionId,crewIds,ruleMap){
 const allow=new Set(array(crewIds).map(str).filter(Boolean));
 const now=Date.now(),recent=30*24*3600000,entries=[],observations=[];
 const stats=[];
 const allowed=(row,requireMission=true)=>row&&typeof row==='object'&&allow.has(str(row.astronautId))&&(!requireMission||str(row.missionId)===str(missionId));
 const relevant=(row,field='timestamp')=>{const t=time(row?.[field]);return !!t&&t<=now+300000&&now-t<recent};
 const push=(row,source,metric,value,ruleId,direction,bound,unit)=>{
   const rule=ruleMap.get(ruleId);if(!rule)return;
   const ts=str(row.timestamp||row.recordedAt||row.finished_at||row.endTime);
   const comparison=direction==='above'?'>':'<';
   const threshold=`ILLUSTRATIVE TRAINING ONLY: ${metric} ${comparison} ${bound} ${unit}. Not a NASA or clinical alarm limit.`;
   const astronautId=str(row.astronautId);
   const metricKey=str(source)+':'+astronautId+':'+str(row.muscleRegion||'')+':'+str(metric)+':'+direction;
   entries.push({ruleId:rule.id,category:rule.category,level:rule.level,title:rule.name,
      message:`${metric}: ${Number(value).toFixed(1)} ${unit} (${comparison} demo limit ${bound} ${unit}). Recorded ${ts}. Synthetic observation; verify the simulator context.`,
      source:source,sourceKey:'DIL1:'+str(missionId)+':'+metricKey,provenance:'SYNTHETIC / NOT CLINICAL',astronautId,threshold,action:'Inspect the underlying simulated observation and verify training context. No diagnosis or clinical decision is inferred.',sampleTimestamp:ts,
      integration:'vitals.integration.v1'});
 };
 const wrist=collection('vitals.devices.wrist.observations.v5').filter(x=>allowed(x)&&x.provenance==='synthetic_training'&&x.clinicalUse===false&&relevant(x));
 const wristLatest=new Map();for(const r of wrist){if(!categories[r.metric])continue;const k=r.astronautId+'::'+r.metric;if(!wristLatest.has(k)||time(wristLatest.get(k).timestamp)<time(r.timestamp))wristLatest.set(k,r)}
 for(const r of wristLatest.values()){
  observations.push({source:'Wearable',astronautId:r.astronautId,metric:r.metric,value:finite(r.value),timestamp:r.timestamp,provenance:'synthetic_training'});
  const c=categories[r.metric],v=finite(r.value);if(v===null)continue;
  if(c.low!==undefined&&v<c.low&&c.below)push(r,'Wearable',c.label,v,c.below,'below',c.low,c.unit);
  else if(c.high!==undefined&&v>c.high&&c.above)push(r,'Wearable',c.label,v,c.above,'above',c.high,c.unit);
 }
 stats.push({name:'Wearable',samples:wrist.length,latest:Math.max(0,...wrist.map(x=>time(x.timestamp)))});
 const bio=collection('vitals.devices.bioload.observations.v6').filter(x=>allowed(x)&&x.schema==='vitals.devices.bioload.observation.v6'&&x.provenance==='synthetic_training'&&x.clinicalUse===false&&relevant(x));
 const bioLatest=new Map();for(const r of bio){const k=r.astronautId+'::'+str(r.muscleRegion);if(!bioLatest.has(k)||time(bioLatest.get(k).timestamp)<time(r.timestamp))bioLatest.set(k,r)}
 for(const r of bioLatest.values())for(const metric of ['activation','asymmetry','motion']){
  const v=finite(r[metric]);if(v===null)continue;const c=categories[metric];observations.push({source:'BioLoad',astronautId:r.astronautId,metric,region:r.muscleRegion,value:v,timestamp:r.timestamp,provenance:'synthetic_training'});
  if(c.low!==undefined&&v<c.low&&c.below)push(r,'BioLoad / '+str(r.muscleRegion),c.label,v,c.below,'below',c.low,c.unit);
  else if(c.high!==undefined&&v>c.high&&c.above)push(r,'BioLoad / '+str(r.muscleRegion),c.label,v,c.above,'above',c.high,c.unit);
 }
 stats.push({name:'BioLoad',samples:bio.length,latest:Math.max(0,...bio.map(x=>time(x.timestamp)))});
 const twinRoot=read('vitals.digitalTwin.missionSimulation.v9')||{};let twins=[];
 for(const group of Object.values(twinRoot)){if(group?.missionId===missionId&&allow.has(str(group.astronautId)))twins.push(...array(group.samples).filter(x=>allowed(x)&&x.schema==='vitals.digitalTwin.simulatedSample.v9'&&x.classification==='synthetic_training_v9'&&x.clinicalUse===false&&relevant(x)))}
 const twinLatest=new Map();for(const r of twins){if(!twinLatest.has(r.astronautId)||time(r.timestamp)>time(twinLatest.get(r.astronautId).timestamp))twinLatest.set(r.astronautId,r)}
 for(const r of twinLatest.values())for(const [metric,field] of [['heart_rate','hr'],['spo2','spo'],['respiratory_rate','resp']]){
  const v=finite(r[field]);if(v===null)continue;const c=categories[metric];observations.push({source:'Digital Twin V9',astronautId:r.astronautId,metric,value:v,timestamp:r.timestamp,provenance:'synthetic_training_v9'});
  if(c.low!==undefined&&v<c.low&&c.below)push(r,'Digital Twin V9',c.label,v,c.below,'below',c.low,c.unit);
  else if(c.high!==undefined&&v>c.high&&c.above)push(r,'Digital Twin V9',c.label,v,c.above,'above',c.high,c.unit);
 }
 stats.push({name:'Digital Twin V9',samples:twins.length,latest:Math.max(0,...twins.map(x=>time(x.timestamp)))});
 // Cognitive records are informational input here: no unvalidated cognitive diagnosis from test scores.
 for(const [name,key,dateField] of [
  ['Focus','vitals.focus.sessions.v1','finished_at'],
  ['Working memory','vitals.cognitive.working-memory.sessions.v1','endTime'],
  ['Reaction time','vitals.cognitive.reaction.sessions.v1','endTime'],
  ['Category match','vitals.cognitive.category-match.sessions.v1','finishedAt'],
  ['Cognitive flexibility','vitals.cognitive.flexibility.sessions.v1','endTime']]){
  const records=collection(key).filter(x=>allowed(x,false)&&relevant(x,dateField));
  stats.push({name,samples:records.length,latest:Math.max(0,...records.map(x=>time(x[dateField])))});
 }
 const checks=collection('vitals.cognitive.wellbeing.sessions.v1').filter(x=>allowed(x,false)&&x.schema==='vitals.psychological-wellbeing.checkin.v1'&&x.experimental===true&&relevant(x,'recordedAt'));
 const latestWell=new Map();for(const r of checks){if(!latestWell.has(r.astronautId)||time(latestWell.get(r.astronautId).recordedAt)<time(r.recordedAt))latestWell.set(r.astronautId,r)}
 for(const r of latestWell.values()){
   const stress=finite(r.ratings?.stress);
   observations.push({source:'Wellbeing self-report',astronautId:r.astronautId,metric:'perceived_stress',value:stress,timestamp:r.recordedAt,provenance:'experimental_self_report'});
   // Self-report is never automatically declared critical. Only an illustrative human review is requested.
   if(stress!==null&&stress>=8){const rule=ruleMap.get('ALR-034');if(rule)entries.push({ruleId:rule.id,category:rule.category,level:'yellow',title:'Elevated perceived stress — self-report review',message:`Experimental self-report: perceived stress ${stress}/10 on ${r.recordedAt}. Not a clinical stress measurement.`,source:'Psychological Wellbeing · voluntary check-in',sourceKey:'DIL1:'+missionId+':wellbeing:'+r.astronautId+':stress',provenance:'EXPERIMENTAL SELF-REPORT',astronautId:r.astronautId,threshold:'Illustrative review condition: self-reported perceived stress >= 8/10. Not diagnostic or validated for flight.',action:'Offer optional human wellbeing support and review context; do not infer a medical emergency.',sampleTimestamp:r.recordedAt,integration:'vitals.integration.v1'});}
 }
 stats.push({name:'Wellbeing',samples:checks.length,latest:Math.max(0,...checks.map(x=>time(x.recordedAt)))});
 return {entries,observations,stats};
}
window.VITALS_DataIntegrationV1=Object.freeze({scan});
})();
