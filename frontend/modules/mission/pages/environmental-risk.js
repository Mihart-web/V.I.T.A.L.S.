/* V.I.T.A.L.S. / Mission Environmental Risk Assessment V1.
 * Static destination references + explicit training assumptions; no clinical risk algorithm.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ACTIVE='vitals.mission.active.v1';
const DEST='vitals.mission.destination.v1';
const allowed=['earth','moon','mars','europa','titan'];
const regions=['south-pole','hot-desert','earthquake-zone','tsunami-coast','volcanic-region','floodplain'];
const heroes={moon:'Moon-hero.png',mars:'Mars-hero.png',europa:'Europa-hero.png',titan:'Titan-hero.png',earth:'Earth south pole -hero.png'};
const earthHeroes={'south-pole':'destEARTH-southpole-hero.png','hot-desert':'destEARTH-desertic-hero.png','earthquake-zone':'destEARTH-earthquakezone-hero.png','tsunami-coast':'destEARTH-tsunami coast-hero.png','volcanic-region':'destEARTH-volcanic region-hero.png','floodplain':'destEARTH-floodplain -hero.png'};
const referenceLinks={
  radiation:'https://www.nasa.gov/hrp/hazard-space-radiation/',
  isolation:'https://www.nasa.gov/hrp/hazard-isolation-and-confinement/',
  distance:'https://www.nasa.gov/hrp/hazard-distance-from-earth/',
  gravity:'https://www.nasa.gov/hrp/hazard-gravity-fields/',
  habitat:'https://www.nasa.gov/hrp/hazard-hostile-closed-environments/'
};
const hazards=[
 ['radiation','Space radiation','Galactic cosmic rays, solar energetic particles and shielding limitations. Historical planetary rates are not personal doses.'],
 ['isolation','Isolation & confinement','Duration, restricted space, workload, circadian rhythms and behavioral performance.'],
 ['distance','Distance from Earth','Communications latency, resupply limitations and autonomous emergency response.'],
 ['gravity','Altered gravity','Sensorimotor adaptation and reduced loading of muscles and bones; effects depend on mission phases.'],
 ['habitat','Hostile / closed environment','Atmosphere, pressure, thermal control, microbes, dust, noise, lighting and reliability of life support.']
];
const safeParse=key=>{try{return JSON.parse(localStorage.getItem(key));}catch{return null}};
const clean=s=>String(s??'').trim();
let mission=null, dest='moon', region='south-pole', doc=null, assessment=null;
function make(tag,cls,txt){let x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x;}
function empty(node){node.replaceChildren();}
function link(url,label='SOURCE ↗'){
 if(!/^https:\/\//i.test(String(url||'')))return null;
 const a=make('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function mkDetail(label,val){const d=make('div','detail');d.append(make('small','',label),make('b','',val));return d;}
function format(value,unit){if(value===null||value===undefined||value==='')return 'NOT PROVIDED';return `${value}${unit&&unit!=='text'&&unit!=='qualitative'?' '+unit:''}`;}
function refCard(label,value,unit,note,source){const d=make('article','refcard');d.append(make('small','',label.toUpperCase()),make('strong','',format(value,unit)));if(note)d.append(make('p','',note));const a=link(source);if(a)d.append(a);return d;}
function addRef(name,value,unit,note,source){$('referenceGrid').append(refCard(name,value,unit,note,source));}
function pickMission(){let m=safeParse(ACTIVE);return m&&typeof m==='object'&&!Array.isArray(m)&&allowed.includes(clean(m.destination).toLowerCase())?m:null;}
function normalizedDestination(value){const v=clean(value).toLowerCase();return v==='earth-remote'?'earth':allowed.includes(v)?v:'';}
function displayMission(){
 mission=pickMission();
 const savedDest=normalizedDestination(localStorage.getItem(DEST));
 dest=mission?normalizedDestination(mission.destination):(normalizedDestination($('destination').value)||savedDest||'moon');
 region=mission&&regions.includes(clean(mission.region))?clean(mission.region):(regions.includes($('region').value)?$('region').value:'south-pole');
 $('destination').value=dest;$('destination').disabled=!!mission;$('regionWrap').hidden=dest!=='earth';$('region').hidden=dest!=='earth';$('region').disabled=!!mission;
 if(dest==='earth')$('region').value=region;
 $('planetName').textContent=dest.toUpperCase()+(dest==='earth'?' / '+region.replaceAll('-',' ').toUpperCase():'');
 const asset='../../../../assets/Destinations/'+(dest==='earth'?(earthHeroes[region]||heroes.earth):heroes[dest]);
 $('heroImage').src=asset;
 $('heroImage').onerror=()=>{$('heroImage').removeAttribute('src')};
 $('missionStatus').textContent=mission?`ACTIVE MISSION: ${clean(mission.id)||'SAVED'} — ${clean(mission.name)||'Unnamed'} · ${dest.toUpperCase()}`:'NO ACTIVE MISSION — destination preview only. No mission setup is being changed.';
 $('previewNote').textContent=mission?'Mission is active: selection is locked to the saved destination and Earth region.':'Preview selection only. This does not save or start a mission.';
 const facts=$('missionFacts');empty(facts);
 const vals=[['MISSION ID',mission?.id||'PREVIEW'],['DURATION',mission?.durationDays!=null?`${mission.durationDays} days`:'NOT CONFIGURED'],['CREW CAPACITY',mission?.crewCapacity??'NOT CONFIGURED'],['HABITAT',mission?.habitat||'NOT CONFIGURED'],['EVA PLAN',mission?((mission.evaPlanned?'Planned':'Not planned')+(mission.evaSessions?' · '+mission.evaSessions+' sessions':'')):'NOT CONFIGURED'],['COMMUNICATION',mission?.communication||'NOT CONFIGURED']];
 for(const [key,val] of vals)facts.append(mkDetail(key,val));
}
async function readReference(){
 $('referenceStatus').textContent='Loading '+dest.toUpperCase()+' published reference...';$('referenceStatus').classList.remove('warn');empty($('referenceGrid'));$('regionInfo').hidden=true;
 try{
  const res=await fetch('./destinations/'+dest+'-reference.json',{cache:'no-cache'});
  if(!res.ok)throw new Error('HTTP '+res.status);
  const data=await res.json();
  if(!data||typeof data!=='object')throw new Error('Invalid JSON');
  doc=data;drawReference(data);
  $('referenceStatus').textContent='PUBLISHED REFERENCE LOADED · '+dest.toUpperCase()+' · STATIC DATA, NOT LIVE CONDITIONS OR PERSONAL EXPOSURE';
 }catch(e){doc=null; $('referenceStatus').textContent='REFERENCE UNAVAILABLE: '+e.message+'. Inspect the destination JSON file and local HTTP server. No replacement values were invented.';$('referenceStatus').classList.add('warn');}
 assess();
}
function drawReference(data){
 const ind=data.indicators||{};const p=data.parameters||{};
 if(dest==='moon'){
  addRef('Surface gravity',ind.gravity?.value,ind.gravity?.unit,'Mean surface reference',ind.gravity?.source);
  addRef('Sunlit temperature',ind.sunlitTemperature?.value,ind.sunlitTemperature?.unit,'Illustrative extreme, not local weather',ind.sunlitTemperature?.source);
  addRef('Dark temperature',ind.darkTemperature?.value,ind.darkTemperature?.unit,'Illustrative extreme, not local weather',ind.darkTemperature?.source);
  addRef('Atmosphere',ind.atmosphere?.value,null,'Very tenuous exosphere',ind.atmosphere?.source);
  addRef('Space radiation',ind.radiation?.hazards?.join(', ').replaceAll('_',' '),null,'Qualitative hazards; no personal dose',ind.radiation?.source);
  addRef('Surface regolith',ind.regolith?.value,null,ind.regolith?.note,ind.regolith?.source);
 }else if(dest==='mars'){
  for(const [label,field] of [['Surface gravity','gravity'],['Reference temperature','surfaceTemperature'],['Surface pressure','surfacePressure'],['Atmosphere','atmosphere'],['Historic absorbed dose rate','surfaceAbsorbedRadiationDoseRate'],['Dust','dust']]){
   const v=p[field];addRef(label,v?.value,v?.unit,v?.note||v?.statistic?.replaceAll('_',' ')||'Published reference only',v?.source);
  }
 }else if(dest==='europa'){
  addRef('Surface gravity',data.gravity?.value,data.gravity?.unit,data.gravity?.basis,data.gravity?.source);
  addRef('Temperature range',data.surfaceTemperature?`${data.surfaceTemperature.minimumC} to ${data.surfaceTemperature.maximumC}`:null,'°C',data.surfaceTemperature?.meaning,data.surfaceTemperature?.source);
  addRef('Atmosphere',data.atmosphere?.type,null,'Not breathable',data.atmosphere?.source);
  addRef('Radiation environment',data.radiation?.qualitative,null,'No personal astronaut dose',data.radiation?.source);
  addRef('Surface',data.surface?.composition,null,'Ice and fractures',data.surface?.source);
  addRef('Subsurface ocean',data.ocean?.evidence,null,'Not a surface environmental reading',data.ocean?.source);
 }else if(dest==='titan'){
  const m=Array.isArray(data.measurements)?data.measurements:[];
  const labelMap={gravity:'Surface gravity',surface_temperature:'Surface temperature',surface_pressure:'Surface pressure',atmosphere:'Atmosphere',radiation:'Radiation',lakes:'Lakes'};
  for(const item of m)addRef(labelMap[item.id]||item.id,item.value,item.unit,item.type?.replaceAll('_',' '),item.source);
 }else if(dest==='earth'){
  const area=Array.isArray(data.regionData)?data.regionData.find(x=>x.id===region):null;
  if(!area){addRef('Selected region',region,null,'Region reference not found',null);return;}
  for(const fact of area.facts||[])addRef(fact[0],fact[1],null,fact[2],area.sources?.[0]?.[1]);
  const info=$('regionInfo');empty(info);info.append(make('strong','',area.title||region),make('p','',area.desc||''));
  for(const note of area.notes||[])info.append(make('p','',`• ${note}`));
  for(const src of area.sources||[]){const a=link(src[1],src[0]+' ↗');if(a){info.append(a,make('span','', '  '));}}
  info.hidden=false;
 }
}
function drawHazards(){const root=$('hazards');for(let i=0;i<hazards.length;i++){const [id,name,desc]=hazards[i];const card=make('article','hazard');card.append(make('span','num',`0${i+1} / NASA HAZARD`),make('h3','',name),make('p','',desc));const a=link(referenceLinks[id],'READ NASA RESEARCH ↗');if(a)card.append(a);root.append(card);}}
function assessmentSignals(){
 const phase=$('phase').value,habitat=$('habitat').value,weather=$('weather').value,comms=$('comms').value;
 const days=Number(mission?.durationDays);
 const noData='Reference available; no astronaut dose, sensor reading or validated risk probability is available.';
 const isEarth=dest==='earth';
 return [
  {name:'Space radiation',id:'radiation',level:weather==='spe'?'priority':phase==='eva'&&!isEarth?'caution':'review',description:weather==='spe'?'Hypothetical solar particle event selected. Review shielding and mission contingency procedures; not a confirmed forecast.':phase==='eva'&&!isEarth?'Illustrative EVA exposure outside the habitat. Radiation dose requires time, shielding and dosimetry.':noData},
  {name:'Isolation & confinement',id:'isolation',level:days>=90?'caution':'review',description:days>=90?'Extended planned duration prompts behavioral, sleep and workload planning; not an individual diagnosis.':mission?`${Number.isFinite(days)?days:'Unspecified'} planned mission days. Behavioral hazard is present as context; no attributed check-in is inferred.`:'No active mission duration to assess. Training context only.'},
  {name:'Distance from Earth',id:'distance',level:comms==='degraded'?'caution':'review',description:comms==='degraded'?'Simulated degraded communications. Confirm autonomous procedures and contingency capability.':mission?`Mission communication plan: ${clean(mission.communication)||'unspecified'}. No real communications delay measured.`:'Destination preview only. Communications plan not configured.'},
  {name:'Altered gravity',id:'gravity',level:(!isEarth&&phase==='eva')?'caution':'review',description:!isEarth&&phase==='eva'?'Partial-gravity surface EVA selected. Review locomotion and sensorimotor adaptation; no muscle/bone loss predicted.':isEarth?'Earth analog: region-specific operational hazards, not microgravity.':'Low-gravity destination reference. Actual muscle and bone changes require longitudinal measurements.'},
  {name:'Hostile / closed environments',id:'habitat',level:habitat==='fault'?'priority':phase==='eva'?'caution':'review',description:habitat==='fault'?'Simulated life-support/environmental-control fault selected. Requires operational review; no confirmed malfunction.':phase==='eva'?'EVA scenario: external environmental conditions differ from protected habitat conditions. No suit telemetry connected.':'Habitat state is nominal/unverified. Environmental sensors and local conditions are not connected.'}
 ];
}
function assess(){
 const signals=assessmentSignals();const node=$('assessment');empty(node);
 for(const x of signals){const box=make('article','risk '+(x.level==='review'?'':x.level));box.append(make('div','risk-name',x.name),make('div','risk-level',x.level==='priority'?'SIMULATED PRIORITY':x.level==='caution'?'SCENARIO CAUTION':'CONTEXT / REVIEW'),make('p','',x.description));node.append(box);}
 const ca=signals.filter(x=>x.level==='caution').length, pr=signals.filter(x=>x.level==='priority').length;
 $('assessmentNote').textContent=`TRAINING ONLY · ${pr} simulated priority, ${ca} scenario cautions, ${signals.length-pr-ca} context/review · No validated individual probabilities or automated EVA decisions.`;
 assessment={schema:'vitals.mission.environment.assessment.v1',classification:'scenario_illustration_only',generatedAt:new Date().toISOString(),missionId:mission?.id||null,missionName:mission?.name||null,destination:dest,earthRegion:dest==='earth'?region:null,referenceFile:dest+'-reference.json',referenceLoaded:!!doc,missionDurationDays:mission?.durationDays??null,controls:{phase:$('phase').value,habitat:$('habitat').value,spaceWeather:$('weather').value,communications:$('comms').value},hazards:signals,personalRadiationDose:null,clinicalRiskProbability:null,liveSensors:false};
}
function exportReport(){assess();const blob=new Blob([JSON.stringify(assessment,null,2)],{type:'application/json'});const uri=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=uri;anchor.download=`VITALS_ENV_RISK_${clean(mission?.id||dest).replace(/[^a-z0-9_-]/gi,'_')}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(uri),1000);}
function refresh(){displayMission();readReference();}
$('reload').addEventListener('click',refresh);
$('destination').addEventListener('change',()=>{if(mission)return;dest=$('destination').value;displayMission();readReference();});
$('region').addEventListener('change',()=>{if(mission)return;region=$('region').value;displayMission();readReference();});
$('assess').addEventListener('click',assess);
$('resetScenario').addEventListener('click',()=>{for(const id of ['phase','habitat','weather','comms'])$(id).selectedIndex=0;assess();});
$('export').addEventListener('click',exportReport);
window.addEventListener('storage',event=>{if(event.key===ACTIVE||event.key===DEST)refresh();});
drawHazards();refresh();
})();
