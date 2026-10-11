import { BattleView } from "./UI/BattleView.js";

// Scene adapter: connect UI events to a supplied controller, then return cleanup.
export function mountBattle(root, battle_controller) {
  const battle_view = new BattleView(root);
  battle_view.populateSpells(battle_controller.spells);
  const unbind_actions = battle_view.bindActions({
    onCast(spell_id) {
      try { battle_controller.cast(spell_id); }
      catch (error) { battle_controller.message = error.message; }
      battle_view.render(battle_controller);
    },
    onRestart() {
      battle_controller.restart();
      battle_view.render(battle_controller);
    },
  });
  battle_view.render(battle_controller);
  return unbind_actions;
}
