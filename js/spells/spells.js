export function createSpell({ id, name, element, basePower = 0, manaCost = 0, description, effects = [] }) {
    return { id, name, element, basePower, manaCost, description, effects };
}

// ---- FIRE ----
export const fireball = createSpell({
    id: "fireball",
    name: "Fireball",
    element: "Fire",
    basePower: 30,
    manaCost: 20,
    description: "Launch a fireball. Winning the clash burns the rival for 5 damage each round for 3 rounds.",
    effects: [
        { type: "DAMAGE_DIRECT" },
        { type: "APPLY_STATUS", status: "BURN", duration: 3, tickDamage: 5 },
    ],
});

export const greatBallOfFire = createSpell({
    id: "great_ball_of_fire",
    name: "Great Ball of Fire",
    element: "Fire",
    basePower: 50,
    manaCost: 40,
    description: "Unleash a powerful fire spell at a high mana cost.",
    effects: [{ type: "DAMAGE_DIRECT" }],
});

// ---- WATER ----
export const iceShard = createSpell({
    id: "ice_shard",
    name: "Ice Shard",
    element: "Water",
    basePower: 20,
    manaCost: 15,
    description: "Hurl a shard of ice into the opposing spell.",
    effects: [{ type: "DAMAGE_DIRECT" }],
});

export const snapFreeze = createSpell({
    id: "snap_freeze",
    name: "Snap Freeze",
    element: "Water",
    basePower: 10,
    manaCost: 15,
    description: "Snap freezes an enemy, freezes regardless of barrier",
    effects: [
        { type: "DAMAGE_DIRECT" },
        { type: "APPLY_STATUS", status: "FREEZE", duration: 1, bypassBarrier: true },
    ],
});

// ---- WOOD ----
export const thornBolt = createSpell({
    id: "wood",
    name: "Thorn Bolt",
    element: "Wood",
    basePower: 25,
    manaCost: 15,
    description: "Send a bolt of sharp thorns toward the rival.",
    effects: [{ type: "DAMAGE_DIRECT" }],
});

export const mend = createSpell({
    id: "heal",
    name: "Mend",
    element: "Wood",
    basePower: 0,
    manaCost: 20,
    description: "Restore 30 health, up to your maximum health.",
    effects: [{ type: "HEAL_SELF", target: "self", amount: 30 }],
});

export const poisonedThorn = createSpell({
    id: "poisoned_thorn",
    name: "Poisoned Thorn",
    element: "Wood",
    basePower: 20,
    manaCost: 20,
    description: "Launch a sharp thorn that deals 2 poison damage each round.",
    effects: [
        { type: "DAMAGE_DIRECT" },
        { type: "APPLY_STATUS", status: "POISON", tickDamage: 2 },
    ],
});

// ---- METAL ----
export const metalLance = createSpell({
    id: "metal",
    name: "Metal Lance",
    element: "Metal",
    basePower: 30,
    manaCost: 20,
    description: "Drive a metal lance into the opposing spell.",
    effects: [{ type: "DAMAGE_DIRECT" }],
});

export const rust = createSpell({
    id: "rust",
    name: "Rust",
    element: "Metal",
    basePower: 0,
    manaCost: 15,
    description: "Coat the enemy in rust, poisoning them",
    effects: [
        { type: "APPLY_STATUS", status: "POISON", tickDamage: 5, bypassBarrier: true, bypassClash: true },
    ],
});

// ---- EARTH ----
export const stoneShot = createSpell({
    id: "earth",
    name: "Stone Shot",
    element: "Earth",
    basePower: 25,
    manaCost: 15,
    description: "Launch a dense stone into the opposing spell.",
    effects: [{ type: "DAMAGE_DIRECT" }],
});

// ---- KINETIC ----
export const forceBolt = createSpell({
    id: "kinetic",
    name: "Force Bolt",
    element: "Kinetic",
    basePower: 20,
    manaCost: 10,
    description: "Release a force bolt that clashes without elemental advantages.",
    effects: [{ type: "DAMAGE_DIRECT" }],
});

export const conjureBarrier = createSpell({
    id: "barrier",
    name: "Conjure Barrier",
    element: "Kinetic",
    basePower: 0,
    manaCost: 20,
    description: "Conjure 30 barrier to absorb incoming damage before health.",
    effects: [{ type: "BARRIER_SELF", target: "self", amount: 30 }],
});

export const meditate = createSpell({
    id: "recharge",
    name: "Meditate",
    element: "Kinetic",
    basePower: 0,
    manaCost: 0,
    description: "Skip attacking to restore 30 mana in addition to round regeneration. Your rival still acts.",
    effects: [{ type: "RESTORE_MANA", target: "self", amount: 30 }],
});

// Compatibility aliases
export const barrier = conjureBarrier;
export const heal = mend;
export const recharge = meditate;

// Complete Spell Catalog
export const spells = [
    // Fire
    fireball,
    greatBallOfFire,

    // Water
    iceShard,
    snapFreeze,

    // Wood
    thornBolt,
    mend,
    poisonedThorn,

    // Metal
    metalLance,
    rust,

    // Earth
    stoneShot,

    // Kinetic
    forceBolt,
    conjureBarrier,
    meditate,
];
