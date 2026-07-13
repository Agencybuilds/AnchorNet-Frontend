import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PoolsPanel } from "./PoolsPanel";
import { fetchPools } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  fetchPools: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PoolsPanel", () => {
  it("shows a loading state before pools resolve", () => {
    vi.mocked(fetchPools).mockReturnValue(new Promise(() => {}));
    render(<PoolsPanel />);
    expect(screen.getByLabelText("Loading table data")).toBeInTheDocument();
  });

  it("renders summary stats and the pool list once loaded", async () => {
    vi.mocked(fetchPools).mockResolvedValue([
      { asset: "USDC", total: 1000, anchors: 2 },
      { asset: "EURC", total: 500, anchors: 1 },
    ]);

    render(<PoolsPanel />);

    expect(await screen.findByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("EURC")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Assets stat card
    expect(screen.getByText("1,500")).toBeInTheDocument(); // total liquidity
  });

  it("focuses the search box when / is pressed", async () => {
    vi.mocked(fetchPools).mockResolvedValue([
      { asset: "USDC", total: 1000, anchors: 2 },
    ]);

    render(<PoolsPanel />);
    await screen.findByText("USDC");

    fireEvent.keyDown(document.body, { key: "/" });

    expect(document.activeElement).toBe(screen.getByLabelText("Search pools"));
  });

  it("filters pools via the search box", async () => {
    vi.mocked(fetchPools).mockResolvedValue([
      { asset: "USDC", total: 1000, anchors: 2 },
      { asset: "EURC", total: 500, anchors: 1 },
    ]);

    render(<PoolsPanel />);
    await screen.findByText("USDC");

    fireEvent.change(screen.getByLabelText("Search pools"), {
      target: { value: "usdc" },
    });

    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.queryByText("EURC")).not.toBeInTheDocument();
  });

  it("shows an error message and retries on demand", async () => {
    vi.mocked(fetchPools).mockRejectedValueOnce(new Error("network down"));

    render(<PoolsPanel />);
    expect(await screen.findByText(/network down/i)).toBeInTheDocument();

    vi.mocked(fetchPools).mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(fetchPools).toHaveBeenCalledTimes(2));
  });
});
