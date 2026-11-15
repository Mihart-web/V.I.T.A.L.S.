/* V.I.T.A.L.S. Digital Twin V9 - EXPLICIT synthetic mission simulation.
   Does not create, overwrite, or impersonate device observations, tests, or clinical records.
   Illustrative scenario parameters are NOT NASA calibrated. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const KEY='vitals.digitalTwin.missionSimulation.v9';
const safe=(key,def)=>{try{const s=localStorage.getItem(key);return s===null?def:JSON.parse(s)}catch{return def}};
const arr=v=>Array.isArray(v)?v:[];
const numerical=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v);
const clip=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const e=s=>String(s??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const rand=(lo,hi)=>lo+Math.random()*(hi-lo);
const mission=()=>safe('vitals.mission.active.v1',null);
const selected=()=>String($('astronaut')?.value||'');
const listProfiles=()=>{const raw=safe('vitals.astronauts.v1',[]);return arr(Array.isArray(raw)?raw:raw?.profiles||raw?.astronauts)};
const profile=id=>listProfiles().find(p=>String(p?.id||p?.astronautId||'')===id)||null;
const name=p=>String(p?.fullName||p?.name||p?.displayName||p?.id||'Unknown astronaut');
const category=(n,otherwise)=>numerical(n)===null?otherwise:Number(n);
const rounded=(n,d=1)=>Number(n.toFixed(d));
const SCENARIOS={
  rest:{label:'Rest / Habitat',hr:0,resp:0,spo:0,temp:0,act:13,focus:0,stress:18,motion:8},
  exercise:{label:'Exercise / Habitat',hr:34,resp:9,spo:-1,temp:.8,act:70,focus:-4,stress:43,motion:75},
  eva:{label:'EVA Training',hr:24,resp:7,spo:-2,temp:.5,act:49,focus:-7,stress:60,motion:53},
  recovery:{label:'Recovery',hr:9,resp:2,spo:0,temp:.2,act:28,focus:-2,stress:24,motion:20}
};
let active=false,elapsed=0,timer=null,current=null,series=[],contextKey='',lastRender=0,paintedBarsSignature='';
function key(){return `${mission()?.id||''}::${selected()}`}
function extractBaseline(){const p=profile(selected()),m=p?.metrics||{};return {
 hr:category(m.restingHeartRateBpm,72),spo:category(m.oxygenSaturationPct,97),resp:category(m.respiratoryRatePerMin,16),temp:category(m.skinTemperatureC,33.5),
 focus:numerical(m.focusTaskAccuracyPct),stress:numerical(m.stressSelfReport10),name:name(p||{id:selected()}),hasProfile:!!p};}
function storage(){return safe(KEY,{})}
function previous(){const x=storage()[key()];return arr(x?.samples).filter(r=>r?.classification==='synthetic_training_v9'&&r?.missionId===mission()?.id&&r?.astronautId===selected()).slice(-160)}
function persist(sample){const root=storage(),k=key();const old=arr(root[k]?.samples);old.push(sample);root[k]={schema:'vitals.digitalTwin.missionSimulation.v9',missionId:sample.missionId,astronautId:sample.astronautId,classification:'synthetic_training_v9',samples:old.slice(-320)};try{localStorage.setItem(KEY,JSON.stringify(root));return true}catch{return false}}
function mount(){const main=document.querySelector('.maincol'),stage=main?.querySelector('.stage');if(!main||!stage||$('dtv9Control'))return false;
const box=document.createElement('section');box.id='dtv9Control';box.className='panel dtv9-panel';box.innerHTML=`
 <div class="sectionline"><div><p class="eyebrow">MISSION SIMULATION / V9</p><h2>Digital Twin · Mission Telemetry Simulator</h2></div><span class="dtv9-chip" id="dtv9Chip">BASELINE / RECORDED</span></div>
 <p class="note">Independent training stream anchored to the selected astronaut's synthetic profile. No device is connected; this is NOT live clinical monitoring or a NASA-calibrated physiological model.</p>
 <div class="dtv9-actions">
 <label>DISPLAY MODE<select id="dtv9Mode"><option value="baseline">Baseline / recorded</option><option value="live">Live mission simulation</option><option value="history">Saved V9 demo history</option></select></label>
 <label>TRAINING SCENARIO<select id="dtv9Scenario"><option value="rest">Rest / Habitat</option><option value="exercise">Exercise / Habitat</option><option value="eva">EVA Training</option><option value="recovery">Recovery</option></select></label>
 <button type="button" id="dtv9Start">START LIVE SIMULATION</button><button type="button" class="outline" id="dtv9Stop">STOP</button>
 </div>
 <div id="dtv9Banner" class="dtv9-banner" role="status">Choose Live mission simulation, then press START. Synthetic baseline values never change in the astronaut profile.</div>
 <div class="dtv9-readouts">
 <div><small>HEART RATE</small><strong id="dtv9HR">—</strong><span>bpm · synthetic</span></div>
 <div><small>OXYGEN SATURATION</small><strong id="dtv9Spo">—</strong><span>% · synthetic</span></div>
 <div><small>RESPIRATION</small><strong id="dtv9Resp">—</strong><span>/min · synthetic</span></div>
 <div><small>SKIN TEMPERATURE</small><strong id="dtv9Temp">—</strong><span>°C · synthetic</span></div>
 <div><small>MUSCLE ACTIVITY</small><strong id="dtv9Muscle">—</strong><span>illustrative a.u.</span></div>
 <div><small>COGNITIVE TASK PROXY</small><strong id="dtv9Focus">—</strong><span>% · illustrative, not a test</span></div>
 </div>
 <div class="dtv9-context">Mission: <strong id="dtv9Mission">—</strong> · Astronaut: <strong id="dtv9Person">—</strong> · Environment: <strong id="dtv9Destination">—</strong> · Samples: <strong id="dtv9Count">0</strong></div>
 <div class="dtv9-livecharts">
 <article><h3>Heart rate <small>bpm</small></h3><svg id="dtv9ChartHR" viewBox="0 0 450 130" aria-label="Synthetic heart rate series"></svg></article>
 <article><h3>Oxygen saturation <small>%</small></h3><svg id="dtv9ChartSpo" viewBox="0 0 450 130" aria-label="Synthetic oxygen saturation series"></svg></article>
 <article><h3>Muscle activation <small>illustrative units</small></h3><svg id="dtv9ChartMuscle" viewBox="0 0 450 130" aria-label="Synthetic muscle activity series"></svg></article>
 </div>
 <p class="note">Only V9 demo samples are written to a separate localStorage key. Wrist Monitor, BioLoad, completed cognitive tests, clinical history, mission configuration, and NASA reference files are never modified.</p>`;
main.insertBefore(box,stage);
$('dtv9Start').addEventListener('click',start);$('dtv9Stop').addEventListener('click',()=>stop('Simulation stopped. Existing V9 demo history preserved.'));
$('dtv9Mode').addEventListener('change',()=>{const mode=$('dtv9Mode').value;if(active)stop('Display mode changed. Simulation stopped.');if(mode==='history'){series=previous();current=series.at(-1)||null;}else{current=null;series=[];}update();});
$('dtv9Scenario').addEventListener('change',()=>{if(active){stop('Scenario changed. Press START to begin a new synthetic series.');}});
$('astronaut')?.addEventListener('change',()=>{stop('Astronaut changed. Press START to generate data for this astronaut.');current=null;series=[];update()});
window.addEventListener('pagehide',()=>stop(''));
window.addEventListener('storage',ev=>{if([KEY,'vitals.mission.active.v1','vitals.astronauts.v1'].includes(ev.key)){if(active&&key()!==contextKey)stop('Mission context changed. Simulation stopped.');if(!active&&$('dtv9Mode').value==='history'){series=previous();current=series.at(-1)||null;update()}}});
setInterval(()=>{if(active&&key()!==contextKey)stop('Mission or astronaut context changed. Simulation stopped.');if(active&&current)syncDisplay();},600);
update();return true;}
function start(){const mid=mission()?.id,id=selected(),p=profile(id);if(!mid||!id||!p){$('dtv9Banner').textContent='Select an active mission and a registered astronaut profile before starting.';return;}
stop('');$('dtv9Mode').value='live';contextKey=key();active=true;elapsed=0;series=[];current=null;
$('dtv9Chip').textContent='LIVE SYNTHETIC DEMO';$('dtv9Chip').className='dtv9-chip live';
produce();timer=setInterval(produce,2000);}
function stop(message){const wasActive=active;active=false;if(timer){clearInterval(timer);timer=null;}document.body.classList.remove('dtv9-running');clearDemoHotspots();if(message)$('dtv9Banner').textContent=message;
$('dtv9Chip').className='dtv9-chip';$('dtv9Chip').textContent=$('dtv9Mode')?.value==='history'?'SAVED V9 DEMO':'BASELINE / RECORDED';if(wasActive&&$('dtv9Mode')?.value==='live'){$('dtv9Mode').value='history';series=previous();current=series.at(-1)||null;update()}else if(!active)update();}
function produce(){if(!active)return;if(key()!==contextKey){stop('Context changed. Stream stopped.');return;}
const baseline=extractBaseline(),scenario=$('dtv9Scenario').value,s=SCENARIOS[scenario]||SCENARIOS.rest,t=elapsed++;
// Arbitrary demonstration offsets; planetary location is CONTEXT ONLY.
const wave=Math.sin(t*.42)*2.6+Math.sin(t*.13)*1.4;
const hr=rounded(clip(baseline.hr+s.hr+wave+rand(-2.2,2.2),40,180),0);
const spo=rounded(clip(baseline.spo+s.spo+Math.sin(t*.24)*.35+rand(-.3,.3),84,100),1);
const resp=rounded(clip(baseline.resp+s.resp+Math.sin(t*.31)*.6+rand(-.7,.7),6,42),1);
const temp=rounded(clip(baseline.temp+s.temp+Math.sin(t*.21)*.12+rand(-.08,.08),28,41),1);
const muscle=rounded(clip(s.act+Math.sin(t*.28)*4+rand(-3,3),0,100),1);
const cognitive=baseline.focus===null?null:rounded(clip(baseline.focus+s.focus+Math.sin(t*.27)*1.5+rand(-1,1),0,100),1);
const stress=rounded(clip(s.stress+rand(-3,3),0,100),1);
const sample={schema:'vitals.digitalTwin.simulatedSample.v9',classification:'synthetic_training_v9',clinicalUse:false,source:'digital_twin_simulator_not_a_device',quality:'illustrative_unvalidated',timestamp:new Date().toISOString(),missionId:mission().id,astronautId:selected(),destination:String(mission()?.destination||'unknown'),scenario,hr,spo,resp,temp,muscle,cognitive,stress};
if(!persist(sample)){$('dtv9Banner').textContent='Storage full or unavailable. Current simulated values shown but not saved.';}
current=sample;series.push(sample);series=series.slice(-120);update();}
function classify(s){if(!s)return[];const reference=extractBaseline();
const hrDiff=s.hr-reference.hr,spoDiff=reference.spo-s.spo;
const card=hrDiff>=45?'red':hrDiff>=26?'yellow':'green';const resp=spoDiff>=8?'red':spoDiff>=4?'yellow':'green';const muscle=s.muscle>=75?'yellow':'green';
const cognitive=s.cognitive===null?'unknown':s.cognitive<reference.focus-12?'yellow':'green';
return [
{key:'cardio',name:'Cardiovascular',color:card,reason:`Illustrative heart-rate difference ${hrDiff>=0?'+':''}${hrDiff.toFixed(0)} bpm from preflight reference`},
{key:'resp',name:'Respiratory',color:resp,reason:`Illustrative oxygen change ${(s.spo-reference.spo).toFixed(1)} percentage points from preflight reference`},
{key:'muscle',name:'Musculoskeletal',color:muscle,reason:`Synthetic muscle activation ${s.muscle.toFixed(1)} a.u. (not EMG)`},
{key:'cognitive',name:'Cognitive & behavioral',color:cognitive,reason:s.cognitive===null?'No individual task reference available':'Simulated task proxy (NOT a cognitive-test result)'},
{key:'environment',name:'Environment / radiation',color:'blue',reason:`${s.destination.toUpperCase()} is mission context; NO astronaut-specific dose or environmental sensor reading`},
{key:'clinical',name:'Clinical reference',color:reference.hasProfile?'blue':'unknown',reason:reference.hasProfile?'Synthetic preflight profile present; not a real-time clinical assessment':'No profile'}];}
function paintBars(s){const bars=$('dtv2Bars');if(!bars||!s)return;const info=classify(s);const signature=`${s.timestamp}:${s.scenario}:${selected()}`;
if(bars.dataset.dtv9Sample===signature&&bars.querySelector('[data-dtv9-domain]'))return;
bars.dataset.dtv9Sample=signature;
bars.innerHTML=info.map(d=>{const count=d.color==='unknown'?0:d.color==='green'?12:d.color==='blue'?5:d.color==='yellow'?8:12;return `<div class="dtv2-bar" data-dtv9-domain="${e(d.key)}" title="${e(d.reason)}"><div class="dtv2-barhead"><span>${e(d.name)}</span><strong>${e(d.color==='unknown'?'NO DATA':d.color==='green'?'DEMO NORMAL':d.color==='blue'?'REVIEW':d.color==='yellow'?'CAUTION':'HIGH DEMO PRIORITY')}</strong></div><div class="dtv2-segments">${Array.from({length:12},(_,i)=>`<i class="${i<count?d.color:''}"></i>`).join('')}</div><div class="dtv2-barreason">${e(d.reason)}</div></div>`}).join('');
const level=$('dtv2Level'),reason=$('dtv2Reason');const severity=info.some(d=>d.color==='red')?'red':info.some(d=>d.color==='yellow')?'yellow':'blue';if(level){level.className=severity;level.textContent=severity==='red'?'HIGH DEMO PRIORITY':severity==='yellow'?'CAUTION':'REVIEW'}if(reason)reason.textContent=`V9 LIVE SIMULATION - ${s.scenario.toUpperCase()}. These bars reflect unvalidated demo rules for V9 generated samples, not health percentage, diagnosis, real sensors or flight-readiness.`;
updateHotspots(info);}
function updateHotspots(info){const model=$('humanModel');if(!model)return;clearDemoHotspots();
const dim=model.getDimensions?.()||{x:1,y:2,z:.6},center=model.getBoundingBoxCenter?.()||{x:0,y:0,z:0};const positions={cardio:[.02,.16,.19],resp:[-.12,.13,.18],muscle:[.12,-.19,.15],cognitive:[.01,.37,.12]};
for(const d of info.filter(d=>['red','yellow'].includes(d.color))){const v=positions[d.key];if(!v)continue;const btn=document.createElement('button');btn.className=`dtv9-hotspot ${d.color}`;btn.slot='hotspot-v9-'+d.key;btn.dataset.position=`${center.x+v[0]*dim.x}m ${center.y+v[1]*dim.y}m ${center.z+v[2]*dim.z}m`;btn.dataset.normal='0m 0m 1m';btn.title=d.name+': '+d.reason;btn.setAttribute('aria-label',btn.title);btn.textContent='!';btn.addEventListener('click',()=>{$('dtv9Banner').textContent=`${d.name} - ${d.reason}. Demonstration only; human review required.`});model.append(btn)}model.updateHotspot?.();}
function clearDemoHotspots(){const model=$('humanModel');model?.querySelectorAll('.dtv9-hotspot').forEach(n=>n.remove())}
function changeMetric(id,prov,value,unit,digits=0){const node=$(id),label=$(prov);if(node&&numerical(value)!==null)node.textContent=`${Number(value).toFixed(digits)} ${unit}`;if(label)label.textContent='LIVE SYNTHETIC V9 · NOT SENSOR DATA'}
function syncDisplay(){if(!active||!current)return;document.body.classList.add('dtv9-running');
changeMetric('heartMetric','heartProv',current.hr,'bpm');changeMetric('oxygenMetric','oxygenProv',current.spo,'%',1);changeMetric('respMetric','respProv',current.resp,'/min',1);changeMetric('tempMetric','tempProv',current.temp,'°C',1);
changeMetric('muscleMetric','muscleProv',current.muscle,'a.u.',1);if(current.cognitive!==null)changeMetric('cognitiveMetric','cognitiveProv',current.cognitive,'%',1);
paintBars(current);}
function renderGraph(id,metric,color,low,high){const svg=$(id);if(!svg)return;const ns='http://www.w3.org/2000/svg';svg.replaceChildren();for(let i=0;i<4;i++){const line=document.createElementNS(ns,'line');for(const [k,v] of Object.entries({x1:'20',x2:'435',y1:String(15+i*33),y2:String(15+i*33),stroke:'#28586a','stroke-opacity':'.65'}))line.setAttribute(k,v);svg.append(line)}if(series.length<2){const txt=document.createElementNS(ns,'text');for(const [k,v] of Object.entries({x:'225',y:'73','text-anchor':'middle',fill:'#85b5bf','font-size':'12'}))txt.setAttribute(k,v);txt.textContent='Waiting for 2 synthetic samples...';svg.append(txt);return}const data=series.slice(-60),poly=document.createElementNS(ns,'polyline');poly.setAttribute('fill','none');poly.setAttribute('stroke',color);poly.setAttribute('stroke-width','2.7');poly.setAttribute('stroke-linecap','round');poly.setAttribute('stroke-linejoin','round');poly.setAttribute('points',data.map((r,i)=>`${20+415*i/(data.length-1)},${115-clip((r[metric]-low)/(high-low),0,1)*95}`).join(' '));svg.append(poly)}
function update(){if(!$('dtv9Control'))return;const mid=mission()?.id||'NO MISSION',p=profile(selected());$('dtv9Mission').textContent=mid;$('dtv9Person').textContent=p?name(p):selected()||'NO ASTRONAUT';$('dtv9Destination').textContent=String(mission()?.destination||'NOT SET').toUpperCase();$('dtv9Count').textContent=String(series.length);
const s=current,mode=$('dtv9Mode').value;
for(const [el,value] of [['dtv9HR',s?.hr],['dtv9Spo',s?.spo],['dtv9Resp',s?.resp],['dtv9Temp',s?.temp],['dtv9Muscle',s?.muscle],['dtv9Focus',s?.cognitive]])$(el).textContent=numerical(value)===null?'—':String(value);
if(active){$('dtv9Banner').textContent=`LIVE SYNTHETIC V9 · ${SCENARIOS[s?.scenario]?.label||'Mission'} · ${p?name(p):selected()} · ${mid}. New sample every 2 seconds. Environmental destination is context, NOT a calibrated physiology adjustment.`;syncDisplay();}
else if(mode==='history'){$('dtv9Banner').textContent=`Saved training series for ${mid} / ${p?name(p):selected()}: ${series.length} displayed samples. These are NOT real device observations.`;}
else{$('dtv9Banner').textContent='Baseline / recorded view. Start a Live mission simulation to generate NEW synthetic readings; your original profile and existing medical records are unchanged.';}
renderGraph('dtv9ChartHR','hr','#6be7cc',45,160);renderGraph('dtv9ChartSpo','spo','#66bffa',85,100);renderGraph('dtv9ChartMuscle','muscle','#f1bc80',0,100);
}
function begin(){if(mount()){const mode=$('dtv9Mode');mode.value='baseline';}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
})();
