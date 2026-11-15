/* V.I.T.A.L.S. Digital Twin V2 - secondary, read-only evidence + demo attention layer.
   Uses existing sources, NEVER makes clinical predictions or changes source records.
   Color priority is an educational review classification, not diagnosis or readiness.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id), model=$('humanModel');if(!$('dtv2Bars')||!model)return;
const K={mission:'vitals.mission.active.v1',roster:'vitals.mission.crew.v1',profile:'vitals.astronauts.v1',wrist:'vitals.devices.wrist.observations.v5',bio:'vitals.devices.bioload.observations.v6',baseline:'vitals.medical.musculoskeletal.trainingBaseline.v1',exposure:'vitals.medical.environment.dailyExposure.v2'};
const read=(key,otherwise)=>{try{const s=localStorage.getItem(key);return s===null?otherwise:JSON.parse(s)}catch{return otherwise}};
const rows=(v)=>Array.isArray(v)?v:[],n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null),fmt=(v,d=1)=>n(v)===null?'—':Number(v).toFixed(d);
const clean=x=>String(x??'').replace(/[&<>"']/g,z=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[z]));
const mId=()=>String(read(K.mission,{})?.id||'');const aId=()=>String($('astronaut')?.value||'');
const dests=['earth','moon','mars','europa','titan'];
const meta={earth:{name:'Earth',hero:'Earth-hero.png',file:'earth-reference.json'},moon:{name:'Moon',hero:'Moon-hero.png',file:'moon-reference.json'},mars:{name:'Mars',hero:'Mars-hero.png',file:'mars-reference.json'},europa:{name:'Europa',hero:'Europa-hero.png',file:'europa-reference.json'},titan:{name:'Titan',hero:'Titan-hero.png',file:'titan-reference.json'}};
const destination=()=>{const m=read(K.mission,null),x=String(m?.destination||'').toLowerCase().replace(/-remote$/,'');return dests.includes(x)?x:null};
const preview=()=>destination()||$('dtv2Destination')?.value||'earth';
const statusText={green:'NO DEMO FLAGS',blue:'REVIEW',yellow:'CAUTION',red:'HIGH DEMO PRIORITY',unknown:'NO DATA'};
const rank={unknown:-1,green:0,blue:1,yellow:2,red:3};
let lastEnv='',snapshots=[],lastSavedAt=0,seenAvatar=false;
function metricRecord(data,key){return data.filter(r=>r?.metric===key&&n(r.value)!==null).at(-1)||null}
function evidence(){const id=aId(),mid=mId(),w=rows(read(K.wrist,[])).filter(r=>r?.astronautId===id&&r?.missionId===mid&&r?.provenance==='synthetic_training'&&r.clinicalUse===false).sort((a,b)=>Date.parse(a.timestamp||0)-Date.parse(b.timestamp||0));
const b=rows(read(K.bio,[])).filter(r=>r?.astronautId===id&&r?.missionId===mid&&r?.provenance==='synthetic_training'&&r.clinicalUse===false).sort((a,b)=>Date.parse(a.timestamp||0)-Date.parse(b.timestamp||0));
const allProfiles=read(K.profile,[]),list=rows(Array.isArray(allProfiles)?allProfiles:allProfiles?.profiles||allProfiles?.astronauts);const profile=list.find(p=>String(p?.id||p?.astronautId||'')===id);
const bstore=read(K.baseline,{});const baseline=bstore?.[mid+'::'+id]||null;
const latest=Object.fromEntries(['heart_rate','spo2','respiratory_rate','skin_temperature','stress_index'].map(k=>[k,metricRecord(w,k)]));
const taskBoxes=[['Focus','vitals.focus.sessions.v1','finished_at',r=>r?.summary?.accuracy_percent],['Memory','vitals.cognitive.working-memory.sessions.v1','endTime',r=>r?.accuracyPercent],['Category Match','vitals.cognitive.category-match.sessions.v1','finishedAt',r=>r?.f1Percent],['Flexibility','vitals.cognitive.flexibility.sessions.v1','completed_at',r=>r?.accuracy_percent],['Reaction','vitals.cognitive.reaction.sessions.v1','ended_at',r=>r?.accuracy_percent]];
const cognitive=taskBoxes.map(([name,key,ts,fn])=>{const r=rows(read(key,[])).filter(x=>x?.astronautId===id&&n(fn(x))!==null).sort((a,b)=>Date.parse(a[ts]||a.timestamp||0)-Date.parse(b[ts]||b.timestamp||0));return {name,value:r.length?n(fn(r.at(-1))):null,count:r.length}});
const checkins=rows(read('vitals.cognitive.twin.events.v1',[])).filter(r=>r?.astronautId===id&&r?.eventType==='wellbeing-checkin');
const exposures=rows(read(K.exposure,[])); // V2 simulation artifact may live in memory, not persisted; do not infer missing dosimetry.
return{id,mid,w,b,profile,baseline,latest,cognitive,checkins,exposures};}
function evaluate(e){const domains=[];const domain=(key,label,color,why,source,score)=>domains.push({key,label,color,why,source,score});
// Only flagged numerical observations; no heartbeat or cognitive 'fitness' without individualized validation.
const hr=n(e.latest.heart_rate?.value),spo=n(e.latest.spo2?.value),resp=n(e.latest.respiratory_rate?.value);
const recent=r=>r&&Number.isFinite(Date.parse(r.timestamp))&&Date.now()-Date.parse(r.timestamp)<30*60*1000;
if(hr===null)domain('cardio','Cardiovascular','unknown','No attributable heart-rate sample','Wrist V5');
else if(!recent(e.latest.heart_rate))domain('cardio','Cardiovascular','blue','Stored sample older than 30 minutes','Wrist V5');
else if(hr>125||hr<45)domain('cardio','Cardiovascular','yellow',`Sample ${fmt(hr,0)} bpm outside example 45–125 bpm review band; activity not calibrated`,'Wrist V5');
else domain('cardio','Cardiovascular','green',`Recent synthetic HR ${fmt(hr,0)} bpm; no example threshold crossed`,'Wrist V5');
if(spo===null&&resp===null)domain('resp','Respiratory','unknown','No attributable respiratory or oxygen readings','Wrist V5');
else if(spo!==null&&recent(e.latest.spo2)&&spo<90)domain('resp','Respiratory','red',`Synthetic SpO₂ ${fmt(spo)}% below illustrative demo 90% boundary; needs human review`,'Wrist V5');
else if(spo!==null&&recent(e.latest.spo2)&&spo<95)domain('resp','Respiratory','yellow',`Synthetic SpO₂ ${fmt(spo)}% below illustrative 95% boundary`,'Wrist V5');
else if((spo!==null&&!recent(e.latest.spo2))||(resp!==null&&!recent(e.latest.respiratory_rate)))domain('resp','Respiratory','blue','At least one respiratory/oxygen sample is not recent','Wrist V5');
else domain('resp','Respiratory','green','Recent respiratory/oxygen observation; no example flag triggered','Wrist V5');
const bio=e.b.at(-1),asym=n(bio?.asymmetry),act=n(bio?.activation),base=e.baseline?.strength;
if(!bio&&!e.baseline)domain('muscle','Musculoskeletal','unknown','No BioLoad samples or manual training baseline','BioLoad / Musculoskeletal');
else if(bio&&asym!==null&&asym>=12)domain('muscle','Musculoskeletal','yellow',`Illustrative asymmetry ${fmt(asym)}% at ${bio.muscleRegion||'region'} (12% demonstration rule)`,'BioLoad V6');
else if(bio)domain('muscle','Musculoskeletal','green',`BioLoad ${bio.muscleRegion||'region'}; activation ${fmt(act)} a.u., asymmetry ${fmt(asym)}% (synthetic)`,'BioLoad V6');
else domain('muscle','Musculoskeletal','blue',`Only manual synthetic strength reference ${fmt(base)}; no current BioLoad observations`,'Musculoskeletal V1');
const ct=e.cognitive.filter(x=>x.value!==null);
if(!ct.length)domain('cognitive','Cognitive & behavioral','unknown','No completed attributable cognitive task','Cognitive games');
else if(ct.some(x=>x.value<50))domain('cognitive','Cognitive & behavioral','yellow',`One recorded task performance below 50% (illustrative game-review boundary, not impairment)`,'Cognitive games');
else domain('cognitive','Cognitive & behavioral','green',`${ct.length} task score(s) available; test accuracy is NOT cognitive health`,'Cognitive games');
// Environmental destination gravity/pressure is reference only; not astronaut exposure.
// No clinical history condition diagnosis from arbitrary profile data.
const haveEnvironment=!!destination();domain('environment','Environment / radiation',haveEnvironment?'blue':'unknown',haveEnvironment?'Mission planetary reference exists, but no attributable dose or EVA environment sensor reading is verified':'No mission destination or validated exposure observation','Mission / Environment');
const metrics=e.profile?.metrics||{};const measurements=Object.entries(metrics).filter(([k,v])=>n(v)!==null).length;
domain('clinical','Clinical reference',measurements?'blue':'unknown',measurements?`${measurements} synthetic profile metric(s) present; medical history is context, not an automatic risk multiplier`:'No numeric attributable clinical reference found','Astronaut profile');
const observed=domains.filter(d=>d.color!=='unknown');const worst=observed.reduce((a,b)=>rank[b.color]>rank[a.color]?b:a,{color:'unknown'}).color;
// review index = mean of observed demonstrative rule levels, NOT health index, dynamic coverage is explicit.
const reviewValue=observed.length?Math.round(observed.reduce((s,d)=>s+({green:0,blue:25,yellow:60,red:90}[d.color]||0),0)/observed.length):null;
return {domains,worst,reviewValue,coverage:Math.round(observed.length/domains.length*100),observed:observed.length};}
function bars(result){$('dtv2Bars').innerHTML=result.domains.map(d=>{const num=rank[d.color]<0?0:d.color==='green'?12:d.color==='blue'?5:d.color==='yellow'?8:12;return `<div class="dtv2-bar"><div class="dtv2-barhead"><span>${clean(d.label)}</span><strong>${clean(statusText[d.color])}</strong></div><div class="dtv2-segments">${Array.from({length:12},(_,i)=>`<i class="${i<num?d.color:''}"></i>`).join('')}</div><div class="dtv2-barreason">${clean(d.why)}</div></div>`}).join('');
const tag=$('dtv2Level');tag.className=result.worst;tag.textContent=result.worst==='unknown'?'NOT ASSESSED':statusText[result.worst];$('dtv2Reason').textContent=`${result.observed}/${result.domains.length} domains with at least one demonstration signal. ${result.reviewValue===null?'No review index: no evidence.':`Illustrative attention index ${result.reviewValue}/100 across available domains only.`} NOT a health probability, diagnosis or flight-readiness score.`;
$('dtv2Method').textContent='Rule weights for observed domains: no demo flag = 0 attention points; blue review = 25; yellow caution = 60; red demo priority = 90. Unknown domains are EXCLUDED, never counted healthy. The mean review index is illustrative, while the displayed priority is the highest available flag. These are arbitrary software demonstration rules, NOT calibrated NASA clinical thresholds. Planetary environmental references are never converted directly into individual risk. No autonomous treatment is authorized.';}
function hotspots(result){const points=[...model.querySelectorAll('.dtv2-point')];for(const b of points)b.remove();const relevant=result.domains.filter(d=>['red','yellow','blue'].includes(d.color));if(!relevant.length)return;
// 3D model-viewer slots track the rotating model. Positions are schematic proxies, not tissue localization.
let dim={x:1,y:2,z:.4},center={x:0,y:0,z:0};try{dim=model.getDimensions?.()||dim;center=model.getBoundingBoxCenter?.()||center}catch{}
const where={cardio:[0.10,.19,.14],resp:[-.12,.18,.15],muscle:[.19,-.24,.10],cognitive:[0,.38,.08],clinical:[-.22,-.05,.12],environment:[.24,.02,.1]};
for(const d of relevant){const [x,y,z]=where[d.key]||[0,0,0],b=document.createElement('button');b.type='button';b.className=`dtv2-point ${d.color}`;b.slot='hotspot-'+d.key;b.dataset.position=`${center.x+x*dim.x}m ${center.y+y*dim.y}m ${center.z+z*dim.z}m`;b.dataset.normal='0m 0m 1m';b.title=d.label+': '+d.why;b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>{const tip=$('dtv2Message');tip.textContent=`${d.label}: ${d.why}. Source: ${d.source}. Demo review only.`;tip.hidden=false});model.append(b)}
model.updateHotspot?.();}
/* Read-only adapter for the five *actual* Mission reference file schemas.
   Planetary references never become astronaut-specific exposure measurements. */
function formatUnit(unit){const units={'m/s2':'m/s²','m/s^2':'m/s²','degC':'°C','degree_C':'°C','microGy/day':'µGy/day'};return units[String(unit||'')]||unit||''}
function showValue(value,unit){if(value===null||value===undefined||value==='')return null;return `${typeof value==='number'&&value>0&&formatUnit(unit)==='°C'?'+':''}${value}${formatUnit(unit)?' '+formatUnit(unit):''}`}
function refRows(data,key){
  const result=[];const add=(label,value,source,note)=>{if(value!==null&&value!==undefined&&value!=='')result.push({label,value:String(value),source:source||null,note:note||''})};
  if(key==='moon'){
    const p=data.indicators||{},g=p.gravity,s=p.sunlitTemperature,d=p.darkTemperature,a=p.atmosphere,r=p.radiation;
    add('Gravity',showValue(g?.value,g?.unit),g?.source,g?.kind);
    add('Surface temperature',`Sunlit ${showValue(s?.value,s?.unit)||'not provided'} / dark ${showValue(d?.value,d?.unit)||'not provided'}`,s?.source||d?.source,'Illustrative extremes, not current local temperature');
    add('Surface pressure','Extremely tenuous exosphere; no reliable numeric surface-pressure reference in file',a?.source,'Not a habitable atmosphere');
    add('Atmosphere',a?.value,a?.source);
    add('Radiation reference',r?.hazards?.length?r.hazards.join(', ').replace(/_/g,' '):'Qualitative hazard; no astronaut dose in reference',r?.source,r?.note);
  }else if(key==='mars'){
    const p=data.parameters||{};
    for(const [label,k] of [['Gravity','gravity'],['Surface temperature','surfaceTemperature'],['Surface pressure','surfacePressure'],['Atmosphere','atmosphere']]){const x=p[k];add(label,showValue(x?.value,x?.unit==='text'?'':x?.unit),x?.source,x?.note||x?.statistic)}
    const r=p.surfaceAbsorbedRadiationDoseRate;add('Radiation reference',showValue(r?.value,r?.unit),r?.source,r?.note||'Historical rover measurement, not crew exposure');
  }else if(key==='europa'){
    const g=data.gravity,t=data.surfaceTemperature,a=data.atmosphere,r=data.radiation;
    add('Gravity',showValue(g?.value,g?.unit),g?.source,g?.basis);
    const temp=t&&t.minimumC!==undefined&&t.maximumC!==undefined?`${t.minimumC} to ${t.maximumC} °C`:null;
    add('Surface temperature',temp,t?.source,t?.meaning);
    add('Surface pressure','Extremely tenuous exosphere; no numeric pressure reference in file',a?.source,'Not a breathable atmosphere');
    add('Atmosphere',a?.type,a?.source);
    add('Radiation reference',r?.qualitative,r?.source,'Qualitative radiation environment, NOT personal dose');
  }else if(key==='titan'){
    const ms=Array.isArray(data.measurements)?data.measurements:[];
    const find=id=>ms.find(x=>x?.id===id);
    for(const [label,k] of [['Gravity','gravity'],['Surface temperature','surface_temperature'],['Surface pressure','surface_pressure']]){const x=find(k);add(label,showValue(x?.value,x?.unit),x?.source,x?.type)}
    const a=find('atmosphere'),r=find('radiation');
    add('Atmosphere',a?.value?String(a.value).replace(/_/g,' '):null,a?.source);
    add('Radiation reference',r?.value===null?'Qualitative reference only; no numeric crew dose':showValue(r?.value,r?.unit),r?.source,'No personal radiation measurement');
  }else if(key==='earth'){
    // This particular JSON is an Earth *region scenario* catalogue, not one global atmosphere table.
    const regions=Array.isArray(data.regionData)?data.regionData:[];
    const mission=read(K.mission,{});
    const clues=[mission?.earthRegion,mission?.regionId,mission?.region,mission?.scenarioId,mission?.scenario,mission?.earthScenario,mission?.area];
    const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    const region=regions.find(r=>clues.some(c=>c&&normalize(c)===normalize(r.id)))||regions.find(r=>clues.some(c=>c&&normalize(c)===normalize(r.title)));
    if(region){
      add('Earth region scenario',region.title,null,region.desc);
      for(const fact of region.facts||[]){if(Array.isArray(fact)&&fact.length>=2)add(String(fact[0]).replace(/_/g,' '),fact[1],null,fact[2]||'')}
      add('Reference basis',region.ref,null,region.type);
    }else{
      add('Earth reference','Regional scenarios available; no region identified in active mission',null,'No global temperature, pressure or radiation value inferred from regional examples');
      add('Available scenarios',regions.map(r=>r.title).join(' · '),null,'Use Mission Configuration to select the applicable region, if supported');
    }
  }
  return result;
}
async function setEnvironment(){
  const key=preview();if(key===lastEnv)return;
  lastEnv=key;
  const m=read(K.mission,null),locked=!!destination(),metaData=meta[key];
  const select=$('dtv2Destination');select.disabled=locked;select.value=key;
  $('dtv2EnvOrigin').textContent=locked?`ACTIVE MISSION ${m?.id||''}: ${metaData.name}. Environment preview locked to mission destination; no overrides.`:'NO ACTIVE MISSION DESTINATION: preview is for visual simulation only; does not change mission configuration.';
  $('dtv2EnvironmentName').textContent=metaData.name.toUpperCase();
  const hero=$('dtv2EnvironmentHero');
  hero.style.backgroundImage='linear-gradient(0deg,rgba(1,13,20,.62),rgba(1,13,20,.18)),url("../../../../assets/Destinations/'+metaData.hero+'")';
  const cont=$('dtv2Reference');cont.textContent='Loading local mission environmental reference…';
  try{
    const response=await fetch('../../mission/pages/destinations/'+metaData.file,{cache:'no-store'});
    if(!response.ok)throw new Error('Reference not found');
    const data=await response.json();
    if(lastEnv!==key)return;
    const items=refRows(data,key);
    cont.replaceChildren();
    for(const item of items){
      const row=document.createElement('div'),left=document.createElement('span'),right=document.createElement('strong');
      left.textContent=item.label;right.textContent=item.value;
      if(item.source&&/^https:\/\//i.test(item.source)){
        const a=document.createElement('a');a.href=item.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent=' SOURCE';a.title='Original scientific reference';a.style.cssText='display:inline-block;margin-left:8px;font-size:9px;color:#79e3d0';right.appendChild(a);
      }
      if(item.note)right.title=item.note;
      row.append(left,right);cont.append(row);
    }
    if(!items.length){cont.textContent='This reference contains no compatible display values. Nothing has been inferred.';return;}
    const note=document.createElement('p');note.className='note';
    note.textContent='Scientific or historical planetary reference, NOT current local telemetry, habitat conditions, astronaut exposure or health-risk score. Inspect individual source links and notes.';
    cont.append(note);
  }catch(err){
    if(lastEnv!==key)return;
    cont.textContent='The destination reference JSON could not be loaded. Check the local Mission reference file and website server. No values were fabricated.';
  }
}
function trend(snapshot){if(!snapshot)return;const key=snapshot.mid+'::'+snapshot.id;const stored=read('vitals.digitalTwin.demoAttentionSnapshots.v2',{});const old=rows(stored[key]);const last=old.at(-1);const now=Date.now();if(now-lastSavedAt<60000)return;if(last?.value===snapshot.reviewValue&&now-Date.parse(last?.at||0)<5*60000)return;if(snapshot.reviewValue===null)return;old.push({at:new Date().toISOString(),value:snapshot.reviewValue,coverage:snapshot.coverage,priority:snapshot.worst,provenance:'synthetic_demo_attention_v2'});stored[key]=old.slice(-80);try{localStorage.setItem('vitals.digitalTwin.demoAttentionSnapshots.v2',JSON.stringify(stored));lastSavedAt=now}catch{}}
function drawTrend(snapshot){const svg=$('dtv2Trend'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();for(let i=0;i<4;i++){const ln=document.createElementNS(ns,'line');Object.entries({x1:20,x2:500,y1:25+i*30,y2:25+i*30,stroke:'#245366'}).forEach(([k,v])=>ln.setAttribute(k,v));svg.append(ln)}const data=rows(read('vitals.digitalTwin.demoAttentionSnapshots.v2',{})[snapshot.mid+'::'+snapshot.id]).filter(r=>n(r.value)!==null).slice(-55);if(data.length<2){const t=document.createElementNS(ns,'text');t.setAttribute('x','260');t.setAttribute('y','76');t.setAttribute('text-anchor','middle');t.setAttribute('fill','#8ec5ce');t.textContent='Not enough local attention snapshots';svg.append(t);return;}const poly=document.createElementNS(ns,'polyline');poly.setAttribute('points',data.map((r,i)=>`${20+480*i/(data.length-1)},${116-Number(r.value)*.91}`).join(' '));poly.setAttribute('fill','none');poly.setAttribute('stroke','#67dec2');poly.setAttribute('stroke-width','3');svg.append(poly)}
function inputs(e,result){const items=[['Clinical history / baseline',e.profile?`Profile registered; ${Object.keys(e.profile.metrics||{}).length} metric field(s). No clinical diagnosis calculated.`:'Not available'],['Musculoskeletal baseline',e.baseline?`Manual training strength index ${fmt(e.baseline.strength)}; not tissue density`:'Not saved'],['Cognitive / behavioral',e.cognitive.filter(t=>t.value!==null).map(t=>`${t.name} ${fmt(t.value)}%`).join(' · ')||'No attributable test scores'],['Wellbeing check-ins',e.checkins.length+' recorded · private journal excluded'],['Environmental / radiation',destination()?`Mission destination ${destination().toUpperCase()}; no verified individual radiation dose linked`:'No mission destination available'],['Data-source coverage',`${result.observed}/${result.domains.length} evidence categories with demo signals; missing data is UNKNOWN`]];
$('dtv2Inputs').innerHTML=items.map(([a,b])=>`<p><strong>${clean(a)}:</strong> ${clean(b)}</p>`).join('')}
function repaint(){if(!aId())return;const e=evidence(),result=evaluate(e);bars(result);hotspots(result);inputs(e,result);const sample={...result,id:e.id,mid:e.mid};trend(sample);drawTrend(sample);}
$('dtv2Destination').addEventListener('change',()=>{if(destination())return;lastEnv='';setEnvironment()});$('astronaut').addEventListener('change',()=>{$('dtv2Message').hidden=true;repaint()});$('refresh').addEventListener('click',()=>{lastEnv='';setEnvironment();repaint()});model.addEventListener('load',()=>{if(seenAvatar)return;seenAvatar=true;try{for(const mat of model.model?.materials||[]){if(!mat.pbrMetallicRoughness)continue;mat.pbrMetallicRoughness.setBaseColorFactor?.([.22,.79,.78,1]);mat.pbrMetallicRoughness.setMetallicFactor?.(.18);mat.pbrMetallicRoughness.setRoughnessFactor?.(.58);mat.setEmissiveFactor?.([.015,.10,.10]);}model.exposure=.8;}catch{}repaint()});
window.addEventListener('storage',()=>{lastEnv='';setEnvironment();repaint()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastEnv='';setEnvironment();repaint()}});setTimeout(()=>{lastEnv='';setEnvironment();repaint()},200);setInterval(()=>{if(!document.hidden)repaint()},5000);
})();
