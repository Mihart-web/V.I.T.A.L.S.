"use strict";
(() => {
  const byId = id => document.getElementById(id);
  const key = "vitals.mission.destination.v1";
  const back = byId("backTo");
  back?.addEventListener("change", () => { if (back.value) location.assign(back.value); });
  const state = byId("selectionState");
  const refresh = () => {
    try {
      state.textContent = localStorage.getItem(key) === "moon" ? "MOON SELECTED FOR MISSION · MISSION NOT STARTED" : "Destination not confirmed";
    } catch { state.textContent = "Local mission destination storage unavailable"; }
  };
  byId("setDestination")?.addEventListener("click", () => {
    try { localStorage.setItem(key, "moon"); refresh(); }
    catch { state.textContent = "Unable to save destination locally"; }
  });
  byId("exportData")?.addEventListener("click", async () => {
    try {
      const response = await fetch("./moon-reference.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Reference data HTTP ${response.status}`);
      const data = await response.json();
      if (data.id !== "vitals.destination.moon.v1") throw new Error("Unexpected data schema");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "VITALS_moon_environment_reference_v1.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { alert(`Moon reference export failed: ${err.message}`); }
  });
  refresh();
})();
