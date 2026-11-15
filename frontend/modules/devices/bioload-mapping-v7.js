/* V.I.T.A.L.S. BioLoad V7 — interactive material-to-anatomy mapping. No GLB modification. */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('id')!=='bioload')return;
const $=id=>document.getElementById(id);
const KEY='vitals.devices.bioload.partMap.v7';
const FILE='bioload diviso.glb';
const PARTS=20;
const REGION=['Unassigned / unknown','Quadriceps — left','Quadriceps — right','Hamstrings — left','Hamstrings — right','Calves — left','Calves — right','Gluteals — left','Gluteals — right','Core / trunk','Shoulders — left','Shoulders — right','Upper Arms — left','Upper Arms — right','Forearms — left','Forearms — right','Head / helmet — no muscle reading','Hands / gloves — no muscle reading','Feet / boots — no muscle reading','Equipment / protective shell — no muscle reading','Other / non-anatomical'];
const BASE={'Quadriceps':'Quadriceps','Hamstrings':'Hamstrings','Calves':'Calves','Gluteals':'Gluteals','Core / trunk':'Core','Shoulders':'Shoulders','Upper Arms':'Upper Arms','Forearms':'Forearms'};
const safe=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&v.model===FILE&&v.entries&&typeof v.entries==='object'?v:{schema:'vitals.devices.bioload.partMap.v7',model:FILE,entries:{}}}catch{return {schema:'vitals.devices.bioload.partMap.v7',model:FILE,entries:{}}}};
function boot(){const holder=$('singleModel'),viewer=holder?.querySelector('model-viewer');if(!viewer||$('bl7-panel'))return;
const panel=document.createElement('section');panel.className='panel bl7-panel';panel.id='bl7-panel';
panel.innerHTML=`<p class="eyebrow">BIOLOAD / 20-PIECE 3D MAPPING</p><h2>Identify anatomical regions</h2><p class="note">Click a visible part of the suit above, or choose its ID below. Associate it with a body region, then save. Anatomical labels are assigned manually and are <strong>not automatically inferred</strong> from the 3D model.</p>
<div class="bl7-toolbar"><button id="bl7-on" type="button">IDENTIFY 3D PARTS</button><button id="bl7-off" class="secondary" type="button">EXIT IDENTIFY MODE</button><button id="bl7-restore" class="secondary" type="button">RESTORE MODEL COLORS</button><button id="bl7-export" class="secondary" type="button">EXPORT MAPPING JSON</button></div>
<div class="bl7-grid"><div><label for="bl7-part">SELECTED MODEL PART</label><select id="bl7-part"></select></div><div><label for="bl7-region">ANATOMICAL / EQUIPMENT REGION</label><select id="bl7-region"></select></div><div><label for="bl7-note">OPTIONAL DESCRIPTION</label><input id="bl7-note" maxlength="120" placeholder="e.g. left upper thigh armor"></div><button type="button" id="bl7-save">SAVE PART MAPPING</button></div>
<p id="bl7-feedback" class="bl7-feedback" role="status">Identify mode is OFF. The 3D model rotates normally.</p>
<div class="bl7-summary"><span id="bl7-count">0/20 assigned</span><span id="bl7-detail">No part selected</span></div><div class="bl7-list" id="bl7-list"></div>
<p class="note">Part identification uses the 3D viewer's material picking API. If multiple mesh parts share a material, click selection may be ambiguous; use the part menu and verify the highlight before saving. This mapping selects the region in the V6 monitor when available, but V6 observations still aggregate left/right rather than measuring each side independently.</p>`;
const before=$('bioloadV6')||$('deviceOperationsV4')||$('signalsHeading')?.closest('.panel');if(before)before.before(panel);else holder.closest('.panel')?.after(panel);
const select=$('bl7-part'),region=$('bl7-region'),note=$('bl7-note'),feedback=$('bl7-feedback');
select.innerHTML='<option value="">Select model part...</option>'+Array.from({length:PARTS},(_,i)=>`<option value="${i}">model_part${i}</option>`).join('');
region.innerHTML=REGION.map((r,i)=>`<option value="${i}">${safe(r)}</option>`).join('');
let active=false, selected=-1, originals=null, modelMat=[], materialNodes=new Map(), data=read(), lastDown=null;
function message(s){feedback.textContent=s}
function capture(){const mats=viewer.model?.materials||[];if(!mats.length)return false;const m=viewer.originalGltfJson; if(!m?.nodes||!m?.meshes)return false;
  materialNodes=new Map(); modelMat=new Array(PARTS).fill(null);
  m.nodes.forEach((node,i)=>{if(i>=PARTS||!Number.isInteger(node.mesh))return;const mesh=m.meshes[node.mesh];const p=(mesh?.primitives||[]);for(const primitive of p){const idx=primitive.material;if(!Number.isInteger(idx))continue;modelMat[i]??=idx;if(!materialNodes.has(idx))materialNodes.set(idx,[]);if(!materialNodes.get(idx).includes(i))materialNodes.get(idx).push(i);}});
  originals=mats.map(mat=>{const p=mat.pbrMetallicRoughness;return {color:[...p.baseColorFactor],metal:p.metallicFactor,rough:p.roughnessFactor,emissive:[...mat.emissiveFactor]}});
  return true;
}
function resetColors(){if(!originals)return;const mats=viewer.model?.materials||[];mats.forEach((m,i)=>{const orig=originals[i];if(!orig)return;try{m.pbrMetallicRoughness.setBaseColorFactor(orig.color);m.pbrMetallicRoughness.setMetallicFactor(orig.metal);m.pbrMetallicRoughness.setRoughnessFactor(orig.rough);m.setEmissiveFactor(orig.emissive)}catch(e){console.warn('BioLoad restore skipped',e)}})}
function highlight(){if(!originals||selected<0)return;resetColors();const mats=viewer.model?.materials||[];const matidx=modelMat[selected];if(matidx==null||!mats[matidx]){message('This node has no distinct material; it cannot be highlighted with this viewer.');return}
  mats.forEach((m,i)=>{if(i===matidx)return;const orig=originals[i];if(!orig)return;try{m.pbrMetallicRoughness.setBaseColorFactor([Math.max(.07,orig.color[0]*.38),Math.max(.09,orig.color[1]*.38),Math.max(.1,orig.color[2]*.38),orig.color[3]??1]);m.setEmissiveFactor([0,0,0])}catch{}});
  try{mats[matidx].pbrMetallicRoughness.setBaseColorFactor('#4ef8d1');mats[matidx].setEmissiveFactor([.07,.4,.28])}catch{}
}
function syncV6(label){const family=Object.keys(BASE).find(x=>label===x||label.startsWith(x+' —'));const v6=$('bl6-region');if(family&&v6&&[...v6.options].some(x=>x.value===BASE[family])){v6.value=BASE[family];v6.dispatchEvent(new Event('change',{bubbles:true}));message(`model_part${selected} mapped to ${label}. V6 region switched to ${BASE[family]}; its left/right values remain illustrative.`)}}
function choose(i){selected=i;select.value=String(i);const e=data.entries[String(i)]||{};region.value=String(Number.isInteger(e.regionIndex)?e.regionIndex:0);note.value=e.note||'';highlight();$('bl7-detail').textContent=`model_part${i} / ${REGION[Number(region.value)]}`;if(e.regionIndex!=null)syncV6(REGION[e.regionIndex]);}
function render(){const assigned=Object.values(data.entries).filter(e=>e&&Number.isInteger(e.regionIndex)&&e.regionIndex>0).length;$('bl7-count').textContent=`${assigned}/${PARTS} mapped`;const list=$('bl7-list');list.replaceChildren();for(let i=0;i<PARTS;i++){const row=document.createElement('button');row.type='button';row.className='bl7-item'+(i===selected?' bl7-active':'');const e=data.entries[String(i)];const label=e&&e.regionIndex>0?REGION[e.regionIndex]:'Not assigned';row.innerHTML=`<strong>model_part${i}</strong><span>${safe(label)}</span>`;row.addEventListener('click',()=>{if(!originals)capture();choose(i);render()});list.appendChild(row)}}
const onLoad=()=>{originals=null;if(capture()){if(selected>=0)highlight();message('3D material map ready. Click IDENTIFY 3D PARTS to enable selection.')}else message('3D model not ready; verify that bioload diviso.glb is loaded.')};viewer.addEventListener('load',onLoad);if(viewer.model?.materials?.length)onLoad();
$('bl7-on').addEventListener('click',()=>{if(!originals&&!capture()){message('3D model still loading.');return}active=true;viewer.autoRotate=false;const b=$('rotateToggle');if(b)b.textContent='RESUME ROTATION';message('Identify mode ON. Click a part of the 3D suit to identify it. Rotation is temporarily paused.')});
$('bl7-off').addEventListener('click',()=>{active=false;resetColors();message('Identify mode OFF. Camera controls remain available.')});
$('bl7-restore').addEventListener('click',()=>{resetColors();selected=-1;select.value='';$('bl7-detail').textContent='No part selected';render();message('Original V3 viewer colors restored for this session.')});
viewer.addEventListener('pointerdown',e=>{lastDown={x:e.clientX,y:e.clientY,time:Date.now()}});
viewer.addEventListener('pointerup',e=>{if(!active||!lastDown||Math.hypot(e.clientX-lastDown.x,e.clientY-lastDown.y)>7)return;lastDown=null;const hit=viewer.materialFromPoint?.(e.clientX,e.clientY);if(!hit){message('No suit surface hit. Click a visible part.');return}const ids=materialNodes.get(hit.index)||[];if(ids.length!==1){message(`Material ${hit.index} belongs to ${ids.length} mapped nodes: ${ids.map(i=>'model_part'+i).join(', ')||'none'}. Select a part manually.`);return}choose(ids[0]);render();message(`Selected model_part${ids[0]} (3D material ${hit.index}). Choose anatomy and press SAVE PART MAPPING.`)});
select.addEventListener('change',()=>{if(select.value===''){selected=-1;resetColors();render();return}choose(Number(select.value));render()});
region.addEventListener('change',()=>{if(selected>=0)$('bl7-detail').textContent=`model_part${selected} / ${REGION[Number(region.value)]}`});
$('bl7-save').addEventListener('click',()=>{if(selected<0){message('Select a model part first.');return}const id=Number(region.value);data.entries[String(selected)]={regionIndex:id,note:note.value.trim().slice(0,120),meshName:`model_part${selected}`,materialIndex:modelMat[selected],savedAt:new Date().toISOString()};data.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(data))}catch{message('Could not save mapping: browser storage unavailable.');return}render();syncV6(REGION[id]);message(`Saved model_part${selected} → ${REGION[id]}. Stored locally in this browser.`)});
$('bl7-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='VITALS_BioLoad_part_mapping_v7.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
// Update only the displayed filename; the V3 viewer loader is not changed.
const facts=$('deviceFacts');if(facts){const span=[...facts.querySelectorAll('span')].find(x=>x.textContent.trim()==='MODEL FILE');if(span&&span.parentElement){span.parentElement.replaceChildren(span,document.createTextNode(FILE))}}
render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
