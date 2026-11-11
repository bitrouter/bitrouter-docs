import "server-only";

export function isPlaygroundEnabled() {
  return process.env.BITROUTER_PLAYGROUND_ENABLED === "1";
}
