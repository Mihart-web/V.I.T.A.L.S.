"use strict";
/* V.I.T.A.L.S. IDENTITY ROLE FLOW V2 - local demonstration; not authentication */
(() => {
 const KEY='vitals.session.identity.v1', ACTIVE='vitals.activeAstronautId.v1';
 const PROFILES='vitals.astronauts.v1', ACTIVE_MISSION='vitals.mission.active.v1', ROSTER='vitals.mission.crew.v1', DEST='vitals.mission.destination.v1';
 const $=id=>document.getElementById(id), val=v=>(typeof v==='string'||typeof v==='number')?String(v).trim():'';
 const raw=k=>{try{return localStorage.getItem(k)}catch{return null}};
 const read=k=>{try{return JSON.parse(raw(k)||'null')}catch{return null}};
 const roles=[
 ['commander','Commander','Mission command and coordination','flight','♛'],['pilot','Pilot','Navigation and spacecraft maneuvers','flight','✈'],['flight-engineer','Flight Engineer','Spacecraft systems and maintenance','flight','⚙'],['mission-specialist','Mission Specialist','Mission tasks and experiments','flight','✦'],['payload-specialist','Payload Specialist','Payload and instrument operations','flight','▣'],['eva-specialist','EVA Specialist','Extravehicular operations','flight','◎'],
 ['medical-officer','Crew Medical Officer','Onboard medical support','medical','✚'],['flight-surgeon','Flight Surgeon','Ground medical oversight','medical','♡'],['biomedical-specialist','Biomedical Specialist','Physiological monitoring','medical','◇'],['behavioral-health-specialist','Behavioral Health Specialist','Psychological support','medical','☼'],['exercise-rehabilitation-specialist','Exercise & Rehabilitation Specialist','Recovery and countermeasures','medical','↗'],['nutrition-specialist','Nutrition Specialist','Nutrition and metabolism','medical','◐'],
 ['science-officer','Science Officer','Research coordination','science','✧'],['robotics-specialist','Robotics Specialist','Robotics and rovers','science','⬡'],['environmental-systems-specialist','Environmental Systems Specialist','Life-support and habitat environment','science','◉'],['crew-member','Crew Member','Personal mission and health workspace','science','♙']
 ].map(([id,name,description,category,icon])=>({id,name,description,category,icon}));

 let profiles=[],identity=null,pendingId='',selectedRole='',category='flight',assignment=null,mission=null,notice='';
 const medicalRoles=new Set(['medical-officer','flight-surgeon']);
 const roleLocked=()=>!!(identity?.roleId&&identity?.roleConfirmedAt&&identity?.roleLocked!==false);
 function appendInfo(message){const e=$('roleMessage');if(e)e.textContent=message;}
 function getMissionRoster(){
   const m=read(ACTIVE_MISSION);if(!m?.id||!m?.name)return null;
   const dest=normDest(m.destination||raw(DEST));
   const matches=x=>x&&Array.isArray(x.members)&&normDest(x.destination)===dest&&val(x.missionName)===val(m.name);
   const saved=[read(`${ROSTER}.${dest}`),read(ROSTER)].find(matches);
   return {mission:m,dest,record:saved};
 }
 function rosterCapacity(m){
   const rawLimit=m.crewCapacity??m.crewSize??m.maxCrew??m.crewCount??m.numberOfCrew??m.crew?.capacity;
   const n=Number(rawLimit);return Number.isSafeInteger(n)&&n>0&&n<=100?n:null;
 }
 function isMissionRunning(m){
   const run=read('vitals.mission.runState.v1.'+encodeURIComponent(m.id));
   return !!(run&&run.missionId===m.id&&['RUNNING','PAUSED'].includes(run.phase));
 }
 function saveRoleToCrew(profile,role){
   const ctx=getMissionRoster();if(!ctx)return {ok:true,message:'ROLE LOCKED. No active mission: crew assignment deferred.'};
   if(isMissionRunning(ctx.mission))return {ok:false,message:'MISSION RUNNING OR PAUSED: roster changes blocked. End the mission before assigning a new member.'};
   const list=ctx.record?ctx.record.members.map(m=>({...m})):[];
   const existing=list.findIndex(m=>val(m.astronautId)===profile.id);
   if(existing<0){
     const cap=rosterCapacity(ctx.mission);
     if(cap!==null&&list.length>=cap){
       const last=list[list.length-1];
       if(last.consoleOperator||last.evaActive||last.onEVA||last.evaStatus==='ACTIVE'||last.status==='EVA')return {ok:false,message:'CREW FULL: last member is on console/EVA duty. No automatic replacement made.'};
       if(!window.confirm(`CREW FULL (${cap}). Replace last member ${val(last.displayName)||val(last.astronautId)} with ${profile.name}? This action changes the saved roster.`))return {ok:false,message:'CREW REPLACEMENT CANCELLED. No roster changes saved.'};
       list.pop();
     }
   }
   const member={astronautId:profile.id,displayName:profile.name,role:role.id,roleName:role.name,roleIcon:role.icon,consoleOperator:existing>=0?!!list[existing]?.consoleOperator:false};
   if(existing>=0)list[existing]={...list[existing],...member};else list.push(member);
   const members=list.map((m,i)=>({...m,position:i+1}));
   const record={...(ctx.record||{}),schema:'vitals.mission.crew.v1',destination:ctx.dest,missionName:ctx.mission.name,status:'planned',missionId:ctx.mission.id,savedAt:new Date().toISOString(),members,clinicalApproval:{granted:false,requiresVerifiedHumanAuthorization:true}};
   const keys=[`${ROSTER}.${ctx.dest}`,ROSTER];
   const prior=keys.map(k=>raw(k));
   try{
     keys.forEach(k=>localStorage.setItem(k,JSON.stringify(record)));
   }catch{
     keys.forEach((k,i)=>{try{if(prior[i]===null)localStorage.removeItem(k);else localStorage.setItem(k,prior[i]);}catch{}});
     return {ok:false,message:'CREW STORAGE FAILED. Verify roster before continuing.'};
   }
   window.dispatchEvent(new CustomEvent('vitals:crew-updated',{detail:record}));
   return {ok:true,message:existing>=0?'ROLE LOCKED — existing crew membership updated.':'ROLE LOCKED — astronaut added to saved mission crew.'};
 }
 function renderRoleMatrix(){
   const box=$('rolePermissionMatrix');if(!box)return;box.replaceChildren();
   for(const r of roles){const line=document.createElement('div');line.className='role-matrix-line';
     const heading=document.createElement('strong');heading.textContent=r.name;
     const detail=document.createElement('span');detail.textContent=medicalRoles.has(r.id)?'Medical console preferred · clinical qualification must be verified · NO drug authorization':'Mission operations by assignment · no medication or infusion authorization';
     line.append(heading,detail);box.append(line);
   }
 }

 function portrait(p){let file=val(p.avatarFile||p.avatar||p.image);const n=Number(p.avatarIndex);if(!/^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(file)&&Number.isInteger(n)&&n>=1&&n<=28)file=`av${n}${[1,20,28].includes(n)?'.png':'.webp'}`;return /^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(file)?`../../../assets/astronaut-profile/portraits/${file}`:'';}
 function loadProfiles(){const list=read(PROFILES),seen=new Set();profiles=(Array.isArray(list)?list:[]).map(p=>p&&typeof p==='object'?{id:val(p.astronautId||p.id),name:val(p.fullName||p.name),portrait:portrait(p),protected:!!(p.protected||p.isDefault)}:null).filter(p=>{if(!p?.id||!p.name||seen.has(p.id))return false;seen.add(p.id);return true;});profiles.sort((a,b)=>Number(b.protected)-Number(a.protected)||a.name.localeCompare(b.name));}
 const normDest=d=>val(d).toLowerCase()==='earth-remote'?'earth':val(d).toLowerCase();
 function loadMembership(id){mission=read(ACTIVE_MISSION);assignment=null;notice='';if(!id)return;
  if(!mission?.id||!mission?.name){notice='NO ACTIVE MISSION. Your personal identity is valid, but mission operations are unavailable.';return;}
  const dest=normDest(mission.destination||raw(DEST));const roster=[read(`${ROSTER}.${dest}`),read(ROSTER)].find(r=>r&&Array.isArray(r.members)&&normDest(r.destination)===dest&&val(r.missionName)===val(mission.name));
  if(!roster){notice='No saved crew roster matches the active mission. Mission operations are restricted.';return;}
  assignment=roster.members.find(m=>val(m?.astronautId)===id)||null;
  notice=assignment?`ASSIGNED TO ${mission.name}. Mission role: ${val(assignment.roleName||assignment.role)||'unspecified'}.${assignment.consoleOperator?' Console operator must remain onboard.':''}`:'NOT ASSIGNED TO THE ACTIVE MISSION. You may view your personal workspace, but you cannot carry out mission operations.';
 }
 function saveIdentity(next){try{localStorage.setItem(KEY,JSON.stringify(next));localStorage.setItem(ACTIVE,next.astronautId);return true}catch{return false}}
 function loadState(){loadProfiles();const saved=read(KEY);pendingId=val(raw(ACTIVE));identity=saved&&profiles.some(p=>p.id===saved.astronautId)&&saved.astronautId===pendingId?saved:null;selectedRole=identity&&roles.some(r=>r.id===identity.roleId)?identity.roleId:'';render();}
 function roleMatchesRoster(){if(!assignment||!identity?.roleId)return false;const role=roles.find(r=>r.id===identity.roleId);return val(assignment.role).toLowerCase()===identity.roleId||val(assignment.roleName).toLowerCase()===role?.name.toLowerCase();}
 function permission(label,allowed,description){const d=document.createElement('div');d.className='permission'+(allowed?'':' locked');const strong=document.createElement('strong');strong.textContent=(allowed?'AVAILABLE — ':'RESTRICTED — ')+label;const sub=document.createElement('small');sub.textContent=description;d.append(strong,sub);$('permissions').append(d)}
 function renderPermissions(){const box=$('permissions');box.replaceChildren();const confirmed=!!identity?.astronautId,assigned=confirmed&&!!assignment;permission('Personal health indicators and alerts',confirmed,'Read-only personal data and notifications; no clinical authorization.');permission('Mission crew views',assigned,'Only for crew recorded on this active mission.');permission('Operational role actions',assigned&&roleMatchesRoster(),'Chosen role must match Crew Assignment. Other modules must independently enforce permissions.');permission('Medication administration or infusion',false,'NOT ENABLED. Requires verified human clinical authorization and an audited clinical workflow.');permission('EVA eligibility',assigned&&!assignment?.consoleOperator,'Console operator remains onboard. EVA module must enforce this rule independently.');permission('Clinical decisions for other astronauts',false,'Not authorized from this browser role selector.');}
 function renderRoles(){const wrap=$('roles');wrap.replaceChildren();for(const r of roles.filter(r=>category==='all'||r.category===category)){const b=document.createElement('button');b.type='button';b.className='role'+(selectedRole===r.id?' selected':'');b.setAttribute('aria-pressed',String(selectedRole===r.id));const ico=document.createElement('span');ico.className='symbol';ico.textContent=r.icon;const t=document.createElement('span'),n=document.createElement('strong'),d=document.createElement('small');n.textContent=r.name;d.textContent=r.description;t.append(n,d);b.append(ico,t);b.disabled=roleLocked();b.onclick=()=>{if(roleLocked())return;selectedRole=r.id;render();};wrap.append(b);}}
 function render(){const p=profiles.find(p=>p.id===pendingId),confirmed=!!identity?.astronautId;loadMembership(confirmed?identity.astronautId:'');const preview=$('identityPreview');preview.replaceChildren();if(p){if(p.portrait){const img=document.createElement('img');img.src=p.portrait;img.alt=`Avatar of ${p.name}`;preview.append(img)}const detail=document.createElement('div');const name=document.createElement('strong');name.textContent=p.name;const code=document.createElement('small');code.textContent=`ID: ${p.id}`;detail.append(name,code);preview.append(detail)}else{const msg=document.createElement('p');msg.textContent='NO ASTRONAUT SELECTED. Open SELECT ASTRONAUT, choose a profile and press CONFIRM ASTRONAUT.';preview.append(msg)}
  $('currentIdentity').textContent=confirmed?`CONFIRMED IDENTITY: ${p?.name||identity.astronautId} — ${identity.astronautId}`:'IDENTITY NOT YET CONFIRMED FOR THIS ROLE SESSION';
  $('identityQuestion').textContent=!p?'Please select an astronaut before choosing a role.':confirmed?`Confirmed: ${p.name}. You can now choose your mission role.`:`ARE YOU SURE YOU ARE ${p.name.toUpperCase()}? Confirm your identity to proceed.`;
  $('identityQuestion').className='notice'+(confirmed?' good':'');$('confirmIdentity').hidden=confirmed;$('confirmIdentity').disabled=!p;
  $('rolePanel').hidden=!confirmed;
  const chosen=roles.find(r=>r.id===selectedRole),saved=roles.find(r=>r.id===identity?.roleId);
  $('roleCurrent').textContent=roleLocked()?`ROLE LOCKED: ${saved?.name||identity.roleId} — unlock to change`:chosen?`SELECTED ROLE: ${chosen.name}${saved?.id===chosen.id?' — CONFIRMED':''}`:'CHOOSE A ROLE BELOW';
  $('confirmRole').disabled=!confirmed||!chosen||roleLocked()||chosen.id===saved?.id;
  $('resetRole').textContent=roleLocked()?'UNLOCK ROLE':'CLEAR ROLE';
  $('roleLockNote').textContent=roleLocked()?'ROLE LOCKED. Only explicit unlocking allows a change. Mission permissions remain separately verified.':'Choose a role, then confirm and lock it.';
  renderRoles();renderRoleMatrix();
  $('missionInfo').textContent=`ACTIVE MISSION: ${mission?.id?`${mission.id} — ${mission.name}`:'NONE'}`;
  $('membership').textContent=confirmed?notice:'Confirm your astronaut identity to check mission membership.';$('membership').className='notice'+(assignment?' good':'');renderPermissions();
 }
 $('confirmIdentity').onclick=()=>{const p=profiles.find(p=>p.id===pendingId);if(!p)return;if(!window.confirm(`Are you sure you are ${p.name} (${p.id})? This identity will remain active until you explicitly change it.`))return;const previous=read(KEY);const same=previous?.astronautId===p.id;const next={schema:'vitals.session.identity.v1',astronautId:p.id,roleId:same?val(previous.roleId):'',roleConfirmedAt:same?previous.roleConfirmedAt:null,roleLocked:same?previous.roleLocked!==false:false,confirmedAt:new Date().toISOString(),missionId:val(read(ACTIVE_MISSION)?.id),roleAuthorization:'none',demoOnly:true};if(!saveIdentity(next)){$('identityMessage').textContent='COULD NOT SAVE IDENTITY. Check browser storage.';return;}identity=next;selectedRole=same?next.roleId:'';$('identityMessage').textContent=`IDENTITY CONFIRMED: ${p.name}. Choose your role below.`;render();};
 $('confirmRole').onclick=()=>{
   if(!identity?.astronautId||roleLocked()||!roles.some(r=>r.id===selectedRole))return;
   const p=profiles.find(x=>x.id===identity.astronautId),r=roles.find(x=>x.id===selectedRole);
   if(!p||!window.confirm(`Lock ${r.name} for ${p.name}? This is a demonstration role, not medical authorization.`))return;
   const next={...identity,roleId:r.id,roleLocked:true,roleConfirmedAt:new Date().toISOString(),missionId:val(read(ACTIVE_MISSION)?.id),roleAuthorization:'none'};
   if(!saveIdentity(next)){appendInfo('COULD NOT SAVE ROLE.');return;}
   identity=next;
   const result=saveRoleToCrew(p,r);
   appendInfo(result.message+(medicalRoles.has(r.id)?' Medical console preferred; drugs and infusion NOT authorized.':''));
   render();appendInfo(result.message+(medicalRoles.has(r.id)?' Medical console preferred; drugs and infusion NOT authorized.':''));
 };
 $('resetRole').onclick=()=>{
   if(!identity?.astronautId||!roleLocked())return;
   if(!window.confirm('UNLOCK this role? Existing crew duties are NOT automatically removed. Choose and confirm a replacement role to update them.'))return;
   const next={...identity,roleLocked:false,roleId:'',roleConfirmedAt:null,roleAuthorization:'none'};
   if(!saveIdentity(next))return;identity=next;selectedRole='';render();appendInfo('ROLE UNLOCKED. Crew roster unchanged until another role is confirmed.');
 };
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{category=b.dataset.category;document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===b));renderRoles();});$('allRoles').onclick=()=>{category='all';document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));renderRoles();};
 window.addEventListener('pageshow',loadState);window.addEventListener('storage',e=>{if([PROFILES,ACTIVE,ACTIVE_MISSION,ROSTER,KEY,DEST].some(k=>e.key===k||e.key?.startsWith(k+'.')))loadState();});loadState();
})();
