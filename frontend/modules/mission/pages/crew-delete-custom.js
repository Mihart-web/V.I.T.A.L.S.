"use strict";
// V.I.T.A.L.S. - optional removal of user-created astronaut profiles.
// Deliberately separate from crew-assignment.js and the protected default seeder.
(() => {
  const container = document.getElementById("availableList");
  if (!container) return;

  const STORE = "vitals.astronauts.v1";
  const RESERVED = /^VITALS-DEF-00[1-5]$/i;
  const asID = value => String(value ?? "").trim();
  const profileID = profile => asID(profile?.astronautId ?? profile?.id);
  const protectedProfile = profile => RESERVED.test(profileID(profile)) ||
    profile?.protected === true || profile?.isDefault === true || profile?.deletable === false;

  function inAnySavedCrew(id) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !(key === "vitals.mission.crew.v1" || key.startsWith("vitals.mission.crew.v1."))) continue;
      let data;
      try { data = JSON.parse(localStorage.getItem(key)); }
      catch { throw new Error(`Saved crew data is unreadable (${key}). No deletion performed.`); }
      if ((data?.members ?? []).some(m => asID(m?.astronautId) === id)) return true;
    }
    return false;
  }

  function removeCustomProfile(id) {
    if (!id || RESERVED.test(id)) return;
    let saved;
    try {
      const raw = localStorage.getItem(STORE);
      saved = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(saved)) throw new Error("Profile archive has an unexpected format.");
      const matches = saved.filter(p => profileID(p) === id);
      if (matches.length !== 1) throw new Error("Exactly one matching custom profile must exist in the archive.");
      if (protectedProfile(matches[0])) throw new Error("This is a protected profile.");
      if (inAnySavedCrew(id)) throw new Error("Remove this astronaut from the saved crew first, then save the crew.");
      const displayName = String(matches[0].fullName || matches[0].name || id);
      if (!window.confirm(`DELETE ASTRONAUT?\n\n${displayName} (${id})\n\nThis removes the locally saved profile, not its game results. Continue?`)) return;
      // Save a browser-local recovery copy before deletion.
      const backupKey = `vitals.astronauts.backup.${new Date().toISOString()}`;
      localStorage.setItem(backupKey, JSON.stringify(saved));
      localStorage.setItem(STORE, JSON.stringify(saved.filter(p => profileID(p) !== id)));
      if (localStorage.getItem("vitals.activeAstronautId.v1") === id) {
        localStorage.removeItem("vitals.activeAstronautId.v1");
      }
      document.getElementById("reloadProfiles")?.click();
      const feedback = document.getElementById("feedback");
      if (feedback) feedback.textContent = `${displayName} removed from locally saved custom profiles. Browser backup: ${backupKey}`;
    } catch (error) {
      window.alert(`Profile not deleted: ${error.message}`);
    }
  }

  function attachDeleteButtons() {
    for (const card of container.querySelectorAll(".astronaut-card")) {
      if (card.querySelector(".vitals-delete-custom")) continue;
      const metadata = card.querySelector(".metadata")?.textContent ?? "";
      const match = metadata.match(/\bID:\s*(.*?)(?:\s*\/\s*Age:|$)/i);
      if (!match) continue;
      const id = asID(match[1]);
      if (!id || RESERVED.test(id)) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn small vitals-delete-custom";
      button.textContent = "DELETE ASTRONAUT";
      button.style.marginLeft = "8px";
      button.style.borderColor = "#e88c70";
      button.style.color = "#ffd6c9";
      button.addEventListener("click", () => removeCustomProfile(id));
      card.querySelector(".person")?.appendChild(button);
    }
  }

  attachDeleteButtons();
  const observer = new MutationObserver(attachDeleteButtons);
  observer.observe(container, {childList:true, subtree:true});
})();
