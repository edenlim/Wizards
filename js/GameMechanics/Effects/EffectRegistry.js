export class EffectRegistry {
  constructor() { this.resolvers = new Map(); }
  register(type, resolver) {
    if (this.resolvers.has(type)) throw new Error(`Effect already registered: ${type}`);
    if (typeof resolver !== "function") throw new Error("Effect resolver must be a function.");
    this.resolvers.set(type, resolver);
    return this;
  }
  has(type) { return this.resolvers.has(type); }

  execute(effect, battle_round) {
    const resolver = this.resolvers.get(effect.type);
    if (!resolver) throw new Error(`Unknown effect: ${effect.type}`);
    resolver(effect, battle_round);
  }
}

