/* Mission Timeline is a read-only view, except explicit export/delete of its own archive. */
(()=>{'use strict';
const HISTORY='vitals.mission.timeline.history.v1',CURRENT='vitals.mission.timeline.current.v1';
const $=id=>document.getElementById(id);
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const text=(s)=>String(s??'');
const element=(tag,cls,contents)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(contents!==undefined)n.textContent=text(contents);return n};
const date=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?d.toLocaleString('en-GB'):'Time not recorded'};
const elapsed=ms=>{const s=Math.max(0,Math.floor(Number(ms||0)/1000));return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,'0')).join(':')};
function currentClock(run){let ms=Math.max(0,Number(run?.accumulatedMs)||0);if(run?.phase==='RUNNING'&&Number.isFinite(Date.parse(run.startedAt||'')))ms+=Math.max(0,Date.now()-Date.parse(run.startedAt));return ms}
const history=()=>{const v=read(HISTORY);return Array.isArray(v)?v:[]};
function box(label,value){const b=element('div','stat');b.append(element('small','',label),element('strong','',value));return b}
function chronology(host,events){if(!events?.length)return;const line=element('div','timeline');for(const e of events){const item=element('div','event');item.append(element('strong','',e.label),element('small','',elapsed(e.elapsedMs)+' Â· '+date(e.at)));line.append(item)}host.append(line)}
function renderCurrent(){
 const m=read('vitals.mission.active.v1');const status=$('currentStatus'),host=$('current');host.replaceChildren();
 if(!m?.id){status.textContent='NOT CONFIGURED';host.append(element('div','empty','NO ACTIVE MISSION CONFIGURED'));return}
 const state=read('vitals.mission.runState.v1.'+encodeURIComponent(m.id));
 const runs=read(CURRENT)||{};const rec=runs[m.id]||null;const phase=state?.missionId===m.id?state.phase:'NOT_STARTED';
 status.textContent=phase;status.className='chip '+(phase==='RUNNING'?'running':phase==='PAUSED'?'paused':'');
 const g=element('div','stats');
 g.append(box('MISSION',m.name||m.id),box('DESTINATION',text(m.destination||'NOT SET').toUpperCase()),box('MISSION CLOCK',state?elapsed(currentClock(state)):'00:00:00'),box('PHASE',phase));
 host.append(g);
 if(phase==='NOT_STARTED')host.append(element('div','empty','MISSION READY FOR TIMELINE Â· START IT IN START MISSION'));
 else if(phase==='ENDED')host.append(element('div','empty','MISSION ENDED Â· COMPLETED SESSIONS APPEAR IN HISTORY WHEN TRACKED'));
 if(rec?.events?.length)chronology(host,rec.events);
}
function renderHistory(){
 const host=$('history'),items=history().slice().sort((a,b)=>Date.parse(b.endedAt||'')-Date.parse(a.endedAt||''));host.replaceChildren();$('historyCount').textContent=items.length+' COMPLETED';
 if(!items.length){host.append(element('div','empty','NO ARCHIVED MISSIONS YET'));return}
 for(const s of items){
  const item=element('article','history-item'),heading=element('div','history-top');
  heading.append(element('strong','',s.missionName||s.missionId));
  const btn=element('button','smallbtn danger','DELETE SESSION');btn.type='button';btn.onclick=()=>{
   if(!confirm('Permanently delete this archived session from this browser?'))return;
   put(HISTORY,history().filter(x=>x.id!==s.id));render();
  };heading.append(btn);item.append(heading);
  item.append(element('p','history-info',text(s.destination||'UNKNOWN').toUpperCase()+' Â· '+date(s.startedAt)+' to '+date(s.endedAt)+' Â· ELAPSED '+elapsed(s.elapsedMs)+' Â· CREW '+(s.crewCount??'N/A')+' Â· TRAINING ALERTS '+Number(s.alerts?.engine||0)+' Â· VISUAL DEMOS '+Number(s.alerts?.visual||0)));
  chronology(item,s.events);host.append(item);
 }
}
function renderComparison(){
 const host=$('compare');host.replaceChildren();const items=history().slice().sort((a,b)=>Date.parse(b.endedAt||'')-Date.parse(a.endedAt||''));
 if(items.length<2){host.append(element('div','empty','AT LEAST TWO COMPLETED SESSIONS REQUIRED FOR COMPARISON'));return}
 const a=items[0],b=items[1],delta=(n1,n2,unit)=>{const d=n1-n2;return (d>0?'+':'')+d.toFixed(unit==='min'?1:0)+(unit==='min'?' min':'')};
 const n=x=>Number(x)||0;const c=element('div','comparison');
 c.append(box('SIMULATED DURATION DELTA',delta(n(a.elapsedMs)/60000,n(b.elapsedMs)/60000,'min')));
 c.append(box('TRAINING ALERTS DELTA',delta(n(a.alerts?.engine),n(b.alerts?.engine),'count')));
 c.append(box('VISUAL DEMOS DELTA',delta(n(a.alerts?.visual),n(b.alerts?.visual),'count')));
 host.append(c);host.append(element('p','compare-caption','Latest: '+text(a.missionName||a.missionId)+' Â· Previous: '+text(b.missionName||b.missionId)+'. Differences describe saved training sessions only; they do not measure health or mission success.'));
}
function render(){renderCurrent();renderHistory();renderComparison()}
$('deleteHistory').addEventListener('click',()=>{if(!history().length)return;if(!confirm('Delete ALL archived mission sessions from this browser? This cannot be undone.'))return;put(HISTORY,[]);render()});
$('exportHistory').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({schema:'vitals.mission.timeline.export.v1',exportedAt:new Date().toISOString(),sessions:history()},null,2)],{type:'application/json'});
 const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download='vitals-mission-history.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
});
render();setInterval(renderCurrent,1000);setInterval(()=>{renderHistory();renderComparison()},4000);
window.addEventListener('storage',render);window.addEventListener('pageshow',render);
})();
