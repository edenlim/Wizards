// Public compatibility entry point; implementations live in focused modules.
export { EffectRegistry } from "../Effects/EffectRegistry.js";
export { createDefaultEffects } from "../Effects/defaultEffects.js";
export { dealDamage } from "../DamageCalculations/dealDamage.js";
export { executeSpellEffects } from "./executeSpellEffects.js";
