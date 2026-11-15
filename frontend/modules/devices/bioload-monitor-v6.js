/* V.I.T.A.L.S. BioLoad V6 — illustrative muscle readings, not EMG or therapeutic commands. */
(()=>{'use strict';
 if(new URLSearchParams(location.search).get('id')!=='bioload')return;
 const $=id=>document.getElementById(id);
 const K={mission:'vitals.mission.active.v1',assignment:'vitals.devices.assignments.v1',ops:'vitals.devices.operations.v4',records:'vitals.devices.bioload.observations.v6',stream:'vitals.devices.bioload.stream.v6'};
 const read=(k,d)=>{try{let s=localStorage.getItem(k);return s===null?d:JSON.parse(s)}catch{return d}};
 const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
 const mission=()=>String(read(K.mission,{})?.id||'');
 const astronaut=()=>String(read(K.assignment,{})?.bioload||'');
 const op=()=>read(K.ops,{})[mission()+'::bioload']||{};
 const regions=['Quadriceps','Hamstrings','Calves','Gluteals','Core','Shoulders','Upper Arms','Forearms'];
 const scenarios=['Rest','Light Mobility','Exercise Session','Recovery'];
 const mount=()=>{
  if($('bioloadV6')||!$('deviceOperationsV4'))return;
  const panel=document.createElement('section');panel.id='bioloadV6';panel.className='panel bl6';
  panel.innerHTML=`<div class="bl6-heading"><div><p class="eyebrow">BIOLOAD / SYNTHETIC MUSCLE TELEMETRY</p><h2>Live Muscle Monitoring</h2><p class="note">Illustrative motion/activation indices only. No real EMG, force, bone-density sensor, motor actuation or clinical evaluation.</p></div><a class="btn" href="../medical/pages/musculoskeletal-health.html#msk-bioload">OPEN MUSCULOSKELETAL HEALTH</a></div>
  <div class="bl6-controls"><label>MUSCLE REGION<select id="bl6-region"></select></label><label>TRAINING SCENARIO<select id="bl6-scenario"></select></label><button type="button" id="bl6-start">START MUSCLE MONITORING</button><button type="button" id="bl6-stop" class="secondary">STOP</button><button type="button" id="bl6-clear" class="secondary">CLEAR VIEW</button><button type="button" id="bl6-export" class="secondary">EXPORT JSON</button></div>
  <div class="bl6-meta"><div><small>MISSION</small><strong id="bl6-mission">—</strong></div><div><small>ASTRONAUT</small><strong id="bl6-astronaut">—</strong></div><div><small>STREAM</small><strong id="bl6-status">STOPPED</strong></div><div><small>SAMPLES</small><strong id="bl6-samples">0</strong></div></div>
  <p class="bl6-message" id="bl6-message" role="status">Choose a region and start the BioLoad device simulation above.</p>
  <div class="bl6-charts"><article><div><small>MUSCLE ACTIVATION INDEX</small><strong id="bl6-activation">— <span>a.u.</span></strong></div><svg viewBox="0 0 500 160" id="bl6-activation-chart" aria-label="Synthetic muscle activation history"></svg></article><article><div><small>LEFT / RIGHT DIFFERENCE</small><strong id="bl6-asymmetry">— <span>%</span></strong></div><svg viewBox="0 0 500 160" id="bl6-asymmetry-chart" aria-label="Synthetic left right asymmetry history"></svg></article><article><div><small>MOTION INDEX</small><strong id="bl6-motion">— <span>a.u.</span></strong></div><svg viewBox="0 0 500 160" id="bl6-motion-chart" aria-label="Synthetic motion activity history"></svg></article><article><div><small>SIMULATED LOAD SETTING</small><strong id="bl6-load">— <span>%</span></strong></div><svg viewBox="0 0 500 160" id="bl6-load-chart" aria-label="Hypothetical suit loading setting history"></svg></article></div>
  <p class="note">One sample every 4 seconds · up to 60 stored measurements per mission/astronaut/region · these are artificial software-training indices, not NASA-derived physiological estimates.</p>`;
  const before=$('signalsHeading')?.closest('.panel');if(before)before.before(panel);else $('deviceOperationsV4').after(panel);
  $('bl6-region').innerHTML=regions.map(x=>`<option>${x}</option>`).join('');$('bl6-scenario').innerHTML=scenarios.map(x=>`<option>${x}</option>`).join('');
  let samples=[],timer=null,boundMission='',boundAstronaut='',lastRegion='',lastScenario='';
  const say=s=>$('bl6-message').textContent=s;
  const setStatus=s=>$('bl6-status').textContent=s;
  const context=()=>{$('bl6-mission').textContent=mission()||'NO ACTIVE MISSION';$('bl6-astronaut').textContent=astronaut()||'UNASSIGNED';};
  const okay=()=>{if(!mission())return 'Select an active mission first.';if(!astronaut())return 'Assign BioLoad to an astronaut and SAVE DEMO ASSIGNMENT first.';const s=op();if(!s.enabled)return 'Press START SIMULATION in Device Operations first.';if(s.connection!=='SIMULATED ONLINE')return 'Set the simulated link ONLINE first.';if(s.health==='FAULT')return 'Clear the simulated device fault first.';if(Number(s.batteryPct)<=0)return 'Recharge the simulated battery first.';return ''};
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const draw=(id,key,color,max)=>{const svg=$(id);svg.replaceChildren();const ns='http://www.w3.org/2000/svg';for(let i=0;i<4;i++){const l=document.createElementNS(ns,'line');l.setAttribute('x1',10);l.setAttribute('x2',490);l.setAttribute('y1',18+i*40);l.setAttribute('y2',18+i*40);l.setAttribute('stroke','#2a5961');svg.appendChild(l)}if(samples.length<2)return;const path=document.createElementNS(ns,'polyline');path.setAttribute('points',samples.map((s,i)=>`${10+i*480/Math.max(1,samples.length-1)},${149-clamp(s[key],0,max)*130/max}`).join(' '));path.setAttribute('fill','none');path.setAttribute('stroke',color);path.setAttribute('stroke-width','3');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.appendChild(path)};
  const redraw=()=>{const last=samples.at(-1);$('bl6-samples').textContent=String(samples.length);for(const [el,k,u] of [['bl6-activation','activation','a.u.'],['bl6-asymmetry','asymmetry','%'],['bl6-motion','motion','a.u.'],['bl6-load','load','%']])$(el).innerHTML=last?`${last[k].toFixed(1)} <span>${u}</span>`:`— <span>${u}</span>`;draw('bl6-activation-chart','activation','#70f6bf',100);draw('bl6-asymmetry-chart','asymmetry','#f4b57c',20);draw('bl6-motion-chart','motion','#65cae5',100);draw('bl6-load-chart','load','#c8a5e8',100)};
  const stop=(msg='Stopped.')=>{if(timer!==null){clearInterval(timer);timer=null;}setStatus('STOPPED');if(msg)say(msg)};
  const record=()=>{const error=okay();if(error){stop(error);return;}if(boundMission!==mission()||boundAstronaut!==astronaut()||lastRegion!==$('bl6-region').value){stop('Mission, assignment or region changed. Restart monitoring to avoid mixed records.');return;}
   const scenario=$('bl6-scenario').value;const t=samples.length;const base={'Rest':[19,3,13,0],'Light Mobility':[39,4,38,12],'Exercise Session':[70,5.5,72,40],'Recovery':[34,3.8,28,9]}[scenario];
   const wave=Math.sin(t*.55)*3+Math.sin(t*.17)*2;const values={activation:clamp(base[0]+wave+(Math.random()-.5)*5,0,100),asymmetry:clamp(base[1]+Math.sin(t*.3)*1.1+(Math.random()-.5)*1.2,0,20),motion:clamp(base[2]+wave*.8+(Math.random()-.5)*7,0,100),load:clamp(base[3]+Math.sin(t*.19)*1.5,0,100)};
   const row={schema:'vitals.devices.bioload.observation.v6',timestamp:new Date().toISOString(),missionId:boundMission,astronautId:boundAstronaut,deviceId:'bioload',muscleRegion:lastRegion,scenario,provenance:'synthetic_training',quality:'unvalidated',clinicalUse:false,units:{activation:'arbitrary_units',asymmetry:'illustrative_percent',motion:'arbitrary_units',load:'hypothetical_percent'},...Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Number(v.toFixed(2))]))};
   const old=read(K.records,[]);const arr=Array.isArray(old)?old:[];arr.push(row);if(!write(K.records,arr.slice(-1200))){stop('Browser storage is full; not saving any more samples.');return;}
   samples.push(row);if(samples.length>60)samples.shift();redraw();say(`Synthetic ${scenario.toLowerCase()} sample saved for ${lastRegion}. No real instrumentation connected.`);};
  $('bl6-start').addEventListener('click',()=>{const error=okay();if(error){stop(error);context();return;}stop('');context();boundMission=mission();boundAstronaut=astronaut();lastRegion=$('bl6-region').value;lastScenario=$('bl6-scenario').value;samples=[];redraw();setStatus('SIMULATING');record();timer=setInterval(record,4000);});
  $('bl6-stop').addEventListener('click',()=>stop('Monitoring stopped; saved synthetic records remain available in the medical module.'));
  $('bl6-clear').addEventListener('click',()=>{stop('Chart view cleared. Previously recorded observations are preserved.');samples=[];redraw()});
  $('bl6-region').addEventListener('change',()=>{if(timer!==null)stop('Region changed: press START to begin a separate series.');samples=[];redraw()});
  $('bl6-export').addEventListener('click',()=>{const b=new Blob([JSON.stringify({schema:'vitals.devices.bioload.export.v6',classification:'synthetic_training',missionId:mission(),astronautId:astronaut(),records:samples},null,2)],{type:'application/json'});const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='VITALS_BioLoad_synthetic_series.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
  window.addEventListener('storage',()=>{context();if(timer!==null&&okay())stop('Device state or assignment changed. Restart after verifying simulation status.');});
  window.addEventListener('pagehide',()=>stop(''));
  context();redraw();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
