import { dealDamage } from "../../battle/damage.js";

export const poison = {
  has_duration: false,
  onApply({ wizard, incoming_status, battle_round }) {
    const existing_poison = wizard.activeStatuses.find(
      active_status => active_status.status === "POISON"
    );
    if (existing_poison) {
      existing_poison.tickDamage += incoming_status.tickDamage;
      battle_round.log.push(`The poison for ${wizard.name} worsens!`);
    } else {
      wizard.activeStatuses.push(incoming_status);
      battle_round.log.push(`${wizard.name} gains ${incoming_status.status} until removed.`);
    }
  },
  onTick({ wizard, active_status, battle_round }) {
    dealDamage(wizard,
      active_status.tickDamage,
      battle_round.log,
      active_status.status,
      true
    );
  }
};
