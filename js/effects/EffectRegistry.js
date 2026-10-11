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

  execute(effect, battle_round, action) {
    const resolver = this.resolvers.get(effect.type);
    if (!resolver) throw new Error(`Unknown effect: ${effect.type}`);
    resolver(effect, battle_round, action);
  }
}

export function executeSpellEffects(action, battle_round, registry, damage, phase) {
  if (!action.canCast) return;

  action.damage = damage;
  for (const effect of action.spell.effects ?? []) {
    const belongs_to_phase = !phase || registry.getPhase(effect.type) === phase;
    if (!belongs_to_phase) continue;
    // Self effects still resolve when the spell loses; opponent effects need a win.
    const targets_opponent = (effect.target ?? "opponent") === "opponent";
    const clash_won = damage > 0;
    if (targets_opponent && !clash_won) continue;
    registry.execute(effect, battle_round, action);
  }
}

export function executeEffectPhase(battle_round, registry, phase) {
  const [actionA, actionB] = battle_round.actions;
  const damage_to_wizardB = Math.max(0, battle_round.finalDamage);
  const damage_to_wizardA = Math.max(0, -battle_round.finalDamage);
  executeSpellEffects(actionA, battle_round, registry, damage_to_wizardB, phase);
  executeSpellEffects(actionB, battle_round, registry, damage_to_wizardA, phase);
}
