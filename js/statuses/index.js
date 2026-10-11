import { StatusRegistry } from "./StatusRegistry.js";
import { burn, frozen, poison } from "./definitions/index.js";

export function createDefaultStatuses() {
  const status_registry = new StatusRegistry();
  status_registry.register("BURN", burn);
  status_registry.register("FREEZE", frozen);
  status_registry.register("POISON", poison);
  return status_registry;
}
