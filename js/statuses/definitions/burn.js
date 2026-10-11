import { dealDamage } from "../../battle/damage.js";

// Existing Burn behavior, moved here unchanged. Each application is independent.
export const burn = {
  onApply({ wizard, incoming_status, battle_round }) {
    wizard.activeStatuses.push(incoming_status);
    battle_round.log.push(`${wizard.name} gains ${incoming_status.status} for ${incoming_status.duration} rounds.`);
  },

  onTick({ wizard, active_status, battle_round }) {
    if (active_status.tickDamage > 0) {
      dealDamage(wizard, active_status.tickDamage, battle_round.log, active_status.status, true);
    }
  },
};
