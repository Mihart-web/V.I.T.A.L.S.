/* V.I.T.A.L.S. Alerts V3: first action placement and explanation of locked decisions. */
(() => {
  'use strict';
  const actionIds = new Set(['amAck','amReview','amResolve','amMedical']);
  const $ = id => document.getElementById(id);
  function moveTrigger() {
    const app=$('vitals-alert-app'), button=$('aeCreate');
    if(!app||!button) return;
    // Put the existing functional button before the page title and all panels.
    let top=$('vitals-alert-first-action-v3');
    if(!top){top=document.createElement('div');top.id='vitals-alert-first-action-v3';}
    const heading=app.querySelector('h2'); if(!heading) return; heading.insertAdjacentElement('afterend',top);
    top.appendChild(button);
    button.classList.add('vitals-trigger-v2');
    button.setAttribute('aria-label','Trigger simulated training alert');
  }
  function ensureDialog(){
    let veil=$('vitals-alert-lock-v3');
    if(veil)return veil;
    veil=document.createElement('div');veil.id='vitals-alert-lock-v3';veil.hidden=true;
    veil.setAttribute('role','dialog');veil.setAttribute('aria-modal','true');veil.setAttribute('aria-labelledby','vitals-lock-title-v3');
    veil.innerHTML='<div class="vitals-lock-dialog-v3"><button id="vitals-lock-close-v3" type="button" aria-label="Close explanation">✕</button><div class="vitals-lock-kicker-v3">V.I.T.A.L.S. / PERMISSION CHECK</div><h2 id="vitals-lock-title-v3">Action unavailable</h2><p id="vitals-lock-message-v3"></p><div class="vitals-lock-status-v3" id="vitals-lock-status-v3"></div><p class="vitals-lock-footer-v3">Training software only. Browser roles do not verify professional medical qualifications.</p><button id="vitals-lock-ok-v3" type="button">UNDERSTOOD</button></div>';
    document.body.appendChild(veil);
    const close=()=>{veil.hidden=true;};
    $('vitals-lock-close-v3').addEventListener('click',close);
    $('vitals-lock-ok-v3').addEventListener('click',close);
    veil.addEventListener('click',e=>{if(e.target===veil)close();});
    return veil;
  }
  const titles={amAck:'Acknowledge alert',amReview:'Set under review',amResolve:'Resolve training case',amMedical:'Explore simulated medical procedure'};
  function explain(id){
    const veil=ensureDialog();
    $('vitals-lock-title-v3').textContent=titles[id]+' — unavailable';
    const status=$('amStatus')?.textContent||'';
    const closed=/RESOLVED/i.test(status);
    const isMedical=id==='amMedical';
    let message='';
    if(closed){message='This training case is already RESOLVED. Reopening or changing a resolved record is not enabled in this version.';}
    else if(isMedical){message='To explore this training-only procedure, select and confirm an astronaut in Choose Your Role, choose Crew Medical Officer or Flight Surgeon, and ensure that the same astronaut has a matching mission role and is the unique assigned console operator in Crew Assignment. The alert must be associated with an individual astronaut, not the habitat.';}
    else if(id==='amAck' && /ACKNOWLEDGED|UNDER REVIEW/i.test(status)){message='Acknowledgement is available only for an ACTIVE alert. This alert has already moved to a later state.';}
    else {message='Console actions require a confirmed astronaut identity and role in Choose Your Role. That astronaut must belong to the active mission crew, their selected role must match Crew Assignment, and they must be the unique assigned console operator. Return to Crew Assignment / Choose Your Role to check these requirements.';}
    $('vitals-lock-message-v3').textContent=message;
    $('vitals-lock-status-v3').textContent=($('aeAuthority')?.textContent||'Role status unavailable.')+' '+($('aeMedAccess')?.textContent||'');
    veil.hidden=false;
    $('vitals-lock-ok-v3').focus();
  }
  const ourRemovals=new WeakSet();
  function syncButton(b){
    if(!b || !actionIds.has(b.id))return;
    // The V1 engine computes permissions and writes disabled=... on each modal opening.
    // Preserve that decision while permitting a click to show the missing requirements.
    if(b.disabled){
      ourRemovals.add(b);
      b.disabled=false;
      b.dataset.vitalsExplanationLocked='true';
      b.setAttribute('aria-disabled','true');
      b.setAttribute('title','Click to see why this action is unavailable');
      b.classList.add('vitals-explain-lock-v3');
    } else if(b.dataset.vitalsExplanationLocked!=='true'){
      b.removeAttribute('aria-disabled');
      b.classList.remove('vitals-explain-lock-v3');
      b.removeAttribute('title');
    }
  }
  function setUp(){
    moveTrigger();ensureDialog();
    const actionButtons=Array.from(actionIds).map($).filter(Boolean);
    // A capture-phase guard prevents original handler from running for locked actions.
    document.addEventListener('click',e=>{
      const target=e.target.closest?.('button');
      if(target?.dataset.vitalsExplanationLocked!=='true')return;
      e.preventDefault();e.stopImmediatePropagation();explain(target.id);
    },true);
    const observer=new MutationObserver(records=>{
      for(const record of records){
        if(record.attributeName!=='disabled')continue;
        const b=record.target;
        if(b.disabled){syncButton(b);}
        else if(b.dataset.vitalsExplanationLocked==='true'){
          if(ourRemovals.has(b)){ourRemovals.delete(b);}else{
            delete b.dataset.vitalsExplanationLocked;
            b.removeAttribute('aria-disabled');b.classList.remove('vitals-explain-lock-v3');b.removeAttribute('title');
          }
        }
      }
    });
    for(const b of actionButtons)observer.observe(b,{attributes:true,attributeFilter:['disabled']});
    // Track modal openings. The V1 showModal always assigns disabled on each action.
    const modal=$('vitals-alert-modal');
    if(modal){
      const modObserver=new MutationObserver(()=>{
        if(modal.hidden)return;
        for(const b of actionButtons){
          if(b.disabled){syncButton(b);}
        }
      });
      modObserver.observe(modal,{attributes:true,attributeFilter:['hidden']});
    }
    for(const b of actionButtons){if(b.disabled){syncButton(b);}}
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('vitals-alert-lock-v3').hidden){$('vitals-alert-lock-v3').hidden=true;e.stopImmediatePropagation();}},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setUp,{once:true});else setUp();
})();
