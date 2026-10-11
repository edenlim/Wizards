import { generating, overcoming, elements } from "../Elements/relationships.js";

// wizardA/actionA is left; wizardB/actionB is right.
// Positive damage hits wizardB (right); negative damage hits wizardA (left). Apply the README's
// piecewise formulas to powers, rather than multiplying their difference.
export function calculateClash(actionA, actionB, elemental_factor = 2) {
  if (!Number.isFinite(elemental_factor) || elemental_factor < 1) throw new Error("Invalid elemental factor.");
  for (const action of [actionA, actionB]) {
    if (!elements.includes(action.element) || !Number.isFinite(action.power) || action.power < 0)
      throw new Error("Invalid spell element or power.");
  }
  // weaker_element and stronger_element are the respective spell powers.
  const generative = (weaker_element, stronger_element) => {
    const damage_difference = weaker_element / elemental_factor - stronger_element;
    return damage_difference > 0 ? damage_difference * elemental_factor : damage_difference;
  };
  const overcome = (weaker_element, stronger_element) => {
    const damage_difference = weaker_element - elemental_factor * stronger_element;
    return damage_difference < 0 ? damage_difference / elemental_factor : damage_difference;
  };
  if (generating[actionA.element] === actionB.element) return generative(actionA.power, actionB.power);
  if (generating[actionB.element] === actionA.element) return -generative(actionB.power, actionA.power);
  if (overcoming[actionA.element] === actionB.element) return -overcome(actionB.power, actionA.power);
  if (overcoming[actionB.element] === actionA.element) return overcome(actionA.power, actionB.power);
  return actionA.power - actionB.power;
}
