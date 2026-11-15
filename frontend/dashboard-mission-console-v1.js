/* V.I.T.A.L.S. Dashboard launcher; scoped to ACCESS MISSION CONSOLE control only. */
(()=>{'use strict';
 const target='./modules/mission/pages/mission-console.html';
 document.addEventListener('click',e=>{
  const el=e.target.closest?.('a,button');if(!el)return;
  const text=String(el.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
  if(!text.includes('ACCESS MISSION CONSOLE'))return;
  e.preventDefault();e.stopImmediatePropagation();
  window.location.assign(target);
 },true);
})();
