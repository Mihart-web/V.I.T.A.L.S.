/* V.I.T.A.L.S. Digital Twin V6 - attributed evidence integration.
 * Read-only. Does not produce clinical scores, diagnoses, hardware commands or data migrations.
 * Never reads private journals or assumes an anonymous record belongs to the chosen astronaut.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id), read=(k,fallback=null)=>{try{const x=localStorage.getItem(k);return x===null?fallback:JSON.parse(x)}catch{return fallback}};
const arr=x=>Array.isArray(x)?x:[], text=v=>String(v??''), num=x=>x===null||x===undefined||x===''||!Number.isFinite(Number(x))?null:Number(x);
const safe=x=>text(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const ms=x=>{const t=Date.parse(x||'');return Number.isFinite(t)?t:0};
const keys={mission:'vitals.mission.active.v1',crew:'vitals.mission.crew.v1',profiles:'vitals.astronauts.v1',wrist:'vitals.devices.wrist.observations.v5',bio:'vitals.devices.bioload.observations.v6',baseline:'vitals.medical.musculoskeletal.trainingBaseline.v1',checkin:'vitals.cognitive.twin.events.v1',exposure:'vitals.medical.environment.dailyExposure.v2'};
const cognitive=[['Focus','vitals.focus.sessions.v1','finished_at',r=>r.summary?.accuracy_percent],['Working memory','vitals.cognitive.working-memory.sessions.v1','endTime',r=>r.accuracyPercent],['Category match','vitals.cognitive.category-match.sessions.v1','finishedAt',r=>r.f1Percent],['Flexibility','vitals.cognitive.flexibility.sessions.v1','completed_at',r=>r.accuracy_percent],['Reaction time','vitals.cognitive.reaction.sessions.v1','ended_at',r=>r.accuracy_percent]];
let lastSignature='';
function create(){if($('dtv6Panel'))return;const container=document.querySelector('.maincol');const anchor=container?.querySelector('.stage');if(!container||!anchor)return;
const panel=document.createElement('section');panel.className='panel dtv6-panel';panel.id='dtv6Panel';panel.innerHTML=`<div class="sectionline"><div><p class="eyebrow">DATA INTEGRATION / V6</p><h2>Connected evidence · Selected astronaut</h2></div><button type="button" id="dtv6Refresh">REFRESH SOURCES</button></div><p class="note">Only records explicitly attributed to the selected astronaut and, where required, the active mission are shown. Source timestamps and synthetic provenance remain visible. No data are duplicated or changed.</p><div class="dtv6-head" id="dtv6Context"></div><div class="dtv6-grid" id="dtv6Grid"></div><div class="dtv6-note" id="dtv6Summary"></div>`;
anchor.insertAdjacentElement('afterend',panel);$('dtv6Refresh')?.addEventListener('click',()=>render(true));
}
function card(label,state,details,url){return `<article class="dtv6-card"><div class="dtv6-title"><strong>${safe(label)}</strong><span class="dtv6-state ${safe(state)}">${state==='recent'?'RECENT SYNTHETIC':state==='saved'?'STORED':state==='context'?'CONTEXT ONLY':state==='unassigned'?'UNATTRIBUTED':'NO DATA'}</span></div><p>${safe(details)}</p>${url?`<a href="${url}">OPEN SOURCE</a>`:''}</article>`;}
function render(force=false){create();if(!$('dtv6Panel'))return;const mission=read(keys.mission),pid=$('astronaut')?.value||'',mid=String(mission?.id||'');
const raw=read(keys.profiles,[]),profiles=arr(Array.isArray(raw)?raw:raw?.profiles||raw?.astronauts),profile=profiles.find(p=>String(p?.id||p?.astronautId)===pid);
const name=profile?.fullName||profile?.name||profile?.displayName||pid||'No selected astronaut';
const roster=read(keys.crew),verified=!!(mission&&pid&&arr(roster?.members).some(x=>String(x.astronautId)===pid)&&(!roster.missionName||roster.missionName===mission.name)&&(!roster.destination||String(roster.destination).toLowerCase()===String(mission.destination||'').toLowerCase()));
const now=Date.now(); const last=xs=>xs.length?xs[xs.length-1]:null; const stamp=x=>ms(x?.timestamp||x?.recordedAt||x?.createdAt||x?.at); const when=x=>stamp(x)?new Date(stamp(x)).toLocaleString('en-GB'):'Unknown timestamp';
const observation=k=>arr(read(k,[])).filter(x=>x?.astronautId===pid&&x.missionId===mid&&x.provenance==='synthetic_training'&&x.clinicalUse===false&&stamp(x)).sort((a,b)=>stamp(a)-stamp(b));
const wrist=verified?observation(keys.wrist):[],bio=verified?observation(keys.bio):[];
const cognitiveEntries=cognitive.map(([label,key,field,extract])=>{const hits=verified?arr(read(key,[])).filter(x=>x?.astronautId===pid&&num(extract(x))!==null&&ms(x[field]||x.timestamp)).sort((a,b)=>ms(a[field]||a.timestamp)-ms(b[field]||b.timestamp)):[];return {label,records:hits,score:hits.length?num(extract(last(hits))):null}});
const tasks=cognitiveEntries.filter(x=>x.score!==null);const events=verified?arr(read(keys.checkin,[])).filter(x=>x?.eventType==='wellbeing-checkin'&&x?.astronautId===pid&&x?.ratings&&stamp(x)).sort((a,b)=>stamp(a)-stamp(b)):[];
const unassigned=arr(read(keys.checkin,[])).filter(x=>x?.eventType==='wellbeing-checkin'&&!x.astronautId&&x?.ratings).length;
const baselines=read(keys.baseline,{})||{},base=verified?baselines[mid+'::'+pid]:null;
const incidents=verified?arr(read('vitals.medical.lifeSavingPack.trainingEvents.v2.'+encodeURIComponent(mid),[])).filter(x=>x?.schema==='vitals.lsp.trainingEvent.v2'&&x?.missionId===mid&&x?.astronautId===pid):[];
const open=incidents.filter(x=>x.status!=='RESOLVED');
// The Environment module currently creates scenario results in memory; do not present saved per-crew dosimetry unless it is explicitly persisted with identity.
const exposureRaw=read(keys.exposure,null);const exposures=arr(exposureRaw).filter(x=>x?.astronautId===pid&&x?.missionId===mid&&x?.liveDosimetry===false&&x?.medicalPrediction===false);
const clinicalMetrics=profile?.metrics||{};const clinicalCount=Object.keys(clinicalMetrics).filter(k=>num(clinicalMetrics[k])!==null).length;
const stateFor=items=>items.length?(now-stamp(last(items))<=30000?'recent':'saved'):'missing';
const notes=[];if(!verified)notes.push('No verified selected astronaut / mission roster match; person-specific feeds are intentionally hidden.');
let cards=[];
cards.push(card('Wrist Monitor',stateFor(wrist),wrist.length?`${wrist.length} synthetic metric records. Latest ${when(last(wrist))}.`: 'No wrist readings matched to this astronaut and mission.','../../devices/device.html?id=wrist'));
cards.push(card('BioLoad',stateFor(bio),bio.length?`${bio.length} synthetic muscle samples. Last region: ${last(bio).muscleRegion||'unspecified'}. Latest ${when(last(bio))}.`:'No BioLoad samples matched to this astronaut and mission.','../../devices/device.html?id=bioload'));
cards.push(card('Musculoskeletal baseline',base?'saved':'missing',base?`Manual functional index ${num(base.strength)??'—'}; saved ${when(base)}. Not a measured bone density.`:'No manual training baseline saved for this astronaut and mission.','./musculoskeletal-health.html'));
cards.push(card('Cognitive tasks',tasks.length?'saved':'missing',tasks.length?`${tasks.length}/5 tasks available: ${tasks.map(t=>t.label+' '+t.score.toFixed(1)+'%').join(' · ')}. Different tests use different scoring rules.`:'No completed task with explicitly matching astronaut ID.','../../psychological-neurological/games/cognitive-twin.html'));
cards.push(card('Psychological check-ins',events.length?'saved':unassigned?'unassigned':'missing',events.length?`${events.length} attributed numeric check-in(s), latest ${when(last(events))}. No private journal is accessed.`:unassigned?`${unassigned} shared numeric check-in(s) exist without an astronaut ID. They cannot be assigned automatically.`:'No attributable wellbeing check-in. Private journal remains excluded.','../../psychological-neurological/pages/wellbeing.html'));
cards.push(card('Clinical profile',clinicalCount?'context':'missing',clinicalCount?`${clinicalCount} numeric profile fields are present. Provenance must be checked; this is not a clinical risk multiplier.`:'No numeric clinical profile fields for this astronaut.',null));
cards.push(card('Environment / radiation',exposures.length?'saved':mission?'context':'missing',exposures.length?`${exposures.length} explicitly attributed saved hypothetical scenario(s). No live dosimeter.`:mission?`Destination ${mission.destination||'unknown'} is mission context. No verified individual radiation dose is stored by the current scenario tool.`:'No active mission context.','./environmental-radiation.html'));
cards.push(card('Life-Saving Pack training alerts',open.length?'saved':incidents.length?'saved':'missing',incidents.length?`${open.length} unresolved / ${incidents.length} total MANUAL TRAINING events; not detected physiological emergencies.`:'No manually created training incidents for this astronaut and mission.','./life-saving-pack.html'));
const sig=JSON.stringify([pid,mid,verified,wrist.length,bio.length,tasks.map(t=>t.score),events.length,unassigned,!!base,clinicalCount,exposures.length,open.length,incidents.length]);if(!force&&lastSignature===sig)return;lastSignature=sig;
$('dtv6Context').textContent=`${name} · ${mid||'NO ACTIVE MISSION'} · ${verified?'VERIFIED CREW MEMBER':'UNVERIFIED CREW / MISSION'}`;
$('dtv6Grid').innerHTML=cards.join('');
$('dtv6Summary').textContent=`Data sources with attributable records: ${[wrist.length,bio.length,!!base,tasks.length,events.length,clinicalCount,exposures.length,incidents.length].filter(Boolean).length}/8. ${notes.join(' ')} Missing or anonymous records are not interpreted as healthy, unhealthy or zero. Existing V2 attention bars remain illustrative.`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render(true);init()},{once:true});else{render(true);init()}
function init(){const sel=$('astronaut');sel?.addEventListener('change',()=>render(true));$('refresh')?.addEventListener('click',()=>render(true));window.addEventListener('storage',()=>render(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(true)});setInterval(()=>{if(!document.hidden)render()},3500)}
})();
