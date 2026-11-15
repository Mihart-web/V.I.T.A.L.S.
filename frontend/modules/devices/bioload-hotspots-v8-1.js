/* V.I.T.A.L.S. BioLoad V8.1 — eight automatically positioned anatomical reference lights.
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
let positions=read(),current='Quadriceps',placing=false,viewer,spot=null,ready=false;
function modelDefault(region){
  if(!ready||!viewer)return null;
  let d,c;
  try{d=viewer.getDimensions();c=viewer.getBoundingBoxCenter();}catch{return null}
  if(!d||!c||!Number.isFinite(d.y)||d.y<=0)return null;
  // Relative to actual model dimensions. These are visual reference points,
  // not automated mesh-to-muscle identification or measured sensor locations.
  // Coordinates are adjustable through the existing click-on-suit control.
  const anchors={
    'Quadriceps':[-.13,-.19,.24],
    'Hamstrings':[.13,-.20,-.24],
    'Calves':[-.12,-.37,.18],
    'Gluteals':[.11,-.09,-.25],
    'Core':[0,.095,.30],
    'Shoulders':[-.23,.275,.10],
    'Upper Arms':[.26,.15,.12],
    'Forearms':[.28,-.005,.13]
  };
  const a=anchors[region];if(!a)return null;
  const x=c.x+a[0]*d.x,y=c.y+a[1]*d.y,z=c.z+a[2]*d.z;
  return {position:[x,y,z].map(n=>n.toFixed(5)+'m').join(' '),normal:(a[2]<0?'0 0 -1':'0 0 1'),automatic:true};
}

function status(s){const el=$('bl8-status');if(el)el.textContent=s}
function save(){try{localStorage.setItem(KEY,JSON.stringify(positions));return true}catch{status('Browser storage unavailable: point will not persist.');return false}}
function centerSpot(){if(spot){spot.remove();spot=null}const p=positions[current]||modelDefault(current);if(!p||!viewer)return;
  spot=document.createElement('button');spot.type='button';spot.slot='hotspot-bl8-current';spot.className='bl8-hotspot';spot.title=current+(p.automatic?' — approximate automatic marker':' — manually adjusted marker');spot.setAttribute('aria-label',current+' anatomy marker');spot.dataset.position=p.position;spot.dataset.normal=p.normal;
  spot.addEventListener('click',e=>{e.stopPropagation();status(current+' — marker placed on the 3D suit (illustrative).')});
  viewer.appendChild(spot);
}
function selected(){const r=REGIONS.find(x=>x[0]===current);const label=$('bl8-selected');if(label)label.textContent=current+' · '+(r?r[1]:'');
  document.querySelectorAll('#bl8-regions [data-region]').forEach(b=>{const chosen=b.dataset.region===current;b.classList.toggle('bl8-current',chosen);b.setAttribute('aria-pressed',String(chosen));b.classList.toggle('bl8-calibrated',!!positions[b.dataset.region])});
  $('bl8-count').textContent='8 regions ready · '+REGIONS.filter(x=>positions[x[0]]).length+' adjusted';centerSpot();
}
function setRegion(region){current=region;placing=false;$('bl8-place').textContent='ADJUST POINT';selected();
  const v6=$('bl6-region');if(v6&&[...v6.options].some(o=>o.value===region)){
    if(v6.value!==region){v6.value=region;v6.dispatchEvent(new Event('change',{bubbles:true}));}
  }
  status(positions[region]?region+' selected: manually adjusted reference light.':region+' selected: automatic turquoise reference light. Use ADJUST POINT only if necessary.');
}
function init(){if($('bl8-compact'))return;viewer=$('singleModel')?.querySelector('model-viewer');if(!viewer)return;
 const box=document.createElement('div');box.id='bl8-compact';box.className='bl8-compact';
 box.innerHTML='<div class="bl8-head"><div><strong>BioLoad · 8 muscle regions</strong><p>Choose one of eight muscle regions: its turquoise reference light appears automatically on the rotating 3D suit. Adjust its position only if needed.</p></div><span id="bl8-count">8 regions ready</span></div><div class="bl8-regions" id="bl8-regions"></div><div class="bl8-actions"><strong id="bl8-selected"></strong><button type="button" id="bl8-place">ADJUST POINT</button><button type="button" id="bl8-remove" class="secondary">RESET POINT</button></div><p id="bl8-status" role="status" class="bl8-status"></p>';
 const panel=$('singleModel');panel.insertAdjacentElement('afterend',box);
 const controls=$('bl8-regions');REGIONS.forEach(([name])=>{const b=document.createElement('button');b.type='button';b.dataset.region=name;b.textContent=name;b.addEventListener('click',()=>setRegion(name));controls.appendChild(b)});
 $('bl8-place').addEventListener('click',()=>{placing=!placing;viewer.autoRotate=false;const toggle=$('rotateToggle');if(toggle)toggle.textContent='RESUME ROTATION';$('bl8-place').textContent=placing?'CANCEL POSITIONING':'ADJUST POINT';status(placing?'Click the correct area on the 3D suit to position the '+current+' marker.':'Positioning cancelled.')});
 $('bl8-remove').addEventListener('click',()=>{if(positions[current]){delete positions[current];save();}placing=false;$('bl8-place').textContent='ADJUST POINT';selected();status('Automatic reference position restored for '+current+'.')});
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
   placing=false;$('bl8-place').textContent='ADJUST POINT';save();selected();
   status(current+' point saved on the 3D surface. Select another region, or rotate the model to inspect it.');
 });
 viewer.addEventListener('load',()=>{ready=true;setTimeout(()=>{selected();status(current+' automatic 3D reference marker ready.');},120)});if(viewer.model?.materials?.length){ready=true;setTimeout(selected,180)}
 const v6=$('bl6-region');if(v6){v6.addEventListener('change',()=>{const value=v6.value;if(REGIONS.some(r=>r[0]===value)&&current!==value){current=value;placing=false;$('bl8-place').textContent='ADJUST POINT';selected();status(positions[value]?value+' adjusted marker selected.':value+' automatic turquoise light selected.')}})}
 selected();status('Select a muscle region to show its automatic turquoise light on the suit. Reference positions are approximate and can be adjusted.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
