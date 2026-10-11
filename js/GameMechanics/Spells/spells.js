import { createSpell, createDamageSpell } from "./createSpell.js";

export const fireball = createSpell({
  id: "fireball", name: "Fireball", element: "Fire", basePower: 30, manaCost: 20,
  description: "Launch a fireball. Winning the clash burns the rival for 5 damage each round for 3 rounds.",
  effects: [
    { type: "DAMAGE_DIRECT" },
    { type: "APPLY_STATUS", status: "BURN", duration: 3, tickDamage: 5 },
  ],
});
export const iceShard = createDamageSpell("ice_shard", "Ice Shard", "Water", 20, 15,
  "Hurl a shard of ice into the opposing spell.");
export const greatBallOfFire = createDamageSpell("great_ball_of_fire", "Great Ball of Fire", "Fire", 50, 40,
  "Unleash a powerful fire spell at a high mana cost.");

export const spells = [
  fireball, iceShard, greatBallOfFire,
  createDamageSpell("metal", "Metal Lance", "Metal", 30, 20, "Drive a metal lance into the opposing spell."),
  createDamageSpell("wood", "Thorn Bolt", "Wood", 25, 15, "Send a bolt of sharp thorns toward the rival."),
  createDamageSpell("earth", "Stone Shot", "Earth", 25, 15, "Launch a dense stone into the opposing spell."),
  createDamageSpell("kinetic", "Force Bolt", "Kinetic", 20, 10, "Release a force bolt that clashes without elemental advantages."),
  createSpell({
    id: "barrier", name: "Conjure Barrier", element: "Kinetic", manaCost: 20,
    description: "Conjure 30 barrier to absorb incoming damage before health.",
    effects: [{ type: "BARRIER_SELF", target: "self", amount: 30 }],
  }),
  createSpell({
    id: "heal", name: "Mend", element: "Wood", manaCost: 20,
    description: "Restore 30 health, up to your maximum health.",
    effects: [{ type: "HEAL_SELF", target: "self", amount: 30 }],
  }),
  createSpell({
    id: "recharge", name: "Meditate", element: "Kinetic",
    description: "Skip attacking to restore 30 mana in addition to round regeneration. Your rival still acts.",
    effects: [{ type: "RESTORE_MANA", target: "self", amount: 30 }],
  }),
];
