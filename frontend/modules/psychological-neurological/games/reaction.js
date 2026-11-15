"use strict";
/* VITALS_COGNITIVE_TWIN_PROFILE_BINDING_V1 */
function vitalsActiveId(){try{const id=localStorage.getItem("vitals.activeAstronautId.v1");const list=JSON.parse(localStorage.getItem("vitals.cognitive.profiles.v1")||"[]");return Array.isArray(list)&&list.some(p=>p.id===id)?id:null;}catch{return null;}}
/* V.I.T.A.L.S. Reaction Time - original standalone experimental game.
   No external requests, no clinical interpretation, no dependency on other games. */
const $ = id => document.getElementById(id);
const canvas = $("arena"), ctx = canvas.getContext("2d");
const responseButtons = [...document.querySelectorAll("[data-response]")];
const levels = [
  {mode:"go",label:"GO / STOP",help:"GREEN circle: GO. RED circle: do not press. Wait for the stimulus.",wait:1100,window:1900,moving:false,flicker:false,noise:false},
  {mode:"direction",label:"LEFT / RIGHT / STOP",help:"Follow the arrow: LEFT or RIGHT. RED STOP: do not respond.",wait:1000,window:1700,moving:false,flicker:false,noise:false},
  {mode:"color",label:"COLOR GATE",help:"Only CYAN arrows count. Follow their direction. AMBER and RED: do not respond.",wait:900,window:1580,moving:false,flicker:false,noise:false},
  {mode:"reverse",label:"REVERSE DIRECTION",help:"Respond OPPOSITE to the arrow. RED STOP: do not respond.",wait:900,window:1480,moving:false,flicker:false,noise:false},
  {mode:"shape",label:"SHAPE CONTROL",help:"CIRCLE = LEFT, DIAMOND = RIGHT. RED STOP: do not respond.",wait:800,window:1380,moving:false,flicker:false,noise:true},
  {mode:"switch",label:"RULE SWITCH",help:"Read the highlighted instruction above each trial: NORMAL arrows or REVERSE arrows. RED means STOP.",wait:750,window:1250,moving:false,flicker:false,noise:true},
  {mode:"pan",label:"MOVING TARGET",help:"The stimulus pans left/right. Follow its ARROW, not its physical location. RED means STOP.",wait:700,window:1130,moving:true,flicker:false,noise:true},
  {mode:"flicker",label:"FLICKER / INHIBITION",help:"Ignore flicker. Respond to CYAN arrow only; AMBER or RED means STOP.",wait:650,window:1040,moving:true,flicker:true,noise:true},
  {mode:"conflict",label:"CONFLICT / SWITCH",help:"Use the highlighted NORMAL or REVERSE arrow rule. Distracting words can disagree. RED means STOP.",wait:600,window:950,moving:true,flicker:true,noise:true},
  {mode:"master",label:"MULTI-RULE CHALLENGE",help:"Follow the highlighted rule (NORMAL, REVERSE or SHAPE). Ignore movement, flicker and distracting words. RED means STOP.",wait:560,window:850,moving:true,flicker:true,noise:true}
];
const TRIALS = 6, STORAGE = "vitals.cognitive.reaction.sessions.v1";
let state="idle", levelIndex=0, trialIndex=0, score=0, correct=0, errors=0;
let lastTime=0, elapsed=0, phase="idle", phaseMs=0, phaseDuration=0, current=null;
let sessionStart=null, records=[], sessionEnd=null, levelSnapshots=[];
let visualTick=0, lastFrame=0;
const rand=(min,max)=>Math.random()*(max-min)+min;
const choose=xs=>xs[Math.floor(Math.random()*xs.length)];
const round = n => Math.round(n);

$("backTo").addEventListener("change",e=>{if(e.target.value)window.location.href=e.target.value;});
function setStatus(t){$("status").textContent=t;}
function updateHud(){
  $("level").textContent=`${Math.min(levelIndex+1,10)} / 10`;
  $("trial").textContent=`${state==="complete"?TRIALS:Math.min(trialIndex+1,TRIALS)} / ${TRIALS}`;
  $("score").textContent=String(score);$("hits").textContent=String(correct);$("errors").textContent=String(errors);
  const rts=records.filter(r=>r.outcome==="correct" && r.reaction_ms!==null).map(r=>r.reaction_ms);
  $("meanRt").textContent=rts.length?`${round(rts.reduce((a,b)=>a+b,0)/rts.length)} ms`:'â€”';
}
function updateControls(){
  $("start").disabled=state!=="idle";
  $("pause").disabled=!(["running","paused"].includes(state));
  $("pause").textContent=state==="paused"?"RESUME":"PAUSE";
  $("stop").disabled=!(["running","paused"].includes(state));
  $("retry").disabled=!(state==="running"||state==="paused");
  responseButtons.forEach(b=>{b.disabled=state!=="running";});
}
function newTrial(){
  const cfg=levels[levelIndex];
  const stop=Math.random()<.24;
  const arrow=choose(["LEFT","RIGHT"]);
  const shape=choose(["circle","diamond"]);
  const switchMode=choose(["normal","reverse"]);
  const masterMode=choose(["normal","reverse","shape"]);
  const rule=cfg.mode==="switch"||cfg.mode==="conflict"?switchMode:cfg.mode==="master"?masterMode:cfg.mode;
  let color=stop?"red":"cyan";
  if(cfg.mode==="go")color=stop?"red":"green";
  if(["color","flicker"].includes(cfg.mode) && !stop && Math.random()<.22)color="amber";
  let expected="NONE";
  if(color!=="red" && color!=="amber"){
    if(rule==="go")expected="GO";
    else if(rule==="shape")expected=shape==="circle"?"LEFT":"RIGHT";
    else if(rule==="reverse")expected=arrow==="LEFT"?"RIGHT":"LEFT";
    else expected=arrow;
  }
  current={level:levelIndex+1,trial:trialIndex+1,mode:cfg.mode,rule,color,arrow,shape,expected,
    distractor:choose(["LEFT","RIGHT","STOP","GO"]),pan:rand(-1,1),responded:false};
  const actualRule=rule==="normal"?"FOLLOW ARROW":rule==="reverse"?"REVERSE ARROW":rule==="shape"?"SHAPE (â—Ż LEFT / â—† RIGHT)":cfg.label;
  $("rule").textContent=actualRule;$("ruleHelp").textContent=cfg.help;
  phase="ready";phaseMs=0;phaseDuration=cfg.wait+rand(0,500);
  setStatus(`Level ${levelIndex+1} Â· Trial ${trialIndex+1}/${TRIALS} â€” Wait for the stimulus`);
  updateHud();
}
function startSession(){state="running";levelIndex=0;trialIndex=0;score=0;correct=0;errors=0;records=[];levelSnapshots=[];elapsed=0;sessionStart=new Date().toISOString();sessionEnd=null;
  $("report").hidden=true;$("reviewList").hidden=true;$("overlay").hidden=true;newTrial();updateControls();}
function snapshotTrial(outcome,action=null,rt=null){
  if(!current||current.responded)return;
  current.responded=true;
  const result={level:current.level,trial:current.trial,mode:current.mode,rule:current.rule,stimulus_color:current.color,arrow:current.arrow,shape:current.shape,
    expected:current.expected,response:action,outcome,reaction_ms:rt===null?null:round(rt),response_window_ms:levels[levelIndex].window};
  records.push(result);
  if(outcome==="correct"){correct++;score+=current.expected==="NONE"?70:Math.max(60,round(150+Math.max(0,levels[levelIndex].window-(rt||0))*.14));}
  else{errors++;}
  phase="feedback";phaseMs=0;phaseDuration=350;
  setStatus(outcome==="correct"?"CORRECT":outcome==="correct_inhibition"?"CORRECT STOP":outcome==="miss"?"MISSED RESPONSE":outcome==="false_alarm"?"FALSE ALARM":outcome==="premature"?"PREMATURE RESPONSE":"WRONG RESPONSE");
  updateHud();
}
function respond(action){
 if(state!=="running"||!current)return;
 if(phase==="ready"){
   // Premature response is a mistake; do not reveal target. Move on.
   snapshotTrial("premature",action,null);return;
 }
 if(phase!=="stimulus"||current.responded)return;
 const rt=phaseMs;
 if(current.expected==="NONE")snapshotTrial("false_alarm",action,rt);
 else snapshotTrial(current.expected===action?"correct":"wrong_choice",action,rt);
}
function completeTrialTimeout(){
 if(!current||current.responded)return;
 // For STOP trials, withholding is correct.
 if(current.expected==="NONE")snapshotTrial("correct",null,null);
 else snapshotTrial("miss",null,null);
}
function progress(){
 trialIndex++;
 if(trialIndex>=TRIALS){
   const lvl=levelIndex+1;
   levelSnapshots.push({level:lvl,correct:records.filter(r=>r.level===lvl&&r.outcome==="correct").length,errors:records.filter(r=>r.level===lvl&&r.outcome!=="correct").length});
   trialIndex=0;levelIndex++;
   if(levelIndex===levels.length){finish("completed");return;}
   setStatus(`Level ${levelIndex+1} / 10 â€” difficulty increased automatically`);
 }
 newTrial();
}
function makeReport(reason){
 const effective=records.filter(r=>r.outcome!=="retry_marker");
 const sessions={game:"Reaction Time",version:"1.0.0",started_at:sessionStart,ended_at:sessionEnd,completion:reason,
  completed_trials:effective.length,total_levels:levels.length,points:score,correct,errors,accuracy_percent:effective.length?round(correct/effective.length*1000)/10:null,
  mean_reaction_ms:null,levels:levelSnapshots,attempts:records};
 const rt=records.filter(r=>r.outcome==="correct"&&r.reaction_ms!==null).map(r=>r.reaction_ms);
 sessions.mean_reaction_ms=rt.length?round(rt.reduce((a,b)=>a+b,0)/rt.length):null;
 return sessions;
}
function saveLocal(report){
 try{const prev=JSON.parse(localStorage.getItem(STORAGE)||"[]");const arr=Array.isArray(prev)?prev:[];report.astronautId = vitalsActiveId(); arr.push(report);localStorage.setItem(STORAGE,JSON.stringify(arr.slice(-50)));return true;}
 catch(e){return false;}
}
let finalReport=null;
function finish(reason){
 state="complete";phase="idle";sessionEnd=new Date().toISOString();$("overlay").hidden=false;
 $("overlay").innerHTML=`<strong>${reason==="completed"?"SESSION COMPLETE":"SESSION STOPPED"}</strong><span>${correct} correct Â· ${errors} errors Â· ${score} points</span><span>Review your errors below or start a new session.</span>`;
 finalReport=makeReport(reason);const stored=saveLocal(finalReport);
 $("report").hidden=false;$("reportText").textContent=`${finalReport.completed_trials} trials Â· ${correct} correct Â· ${errors} errors Â· ${finalReport.accuracy_percent??0}% accuracy Â· ${finalReport.mean_reaction_ms??"â€”"} ms mean response. ${stored?"Saved locally for future Cognitive Twin integration.":"Local saving unavailable; export the report."}`;
 $("reviewList").hidden=true;$("review").textContent="REVIEW ERRORS";setStatus(reason==="completed"?"All ten levels finished":"Session ended");updateControls();updateHud();
}
function retryLevel(){
 if(state==="idle")return;
 // A retry is an optional additional attempt. Previous records remain and are tagged with attempt number.
 const n=levelIndex+1; const retryCount=records.filter(r=>r.level===n).length/TRIALS;
 records.push({level:n,trial:0,outcome:"retry_marker",expected:null,response:null,reaction_ms:null,repeat_number:Math.floor(retryCount)+1});
 trialIndex=0;newTrial();state="running";setStatus(`Retrying level ${n}; prior attempts and errors are retained`);updateControls();
}
function restart(){state="idle";phase="idle";current=null;lastFrame=0;$("overlay").hidden=false;$("overlay").innerHTML="<strong>REACTION TIME</strong><span>10 adaptive levels Â· 6 trials per level</span><span>Press START to begin</span>";$("report").hidden=true;
 levelIndex=0;trialIndex=0;correct=0;errors=0;score=0;records=[];elapsed=0;finalReport=null;setStatus("Ready. Respond only when the stimulus appears.");$("rule").textContent="GO / STOP";$("ruleHelp").textContent=levels[0].help;updateHud();updateControls();}
function pauseResume(){if(state==="running"){state="paused";$("overlay").hidden=false;$("overlay").innerHTML="<strong>PAUSED</strong><span>Press RESUME to continue</span>";setStatus("Paused â€” all timing frozen");}else if(state==="paused"){state="running";$("overlay").hidden=true;setStatus("Resumed");}updateControls();}
function renderReview(){const el=$("reviewList");if(!finalReport)return;
 if(!el.hidden){el.hidden=true;$("review").textContent="REVIEW ERRORS";return;}
 const bad=records.filter(r=>r.outcome!=="correct"&&r.outcome!=="retry_marker");el.replaceChildren();
 const lead=document.createElement("p");lead.textContent=bad.length?`${bad.length} errors recorded (including retries):`:'No errors in this session.';el.append(lead);
 if(bad.length){const table=document.createElement("table");const thead=document.createElement("thead");thead.innerHTML="<tr><th>Level</th><th>Trial</th><th>Issue</th><th>Expected</th><th>Response</th><th>RT</th></tr>";table.append(thead);const tb=document.createElement("tbody");
 bad.forEach(r=>{const row=document.createElement("tr");[r.level,r.trial,r.outcome,r.expected||"â€”",r.response||"None",r.reaction_ms===null?"â€”":r.reaction_ms+" ms"].forEach(v=>{const td=document.createElement("td");td.textContent=String(v);row.append(td);});tb.append(row);});table.append(tb);el.append(table);}el.hidden=false;$("review").textContent="HIDE ERRORS";
}
function exportReport(){if(!finalReport)return;const blob=new Blob([JSON.stringify(finalReport,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`VITALS_reaction_${new Date().toISOString().replace(/[:.]/g,"-")}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
responseButtons.forEach(b=>b.addEventListener("click",()=>respond(b.dataset.response)));
document.addEventListener("keydown",e=>{if(e.repeat||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLButtonElement)return;
 const action=({KeyA:"LEFT",KeyD:"RIGHT",Space:"GO",ArrowLeft:"LEFT",ArrowRight:"RIGHT"})[e.code];if(action){e.preventDefault();respond(action);}});
$("start").addEventListener("click",startSession);$("pause").addEventListener("click",pauseResume);$("restart").addEventListener("click",restart);$("stop").addEventListener("click",()=>finish("stopped"));$("retry").addEventListener("click",retryLevel);$("review").addEventListener("click",renderReview);$("export").addEventListener("click",exportReport);

function draw(t){
 const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
 const bg=ctx.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.55);bg.addColorStop(0,"#093f4c");bg.addColorStop(1,"#021722");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle="rgba(39,220,219,.18)";ctx.lineWidth=1;for(let x=0;x<w;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
 ctx.strokeStyle="rgba(42,230,230,.27)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(w/2,h/2,165,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,100,0,Math.PI*2);ctx.stroke();
 ctx.font="16px Arial";ctx.textAlign="center";ctx.fillStyle="#6fdfde";ctx.fillText("V.I.T.A.L.S. / RESPONSE TRACKER",w/2,34);
 if(state==="idle"||state==="complete"||!current)return;
 const cfg=levels[levelIndex];
 if(phase==="ready"){ctx.font="bold 30px Arial";ctx.fillStyle="#a3dbde";ctx.fillText("WAIT...",w/2,h/2);return;}
 if(phase==="feedback"){ctx.font="bold 26px Arial";ctx.fillStyle="#ffd29b";ctx.fillText("NEXT TRIAL",w/2,h/2);return;}
 if(phase!=="stimulus")return;
 const progress=phaseMs/cfg.window;
 const motion=cfg.moving? Math.sin(phaseMs/220)*105 : 0;
 const x=w/2+motion+(cfg.moving?current.pan*25:0),y=h/2;
 if(cfg.noise){ctx.globalAlpha=.23;ctx.font="bold 28px Arial";ctx.fillStyle="#79d5cd";ctx.fillText(current.distractor,118,125);ctx.fillText(current.distractor==="LEFT"?"RIGHT":"LEFT",700,330);ctx.globalAlpha=1;}
 const flickerOff=cfg.flicker&&Math.sin(phaseMs/1000*2*Math.PI*1.8)<-.55;
 if(!flickerOff){
  const color=({red:"#ff626e",green:"#57e6a9",cyan:"#39dfe6",amber:"#ffd071"})[current.color];
  ctx.save();ctx.translate(x,y);ctx.shadowColor=color;ctx.shadowBlur=32;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=6;
  if(current.shape==="diamond"&&["shape","master"].includes(cfg.mode)){ctx.beginPath();ctx.moveTo(0,-62);ctx.lineTo(62,0);ctx.lineTo(0,62);ctx.lineTo(-62,0);ctx.closePath();ctx.stroke();ctx.globalAlpha=.27;ctx.fill();ctx.globalAlpha=1;}
  else {ctx.beginPath();ctx.arc(0,0,62,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=1;}
  ctx.shadowBlur=12;ctx.fillStyle="#eaffff";ctx.font="bold 65px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
  if(current.color==="red")ctx.fillText("â– ",0,0);
  else if(cfg.mode==="go")ctx.fillText("GO",0,2);
  else ctx.fillText(current.arrow==="LEFT"?"â—€":"â–¶",0,2);
  ctx.restore();
 }
 ctx.fillStyle="#86cfcd";ctx.font="13px Arial";ctx.fillText(`RESPONSE WINDOW: ${round(cfg.window-phaseMs)} ms`,w/2,h-30);
 ctx.fillStyle="#e5aa60";ctx.fillRect(100,h-13,(w-200)*Math.max(0,1-progress),5);
}
function frame(now){
 if(!lastFrame)lastFrame=now;const dt=Math.min(60,now-lastFrame);lastFrame=now;
 if(state==="running"){
   elapsed+=dt;
   phaseMs+=dt;
   if(phase==="ready" && phaseMs>=phaseDuration){phase="stimulus";phaseMs=0;setStatus(`Level ${levelIndex+1} Â· Trial ${trialIndex+1} â€” RESPOND NOW`);}
   else if(phase==="stimulus" && phaseMs>=levels[levelIndex].window){completeTrialTimeout();}
   else if(phase==="feedback"&&phaseMs>=phaseDuration){progress();}
 }
 draw(now);requestAnimationFrame(frame);
}
restart();requestAnimationFrame(frame);

