"use strict";
// A click explicitly chooses a destination for other V.I.T.A.L.S. mission modules.
const DESTINATION_KEY = "vitals.mission.destination.v1";
const destinationLabels = {
  earth: "EARTH â€” REMOTE REGIONS", moon: "MOON", mars: "MARS",
  europa: "EUROPA", titan: "TITAN"
};
const destinationStatus = document.getElementById("destinationStatus");
try {
  const previous = localStorage.getItem(DESTINATION_KEY);
  if (previous && Object.hasOwn(destinationLabels, previous)) {
    destinationStatus.textContent = `Selected: ${destinationLabels[previous]}. Mission not started.`;
  }
} catch (_) { /* Local storage may be disabled. */ }
document.querySelectorAll("a[data-destination]").forEach(link => {
  link.addEventListener("click", () => {
    try { localStorage.setItem(DESTINATION_KEY, link.dataset.destination); }
    catch (_) { /* Navigation still works. */ }
  });
});

