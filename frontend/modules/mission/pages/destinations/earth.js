"use strict";
document.getElementById('setEarth')?.addEventListener('click',()=>{try{localStorage.setItem('vitals.mission.destination.v1','earth');document.getElementById('status').textContent='EARTH selected for the mission. Region is chosen separately.';}catch(e){document.getElementById('status').textContent='Local storage unavailable; destination was not saved.';}});
