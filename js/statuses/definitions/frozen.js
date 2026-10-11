import { dealDamage } from "../../battle/damage.js";
import { preventCasting } from "../StatusRegistry.js";

export const frozen = {
  has_duration: true,
  onApply({ wizard, incoming_status, battle_round }) {
    wizard.activeStatuses.push(incoming_status);
    battle_round.log.push(`${wizard.name} gains ${incoming_status.status} for ${incoming_status.duration} rounds.`);
  },

  onValidateAction({ wizard, active_status, action, battle_round }) {
    preventCasting({ wizard, active_status, action, battle_round });
  }
};
