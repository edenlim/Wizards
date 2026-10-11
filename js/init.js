import { BattleController } from "./Controllers/BattleController.js";
import { mountBattle } from "./battle.js";
import { SceneManager } from "./scene.js";
import { loadEventListeners } from "./eventlistener_handler.js";

// Composition root: dependencies and application lifetime are wired in one place.
export async function initApp(document_root = document) {
  const root = document_root.getElementById("app");
  const toggle_button = document_root.getElementById("toggle");
  const battle_controller = new BattleController();
  const scene_manager = new SceneManager({
    root,
    scenes: {
      battle: { path: "./html/battle_scene.html", mount: scene_root => mountBattle(scene_root, battle_controller) },
      map: { path: "./html/map_scene.html" },
    },
  });
  const showError = error => { console.error(error); };
  await scene_manager.loadScene("battle");
  const unbind_events = loadEventListeners(toggle_button, scene_manager, showError);
  return {
    battle_controller,
    scene_manager,
    dispose() { unbind_events(); scene_manager.dispose(); },
  };
}
