/* V.I.T.A.L.S. Start Mission crew chart adapter - synthetic visual scenario only.
   Uses assigned crew and Digital Twin profile baseline. Never writes medical data. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const colors=['#4de5f2','#f7bf68','#a88aff','#72e4a9','#ff7fa3','#f0e38a','#88adff','#ff9a6b'];
const definitions=[['chartHeart','hr','HEART RATE','bpm',40,180],['chartSpo2','spo','OXYGEN SATURATION','%',85,100],['chartResp','resp','RESPIRATION','/min',6,40],['chartBp','bp','SYSTOLIC BLOOD PRESSURE','mmHg',75,200]];
const finite=(v,defaultValue)=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):defaultValue;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const svgNS='http://www.w3.org/2000/svg';
function node(parent,tag,attrs,label){const e=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(label!==undefined)e.textContent=label;parent.appendChild(e);return e}
function context(){const mission=read('vitals.mission.active.v1');if(!mission?.id)return null;const profilesValue=read('vitals.astronauts.v1');const profiles=Array.isArray(profilesValue)?profilesValue:Array.isArray(profilesValue?.profiles)?profilesValue.profiles:[];
let roster=null;for(const key of ['vitals.mission.crew.v1.'+String(mission.destination||'').toLowerCase(),'vitals.mission.crew.v1']){const r=read(key);if(r&&Array.isArray(r.members)&&String(r.destination||'').toLowerCase()===String(mission.destination||'').toLowerCase()&&String(r.missionName||'')===String(mission.name||'')&&(!r.missionId||String(r.missionId)===String(mission.id))){roster=r;break}}
if(!roster?.members?.length)return null;
const run=read('vitals.mission.runState.v1.'+encodeURIComponent(mission.id));
const people=roster.members.map((r,i)=>{const p=profiles.find(p=>String(p.astronautId||p.id)===String(r.astronautId));const m=p?.metrics||{};return {id:String(r.astronautId),name:String(p?.name||p?.fullName||r.displayName||r.astronautId),color:colors[i%colors.length],base:{hr:finite(m.restingHeartRateBpm,72),spo:finite(m.oxygenSaturationPct,97),resp:finite(m.respiratoryRatePerMin,16),bp:finite(m.systolicBloodPressureMmHg,finite(m.systolicBloodPressure,118))},missing:{hr:m.restingHeartRateBpm==null,spo:m.oxygenSaturationPct==null,resp:m.respiratoryRatePerMin==null,bp:m.systolicBloodPressureMmHg==null&&m.systolicBloodPressure==null}}});
let elapsed=Number(run?.accumulatedMs||0);if(run?.phase==='RUNNING'&&Number.isFinite(Date.parse(run.startedAt||'')))elapsed+=Math.max(0,Date.now()-Date.parse(run.startedAt));
return {people,run,elapsed:Math.max(0,elapsed)} }
function sample(p,metric,t,i){const b=p.base[metric],phase=i*.91+t*.13,slow=Math.sin(t*.10+i*1.19),fast=Math.sin(phase)*.55+Math.sin(t*.33+i*2.2)*.25;
const drift={hr:7,spo:.7,resp:1.6,bp:7}[metric];const raw=b+drift*(fast+slow*.25);const limits={hr:[40,180],spo:[85,100],resp:[6,40],bp:[75,200]}[metric];return clamp(raw,...limits)}
function drawPlot(el,ctx,def,selected){const [,metric,,unit,min,max]=def;el.replaceChildren();const pp=selected?ctx.people.filter(p=>p.id===selected):ctx.people;const n=24,seconds=ctx.elapsed/1000,step=2;const start=Math.max(0,seconds-(n-1)*step);const times=Array.from({length:n},(_,j)=>start+(seconds-start)*j/(n-1));
const all=pp.flatMap((p,i)=>times.map(t=>sample(p,metric,t,ctx.people.indexOf(p))));let low=Math.min(...all),high=Math.max(...all);const pad=Math.max((high-low)*.25,metric==='spo'?.35:metric==='resp'?.7:3);low=clamp(low-pad,min,max);high=clamp(high+pad,min,max);if(high-low<.5){low-=.5;high+=.5}
for(let j=0;j<4;j++)node(el,'line',{x1:35,y1:20+j*37,x2:570,y2:20+j*37,stroke:'#315669','stroke-width':1});
for(const p of pp){const i=ctx.people.indexOf(p);const values=times.map(t=>sample(p,metric,t,i));const points=values.map((v,j)=>`${35+j*535/(n-1)},${145-(v-low)/(high-low)*119}`).join(' ');node(el,'polyline',{points,fill:'none',stroke:p.color,'stroke-width':2.8,'stroke-linecap':'round','stroke-linejoin':'round'});node(el,'circle',{cx:570,cy:145-(values.at(-1)-low)/(high-low)*119,r:3.8,fill:p.color});}
node(el,'text',{x:35,y:164,fill:'#a8c8d0','font-size':10},'SYNTHETIC DEMO / NO SENSOR DATA');node(el,'text',{x:570,y:164,fill:'#a8c8d0','font-size':10,'text-anchor':'end'},'MISSION '+Math.floor(seconds)+'s');}
let lastKey='';
function update(){const ctx=context();if(!ctx||!ctx.run||!['RUNNING','PAUSED','ENDED'].includes(ctx.run.phase))return;
const chosen=document.querySelector('.crew-card.selected');let selected='';if(chosen){const index=Array.from(document.querySelectorAll('.crew-card')).indexOf(chosen);selected=ctx.people[index]?.id||''}
const key=[ctx.run.phase,Math.floor(ctx.elapsed/1000),selected,ctx.people.map(p=>p.id).join('|')].join(':');if(key===lastKey)return;lastKey=key;
for(const def of definitions){const el=$(def[0]);if(el)drawPlot(el,ctx,def,selected)}
const badge=$('chartSource');if(badge)badge.textContent=(selected?'SELECTED ASTRONAUT':'ALL '+ctx.people.length+' CREW')+' / DIGITAL TWIN BASELINE / SYNTHETIC DEMO';
const note=$('biometricNote');if(note&&selected){const p=ctx.people.find(x=>x.id===selected);if(p)note.textContent='Charts: synthetic Digital Twin baseline scenario. Missing baseline values use illustrative defaults. Numeric cards above may show separate saved wrist observations.'}
const titles=document.querySelectorAll('.plot-panel article h3');titles.forEach((e,i)=>{if(e&&!e.dataset.crewChart){e.dataset.crewChart='1'}});
let legend=$('crewChartLegend');if(!legend){legend=document.createElement('div');legend.id='crewChartLegend';legend.style.cssText='display:flex;gap:12px;flex-wrap:wrap;padding:8px 0 12px;font:12px sans-serif';document.querySelector('.plots')?.before(legend)}if(legend){legend.replaceChildren();for(const p of ctx.people.filter(p=>!selected||p.id===selected)){const span=document.createElement('span');span.style.color=p.color;span.textContent='● '+p.name;legend.appendChild(span)}}
}
window.VitalsCrewDemoBridge={context,sample};
setInterval(update,500);window.addEventListener('pageshow',()=>{lastKey='';update()});
})();