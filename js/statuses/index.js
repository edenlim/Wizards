import { StatusRegistry } from "./StatusRegistry.js";
import { burn, frozen } from "./definitions/index.js";

export function createDefaultStatuses() {
  const status_registry = new StatusRegistry();
  status_registry.register("BURN", burn);
  status_registry.register("FREEZE", frozen);
  return status_registry;
}
