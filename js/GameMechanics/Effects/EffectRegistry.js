export class EffectRegistry {
  constructor() {
    this.resolvers = new Map();
    this.phases = new Map();
  }
  register(type, resolver, { phase = "afterDamage" } = {}) {
    if (!["healing", "barrier", "damage", "afterDamage"].includes(phase)) {
      throw new Error(`Unknown effect phase: ${phase}`);
    }
    if (this.resolvers.has(type)) throw new Error(`Effect already registered: ${type}`);
    if (typeof resolver !== "function") throw new Error("Effect resolver must be a function.");
    this.resolvers.set(type, resolver);
    this.phases.set(type, phase);
    return this;
  }
  getPhase(type) {
    if (!this.has(type)) throw new Error(`Unknown effect: ${type}`);
    return this.phases.get(type);
  }

  has(type) { return this.resolvers.has(type); }

  execute(effect, battle_round) {
    const resolver = this.resolvers.get(effect.type);
    if (!resolver) throw new Error(`Unknown effect: ${effect.type}`);
    resolver(effect, battle_round);
  }
}

