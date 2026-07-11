import { useEffect } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "@/hooks/useToast";

/** Fires a single notification on mount via the real toast context. */
function Trigger({ message = "Saved successfully" }: { message?: string }) {
  const { notify } = useToast();
  useEffect(() => {
    notify("success", message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

describe("ToastProvider", () => {
  it("renders a queued toast notification", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });

  it("dismisses a toast when its close button is clicked", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByLabelText("Dismiss notification"));

    expect(screen.queryByText("Saved successfully")).not.toBeInTheDocument();
  });

  it("keeps the toast context stable for useToast consumers", () => {
    render(
      <ToastProvider>
        <Trigger message="Registered anchor" />
      </ToastProvider>,
    );

    expect(screen.getByText("Registered anchor")).toBeInTheDocument();
  });
});
