"use strict";

// V.I.T.A.L.S. Dashboard V1
// Navigation is enabled only for implemented pages.

const message = document.getElementById("dashboardMessage");
const identityStatus = document.getElementById("identityStatus");

document.getElementById("createAstronaut")
  .addEventListener("click", () => {
    window.location.href = "./modules/astronaut-profile/astronaut-create.html";
  });

document.getElementById("selectAstronaut")
  .addEventListener("click", () => {
    window.location.assign(
      "./modules/astronaut-profile/select-astronaut.html"
    );
  });
document.getElementById("chooseRole")
  .addEventListener("click", () => {
    window.location.assign(
      "./modules/choose-role/choose-role.html"
    );
  });
document.getElementById("accessConsole")
  .addEventListener("click", () => {
    message.textContent =
      "MISSION CONSOLE ACCESS REQUIRES ASTRONAUT AND ROLE";
  });

const moduleNames = {
  mission: "MISSION MODULE",
  crew: "CREW ON BOARD",
  medical: "MEDICAL MODULE",
  psychological: "PSYCHOLOGICAL & NEUROLOGICAL",
  devices: "DEVICES",
  environment: "ENVIRONMENT",
  alerts: "ALERTS"
};

document.querySelectorAll(".hex-button")
  .forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.module;
      const name = moduleNames[key] || "UNKNOWN MODULE";

      if (key === "environment") {
        window.location.href = "./modules/environment/environment.html";
        return;
      }

      if (key === "alerts") {
        window.location.href = "./modules/alerts/alerts.html";
        return;
      }

      if (key === "mission") {
        window.location.href = "./modules/mission/mission.html";
        return;
      }

      if (key === "medical") {
        window.location.href = "./modules/medical/medical.html";
        return;
      }

      if (key === "devices") {
        window.location.href = "./modules/devices/devices.html";
        return;
      }

      if (key === "psychological") {
        window.location.href = "./modules/psychological-neurological/psychological-health.html";
        return;
      }

      message.textContent =
        `${name} - MODULE UNDER DEVELOPMENT`;
    });
  });

// Communication status cannot yet be determined.
// Do not display a false ONLINE state.
document.getElementById("connectionStatus").textContent =
  "CONNECTION NOT CHECKED";



