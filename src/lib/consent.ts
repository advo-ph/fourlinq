/**
 * Cookie-consent contract — the single source of truth for whether we may
 * track, shared by CookieBanner (which writes it) and useAnalytics (which
 * reads it).
 *
 * RM6: the 2026-07-10 production capture recorded 128 analytics attempts
 * BEFORE any cookie choice. Analytics must be opt-in, and consent is read at
 * send time (never cached) so clearing or changing the preference takes effect
 * immediately with no stale tracking.
 */

export const CONSENT_KEY = "fourlinq_cookie_consent";

export type ConsentState = "accepted" | "declined" | "unset";

/** Current choice. Returns "unset" when no choice has been made, or when
 *  storage is unavailable (private mode, blocked cookies) — which must fail
 *  closed, i.e. no tracking. */
export function getConsent(): ConsentState {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : "unset";
  } catch {
    return "unset";
  }
}

/** The only gate analytics may use. Opt-in: anything other than an explicit
 *  "accepted" means do not track. */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

export function setConsent(state: Exclude<ConsentState, "unset">): void {
  try {
    localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* storage unavailable — fail closed, stay untracked */
  }
}

/** Clear the choice (returns the visitor to "unset" → untracked). */
export function clearConsent(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* no-op */
  }
}
