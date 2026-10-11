import { initApp } from "./init.js";

initApp().catch(error => {
  console.error(error);
  document.getElementById("app").textContent = `Unable to start the game: ${error.message}`;
});
