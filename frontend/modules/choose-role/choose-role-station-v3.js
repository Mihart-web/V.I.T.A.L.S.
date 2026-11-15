"use strict";
/* Read-only role and station clarity panel; assignment is saved only in Crew Assignment. */
(() => {
  const $=id=>document.getElementById(id);
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const raw=k=>{try{return localStorage.getItem(k)||''}catch{return ''}};
  const str=x=>typeof x==='string'?x.trim():'';
  const panel=$('vitalsStationPanel');if(!panel)return;
  const status=$('vitalsStationStatus'),reason=$('vitalsStationReason'),alerts=$('vitalsStationAlerts');
  function update(){
    const identity=read('vitals.session.identity.v1'),mission=read('vitals.mission.active.v1');
    const active=raw('vitals.activeAstronautId.v1');
    const destination=str(mission?.destination).toLowerCase();
    const records=[read('vitals.mission.crew.v1.'+destination),read('vitals.mission.crew.v1')];
    const roster=records.find(x=>x&&Array.isArray(x.members)&&str(x.destination).toLowerCase()===destination&&str(x.missionName)===str(mission?.name));
    const member=roster?.members.find(x=>str(x.astronautId)===active);
    const confirmed=!!identity?.confirmedAt&&!!identity?.roleConfirmedAt&&str(identity.missionId)===str(mission?.id)&&str(identity.astronautId)===active;
    const match=!!member&&str(member.role)===str(identity?.roleId);
    const consolePeople=roster?.members.filter(x=>x.consoleOperator)||[];
    const console=!!member?.consoleOperator&&consolePeople.length===1;
    const activeMedical=confirmed&&match&&console&&['medical-officer','flight-surgeon'].includes(str(identity?.roleId));
    let label='NO CONSOLE DUTY',note='Choose an astronaut, confirm the identity and professional role, then request an assignment in Crew Assignment.';
    if(!mission?.id){label='NO ACTIVE MISSION';note='Configure an active mission before requesting onboard console duty.';}
    else if(!roster){label='ROSTER NOT VERIFIED';note='No matching saved crew roster. Assign and save a crew in Crew Assignment.';}
    else if(!member){label='NOT ASSIGNED TO MISSION';note='The selected astronaut is not in this mission roster.';}
    else if(member.consoleOperator){label='ONBOARD CONSOLE OPERATOR';note='Remain onboard during this duty. EVA is unavailable while consoleOperator is assigned.';}
    else{label='MISSION CREW / NO CONSOLE DUTY';note='Standard crew assignment. EVA remains dependent on the mission role and planned EVA activities.';}
    status.textContent=label;
    reason.textContent=note;
    alerts.textContent=confirmed&&match&&console ? (activeMedical?'ALERTS: console actions and simulated medical workflow available. No medication can be administered.':'ALERTS: console acknowledgement available. Medical workflow locked to a matching medical role.') : 'ALERTS: read-only until a confirmed role matches a unique console assignment for this mission.';
    panel.dataset.console=String(console);
    const role= str(member?.roleName||member?.role)||'Not assigned';
    $('vitalsStationRole').textContent=`Mission role: ${role} · Role match: ${confirmed&&match?'VERIFIED (DEMO)':'NOT CONFIRMED'}`;
  }
  window.addEventListener('storage',update);
  window.addEventListener('pageshow',update);
  document.addEventListener('click',()=>setTimeout(update,0));
  update();
})();
