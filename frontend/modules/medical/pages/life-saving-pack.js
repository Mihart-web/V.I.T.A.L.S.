"use strict";
/* V.I.T.A.L.S. Life-Saving Pack V1: read-only mission/medical data and inert training workflow. */
(() => {
  const $=id=>document.getElementById(id);
  const K={mission:'vitals.mission.active.v1',roster:'vitals.mission.crew.v1',profiles:'vitals.astronauts.v1',active:'vitals.activeAstronautId.v1',identity:'vitals.session.identity.v1'};
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const raw=k=>{try{return localStorage.getItem(k)||''}catch{return ''}};
  const s=v=>v===null||v===undefined?'':String(v).trim();
  const dest=v=>s(v).toLowerCase().replace(/-remote$/,'');
  const pid=p=>s(p?.astronautId||p?.id||p?.profileId);
  const pname=p=>s(p?.fullName||p?.name||p?.displayName)||'Unnamed astronaut';
  const node=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=s(text);return x;};
  const portrait=p=>{let f=s(p?.avatarFile||p?.avatar||p?.image||p?.portrait);const ix=Number(p?.avatarIndex??p?.avatar_index??p?.avatarNumber??p?.avatar_number);if(!/^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(f)&&Number.isInteger(ix)&&ix>=1&&ix<=28)f=`av${ix}${[1,20,28].includes(ix)?'.png':'.webp'}`;return /^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(f)?`../../../../assets/astronaut-profile/portraits/${f}`:'';};
  const research=[
    ['MIDAZOLAM','Sedation-related emergency research','Clinical review required. No dosing, indication validation or patch delivery established.'],
    ['FENTANYL','Severe-pain research candidate','Controlled opioid; respiratory depression risk. No patch feasibility or administration authorized.'],
    ['NALOXONE / NARCAN','Opioid reversal research candidate','Antagonist concept only. Availability does not validate fentanyl use or microneedle rescue timing.'],
    ['GLUCAGON','Glucose emergency research candidate','Formulation, delivery route, effectiveness and contraindications unverified.'],
    ['ATROPINE','Cardiac emergency research candidate','No dose, pharmacokinetic model or patch compatibility established.'],
    ['EPINEPHRINE / ADRENALINE','Emergency-response research candidate','Time-critical delivery requirements cannot be assumed compatible with a microneedle patch.'],
    ['ANTIEMETIC CLASS','Nausea management research','Exact compound, compatibility, and clinical use are unselected and unvalidated.']
  ];
  let state={mission:null,members:[],profiles:new Map(),selected:'',operator:null,roster:null,reason:'',activeAlert:false};
  function missionLoad(){
    const m=read(K.mission), list=read(K.profiles);state.mission=m&&typeof m==='object'&&!Array.isArray(m)&&s(m.id)?m:null;
    const profiles=Array.isArray(list)?list:Array.isArray(list?.astronauts)?list.astronauts:[];
    state.profiles=new Map(profiles.filter(p=>p&&pid(p)).map(p=>[pid(p),p]));
    const d=dest(state.mission?.destination);
    const candidates=[read(`${K.roster}.${d}`),read(K.roster)].filter(x=>x&&Array.isArray(x.members));
    state.roster=state.mission?candidates.find(x=>dest(x.destination)===d&&s(x.missionName)===s(state.mission.name))||null:null;
    state.members=state.roster?state.roster.members.filter(x=>x&&s(x.astronautId)):[];
    const operators=state.members.filter(x=>x.consoleOperator);
    state.operator=operators.length===1?operators[0]:null;
    state.reason=!state.mission?'NO ACTIVE MISSION — configure a mission first.':!state.roster?'ROSTER NOT VERIFIED — crew name and destination must match active mission.':operators.length>1?'INCONSISTENT ROSTER — multiple console operators.':state.members.length===0?'No astronauts assigned to this mission.':'Verified roster for the active mission.';
    const activeId=raw(K.active);state.selected=state.members.some(x=>s(x.astronautId)===activeId)?activeId:s(state.members[0]?.astronautId);
    render();
  }
  function render(){
    $('missionInfo').textContent=state.mission?`${state.mission.id} — ${s(state.mission.name)} | ${dest(state.mission.destination).toUpperCase()} | ${state.members.length} assigned crew. ${state.reason}`:state.reason;
    $('missionInfo').classList.toggle('warn',!state.roster);
    const grid=$('crewGrid');grid.replaceChildren();
    for(const m of state.members){const id=s(m.astronautId),p=state.profiles.get(id),name=p?pname(p):s(m.displayName)||id;const b=node('button','crew-person'+(id===state.selected?' chosen':''));b.type='button';const src=portrait(p);if(src){const img=node('img');img.src=src;img.alt=`Portrait of ${name}`;img.onerror=()=>img.remove();b.append(img)}const text=node('span');text.append(node('strong','',name),node('small','',`ID ${id}`),node('small','',s(m.roleName||m.role)||'Role not recorded'));if(m.consoleOperator)text.append(node('small','', 'ONBOARD CONSOLE OPERATOR'));b.append(text);b.onclick=()=>{state.selected=id;state.activeAlert=false;resetAlert();render()};grid.append(b)}
    if(!state.members.length)grid.append(node('p','fine','No verified mission crew. Assign a crew in Mission Configuration > Crew Assignment.'));
    const p=state.profiles.get(state.selected),m=state.members.find(x=>s(x.astronautId)===state.selected),metrics=p?.metrics||{};
    $('profileDetail').textContent=p?`${pname(p)} · ${pid(p)} · ${s(m?.roleName||m?.role)}. Baselines are synthetic and are never sensor telemetry.`:'No verified assigned astronaut selected.';
    const list=[['RESTING HEART RATE','restingHeartRateBpm','bpm'],['OXYGEN SATURATION','oxygenSaturationPct','%'],['RESPIRATORY RATE','respiratoryRatePerMin','/min'],['BODY TEMPERATURE','bodyTemperatureC','°C'],['SLEEP','sleepDurationH','h'],['GLUCOSE','bloodGlucoseMgDl','mg/dL']];
    $('sensorMetrics').replaceChildren();for(const [label,key,unit] of list){const box=node('article');const value=metrics[key];box.append(node('h3','',label),node('strong','',value===undefined||value===null?'NOT RECORDED':`${value} ${unit}`),node('p','','SYNTHETIC BASELINE · MONITORING NOT STARTED'));$('sensorMetrics').append(box)}
    const op=state.operator,opProfile=op?state.profiles.get(s(op.astronautId)):null;
    $('operatorInfo').textContent=!state.roster?'NO VERIFIED ROSTER':op?`${opProfile?pname(opProfile):s(op.displayName)||op.astronautId} — ONBOARD CONSOLE DUTY; EVA CONFLICT MUST BE ENFORCED IN MISSION CONTROL.`:'NO SINGLE DESIGNATED CONSOLE OPERATOR';
    const identity=read(K.identity),id=s(identity?.astronautId||raw(K.active)),own=state.profiles.get(id),isOperator=!!(op&&s(op.astronautId)===id&&identity?.astronautId===id);
    $('identityInfo').textContent=own?`${pname(own)} (${id})${identity?.astronautId===id?' · ROLE SELECTION RECORDED':' · IDENTITY NOT VERIFIED IN CHOOSE YOUR ROLE'}`:'NO VERIFIED BROWSER IDENTITY';
    $('permissionInfo').textContent='LOCKED — NO MEDICATION OR INFUSION ENABLED';
    $('permissionNotice').textContent=!state.roster?'No verified crew roster. All simulated operational controls remain restricted.':!op?'No console operator assigned. Designate one in Crew Assignment.':!isOperator?'You can review emergency information, but you are not the designated console operator. Medical action is locked.':'You are recorded as console operator, but clinical approval and hardware authorization are NOT implemented. Medical action is locked.';
  }
  function resetAlert(){state.activeAlert=false;$('acknowledge').disabled=true;$('workflow').textContent='No demo alert active. No medical action enabled.'}
  $('startReview').addEventListener('click',()=>{if($('alertType').value==='none'){$('workflow').textContent='Select a training scenario first.';return}if(!state.roster||!state.selected){$('workflow').textContent='BLOCKED: no verified active mission roster or selected crew member.';return}state.activeAlert=true;$('acknowledge').disabled=false;const p=state.profiles.get(state.selected);$('workflow').textContent=`TRAINING ALERT · ${p?pname(p):state.selected}\n1. Synthetic alert is visible to the crew.\n2. Designated console operator is notified for assessment.\n3. Human clinical review would be required in any real system.\n4. No treatment, dosage, infusion or patch command is available.`;});
  $('acknowledge').addEventListener('click',()=>{if(!state.activeAlert)return;const identity=read(K.identity);const op=state.operator;const isOperator=op&&s(identity?.astronautId)===s(op.astronautId)&&s(raw(K.active))===s(op.astronautId);$('workflow').textContent=isOperator?'DEMO ACKNOWLEDGED by designated onboard operator. Simulated escalation logged in this page only. No clinical approval or medication delivery granted.':'REVIEW-ONLY ACCESS. You are not the confirmed designated console operator. You may view the alert but cannot acknowledge it as the operator. No medication action is enabled.';});
  $('resetReview').addEventListener('click',()=>{$('alertType').value='none';resetAlert()});
  $('refresh').addEventListener('click',()=>{resetAlert();missionLoad()});
  window.addEventListener('storage',e=>{if(e.key&&(['vitals.astronauts.v1','vitals.mission.active.v1','vitals.mission.crew.v1','vitals.activeAstronautId.v1','vitals.session.identity.v1'].includes(e.key)||e.key.startsWith('vitals.mission.crew.v1.'))){resetAlert();missionLoad()}});
  for(const [name,purpose,note] of research){const a=node('article');a.append(node('h3','',name),node('p','',purpose),node('p','fine',note),node('span','chip warning','REQUIRES CLINICAL / ENGINEERING REVIEW'));$('drugGrid').append(a)}
  missionLoad();
})();
