"use strict";
/* V.I.T.A.L.S. Cognitive Twin v1. Independent local research-demo dashboard.
 * No clinical diagnosis or astronaut fitness certification. No journal access.
 * Never silently attribute anonymous historical sessions to an astronaut.
 */
(() => {
 const $=id=>document.getElementById(id);
 const PROFILE_KEY='vitals.cognitive.profiles.v1',ACTIVE_KEY='vitals.activeAstronautId.v1';
 const TASKS={
  focus:{title:'FOCUS',file:'focus.html',key:'vitals.focus.sessions.v1',desc:'Radar target detection. Accuracy = targets hit / total targets.'},
  memory:{title:'WORKING MEMORY',file:'memory.html',key:'vitals.cognitive.working-memory.sessions.v1',desc:'Sequence recall. Accuracy = successfully repeated rounds / attempted rounds (including retries).'},
  categories:{title:'CATEGORY MATCH',file:'categories.html',key:'vitals.cognitive.category-match.sessions.v1',desc:'Word-category selection. The reported percentage is selection F1, not simple trial accuracy.'},
  flexibility:{title:'COGNITIVE FLEXIBILITY',file:'flexibility.html',key:'vitals.cognitive.flexibility.sessions.v1',desc:'Rule switching. Accuracy = correct eligible trials / attempted eligible trials.'},
  reaction:{title:'REACTION TIME',file:'reaction.html',key:'vitals.cognitive.reaction.sessions.v1',desc:'GO/STOP and directional reactions. Accuracy = correct responses / completed trials.'},
  wellbeing:{title:'PSYCHOLOGICAL WELLBEING',file:'wellbeing.html',key:'vitals.cognitive.twin.events.v1',desc:'Optional, explicitly shared numeric self-reports (1–10). Not a pass/fail test; private journal text is excluded.'}
 };
 const cognitiveKeys=Object.keys(TASKS).filter(k=>k!=='wellbeing');
 let activeTab='focus',selectedSession=null;
 function read(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
 function write(k,data){try{localStorage.setItem(k,JSON.stringify(data));return true;}catch{return false;}}
 function profiles(){return read(PROFILE_KEY).filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string');}
 function activeId(){const id=localStorage.getItem(ACTIVE_KEY)||'';return profiles().some(p=>p.id===id)?id:'';}
 function records(key){return read(TASKS[key].key).map((r,index)=>({record:r,index,key:TASKS[key].key})).filter(x=>x.record&&typeof x.record==='object'&& (key!=='wellbeing'||x.record.eventType==='wellbeing-checkin'));}
 function own(key,id){return id?records(key).filter(x=>x.record.astronautId===id):[];}
 function when(key,r){let v=key==='focus'?r.finished_at:key==='memory'?r.endTime:key==='categories'?r.finishedAt:key==='flexibility'?r.completed_at:key==='reaction'?r.ended_at:r.timestamp;return v&&Number.isFinite(Date.parse(v))?v:null;}
 function dateString(key,r){const v=when(key,r);return v?new Date(v).toLocaleString():'Unknown date';}
 function score(key,r){const n={focus:r.summary?.accuracy_percent,memory:r.accuracyPercent,categories:r.f1Percent,flexibility:r.accuracy_percent,reaction:r.accuracy_percent}[key];return key==='wellbeing'?null:Number.isFinite(Number(n))&&n!=null?Math.max(0,Math.min(100,Number(n))):null;}
 function errorCount(key,r){const e={focus:r.summary?.errors,memory:r.errors,categories:r.errors?.length,flexibility:r.errors,reaction:r.errors}[key];return key==='wellbeing'?null:Number.isFinite(Number(e))?Number(e):null;}
 function responseMs(key,r){const v={focus:r.summary?.mean_response_ms,memory:null,categories:null,flexibility:r.mean_response_ms,reaction:r.mean_reaction_ms}[key];return v==null||!Number.isFinite(Number(v))?null:Number(v);}
 function percent(n){return n==null?'—':`${Number(n).toFixed(1)}%`;}
 function last(arr,key){return arr.slice().sort((a,b)=>(Date.parse(when(key,a.record)||0)||0)-(Date.parse(when(key,b.record)||0)||0)).at(-1)||null;}
 function el(tag,txt,cls){const n=document.createElement(tag);if(txt!==undefined)n.textContent=String(txt);if(cls)n.className=cls;return n;}
 function setStatus(text){$('actionStatus').textContent=text;}
 function download(file,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=file;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
 function selectProfiles(){const previous=activeId();$('profileSelect').replaceChildren(new Option('No astronaut selected',''));
   profiles().forEach(p=>$('profileSelect').append(new Option(`${p.name} (${p.id})`,p.id)));
   $('profileSelect').value=previous;$('profileStatus').textContent=previous?`Active local profile: ${profiles().find(p=>p.id===previous).name} (${previous}). New game sessions will be tagged to this profile.`:'Select/create a profile before starting new games. No existing anonymous session is assigned automatically.';
 }
 $('backTo').addEventListener('change',e=>{if(e.target.value)location.href=e.target.value;});
 $('addProfile').addEventListener('click',()=>{const id=$('profileId').value.trim(),name=$('profileName').value.trim();if(!/^[A-Za-z0-9_-]{2,40}$/.test(id)||name.length<2){$('profileStatus').textContent='Enter a unique ID (2–40 letters/numbers/_/-) and a display name (at least 2 characters).';return;}const list=profiles();if(list.some(p=>p.id===id)){$('profileStatus').textContent='This profile ID already exists.';return;}list.push({id,name,createdAt:new Date().toISOString(),synthetic:true});if(!write(PROFILE_KEY,list)){$('profileStatus').textContent='Local storage unavailable; profile not saved.';return;}localStorage.setItem(ACTIVE_KEY,id);$('profileId').value='';$('profileName').value='';refresh();});
 $('profileSelect').addEventListener('change',e=>{const id=e.target.value;if(id&&!profiles().some(p=>p.id===id))return;localStorage.setItem(ACTIVE_KEY,id);selectedSession=null;refresh();});
 function reportDashboard(){const id=activeId();const scores=cognitiveKeys.map(k=>last(own(k,id),k)).filter(Boolean).map(x=>score(x.key===TASKS.focus.key?'focus':Object.keys(TASKS).find(k=>TASKS[k].key===x.key),x.record)).filter(n=>n!=null);const coverage=scores.length;
  $('coverage').textContent=`${coverage} / 5`; $('overall').textContent=coverage?percent(scores.reduce((s,n)=>s+n,0)/coverage):'—';
  $('totalSessions').textContent=String(cognitiveKeys.reduce((s,k)=>s+own(k,id).length,0));$('checkins').textContent=String(own('wellbeing',id).length);
 }
 function drawTrend(key,series){const svg=$('trend');svg.replaceChildren();const ns='http://www.w3.org/2000/svg';const shape=(tag,attrs)=>{const o=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>o.setAttribute(k,String(v)));svg.append(o);return o;};
  for(let y=0;y<=4;y++){const py=24+y*42;shape('line',{x1:48,y1:py,x2:735,y2:py,stroke:'#245b64','stroke-width':1});const t=shape('text',{x:8,y:py+4,fill:'#a3ced0','font-size':12});t.textContent=(100-y*25)+'%';}
  if(!series.length){$('chartNote').textContent='No assigned result yet. Complete this assessment with an active profile.';return;}
  const vals=series.slice(-15);const pts=vals.map((x,i)=>[vals.length===1?395:48+i*687/(vals.length-1),192-(x.value/100)*168]);
  if(pts.length>1)shape('polyline',{points:pts.map(([x,y])=>x+','+y).join(' '),fill:'none',stroke:'#24e4ee','stroke-width':3,'stroke-linejoin':'round'});
  pts.forEach(([x,y],i)=>{shape('circle',{cx:x,cy:y,r:5,fill:'#f4bd73',stroke:'#25eded','stroke-width':2});const t=shape('text',{x:x,y:216,fill:'#9bcbd1','text-anchor':'middle','font-size':11});t.textContent=String(i+1);});
  $('chartNote').textContent=`${vals.length} latest sessions · ${key==='wellbeing'?'Mood rating scaled visually from 1–10 to 0–100% for the chart ONLY; not success or health.':'Percentages from each game’s own calculation (metrics are not standardized between games).'}`;
 }
 function showDetail(x,key){const target=$('sessionDetail');target.replaceChildren();if(!x){target.textContent='Choose a session to inspect all available records.';return;}const r=x.record;target.append(el('p',dateString(key,r),'sub'));
  const dl=el('dl',undefined,'detail-data');Object.entries(r).forEach(([label,value])=>{if(label==='journal'||label==='text'||label==='title')return;const dt=el('dt',label),dd=el('dd');if(value&&typeof value==='object'){const pre=el('pre',JSON.stringify(value,null,2));pre.style.whiteSpace='pre-wrap';pre.style.overflowWrap='anywhere';pre.style.fontSize='11px';dd.append(pre);}else dd.textContent=String(value);dl.append(dt,dd);});target.append(dl);
 }
 function reportTab(){const id=activeId(),key=activeTab,config=TASKS[key];$('tabTitle').textContent=config.title;$('tabDesc').textContent=config.desc;$('openGame').href='./'+config.file;
  const list=own(key,id).sort((a,b)=>(Date.parse(when(key,b.record)||0)||0)-(Date.parse(when(key,a.record)||0)||0));const current=list[0]?.record;
  $('currentCount').textContent=String(list.length);$('currentPct').textContent=key==='wellbeing'?'N/A':current?percent(score(key,current)):'—';$('currentErrors').textContent=key==='wellbeing'?'N/A':current?String(errorCount(key,current)??'—'):'—';$('currentRt').textContent=key==='wellbeing'?'N/A':current?(responseMs(key,current)==null?'—':`${Math.round(responseMs(key,current))} ms`):'—';
  const box=$('sessionList');box.replaceChildren();if(!list.length)box.textContent='No assigned sessions for this astronaut. Older sessions without an ID are in the unassigned panel.';
  list.forEach(x=>{const b=el('button',`${dateString(key,x.record)} · ${key==='wellbeing'?'SELF-REPORT':percent(score(key,x.record))}`,'session-row');const sm=el('small',key==='wellbeing'?'Numeric check-in, journal excluded':`Errors: ${errorCount(key,x.record)??'—'} · Response: ${responseMs(key,x.record)??'—'} ms`);b.append(sm);b.addEventListener('click',()=>{selectedSession=x;showDetail(x,key);});box.append(b);});
  if(!selectedSession||!list.some(x=>x.index===selectedSession.index&&x.key===selectedSession.key))selectedSession=list[0]||null;showDetail(selectedSession,key);
  const chronological=list.slice().reverse();const chartData=chronological.map(x=>({value:key==='wellbeing'?(Number(x.record.ratings?.mood)||0)*10:score(key,x.record)})).filter(x=>Number.isFinite(x.value)&&x.value>=(key==='wellbeing'?10:0));drawTrend(key,chartData);
 }
 const ADVICE={
 focus:{low:[
 'For radar misses, rehearse the color rule aloud before starting a new level.',
 'If targets disappear before selection, prioritize one scanning sector at a time.',
 'Use a short recovery pause before another focus run after repeated misses.',
 'Reduce visual distractions around the screen during radar training.',
 'Check whether small targets account for more missed detections than large ones.',
 'Review the error log to distinguish late clicks from wrong-color clicks.',
 'Consider scheduling sustained-attention training when you feel alert.',
 'Compare radar performance at similar times of day before interpreting changes.',
 'Ask for a break between consecutive high-load attention activities.',
 'Keep radar response technique consistent across comparable sessions.'
 ],high:[
 'Strong radar accuracy: monitor whether response speed stays stable as difficulty rises.',
 'Review the remaining error types instead of repeating easy levels.',
 'Compare performance across multiple days before establishing a personal baseline.',
 'Try a later session under the same conditions to test consistency.'
 ]},
 memory:{low:[
 'Repeat square sequences using a consistent visual scanning pattern.',
 'If errors cluster near the end of a sequence, track sequence length in the review.',
 'Practice grouping adjacent squares into meaningful visual patterns.',
 'Check whether increasing playback speed produces a sudden error increase.',
 'Avoid competing visual tasks during memory-grid trials.',
 'Use voluntary Retry Level for practice, while keeping the original result in history.',
 'Review whether the first or last square in each sequence is most often missed.',
 'Compare performance between 3×3 and 6×6 grids separately.',
 'Consider brief sessions rather than repeated practice while fatigued.',
 'Keep input method and screen distance comparable between sessions.'
 ],high:[
 'Good memory accuracy: inspect the longest correctly recalled sequence.',
 'Maintain practice across different grid sizes rather than concentrating on easy levels.',
 'Review whether increased flash speed changes accuracy despite a high overall score.',
 'Track retention of performance over repeated days, not only within one session.'
 ]},
 categories:{low:[
 'Review which category families produced the most wrong selections.',
 'If missed targets dominate, allow time to scan every displayed option.',
 'If wrong selections dominate, check category boundaries before confirming.',
 'Look for confusion between planets, moons and other Solar System bodies.',
 'Review kitchen tools versus workshop tools when the distractors are similar.',
 'Check whether the 10-level pace causes errors late in the session.',
 'Use category-specific practice if errors cluster in one family.',
 'Avoid rapid confirmation before checking the number of requested targets.',
 'Compare selection precision and recall separately using the error review.',
 'Note whether related words become harder to distinguish under time pressure.'
 ],high:[
 'Strong category matching: inspect rare families for remaining confusion.',
 'Compare performance with increased distractor count, not just overall F1.',
 'Review time spent selecting versus accuracy for the hardest levels.',
 'Maintain broad category coverage across separate sessions.'
 ]},
 flexibility:{low:[
 'Read the active rule before choosing; it may switch between trials.',
 'For color mistakes, separate the word printed on the symbol from its displayed color.',
 'For shape mistakes, ignore fill and size when SHAPE is the active rule.',
 'Review the first trial after each rule change for switching-related errors.',
 'If outline/filled shapes cause confusion, rehearse the FILL rule separately.',
 'Compare SYMBOL and WORD trials to see whether reading interferes with selection.',
 'Distinguish speeded-response errors from incorrect understanding of the rule.',
 'Use consistent keyboard or pointer input when comparing sessions.',
 'When switching slows responses, try deliberately acknowledging the new rule.',
 'Review whether the hardest levels produce more timeouts or wrong choices.'
 ],high:[
 'Good rule-switching accuracy: inspect latency on trials immediately after a switch.',
 'Compare error patterns for shape, color, size, fill, word and symbol rules.',
 'Practice maintaining accuracy without chasing faster response times unnecessarily.',
 'Use repeated sessions to check whether switch costs are stable.'
 ]},
 reaction:{low:[
 'Review anticipatory presses separately from slow reactions.',
 'For STOP failures, practice withholding a response until the signal is unambiguous.',
 'Compare LEFT and RIGHT errors to spot direction confusion.',
 'For reversed-direction rules, confirm the instruction before responding.',
 'Check whether moving targets increase misses compared with static targets.',
 'If flicker is distracting, use rest breaks and stop the exercise if uncomfortable.',
 'Inspect whether wrong-direction responses cluster after a rule switch.',
 'Do not trade accuracy for speed when the task includes STOP trials.',
 'Check whether hand position and input device stay consistent between sessions.',
 'Consider a shorter practice run before attempting the most demanding levels.'
 ],high:[
 'Good reaction accuracy: inspect mean response time alongside STOP-trial errors.',
 'Compare fast trials and reversal trials separately to avoid hiding a weak area.',
 'Check whether accuracy remains stable as response windows tighten.',
 'Review response-time variability rather than relying on a single fastest click.'
 ]},
 wellbeing:{stress:[
 'You reported elevated stress: consider a brief pause and review the workload plan.',
 'If stress remains high on repeated check-ins, discuss support options with an appropriate crew professional.',
 'Record contextual changes, such as mission events or disrupted routines, alongside stress ratings.',
 'Check whether high stress co-occurs with reduced concentration in your own reports.'
 ],sleep:[
 'You rated sleep quality low: review sleep timing and light exposure with the crew schedule.',
 'If poor sleep persists, seek guidance from the mission health team.',
 'Note whether sleep quality changes before demanding cognitive tasks.',
 'Compare sleep ratings over several days rather than judging one night.'
 ],isolation:[
 'You reported stronger isolation: consider a planned social connection within the crew.',
 'Review whether you have opportunities for meaningful personal activity.',
 'If isolation feelings persist, consider contacting the crew behavioral support contact.',
 'Use mission journaling privately if reflecting on social connection helps you.'
 ],fatigue:[
 'High reported fatigue: consider recovery time before another demanding assessment.',
 'Notice whether fatigue ratings rise after extended workload.',
 'Compare fatigue ratings with task performance only within the same person.',
 'Consider discussing persistent fatigue with the appropriate support team.'
 ],mood:[
 'Low mood rating: consider a supportive check-in or enjoyable meaningful activity.',
 'Track mood changes across several days instead of interpreting one score.',
 'If low mood persists or worsens, ask for appropriate professional support.',
 'Journal privately about what felt helpful or difficult today if desired.'
 ],positive:[
 'Stable positive reports: keep your regular routine and monitor changes over time.',
 'Note which activities support motivation and connection within your mission routine.',
 'Continue optional check-ins even on days when you feel well.'
 ]}
 };
 function suggestions(){const id=activeId(),container=$('suggestions');container.replaceChildren();if(!id){container.textContent='Choose an astronaut to see individually matched suggestions.';return;}
  const picks=[];for(const key of cognitiveKeys){const x=last(own(key,id),key);if(!x)continue;const val=score(key,x.record);if(val==null)continue;const group=val<75?ADVICE[key].low:ADVICE[key].high;const n=val<75?4:2;group.slice(0,n).forEach((v,i)=>picks.push({title:TASKS[key].title,reason:`Latest task metric: ${percent(val)}`,text:v,weight:val<75?1:3,rank:i}));}
  const well=last(own('wellbeing',id),'wellbeing')?.record?.ratings;if(well){const signals=[['stress',well.stress,7],['fatigue',well.fatigue,7],['isolation',well.isolation,7],['sleep',well.sleep,4],['mood',well.mood,4]];signals.forEach(([key,v,cut])=>{if(!Number.isFinite(Number(v)))return;const trigger=(key==='sleep'||key==='mood')?Number(v)<=cut:Number(v)>=cut;if(trigger)ADVICE.wellbeing[key].forEach((text,i)=>picks.push({title:'WELLBEING · '+key.toUpperCase(),reason:`Your own rating: ${v}/10`,text,weight:0,rank:i}));});if(!picks.some(p=>p.title.startsWith('WELLBEING')))ADVICE.wellbeing.positive.forEach((text,i)=>picks.push({title:'WELLBEING',reason:'Latest voluntary check-in',text,weight:3,rank:i}));}
  if(!picks.length){container.textContent='No suitable suggestions yet. Complete a game or share a numeric wellbeing check-in for the selected profile.';return;}
  picks.sort((a,b)=>a.weight-b.weight||a.rank-b.rank);picks.slice(0,14).forEach(p=>{const art=el('article',undefined,'suggestion');art.append(el('strong',p.title),el('p',p.text),el('small',p.reason));container.append(art);});
 }
 function refresh(){selectProfiles();reportDashboard();reportTab();suggestions();}
 $('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;activeTab=b.dataset.tab;selectedSession=null;$('tabs').querySelectorAll('[data-tab]').forEach(btn=>btn.setAttribute('aria-selected',String(btn===b)));reportTab();});
 $('refreshAdvice').addEventListener('click',()=>{refresh();setStatus('Updated from available local records.');});
 $('exportProfile').addEventListener('click',()=>{const id=activeId();if(!id){setStatus('Choose an astronaut first.');return;}const p=profiles().find(p=>p.id===id);const items=Object.fromEntries(Object.keys(TASKS).map(k=>[k,own(k,id).map(x=>x.record)]));download(`vitals-cognitive-${id}.json`,{schema:'vitals.cognitive-twin.export.v1',profile:p,generatedAt:new Date().toISOString(),assessments:items,journalIncluded:false,experimental:true,notClinicalClearance:true});setStatus('Profile results exported locally; private journal excluded.');});
 $('showUnassigned').addEventListener('click',()=>{const panel=$('unassignedPanel');panel.hidden=!panel.hidden;if(panel.hidden)return;panel.replaceChildren();const id=activeId(),all=[];for(const k of Object.keys(TASKS))for(const item of records(k))if(!item.record.astronautId)all.push({k,...item});if(!all.length){panel.textContent='No unassigned sessions.';return;}panel.append(el('p',`Found ${all.length} unassigned sessions. No session will be attributed automatically.`, 'sub'));
  all.forEach(x=>{const row=el('div',undefined,'session-row');const desc=el('span',`${TASKS[x.k].title} · ${dateString(x.k,x.record)} · ${percent(score(x.k,x.record))}`);row.append(desc);const btn=el('button','ASSIGN TO ACTIVE PROFILE');btn.style.marginLeft='12px';btn.disabled=!id;btn.addEventListener('click',()=>{if(!activeId()){setStatus('Select profile first.');return;}if(!confirm(`Assign this ${TASKS[x.k].title} session to ${profiles().find(p=>p.id===activeId()).name}? This edits a stored copy of the session.`))return;const all=read(x.key);if(!all[x.index]||all[x.index].astronautId){setStatus('Session changed; reload and try again.');return;}all[x.index].astronautId=activeId();if(!write(x.key,all)){setStatus('Assignment failed: storage unavailable.');return;}panel.hidden=true;selectedSession=null;refresh();setStatus('Existing session explicitly assigned to the selected profile.');});row.append(btn);panel.append(row);});
 });
 refresh();
})();
