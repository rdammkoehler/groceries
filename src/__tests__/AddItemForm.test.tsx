import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddItemForm from "@/components/AddItemForm";

const mockOnItemAdded = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

describe("AddItemForm", () => {
  it("renders the form with name and quantity fields", () => {
    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    expect(screen.getByLabelText("Item Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("shows an error when submitting with empty name", async () => {
    const user = userEvent.setup();
    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    await user.click(screen.getByRole("button", { name: "Add Item" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Please enter an item name.");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "1",
        name: "Lays Chips",
        quantity: 2,
        dateEntered: new Date().toISOString(),
        lastPurchaseDate: null,
      }),
    });

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    await user.type(screen.getByLabelText("Item Name"), "Lays Chips");
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "2");
    await user.click(screen.getByRole("button", { name: "Add Item" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/grocery-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Lays Chips", quantity: 2 }),
      });
    });

    await waitFor(() => {
      expect(mockOnItemAdded).toHaveBeenCalled();
    });
  });

  it("clears the form after successful submission", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "1",
        name: "Milk",
        quantity: 1,
        dateEntered: new Date().toISOString(),
        lastPurchaseDate: null,
      }),
    });

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    const nameInput = screen.getByLabelText("Item Name");
    await user.type(nameInput, "Milk");
    await user.click(screen.getByRole("button", { name: "Add Item" }));

    await waitFor(() => {
      expect(nameInput).toHaveValue("");
    });
  });

  it("shows an error when the API returns an error", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Name is required" }),
    });

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    await user.type(screen.getByLabelText("Item Name"), "Test");
    await user.click(screen.getByRole("button", { name: "Add Item" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    });
  });
});
