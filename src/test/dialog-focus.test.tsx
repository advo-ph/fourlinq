import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDialogFocus } from "@/hooks/useDialogFocus";

function FocusHarness({ isOpen, name }: { isOpen: boolean; name: string }) {
  const dialogRef = useDialogFocus<HTMLDivElement>({ isOpen, onClose: () => {} });
  return isOpen ? (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={name} tabIndex={-1}>
      <button type="button">{name}</button>
    </div>
  ) : null;
}

function NestedFocusHarness({ navigationOpen, chatOpen }: { navigationOpen: boolean; chatOpen: boolean }) {
  const navigationRef = useDialogFocus<HTMLDivElement>({ isOpen: navigationOpen, onClose: () => {} });
  const chatRef = useDialogFocus<HTMLDivElement>({ isOpen: chatOpen, onClose: () => {} });
  return (
    <>
      <button type="button">Open navigation</button>
      {navigationOpen && (
        <div ref={navigationRef} role="dialog" aria-modal="true" aria-label="Navigation" tabIndex={-1}>
          <button type="button">Open chat</button>
        </div>
      )}
      {chatOpen && (
        <div ref={chatRef} role="dialog" aria-modal="true" aria-label="Chat" tabIndex={-1}>
          <button type="button">Write message</button>
        </div>
      )}
    </>
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("shared dialog focus contract", () => {
  it("keeps body scrolling locked when stacked dialogs close out of order", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = render(
      <>
        <FocusHarness isOpen name="Navigation" />
        <FocusHarness isOpen name="Chat" />
      </>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <>
        <FocusHarness isOpen={false} name="Navigation" />
        <FocusHarness isOpen name="Chat" />
      </>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <>
        <FocusHarness isOpen={false} name="Navigation" />
        <FocusHarness isOpen={false} name="Chat" />
      </>,
    );
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("returns focus to the original trigger after a lower dialog closes first", async () => {
    const box = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, right: 100, bottom: 40, left: 0, width: 100, height: 40,
      toJSON: () => ({}),
    } as DOMRect);
    try {
      const { getByRole, rerender } = render(<NestedFocusHarness navigationOpen={false} chatOpen={false} />);
      const navigationTrigger = getByRole("button", { name: "Open navigation" });
      navigationTrigger.focus();

      rerender(<NestedFocusHarness navigationOpen chatOpen={false} />);
      await waitFor(() => expect(getByRole("button", { name: "Open chat" })).toHaveFocus());

      rerender(<NestedFocusHarness navigationOpen chatOpen />);
      await waitFor(() => expect(getByRole("button", { name: "Write message" })).toHaveFocus());

      rerender(<NestedFocusHarness navigationOpen={false} chatOpen />);
      await waitFor(() => expect(getByRole("button", { name: "Write message" })).toHaveFocus());

      rerender(<NestedFocusHarness navigationOpen={false} chatOpen={false} />);
      await waitFor(() => expect(navigationTrigger).toHaveFocus());
    } finally {
      box.mockRestore();
    }
  });
});
