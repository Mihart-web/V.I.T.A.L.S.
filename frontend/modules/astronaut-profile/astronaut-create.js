"use strict";

// V.I.T.A.L.S. - ASTRONAUT PROFILE V1
// Frontend demonstration. No clinical data is uploaded or saved.

const avatarFiles = [
  "av1.png",
  ...Array.from({length: 18}, (_, i) => `av${i + 2}.webp`),
  "av20.png",
  ...Array.from({length: 7}, (_, i) => `av${i + 21}.webp`),
  "av28.png"
];

const avatarBase = "../../../assets/astronaut-profile/portraits/";
let currentAvatar = 0;
let confirmedAvatar = null;

const avatarImage = document.getElementById("avatarImage");
const avatarCounter = document.getElementById("avatarCounter");
const avatarStatus = document.getElementById("avatarStatus");
const form = document.getElementById("astronautForm");
const saveStatus = document.getElementById("saveStatus");

function showAvatar() {
  avatarImage.src = avatarBase + avatarFiles[currentAvatar];
  avatarImage.alt = `Astronaut avatar ${currentAvatar + 1}`;
  avatarCounter.textContent =
    `${String(currentAvatar + 1).padStart(2, "0")} / 28`;

  if (confirmedAvatar !== avatarFiles[currentAvatar]) {
    avatarStatus.textContent = "Select an astronaut avatar";
  }
}

document.getElementById("previousAvatar")
  .addEventListener("click", () => {
    currentAvatar =
      (currentAvatar - 1 + avatarFiles.length) % avatarFiles.length;
    showAvatar();
  });

document.getElementById("nextAvatar")
  .addEventListener("click", () => {
    currentAvatar = (currentAvatar + 1) % avatarFiles.length;
    showAvatar();
  });

document.getElementById("confirmAvatar")
  .addEventListener("click", () => {
    confirmedAvatar = avatarFiles[currentAvatar];
    avatarStatus.textContent =
      `AVATAR ${currentAvatar + 1} CONFIRMED`;
  });

avatarImage.addEventListener("error", () => {
  avatarStatus.textContent = "AVATAR IMAGE NOT FOUND";
});

showAvatar();

// Physiological baseline fields.
// No default clinical thresholds are assumed.

const baselineDefinitions = [
  ["heartRate", "Heart Rate", "bpm"],
  ["systolicBP", "Systolic Blood Pressure", "mmHg"],
  ["diastolicBP", "Diastolic Blood Pressure", "mmHg"],
  ["spo2", "Oxygen Saturation", "%"],
  ["glucose", "Blood Glucose", "mg/dL"],
  ["skinTemperature", "Skin Temperature", "°C"],
  ["respiratoryRate", "Respiratory Rate", "breaths/min"]
];

const baselineContainer = document.getElementById("baselineFields");

for (const [key, label, unit] of baselineDefinitions) {
  const wrapper = document.createElement("div");
  wrapper.className = "baseline-item";

  const heading = document.createElement("p");
  heading.textContent = `${label} (${unit})`;

  const minimumLabel = document.createElement("label");
  minimumLabel.textContent = "Minimum";

  const minimum = document.createElement("input");
  minimum.type = "number";
  minimum.step = "any";
  minimum.name = `${key}Min`;
  minimum.placeholder = "Min";
  minimumLabel.appendChild(minimum);

  const maximumLabel = document.createElement("label");
  maximumLabel.textContent = "Maximum";

  const maximum = document.createElement("input");
  maximum.type = "number";
  maximum.step = "any";
  maximum.name = `${key}Max`;
  maximum.placeholder = "Max";
  maximumLabel.appendChild(maximum);

  wrapper.append(heading, minimumLabel, maximumLabel);
  baselineContainer.appendChild(wrapper);
}

// Clinical condition selection.
// Labels are categories, not diagnoses.

const clinicalConditions = [
  "Cardiovascular condition",
  "Respiratory condition",
  "Metabolic condition",
  "Musculoskeletal condition",
  "Neurological condition",
  "Allergies",
  "Other condition"
];

const conditionsContainer =
  document.getElementById("clinicalConditions");

for (const condition of clinicalConditions) {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.name = "clinicalConditions";
  checkbox.value = condition;
  checkbox.style.width = "auto";
  checkbox.style.minHeight = "auto";

  label.style.flexDirection = "row";
  label.style.alignItems = "center";
  label.style.marginBottom = "12px";

  label.append(checkbox, document.createTextNode(condition));
  conditionsContainer.appendChild(label);
}

// Medical document selection.
// File contents are not read, uploaded or stored.

const medicalFile = document.getElementById("medicalHistory");
const medicalStatus = document.getElementById("medicalFileStatus");

medicalFile.addEventListener("change", () => {
  const file = medicalFile.files?.[0];

  medicalStatus.textContent = file
    ? `SELECTED: ${file.name} (NOT UPLOADED)`
    : "No document selected";
});

// Form validation - saving requires a future backend.

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    saveStatus.textContent = "COMPLETE REQUIRED FIELDS";
    return;
  }

  if (!confirmedAvatar) {
    saveStatus.textContent = "CONFIRM AN AVATAR FIRST";
    return;
  }

  for (const [key, label] of baselineDefinitions) {
    const minField = form.elements.namedItem(`${key}Min`);
    const maxField = form.elements.namedItem(`${key}Max`);

    if (minField.value !== "" && maxField.value !== "" &&
        Number(minField.value) > Number(maxField.value)) {
      saveStatus.textContent =
        `INVALID RANGE: ${label.toUpperCase()}`;
      minField.focus();
      return;
    }
  }

  // VITALS PROFILE LOCAL SAVE V1
  // Demo metadata only: no medical records or clinical fields.
  const storageKey = "vitals.astronauts.v1";

  const field = name => String(
    form.elements.namedItem(name)?.value ?? ""
  ).trim();

  const astronautId = field("astronautId");
  const fullName = field("fullName");

  const avatarFile = decodeURIComponent(
    new URL(avatarImage.src, window.location.href)
      .pathname.split("/").pop()
  );

  const avatarMatch = /^av([1-9]|1[0-9]|2[0-8])\.(png|webp)$/i
    .exec(avatarFile);

  if (!avatarMatch) {
    saveStatus.textContent = "INVALID AVATAR FILE";
    return;
  }

  const profile = {
    astronautId,
    fullName,
    age: field("age"),
    avatarIndex: Number(avatarMatch[1]),
    avatar: avatarFile,
    avatarFile,
    image: avatarFile,
    updatedAt: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw === null ? [] : JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      saveStatus.textContent =
        "PROFILE STORAGE FORMAT NOT SUPPORTED - NO CHANGES MADE";
      return;
    }

    const profiles = [...parsed];

    const matches = profiles
      .map((p, i) => ({p, i}))
      .filter(({p}) =>
        p && typeof p === "object" &&
        String(p.astronautId ?? p.id ?? "").trim() === astronautId
      );

    if (matches.length > 1) {
      saveStatus.textContent =
        "DUPLICATE PROFILE IDS DETECTED - NO CHANGES MADE";
      return;
    }

    if (matches.length === 1) {
      const index = matches[0].i;
      const previousName = String(
        matches[0].p.fullName ?? matches[0].p.name ?? ""
      ).trim();

      if (previousName !== fullName &&
          !window.confirm(
            "Astronaut ID already exists for " +
            previousName +
            ". Update this profile?"
          )) {
        saveStatus.textContent = "UPDATE CANCELLED";
        return;
      }

      profiles[index] = profile;
    } else {
      profiles.push({
        ...profile,
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem(storageKey, JSON.stringify(profiles));

    saveStatus.textContent =
      "ASTRONAUT PROFILE SAVED LOCALLY - " + astronautId;

  } catch (error) {
    console.error("VITALS astronaut save failed:", error);
    saveStatus.textContent =
      "SAVE FAILED - LOCAL STORAGE UNAVAILABLE OR INVALID";
  }
});


