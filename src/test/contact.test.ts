/**
 * Contact-link invariants.
 *
 * Imie, 2026-05-31, attaching a screenshot of the browser's "Open Skype?" prompt:
 * "when i click the contact no. is it possible that it is directed to a viber
 * app instead of skype?"
 *
 * A bare `tel:` link hands the number to whatever the OS registered for the
 * protocol, which on her desktop is Skype. Mobile numbers now open Viber;
 * landlines, which Viber cannot dial, still fall back to `tel:`.
 */
import { describe, expect, it } from "vitest";
import { CONTACT, phoneHref, toE164 } from "@/data/fourlinq-data";

describe("phone numbers open Viber, not Skype", () => {
  it("normalises a local PH mobile to E.164", () => {
    expect(toE164("0925-848-8888")).toBe("+639258488888");
    expect(toE164("09258488888")).toBe("+639258488888");
    expect(toE164("639258488888")).toBe("+639258488888");
  });

  it("does not treat a landline as a mobile", () => {
    expect(toE164(CONTACT.landline)).toBeNull();
    expect(toE164("(02)8563-5363")).toBeNull();
  });

  it("both published mobiles produce a Viber deep link", () => {
    for (const mobile of [CONTACT.mobileSales, CONTACT.mobileAssist]) {
      const href = phoneHref(mobile);
      expect(href).toMatch(/^viber:\/\/chat\?number=/);
      expect(href).not.toMatch(/^tel:/);
    }
  });

  it("the landline still falls back to tel: — Viber cannot dial it", () => {
    expect(phoneHref(CONTACT.landline)).toBe("tel:0285635363");
  });

  it("the sales number resolves to the right E.164 digits", () => {
    expect(phoneHref(CONTACT.mobileSales)).toContain(
      encodeURIComponent("+639258488888"),
    );
  });
});
