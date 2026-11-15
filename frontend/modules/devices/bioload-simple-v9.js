/* V.I.T.A.L.S. BioLoad V9 — simple console facade over existing V4/V6/V8.1.
 * Keeps existing state and stored observations unchanged. */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('id')!=='bioload')return;
const $=id=>document.getElementById(id);
const OPS='vitals.devices.operations.v4',ASSIGN='vitals.devices.assignments.v1',MISSION='vitals.mission.active.v1';
const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
function context(){const mission=parse(MISSION,{}),id=String(mission?.id||'');const astronaut=String(parse(ASSIGN,{})?.bioload||'');const state=parse(OPS,{})[id+'::bioload']||{};return {id,astronaut,state};}
let running=false;
function mount(){
 if($('bl9-console')||!$('bl8-compact')||!$('bioloadV6')||!$('deviceOperationsV4'))return;
 const spots=$('bl8-compact'),monitor=$('bioloadV6'),operations=$('deviceOperationsV4');
 const model=$('singleModel')?.querySelector('model-viewer');
 // Reorganize display only: retain original nodes and their event listeners.
 const panel=document.createElement('div');panel.id='bl9-console';panel.className='bl9-console';
 panel.innerHTML='<div class="bl9-overview"><div><span>MISSION MUSCLE MONITORING</span><strong>BioLoad Control</strong><p>Choose a region on the suit, then start synthetic monitoring. This is a training simulation, not a clinical measurement.</p></div><div class="bl9-indicators"><span id="bl9-connection">OFFLINE</span><span id="bl9-battery">BATTERY —</span></div></div><div class="bl9-main-actions"><button type="button" id="bl9-toggle">START MONITORING</button><a class="btn" href="../medical/pages/musculoskeletal-health.html#msk-bioload">VIEW MEDICAL ANALYSIS</a></div><p id="bl9-message" role="status" class="bl9-message">Select a muscle region and start monitoring.</p>';
 spots.parentElement.insertBefore(panel,spots);
 const tools=document.createElement('details');tools.className='bl9-options';tools.innerHTML='<summary>Point positioning (optional)</summary>';
 const actions=spots.querySelector('.bl8-actions'),status=spots.querySelector('.bl8-status');
 if(actions)tools.appendChild(actions);if(status)tools.appendChild(status);spots.appendChild(tools);
 // Region selection remains only under the 3D suit. Preserve V6 select in DOM for synchronization.
 const oldRegion=$('bl6-region');const regionLabel=oldRegion?.closest('label');if(regionLabel)regionLabel.classList.add('bl9-hidden-region');
 const regionHelp=document.createElement('p');regionHelp.className='bl9-region-note';regionHelp.textContent='Muscle region follows the selection above the 3D model.';
 monitor.querySelector('.bl6-controls')?.prepend(regionHelp);
 const advanced=document.createElement('details');advanced.className='bl9-advanced';advanced.innerHTML='<summary>Advanced diagnostics · battery, connection, faults, event history</summary>';
 operations.parentElement.insertBefore(advanced,operations);advanced.appendChild(operations);
 // Keep V6 scenario selection visible and relocate less frequently used actions.
 const exports=document.createElement('details');exports.className='bl9-export';exports.innerHTML='<summary>History / export / clear chart</summary>';
 const toolbar=monitor.querySelector('.bl6-controls');const clear=$('bl6-clear'),exp=$('bl6-export');
 if(clear)exports.appendChild(clear);if(exp)exports.appendChild(exp);if(toolbar)toolbar.after(exports);
 for(const el of [$('bl6-start'),$('bl6-stop')])if(el)el.classList.add('bl9-original-control');
 monitor.classList.add('bl9-monitor');
 // Model is still served from the original configured local asset path, not the stale metadata label.
 const facts=$('deviceFacts');if(facts&&model?.getAttribute('src')?.toLowerCase().includes('bioload%20diviso')){
   const rows=[...facts.children];const row=rows.find(r=>r.querySelector('span')?.textContent?.trim()==='MODEL FILE');
   if(row){row.replaceChildren();const lbl=document.createElement('span');lbl.textContent='MODEL FILE';row.append(lbl,document.createTextNode('bioload diviso.glb'));}
 }
 function say(message){$('bl9-message').textContent=message;}
 function update(){const {id,astronaut,state}=context();running=$('bl6-status')?.textContent==='SIMULATING';
  $('bl9-toggle').textContent=running?'STOP MONITORING':'START MONITORING';
  $('bl9-toggle').classList.toggle('bl9-active',running);
  $('bl9-connection').textContent=state.enabled&&state.connection==='SIMULATED ONLINE'?'DEMO ONLINE':'DEMO OFFLINE';
  $('bl9-battery').textContent='BATTERY '+(Number.isFinite(Number(state.batteryPct))?state.batteryPct+'%':'—');
  if(!id||!astronaut)say(!id?'No active mission. Select a mission first.':'No assigned astronaut. Select one in Mission Integration and press SAVE DEMO ASSIGNMENT.');
 }
 function launch(){const {id,astronaut,state}=context();
  if(!id){say('Select an active mission first.');return;}
  if(!astronaut){say('Assign BioLoad to an astronaut and SAVE DEMO ASSIGNMENT first.');return;}
  if(state.health==='FAULT'){say('A simulated fault is active. Open Advanced diagnostics and clear the fault.');return;}
  if(state.enabled&&state.connection!=='SIMULATED ONLINE'){
    say('Device is offline. Open Advanced diagnostics and restore the simulated link.');return;
  }
  if(Number(state.batteryPct)===0){say('The simulated battery is empty. Recharge in Advanced diagnostics.');return;}
  if(!state.enabled){$('v4-enable')?.click();}
  const latest=context().state;
  if(!latest.enabled||latest.connection!=='SIMULATED ONLINE'){
    say('Device could not start. Check its status in Advanced diagnostics.');update();return;
  }
  // Select a useful operating mode without changing the medical data model.
  if($('v4-mode')?.value==='STANDBY'){$('v4-mode').value='MOTION TRACKING';$('v4-mode').dispatchEvent(new Event('change',{bubbles:true}));}
  $('bl6-start')?.click();
  if($('bl6-status')?.textContent==='SIMULATING')say('Synthetic muscle monitoring active. Choose another region on the 3D suit to inspect it.');
  else say($('bl6-message')?.textContent||'Could not start monitoring.');
  update();
 }
 $('bl9-toggle').addEventListener('click',()=>{if($('bl6-status')?.textContent==='SIMULATING'){
   $('bl6-stop')?.click();say('Monitoring stopped. Saved synthetic observations are preserved.');update();
  }else launch();});
 // Changing region synchronizes with the existing V6 dropdown. Restart just the stream
 // for the newly selected region; never mix records from different regions.
 spots.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
   const hadStream=$('bl6-status')?.textContent==='SIMULATING';
   // V8.1 handler has run already and will update V6 selection; update after all listeners.
   if(hadStream)queueMicrotask(()=>{
     if($('bl6-region')?.value!==button.dataset.region)return;
     $('bl6-start')?.click();say('Monitoring '+button.dataset.region+' with a new synthetic series.');update();
   });else queueMicrotask(update);
 }));
 $('bl6-scenario')?.addEventListener('change',()=>{if($('bl6-status')?.textContent==='SIMULATING'){
   $('bl6-start')?.click();say('New simulation scenario started. Previous observations remain saved.');
 }update();});
 const statusNode=$('bl6-status');if(statusNode){new MutationObserver(update).observe(statusNode,{childList:true,characterData:true,subtree:true});}
 $('saveAssignment')?.addEventListener('click',()=>queueMicrotask(update));
 window.addEventListener('vitals-device-v4-update',update);
 window.addEventListener('storage',update);
 update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
