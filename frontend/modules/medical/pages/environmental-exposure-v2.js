"use strict";
// V.I.T.A.L.S. Environmental Exposure V2 — educational hypothetical scenario only.
// The V1 calculator remains the single source for its displayed total and export.
(() => {
  const el = id => document.getElementById(id);
  const key = "vitals.astronauts.v1";
  const priorKey = "vitals.activeAstronautId.v1";
  const panel = el("dailyExposureV2");
  if (!panel || !el("calculate")) return;
  const summary = el("dailySummaryV2"), plot = el("dailyPlotV2"), table = el("dailyTableV2");
  const exportBtn = el("exportDailyV2");
  const notice = el("individualNoticeV2");
  let last = null;
  const txt = value => value == null ? "" : String(value).trim();
  const fmt = n => Number(n).toLocaleString("en-US", {maximumFractionDigits: 5});
  const safeRead = k => {try {return JSON.parse(localStorage.getItem(k) || "null");} catch {return null;}};
  function clear(reason) {
    last = null; summary.textContent = reason || "Enter hypothetical habitat and EVA rates, then select CALCULATE DEMO EXPOSURE.";
    notice.textContent = "No patient-specific biological risk or clinical outcome is calculated.";
    plot.replaceChildren();table.replaceChildren();exportBtn.disabled = true;
  }
  function mk(tag, name, content) {
    const e = document.createElement(tag);
    if (name) e.className = name;
    if (content !== undefined) e.textContent = String(content);
    return e;
  }
  function draw(series, withPrior) {
    plot.replaceChildren();
    const NS = "http://www.w3.org/2000/svg";
    const W=900,H=250,L=72,R=25,T=30,B=47;
    const svg=document.createElementNS(NS,"svg");
    svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
    svg.setAttribute("role","img");
    svg.setAttribute("aria-label","Daily projected cumulative hypothetical equivalent dose in millisieverts. Optional synthetic prior baseline is displayed as a separate line.");
    const ymax = Math.max(0.001, ...series.map(x => x.missionDose), ...series.filter(x=>x.withPrior!==null).map(x=>x.withPrior));
    const maxX = Math.max(1, series.length - 1);
    const coords = (arr,k) => arr.map((x,i) => `${(L+(i/maxX)*(W-L-R)).toFixed(2)},${(H-B-(x[k]/ymax)*(H-B-T)).toFixed(2)}`).join(" ");
    for (let i=0;i<=4;i++) {
      const y = T+i*(H-B-T)/4;
      const line=document.createElementNS(NS,"line");line.setAttribute("x1",L);line.setAttribute("x2",W-R);line.setAttribute("y1",y);line.setAttribute("y2",y);line.setAttribute("stroke","#396b64");line.setAttribute("stroke-opacity","0.6");svg.append(line);
      const lab=document.createElementNS(NS,"text");lab.setAttribute("x",L-8);lab.setAttribute("y",y+4);lab.setAttribute("text-anchor","end");lab.setAttribute("fill","#b9d6d0");lab.setAttribute("font-size","12");lab.textContent=fmt(ymax*(1-i/4));svg.append(lab);
    }
    for(const [k,color] of [["missionDose","#53ff8c"],["withPrior","#e6b072"]]){
      if(k==="withPrior"&&!withPrior)continue;
      const poly=document.createElementNS(NS,"polyline");poly.setAttribute("points",coords(series,k));poly.setAttribute("fill","none");poly.setAttribute("stroke",color);poly.setAttribute("stroke-width",3);poly.setAttribute("stroke-linejoin","round");svg.append(poly);
    }
    const l=document.createElementNS(NS,"text");l.setAttribute("x",L);l.setAttribute("y",H-10);l.setAttribute("fill","#b9d6d0");l.setAttribute("font-size","13");l.textContent=`Day 0 to ${fmt(series.at(-1).day)} | cumulative equivalent dose, mSv`;svg.append(l);
    plot.append(svg);
  }
  function calc() {
    const num = id => {const v=el(id)?.value.trim();return v === "" ? NaN : Number(v);};
    const duration=num("days"),hours=num("evaHours"),habitat=num("habitatRate"),eva=num("evaRate");
    if (![duration,hours,habitat,eva].every(v => Number.isFinite(v)&&v>=0) || duration<=0 || duration>3650 || hours>duration*24) {
      clear("Enter valid inputs: duration 0–3650 days, nonnegative rates and EVA hours no greater than total hours.");return;
    }
    const totalHours=duration*24, share=hours/totalHours;
    // Uniformly distribute planned EVA hours over the mission, for an educational trend.
    // This is not an EVA timetable, solar particle event model, or time-resolved dosimeter measurement.
    const missionTotal=((totalHours-hours)*habitat+hours*eva)/1000;
    if (!Number.isFinite(missionTotal)) {clear("Calculation exceeded the supported numeric range.");return;}
    const profiles=safeRead(key), selected=txt(el("astronaut")?.value || localStorage.getItem(priorKey));
    const p=Array.isArray(profiles)?profiles.find(x=>txt(x.astronautId||x.id)===selected):null;
    const priorRaw=p?.metrics?.cumulativeRadiationDoseMSvSimulation;
    const prior=typeof priorRaw === "number" && Number.isFinite(priorRaw) && priorRaw>=0 ? priorRaw : null;
    const count=Math.min(180,Math.max(2,Math.ceil(duration)));
    const points=Array.from({length:count+1},(_,i)=>{
      const day=i/count*duration;
      const missionDose=day/duration*missionTotal;
      return {day, missionDose, withPrior:prior===null?null:prior+missionDose};
    });
    const name=p?txt(p.fullName||p.name):"No confirmed astronaut";
    summary.textContent=`${name} | hypothetical mission exposure: ${fmt(missionTotal)} mSv over ${fmt(duration)} days | average: ${fmt(missionTotal/duration)} mSv/day. ` +
      (prior===null?"No usable prior synthetic dose was recorded.":`Separate synthetic prior value: ${fmt(prior)} mSv; arithmetic sum: ${fmt(prior+missionTotal)} mSv.`);
    notice.textContent="Planning assumption: EVA hours are spread uniformly across the selected duration. Scenario inputs are not NASA measurements. Prior dose is synthetic; adding it does not establish organ dose, biological risk, or safety clearance. Different astronauts receive the same scenario dose when the exposure inputs are the same.";
    draw(points,prior!==null);
    table.replaceChildren();
    const head=mk("thead");const hr=mk("tr");for(const x of ["Day","Mission scenario (mSv)","With synthetic prior (mSv)"]){hr.append(mk("th",null,x));}head.append(hr);table.append(head);
    const body=mk("tbody");
    const ticks=[0,1/4,1/2,3/4,1].map(t=>points[Math.round(count*t)]);
    for(const p of ticks){const row=mk("tr");for(const value of [fmt(p.day),fmt(p.missionDose),p.withPrior===null?"Not recorded":fmt(p.withPrior)])row.append(mk("td",null,value));body.append(row);}table.append(body);
    last={schema:"vitals.medical.environment.dailyExposure.v2",classification:"synthetic_scenario_only",astronautId:selected||null,missionId:safeRead("vitals.mission.active.v1")?.id||null,durationDays:duration,totalEVAHours:hours,habitatRateMicroSvPerHour:habitat,evaRateMicroSvPerHour:eva,method:"uniform daily distribution of EVA hours; cumulative equivalent-dose arithmetic",priorSyntheticDoseMSv:prior,missionScenarioDoseMSv:missionTotal,records:points,medicalPrediction:false,liveDosimetry:false};
    exportBtn.disabled=false;
  }
  el("calculate").addEventListener("click",calc);
  for(const id of ["days","evaHours","habitatRate","evaRate","astronaut","destination","region"]){el(id)?.addEventListener("input",()=>clear("Inputs changed. Recalculate to update the projection."));}
  el("refresh")?.addEventListener("click",()=>clear("Data refreshed. Recalculate the hypothetical exposure."));
  exportBtn.addEventListener("click",()=>{
    if(!last)return;
    const blob=new Blob([JSON.stringify(last,null,2)],{type:"application/json"});const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download="vitals-daily-exposure-demo-v2.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
  });
  clear();
})();
