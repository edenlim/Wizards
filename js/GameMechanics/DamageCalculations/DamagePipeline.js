// Hooks execute in insertion order. Add plugins without editing the engine.
export class DamagePipeline {
  constructor() { this.modifiers = []; }
  use(modifier_function) {
    if (typeof modifier_function !== "function") throw new Error("A modifier must be a function.");
    this.modifiers.push(modifier_function);
    return this;
  }
  calculate(battle_round) {
    return this.modifiers.reduce((battle_round, modifier) => modifier(battle_round) ?? battle_round, battle_round);
  }
}

// Compatibility exports for existing consumers.
export { calculateClash } from "./calculateClash.js";
export { elements } from "../Elements/relationships.js";
