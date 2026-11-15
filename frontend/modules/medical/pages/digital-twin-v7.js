/* V.I.T.A.L.S. Digital Twin V7 - visual relocation only.
   Relocates the existing Review signals panel below Available evidence.
   Keeps the original #alerts node and all V1/V2 rendering logic unchanged. */
(()=>{
  'use strict';
  function moveReviewPanel(){
    const alerts=document.getElementById('alerts');
    const available=document.getElementById('coverage');
    const leftColumn=available?.closest('aside.side');
    const evidencePanel=available?.closest('section.panel');
    const reviewPanel=alerts?.closest('section.panel');
    if(!alerts || !available || !leftColumn || !evidencePanel || !reviewPanel) return;
    if(reviewPanel===evidencePanel || reviewPanel.parentElement===leftColumn) return;
    evidencePanel.insertAdjacentElement('afterend',reviewPanel);
    reviewPanel.classList.add('dtv7-review-left');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',moveReviewPanel,{once:true});
  else moveReviewPanel();
})();
