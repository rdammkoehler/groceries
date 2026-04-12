import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroceryList from "@/components/GroceryList";
import { GroceryItem } from "@/types/grocery";

const mockOnDelete = jest.fn();

const sampleItems: GroceryItem[] = [
  {
    id: "1",
    listId: "list-1",
    name: "Lays Chips",
    quantity: 2,
    dateEntered: "2026-04-12T10:00:00.000Z",
    lastPurchaseDate: null,
  },
  {
    id: "2",
    listId: "list-1",
    name: "Whole Milk",
    quantity: 1,
    dateEntered: "2026-04-12T11:00:00.000Z",
    lastPurchaseDate: null,
  },
];

describe("GroceryList", () => {
  it("renders empty state when no items", () => {
    render(<GroceryList items={[]} onDelete={mockOnDelete} />);

    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
  });

  it("renders all items with name, quantity, and date", () => {
    render(<GroceryList items={sampleItems} onDelete={mockOnDelete} />);

    expect(screen.getByText("Lays Chips")).toBeInTheDocument();
    expect(screen.getByText("x2")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("x1")).toBeInTheDocument();
  });

  it("calls onDelete with the correct item id", async () => {
    const user = userEvent.setup();
    render(<GroceryList items={sampleItems} onDelete={mockOnDelete} />);

    await user.click(screen.getByLabelText("Delete Lays Chips"));

    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });
});
