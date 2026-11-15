/* V.I.T.A.L.S. / Alerts visual V2: presentation only, no data edits. */
(() => {
  'use strict';
  function placeTrigger() {
    const app = document.getElementById('vitals-alert-app');
    const trigger = document.getElementById('aeCreate');
    if (!app || !trigger) return;
    const section = trigger.closest('section.panel');
    const heading = section && section.querySelector('h3');
    if (!heading) return;
    section.classList.add('vitals-trigger-section');
    trigger.classList.add('vitals-trigger-v2');
    trigger.setAttribute('aria-label', 'Trigger a simulated training alert');
    let row = document.getElementById('vitals-trigger-head-v2');
    if (!row) {
      row = document.createElement('div');
      row.id = 'vitals-trigger-head-v2';
      row.className = 'vitals-trigger-head-v2';
      heading.parentNode.insertBefore(row, heading);
      row.appendChild(heading);
    }
    row.appendChild(trigger);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', placeTrigger, { once:true });
  else placeTrigger();
})();
