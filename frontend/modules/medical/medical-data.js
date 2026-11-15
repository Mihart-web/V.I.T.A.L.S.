"use strict";
(() => {
 const page=window.VITALS_MEDICAL_PAGE;
 const n=document.getElementById("astronautName"), info=document.getElementById("astronautInfo"), box=document.getElementById("medicalContents");
 const safeParse=key=>{try{return JSON.parse(localStorage.getItem(key)||"null")}catch{return null}};
 const profiles=safeParse("vitals.astronauts.v1");
 const id=localStorage.getItem("vitals.activeAstronautId.v1");
 const astronaut=Array.isArray(profiles)?profiles.find(p=>p && String(p.astronautId||p.id)===id):null;
 const txt=x=>typeof x==="string"||typeof x==="number"?String(x):"";
 function row(name,value){const div=document.createElement("div");div.className="datum";const label=document.createElement("small");label.textContent=name;const val=document.createElement("strong");val.textContent=txt(value)||"Not recorded";div.append(label,val);box.append(div)}
 if(!astronaut){n.textContent="NO CONFIRMED ASTRONAUT";info.textContent="Confirm an astronaut in SELECT ASTRONAUT. This page never substitutes another crew member's data.";return}
 n.textContent=txt(astronaut.fullName||astronaut.name);
 info.textContent=`ID: ${txt(astronaut.astronautId||astronaut.id)} | ${astronaut.isDefault||astronaut.protected?"PROTECTED SYNTHETIC DEMO":"CREATED PROFILE"}`;
 const metrics=astronaut.metrics&&typeof astronaut.metrics==="object"?astronaut.metrics:{};
 const medical=astronaut.medicalHistory||astronaut.clinicalHistory||astronaut.syntheticMedicalHistory||astronaut.medicalRecord;
 const conditions=astronaut.clinicalConditions||astronaut.conditions;
 const metricKeys={
  "medical-overview":["restingHeartRateBpm","oxygenSaturationPct","respiratoryRatePerMin","sleepDurationH","boneDensityTScoreSimulation","muscleMassKgSimulation"],
  "behavioral-health":["stressSelfReport10","moodSelfReport10","sleepDurationH","sleepEfficiencyPct","fatigueSelfReport10"],
  "digital-twin":["restingHeartRateBpm","boneDensityTScoreSimulation","muscleMassKgSimulation","gripStrengthKg","legStrengthBaselineN"],
  "life-saving-pack":[],
  "wearable-device":["restingHeartRateBpm","oxygenSaturationPct","respiratoryRatePerMin","skinTemperatureC"],
  "musculoskeletal-health":["boneDensityTScoreSimulation","muscleMassKgSimulation","gripStrengthKg","legStrengthBaselineN","balanceTestScorePct"],
  "environmental-radiation":["cumulativeRadiationDoseMSvSimulation","bodyTemperatureC","hydrationEstimatePct"]
 };
 if(page==="life-saving-pack"){
   row("STATUS","SIMULATION ONLY - NO DEVICE CONNECTION");
   row("MEDICATION / INFUSION CONTROL","NOT ENABLED");
   row("HUMAN CLINICAL APPROVAL","REQUIRED - NOT VERIFIED");
 } else {
   const keys=metricKeys[page]||[];
   for(const key of keys)if(Object.prototype.hasOwnProperty.call(metrics,key))row(key.replace(/([A-Z])/g," $1").trim(),metrics[key]);
 }
 if(page==="medical-overview"||page==="digital-twin"){
   if(medical && typeof medical==="object" && !Array.isArray(medical))row("Medical record","Synthetic record available; structured details to be implemented in the next step");
   if(Array.isArray(conditions)&&conditions.length)row("Recorded clinical categories",conditions.map(txt).join(", "));
 }
 if(page==="behavioral-health")row("Behavioral module","Detailed evaluation remains in Psychological & Neurological Module");
 if(!box.children.length){const p=document.createElement("p");p.className="empty";p.textContent="No matching observations recorded for this astronaut. No values have been invented.";box.append(p)}
})();
