"use strict";
/* V.I.T.A.L.S. Life-Saving Pack V2: manual synthetic incidents; NO live sensors, treatment or medical commands. */
(() => {
  const byId = id => document.getElementById(id);
  const K = {mission:'vitals.mission.active.v1',roster:'vitals.mission.crew.v1',profiles:'vitals.astronauts.v1',identity:'vitals.session.identity.v1',active:'vitals.activeAstronautId.v1'};
  const str = v => v == null ? '' : String(v).trim();
  const destination = v => str(v).toLowerCase().replace(/-remote$/,'');
  const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const raw = k => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
  const create = (tag, cls, value) => { const n=document.createElement(tag); if(cls)n.className=cls; if(value !== undefined)n.textContent=str(value); return n; };
  const profileId = p => str(p?.astronautId || p?.id || p?.profileId);
  const nameOf = p => str(p?.fullName || p?.name || p?.displayName) || 'Unnamed astronaut';
  const scenarios = {
    respiratory:'Simulated respiratory concern', cardiac:'Simulated cardiovascular concern',
    glucose:'Simulated glucose concern', trauma:'Simulated injury concern',
    environmental:'Simulated environmental exposure concern', other:'Unspecified training incident'
  };
  const severities = {info:'Training observation', elevated:'Training priority', urgent:'Training urgent priority'};
  const state = {mission:null,roster:null,members:[],profiles:new Map(),operator:null,events:[],selected:'',key:'',warning:''};
  function eventKey(m){ return 'vitals.medical.lifeSavingPack.trainingEvents.v2.' + encodeURIComponent(str(m.id)); }
  function current(){
    const m=read(K.mission);
    state.mission=(m && !Array.isArray(m) && str(m.id) && str(m.name)) ? m : null;
    const list=read(K.profiles);state.profiles=new Map((Array.isArray(list)?list:[]).filter(p=>p&&profileId(p)).map(p=>[profileId(p),p]));
    const d=destination(state.mission?.destination);
    const candidates=[read(K.roster+'.'+d),read(K.roster)].filter(v=>v&&Array.isArray(v.members));
    state.roster=state.mission ? candidates.find(r=>destination(r.destination)===d && str(r.missionName)===str(state.mission.name))||null : null;
    state.members=state.roster ? state.roster.members.filter(r=>r&&str(r.astronautId)) : [];
    const ops=state.members.filter(x=>x.consoleOperator===true);
    state.operator=ops.length===1 ? ops[0] : null;
    state.warning=!state.mission?'No active mission.':!state.roster?'No verified crew roster for this mission.':ops.length!==1?'A single onboard console operator is not verified.':'';
    state.key=state.mission?eventKey(state.mission):'';
    const saved=state.key?read(state.key):null;
    state.events=Array.isArray(saved)?saved.filter(e=>e&&e.schema==='vitals.lsp.trainingEvent.v2'&&e.missionId===str(state.mission.id)).slice(-150):[];
    if(!state.members.some(x=>str(x.astronautId)===state.selected)) state.selected='';
    render();
  }
  function assigned(id){return state.members.some(m=>str(m.astronautId)===id);}
  function authenticatedOperator(){
    const identity=read(K.identity), active=raw(K.active);
    const id=str(state.operator?.astronautId);
    return !!(state.roster && state.operator && id && str(identity?.astronautId)===id && active===id &&
      str(identity?.missionId)===str(state.mission?.id) && identity?.confirmedAt &&
      state.members.some(m=>str(m.astronautId)===id));
  }
  function save(){
    if(!state.key) return false;
    try { localStorage.setItem(state.key,JSON.stringify(state.events.slice(-150))); return true; } catch {return false;}
  }
  function timeOf(iso){const date=new Date(iso);return Number.isFinite(date.getTime())?date.toLocaleString('en-GB'):'Unknown time';}
  function eventsFor(id){return state.events.filter(e=>e.astronautId===id);}
  function newestOpen(id){return [...eventsFor(id)].reverse().find(e=>e.status==='OPEN');}
  function render(){
    const status=byId('lspV2Mission');
    status.textContent=state.mission ? `MISSION ${state.mission.id} · ${state.mission.name} · ${state.members.length} verified members. ${state.warning}` : state.warning;
    status.classList.toggle('warn',!!state.warning);
    const list=byId('lspV2Crew');list.replaceChildren();
    for(const member of state.members){
      const id=str(member.astronautId), p=state.profiles.get(id), latest=newestOpen(id);
      const b=create('button','v2-person'+(state.selected===id?' selected':'')+(latest?' has-alert':''));b.type='button';
      b.append(create('strong','',p?nameOf(p):str(member.displayName)||id),create('small','',`ID: ${id}`),create('small','',str(member.roleName||member.role)||'Role not recorded'),create('span','v2-pill'+(latest?' v2-alert':''),latest?`${severities[latest.severity]} · OPEN`:'NO ACTIVE DEMO ALERT'));
      b.onclick=()=>{state.selected=id;render()};list.append(b);
    }
    if(!state.members.length)list.append(create('p','fine','No assigned crew available. Confirm Crew Assignment first.'));
    const select=byId('lspV2Astronaut'),old=select.value;select.replaceChildren();
    const empty=create('option','', 'Select an assigned astronaut...');empty.value='';select.append(empty);
    for(const member of state.members){const p=state.profiles.get(str(member.astronautId));const option=create('option','',`${p?nameOf(p):str(member.displayName)||member.astronautId} · ${member.astronautId}`);option.value=str(member.astronautId);select.append(option)}
    select.value=state.selected||'';if(select.value!==state.selected)select.value='';
    byId('lspV2NewAlert').disabled=!state.roster || !state.selected;
    const identity=read(K.identity),id=str(identity?.astronautId),op=state.operator;
    byId('lspV2Authority').textContent=!op?'No unique console operator assigned. Review-only mode.':authenticatedOperator()?`Operator identity confirmed (${id}). You may ACKNOWLEDGE or RESOLVE training events only. No clinical authorization or patch activation.`:`Console operator ${op.astronautId} is assigned. Your confirmed identity (${id||'none'}) cannot acknowledge events. All medical delivery remains locked.`;
    const eventsBox=byId('lspV2Events');eventsBox.replaceChildren();
    for(const e of [...state.events].reverse().slice(0,35)){
      const p=state.profiles.get(e.astronautId);const row=create('article','v2-event');
      const content=create('div');content.append(create('strong','',`${nameOf(p)||e.astronautId} · ${severities[e.severity]||'Training incident'}`),create('small','',`${scenarios[e.kind]||'Training incident'} · ${timeOf(e.createdAt)} · ${e.status}`));
      if(e.acknowledgedBy)content.append(create('small','',`Acknowledged by ${e.acknowledgedBy} · ${timeOf(e.acknowledgedAt)}`));
      if(e.closedBy)content.append(create('small','',`Resolved by ${e.closedBy} · ${timeOf(e.closedAt)}`));
      row.append(content);
      const actions=create('div','v2-event-actions');
      const b=create('button','','ACKNOWLEDGE');b.type='button';b.disabled=e.status!=='OPEN'||!authenticatedOperator();b.onclick=()=>update(e.id,'ACKNOWLEDGED');actions.append(b);
      const close=create('button','','RESOLVE TRAINING EVENT');close.type='button';close.disabled=e.status==='RESOLVED'||!authenticatedOperator();close.onclick=()=>update(e.id,'RESOLVED');actions.append(close);
      row.append(actions);eventsBox.append(row);
    }
    if(!state.events.length)eventsBox.append(create('p','fine','No simulated events recorded for this active mission. No live monitoring is connected.'));
    byId('lspV2Count').textContent=`${state.events.filter(e=>e.status!=='RESOLVED').length} unresolved demo events · ${state.events.length} recorded`;
  }
  function update(id,status){
    if(!authenticatedOperator()){byId('lspV2Feedback').textContent='RESTRICTED. Only the confirmed onboard console operator can update training events.';render();return;}
    const item=state.events.find(x=>x.id===id);if(!item||item.status==='RESOLVED'||(status==='ACKNOWLEDGED'&&item.status!=='OPEN'))return;
    if(!window.confirm(`${status==='RESOLVED'?'Resolve':'Acknowledge'} this TRAINING EVENT? This does not authorize treatment or delivery.`))return;
    const operatorId=str(state.operator.astronautId);
    if(status==='ACKNOWLEDGED'){item.status='ACKNOWLEDGED';item.acknowledgedBy=operatorId;item.acknowledgedAt=new Date().toISOString()}
    else{item.status='RESOLVED';item.closedBy=operatorId;item.closedAt=new Date().toISOString()}
    if(!save()){byId('lspV2Feedback').textContent='Cannot save training event. Storage unavailable; change not persisted.';current();return;}
    byId('lspV2Feedback').textContent=`${status} · TRAINING RECORD ONLY · NO MEDICATION COMMAND.`;render();
  }
  byId('lspV2Astronaut').addEventListener('change',e=>{state.selected=assigned(e.target.value)?e.target.value:'';render()});
  byId('lspV2NewAlert').addEventListener('click',()=>{
    const astronautId=state.selected,kind=byId('lspV2Kind').value,severity=byId('lspV2Severity').value;
    if(!state.mission||!state.roster||!assigned(astronautId)||!Object.hasOwn(scenarios,kind)||!Object.hasOwn(severities,severity)){
      byId('lspV2Feedback').textContent='Choose an assigned astronaut and a valid training scenario.';return;
    }
    if(!window.confirm(`Create a SYNTHETIC ${severities[severity]} event for ${astronautId}? No live sensor has detected anything.`))return;
    const item={schema:'vitals.lsp.trainingEvent.v2',id:(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():null)||`${Date.now()}-${Math.random().toString(36).slice(2)}`,missionId:str(state.mission.id),missionName:str(state.mission.name),destination:destination(state.mission.destination),astronautId,kind,severity,status:'OPEN',origin:'MANUAL_TRAINING_SCENARIO',live:false,clinical:false,deviceConnected:false,drugDelivery:false,createdAt:new Date().toISOString()};
    state.events.push(item);
    if(!save()){byId('lspV2Feedback').textContent='Failed to persist event; browser storage may be unavailable.';current();return}
    byId('lspV2Feedback').textContent='TRAINING ALERT CREATED. Visible in crew overview. Operator review required; no medical command enabled.';render();
  });
  byId('lspV2Refresh').addEventListener('click',current);
  byId('lspV2Export').addEventListener('click',()=>{
    if(!state.mission)return;
    const doc={schema:'vitals.lsp.trainingExport.v2',trainingOnly:true,missionId:str(state.mission.id),generatedAt:new Date().toISOString(),records:state.events};
    const blob=new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vitals-life-saving-training-events.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  window.addEventListener('storage',e=>{if(e.key===state.key||Object.values(K).includes(e.key)||e.key?.startsWith(K.roster+'.'))current()});
  current();
})();
