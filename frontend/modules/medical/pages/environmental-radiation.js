"use strict";
// V.I.T.A.L.S. Environmental & Radiation V1. Reference and manually entered demo scenarios only.
(() => {
  const $ = id => document.getElementById(id);
  const ROOT = "../../mission/pages/destinations/";
  const KEYS = {active:"vitals.mission.active.v1", destination:"vitals.mission.destination.v1", profiles:"vitals.astronauts.v1", astronaut:"vitals.activeAstronautId.v1", crew:"vitals.mission.crew.v1"};
  const REF_FILES = {earth:"earth-reference.json",moon:"moon-reference.json",mars:"mars-reference.json",titan:"titan-reference.json",europa:"europa-reference.json"};
  const REGION_LABELS = {"south-pole":"South Pole","hot-desert":"Hot Desert","earthquake-zone":"Earthquake Zone","tsunami-coast":"Tsunami Coast","volcanic-region":"Volcanic Region",floodplain:"Floodplain"};
  const RADIO_SOURCES = [
    ["NASA SRAG · radiation operations","https://srag.jsc.nasa.gov/"],
    ["NASA SRAG · detectors, dosimetry and EVA","https://srag.jsc.nasa.gov/spaceradiation/how/how.cfm"],
    ["NASA · space radiation health research","https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/"],
    ["CSA · CANS neutron monitoring (2026)","https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp"],
    ["CSA · MOSFET / Matroshka-R","https://www.asc-csa.gc.ca/eng/astronauts/space-medicine/mosfet.asp"]
  ];
  const parse = key => { try {return JSON.parse(localStorage.getItem(key) || "null");} catch {return null;} };
  const get = key => { try {return localStorage.getItem(key);} catch {return null;} };
  const clean = x => x === null || x === undefined ? "" : String(x).trim();
  let mission=null, profiles=[], crew=null, refs={}, scenario=null;
  const asDisplay = (value,unit="") => value === null || value === undefined || value === "" ? "Not provided" : `${value}${unit?` ${unit}`:""}`;
  const titleize = s => String(s).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]/g," ").replace(/\b\w/g,t=>t.toUpperCase());
  function el(tag,text,cls){const e=document.createElement(tag);if(text!==null)e.textContent=String(text);if(cls)e.className=cls;return e;}
  function readContext(){
    const m=parse(KEYS.active);
    mission=m&&typeof m==="object"&&!Array.isArray(m)?m:null;
    const rawProfiles=parse(KEYS.profiles);
    profiles=Array.isArray(rawProfiles)?rawProfiles.filter(x=>x&&typeof x==="object"):[];
    const r=parse(KEYS.crew);crew=r&&typeof r==="object"?r:null;
  }
  async function loadReferences(){
    await Promise.all(Object.entries(REF_FILES).map(async ([key,file])=>{
      try{const response=await fetch(ROOT+file,{cache:"no-store"});if(!response.ok)throw Error(`HTTP ${response.status}`);refs[key]=await response.json();}
      catch(error){refs[key]=null;console.warn("VITALS scientific reference unavailable:",key,error);}
    }));
  }
  function selectOptions(select,values,chosen){select.replaceChildren();for(const [id,label] of values){const option=el("option",label);option.value=id;select.append(option);}if(values.some(x=>x[0]===chosen))select.value=chosen;}
  function currentDestination(){return $("destination").value;}
  function currentRegion(){return $("region").value;}
  function currentProfile(){return profiles.find(p=>clean(p.astronautId||p.id)===$("astronaut").value)||null;}
  function refreshSelectors(){
    const choices=Object.keys(REF_FILES).map(x=>[x,x.toUpperCase()]);
    const requested=clean(mission?.destination||get(KEYS.destination)).toLowerCase().replace("-remote","");
    selectOptions($("destination"),choices,choices.some(x=>x[0]===requested)?requested:"earth");
    selectOptions($("astronaut"),[["","No astronaut selected"],...profiles.map(p=>[clean(p.astronautId||p.id),`${clean(p.fullName||p.name)} — ${clean(p.astronautId||p.id)}`]).filter(p=>p[0])],clean(get(KEYS.astronaut)));
    $("missionStatus").textContent=mission?`ACTIVE: ${clean(mission.name||mission.id||"Unnamed mission")} (${clean(mission.id||"no ID")})`:"NO ACTIVE CONFIGURATION: destination preview only";
    $("days").value=Number.isFinite(Number(mission?.durationDays))&&mission?.durationDays!==undefined?String(mission.durationDays):"";
    const eva=Number(mission?.evaSessions)*Number(mission?.evaMinutes)/60;
    $("evaHours").value=mission?.evaPlanned&&Number.isFinite(eva)?String(Math.round(eva*100)/100):"0";
    updateRegion();
  }
  function updateRegion(){
    const earthly=currentDestination()==="earth";const ids=Object.keys(REGION_LABELS);
    selectOptions($("region"),earthly?ids.map(id=>[id,REGION_LABELS[id]]):[["","Not applicable"]],earthly&&ids.includes(mission?.region)?mission.region:"south-pole");$("region").disabled=!earthly;
    renderEnvironment();renderIdentity();
  }
  function card(label,value,note){const box=el("article",null,"metric");box.append(el("h3",label),el("strong",value),el("p",note||""));$("environmentCards").append(box);}
  function links(target,entries){target.replaceChildren();const seen=new Set();for(const [label,url] of entries){if(typeof url!=="string"||!/^https:\/\//.test(url)||seen.has(url))continue;seen.add(url);const a=el("a",label+" ↗");a.href=url;a.target="_blank";a.rel="noopener noreferrer";target.append(a);}}
  function renderEnvironment(){
    const dest=currentDestination(), data=refs[dest], cards=$("environmentCards");cards.replaceChildren();
    let sources=[],note="Scientific reference, not a location-specific measurement or live sensor.";
    if(!data){card("Reference unavailable","No data loaded","Check the local web server and destination JSON files.");$("referenceNote").textContent=note;links($("destinationSources"),sources);return;}
    if(dest==="earth"){
      const r=(data.regionData||[]).find(x=>x.id===currentRegion());
      if(r){for(const fact of (r.facts||[])){if(Array.isArray(fact))card(clean(fact[0]),clean(fact[1]),clean(fact[2]));}sources=r.sources||[];note=r.desc||note;}
    }else if(dest==="mars"){
      for(const [name,x] of Object.entries(data.parameters||{})){card(titleize(name),asDisplay(x.value,x.unit),x.note||x.statistic||"Historical / planetary reference");if(x.source)sources.push([titleize(name)+" — NASA",x.source]);}
    }else if(dest==="moon"){
      for(const [name,x] of Object.entries(data.indicators||{})){card(titleize(name),asDisplay(x.value,x.unit),x.note||x.kind||"Published reference");if(x.source)sources.push([titleize(name)+" — NASA",x.source]);}
    }else if(dest==="europa"){
      for(const key of ["gravity","surfaceTemperature","atmosphere","radiation","surface","ocean"]){const x=data[key];if(!x)continue;let value=x.value??x.type??x.qualitative??x.composition??x.evidence;
        if(key==="surfaceTemperature")value=(`${asDisplay(x.minimumC)} to ${asDisplay(x.maximumC)} °C`);
        card(titleize(key),asDisplay(value,x.unit),x.meaning||x.basis||x.note||"Published reference");if(x.source)sources.push([titleize(key)+" — NASA",x.source]);}
    }else if(dest==="titan"){
      for(const x of (data.measurements||[])){card(titleize(x.id),asDisplay(x.value,x.unit),x.type||"Published reference");if(x.source)sources.push([titleize(x.id)+" — NASA",x.source]);}
    }
    if(cards.children.length===0)card("Reference unavailable","No fields","Unrecognized JSON structure.");
    $("referenceNote").textContent=note;
    links($("destinationSources"),sources);
  }
  function renderIdentity(){
    const p=currentProfile(), members=Array.isArray(crew?.members)?crew.members:[];
    const member=p?members.find(m=>clean(m.astronautId)===clean(p.astronautId||p.id)):null;
    const missionDestination=clean(mission?.destination).toLowerCase();
    const sameDest=!!crew&&(!clean(crew.destination)||clean(crew.destination).toLowerCase()===missionDestination)&&!!mission;
    $("crewStatus").textContent=!p?"Choose an astronaut to view personal baselines":!mission?"No active mission — membership not verifiable":!sameDest?"Crew roster not verified for active mission":member?`ASSIGNED CREW — ${clean(member.roleName||member.role||"role unspecified")}`:"NOT ASSIGNED TO ACTIVE MISSION";
    $("missionSummary").textContent=mission?`MISSION ${clean(mission.id)} | destination ${missionDestination.toUpperCase()} | ${asDisplay(mission.durationDays,"days")} | ${asDisplay(mission.gravity,"m/s²")} mission gravity | mission mode ${clean(mission.operationalMode||"not specified")}`:"No saved active mission. You are previewing a planetary scientific reference; no live telemetry or personal exposure inferred.";
    const panel=$("healthContext");panel.replaceChildren();
    if(!p){panel.append(el("p","No astronaut selected. Confirm an astronaut in SELECT ASTRONAUT to view their saved physiological context."));return;}
    const metrics=p.metrics&&typeof p.metrics==="object"?p.metrics:{};
    const chosen=[
      ["RESTING HEART RATE",metrics.restingHeartRateBpm,"bpm"],
      ["OXYGEN SATURATION",metrics.oxygenSaturationPct,"%"],
      ["BONE DENSITY T-SCORE (DEMO)",metrics.boneDensityTScoreSimulation,""],
      ["MUSCLE MASS (DEMO)",metrics.muscleMassKgSimulation,"kg"],
      ["PRIOR RADIATION DOSE (DEMO)",metrics.cumulativeRadiationDoseMSvSimulation,"mSv"],
      ["SLEEP DURATION",metrics.sleepDurationH,"h"]
    ];
    for(const [label,val,unit] of chosen){const b=el("article");b.append(el("h3",label),el("strong",asDisplay(val,unit)),el("p","Synthetic profile baseline. Not a live sensor reading."));panel.append(b);}
    const history=p.medicalHistory||p.clinicalHistory||p.clinicalNotes;
    if(typeof history==="string"&&history.trim()){const b=el("article");b.append(el("h3","CLINICAL NOTES (SYNTHETIC)"),el("p",history.slice(0,350)));panel.append(b);}
  }
  function calculate(){
    const input=id=>$(id).value.trim()===""?null:Number($(id).value);
    const days=input("days"),hours=input("evaHours"),inside=input("habitatRate"),outside=input("evaRate");
    scenario=null;$("exportScenario").disabled=true;
    if([days,hours,inside,outside].some(v=>v===null||!Number.isFinite(v)||v<0)||days>3650||hours>days*24){$("doseResult").textContent="Enter all four valid non-negative values. EVA hours cannot exceed total mission hours.";return;}
    const nonEVA=days*24-hours;
    const totalMicroSv=nonEVA*inside+hours*outside;
    if(!Number.isFinite(totalMicroSv)){ $("doseResult").textContent="Calculation out of range.";return; }
    const mSv=totalMicroSv/1000;
    scenario={schema:"vitals.medical.environment.exposureScenario.v1",provenance:"manually-entered-hypothetical-rates",validated:false,live:false,clinicalDecisionReady:false,astronautId:clean(currentProfile()?.astronautId||currentProfile()?.id),missionId:clean(mission?.id),destination:currentDestination(),region:currentDestination()==="earth"?currentRegion():null,durationDays:days,evaHours:hours,nonEvaHours:nonEVA,habitatRateMicroSvPerHour:inside,evaRateMicroSvPerHour:outside,estimatedEquivalentDoseMSv:mSv,calculation:"((days*24-evaHours)*habitatRate+evaHours*evaRate)/1000",note:"Demonstration only. Input rates are not supplied by NASA planetary reference values. No biological risk estimate.",generatedAt:new Date().toISOString()};
    $("doseResult").textContent=`DEMO RESULT: ${mSv.toLocaleString("en-US",{maximumFractionDigits:5})} mSv total equivalent-dose scenario (habitat ${nonEVA.toFixed(2)} h; EVA ${hours.toFixed(2)} h). This is not measured astronaut dose or clinical risk.`;
    $("exportScenario").disabled=false;
  }
  function exportJson(){if(!scenario)return;const content=JSON.stringify(scenario,null,2);const blob=new Blob([content],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="vitals-environment-exposure-scenario.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function refresh(){readContext();await loadReferences();refreshSelectors();links($("radiationSources"),RADIO_SOURCES);$("doseResult").textContent="No exposure calculated. Enter manual hypothetical rates to begin.";scenario=null;$("exportScenario").disabled=true;}
  $("refresh").addEventListener("click",refresh);
  $("destination").addEventListener("change",()=>{updateRegion();scenario=null;$("exportScenario").disabled=true;});
  $("region").addEventListener("change",()=>{renderEnvironment();renderIdentity();});
  $("astronaut").addEventListener("change",renderIdentity);
  $("calculate").addEventListener("click",calculate);
  $("exportScenario").addEventListener("click",exportJson);
  window.addEventListener("storage",event=>{if(Object.values(KEYS).includes(event.key))refresh();});
  refresh();
})();
