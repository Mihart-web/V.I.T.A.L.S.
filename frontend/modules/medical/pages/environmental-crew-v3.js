"use strict";
/* V.I.T.A.L.S. Crew Exposure V3 - hypothetical planning only.
   Never grants medical authority, writes mission crew, or represents real dosimetry. */
(() => {
  const $ = id => document.getElementById(id);
  if (!$('crewExposureV3')) return;
  const K = {mission:'vitals.mission.active.v1',roster:'vitals.mission.crew.v1',profiles:'vitals.astronauts.v1',activeAstronaut:'vitals.activeAstronautId.v1'};
  const str = x => x == null ? '' : String(x).trim();
  const read = key => {try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
  const format = n => Number(n).toLocaleString('en-US',{maximumFractionDigits:5});
  const norm = v => str(v).toLowerCase().replace(/-remote$/,'');
  const profileId = p => str(p?.astronautId||p?.id||p?.profileId);
  const profileName = p => str(p?.fullName||p?.name||p?.displayName)||'Unnamed astronaut';
  const create = (tag,cls,txt) => {const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e};
  const numeric = id => {const v=$(id)?.value.trim();return v===''||v===undefined?null:Number(v)};
  let state = {mission:null,members:[],profiles:new Map(),reason:'',results:null,inputs:new Map()};
  function portrait(p) {
    let f=str(p?.avatarFile||p?.avatar||p?.image||p?.portrait);
    const index=Number(p?.avatarIndex??p?.avatar_index??p?.avatarNumber??p?.avatar_number);
    if(!/^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(f)&&Number.isInteger(index)&&index>=1&&index<=28)
      f=`av${index}${[1,20,28].includes(index)?'.png':'.webp'}`;
    return /^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(f)?`../../../../assets/astronaut-profile/portraits/${f}`:'';
  }
  function load() {
    state.inputs=new Map();state.results=null;
    const m=read(K.mission), raw=read(K.profiles);
    state.mission=m&&typeof m==='object'&&!Array.isArray(m)&&str(m.id)?m:null;
    const items=Array.isArray(raw)?raw:Array.isArray(raw?.astronauts)?raw.astronauts:[];
    state.profiles=new Map(items.filter(p=>p&&profileId(p)).map(p=>[profileId(p),p]));
    const dest=norm(state.mission?.destination);
    const candidates=[read(`${K.roster}.${dest}`),read(K.roster)].filter(r=>r&&Array.isArray(r.members));
    const match=r=>norm(r.destination)===dest&&str(r.missionName)===str(state.mission?.name);
    const roster=state.mission?candidates.find(match):null;
    state.members=roster?roster.members.filter(x=>x&&str(x.astronautId)):[];
    state.reason=!state.mission?'No active mission. Choose a mission in Mission Configuration.':
      !roster?'No saved roster matches this mission name and destination. Assign crew and save the roster in Crew Assignment.':
      !state.members.length?'This mission has a saved roster but no assigned astronauts.':'Crew roster verified for the active mission.';
    render();
  }
  function resetOutput(message='Enter the planned EVA hours for each astronaut, then calculate crew scenarios.') {
    state.results=null;$('crewCompareV3').replaceChildren();$('crewExportV3').disabled=true;
    $('crewResultV3').textContent=message;
    document.querySelectorAll('.crew-v3-dose').forEach(e=>e.textContent='NOT CALCULATED');
  }
  function render() {
    const mission=state.mission;
    $('crewMissionV3').textContent=mission?`${str(mission.id)} — ${str(mission.name)} | ${norm(mission.destination).toUpperCase()} | ${str(mission.durationDays)} days`:'NO ACTIVE MISSION';
    $('crewNoticeV3').textContent=state.reason;
    $('crewCountV3').textContent=`${state.members.length} assigned / ${Number.isInteger(Number(mission?.crewCapacity))?str(mission.crewCapacity):'?'} capacity`;
    const grid=$('crewCardsV3');grid.replaceChildren();
    for(const member of state.members){
      const id=str(member.astronautId),p=state.profiles.get(id),name=p?profileName(p):str(member.displayName)||'Profile missing';
      const card=create('article','crew-v3-card');card.dataset.astronautId=id;
      const top=create('div','crew-v3-person');
      const imgSrc=portrait(p);
      if(imgSrc){const img=create('img','crew-v3-portrait');img.src=imgSrc;img.alt=`Avatar: ${name}`;img.loading='lazy';img.onerror=()=>{img.replaceWith(create('span','crew-v3-fallback','✦'))};top.append(img)}
      else top.append(create('span','crew-v3-fallback','✦'));
      const info=create('div','crew-v3-info');info.append(create('strong','',name),create('small','',`ID: ${id}`),create('small','',`ROLE: ${str(member.roleName||member.role)||'Not recorded'}`));
      if(member.consoleOperator)info.append(create('small','crew-v3-operator','CONSOLE OPERATOR — no concurrent EVA'));
      top.append(info);card.append(top);
      const field=create('label','crew-v3-label',`PLANNED EVA HOURS — ${name}`);
      const input=create('input','crew-v3-hours');input.type='number';input.min='0';input.step='0.01';input.placeholder=member.consoleOperator?'Unavailable during console duty':'Enter individual hours';input.dataset.member=id;
      input.disabled=!!member.consoleOperator;field.append(input);card.append(field);
      if(!p)card.append(create('p','crew-v3-warning','Profile not found. Individual clinical context unavailable.'));
      const dose=create('div','crew-v3-dose','NOT CALCULATED');card.append(dose);
      const btn=create('button','button crew-v3-view','VIEW IN INDIVIDUAL MONITORING');btn.type='button';btn.disabled=!p;
      btn.addEventListener('click',()=>{
        const select=$('astronaut');const option=[...select.options].find(o=>o.value===id);
        if(!option)return;$('astronaut').value=id;$('astronaut').dispatchEvent(new Event('change',{bubbles:true}));
        $('healthContext')?.scrollIntoView({behavior:'smooth',block:'start'});
      });card.append(btn);
      input.addEventListener('input',()=>{state.inputs.set(id,input.value);resetOutput('Crew EVA hours changed. Recalculate crew scenarios.');});
      grid.append(card);
    }
    if(!state.members.length)grid.append(create('p','crew-v3-warning','No matching crew members to display. No assignments are invented.'));
    resetOutput();
  }
  function calculation(){
    const m=state.mission,days=numeric('days'),habitat=numeric('habitatRate'),eva=numeric('evaRate');
    if(!m||!state.members.length){resetOutput('Save a matching crew roster for the active mission first.');return;}
    if(!Number.isFinite(days)||days<=0||days>3650||[habitat,eva].some(v=>v===null||!Number.isFinite(v)||v<0)){
      resetOutput('Enter mission duration and both hypothetical dose rates in the main calculator.');return;
    }
    // The destination reference is a preview and must match the active mission for crew calculations.
    if(norm($('destination').value)!==norm(m.destination)||
       (norm(m.destination)==='earth'&&str($('region').value)!==str(m.region))){
      resetOutput('Destination/region preview differs from active mission. Restore the mission reference before calculating crew exposure.');return;
    }
    const records=[];
    for(const member of state.members){
      const id=str(member.astronautId),p=state.profiles.get(id),field=document.querySelector(`.crew-v3-hours[data-member="${CSS.escape(id)}"]`);
      const value=member.consoleOperator?'0':field?.value.trim();
      if(!member.consoleOperator&&(value===''||value===undefined)){
        resetOutput('Fill planned EVA hours for every eligible crew member. Console operators are modeled as staying aboard during console duty.');return;
      }
      const hours=Number(value);
      if(!Number.isFinite(hours)||hours<0||hours>days*24){resetOutput(`Invalid EVA hours for ${p?profileName(p):id}.`);return;}
      const dose=((days*24-hours)*habitat+hours*eva)/1000;
      if(!Number.isFinite(dose)){resetOutput('Calculation overflow. Check the input rates.');return;}
      const prior=p?.metrics?.cumulativeRadiationDoseMSvSimulation;
      const baseline=typeof prior==='number'&&Number.isFinite(prior)&&prior>=0?prior:null;
      records.push({astronautId:id,name:p?profileName(p):str(member.displayName)||id,role:str(member.roleName||member.role),consoleOperator:!!member.consoleOperator,plannedEVAHours:hours,scenarioEquivalentDoseMSv:dose,priorSyntheticBaselineMSv:baseline,syntheticArithmeticSumMSv:baseline===null?null:baseline+dose});
    }
    state.results={schema:'vitals.medical.environment.crewScenario.v3',classification:'hypothetical_planning_not_dosimetry',live:false,validated:false,clinicalDecisionReady:false,missionId:str(m.id),missionName:str(m.name),destination:norm(m.destination),region:str(m.region)||null,durationDays:days,habitatRateMicroSvPerHour:habitat,evaRateMicroSvPerHour:eva,assumption:'Console operators assigned no concurrent EVA hours; other EVA hours manually entered for each astronaut',records,generatedAt:new Date().toISOString()};
    const table=$('crewCompareV3');table.replaceChildren();
    const head=create('thead');const tr=create('tr');
    for(const text of ['Crew member','Role','Planned EVA (h)','Mission scenario (mSv)','Prior synthetic (mSv)'])tr.append(create('th','',text));head.append(tr);table.append(head);
    const body=create('tbody');
    for(const r of records){const tr=create('tr');for(const text of [r.name,r.role,format(r.plannedEVAHours),format(r.scenarioEquivalentDoseMSv),r.priorSyntheticBaselineMSv===null?'Not recorded':format(r.priorSyntheticBaselineMSv)])tr.append(create('td','',text));body.append(tr);const card=[...document.querySelectorAll('.crew-v3-card')].find(c=>c.dataset.astronautId===r.astronautId);const d=card?.querySelector('.crew-v3-dose');if(d)d.textContent=`DEMO MISSION DOSE: ${format(r.scenarioEquivalentDoseMSv)} mSv`;}
    table.append(body);
    $('crewResultV3').textContent=`Calculated ${records.length} hypothetical individual exposure scenarios for ${m.id}. Values reflect entered rates and individual planned EVA time, not measured doses or clinical effects.`;
    $('crewExportV3').disabled=false;
  }
  $('crewCalculateV3').addEventListener('click',calculation);
  $('crewRefreshV3').addEventListener('click',load);
  $('crewExportV3').addEventListener('click',()=>{
    if(!state.results)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(state.results,null,2)],{type:'application/json'}));
    const a=create('a');a.href=url;a.download='vitals-crew-exposure-scenario-v3.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  for(const id of ['days','habitatRate','evaRate','destination','region'])$(id)?.addEventListener('input',()=>resetOutput('Scenario settings changed. Recalculate crew scenarios.'));
  $('refresh')?.addEventListener('click',load);
  window.addEventListener('storage',e=>{if(e.key&&[K.mission,K.roster,K.profiles].some(k=>e.key===k||e.key.startsWith(k+'.')))load();});
  window.addEventListener('pageshow',load);
  load();
})();
