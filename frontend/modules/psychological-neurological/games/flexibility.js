"use strict";
/* VITALS_COGNITIVE_TWIN_PROFILE_BINDING_V1 */
function vitalsActiveId(){try{const id=localStorage.getItem("vitals.activeAstronautId.v1");const list=JSON.parse(localStorage.getItem("vitals.cognitive.profiles.v1")||"[]");return Array.isArray(list)&&list.some(p=>p.id===id)?id:null;}catch{return null;}}
/* V.I.T.A.L.S. Cognitive Flexibility v1.0 - standalone, experimental. */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const $ = id => document.getElementById(id);
  const UI = {
    level: $("levelValue"), trial: $("trialValue"), points: $("pointsValue"),
    correct: $("correctValue"), errors: $("errorsValue"), time: $("timeValue"),
    instruction: $("instruction"), rule: $("ruleName"), switches: $("switchCount"),
    progress: $("progressText"), visual: $("stimulusVisual"), caption: $("stimulusCaption"),
    symbol: $("stimulusSymbol"), meta: $("stimulusMeta"), options: $("answerOptions"),
    optionHeading: $("optionsHeading"), feedback: $("feedback"),
    start: $("startBtn"), pause: $("pauseBtn"), restart: $("restartBtn"),
    retry: $("retryBtn"), review: $("reviewBtn"), export: $("exportBtn"),
    reviewPanel: $("reviewPanel"), reviewContent: $("reviewContent")
  };

  const COLORS = [
    ["RED", "#ff4e66"], ["BLUE", "#4eb7ff"], ["GOLD", "#ffd16b"],
    ["GREEN", "#42e38c"], ["PURPLE", "#b18bff"], ["ORANGE", "#ff944c"],
    ["CYAN", "#2de5ef"], ["PINK", "#ff86c4"], ["WHITE", "#edfaff"],
    ["LIME", "#c9ef66"], ["TEAL", "#25d4b1"], ["MAGENTA", "#f252d8"],
    ["CORAL", "#fa8277"], ["INDIGO", "#858cff"], ["AMBER", "#e4ac44"]
  ].map(([label, hex]) => ({label, hex}));
  const SHAPES = ["SQUARE", "CIRCLE", "TRIANGLE", "DIAMOND", "PENTAGON",
    "HEXAGON", "HEPTAGON", "OCTAGON", "STAR", "CROSS", "HEART", "OVAL",
    "TRAPEZOID", "PARALLELOGRAM", "ARROW"];
  const SIZES = ["SMALL", "MEDIUM", "LARGE", "EXTRA LARGE"];
  const FILLS = ["SOLID", "OUTLINE"];
  const SYMBOLS = [
    ["SUN", "â€"], ["MOON", "âľ"], ["LIGHTNING", "âšˇ"], ["CLOUD", "â"],
    ["MUSIC", "â™«"], ["CLUB", "â™Ł"], ["SPADE", "â™ "], ["HEART SYMBOL", "â™Ą"],
    ["STAR SYMBOL", "âś¦"], ["ANCHOR", "âš“"], ["FLOWER", "âśż"],
    ["UMBRELLA", "â‚"], ["CROSS SYMBOL", "âśš"], ["COMMAND", "âŚ"], ["PEACE", "â®"]
  ].map(([label, glyph]) => ({label, glyph}));
  const SETTINGS = [
    {level:1, shapeCount:5, colorCount:5, rules:["SHAPE"], choiceCount:3, limit:11000},
    {level:2, shapeCount:8, colorCount:8, rules:["SHAPE","COLOR"], choiceCount:4, limit:9000},
    {level:3, shapeCount:11, colorCount:11, rules:["COLOR","SIZE","SHAPE","FILL"], choiceCount:4, limit:7500},
    {level:4, shapeCount:13, colorCount:13, rules:["SHAPE","COLOR","WORD","SIZE","FILL"], choiceCount:5, limit:6000},
    {level:5, shapeCount:15, colorCount:15, rules:["SYMBOL","WORD","COLOR","SHAPE","SIZE","FILL"], choiceCount:6, limit:4800}
  ];
  const ROUNDS_PER_LEVEL = 5;
  const STORAGE_KEY = "vitals.cognitive.flexibility.sessions.v1";
  const pick = xs => xs[Math.floor(Math.random()*xs.length)];
  const shuffle = xs => {
    const a = [...xs];
    for (let i=a.length-1;i>0;i--) {
      const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };
  const svgEl = (tag, attrs={}) => {
    const el=document.createElementNS(NS,tag);
    for (const [key,value] of Object.entries(attrs)) el.setAttribute(key,String(value));
    return el;
  };
  function polygonPoints(sides, r=43, cx=50, cy=50, offset=-Math.PI/2) {
    return Array.from({length:sides},(_,i)=>{
      const theta=offset+i*2*Math.PI/sides;
      return `${cx+r*Math.cos(theta)},${cy+r*Math.sin(theta)}`;
    }).join(" ");
  }
  function starPoints(outer=45,inner=19,arms=5) {
    return Array.from({length:arms*2},(_,i)=>{
      const angle=-Math.PI/2+i*Math.PI/arms;
      const radius=i%2?inner:outer;
      return `${50+Math.cos(angle)*radius},${50+Math.sin(angle)*radius}`;
    }).join(" ");
  }
  function figureSVG(shape, color, fill, size, small=false) {
    const svg=svgEl("svg", {viewBox:"0 0 100 100",role:"img", "aria-label":`${size} ${fill.toLowerCase()} ${color.label.toLowerCase()} ${shape.toLowerCase()}`});
    const scale=small?0.89:({"SMALL":.56,"MEDIUM":.72,"LARGE":.88,"EXTRA LARGE":1}[size]||.72);
    const g=svgEl("g", {transform:`translate(50 50) scale(${scale}) translate(-50 -50)`});
    const props={fill:fill==="SOLID"?color.hex:"none",stroke:color.hex,"stroke-width":fill==="SOLID"?3.0:6.0,"stroke-linejoin":"round"};
    let shapeEl;
    switch(shape) {
      case "CIRCLE": shapeEl=svgEl("circle",{cx:50,cy:50,r:42,...props});break;
      case "OVAL": shapeEl=svgEl("ellipse",{cx:50,cy:50,rx:44,ry:27,...props});break;
      case "SQUARE": shapeEl=svgEl("rect",{x:13,y:13,width:74,height:74,...props});break;
      case "DIAMOND":shapeEl=svgEl("polygon",{points:"50,4 96,50 50,96 4,50",...props});break;
      case "STAR":shapeEl=svgEl("polygon",{points:starPoints(),...props});break;
      case "CROSS":shapeEl=svgEl("path",{d:"M36 5 H64 V36 H95 V64 H64 V95 H36 V64 H5 V36 H36 Z",...props});break;
      case "HEART":shapeEl=svgEl("path",{d:"M50 91 C22 68 7 51 7 31 C7 9 37 3 50 25 C63 3 93 9 93 31 C93 51 78 68 50 91 Z",...props});break;
      case "TRAPEZOID":shapeEl=svgEl("polygon",{points:"30,12 70,12 94,88 6,88",...props});break;
      case "PARALLELOGRAM":shapeEl=svgEl("polygon",{points:"30,12 97,12 70,88 3,88",...props});break;
      case "ARROW":shapeEl=svgEl("polygon",{points:"6,34 55,34 55,10 96,50 55,90 55,66 6,66",...props});break;
      case "TRIANGLE":shapeEl=svgEl("polygon",{points:polygonPoints(3),...props});break;
      case "PENTAGON":shapeEl=svgEl("polygon",{points:polygonPoints(5),...props});break;
      case "HEXAGON":shapeEl=svgEl("polygon",{points:polygonPoints(6),...props});break;
      case "HEPTAGON":shapeEl=svgEl("polygon",{points:polygonPoints(7),...props});break;
      case "OCTAGON":shapeEl=svgEl("polygon",{points:polygonPoints(8),...props});break;
      default:shapeEl=svgEl("circle",{cx:50,cy:50,r:42,...props});
    }
    g.append(shapeEl);svg.append(g);return svg;
  }

  let state="idle", previousState="idle", level=0, trial=0, points=0,
      correctCount=0,errorCount=0,switchCount=0,remaining=0,feedbackRemain=0,
      current=null,lastRule=null,startedAt=null,lastFrame=performance.now(),gameToken=0;
  let records=[],errors=[],levelHistory=[],retryCounts=[0,0,0,0,0],finishedAt=null;

  function setButtons() {
    UI.start.disabled=state!=="idle";
    UI.pause.disabled=!["playing","feedback","paused"].includes(state);
    UI.pause.textContent=state==="paused"?"RESUME":"PAUSE";
    UI.retry.disabled=!["playing","feedback","paused"].includes(state);
    UI.review.disabled=errors.length===0;
    UI.export.disabled=records.length===0;
  }
  function repaintStats() {
    UI.level.textContent=`${level+1} / ${SETTINGS.length}`;
    UI.trial.textContent=`${Math.min(trial+1,ROUNDS_PER_LEVEL)} / ${ROUNDS_PER_LEVEL}`;
    UI.points.textContent=points.toLocaleString("en-US");
    UI.correct.textContent=String(correctCount);
    UI.errors.textContent=String(errorCount);
    UI.time.textContent=state==="idle"?"--":`${(Math.max(0,remaining)/1000).toFixed(1)} s`;
    UI.switches.textContent=String(switchCount);
    UI.progress.textContent=`${Math.min(trial,ROUNDS_PER_LEVEL)} / ${ROUNDS_PER_LEVEL}`;
  }
  function ruleFor(levelIndex,trialIndex) {
    const list=SETTINGS[levelIndex].rules;
    if(levelIndex===0) return list[0];
    // Guaranteed frequent rule-switching; increasing variety by level.
    const idx=(trialIndex+levelIndex-1)%list.length;
    return list[idx];
  }
  function optionsFor(rule,stimulus,setting) {
    let pool,selected,render;
    switch(rule) {
      case "SHAPE":
        pool=SHAPES.slice(0,setting.shapeCount);selected=stimulus.shape;
        render=(v,holder)=>holder.append(figureSVG(v,{label:"CYAN",hex:"#49e9e1"},"OUTLINE","LARGE",true));break;
      case "COLOR":
        pool=COLORS.slice(0,setting.colorCount).map(c=>c.label);selected=stimulus.color.label;
        render=(v,holder)=>{
          const span=document.createElement("span");span.className="color-swatch";
          span.style.backgroundColor=COLORS.find(c=>c.label===v).hex;
          holder.append(span);
        };break;
      case "SIZE":
        pool=SIZES;selected=stimulus.size;
        render=(v,holder)=>holder.append(figureSVG("SQUARE",{label:"CYAN",hex:"#49e9e1"},"SOLID",v,false));break;
      case "FILL":
        pool=FILLS;selected=stimulus.fill;
        render=(v,holder)=>holder.append(figureSVG("CIRCLE",{label:"CYAN",hex:"#49e9e1"},v,"MEDIUM",true));break;
      case "WORD":
        pool=COLORS.slice(0,setting.colorCount).map(c=>c.label);selected=stimulus.word;
        render=()=>{};break;
      default:
        pool=SYMBOLS.map(s=>s.label);selected=stimulus.symbol.label;
        render=(v,holder)=>{const s=document.createElement("span");s.className="symbol-choice";
          s.textContent=SYMBOLS.find(x=>x.label===v).glyph;holder.append(s);};
    }
    const count=Math.min(setting.choiceCount,pool.length);
    const choices=shuffle([selected,...shuffle(pool.filter(s=>s!==selected)).slice(0,count-1)]);
    return {choices,selected,render};
  }
  function makeStimulus(setting) {
    const color=pick(COLORS.slice(0,setting.colorCount));
    const otherColors=COLORS.slice(0,setting.colorCount).filter(c=>c.label!==color.label);
    return {shape:pick(SHAPES.slice(0,setting.shapeCount)),color,
      fill:pick(FILLS),size:pick(SIZES),word:pick(otherColors).label,
      symbol:pick(SYMBOLS)};
  }
  function newTrial() {
    if(state==="finished")return;
    if(trial>=ROUNDS_PER_LEVEL) { nextLevel();return; }
    const setting=SETTINGS[level],rule=ruleFor(level,trial);
    if(lastRule!==null && lastRule!==rule) switchCount++;
    lastRule=rule;
    const stimulus=makeStimulus(setting),options=optionsFor(rule,stimulus,setting);
    current={rule,stimulus,options,level:level+1,trial:trial+1,limit:setting.limit,answered:false};
    remaining=setting.limit;
    UI.rule.textContent=rule;
    UI.meta.textContent=`LEVEL ${level+1} Â· TRIAL ${trial+1} OF 5`;
    UI.visual.replaceChildren(figureSVG(stimulus.shape,stimulus.color,stimulus.fill,stimulus.size));
    UI.caption.textContent=level>=3?stimulus.word:"";
    UI.symbol.textContent=level===4?stimulus.symbol.glyph:"";
    UI.symbol.setAttribute("aria-label",level===4?stimulus.symbol.label:"");
    UI.instruction.textContent={SHAPE:"Choose the SHAPE â€” ignore color, size and fill.",
      COLOR:"Choose the COLOR of the figure â€” ignore the written word.",
      SIZE:"Choose the SIZE of the figure.",FILL:"Is the figure SOLID or OUTLINE?",
      WORD:"Choose the WRITTEN COLOR WORD â€” ignore the figure color.",
      SYMBOL:"Choose the SYMBOL shown below the figure."}[rule];
    UI.optionHeading.textContent=`CHOOSE ${rule} â€˘ ${options.choices.length} OPTIONS`;
    UI.options.replaceChildren();
    for(const value of options.choices) {
      const btn=document.createElement("button");btn.type="button";btn.className="option";
      btn.setAttribute("aria-label",value);
      const icon=document.createElement("span");icon.className="choice-icon";
      const label=document.createElement("span");label.className="choice-label";label.textContent=value;
      options.render(value,icon);
      if(icon.childNodes.length)btn.append(icon);
      btn.append(label);
      btn.addEventListener("click",()=>answer(value));
      UI.options.append(btn);
    }
    UI.feedback.textContent="Select one answer before the countdown ends.";
    state="playing";setButtons();repaintStats();
  }
  function answer(value) {
    if(state!=="playing"||!current||current.answered)return;
    const isCorrect=value===current.options.selected;
    const responseMs=Math.round(current.limit-remaining);
    resolveTrial(value,isCorrect,responseMs,value===null?"TIMEOUT":isCorrect?"CORRECT":"WRONG ANSWER");
  }
  function resolveTrial(value,isCorrect,responseMs,reason) {
    if(!current||current.answered)return;
    current.answered=true;
    const rec={level:level+1,trial:trial+1,rule:current.rule,
      stimulus:{shape:current.stimulus.shape,color:current.stimulus.color.label,
      size:current.stimulus.size,fill:current.stimulus.fill,
      written_word:current.stimulus.word,symbol:current.stimulus.symbol.label},
      options:[...current.options.choices],expected:current.options.selected,
      response:value,result:reason,correct:isCorrect,response_ms:responseMs,
      level_attempt:retryCounts[level]+1,
      recorded_at:new Date().toISOString()};
    records.push(rec);
    if(isCorrect){correctCount++;const base=120;
      const speed=Math.round(80*Math.max(0,remaining)/current.limit);
      points+=base+speed;UI.feedback.textContent=`CORRECT Â· +${base+speed} POINTS`;
    }else{errorCount++;errors.push(rec);UI.feedback.textContent=
      `${reason} Â· CORRECT: ${rec.expected}`;}
    UI.options.querySelectorAll("button").forEach(b=>b.disabled=true);
    state="feedback";feedbackRemain=900;
    trial++;setButtons();repaintStats();
    UI.progress.textContent=`${trial} / ${ROUNDS_PER_LEVEL}`;
  }
  function nextLevel() {
    levelHistory.push({level:level+1,completed_trials:ROUNDS_PER_LEVEL,
      attempts:retryCounts[level]+1,completed_at:new Date().toISOString()});
    if(level+1>=SETTINGS.length) { finish();return; }
    level++;trial=0;UI.feedback.textContent=`LEVEL ${level+1} / 5 Â· DIFFICULTY INCREASED`;
    newTrial();
  }
  function start() {
    gameToken++;
    state="playing";previousState="idle";level=0;trial=0;points=0;
    correctCount=0;errorCount=0;switchCount=0;remaining=0;feedbackRemain=0;
    current=null;lastRule=null;startedAt=new Date().toISOString();finishedAt=null;
    records=[];errors=[];levelHistory=[];retryCounts=[0,0,0,0,0];
    UI.reviewPanel.hidden=true;
    newTrial();
  }
  function finish() {
    state="finished";finishedAt=new Date().toISOString();
    UI.visual.replaceChildren();UI.caption.textContent="SESSION COMPLETE";
    UI.symbol.textContent="";UI.options.replaceChildren();
    UI.rule.textContent="COMPLETE";UI.optionHeading.textContent="Five levels finished.";
    UI.instruction.textContent=`${correctCount} correct / ${records.length} responses; ${errorCount} errors.`;
    UI.feedback.textContent="Use REVIEW ERRORS to inspect every mistake, or EXPORT RESULTS to download the session.";
    remaining=0;setButtons();repaintStats();
    const record=sessionRecord();
    try {
      const old=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
      if(!Array.isArray(old))throw new Error("Invalid local data");
      record.astronautId = vitalsActiveId(); old.push(record);
      localStorage.setItem(STORAGE_KEY,JSON.stringify(old.slice(-30)));
    }catch(e){UI.feedback.textContent+=" Local storage unavailable; use EXPORT RESULTS.";}
  }
  function sessionRecord() {
    const eligible=records.filter(r=>!r.excluded_from_accuracy);
    const valid=eligible.filter(r=>r.response!==null);
    const mean=valid.length?Math.round(valid.reduce((s,r)=>s+r.response_ms,0)/valid.length):null;
    return {
      game:"cognitive-flexibility",version:"1.0.0",assessment_type:"experimental-not-clinical",
      started_at:startedAt,completed_at:finishedAt,levels_configured:5,
      trials_per_level:ROUNDS_PER_LEVEL,attempted_trials:eligible.length,
      total_logged_events:records.length,correct_trials:correctCount,errors:errorCount,
      accuracy_percent:eligible.length?Math.round(10000*correctCount/eligible.length)/100:0,
      mean_response_ms:mean,rule_switches:switchCount,points,
      retries_by_level:retryCounts,level_history:levelHistory,
      colors_supported:COLORS.length,shapes_supported:SHAPES.length,
      trials:records,errors_detail:errors
    };
  }
  function pause() {
    if(state==="paused") {
      state=previousState;UI.feedback.textContent="RESUMED";
    }else if(state==="playing"||state==="feedback") {
      previousState=state;state="paused";
      UI.feedback.textContent="PAUSED â€” timer stopped. Press RESUME.";
    }
    setButtons();
  }
  function retryLevel() {
    if(!["playing","feedback","paused"].includes(state))return;
    if(!window.confirm(`Retry Level ${level+1}? Previous answers and errors remain in the review.`))return;
    retryCounts[level]++;
    if(state==="playing" && current && !current.answered) {
      records.push({level:level+1,trial:trial+1,rule:current.rule,
        stimulus:{shape:current.stimulus.shape,color:current.stimulus.color.label,
          fill:current.stimulus.fill,size:current.stimulus.size,word:current.stimulus.word,
          symbol:current.stimulus.symbol.label},
        options:[...current.options.choices],expected:current.options.selected,
        response:null,result:"RETRY_ABORTED",correct:false,response_ms:null,
        level_attempt:retryCounts[level],recorded_at:new Date().toISOString(),excluded_from_accuracy:true});
    }
    trial=0;state="playing";UI.reviewPanel.hidden=true;
    UI.feedback.textContent=`RETRYING LEVEL ${level+1}`;
    newTrial();
  }
  function showReview() {
    if(state==="playing"||state==="feedback")pause();
    UI.reviewPanel.hidden=false;
    UI.reviewContent.replaceChildren();
    const p=document.createElement("p");p.className="review-summary";
    p.textContent=`Errors: ${errors.length} | Correct: ${correctCount} | Rule switches: ${switchCount} | Points: ${points}`;
    UI.reviewContent.append(p);
    if(errors.length===0) {
      const empty=document.createElement("p");empty.textContent="No errors recorded yet.";
      UI.reviewContent.append(empty);return;
    }
    const table=document.createElement("table");table.className="review-table";
    const head=document.createElement("thead");const hr=document.createElement("tr");
    for (const title of ["LEVEL / TRIAL","RULE","SHAPE / COLOR / SIZE","YOUR ANSWER","CORRECT ANSWER","ERROR"]) {
      const th=document.createElement("th");th.textContent=title;hr.append(th);
    }
    head.append(hr);table.append(head);
    const body=document.createElement("tbody");
    for(const r of errors) {
      const tr=document.createElement("tr");
      const cells=[`${r.level} / ${r.trial}`,r.rule,
        `${r.stimulus.shape} / ${r.stimulus.color} / ${r.stimulus.size}`,
        r.response??"No answer",r.expected,r.result];
      for(const value of cells){const td=document.createElement("td");td.textContent=value;tr.append(td);}
      body.append(tr);
    }
    table.append(body);UI.reviewContent.append(table);
    UI.reviewPanel.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  function exportResults() {
    if(records.length===0)return;
    const json=JSON.stringify(sessionRecord(),null,2);
    const url=URL.createObjectURL(new Blob([json],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;
    a.download=`VITALS_cognitive_flexibility_${new Date().toISOString().replace(/[:.]/g,"-")}.json`;
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function tick(now) {
    const dt=Math.min(Math.max(0,now-lastFrame),250);
    lastFrame=now;
    if(state==="playing"){
      remaining=Math.max(0,remaining-dt);
      UI.time.textContent=`${(remaining/1000).toFixed(1)} s`;
      if(remaining<=0)resolveTrial(null,false,current?.limit??null,"TIMEOUT");
    }else if(state==="feedback"){
      feedbackRemain-=dt;
      if(feedbackRemain<=0) newTrial();
    }
    requestAnimationFrame(tick);
  }
  UI.start.addEventListener("click",start);
  UI.pause.addEventListener("click",pause);
  UI.restart.addEventListener("click",()=>{if(window.confirm("Restart the complete session? Previous unsaved session data will be replaced."))start();});
  UI.retry.addEventListener("click",retryLevel);
  UI.review.addEventListener("click",showReview);
  UI.export.addEventListener("click",exportResults);
  $("closeReviewBtn").addEventListener("click",()=>{UI.reviewPanel.hidden=true;});
  $("backTo").addEventListener("change",e=>{if(e.target.value)window.location.assign(e.target.value);});
  window.addEventListener("blur",()=>{if(state==="playing"||state==="feedback")pause();});
  setButtons();repaintStats();requestAnimationFrame(tick);
})();

