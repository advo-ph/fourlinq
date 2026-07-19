export interface QuotePayload {
  name: string;
  email: string;
  phone: string;
  quantity: string;
  dimensions: string;
  finish: string;
  timeline: string;
  notes: string;
  productId?: string;
  productName?: string;
}

export interface QuoteResult {
  refId: string;
  message: string;
}

type QuoteRequest = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export async function submitQuote(
  payload: QuotePayload,
  request: QuoteRequest = fetch,
): Promise<QuoteResult> {
  const response = await request("/api/quote-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({})) as {
    success?: boolean;
    refId?: string;
    message?: string;
    error?: string;
  };

  if (!response.ok || data.success !== true || !data.refId) {
    throw new Error(data.error || "The quote request could not be submitted.");
  }

  return {
    refId: data.refId,
    message: data.message || `Quote request ${data.refId} was recorded.`,
  };
}
