import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShoppingList from "@/components/ShoppingList";
import { GroceryItem } from "@/types/grocery";

const mockOnTogglePurchased = jest.fn();

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
    lastPurchaseDate: "2026-04-12T12:00:00.000Z",
  },
];

describe("ShoppingList", () => {
  it("renders empty state when no items", () => {
    render(<ShoppingList items={[]} onTogglePurchased={mockOnTogglePurchased} />);

    expect(screen.getByText(/no items on your list/i)).toBeInTheDocument();
  });

  it("separates purchased and unpurchased items", () => {
    render(
      <ShoppingList items={sampleItems} onTogglePurchased={mockOnTogglePurchased} />
    );

    expect(screen.getByText("Lays Chips")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Purchased")).toBeInTheDocument();
  });

  it("shows unchecked checkbox for unpurchased items", () => {
    render(
      <ShoppingList items={sampleItems} onTogglePurchased={mockOnTogglePurchased} />
    );

    const unpurchasedCheckbox = screen.getByLabelText("Mark Lays Chips as purchased");
    expect(unpurchasedCheckbox).not.toBeChecked();
  });

  it("shows checked checkbox for purchased items", () => {
    render(
      <ShoppingList items={sampleItems} onTogglePurchased={mockOnTogglePurchased} />
    );

    const purchasedCheckbox = screen.getByLabelText("Unmark Whole Milk as purchased");
    expect(purchasedCheckbox).toBeChecked();
  });

  it("calls onTogglePurchased when checking an unpurchased item", async () => {
    const user = userEvent.setup();
    render(
      <ShoppingList items={sampleItems} onTogglePurchased={mockOnTogglePurchased} />
    );

    await user.click(screen.getByLabelText("Mark Lays Chips as purchased"));

    expect(mockOnTogglePurchased).toHaveBeenCalledWith("1", true);
  });

  it("calls onTogglePurchased when unchecking a purchased item", async () => {
    const user = userEvent.setup();
    render(
      <ShoppingList items={sampleItems} onTogglePurchased={mockOnTogglePurchased} />
    );

    await user.click(screen.getByLabelText("Unmark Whole Milk as purchased"));

    expect(mockOnTogglePurchased).toHaveBeenCalledWith("2", false);
  });
});
