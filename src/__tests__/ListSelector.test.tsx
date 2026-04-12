import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListSelector from "@/components/ListSelector";

const mockOnSelectList = jest.fn();

const sampleLists = [
  { id: "list-1", ownerName: null, ownerEmail: "me@example.com", isOwn: true },
  { id: "list-2", ownerName: "Alice", ownerEmail: "alice@example.com", isOwn: false },
];

describe("ListSelector", () => {
  it("renders nothing when only one list", () => {
    const { container } = render(
      <ListSelector
        lists={[sampleLists[0]]}
        selectedListId="list-1"
        onSelectList={mockOnSelectList}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders a dropdown when multiple lists exist", () => {
    render(
      <ListSelector
        lists={sampleLists}
        selectedListId="list-1"
        onSelectList={mockOnSelectList}
      />
    );

    expect(screen.getByLabelText("Shopping List")).toBeInTheDocument();
    expect(screen.getByText("My List")).toBeInTheDocument();
    expect(screen.getByText("Alice's List")).toBeInTheDocument();
  });

  it("calls onSelectList when a different list is selected", async () => {
    const user = userEvent.setup();
    render(
      <ListSelector
        lists={sampleLists}
        selectedListId="list-1"
        onSelectList={mockOnSelectList}
      />
    );

    await user.selectOptions(screen.getByLabelText("Shopping List"), "list-2");

    expect(mockOnSelectList).toHaveBeenCalledWith("list-2");
  });
});
