import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { useFocusShortcut } from "./useFocusShortcut";

function pressKey(key: string, target: EventTarget = document.body) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  target.dispatchEvent(event);
}

describe("useFocusShortcut", () => {
  it("focuses the target element when the key is pressed", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    const ref = createRef<HTMLInputElement>();
    ref.current = input;

    renderHook(() => useFocusShortcut("/", ref));
    pressKey("/");

    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  it("does not steal focus when already typing in a text input", () => {
    const searchInput = document.createElement("input");
    const otherInput = document.createElement("input");
    document.body.appendChild(searchInput);
    document.body.appendChild(otherInput);
    otherInput.focus();
    const ref = createRef<HTMLInputElement>();
    ref.current = searchInput;

    renderHook(() => useFocusShortcut("/", ref));
    pressKey("/", otherInput);

    expect(document.activeElement).toBe(otherInput);
    document.body.removeChild(searchInput);
    document.body.removeChild(otherInput);
  });

  it("removes its listener on unmount", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    const ref = createRef<HTMLInputElement>();
    ref.current = input;

    const { unmount } = renderHook(() => useFocusShortcut("/", ref));
    unmount();
    pressKey("/");

    expect(document.activeElement).not.toBe(input);
  });
});
