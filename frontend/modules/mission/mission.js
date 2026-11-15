"use strict";
const selector = document.getElementById("destination");
const status = document.getElementById("destinationStatus");
const storageKey = "vitals.mission.destination.v1";
const labels = {
  "earth-remote": "EARTH — REMOTE REGIONS",
  moon: "MOON",
  mars: "MARS",
  europa: "EUROPA",
  titan: "TITAN"
};
try {
  const previous = localStorage.getItem(storageKey);
  if (previous && Object.hasOwn(labels, previous)) selector.value = previous;
} catch (_) { /* Local storage may be unavailable. */ }
function refreshDestination() {
  const selection = selector.value;
  status.textContent = selection
    ? `Selected: ${labels[selection]}. Mission not started.`
    : "No destination selected. Mission not started.";
  try {
    if (selection) localStorage.setItem(storageKey, selection);
    else localStorage.removeItem(storageKey);
  } catch (_) { /* Selection still works for this page load. */ }
}
selector.addEventListener("change", refreshDestination);
refreshDestination();
