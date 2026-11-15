/* V.I.T.A.L.S. mission start sequence banner - read-only navigation */
(()=>{
  'use strict';
  if(document.querySelector('.vitals-flow')) return;
  const steps=[
    ['CHOOSE ASTRONAUT','../astronaut-profile/select-astronaut.html','astronaut'],
    ['CHOOSE YOUR ROLE','../choose-role/choose-role.html','role'],
    ['ASSIGN CREW TO MISSION','../mission/pages/crew-assignment.html','crew'],
    ['MISSION CONFIGURATION','../mission/pages/mission-configuration.html','assessment'],
    ['START MISSION','../mission/pages/start-mission.html','start']
  ];
  const path=location.pathname.toLowerCase();
  const current=path.includes('/choose-role/')?'role':path.includes('/astronaut-profile/')?'astronaut':'';
  const host=document.querySelector('main');
  if(!host) return;
  const el=document.createElement('section');
  el.className='vitals-flow';el.setAttribute('aria-label','Mission start sequence');
  const title=document.createElement('div');title.className='vitals-flow-heading';title.textContent='MISSION START SEQUENCE';
  const inner=document.createElement('div');inner.className='vitals-flow-steps';
  steps.forEach(([label,href,id],i)=>{
    if(i){const arrow=document.createElement('span');arrow.className='vitals-flow-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent=String.fromCharCode(8594);inner.append(arrow)}
    const a=document.createElement('a');a.href=href;a.textContent=label;
    if(id===current){a.classList.add('vitals-flow-current');a.setAttribute('aria-current','step')}
    inner.append(a);
  });
  const note=document.createElement('p');note.className='vitals-flow-note';note.textContent='Follow the steps in order. Save mission and crew changes before starting.';
  el.append(title,inner,note);
  const header=host.querySelector(':scope > header');
  const heading=host.querySelector('h1');

  if(header){
    header.insertAdjacentElement('afterend',el);
  }else if(heading){
    heading.insertAdjacentElement('afterend',el);
  }else{
    host.prepend(el);
  }
})();