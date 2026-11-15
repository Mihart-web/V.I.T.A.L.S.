"use strict";
// Route only the existing dashboard SELECT ASTRONAUT control.
document.addEventListener("click", event => {
  const button = event.target.closest?.("#selectAstronaut");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  window.location.assign("./modules/astronaut-profile/select-astronaut.html");
}, true);