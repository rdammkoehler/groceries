export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  dateEntered: string;
  lastPurchaseDate: string | null;
}
