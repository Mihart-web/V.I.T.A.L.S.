/* Read-only display of BioLoad V6 synthetic observations inside Musculoskeletal Health. */
(()=>{'use strict';
 const K={observations:'vitals.devices.bioload.observations.v6',mission:'vitals.mission.active.v1'};
 const read=(k,d)=>{try{const s=localStorage.getItem(k);return s===null?d:JSON.parse(s)}catch{return d}};
 const mount=()=>{if(document.getElementById('mskBioV6'))return;const anchor=document.getElementById('bioLink');const crew=document.getElementById('crewSelect');if(!anchor||!crew)return;
 const box=document.createElement('div');box.id='mskBioV6';box.className='msk-bio-v6';box.innerHTML='<h3>BioLoad — Synthetic Muscle Observations</h3><p class="muted">Read-only device records for the selected mission astronaut. These values are not EMG, measured force, bone density or a clinical diagnosis.</p><p id="mskBioV6Status" class="notice"></p><div id="mskBioV6Cards" class="msk-bio-v6-cards"></div><div id="mskBioV6List" class="msk-bio-v6-list"></div><button type="button" id="mskBioV6Refresh">REFRESH DEVICE OBSERVATIONS</button>';
 anchor.parentElement.appendChild(box);
 const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function draw(){const mission=String(read(K.mission,{})?.id||'');const astr=crew.value;const data=read(K.observations,[]);const rows=Array.isArray(data)?data.filter(r=>r?.schema==='vitals.devices.bioload.observation.v6'&&r.missionId===mission&&r.astronautId===astr).slice(-240):[];
 const status=document.getElementById('mskBioV6Status');const cards=document.getElementById('mskBioV6Cards'),list=document.getElementById('mskBioV6List');cards.replaceChildren();list.replaceChildren();
 if(!astr||!mission){status.textContent='Select an assigned mission astronaut.';return}if(!rows.length){status.textContent='No BioLoad synthetic observations for this astronaut yet. Associate the suit in Devices and run the muscle-monitoring simulation.';return}
 status.textContent=`${rows.length} most recent synthetic records for the selected astronaut in ${mission}. Unvalidated training data only.`;
 const lastByRegion=new Map();rows.forEach(r=>lastByRegion.set(r.muscleRegion,r));for(const [region,r] of lastByRegion){const d=document.createElement('div');d.innerHTML=`<strong>${esc(region)}</strong><span>Activation: ${Number(r.activation).toFixed(1)} a.u. · Left/right: ${Number(r.asymmetry).toFixed(1)}% · Motion: ${Number(r.motion).toFixed(1)} a.u.</span><small>${esc(r.scenario)} · ${esc(new Date(r.timestamp).toLocaleString())}</small>`;cards.appendChild(d)}
 const table=document.createElement('table');table.innerHTML='<thead><tr><th>Time</th><th>Region</th><th>Scenario</th><th>Activation (a.u.)</th><th>Asymmetry (demo %)</th><th>Motion (a.u.)</th></tr></thead>';const body=document.createElement('tbody');rows.slice(-24).reverse().forEach(r=>{const tr=document.createElement('tr');[new Date(r.timestamp).toLocaleTimeString(),r.muscleRegion,r.scenario,Number(r.activation).toFixed(1),Number(r.asymmetry).toFixed(1),Number(r.motion).toFixed(1)].forEach(v=>{const td=document.createElement('td');td.textContent=String(v);tr.appendChild(td)});body.appendChild(tr)});table.appendChild(body);list.appendChild(table)
 }
 crew.addEventListener('change',draw);document.getElementById('mskBioV6Refresh').addEventListener('click',draw);window.addEventListener('storage',e=>{if(e.key===K.observations||e.key===K.mission)draw()});draw();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
