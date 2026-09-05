import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

interface UseModalDialogOptions {
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export function useModalDialog({
  dialogRef,
  initialFocusRef,
  onClose,
}: UseModalDialogOptions) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const dialogElement: HTMLElement = dialog;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const scrollPosition = { left: window.scrollX, top: window.scrollY };

    document.body.style.overflow = "hidden";
    (initialFocusRef?.current ?? getFocusableElements(dialogElement)[0] ?? dialogElement)
      .focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(dialogElement);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus({ preventScroll: true });
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements.at(-1);
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || !dialogElement.contains(activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (activeElement === last || !dialogElement.contains(activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
      if (
        window.scrollX !== scrollPosition.left
        || window.scrollY !== scrollPosition.top
      ) {
        window.scrollTo({ ...scrollPosition, behavior: "auto" });
      }
    };
  }, [dialogRef, initialFocusRef]);
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter((element) => element.getAttribute("aria-hidden") !== "true");
}
