(()=>{'use strict';
const ROOT='../../../assets/devices%20assets/';
const DEVICES={
watch:{title:'V.I.T.A.L.S. Wrist Monitor',file:'watch.glb',subtitle:'Multisensor wrist health monitoring concept',brief:'Individual physiological and activity context for astronaut medical tracking.',signals:[['Heart rate / rhythm','Proposed optical/ECG-class inputs; ECG requires appropriate electrodes'],['SpO₂','Conceptual oxygenation input; validation required'],['Respiration / skin temperature','Sensor-dependent measurements'],['Sleep and activity','Algorithm-derived, not diagnoses'],['Stress / HRV','Derived indicators, not clinical proof'],['Data quality','Timestamp, units, calibration, confidence and provenance']],integrations:['Medical Overview','Behavioral Health','Digital Twin','Alerts'],notes:'CSA Bio-Monitor documents pulse, ECG, breathing, skin temperature, oxygen saturation and movement as wearable research measurement classes. This wrist model is not equivalent to that tested smart garment.'},
bioload:{title:'BioLoad Adaptive Suit',file:'bioload suit.glb',subtitle:'Neuromuscular monitoring and adaptive resistance concept',brief:'Personal motor memory, regional biomechanical trends and hypothetical adaptive loading.',signals:[['Movement and joint range','Future kinematic or inertial measurements'],['Muscle activation','EMG only with validated instrumentation'],['Left/right asymmetry','Comparative functional indicators'],['Strength trend','Measured tests or explicitly synthetic estimates'],['Adaptive loading','Demo parameter only; no force control'],['Bone-density context','Cannot directly measure bone mineral density']],integrations:['Musculoskeletal Health','Digital Twin','Mission Simulation','Alerts'],notes:'The BioLoad model is for internal habitat use, not a certified EVA suit. Its hypothetical loading cannot reproduce Earth gravity. NASA/CSA findings on muscle, bone and marrow support research questions, not suit effectiveness.'},
redbox:{title:'Red Box & Smart Patch',file:'red emergency box.glb',subtitle:'Emergency supplies and microneedle patch concept',brief:'Mission emergency coordination and status, without any drug-control capability.',signals:[['Red Box battery','Concept only; no telemetry'],['Patch link','Not connected'],['Supply inventory','Future cartridge verification'],['Emergency alert','Demo workflow linked to Life-Saving Pack'],['Console operator','Read from saved crew assignments'],['Drug delivery','Locked; clinical and engineering validation needed']],integrations:['Life-Saving Pack','Alerts','Crew Assignment','Digital Twin'],notes:'No dosage calculations, dispensing logic or real medication delivery are implemented. Rescue duration and pharmacokinetics are unvalidated.'},
turtle:{title:'Robotic Companion / Turtle Drone',file:'turtle drone.glb',subtitle:'Quadruped assistance and terrain reconnaissance concept',brief:'Companion, explorer, emergency support and low-power mission robotics.',signals:[['Camera / localization','Future navigation and observation data'],['Environment / obstacles','Future terrain and hazard sensing'],['Battery / solar assist','Conceptual power budgeting'],['Mission task','Companion, Explorer, Maintenance, Rescue, Eco Standby'],['Medical payload','Small supplies, not autonomous treatment'],['Flight mode','Only terrestrial compatible atmosphere; unvalidated']],integrations:['Mission Control','Environment','Alerts','Digital Twin'],notes:'The quadruped has four legs, with folded lateral flight modules in the concept. Conventional rotor flight does not work on the Moon. Movement, rescue capacity and endurance require engineering validation.'}
};
const K={profiles:'vitals.astronauts.v1',astronaut:'vitals.activeAstronautId.v1',mission:'vitals.mission.active.v1',roster:'vitals.mission.crew.v1',assign:'vitals.devices.assignments.v1',external:'vitals.devices.external.v1'};
function read(k,def){try{const s=localStorage.getItem(k);return s?JSON.parse(s):def}catch{return def}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function profiles(){let p=read(K.profiles,[]);return Array.isArray(p)?p:Array.isArray(p?.profiles)?p.profiles:Array.isArray(p?.astronauts)?p.astronauts:[]}
function uid(p){return String(p?.id||p?.astronautId||'')}
function pname(p){return String(p?.name||p?.fullName||p?.displayName||[p?.firstName,p?.lastName].filter(Boolean).join(' ')||uid(p))}
function context(){const mission=read(K.mission,null),active=localStorage.getItem(K.astronaut)||'',all=profiles();return {mission,active,all}}
function safe(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function asset(d){if(d===DEVICES.bioload)return "../../../assets/devices%20assets/bioload%20diviso.glb";return ROOT+encodeURIComponent(d.file)}
// V3 shared finish: the catalogue and individual viewer must render identically.
const FINISH_PALETTES={
  graphite:['#566b79','#708492','#486373','#78959b','#4f7e84'],
  bronze:['#9e7c63','#b99575','#827066','#8a817b','#a18c70'],
  turquoise:['#4faba9','#75c6be','#397f8c','#88bcb3','#3f9eab']
};
const V3_LIGHT={exposure:0.93,emissive:[0.018,0.045,0.048]};
const savedOriginals=new WeakMap();
function finishViewer(viewer,finish='turquoise'){
  const mats=viewer.model?.materials;
  if(!mats?.length)return false;
  let originals=savedOriginals.get(viewer);
  if(!originals){originals=mats.map(m=>{let p=m.pbrMetallicRoughness;return {color:[...p.baseColorFactor],metal:p.metallicFactor,rough:p.roughnessFactor,emissive:[...m.emissiveFactor]}});savedOriginals.set(viewer,originals);}
  mats.forEach((m,i)=>{try{
    const p=m.pbrMetallicRoughness, original=originals[i];
    if(finish==='original'){
      p.setBaseColorFactor(original.color);
      p.setMetallicFactor(original.metal);
      p.setRoughnessFactor(original.rough);
      m.setEmissiveFactor(original.emissive);
    }else{
      const color=FINISH_PALETTES[finish]?.[i%FINISH_PALETTES[finish].length]||FINISH_PALETTES.turquoise[0];
      p.setBaseColorFactor(color);
      p.setMetallicFactor(.16);
      p.setRoughnessFactor(.68);
      m.setEmissiveFactor(V3_LIGHT.emissive);
    }
  }catch(err){console.warn('V3 material skipped',err)}});
  return true;
}
function setupCatalogFinishes(){
  document.querySelectorAll('#catalog model-viewer').forEach(viewer=>{
    const apply=()=>finishViewer(viewer,'turquoise');
    viewer.addEventListener('load',apply);
    if(viewer.model?.materials?.length)apply();
  });
}
function model(d){const path=asset(d);return `<model-viewer src="${path}" alt="Rotating 3D concept of ${safe(d.title)}" camera-controls disable-pan auto-rotate rotation-per-second="12deg" camera-target="auto auto auto" camera-orbit="35deg 75deg auto" field-of-view="auto" environment-image="neutral" shadow-intensity="0.32" shadow-softness="0.9" exposure="0.93" interaction-prompt="none" loading="lazy"><div slot="poster" class="previewfallback">Loading local 3D model...</div></model-viewer>`}
function initCatalog(){const box=document.getElementById('catalog');if(!box)return;box.innerHTML=Object.entries(DEVICES).map(([id,d],i)=>`<article class="devicecard"><div class="preview">${model(d)}<div class="previewfallback" id="fallback-${id}">3D viewer unavailable. This requires an internet connection for the viewer library. The model file remains local.</div></div><div class="content"><span class="mini">0${i+1} / DEVICE CONCEPT</span><h3>${safe(d.title)}</h3><p>${safe(d.brief)}</p><div class="links"><a class="btn" href="./device.html?id=${id}">OPEN DEVICE</a><span class="status">NOT CONNECTED</span></div></div></article>`).join('');}
function fillAstronautSelect(el,choice){if(!el)return;const c=context();el.innerHTML='<option value="">Unassigned / not selected</option>'+c.all.filter(p=>uid(p)).map(p=>`<option value="${safe(uid(p))}">${safe(pname(p))} · ${safe(uid(p))}</option>`).join('');el.value=choice||''}
function initContext(){const c=context();const m=document.getElementById('missionName'),a=document.getElementById('activeName');if(m)m.textContent=c.mission?`${c.mission.name||c.mission.id||'Active mission'} · ${c.mission.destination||'Destination unspecified'}`:'No active mission';if(a)a.textContent=pname(c.all.find(p=>uid(p)===c.active)||{name:'None confirmed'});document.getElementById('refresh')?.addEventListener('click',()=>{initContext();renderExternal()},{once:true})}
function initDetail(){let id=new URLSearchParams(location.search).get('id');let d=DEVICES[id];if(!d){document.querySelector('main').innerHTML='<section class="panel"><h2>Unknown device</h2><a href="./devices.html">Return to Devices</a></section>';return}document.title='V.I.T.A.L.S. | '+d.title;document.getElementById('detailTitle').textContent=d.title;document.getElementById('detailSummary').textContent=d.subtitle;const holder=document.getElementById('singleModel');holder.innerHTML=model(d);const viewer=holder.querySelector('model-viewer');
const finishBox=document.createElement('div');finishBox.className='finish-controls';
finishBox.innerHTML='<span>MODEL FINISH (PREVIEW ONLY)</span><button type="button" data-finish="graphite" class="finish-active">GRAPHITE</button><button type="button" data-finish="bronze">BRONZE</button><button type="button" data-finish="turquoise">TURQUOISE</button><button type="button" data-finish="original">ORIGINAL GLB</button>';
const ctrl=document.getElementById('rotateToggle').parentElement;
ctrl.parentElement.insertBefore(finishBox,ctrl);
const feedback=document.createElement('p');feedback.className='finish-feedback note';finishBox.insertAdjacentElement('afterend',feedback);
let selectedFinish='turquoise';
finishBox.querySelectorAll('button').forEach(b=>b.classList.toggle('finish-active',b.dataset.finish==='turquoise'));
function applyFinish(name){
  const ok=finishViewer(viewer,name);
  feedback.textContent=ok?(name==='original'?'Original GLB materials restored.':'Turquoise / studio finish applied to preview only. The GLB file was not changed.'):'Loading 3D materials...';
}
viewer.addEventListener('load',()=>{applyFinish(selectedFinish);viewer.cameraTarget='auto auto auto';viewer.cameraOrbit='35deg 75deg auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal?.()});
finishBox.addEventListener('click',e=>{const btn=e.target.closest('button[data-finish]');if(!btn)return;selectedFinish=btn.dataset.finish;finishBox.querySelectorAll('button').forEach(b=>b.classList.toggle('finish-active',b===btn));applyFinish(selectedFinish)});
let playing=true;
document.getElementById('rotateToggle').addEventListener('click',e=>{playing=!playing;viewer.autoRotate=playing;e.currentTarget.textContent=playing?'PAUSE ROTATION':'RESUME ROTATION'});
document.getElementById('resetCamera').addEventListener('click',()=>{viewer.cameraTarget='auto auto auto';viewer.cameraOrbit='35deg 75deg auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal?.();feedback.textContent='View recentered and zoom restored.'});document.getElementById('signalsHeading').textContent=d.title+' signals';document.getElementById('signalGrid').innerHTML=d.signals.map(([n,t])=>`<div class="signal"><strong>${safe(n)}</strong><small>${safe(t)}</small></div>`).join('');document.getElementById('integrations').textContent=d.notes;document.getElementById('integrationSteps').innerHTML=`<div><strong>01 / DEVICE</strong>Source and timestamp (currently concept only)</div><div><strong>02 / NORMALIZE</strong>Unit, provenance, consent, quality checks</div><div><strong>03 / LINK</strong>${safe(d.integrations.join(' · '))}</div>`;document.getElementById('deviceFacts').innerHTML=`<div><span>MODEL FILE</span>${safe(d.file)}</div><div><span>TELEMETRY</span>NO LIVE DATA</div><div><span>CONTROL</span>DISABLED</div>`;let assigned=read(K.assign,{});const sel=document.getElementById('assignAstronaut');fillAstronautSelect(sel,assigned[id]);const c=context();document.getElementById('detailMission').textContent=c.mission?`Active mission: ${c.mission.name||c.mission.id||'Unknown'} · ${c.mission.destination||'unknown destination'}`:'No active mission selected';document.getElementById('saveAssignment').addEventListener('click',()=>{const current=read(K.assign,{});if(sel.value&&!profiles().some(p=>uid(p)===sel.value)){document.getElementById('assignmentStatus').textContent='Astronaut no longer exists. Refresh first.';return}if(sel.value)current[id]=sel.value;else delete current[id];write(K.assign,current);document.getElementById('assignmentStatus').textContent='Demo assignment saved locally. No connection established.'});document.getElementById('clearAssignment').addEventListener('click',()=>{const current=read(K.assign,{});delete current[id];write(K.assign,current);sel.value='';document.getElementById('assignmentStatus').textContent='Demo assignment cleared.'});if(id==='redbox'){document.getElementById('deviceSpecific').innerHTML='<h2>Red Box references</h2><div class="redboxphotos"><img alt="Red Box enclosure" src="../../../assets/emergency%20box%201.jpg"><img alt="Red Box patch interface" src="../../../assets/emergency%20box%202.jpg"><img alt="Red Box portable battery concept" src="../../../assets/emergency%20box%203%20%20solar%20pannel%20battery.jpg"></div><p><a class="btn" href="../medical/pages/life-saving-pack.html">OPEN LIFE-SAVING PACK</a></p>'}if(id==='bioload'){document.getElementById('deviceSpecific').innerHTML='<p><a class="btn" href="../medical/pages/musculoskeletal-health.html">OPEN MUSCULOSKELETAL HEALTH</a></p>'}viewer.addEventListener('error',()=>{document.getElementById('viewerNote').textContent='Model could not be loaded. Check local GLB path, file size and internet availability for viewer library.'})}
function renderExternal(){let list=document.getElementById('externalList');if(!list)return;let records=read(K.external,[]);if(!Array.isArray(records))records=[];list.innerHTML=records.length?records.map(r=>`<div><strong>${safe(r.name)}</strong> · ${safe(r.dataType)} · ${safe(r.interface)} · ${safe(r.astronautId||'unassigned')} <small>REGISTERED ONLY / NOT CONNECTED</small></div>`).join(''):'<p class="note">No external devices registered.</p>'}
function initExternal(){const f=document.getElementById('externalForm');if(!f)return;fillAstronautSelect(document.getElementById('extAstronaut'));f.addEventListener('submit',e=>{e.preventDefault();let data=new FormData(f);const name=String(data.get('deviceName')||'').trim();if(!name)return;let current=read(K.external,[]);if(!Array.isArray(current))current=[];current.push({id:'EXT-'+Date.now(),name:name.slice(0,70),dataType:String(data.get('dataType')),interface:String(data.get('interface')),astronautId:String(data.get('astronautId')),connected:false,source:'manual_device_registration',createdAt:new Date().toISOString()});write(K.external,current);f.reset();document.getElementById('formNotice').textContent='Device definition registered. No actual hardware connected.';renderExternal()});renderExternal()}
function viewerDependencyCheck(){setTimeout(()=>{if(!customElements.get('model-viewer')){document.querySelectorAll('.previewfallback').forEach(e=>{e.style.display='flex'});const n=document.getElementById('viewerNote');if(n)n.textContent='The 3D viewer library did not load. Internet access is required for this version; your GLB model files are local.'}},4500)}
initContext();initCatalog();setupCatalogFinishes();initDetailIfPresent();initExternal();viewerDependencyCheck();function initDetailIfPresent(){if(document.getElementById('singleModel'))initDetail()}
})();
