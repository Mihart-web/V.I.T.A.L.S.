/* V.I.T.A.L.S. Devices V5 — simulated live Wrist Monitor, no physical device or clinical telemetry. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const PARAM=new URLSearchParams(location.search);
if(PARAM.get('id')!=='watch'||!$('singleModel'))return;
const K={mission:'vitals.mission.active.v1',assign:'vitals.devices.assignments.v1',profiles:'vitals.astronauts.v1',state:'vitals.devices.operations.v4',stream:'vitals.devices.wrist.stream.v5',records:'vitals.devices.wrist.observations.v5'};
function read(k,f){try{const s=localStorage.getItem(k);return s===null?f:JSON.parse(s)}catch{return f}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mission=()=>String(read(K.mission,null)?.id||'NO_ACTIVE_MISSION');
const astronaut=()=>String(read(K.assign,{})?.watch||'');
function name(id){const p=read(K.profiles,[]);const a=Array.isArray(p)?p:Array.isArray(p?.profiles)?p.profiles:Array.isArray(p?.astronauts)?p.astronauts:[];const q=a.find(x=>String(x.id||x.astronautId)===id);return q?.name||q?.fullName||q?.displayName||id||'Unassigned'}
function operation(){const o=read(K.state,{});return o?.[mission()+'::watch']||null}
function valid(){const op=operation();if(!astronaut())return 'Assign an astronaut in Mission Integration and save the assignment.';if(!op?.enabled)return 'Press START SIMULATION in Device Operations first.';if(op.connection!=='SIMULATED ONLINE')return 'The simulated link is offline.';if(op.health==='FAULT')return 'Clear the simulated device fault first.';if(!(Number(op.batteryPct)>0))return 'The simulated battery is empty.';return ''}
const schema=[
 {key:'heart_rate',label:'HEART RATE',unit:'bpm',min:48,max:160,dp:0},
 {key:'spo2',label:'OXYGEN SATURATION',unit:'%',min:90,max:100,dp:1},
 {key:'respiratory_rate',label:'RESPIRATION',unit:'/min',min:8,max:34,dp:0},
 {key:'skin_temperature',label:'SKIN TEMPERATURE',unit:'°C',min:29,max:38,dp:1},
 {key:'activity_index',label:'ACTIVITY INDEX',unit:'a.u.',min:0,max:100,dp:0},
 {key:'stress_index',label:'ILLUSTRATIVE STRESS',unit:'a.u.',min:0,max:100,dp:0}
];
const section=document.createElement('section');section.className='panel wrist-v5';section.id='wristLiveV5';
section.innerHTML=`<div class="wv-head"><div><p class="eyebrow">V.I.T.A.L.S. / WRIST MONITOR</p><h2>Live Physiological Simulation</h2><p class="note">Synthetic time series updated every 2 seconds, while this page is open. The values are illustrative and are NOT readings from a real sensor, ECG or medical device.</p></div><span class="wv-pill" id="wv-badge">SIMULATION OFF</span></div>
<div class="wv-controls"><label>TRAINING SCENARIO<select id="wv-scenario"><option value="rest">Rest / Quiet</option><option value="exercise">Exercise / Activity</option><option value="recovery">Recovery</option><option value="sleep">Sleep simulation</option></select></label><button type="button" id="wv-start">START LIVE CHARTS</button><button type="button" id="wv-stop" class="secondary">STOP CHARTS</button><button type="button" id="wv-export" class="secondary">EXPORT SERIES JSON</button><button type="button" id="wv-reset" class="secondary">CLEAR CHARTS</button></div>
<div class="wv-strip"><div><small>ASTRONAUT</small><strong id="wv-name">—</strong></div><div><small>MISSION</small><strong id="wv-mission">—</strong></div><div><small>STREAM</small><strong id="wv-stream">STOPPED</strong></div><div><small>SAMPLES IN VIEW</small><strong id="wv-count">0</strong></div></div>
<p class="wv-msg" id="wv-message" role="status">First start the device simulation and save an astronaut assignment.</p>
<div class="wv-grid" id="wv-grid">${schema.map(m=>`<div class="wv-metric"><div class="wv-metric-top"><span>${esc(m.label)}</span><strong id="wv-${m.key}">— <small>${esc(m.unit)}</small></strong></div><canvas id="wv-chart-${m.key}" height="125" aria-label="Simulated ${esc(m.label)} trend" role="img"></canvas><div class="wv-legend">SIMULATED · NOT CLINICAL</div></div>`).join('')}</div>
<div class="wv-foot"><span>Sleep state: <strong id="wv-sleep">AWAKE / NOT ASSESSED</strong></span><span>2-second demo sampling · no live hardware · no automatic medical alerts</span></div>`;
const before=$('deviceOperationsV4');if(before)before.insertAdjacentElement('afterend',section);else document.querySelector('main')?.appendChild(section);
let running=false, handle=null, scenario='rest', series=[], epoch=0,streamIdentity='', lastNumbers=null;
const streamKey=()=>mission()+'::'+astronaut();
function refreshHeader(){ $('wv-name').textContent=name(astronaut());$('wv-mission').textContent=mission();$('wv-count').textContent=String(series.length);$('wv-stream').textContent=running?'RUNNING / SYNTHETIC':'STOPPED';$('wv-badge').textContent=running?'SIMULATED LIVE':'SIMULATION OFF';$('wv-badge').classList.toggle('wv-active',running);}
function restore(){const item=read(K.stream,{});const s=item?.[streamKey()];series=Array.isArray(s)?s.slice(-90).filter(p=>p&&typeof p.timestamp==='string'&&p.values):[];lastNumbers=series.at(-1)?.values||null;draw();}
function save(){const store=read(K.stream,{});const obj=store&&typeof store==='object'&&!Array.isArray(store)?store:{};obj[streamKey()]=series.slice(-90);return write(K.stream,obj)}
function stop(message){running=false;if(handle!==null){clearInterval(handle);handle=null}refreshHeader();if(message)$('wv-message').textContent=message}
function canRun(){const problem=valid();if(problem){stop(problem);return false}if(streamIdentity!==streamKey()){stop('Mission or assigned astronaut changed. Restart charts for the new profile.');restore();return false}return true}
const mix=(a,b,t)=>a+(b-a)*Math.min(1,Math.max(0,t));
const random=(a,b)=>a+Math.random()*(b-a);
function sample(){if(!canRun())return;const t=Date.now()/1000;const elapsed=(t-epoch)/2;
 const targets={rest:[73,98.1,15,33.7,6,25],exercise:[112,96.8,24,34.8,76,66],recovery:[83,97.8,18,34.2,17,35],sleep:[61,98.2,12,33.0,1,12]};
 const [hr,spo,rr,temp,act,stress]=targets[scenario];
 const prev=lastNumbers||{heart_rate:hr,spo2:spo,respiratory_rate:rr,skin_temperature:temp,activity_index:act,stress_index:stress};
 const values={heart_rate:Math.round(mix(prev.heart_rate,hr,.21)+random(-2.4,2.4)+Math.sin(elapsed/3)*.7),spo2:+(mix(prev.spo2,spo,.25)+random(-.22,.22)).toFixed(1),respiratory_rate:Math.round(mix(prev.respiratory_rate,rr,.24)+random(-.9,.9)),skin_temperature:+(mix(prev.skin_temperature,temp,.16)+random(-.11,.11)).toFixed(1),activity_index:Math.round(mix(prev.activity_index,act,.26)+random(-3,3)),stress_index:Math.round(mix(prev.stress_index,stress,.18)+random(-3,3))};
 for(const m of schema)values[m.key]=Math.min(m.max,Math.max(m.min,values[m.key]));
 const point={timestamp:new Date().toISOString(),missionId:mission(),astronautId:astronaut(),deviceId:'watch',scenario,values,source:'synthetic_training',quality:'illustrative_unvalidated',clinicalUse:false};
 lastNumbers=values;series.push(point);if(series.length>90)series.shift();
 if(!save()){$('wv-message').textContent='Browser storage unavailable; chart is temporary in this page.';}
 const observations=read(K.records,[]);const a=Array.isArray(observations)?observations:[];for(const m of schema){a.push({schema:'vitals.device.observation.v5',timestamp:point.timestamp,missionId:point.missionId,astronautId:point.astronautId,deviceId:'watch',metric:m.key,value:values[m.key],unit:m.unit,provenance:'synthetic_training',quality:'illustrative_unvalidated',clinicalUse:false,scenario})}if(!write(K.records,a.slice(-540)))$('wv-message').textContent='Browser storage limit reached; trends remain visible in this session.';
 draw();
}
function chart(canvas,metric){if(!canvas)return;const dpr=Math.min(2,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect();const width=Math.max(100,rect.width),height=125;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
 const left=9,right=width-9,top=11,bottom=height-18;
 ctx.strokeStyle='rgba(113,196,194,.19)';ctx.lineWidth=1;for(let i=0;i<=3;i++){const y=top+(bottom-top)*i/3;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke()}
 const points=series.slice(-65).map(p=>p.values?.[metric.key]).filter(v=>Number.isFinite(v));if(!points.length){ctx.fillStyle='#8ebbc2';ctx.font='12px Arial';ctx.fillText('Waiting for simulated readings...',left+6,67);return}
 // Fixed display domain prevents misleading jumping axes when data variance is small.
 const lo=metric.min,hi=metric.max, count=Math.max(1,points.length-1),x=i=>left+i/count*(right-left),y=v=>bottom-(v-lo)/(hi-lo)*(bottom-top);
 ctx.strokeStyle='#54eadc';ctx.lineWidth=2.4;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.stroke();const v=points.at(-1),px=x(points.length-1),py=y(v);ctx.fillStyle='#e5fcf7';ctx.beginPath();ctx.arc(px,py,3.7,0,Math.PI*2);ctx.fill();ctx.font='10px Arial';ctx.fillStyle='#8ebbc2';ctx.fillText('latest',Math.max(left, right-29),height-4);
}
function draw(){refreshHeader();schema.forEach(m=>{const value=lastNumbers?.[m.key];$( 'wv-'+m.key).innerHTML=value===undefined?'— <small>'+esc(m.unit)+'</small>':esc(Number(value).toFixed(m.dp))+' <small>'+esc(m.unit)+'</small>';chart($('wv-chart-'+m.key),m)});$('wv-sleep').textContent=scenario==='sleep'&&series.length?'SIMULATED SLEEP PERIOD':'AWAKE / NOT ASSESSED'}
$('wv-scenario').addEventListener('change',e=>{scenario=e.target.value;$('wv-message').textContent='Scenario set to '+scenario+'. Values will transition gradually (illustrative only).';draw()});
$('wv-start').addEventListener('click',()=>{if(running)return;const problem=valid();if(problem){$('wv-message').textContent=problem;return}streamIdentity=streamKey();epoch=Date.now()/1000;running=true;$('wv-message').textContent='Synthetic charts running. No real physiological signal is connected.';refreshHeader();sample();handle=setInterval(sample,2000)});
$('wv-stop').addEventListener('click',()=>stop('Charts paused. Saved observations remain available locally.'));
$('wv-reset').addEventListener('click',()=>{stop('Charts cleared for the current astronaut and mission.');series=[];lastNumbers=null;save();draw()});
$('wv-export').addEventListener('click',()=>{if(!series.length){$('wv-message').textContent='No simulated chart points to export.';return}const blob=new Blob([JSON.stringify({schema:'vitals.devices.wrist.series.export.v5',classification:'synthetic_training',missionId:mission(),astronautId:astronaut(),deviceId:'watch',records:series},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='VITALS_Wrist_Synthetic_Series.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)});
window.addEventListener('storage',e=>{if([K.assign,K.state,K.mission].includes(e.key)){if(running)canRun();draw()}});
window.addEventListener('vitals-device-v4-update',()=>{if(running)canRun()});
$('saveAssignment')?.addEventListener('click',()=>{const prev=streamIdentity;queueMicrotask(()=>{if(running&&prev!==streamKey())stop('Astronaut assignment changed. Restart the chart.');restore()})});
$('clearAssignment')?.addEventListener('click',()=>{stop('No assigned astronaut.');series=[];lastNumbers=null;draw()});
let resizeObserver;if(typeof ResizeObserver!=='undefined'){resizeObserver=new ResizeObserver(()=>draw());resizeObserver.observe($('wv-grid'))}else window.addEventListener('resize',draw);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop('Page hidden: simulation paused to avoid unobserved background recording.')});
restore();
})();
