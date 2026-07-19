import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let scrollLockCount = 0;
let originalBodyOverflow = "";
let deferredFocusTarget: HTMLElement | null = null;

function acquireScrollLock() {
  if (scrollLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
  }
  scrollLockCount += 1;
  document.body.style.overflow = "hidden";

  let isReleased = false;
  return () => {
    if (isReleased) return;
    isReleased = true;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow;
    }
  };
}

function visibleFocusTarget(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((target) => {
    const style = window.getComputedStyle(target);
    const box = target.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  });
}

function topModalDialog() {
  const dialog = Array.from(document.querySelectorAll<HTMLElement>("[role='dialog'][aria-modal='true']"));
  return dialog.filter((entry) => {
    if (entry.dataset.dialogClosing === "true") return false;
    const style = window.getComputedStyle(entry);
    const box = entry.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  }).at(-1);
}

interface DialogFocusOption {
  isOpen: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
}

/**
 * Gives the site's custom drawers the same keyboard contract as a modal dialog:
 * initial focus, Tab containment, topmost-only Escape, scroll lock, and focus return.
 */
export function useDialogFocus<T extends HTMLElement>({
  isOpen,
  onClose,
  initialFocusRef,
  lockScroll = true,
}: DialogFocusOption) {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const releaseScroll = lockScroll ? acquireScrollLock() : null;
    dialog?.removeAttribute("data-dialog-closing");

    const focusFrame = window.requestAnimationFrame(() => {
      if (!dialog || topModalDialog() !== dialog) return;
      (initialFocusRef?.current ?? visibleFocusTarget(dialog)[0] ?? dialog).focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!dialog || topModalDialog() !== dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = visibleFocusTarget(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      if (dialog) dialog.dataset.dialogClosing = "true";
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown, true);
      releaseScroll?.();

      const restoreFocus = (attempt = 0) => {
        const dialogStillMounted = Boolean(dialog?.isConnected);
        if (dialogStillMounted && attempt < 48) {
          window.requestAnimationFrame(() => restoreFocus(attempt + 1));
          return;
        }

        const topDialog = topModalDialog();
        if (topDialog) {
          if (returnFocus?.isConnected && topDialog.contains(returnFocus)) {
            returnFocus.focus();
          } else {
            if (returnFocus?.isConnected && !dialog?.contains(returnFocus)) {
              deferredFocusTarget = returnFocus;
            }
            if (!(document.activeElement instanceof Node) || !topDialog.contains(document.activeElement)) {
              (visibleFocusTarget(topDialog)[0] ?? topDialog).focus();
            }
          }
          return;
        }

        const focusTarget = returnFocus?.isConnected && !dialog?.contains(returnFocus)
          ? returnFocus
          : deferredFocusTarget?.isConnected
            ? deferredFocusTarget
            : null;
        deferredFocusTarget = null;
        focusTarget?.focus();
      };

      window.requestAnimationFrame(() => restoreFocus());
    };
  }, [initialFocusRef, isOpen, lockScroll]);

  return dialogRef;
}
