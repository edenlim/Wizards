// Generic scene lifecycle. It does not import combat or read the global DOM.
export class SceneManager {
  constructor({ root, scenes, fetch_html = path => fetch(path) }) {
    this.root = root;
    this.scenes = scenes;
    this.fetch_html = fetch_html;
    this.scene_cache = new Map();
    this.currentScene = null;
    this.request_number = 0;
    this.cleanup = null;
  }

  async loadScene(scene_name) {
    const scene = this.scenes[scene_name];
    if (!scene) throw new Error(`Unknown scene: ${scene_name}`);
    const request_number = ++this.request_number;
    if (!this.scene_cache.has(scene_name)) {
      const response = await this.fetch_html(scene.path);
      if (!response.ok) throw new Error(`Failed to load ${scene.path}: ${response.statusText}`);
      this.scene_cache.set(scene_name, await response.text());
    }
    // An older fetch must not overwrite a newer navigation.
    if (request_number !== this.request_number) return;
    this.cleanup?.();
    this.root.innerHTML = this.scene_cache.get(scene_name);
    this.currentScene = scene_name;
    this.cleanup = scene.mount?.(this.root) ?? null;
  }

  switchScene() {
    return this.loadScene(this.currentScene === "map" ? "battle" : "map");
  }

  dispose() {
    this.request_number += 1;
    this.cleanup?.();
    this.cleanup = null;
  }
}
