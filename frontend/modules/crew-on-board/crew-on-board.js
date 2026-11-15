"use strict";
/* V.I.T.A.L.S. Crew On Board v1 - reads local profile and saved mission roster; no writes. */
(() => {
  const KEYS={profiles:'vitals.astronauts.v1',active:'vitals.mission.active.v1',missions:'vitals.mission.configurations.v1',destination:'vitals.mission.destination.v1',roster:'vitals.mission.crew.v1'};
  const $=id=>document.getElementById(id);
  const text=v=>(typeof v==='string'||typeof v==='number')?String(v).trim():'';
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const json=k=>{try{return JSON.parse(get(k)||'null')}catch{return null}};
  const normDest=d=>text(d).toLowerCase()==='earth-remote'?'earth':text(d).toLowerCase();
  const recordList=d=>Array.isArray(d)?d:Array.isArray(d?.astronauts)?d.astronauts:Array.isArray(d?.profiles)?d.profiles:[];
  let all=[],assigned=[],active=null,current=null,notice='';
  function portrait(p){
    let file=text(p.avatarFile||p.avatar||p.image||p.portrait);
    const index=Number(p.avatarIndex??p.avatar_index??p.avatarNumber??p.avatar_number);
    if(!/^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(file)&&Number.isInteger(index)&&index>=1&&index<=28)
      file=`av${index}${[1,20,28].includes(index)?'.png':'.webp'}`;
    return /^av(?:[1-9]|1\d|2[0-8])\.(png|webp)$/i.test(file)?`../../../assets/astronaut-profile/portraits/${file}`:'';
  }
  function normalizedProfile(p){
    if(!p||typeof p!=='object')return null;
    const id=text(p.astronautId||p.id||p.profileId),name=text(p.fullName||p.name||p.displayName||[p.firstName,p.lastName].filter(Boolean).join(' '));
    return id&&name?{id,name,portrait:portrait(p),default:!!(p.isDefault||p.protected),age:text(p.age),nationality:text(p.nationality)}:null;
  }
  function card(p,assignment,availableSection=false){
    const item=document.createElement('article');item.className='person'+(assignment?' assigned':'');
    if(p.portrait){const img=document.createElement('img');img.className='portrait';img.alt=`Avatar of ${p.name}`;img.loading='lazy';img.src=p.portrait;img.onerror=()=>{const v=document.createElement('div');v.className='portrait fallback';v.textContent='✧';img.replaceWith(v)};item.append(img)}
    else{const fallback=document.createElement('div');fallback.className='portrait fallback';fallback.textContent='✧';item.append(fallback)}
    const content=document.createElement('div');content.className='person-content';item.append(content);
    const title=document.createElement('h3');title.textContent=p.name;content.append(title);
    const id=document.createElement('div');id.className='id';id.textContent=`ID: ${p.id}`;content.append(id);
    const flags=document.createElement('div');flags.className='flags';content.append(flags);
    const flag=(label,cls='')=>{const s=document.createElement('span');s.className=`flag ${cls}`;s.textContent=label;flags.append(s)};
    if(p.default)flag('PROTECTED DEFAULT');
    if(assignment){flag('ASSIGNED TO MISSION','cyan');if(assignment.consoleOperator)flag('CONSOLE OPERATOR','alert');}
    else if(availableSection)flag('NOT ASSIGNED');
    if(assignment){const detail=document.createElement('div');detail.className='detail';detail.textContent=`MISSION ROLE: ${text(assignment.roleName||assignment.role)||'Not specified'}`;content.append(detail)}
    else {const detail=document.createElement('div');detail.className='detail';detail.textContent='MISSION ROLE: NOT ASSIGNED';content.append(detail)}
    return item;
  }
  function empty(container,msg){const div=document.createElement('div');div.className='empty';div.textContent=msg;container.append(div)}
  function load(){
    const profiles=recordList(json(KEYS.profiles));const map=new Map();
    for(const raw of profiles){const p=normalizedProfile(raw);if(p&&!map.has(p.id))map.set(p.id,p)}
    all=[...map.values()].sort((a,b)=>Number(b.default)-Number(a.default)||a.name.localeCompare(b.name));
    active=json(KEYS.active);
    const knownMissions=json(KEYS.missions);
    if(active?.id&&Array.isArray(knownMissions)){
      const same=knownMissions.find(m=>m?.id===active.id);
      if(same)active=same;
    }
    const dest=normDest(active?.destination||get(KEYS.destination));
    const specific=dest?json(`${KEYS.roster}.${dest}`):null;
    const generic=json(KEYS.roster);
    const candidates=[specific,generic].filter(r=>r&&Array.isArray(r.members));
    // Match by mission identity if possible. An unscoped generic roster is not assumed to belong to the active mission.
    const matches=r=>normDest(r.destination)===dest&&(!active?.name||text(r.missionName)===text(active.name));
    current=candidates.find(matches)||null;
    assigned=current?current.members.filter(x=>x&&text(x.astronautId)):[];
    if(active&&!current)notice='No saved Crew Assignment roster matches this active mission. No crew is inferred or invented.';
    else if(!active&&current)notice='No active mission selected. Showing a destination roster only.';
    else if(!active)notice='Select a mission in Mission Configuration, then save its crew in Crew Assignment.';
    else notice='Crew loaded from a saved mission roster. This page is read-only.';
    render();
  }
  function render(){
    const destination=normDest(active?.destination||get(KEYS.destination));
    $('missionName').textContent=active?`${text(active.id)} — ${text(active.name)}`:'NO ACTIVE MISSION';
    $('missionDetails').textContent=active?`${destination.toUpperCase()}${active.region?' / '+text(active.region).toUpperCase():''} · ${text(active.durationDays)||'—'} DAYS · ${text(active.status||'planned').toUpperCase()}`:'Choose a mission from Mission Configuration.';
    $('rosterCount').textContent=String(assigned.length);
    const capacity=Number(active?.crewCapacity);
    $('capacity').textContent=Number.isInteger(capacity)&&capacity>0?`CAPACITY ${capacity}`:'CAPACITY NOT SET';
    $('notice').textContent=notice;
    $('assignedCount').textContent=String(assigned.length);
    $('allCount').textContent=String(all.length);
    const assignedRoot=$('assignedCrew');assignedRoot.replaceChildren();
    const assignedMap=new Map(assigned.map(p=>[text(p.astronautId),p]));
    for(const entry of assigned){const id=text(entry.astronautId);const p=all.find(a=>a.id===id)||{id,name:text(entry.displayName)||'Profile not found',portrait:'',default:false};assignedRoot.append(card(p,entry))}
    if(!assigned.length)empty(assignedRoot,'No crew is saved for this active mission. Assign and save members in Crew Assignment.');
    const allRoot=$('allCrew');allRoot.replaceChildren();const q=$('search').value.trim().toLowerCase();
    const visible=all.filter(p=>p.id.toLowerCase().includes(q)||p.name.toLowerCase().includes(q));
    for(const p of visible)allRoot.append(card(p,assignedMap.get(p.id),true));
    if(!visible.length)empty(allRoot,all.length?'No profiles match your search.':'No saved astronaut profiles were found in this browser.');
  }
  $('refresh').addEventListener('click',load);
  $('search').addEventListener('input',render);
  window.addEventListener('storage',event=>{if(Object.values(KEYS).some(k=>event.key===k||event.key?.startsWith(k+'.')))load()});
  window.addEventListener('pageshow',load);
  load();
})();
