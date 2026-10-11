export function loadEventListeners(toggle_button, scene_manager, onError) {
  const toggle_listener = () => { scene_manager.switchScene().catch(onError); };
  toggle_button.addEventListener("click", toggle_listener);
  return () => toggle_button.removeEventListener("click", toggle_listener);
}
