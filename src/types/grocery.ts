export interface GroceryItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  dateEntered: string;
  lastPurchaseDate: string | null;
}

export interface GroceryList {
  id: string;
  ownerId: string;
  owner?: {
    name: string | null;
    email: string;
  };
  items: GroceryItem[];
}

export interface ListShare {
  id: string;
  listId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
