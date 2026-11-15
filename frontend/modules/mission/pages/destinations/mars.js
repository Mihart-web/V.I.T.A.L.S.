"use strict";
(() => {
  const byId = id => document.getElementById(id);
  const key = "vitals.mission.destination.v1";
  const back = byId("backTo");
  back?.addEventListener("change", () => {
    if (back.value) location.assign(back.value);
  });
  const state = byId("selectionState");
  const refresh = () => {
    try {
      state.textContent = localStorage.getItem(key) === "mars" ? "MARS SELECTED FOR MISSION · MISSION NOT STARTED" : "Destination not confirmed";
    } catch { state.textContent = "Local mission destination storage unavailable"; }
  };
  byId("setDestination")?.addEventListener("click", () => {
    try {
      localStorage.setItem(key, "mars");
      refresh();
    } catch { state.textContent = "Unable to save destination locally"; }
  });
  byId("exportData")?.addEventListener("click", async () => {
    try {
      const response = await fetch("./mars-reference.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Reference data HTTP ${response.status}`);
      const data = await response.json();
      if (data.id !== "vitals.destination.mars.v1") throw new Error("Unexpected data schema");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "VITALS_mars_environment_reference_v1.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { alert(`Mars reference export failed: ${err.message}`); }
  });
  refresh();
})();
