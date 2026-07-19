export function isEmbeddedDesignTool(pathname: string, search: string) {
  if (pathname !== "/design-tool") return false;
  return new URLSearchParams(search).get("embed") === "1";
}

export const DESIGN_TOOL_FRAME_MESSAGE = "fourlinq:design-tool-height";

export function designToolFrameHeight(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const message = value as { type?: unknown; height?: unknown };
  if (message.type !== DESIGN_TOOL_FRAME_MESSAGE || typeof message.height !== "number" || !Number.isFinite(message.height)) {
    return null;
  }
  return Math.min(1_600, Math.max(720, Math.ceil(message.height)));
}
