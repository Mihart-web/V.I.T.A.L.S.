'use strict';
/* VITALS_COGNITIVE_TWIN_PROFILE_BINDING_V1 */
function vitalsActiveId(){try{const id=localStorage.getItem("vitals.activeAstronautId.v1");const list=JSON.parse(localStorage.getItem("vitals.cognitive.profiles.v1")||"[]");return Array.isArray(list)&&list.some(p=>p.id===id)?id:null;}catch{return null;}}
// V.I.T.A.L.S. â€” original Focus Radar game, version 1.0
// Experimental performance metrics; no diagnosis or clinical thresholds.
(() => {
  const canvas = document.getElementById('radar');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const colors = {blue:'#48b9ff',yellow:'#ffd65e',red:'#ff5b66'};
  const colorNames = ['yellow','blue','red','yellow','red'];
  const configs = [
    {count:6, interval:1150, life:5600, turn:5400, radius:11, decoys:0.28, window:.73},
    {count:7, interval:1050, life:5200, turn:4900, radius:10, decoys:0.32, window:.68},
    {count:8, interval:930,  life:4750, turn:4450, radius:9,  decoys:0.38, window:.64},
    {count:9, interval:830,  life:4350, turn:4000, radius:8,  decoys:0.43, window:.59},
    {count:10,interval:740,  life:3950, turn:3650, radius:7,  decoys:0.47, window:.55}
  ];
  const TWO_PI=Math.PI*2, C=310, R=272;
  let state='ready', level=0, t=0, previous=0, lastSpawn=0, spawned=0;
  let score=0,hits=0, errors=0, idSeq=0, targetTotal=0;
  let targets=[], log=[], levelResults=[], levelStarts={hits:0,errors:0,score:0};
  let startedAt=null, sessionFinishedAt=null, durationMs=0, times=[];
  let sessionKey=null, saveNote='';

  const setStatus = text => { $('status').textContent = text; };
  const formatTime = ms => { const s=Math.floor(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  const angleGap=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  const cfg=()=>configs[level];
  const beamAngle=()=>((t/TWO_PI)*0 + ((t % cfg().turn)/cfg().turn)*TWO_PI - Math.PI/2);
  const isLit = dot => Math.abs(angleGap(dot.angle,beamAngle())) <= cfg().window;
  const random=(min,max)=> min+Math.random()*(max-min);
  const shuffleColor = () => Object.keys(colors)[Math.floor(Math.random()*3)];
  const hud=()=>{
    $('level').textContent=`${level+1} / 5`; $('score').textContent=String(score);
    $('hits').textContent=String(hits); $('errors').textContent=String(errors);
    $('clock').textContent=formatTime(durationMs);
    const name=colorNames[level]; $('targetColor').textContent=name.toUpperCase();
    $('targetColor').style.color=colors[name];
  };
  const error=(type,details) => {
    errors++; log.push({level:level+1, time_ms:Math.round(durationMs), type, details});
    score=Math.max(0,score-25* (level+1));hud();
  };
  function reset() {
    state='ready';level=0;t=0;previous=0;lastSpawn=0;spawned=0;score=0;hits=0;errors=0;
    idSeq=0;targetTotal=0;targets=[];log=[];levelResults=[];times=[];durationMs=0;
    startedAt=null;sessionFinishedAt=null;saveNote='';levelStarts={hits:0,errors:0,score:0};
    $('start').disabled=false;$('start').hidden=false;$('pause').disabled=true;$('pause').textContent='PAUSE';
    $('next').hidden=true;$('review').hidden=true;$('results').hidden=true;$('mistakes').hidden=true;
    $('summary').replaceChildren();$('mistakes').replaceChildren();
    setStatus('Press START. Hit only the requested color when its dot lights up under the rotating beam.');
    hud();
  }
  function startLevel() {
    state='playing';t=0;lastSpawn=-450;spawned=0;targets=[];previous=0;
    levelStarts={hits,errors,score};
    $('start').disabled=true;$('pause').disabled=false;$('pause').textContent='PAUSE';
    $('next').hidden=true;
    setStatus(`Level ${level+1}: find illuminated ${colorNames[level].toUpperCase()} targets. Ignore other dots.`);
    hud();
  }
  function spawn() {
    const current=cfg();
    const target = Math.random() >= current.decoys;
    const name=target ? colorNames[level] : (()=>{let x;do{x=shuffleColor();}while(x===colorNames[level]);return x;})();
    const angle=random(-Math.PI,Math.PI), rad=random(R*.22,R*.86);
    // Every target lives long enough for at least one complete radar rotation at levels 1-4.
    const dot={id:++idSeq, x:C+Math.cos(angle)*rad,y:C+Math.sin(angle)*rad,
      angle, color:name,target, size:current.radius*random(.72,1.45),born:t,
      life:current.life, litAt:null, resolved:false};
    targets.push(dot);if(target)targetTotal++;spawned++;
  }
  function tick(dt) {
    if(state!=='playing')return;
    t+=dt; durationMs+=dt;
    while(spawned<cfg().count && (t-lastSpawn)>=cfg().interval) { spawn();lastSpawn=t; }
    for(const dot of targets){
      if(dot.resolved) continue;
      if(isLit(dot) && dot.litAt===null)dot.litAt=t;
      if(t-dot.born>=dot.life){
        dot.resolved=true;
        if(dot.target)error('MISSED TARGET',`${dot.color.toUpperCase()} target ${dot.id} expired without a valid click`);
      }
    }
    targets=targets.filter(dot=> !dot.resolved || t-dot.born < dot.life+450);
    if(spawned>=cfg().count && targets.every(dot=>dot.resolved)) finishLevel();
    hud();
  }
  function finishLevel() {
    const result={level:level+1, color:colorNames[level], presented:cfg().count,
      targets:targetTotal - levelResults.reduce((s,l)=>s+l.targets,0),
      hits:hits-levelStarts.hits, errors:errors-levelStarts.errors,
      points:score-levelStarts.score};
    result.accuracy_percent=result.targets? Math.round(result.hits/result.targets*1000)/10:0;
    levelResults.push(result);
    $('pause').disabled=true;
    if(level===4){ finishSession(); }
    else { state='between';$('next').hidden=false;setStatus(`Level ${level+1} complete â€” ${result.hits}/${result.targets} targets hit. Continue to Level ${level+2}.`); }
  }
  function finishSession() {
    state='finished'; sessionFinishedAt=new Date().toISOString();
    $('next').hidden=true;$('review').hidden=false;
    const total=levelResults.reduce((s,l)=>s+l.targets,0);
    const accuracy=total?Math.round(hits/total*1000)/10:0;
    const avg=times.length?Math.round(times.reduce((s,n)=>s+n,0)/times.length):null;
    const session={type:'focus-radar',schema_version:'1.0',session_id:`focus-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      synthetic_demo:true, started_at:startedAt,finished_at:sessionFinishedAt,
      duration_ms:Math.round(durationMs),levels:levelResults,summary:{hits,targets:total,errors,points:score,
      accuracy_percent:accuracy,mean_response_ms:avg},error_log:log};
    saveNote='Saved locally for future Cognitive Twin integration';
    try {const key='vitals.focus.sessions.v1';const prev=JSON.parse(localStorage.getItem(key)||'[]');
      if(!Array.isArray(prev))throw Error('Invalid session store');
      session.astronautId = vitalsActiveId(); prev.push(session);localStorage.setItem(key,JSON.stringify(prev.slice(-40)));
    } catch(e){saveNote='Local storage unavailable â€” results visible here only';}
    $('results').hidden=false;
    const table=document.createElement('table');
    const head=document.createElement('thead');head.innerHTML='<tr><th>Level</th><th>Target</th><th>Hits</th><th>Total</th><th>Errors</th><th>Accuracy</th></tr>';
    table.append(head);
    const body=document.createElement('tbody');
    levelResults.forEach(l=>{const row=document.createElement('tr');
      [l.level,l.color.toUpperCase(),l.hits,l.targets,l.errors,`${l.accuracy_percent.toFixed(1)}%`].forEach(v=>{const td=document.createElement('td');td.textContent=String(v);row.append(td);});body.append(row);});
    table.append(body);
    const note=document.createElement('p');note.textContent=`TOTAL: ${hits}/${total} hits (${accuracy.toFixed(1)}%); ${errors} errors; ${score} points; mean valid response ${avg===null?'N/A':avg+' ms'}. ${saveNote}.`;
    $('summary').replaceChildren(note,table);
    setStatus('Five levels completed. Open REVIEW ERRORS for a detailed breakdown, or RESTART.');
  }
  function clickRadar(event){
    if(state!=='playing')return;
    const bounds=canvas.getBoundingClientRect();
    const x=(event.clientX-bounds.left)*canvas.width/bounds.width;
    const y=(event.clientY-bounds.top)*canvas.height/bounds.height;
    const dot=targets.filter(d=>!d.resolved && (x-d.x)**2+(y-d.y)**2 <= (d.size+9)**2)
      .sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
    if(!dot){error('EMPTY RADAR CLICK','No active dot at click location');setStatus('No target at that location.');return;}
    if(!isLit(dot)){error('OUTSIDE BEAM',`${dot.color.toUpperCase()} dot ${dot.id} was not illuminated`);setStatus('Wait until the sweeping radar beam illuminates the dot.');return;}
    dot.resolved=true;
    if(!dot.target){error('WRONG COLOR',`Clicked ${dot.color.toUpperCase()} dot ${dot.id}; target color was ${colorNames[level].toUpperCase()}`);
      setStatus('Distractor detected. Ignore other colors.');return;}
    hits++;score+=100*(level+1);
    if(dot.litAt!==null)times.push(Math.max(0,Math.round(t-dot.litAt)));
    setStatus(`Target acquired! +${100*(level+1)} points`);hud();
  }
  function draw(){
    ctx.clearRect(0,0,620,620);
    const bg=ctx.createRadialGradient(C,C,15,C,C,R+20);bg.addColorStop(0,'#0b4044');bg.addColorStop(1,'#02131c');
    ctx.fillStyle=bg;ctx.beginPath();ctx.arc(C,C,R+14,0,TWO_PI);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(C,C,R,0,TWO_PI);ctx.clip();
    ctx.strokeStyle='#26d5cf45';ctx.lineWidth=1.8;
    for(let i=1;i<=5;i++){ctx.beginPath();ctx.arc(C,C,R*i/5,0,TWO_PI);ctx.stroke();}
    for(let i=0;i<12;i++){const a=i*TWO_PI/12;ctx.beginPath();ctx.moveTo(C,C);ctx.lineTo(C+R*Math.cos(a),C+R*Math.sin(a));ctx.stroke();}
    const a=beamAngle();const spread=.69;
    const gradient=ctx.createRadialGradient(C,C,0,C,C,R);
    gradient.addColorStop(0,'rgba(36,255,215,.19)');gradient.addColorStop(1,'rgba(36,255,215,.025)');
    ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(C,C);ctx.arc(C,C,R,a-spread,a);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#39ffc5b3';ctx.lineWidth=3;ctx.shadowBlur=15;ctx.shadowColor='#34edbb';ctx.beginPath();ctx.moveTo(C,C);ctx.lineTo(C+R*Math.cos(a),C+R*Math.sin(a));ctx.stroke();ctx.shadowBlur=0;
    for(const dot of targets){
      const fading=dot.resolved;
      if(fading && t-dot.born>=dot.life+450)continue;
      const lit=!fading && isLit(dot);
      ctx.globalAlpha=fading?.25:lit?1:.55;
      ctx.fillStyle=colors[dot.color];ctx.shadowColor=colors[dot.color];ctx.shadowBlur=lit?28:5;
      ctx.beginPath();ctx.arc(dot.x,dot.y,dot.size*(lit?1.15:1),0,TWO_PI);ctx.fill();
      if(lit){ctx.strokeStyle='#f5ffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(dot.x,dot.y,dot.size+4,0,TWO_PI);ctx.stroke();}
      ctx.shadowBlur=0;
    }
    ctx.globalAlpha=1;ctx.restore();
    ctx.strokeStyle='#26e5dc';ctx.lineWidth=3;ctx.shadowBlur=12;ctx.shadowColor='#20dccc';ctx.beginPath();ctx.arc(C,C,R,0,TWO_PI);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#83fff0';ctx.font='12px Arial';ctx.textAlign='center';ctx.fillText('V.I.T.A.L.S. / ACTIVE SCAN',C,29);
    if(state!=='playing'){
      ctx.fillStyle='rgba(0,15,22,.54)';ctx.beginPath();ctx.arc(C,C,R-8,0,TWO_PI);ctx.fill();
      ctx.font='bold 23px Arial';ctx.fillStyle='#ecfffb';
      ctx.fillText(state==='ready'?'READY':state==='paused'?'PAUSED':state==='between'?'LEVEL COMPLETE':'SESSION COMPLETE',C,C+8);
    }
  }
  function frame(now){
    if(!previous)previous=now;
    const dt=Math.min(60,Math.max(0,now-previous));previous=now;
    tick(dt);draw();requestAnimationFrame(frame);
  }
  $('backTo').addEventListener('change',e=>{if(e.target.value)window.location.assign(e.target.value);});
  $('radar').addEventListener('pointerdown',clickRadar);
  $('start').addEventListener('click',()=>{if(state!=='ready')return;startedAt=new Date().toISOString();startLevel();});
  $('pause').addEventListener('click',()=>{
    if(state==='playing'){state='paused';$('pause').textContent='RESUME';setStatus('Radar paused. Game time and target timers are frozen.');}
    else if(state==='paused'){state='playing';$('pause').textContent='PAUSE';setStatus('Radar resumed.');}
  });
  $('restart').addEventListener('click',()=>{
    if(state!=='ready' && state!=='finished' && !window.confirm('Restart Focus Radar? Unsaved progress in this session will be lost.'))return;
    reset();
  });
  $('next').addEventListener('click',()=>{if(state!=='between'||level>=4)return;level++;startLevel();});
  $('review').addEventListener('click',()=>{
    if(state!=='finished')return;
    const box=$('mistakes');box.hidden=!box.hidden;
    if(!box.hidden){box.replaceChildren();const title=document.createElement('h3');title.textContent=`ERROR REVIEW (${log.length})`;box.append(title);
      if(!log.length){const p=document.createElement('p');p.textContent='No errors in this session.';box.append(p);}
      else {const ul=document.createElement('ul');log.forEach(e=>{const li=document.createElement('li');li.textContent=`Level ${e.level}, ${formatTime(e.time_ms)} â€” ${e.type}: ${e.details}`;ul.append(li);});box.append(ul);}}
    $('review').textContent=box.hidden?'REVIEW ERRORS':'HIDE ERRORS';
  });
  reset();requestAnimationFrame(frame);
})();

