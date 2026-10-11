// Hooks execute in insertion order. Add plugins without editing the engine.
export class DamagePipeline {
  constructor() { this.modifiers = []; }
  use(modifier_function) {
    if (typeof modifier_function !== "function") throw new Error("A modifier must be a function.");
    this.modifiers.push(modifier_function);
    return this;
  }
  calculate(battle_round) {
    for (const modifier of this.modifiers) {
      const modified_battle_round = modifier(battle_round);
      if (modified_battle_round !== undefined && modified_battle_round !== null) {
        battle_round = modified_battle_round;
      }
    }
    return battle_round;
  }
}

// Compatibility exports for existing consumers.
export { calculateClash } from "./calculateClash.js";
export { elements } from "../Elements/relationships.js";
