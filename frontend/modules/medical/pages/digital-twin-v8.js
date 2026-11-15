/* V.I.T.A.L.S. Digital Twin V8 - personal synthetic preflight references.
 * Only reads already registered profile data. Does not create telemetry or overwrite source data.
 * Preflight references are NOT current health measurements, clinical thresholds or health scores.
 */
(()=>{'use strict';
  const $=id=>document.getElementById(id);
  const read=(k,fallback)=>{try{const s=localStorage.getItem(k);return s===null?fallback:JSON.parse(s)}catch{return fallback}};
  const num=v=>v===undefined||v===null||v===''||!Number.isFinite(Number(v))?null:Number(v);
  const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const items=[
    ['Resting heart rate','restingHeartRateBpm','bpm',0],
    ['Oxygen saturation','oxygenSaturationPct','%',0],
    ['Respiratory rate','respiratoryRatePerMin','/min',0],
    ['Skin temperature','skinTemperatureC','°C',1],
    ['Body temperature','bodyTemperatureC','°C',1],
    ['Sleep duration','sleepDurationH','h',1],
    ['Grip strength','gripStrengthKg','kg',0],
    ['Leg strength','legStrengthBaselineN','N',0],
    ['Muscle mass (synthetic)','muscleMassKgSimulation','kg',1],
    ['Bone density (synthetic T-score)','boneDensityTScoreSimulation','',1],
    ['Focus reference','focusTaskAccuracyPct','%',0],
    ['Memory reference','memoryTaskAccuracyPct','%',0],
    ['Category match reference','categoryMatchAccuracyPct','%',0],
    ['Flexibility reference','flexibilityTaskAccuracyPct','%',0],
    ['Reaction reference','reactionTaskAccuracyPct','%',0],
    ['Stress self-report','stressSelfReport10','/10',0],
    ['Fatigue self-report','fatigueSelfReport10','/10',0]
  ];
  const stageMetrics=[
    ['heartMetric','heartProv','restingHeartRateBpm','bpm',0],
    ['oxygenMetric','oxygenProv','oxygenSaturationPct','%',0],
    ['respMetric','respProv','respiratoryRatePerMin','/min',0],
    ['tempMetric','tempProv','skinTemperatureC','°C',1]
  ];
  const cogKeys=[['FOCUS','focusTaskAccuracyPct'],['MEMORY','memoryTaskAccuracyPct'],['CATEGORY MATCH','categoryMatchAccuracyPct'],['FLEXIBILITY','flexibilityTaskAccuracyPct'],['REACTION','reactionTaskAccuracyPct']];
  function profileFor(id){const raw=read('vitals.astronauts.v1',[]);const list=Array.isArray(raw)?raw:Array.isArray(raw?.profiles)?raw.profiles:Array.isArray(raw?.astronauts)?raw.astronauts:[];
    return list.find(p=>String(p?.astronautId||p?.id||'')===id)||null;}
  function present(v,unit,digits){return `${num(v).toFixed(digits)}${unit?' '+unit:''}`;}
  function initialize(){const left=$('coverage')?.closest('section.panel'),main=document.querySelector('.maincol');if(!left||!main)return false;
    if(!$('dtv8Summary')){
      const block=document.createElement('section');block.className='panel dtv8-baseline-panel';block.id='dtv8Summary';
      block.innerHTML='<p class="eyebrow">PERSONAL PREFLIGHT REFERENCE / V8</p><h2>Profile baseline</h2><p class="note">Synthetic registered profile values, not real-time readings. For comparison with subsequent mission observations.</p><div id="dtv8BaselineStatus" class="dtv8-status"></div><div id="dtv8BaselineCards" class="dtv8-baseline-cards"></div>';
      left.insertAdjacentElement('afterend',block);
    }
    if(!$('dtv8Reference')){
      const section=document.createElement('section');section.className='panel dtv8-reference';section.id='dtv8Reference';
      section.innerHTML='<p class="eyebrow">SYNTHETIC COGNITIVE REFERENCES</p><h2>Preflight task baselines</h2><div id="dtv8Cognitive" class="dtv8-cognitive"></div><p class="note">These percentages are synthetic profile references. Completed cognitive-game sessions, if any, remain separately recorded above.</p>';
      const cog=$('cognitiveCards')?.closest('section.panel');if(cog)cog.insertAdjacentElement('afterend',section);else main.append(section);
    }
    return true;
  }
  function render(){if(!initialize())return;const id=String($('astronaut')?.value||''),profile=id?profileFor(id):null,metrics=profile?.metrics&&typeof profile.metrics==='object'?profile.metrics:{};
    const known=items.filter(([label,key])=>num(metrics[key])!==null);
    const status=$('dtv8BaselineStatus'),cards=$('dtv8BaselineCards'),cognitive=$('dtv8Cognitive');
    if(!profile){status.textContent='No matching astronaut profile selected. No values inferred.';cards.replaceChildren();cognitive.replaceChildren();return;}
    const source=profile.dataProvenance||profile.recordType||'profile data - provenance to verify';
    status.textContent=`${profile.fullName||profile.name||id} · ${known.length}/${items.length} reference fields available · ${source}`;
    cards.innerHTML=items.slice(0,12).map(([label,key,unit,digits])=>{
      const v=num(metrics[key]);return `<div class="dtv8-baseline-cell"><small>${esc(label)}</small><strong>${v===null?'NOT RECORDED':esc(present(v,unit,digits))}</strong><span>${v===null?'NO BASELINE':'PREFLIGHT · SYNTHETIC'}</span></div>`;
    }).join('');
    cognitive.innerHTML=cogKeys.map(([label,key])=>{
      const v=num(metrics[key]);return `<div><small>${esc(label)}</small><strong>${v===null?'NO BASELINE':esc(present(v,'%',0))}</strong><span>${v===null?'NO REFERENCE':'SYNTHETIC PROFILE REFERENCE'}</span></div>`;
    }).join('');
    for(const [metricId,provId,key,unit,digits] of stageMetrics){
      const metric=$(metricId),prov=$(provId),v=num(metrics[key]);
      if(!metric||!prov||v===null)continue;
      // V1 owns current observations. Only fill the missing-value placeholders.
      if(metric.textContent.trim()==='—'||prov.textContent==='PREFLIGHT BASELINE · SYNTHETIC'){
        // When V1 switches to mission telemetry, it changes the value and provenance. Do not overwrite it.
        metric.textContent=present(v,unit,digits);
        prov.textContent='PREFLIGHT BASELINE · SYNTHETIC';
        metric.dataset.dtv8Baseline='yes';
      }
    }
    // The integrated status bars and data-coverage gauge intentionally remain based on
    // mission observations. A preflight value alone cannot establish current wellness.
  }
  function begin(){initialize();render();$('astronaut')?.addEventListener('change',()=>setTimeout(render,30));$('refresh')?.addEventListener('click',()=>setTimeout(render,30));window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});setInterval(()=>{if(!document.hidden)render()},1600);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
})();
