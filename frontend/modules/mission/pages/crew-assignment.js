"use strict";
/* V.I.T.A.L.S. Crew Assignment v1. Local demo roster, no clinical permissions. */
(() => {
  const DESTINATION_KEY = "vitals.mission.destination.v1";
  const ROSTER_KEY = "vitals.mission.crew.v1";
  const PROFILE_KEYS = ["vitals.astronauts.v1", "vitals.astronaut.profiles.v1", "vitals.astronauts", "vitals_astronauts", "vitals.crew.profiles.v1", "astronautProfiles", "astronauts"];
  const ROLES = [
    {id:"commander",name:"Commander",icon:"♛"},
    {id:"pilot",name:"Pilot",icon:"✈"},
    {id:"flight-engineer",name:"Flight Engineer",icon:"⚙"},
    {id:"mission-specialist",name:"Mission Specialist",icon:"✦"},
    {id:"payload-specialist",name:"Payload Specialist",icon:"▣"},
    {id:"eva-specialist",name:"EVA Specialist",icon:"◎"},
    {id:"medical-officer",name:"Crew Medical Officer",icon:"✚"},
    {id:"flight-surgeon",name:"Flight Surgeon",icon:"♡"},
    {id:"biomedical-specialist",name:"Biomedical Specialist",icon:"◇"},
    {id:"behavioral-health-specialist",name:"Behavioral Health Specialist",icon:"☼"},
    {id:"exercise-rehabilitation-specialist",name:"Exercise & Rehabilitation Specialist",icon:"↗"},
    {id:"nutrition-specialist",name:"Nutrition Specialist",icon:"◐"},
    {id:"science-officer",name:"Science Officer",icon:"✧"},
    {id:"robotics-specialist",name:"Robotics Specialist",icon:"⬡"},
    {id:"environmental-systems-specialist",name:"Environmental Systems Specialist",icon:"◉"},
    {id:"crew-member",name:"Crew Member",icon:"♙"}
  ];
  const $ = id => document.getElementById(id);
  const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSet = (key,value) => { try {localStorage.setItem(key,value); return true;} catch { return false; } };
  const parse = v => {try {return JSON.parse(v);} catch {return null;}};
  const asString = val => typeof val === "string" || typeof val === "number" ? String(val).trim() : "";
  const first = (...values) => values.map(asString).find(Boolean) || "";
  const destination = safeGet(DESTINATION_KEY) || "unselected";
  const missionName = first(parse(safeGet("vitals.mission.active.v1"))?.name, "DRAFT MISSION");
  const destNames = {"earth-remote":"EARTH — REMOTE REGIONS",moon:"MOON",mars:"MARS",europa:"EUROPA",titan:"TITAN",unselected:"DESTINATION NOT SELECTED"};
  const rosterKey = `${ROSTER_KEY}.${destination}`;
  let profiles = [];
  let assignments = [];
  const errors = [];
  const info = $("missionInfo");
  info.textContent = `${missionName} / ${destNames[destination] || destination.toUpperCase()} / NOT STARTED`;
  function show(msg,isError=false) { const el=$("feedback");el.textContent=msg;el.classList.toggle("error",isError); }
  function rawRecords(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data!=="object") return [];
    for (const key of ["astronauts","profiles","crew","items","data","records"]) if(Array.isArray(data[key]))return data[key];
    // Mapping by astronaut ID, when each value looks like a profile.
    const vals=Object.values(data);
    return vals.length && vals.every(v=>v && typeof v==="object" && !Array.isArray(v)) ? vals : [];
  }
  function normalizeProfile(p) {
    if (!p || typeof p!=="object" || Array.isArray(p))return null;
    const id=first(p.astronautId,p.astronaut_id,p.profileId,p.id,p.identifier,p.code);
    const name=first(p.fullName,p.full_name,p.name,p.displayName,p.callsign,[p.firstName,p.lastName].filter(Boolean).join(" "));
    if(!id || !name)return null;
    const idx=Number(p.avatarIndex ?? p.avatar_index ?? p.avatarNumber ?? p.avatar_number ?? p.avatarId);
    const rawImage=first(p.avatarUrl,p.avatar_url,p.portrait,p.image,p.avatar,p.photo);
    let portrait="";
    if (Number.isInteger(idx) && idx>=1 && idx<=28) portrait=`../../../../assets/astronaut-profile/portraits/av${idx}${[1,20,28].includes(idx)?".png":".webp"}`;
    else if (/^av(?:[1-9]|1\d|2[0-8])\.(?:png|webp)$/i.test(rawImage)) portrait=`../../../../assets/astronaut-profile/portraits/${rawImage}`;
    else if (/^(?:\.\.\/){1,5}assets\/astronaut-profile\/portraits\/av\d+\.(?:webp|png)$/i.test(rawImage)) portrait=`../../../../assets/astronaut-profile/portraits/${rawImage.split("/").pop()}`;
    else if (/^\.\.\/assets\/astronaut-profile\/portraits\/av\d+\.(?:webp|png)$/i.test(rawImage))portrait=`../../../${rawImage.slice(3)}`;
    return {id,name,age:asString(p.age),portrait};
  }
  function loadProfiles() {
    const map=new Map(); const sources=[];
    for(const key of PROFILE_KEYS) {
      const recs=rawRecords(parse(safeGet(key)));
      let count=0;
      for(const p of recs){ const n=normalizeProfile(p);if(n&&!map.has(n.id)){map.set(n.id,n);count++;} }
      if(count)sources.push(`${key} (${count})`);
    }
    profiles=[...map.values()].sort((a,b)=>a.name.localeCompare(b.name));
    // Do not invent placeholder astronaut profiles.
    const known=new Set(profiles.map(p=>p.id));
    if(assignments.length){const missing=assignments.filter(a=>!known.has(a.astronautId));if(missing.length)show(`${missing.length} roster member(s) are not present in the current profile source. Their assignments are preserved; check astronaut profiles.`,true);}
    return sources;
  }
  function restore() {
    const saved=parse(safeGet(rosterKey)) || parse(safeGet(ROSTER_KEY));
    if(saved && typeof saved==="object" && (saved.destination===destination || !saved.destination) && Array.isArray(saved.members)) {
      assignments=saved.members.filter(x=>x&&asString(x.astronautId)).map(x=>({astronautId:asString(x.astronautId),role:asString(x.role)||"mission-specialist",consoleOperator:!!x.consoleOperator,displayName:asString(x.displayName)}));
    }
  }
  function elem(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function action(label,handler,kind="") {const b=elem("button",`btn small ${kind}`,label);b.type="button";b.addEventListener("click",handler);return b;}
  function profilePortrait(p){
    const box=elem("div","portrait portrait-fallback","◈");
    if(!p?.portrait)return box;
    const im=document.createElement("img");im.className="portrait";im.alt=`Portrait of ${p.name}`;im.loading="lazy";im.src=p.portrait;
    im.addEventListener("error",()=>{im.replaceWith(box);},{once:true});return im;
  }
  function createRoleSelect(current){
    const sel=document.createElement("select");sel.setAttribute("aria-label","Mission role");
    if(current && !ROLES.some(r=>r.id===current)){const legacy=document.createElement("option");legacy.value=current;legacy.textContent=`LEGACY ROLE: ${current} (select a current role to migrate)`;legacy.selected=true;sel.append(legacy);} for(const r of ROLES){const o=document.createElement("option");o.value=r.id;o.textContent=`${r.icon} ${r.name}`;if(r.id===current)o.selected=true;sel.append(o);}return sel;
  }
  function roleIcon(role){return ROLES.find(r=>r.id===role)?.icon || "◈";}
  function card(p,assignment){
    const outer=elem("article","astronaut-card");outer.append(profilePortrait(p));
    const main=elem("div","person");outer.append(main);
    main.append(elem("h3","",p.name));main.append(elem("p","metadata",`ID: ${p.id}${p.age?`  /  Age: ${p.age}`:""}`));
    if(assignment){
      const r=ROLES.find(x=>x.id===assignment.role);
      const line=elem("div","role-label");line.append(elem("span","role-icon",roleIcon(assignment.role)),elem("span","",r?.name||assignment.role));main.append(line);
      const label=elem("label","role-label","MISSION ROLE");main.append(label);const sel=createRoleSelect(assignment.role);main.append(sel);
      sel.addEventListener("change",()=>{assignment.role=sel.value;show("Crew role changed. Save the crew to mission to persist.");render();});
      const duty=elem("label","duty");const chk=document.createElement("input");chk.type="checkbox";chk.checked=assignment.consoleOperator;chk.addEventListener("change",()=>{
        if(chk.checked){for(const a of assignments)a.consoleOperator=false;}
        assignment.consoleOperator=chk.checked;show("Console duty updated. Clinical authorization is NOT granted by this role.");render();
      });duty.append(chk,document.createTextNode("Designated mission console operator"));main.append(duty);
      main.append(action("REMOVE FROM CREW",()=>{assignments=assignments.filter(a=>a.astronautId!==assignment.astronautId);show(`${p.name} removed from draft crew. Save to persist.`);render();}));
    } else {
      const label=elem("label","role-label","MISSION ROLE");main.append(label);const sel=createRoleSelect("mission-specialist");main.append(sel);
      main.append(action("ASSIGN TO CREW",()=>{
        if(assignments.some(a=>a.astronautId===p.id))return;
        assignments.push({astronautId:p.id,role:sel.value,consoleOperator:false,displayName:p.name});show(`${p.name} added to draft crew. Save to persist.`);render();
      },"primary"));
    }
    return outer;
  }
  function render(){
    const left=$("availableList"),right=$("assignedList");left.replaceChildren();right.replaceChildren();
    const assignedIDs=new Set(assignments.map(a=>a.astronautId));const q=$("profileSearch").value.trim().toLowerCase();
    const available=profiles.filter(p=>!assignedIDs.has(p.id));const visible=available.filter(p=>p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q));
    for(const p of visible)left.append(card(p,null));
    if(!visible.length)left.append(elem("div","empty",profiles.length?"No available astronauts match your search.":"No registered astronauts found. Create or save an astronaut profile first."));
    for(const a of assignments){const p=profiles.find(p=>p.id===a.astronautId)||{id:a.astronautId,name:a.displayName||`Unknown astronaut ${a.astronautId}`,portrait:""};right.append(card(p,a));}
    if(!assignments.length)right.append(elem("div","empty","No crew members assigned yet."));
    $("availableCount").textContent=String(available.length);$("assignedCount").textContent=String(assignments.length);
  }
  $("backTo").addEventListener("change",e=>{if(e.target.value)location.assign(e.target.value);});
  $("profileSearch").addEventListener("input",render);
  $("reloadProfiles").addEventListener("click",()=>{const sources=loadProfiles();render();show(sources.length?`Profiles reloaded from ${sources.join(", ")}.`:`No compatible locally saved profiles found. Create an astronaut first.`,!sources.length);});
  function payload() {
    return {schema:"vitals.mission.crew.v1",destination,missionName,status:"planned",savedAt:new Date().toISOString(),members:assignments.map((a,i)=>({astronautId:a.astronautId,displayName:profiles.find(p=>p.id===a.astronautId)?.name||a.displayName,role:a.role,roleName:ROLES.find(r=>r.id===a.role)?.name||a.role,roleIcon:roleIcon(a.role),consoleOperator:a.consoleOperator,position:i+1})),clinicalApproval:{granted:false,requiresVerifiedHumanAuthorization:true}};
  }
  $("saveCrew").addEventListener("click",()=>{
    if(!assignments.length){show("Assign at least one astronaut before saving.",true);return;}
    if(assignments.some(a=>!profiles.some(p=>p.id===a.astronautId))){show("Cannot save: a crew profile is missing. Reload profiles or remove that member.",true);return;}
    const data=payload();const json=JSON.stringify(data);
    if(!safeSet(rosterKey,json)||!safeSet(ROSTER_KEY,json)){show("Local storage unavailable or full: crew was NOT saved.",true);return;}
    // Notify other open VITALS components in this tab; other tabs receive storage event.
    window.dispatchEvent(new CustomEvent("vitals:crew-updated",{detail:data}));
    show(`${data.members.length} crew member(s) saved for ${destNames[destination]||destination}. Local demo only; mission not started.`);
  });
  $("exportRoster").addEventListener("click",()=>{
    const data=payload(),blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`VITALS_crew_${destination}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),250);
  });
  const sources=loadProfiles();restore();render();
  if(!sources.length)show("No registered astronaut profiles detected in local storage. Use CREATE ASTRONAUT, then refresh.",true);
  else show(`Loaded ${profiles.length} astronaut profile(s). Assign roles and save the crew to mission.`);
})();
