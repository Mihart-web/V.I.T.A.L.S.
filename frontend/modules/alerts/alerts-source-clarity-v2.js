/* V.I.T.A.L.S. Alert Source Clarity V2 - display-layer grouping, original audit events retained. */
(()=>{'use strict';
 const root=document.getElementById('vitals-alert-app');if(!root||document.getElementById('asc2-root'))return;
 const $=id=>document.getElementById(id);
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const text=v=>String(v??'').trim();
 const safeDate=v=>{const d=new Date(v||'');return Number.isFinite(d.getTime())?d.toLocaleString():'Unknown time'};
 const level={red:'#ff667b',orange:'#f6a257',yellow:'#f8d16c',green:'#5ee8aa',blue:'#48d6fc'};
 const rank={red:5,orange:4,yellow:3,blue:2,green:1};
 const base='vitals.alerts.engineEvents.v1.';
 const mission=()=>read('vitals.mission.active.v1');
 const missionId=()=>text(mission()?.id)||'PREVIEW';
 const storeKey=()=>base+encodeURIComponent(missionId());
 const records=()=>{const d=read(storeKey());return d?.schema==='vitals.alerts.engineEvents.v1'&&d.missionId===missionId()&&Array.isArray(d.events)?d.events:[]};
 const manual=e=>{const s=text(e.source).toLowerCase(),p=text(e.provenance).toLowerCase();return p.includes('manual')||s.includes('manual scenario')||s.includes('manual event')};
 const field=(label,value)=>{const row=document.createElement('div');row.className='asc2-field';const name=document.createElement('strong');name.textContent=label;const content=document.createElement('span');content.textContent=text(value)||'Not provided';row.append(name,content);return row};
 const elt=(tag,cls,content)=>{const d=document.createElement(tag);if(cls)d.className=cls;if(content!==undefined)d.textContent=content;return d};
 const wrap=elt('section','asc2-panel');wrap.id='asc2-root';
 wrap.innerHTML='<div class="asc2-heading"><div><div class="asc2-kicker">03 / MISSION ALERT CENTER</div><h3>Source-aware attention queue</h3><p>Training events only. Automatic observations and manual exercises are separated. Related environmental notifications are grouped for display; original records remain in the audit log.</p></div><div id="asc2-totals" class="asc2-totals"></div></div><div class="asc2-tabs" role="group" aria-label="Alert queue filters"><button type="button" data-filter="auto" aria-pressed="true">AUTOMATIC</button><button type="button" data-filter="manual" aria-pressed="false">MANUAL TESTS</button><button type="button" data-filter="all" aria-pressed="false">ALL OPEN</button><button type="button" data-filter="resolved" aria-pressed="false">RESOLVED</button></div><div class="asc2-controls"><label>FIND AN EVENT <input id="asc2-search" type="search" autocomplete="off" placeholder="Source, astronaut, metric, title..."></label><button type="button" id="asc2-archive">ARCHIVE OPEN MANUAL TESTS</button><span id="asc2-feedback" role="status"></span></div><div id="asc2-results" class="asc2-results" aria-live="polite"></div><p class="asc2-foot">Display grouping is not clinical deduplication. No events are deleted, and severity is not a validated NASA triage score. Original JSON/CSV export remains available below.</p>';
 const oldList=$('aeActive');const section=oldList?.closest('.panel');if(!oldList||!section)return;
 section.parentElement.insertBefore(wrap,section);
 section.classList.add('asc2-original-hidden');
 const dialog=elt('div','asc2-backdrop');dialog.id='asc2-dialog';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Alert source details');
 dialog.innerHTML='<div class="asc2-dialog-content"><button type="button" id="asc2-close" class="asc2-close" aria-label="Close details">✕</button><div id="asc2-details"></div></div>';
 document.body.append(dialog);
 let currentFilter='auto',lastFingerprint='',lastId='',visibleEvents=[];
 function isCo2(e){if(manual(e))return false;const s=(text(e.title)+' '+text(e.message)+' '+text(e.sourceKey)).toLowerCase();return (s.includes('co2')||s.includes('co₂'))&&(text(e.source).toLowerCase().includes('environment'))}
 function groupKey(e){if(isCo2(e))return 'env:co2:'+missionId();return 'one:'+text(e.id)}
 function groups(items){const map=new Map();for(const e of items){const k=groupKey(e);if(!map.has(k))map.set(k,[]);map.get(k).push(e)}return [...map.values()].sort((a,b)=>Math.max(...b.map(e=>Date.parse(e.createdAt)||0))-Math.max(...a.map(e=>Date.parse(e.createdAt)||0)))}
 function target(e){if(!e.astronautId)return 'Habitat / Mission';const p=read('vitals.astronauts.v1');const person=Array.isArray(p)?p.find(x=>text(x.id||x.astronautId)===text(e.astronautId)):null;return text(person?.name||person?.fullName||e.astronautId)}
 function details(e){lastId=e.id;const box=$('asc2-details');box.replaceChildren();const tag=elt('div','asc2-kicker',`${text(e.level).toUpperCase()} · ${manual(e)?'MANUAL TRAINING':'AUTOMATIC / IMPORTED'} · ${text(e.status)}`);tag.style.color=level[e.level]||level.blue;box.append(tag,elt('h3','',text(e.title)));box.append(field('Target',target(e)),field('Mission',e.missionId),field('Source module',e.source),field('Provenance',e.provenance),field('Sample timestamp',e.sampleTimestamp||'Not recorded separately'),field('Alert created',safeDate(e.createdAt)),field('Last update',safeDate(e.history?.at(-1)?.at||e.createdAt)),field('Scenario / observation',e.message),field('Training threshold',e.threshold||'Not recorded by the source; consult the original module'),field('Source identifier',e.sourceKey||'Manual test without a source key'),field('Human review',e.action||'No specific procedure recorded'));
 if(Array.isArray(e.history)&&e.history.length)box.append(field('Recorded status history',e.history.map(h=>`${safeDate(h.at)}: ${h.status} — ${h.by||'system'}`).join(' | ')));
 const actions=elt('div','asc2-dialog-actions'),view=elt('button','','OPEN ORIGINAL ALERT');view.type='button';view.onclick=()=>{dialog.hidden=true;const ids=records().filter(r=>r.status!=='RESOLVED').slice(-60).reverse();const idx=ids.findIndex(r=>r.id===e.id);if(idx<0){$('asc2-feedback').textContent='Original event is resolved or outside the active queue; see permanent audit history.';return}const node=oldList.children[idx];if(node?.click)node.click();else $('asc2-feedback').textContent='Original alert card is not available. Use the audit history.'};actions.append(view);box.append(actions);
 dialog.hidden=false;$('asc2-close').focus();}
 function rowFor(group){const primary=[...group].sort((a,b)=>(rank[b.level]||0)-(rank[a.level]||0))[0];const card=elt('article','asc2-card');card.style.setProperty('--asc2-level',level[primary.level]||level.blue);
 const head=elt('div','asc2-card-head'),title=elt('strong','',`${text(primary.level).toUpperCase()} · ${isCo2(primary)?'Cabin CO₂ — related environmental reports':primary.title}`),chip=elt('span','asc2-chip',manual(primary)?'MANUAL TEST':'AUTOMATIC');head.append(title,chip);card.append(head);
 card.append(elt('p','',`${target(primary)} · ${text(primary.message).slice(0,280)}`));const sources=[...new Set(group.map(x=>text(x.source)))];card.append(elt('div','asc2-mini',`${sources.join(' + ')} · ${group.length} original record(s) · latest ${safeDate(group.map(x=>x.createdAt).sort().at(-1))}`));
 if(group.length>1)card.append(elt('p','asc2-correlated','Related source reports grouped for display only. Each original event remains independently recorded and can be opened below.'));
 const buttons=elt('div','asc2-card-actions');for(const e of group){const b=elt('button','',group.length>1?`DETAILS: ${text(e.source)}`:'SOURCE DETAILS');b.type='button';b.onclick=()=>details(e);buttons.append(b)}card.append(buttons);return card}
 function render(force=false){const rows=records(),active=rows.filter(e=>e.status!=='RESOLVED'),automatic=active.filter(e=>!manual(e)),manualOpen=active.filter(manual),resolved=rows.filter(e=>e.status==='RESOLVED');
 const fingerprint=JSON.stringify([missionId(),rows.map(e=>[e.id,e.status,e.message,e.sampleTimestamp,e.history?.length]),currentFilter,$('asc2-search').value]);if(!force&&fingerprint===lastFingerprint)return;lastFingerprint=fingerprint;
 const counts=$('asc2-totals');counts.textContent=`${automatic.length} automatic · ${manualOpen.length} manual · ${resolved.length} resolved · ${rows.length} stored`;
 const filterRows=currentFilter==='manual'?manualOpen:currentFilter==='resolved'?resolved:currentFilter==='all'?active:automatic;
 const query=$('asc2-search').value.trim().toLowerCase();visibleEvents=filterRows.filter(e=>!query||[e.title,e.source,e.message,e.astronautId,target(e),e.ruleId].some(v=>text(v).toLowerCase().includes(query)));
 const list=$('asc2-results');list.replaceChildren();for(const group of groups(visibleEvents))list.append(rowFor(group));
 if(!visibleEvents.length)list.append(elt('p','asc2-empty',query?'No matching training events.':'No events in this category.'));
 $('asc2-archive').textContent=`ARCHIVE MANUAL TESTS (${manualOpen.length})`;
 }
 function checkAccess(){const id=read('vitals.session.identity.v1'),active=text(localStorage.getItem('vitals.activeAstronautId.v1')),m=mission(),dest=text(m?.destination).toLowerCase();const roster=[read('vitals.mission.crew.v1.'+dest),read('vitals.mission.crew.v1')].find(r=>r&&Array.isArray(r.members)&&text(r.destination).toLowerCase()===dest&&text(r.missionName)===text(m?.name));const crew=roster?.members||[],member=crew.find(x=>text(x.astronautId)===text(id?.astronautId));const consoles=crew.filter(x=>x.consoleOperator);const roleMatch=member&&text(member.role)===text(id?.roleId);const checks=[['Confirmed astronaut identity',!!id?.confirmedAt&&!!id?.roleConfirmedAt&&text(id?.astronautId)===active],['Same active mission',text(id?.missionId)===missionId()],['Membership in the saved mission roster',!!member],['Mission role matches selected role',!!roleMatch],['Single assigned console operator',consoles.length===1&&consoles[0]===member]];return {ok:checks.every(x=>x[1]),missing:checks.filter(x=>!x[1]).map(x=>x[0])}}
 function archiveManual(){const feedback=$('asc2-feedback'),gate=checkAccess();if(!gate.ok){feedback.textContent='CONSOLE AUTHORIZATION REQUIRED: '+gate.missing.join('; ')+'. Complete Crew Assignment and Crew Identity & Mission Role.';return}const current=read(storeKey());if(!current||!Array.isArray(current.events)){feedback.textContent='No mission event store found.';return}const open=current.events.filter(e=>e.status!=='RESOLVED'&&manual(e));if(!open.length){feedback.textContent='No open manual training events.';return}if(!window.confirm(`Archive ${open.length} manual training event(s) as RESOLVED? This will retain all events in the permanent local audit history and does not affect automatic alerts.`))return;
 const now=new Date().toISOString(),id=read('vitals.session.identity.v1');for(const e of current.events){if(e.status==='RESOLVED'||!manual(e))continue;e.status='RESOLVED';if(!Array.isArray(e.history))e.history=[];e.history.push({status:'RESOLVED',reason:'MANUAL TRAINING ARCHIVE V2',at:now,by:`${text(id?.astronautId)} (${text(id?.roleId)})`,demoOnly:true})}
 current.updatedAt=now;
 try{localStorage.setItem(storeKey(),JSON.stringify(current))}catch(err){feedback.textContent='Could not save archived events: '+err.message;return}
 feedback.textContent=`${open.length} manual events archived; refreshing the Alert Engine in order to synchronize its in-memory event state.`;
 // Engine V1 holds a private in-memory copy: reload after external edits to prevent stale overwrites.
 window.location.reload();}
 wrap.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{currentFilter=b.dataset.filter;wrap.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render(true)}));
 $('asc2-search').addEventListener('input',()=>render(true));$('asc2-archive').addEventListener('click',archiveManual);
 $('asc2-close').addEventListener('click',()=>{dialog.hidden=true});dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)dialog.hidden=true});
 window.addEventListener('storage',e=>{if(e.key===storeKey()||e.key==='vitals.mission.active.v1')render(true)});
 render(true);setInterval(()=>{if(!document.hidden)render()},2500);
})();
