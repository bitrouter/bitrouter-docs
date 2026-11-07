export function isPlaygroundPreviewEnabled() {
  return process.env.NODE_ENV === "development" && process.env.BITROUTER_PLAYGROUND_LOCAL_PREVIEW === "1";
}
