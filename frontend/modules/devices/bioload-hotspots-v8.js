/* V.I.T.A.L.S. BioLoad V8 — 8 selectable, manually calibrated anatomical hotspots.
   No GLB modification; no medical measurements. */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('id')!=='bioload')return;
const $=id=>document.getElementById(id);
const REGIONS=[
  ['Quadriceps','Front thighs'],['Hamstrings','Back thighs'],['Calves','Lower legs'],
  ['Gluteals','Hip / gluteal region'],['Core','Abdomen / trunk'],
  ['Shoulders','Shoulder girdle'],['Upper Arms','Upper arms'],['Forearms','Forearms']
];
const KEY='vitals.devices.bioload.hotspots.v8.bioload-diviso';
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}}
let positions=read(),current='Quadriceps',placing=false,viewer,spot=null;
function status(s){const el=$('bl8-status');if(el)el.textContent=s}
function save(){try{localStorage.setItem(KEY,JSON.stringify(positions));return true}catch{status('Browser storage unavailable: point will not persist.');return false}}
function centerSpot(){if(spot){spot.remove();spot=null}const p=positions[current];if(!p||!viewer)return;
  spot=document.createElement('button');spot.type='button';spot.slot='hotspot-bl8-current';spot.className='bl8-hotspot';spot.title=current;spot.setAttribute('aria-label',current+' anatomy marker');spot.dataset.position=p.position;spot.dataset.normal=p.normal;
  spot.addEventListener('click',e=>{e.stopPropagation();status(current+' — marker placed on the 3D suit (illustrative).')});
  viewer.appendChild(spot);
}
function selected(){const r=REGIONS.find(x=>x[0]===current);const label=$('bl8-selected');if(label)label.textContent=current+' · '+(r?r[1]:'');
  document.querySelectorAll('#bl8-regions [data-region]').forEach(b=>{const chosen=b.dataset.region===current;b.classList.toggle('bl8-current',chosen);b.setAttribute('aria-pressed',String(chosen));b.classList.toggle('bl8-calibrated',!!positions[b.dataset.region])});
  $('bl8-count').textContent=REGIONS.filter(x=>positions[x[0]]).length+' / 8 markers placed';centerSpot();
}
function setRegion(region){current=region;placing=false;$('bl8-place').textContent='PLACE POINT ON SUIT';selected();
  const v6=$('bl6-region');if(v6&&[...v6.options].some(o=>o.value===region)){
    if(v6.value!==region){v6.value=region;v6.dispatchEvent(new Event('change',{bubbles:true}));}
  }
  status(positions[region]?region+' selected: turquoise marker visible on the suit.':'Select PLACE POINT ON SUIT, then click the matching anatomical location on the 3D model once.');
}
function init(){if($('bl8-compact'))return;viewer=$('singleModel')?.querySelector('model-viewer');if(!viewer)return;
 const box=document.createElement('div');box.id='bl8-compact';box.className='bl8-compact';
 box.innerHTML='<div class="bl8-head"><div><strong>BioLoad · 8 muscle regions</strong><p>Choose a region to inspect. Set its 3D light point once by clicking the suit; the point then follows the model during rotation.</p></div><span id="bl8-count">0 / 8 markers placed</span></div><div class="bl8-regions" id="bl8-regions"></div><div class="bl8-actions"><strong id="bl8-selected"></strong><button type="button" id="bl8-place">PLACE POINT ON SUIT</button><button type="button" id="bl8-remove" class="secondary">CLEAR POINT</button></div><p id="bl8-status" role="status" class="bl8-status"></p>';
 const panel=$('singleModel');panel.insertAdjacentElement('afterend',box);
 const controls=$('bl8-regions');REGIONS.forEach(([name])=>{const b=document.createElement('button');b.type='button';b.dataset.region=name;b.textContent=name;b.addEventListener('click',()=>setRegion(name));controls.appendChild(b)});
 $('bl8-place').addEventListener('click',()=>{placing=!placing;viewer.autoRotate=false;const toggle=$('rotateToggle');if(toggle)toggle.textContent='RESUME ROTATION';$('bl8-place').textContent=placing?'CANCEL POSITIONING':'PLACE POINT ON SUIT';status(placing?'Click the correct area on the 3D suit to position the '+current+' marker.':'Positioning cancelled.')});
 $('bl8-remove').addEventListener('click',()=>{if(positions[current]){delete positions[current];save();}placing=false;$('bl8-place').textContent='PLACE POINT ON SUIT';selected();status('Marker cleared for '+current+'.')});
 viewer.addEventListener('pointerup',e=>{
   if(!placing||e.target!==viewer)return;
   const rect=viewer.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;
   if(x<0||y<0||x>rect.width||y>rect.height)return;
   const hit=viewer.positionAndNormalFromPoint?.(x,y);
   if(!hit){status('No surface detected. Rotate the suit or click a solid part of it.');return;}
   const position=typeof hit.position?.toString==='function'?hit.position.toString():null;
   const normal=typeof hit.normal?.toString==='function'?hit.normal.toString():null;
   if(!position||!normal){status('Could not determine the 3D point.');return;}
   positions[current]={position,normal,model:'bioload diviso.glb',kind:'illustrative hotspot',updatedAt:new Date().toISOString()};
   placing=false;$('bl8-place').textContent='PLACE POINT ON SUIT';save();selected();
   status(current+' point saved on the 3D surface. Select another region, or rotate the model to inspect it.');
 });
 viewer.addEventListener('load',()=>{setTimeout(centerSpot,80)});
 const v6=$('bl6-region');if(v6){v6.addEventListener('change',()=>{const value=v6.value;if(REGIONS.some(r=>r[0]===value)&&current!==value){current=value;placing=false;$('bl8-place').textContent='PLACE POINT ON SUIT';selected();status(positions[value]?value+' point selected.':'Place the '+value+' point once on the 3D suit.')}})}
 selected();status('Choose one of the 8 groups. Mark its position on the 3D suit once to enable the turquoise light point.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
