/* V.I.T.A.L.S. Digital Twin V3 - place integrated status bars inside the anatomical model box. */
(()=>{'use strict';
function moveBars(){
  const bars=document.getElementById('dtv2Bars');
  const stage=document.querySelector('.stageframe');
  if(!bars||!stage)return;
  if(bars.parentElement!==stage)stage.appendChild(bars);
  const count=bars.querySelectorAll('.dtv2-bar').length;
  bars.classList.toggle('dtv3-empty',count===0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',moveBars,{once:true});
else moveBars();
const obs=new MutationObserver(moveBars);
window.addEventListener('load',()=>{moveBars(); const bars=document.getElementById('dtv2Bars'); if(bars)obs.observe(bars,{childList:true,subtree:true});});
window.addEventListener('storage',moveBars);
setInterval(moveBars,1200);
})();
