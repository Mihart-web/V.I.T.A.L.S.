/* V.I.T.A.L.S. Mission Configuration v1 - independent from legacy projects. */
(() => {
  'use strict';
  const STORE = 'vitals.mission.configurations.v1';
  const ACTIVE = 'vitals.mission.active.v1';
  const DEST = 'vitals.mission.destination.v1';
  const ROSTER = 'vitals.mission.crew.v1';
  const $ = id => document.getElementById(id);
  const form = $('missionForm');
  const status = $('feedback');
  const destinationIds = {earth:'001',moon:'002',mars:'003',titan:'004',europa:'005'};
  const regions = {earth:[['','Region not selected'],['south-pole','South Pole / Antarctica'],['hot-desert','Hot Desert'],['earthquake-zone','Earthquake Zone'],['tsunami-coast','Tsunami Coast'],['volcanic-region','Volcanic Region'],['floodplain','Floodplain']]};
  const gravity = {earth:9.81,moon:1.62,mars:3.71,titan:1.35,europa:1.31};
  const atmos = {earth:'earth-air',moon:'vacuum',mars:'thin-co2',titan:'nitrogen-methane',europa:'vacuum'};
  const radiation = {earth:'terrestrial',moon:'lunar',mars:'martian',titan:'unknown',europa:'jovian'};
  const PROTECTED_IDS = new Set(['LUNAR-01','MARS-01','EARTH-SP-01']);
  const defaults = [
    {id:'LUNAR-01',name:'Lunar Surface Research',destination:'moon',region:'',missionType:'surface-exploration',status:'planned',startDate:'2026-11-16',durationDays:14,crewCapacity:4,communication:'delayed',habitat:'Lunar Surface Habitat (simulation)',operationalMode:'simulated',objectives:'Evaluate lunar EVA operations, environmental hazards and crew health indicators.',evaPlanned:true,evaSessions:6,evaMinutes:120,notes:'Demo mission. No live astronaut telemetry.',gravity:1.62,atmosphere:'vacuum',radiation:'lunar',weather:'Lunar surface: site and illumination dependent',evacuation:'not-available',medicalAutonomy:'high-autonomy',hazards:'Vacuum, dust, radiation, reduced gravity and thermal extremes',operatorId:''},
    {id:'MARS-01',name:'Mars Surface Exploration',destination:'mars',region:'',missionType:'surface-exploration',status:'planned',startDate:'2026-11-16',durationDays:30,crewCapacity:5,communication:'delayed',habitat:'Mars Habitat (simulation)',operationalMode:'simulated',objectives:'Study operational autonomy, Mars surface EVA and longitudinal crew health.',evaPlanned:true,evaSessions:8,evaMinutes:150,notes:'Demo mission; references are not local forecasts.',gravity:3.71,atmosphere:'thin-co2',radiation:'martian',weather:'Cold desert; local conditions and dust vary',evacuation:'not-available',medicalAutonomy:'high-autonomy',hazards:'Low pressure, dust, radiation, temperature extremes and reduced gravity',operatorId:''},
    {id:'EARTH-SP-01',name:'Antarctic Isolation Research',destination:'earth',region:'south-pole',missionType:'analog',status:'planned',startDate:'2026-11-16',durationDays:21,crewCapacity:4,communication:'intermittent',habitat:'Polar Research Station (simulation)',operationalMode:'simulated',objectives:'Monitor cold exposure, isolation, fatigue, sleep and emergency-response readiness.',evaPlanned:true,evaSessions:4,evaMinutes:60,notes:'South Pole analog scenario; external conditions vary.',gravity:9.81,atmosphere:'earth-air',radiation:'terrestrial',weather:'Extreme polar cold; reference climate not a live forecast',evacuation:'restricted',medicalAutonomy:'crew-supported',hazards:'Cold injury, high-altitude stress, polar isolation and limited evacuation',operatorId:''}
  ];
  const parse = key => {try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
  const write = (key,value) => {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const clean = v => String(v??'').trim();
  let missions = [];
  let selectedId = '';
  const show = (message, error=false) => {status.textContent=message;status.classList.toggle('error',error);};
  function isProtected(id){return PROTECTED_IDS.has(clean(id));}
  function canonicalDefault(id){const base=defaults.find(m=>m.id===id);return base?{...base,seed:true,protected:true,schema:'vitals.mission.config.v1'}:null;}
  function loadStore(){
    const existing=parse(STORE);
    // Always recover original immutable presets from code, even if browser storage
    // contains older edited presets or the user deleted them in v1.
    const custom=Array.isArray(existing)?existing.filter(x=>x&&typeof x.id==='string'&&!isProtected(x.id)):[];
    missions=[...defaults.map(x=>canonicalDefault(x.id)),...custom];
    if(!write(STORE,missions))show('Browser storage is unavailable. Changes cannot persist.',true);
    // Discard old edited active snapshot for a protected default, if present.
    const active=parse(ACTIVE);
    if(active&&isProtected(active.id))write(ACTIVE,canonicalDefault(active.id));
  }
  function setReadonly(locked){
    form.querySelectorAll('input,select,textarea').forEach(el=>{el.disabled=locked;});
    const submit=form.querySelector('button[type="submit"]');
    if(submit){submit.disabled=locked;submit.textContent=locked?'LOCKED PRESET - READ ONLY':'SAVE MISSION CONFIGURATION';}
    form.classList.toggle('preset-locked',locked);
  }
  function activateDefault(id){
    if(!isProtected(id))return;
    const m=canonicalDefault(id);
    // Active selection is allowed; the canonical preset itself stays immutable.
    if(!write(ACTIVE,m)){show('Could not activate mission: browser storage unavailable.',true);return;}
    try{localStorage.setItem(DEST,m.destination);}catch{show('Destination storage is unavailable.',true);return;}
    openMission(id);
    show(`${id} activated (read-only preset). Crew Assignment can now use this mission.`);
  }
  function activeRoster(){
    const roster=parse(ROSTER);
    const mission=missions.find(m=>m.id===selectedId);
    if (!roster||!Array.isArray(roster.members)||!mission) return [];
    // Crew Assignment v1 stores only one roster. Never attach a different mission's crew.
    if(clean(roster.missionName)!==clean(mission.name)||clean(roster.destination)!==clean(mission.destination))return [];
    return roster.members.filter(m=>m&&clean(m.astronautId));
  }
  function updateRegion(value){
    const sel=form.elements.namedItem('region');
    const list=regions[value]||[['','Planetary / unspecified site']];
    sel.replaceChildren(...list.map(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;return o;}));
  }
  function renderRoster(){
    const roster=activeRoster();
    const cap=Number(form.elements.namedItem('crewCapacity').value)||0;
    $('crewCounter').textContent=`${roster.length} / ${cap}`;
    $('missionStatus').textContent=clean(form.elements.namedItem('status').value).toUpperCase().replaceAll('-',' ');
    const sel=$('operatorSelect');const selected=sel.value||clean(form.elements.namedItem('operatorId').value);
    sel.replaceChildren();
    const def=document.createElement('option');def.value='';def.textContent='Select an assigned crew member';sel.append(def);
    for(const member of roster){const o=document.createElement('option');o.value=member.astronautId;o.textContent=clean(member.displayName)||member.astronautId;sel.append(o);}
    sel.value=roster.some(m=>m.astronautId===selected)?selected:'';
    const operator=roster.find(m=>m.astronautId===sel.value);
    $('operatorInfo').textContent=operator ? `${clean(operator.displayName)||operator.astronautId} is designated as console operator. EVA participation is incompatible with console duty; enforcement in the EVA scheduler is pending.` : 'Crew selection is read from a matching saved Crew Assignment roster. Medication control requires separate human authorization.';
  }
  function renderList(){
    const list=$('missionList');list.replaceChildren();
    for(const m of missions){
      const locked=isProtected(m.id);
      const item=document.createElement('div');item.className='mission-item'+(m.id===selectedId?' selected':'');
      const info=document.createElement('div');const strong=document.createElement('span');strong.className='mission-name';strong.textContent=`${m.id} — ${m.name}`;
      const meta=document.createElement('small');meta.className='mission-meta';meta.textContent=`${m.destination.toUpperCase()}${m.region?' / '+m.region.toUpperCase():''} · ${m.durationDays} DAYS · ${String(m.status||'planned').toUpperCase()}${locked?' · PROTECTED PRESET':''}`;info.append(strong,meta);
      const buttons=document.createElement('div');buttons.className='buttons';
      const open=document.createElement('button');open.type='button';open.textContent=locked?'VIEW (LOCKED)':'OPEN / EDIT';open.addEventListener('click',()=>openMission(m.id));buttons.append(open);
      if(locked){
        const activate=document.createElement('button');activate.type='button';activate.textContent='USE MISSION';activate.addEventListener('click',()=>activateDefault(m.id));buttons.append(activate);
      }else{
        const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='DELETE';del.addEventListener('click',()=>deleteMission(m.id));buttons.append(del);
      }
      item.append(info,buttons);list.append(item);
    }
  }
  function openMission(id){
    const m=missions.find(x=>x.id===id);if(!m)return;
    setReadonly(false);
    selectedId=id;
    for(const [key,val] of Object.entries(m)){
      const field=form.elements.namedItem(key);if(!field||key==='region'||key==='operatorId')continue;
      if(field.type==='checkbox')field.checked=Boolean(val);else field.value=String(val??'');
    }
    updateRegion(m.destination);form.elements.namedItem('region').value=m.region||'';
    renderRoster();$('operatorSelect').value=activeRoster().some(x=>x.astronautId===m.operatorId)?m.operatorId:'';
    renderRoster();setReadonly(isProtected(id));renderList();
    show(isProtected(id)?`${id} is a protected demonstration mission. All parameters are read-only. Use USE MISSION to activate it.`:`Editing ${m.id}. Save to activate this mission.`);
  }
  function deleteMission(id){
    if(isProtected(id)){show(`${id} is protected and cannot be deleted.`,true);return;}
    if(!confirm(`Delete mission ${id}? This does not delete astronaut profiles or crew rosters.`))return;
    const remaining=missions.filter(m=>m.id!==id);
    if(!write(STORE,remaining)){show('Storage failed. Mission was not deleted.',true);return;}
    missions=remaining;if(selectedId===id){selectedId='';form.reset();updateRegion('earth');renderRoster();setReadonly(false);}
    renderList();show(`${id} deleted from local configurations.`);
  }
  function newMission(){
    setReadonly(false);selectedId='';form.reset();form.elements.namedItem('id').value='';form.elements.namedItem('name').value='';
    form.elements.namedItem('startDate').value=new Date().toISOString().slice(0,10);
    form.elements.namedItem('durationDays').value=7;form.elements.namedItem('crewCapacity').value=4;
    form.elements.namedItem('destination').value=clean(localStorage.getItem(DEST)) in destinationIds?clean(localStorage.getItem(DEST)):'earth';
    const d=form.elements.namedItem('destination').value;updateRegion(d);form.elements.namedItem('gravity').value=gravity[d];form.elements.namedItem('atmosphere').value=atmos[d];form.elements.namedItem('radiation').value=radiation[d];
    form.elements.namedItem('evaSessions').value=0;form.elements.namedItem('evaMinutes').value=0;
    renderRoster();renderList();show('New mission. Enter a unique Mission ID, then save.');
  }
  function dataFromForm(){
    const m={};for(const [key,val] of new FormData(form).entries())m[key]=typeof val==='string'?val.trim():val;
    m.evaPlanned=form.elements.namedItem('evaPlanned').checked;
    for(const key of ['durationDays','crewCapacity','evaSessions','evaMinutes','gravity'])m[key]=Number(m[key]||0);
    m.region=m.destination==='earth'?(m.region||''):'';
    m.operatorId=$('operatorSelect').value;
    m.destinationId=destinationIds[m.destination];m.schema='vitals.mission.config.v1';m.updatedAt=new Date().toISOString();
    m.exposureModel={status:'reference-only',individualForecastValidated:false,scenario:{gravity:m.gravity,atmosphere:m.atmosphere,radiation:m.radiation,weather:m.weather,hazards:m.hazards},dependencies:{environment:'future-module',medical:'future-module',crewProfiles:'existing-astronaut-profiles'}};
    m.medicationControl={consoleOperatorId:m.operatorId||null,requiresHumanAuthorization:true,authorizationGranted:false,automatedDrugDelivery:false};
    return m;
  }
  function save(event){
    event.preventDefault();const m=dataFromForm();
    if(isProtected(selectedId)||isProtected(m.id)){show('Protected preset: editing and saving are not permitted.',true);return;}
    if(!form.reportValidity()){show('Complete the required fields.',true);return;}
    if(!/^[A-Za-z0-9_-]+$/.test(m.id)){show('Mission ID may contain letters, digits, hyphens and underscores only.',true);return;}
    if(!m.destinationId){show('Invalid destination.',true);return;}
    if(m.destination==='earth'&&!m.region){show('Choose an Earth region before saving.',true);return;}
    if(!Number.isInteger(m.crewCapacity)||m.crewCapacity<1||m.crewCapacity>30){show('Crew Capacity must be between 1 and 30.',true);return;}
    if(m.evaPlanned&&(!m.evaSessions||!m.evaMinutes)){show('Planned EVA requires positive session count and duration.',true);return;}
    const existing=missions.find(x=>x.id===selectedId);
    if(existing&&isProtected(existing.id)){show('Protected preset: changes blocked.',true);return;}
    if(missions.some(x=>x.id===m.id&&x.id!==selectedId)){show('Mission ID already exists. Choose another.',true);return;}
    // Do not allow silently renaming/deleting the mission referenced by an existing roster.
    const roster=activeRoster();
    if(roster.length>m.crewCapacity){show(`Cannot save: ${roster.length} astronauts are assigned, but crew capacity is ${m.crewCapacity}.`,true);return;}
    if(m.operatorId&&!roster.some(x=>x.astronautId===m.operatorId)){show('Operator must be a saved assigned crew member.',true);return;}
    if(existing&&(existing.id!==m.id||existing.name!==m.name||existing.destination!==m.destination)&&roster.length){show('This mission has a saved crew roster. Do not change ID, name or destination until crew migration is implemented.',true);return;}
    m.createdAt=existing?.createdAt||m.updatedAt;m.seed=Boolean(existing?.seed);
    const next=missions.filter(x=>x.id!==selectedId);next.push(m);
    try{
      localStorage.setItem(STORE,JSON.stringify(next));
      // Existing Crew Assignment reads active mission.name; keep that shape intact.
      localStorage.setItem(ACTIVE,JSON.stringify(m));
      localStorage.setItem(DEST,m.destination);
    }catch{show('Browser storage failure. Save was not completed; verify storage availability.',true);return;}
    missions=next;selectedId=m.id;renderList();renderRoster();show(`${m.id} SAVED AND ACTIVE · ${m.destination.toUpperCase()} (${m.destinationId}). Crew limit ${m.crewCapacity}.`);
  }
  form.elements.namedItem('destination').addEventListener('change',event=>{
    const d=event.target.value;updateRegion(d);form.elements.namedItem('gravity').value=gravity[d];form.elements.namedItem('atmosphere').value=atmos[d];form.elements.namedItem('radiation').value=radiation[d];
  });
  form.elements.namedItem('crewCapacity').addEventListener('input',renderRoster);
  form.elements.namedItem('status').addEventListener('change',renderRoster);
  $('operatorSelect').addEventListener('change',renderRoster);
  $('newMission').addEventListener('click',newMission);
  form.addEventListener('submit',save);
  loadStore();const active=parse(ACTIVE);
  if(missions.length)openMission(missions.some(x=>x.id===active?.id)?active.id:missions[0].id);else newMission();
})();
