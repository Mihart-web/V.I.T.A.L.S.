"use strict";
// V.I.T.A.L.S. SELECT ASTRONAUT — local demo roster and active profile selector.
(()=>{
  const KEY="vitals.astronauts.v1",ACTIVE="vitals.activeAstronautId.v1";
  const $=id=>document.getElementById(id);
  let profiles=[],chosen="";
  const stored=key=>{try{return localStorage.getItem(key)}catch{return null}};
  const value=x=>typeof x==="string"||typeof x==="number"?String(x).trim():"";
  const portrait=p=>{
    let filename=value(p.avatarFile||p.avatar||p.image);
    const index=Number(p.avatarIndex);
    if(!/^av(?:[1-9]|1[0-9]|2[0-8])\.(?:png|webp)$/i.test(filename)){
      if(Number.isInteger(index)&&index>=1&&index<=28)filename=`av${index}${[1,20,28].includes(index)?".png":".webp"}`;
    }
    // Accept only known portrait filenames, never user-supplied URLs.
    return /^av(?:[1-9]|1[0-9]|2[0-8])\.(?:png|webp)$/i.test(filename)
      ?`../../../assets/astronaut-profile/portraits/${filename}`:"";
  };
  const load=()=>{
    let data;
    try{data=JSON.parse(stored(KEY)||"[]")}catch{data=[]}
    profiles=Array.isArray(data)?data.filter(x=>x&&typeof x==="object").map(x=>({
      id:value(x.astronautId||x.id),name:value(x.fullName||x.name),age:value(x.age),
      nationality:value(x.nationality),isDefault:!!x.isDefault||!!x.protected,
      portrait:portrait(x)
    })).filter(x=>x.id&&x.name):[];
    const seen=new Set();profiles=profiles.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true});
    profiles.sort((a,b)=>Number(b.isDefault)-Number(a.isDefault)||a.name.localeCompare(b.name));
    if(!profiles.some(x=>x.id===chosen))chosen=stored(ACTIVE)||"";
    render();
  };
  function render(){
    const query=$("search").value.trim().toLowerCase(),wrap=$("profiles");wrap.replaceChildren();
    $("count").textContent=`${profiles.length} profile${profiles.length===1?"":"s"}`;
    const visible=profiles.filter(p=>p.name.toLowerCase().includes(query)||p.id.toLowerCase().includes(query));
    for(const p of visible){
      const b=document.createElement("button");b.type="button";b.className=`profile ${chosen===p.id?"selected":""}`;
      b.setAttribute("role","radio");b.setAttribute("aria-checked",String(chosen===p.id));
      if(p.portrait){const img=document.createElement("img");img.src=p.portrait;img.alt=`Portrait avatar for ${p.name}`;img.loading="lazy";b.append(img)}
      else{const blank=document.createElement("span");blank.textContent="◈";b.append(blank)}
      const info=document.createElement("div");
      const name=document.createElement("strong");name.textContent=p.name;info.append(name);
      const id=document.createElement("span");id.className="id";id.textContent=`ID: ${p.id}`;info.append(id);
      const extra=document.createElement("span");extra.className="extra";extra.textContent=[p.age&&`Age: ${p.age}`,p.nationality].filter(Boolean).join(" · ");info.append(extra);
      const flag=document.createElement("span");flag.className="flag";flag.textContent=p.isDefault?"PROTECTED DEFAULT · DEMO":"CREATED PROFILE";info.append(flag);
      const mark=document.createElement("span");mark.className="checked";mark.textContent=chosen===p.id?"● SELECTED":"○ SELECT";info.append(mark);
      b.append(info);b.addEventListener("click",()=>{chosen=p.id;render()});wrap.append(b);
    }
    if(!visible.length){const empty=document.createElement("p");empty.className="empty";empty.textContent=profiles.length?"No matching astronauts.":"No profiles saved yet. Use CREATE NEW ASTRONAUT.";wrap.append(empty)}
    const selected=profiles.find(x=>x.id===chosen);
    $("selectionText").textContent=selected?`${selected.name} · ${selected.id}`:"NO ASTRONAUT SELECTED";
    $("confirm").disabled=!selected;
    $("feedback").textContent=selected?"Confirm to set this astronaut as active throughout the local demo.":"Select a profile to continue.";
  }
  $("search").addEventListener("input",render);
  $("refresh").addEventListener("click",load);


  $("confirm").addEventListener("click",()=>{
    if(!profiles.some(x=>x.id===chosen))return;
    try{localStorage.setItem(ACTIVE,chosen)}catch{$("feedback").textContent="Cannot save selection. Browser storage unavailable.";return}
    location.assign("../../dashboard.html");
  });
  window.addEventListener("storage",e=>{if(e.key===KEY||e.key===ACTIVE)load()});
  load();
})();