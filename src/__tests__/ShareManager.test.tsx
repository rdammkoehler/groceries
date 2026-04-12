import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareManager from "@/components/ShareManager";

const mockOnShareAdded = jest.fn();
const mockOnShareRemoved = jest.fn();

const sampleShares = [
  {
    id: "share-1",
    user: { id: "user-2", email: "alice@example.com", name: "Alice" },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe("ShareManager", () => {
  it("renders the invite form", () => {
    render(
      <ShareManager
        listId="list-1"
        shares={[]}
        onShareAdded={mockOnShareAdded}
        onShareRemoved={mockOnShareRemoved}
      />
    );

    expect(screen.getByLabelText("Invite by email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });

  it("shows empty state when no shares", () => {
    render(
      <ShareManager
        listId="list-1"
        shares={[]}
        onShareAdded={mockOnShareAdded}
        onShareRemoved={mockOnShareRemoved}
      />
    );

    expect(screen.getByText(/not shared with anyone/i)).toBeInTheDocument();
  });

  it("renders existing shares with user info", () => {
    render(
      <ShareManager
        listId="list-1"
        shares={sampleShares}
        onShareAdded={mockOnShareAdded}
        onShareRemoved={mockOnShareRemoved}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("invites a user by email", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "share-2",
        user: { id: "user-3", email: "bob@example.com", name: "Bob" },
      }),
    });

    render(
      <ShareManager
        listId="list-1"
        shares={[]}
        onShareAdded={mockOnShareAdded}
        onShareRemoved={mockOnShareRemoved}
      />
    );

    await user.type(
      screen.getByLabelText("Invite by email"),
      "bob@example.com"
    );
    await user.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(mockOnShareAdded).toHaveBeenCalled();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/lists/list-1/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bob@example.com" }),
    });
  });

  it("shows error when API returns error", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "No user found with that email address. They must sign up first." }),
    });

    render(
      <ShareManager
        listId="list-1"
        shares={[]}
        onShareAdded={mockOnShareAdded}
        onShareRemoved={mockOnShareRemoved}
      />
    );

    await user.type(
      screen.getByLabelText("Invite by email"),
      "unknown@example.com"
    );
    await user.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No user found");
    });
  });

  it("calls onShareRemoved when removing a share", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <ShareManager
        listId="list-1"
        shares={sampleShares}
        onShareAdded={mockOnShareAdded}
        onShareRemoved={mockOnShareRemoved}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(mockOnShareRemoved).toHaveBeenCalled();
    });
  });
});
