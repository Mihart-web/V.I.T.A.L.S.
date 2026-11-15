"use strict";
/* V.I.T.A.L.S. Europa destination. Does not run mission simulation. */
const DESTINATION_KEY = "vitals.mission.destination.v1";
const selectBtn = document.getElementById("selectDestination");
const feedback = document.getElementById("selectionStatus");
function showSaved() {
  try { if (localStorage.getItem(DESTINATION_KEY) === "europa") feedback.textContent = "EUROPA selected as mission destination (local demo). Mission not started."; }
  catch { feedback.textContent = "Local storage unavailable; destination not saved."; }
}
selectBtn.addEventListener("click", () => {
  try { localStorage.setItem(DESTINATION_KEY, "europa"); showSaved(); }
  catch { feedback.textContent = "Could not save destination in this browser."; }
});
showSaved();
