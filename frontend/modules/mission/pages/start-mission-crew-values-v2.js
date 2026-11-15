/* V.I.T.A.L.S. Crew readouts: same samples as working crew graphs; no storage writes. */
(()=>{'use strict';
const metrics=[['HR','hr','bpm',0],['SpO2','spo','%',1],['RESP','resp','/min',1],['SYS','bp','mmHg',0]];
const fmt=(v,d)=>Number.isFinite(v)?v.toFixed(d):'--';
function update(){
  const api=window.VitalsCrewDemoBridge;if(!api)return;
  const ctx=api.context();if(!ctx)return;
  const phase=ctx.run?.phase;
  const active=['RUNNING','PAUSED','ENDED'].includes(phase);
  const cards=Array.from(document.querySelectorAll('#crewCards .crew-card'));
  cards.forEach((card,i)=>{
    const p=ctx.people[i];if(!p)return;
    let box=card.querySelector('.crew-demo-values');
    if(!box){box=document.createElement('div');box.className='crew-demo-values';card.appendChild(box)}
    box.replaceChildren();
    if(!active){box.textContent='AWAITING SIMULATION';return}
    for(const [label,key,unit,d] of metrics){
      const span=document.createElement('span');
      const value=api.sample(p,key,ctx.elapsed/1000,i);
      span.textContent=label+' '+fmt(value,d)+(key==='spo'?'%':'');
      span.title='Illustrative synthetic demo; '+unit+(p.missing[key]?' (fallback baseline)':' (profile baseline)');
      box.appendChild(span);
    }
  });
  const selected=cards.findIndex(c=>c.classList.contains('selected'));
  const ids=['metricHeart','metricSpo2','metricResp','metricBp'];
  const allCrew=selected<0;
  const people=allCrew
    ? ctx.people.map((p,i)=>({p,i}))
    : ctx.people[selected]
      ? [{p:ctx.people[selected],i:selected}]
      : [];

  metrics.forEach(([label,key,unit,d],index)=>{
    const el=document.getElementById(ids[index]);
    if(!el)return;

    if(!active||!people.length){
      el.textContent='--';
      return;
    }

    const values=people
      .map(({p,i})=>api.sample(p,key,ctx.elapsed/1000,i))
      .filter(v=>Number.isFinite(v));

    if(!values.length){
      el.textContent='--';
      return;
    }

    const average=values.reduce((sum,v)=>sum+v,0)/values.length;

    el.textContent=fmt(average,d)+' '+unit;
    el.title=allCrew
      ? 'Synthetic crew mean - '+values.length+' astronauts'
      : 'Synthetic individual demo';
  });

  const role=document.getElementById('selectedRole');
  if(role&&allCrew){
    role.textContent='CREW AVERAGE / '+ctx.people.length+' ASTRONAUTS';
  }

  const note=document.getElementById('biometricNote');
  if(note&&active){
    note.textContent=allCrew
      ? 'SYNTHETIC CREW AVERAGE - Individual abnormalities may be hidden by the mean. Not sensor data. Missing baselines may use demo defaults.'
      : 'SYNTHETIC DIGITAL TWIN DEMO - Illustrative individual values, not sensor measurements. Missing baselines may use demo defaults.';
  }
}
setInterval(update,500);
window.addEventListener('pageshow',update);
})();