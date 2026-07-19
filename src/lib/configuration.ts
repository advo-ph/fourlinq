export interface Configuration {
  type: string;
  material: string;
  finish: string;
  glass: string;
  width: number;
  height: number;
}

export interface SaveConfigurationPayload {
  name: string;
  email: string;
  phone: string;
  config: Configuration;
}

export interface SaveConfigurationResult {
  refId: string;
}

type SaveConfigurationRequest = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

/**
 * Send a configuration to the FourlinQ API.
 *
 * A browser-only reference is deliberately not fabricated when the request
 * fails: callers must be able to distinguish a server-confirmed submission
 * from a draft that never reached FourlinQ.
 */
export async function saveConfiguration(
  payload: SaveConfigurationPayload,
  request: SaveConfigurationRequest = fetch,
): Promise<SaveConfigurationResult> {
  const response = await request("/api/save-configuration", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as {
    success?: boolean;
    refId?: string;
    error?: string;
  };

  if (!response.ok || data.success !== true || !data.refId) {
    throw new Error(data.error || "The configuration could not be sent.");
  }

  return { refId: data.refId };
}
