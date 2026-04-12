"use client";

import { GroceryItem } from "@/types/grocery";

interface ShoppingListProps {
  items: GroceryItem[];
  onTogglePurchased: (itemId: string, purchased: boolean) => void;
}

export default function ShoppingList({ items, onTogglePurchased }: ShoppingListProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        No items on your list. Add some items first.
      </p>
    );
  }

  const unpurchasedItems = items.filter((item) => !item.lastPurchaseDate);
  const purchasedItems = items.filter((item) => item.lastPurchaseDate);

  return (
    <div className="flex flex-col gap-6">
      {unpurchasedItems.length > 0 && (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {unpurchasedItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={false}
                onChange={() => onTogglePurchased(item.id, true)}
                className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                aria-label={`Mark ${item.name} as purchased`}
              />
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.name}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}

      {purchasedItems.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Purchased
          </h3>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {purchasedItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => onTogglePurchased(item.id, false)}
                  className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Unmark ${item.name} as purchased`}
                />
                <span className="font-medium text-zinc-500 line-through dark:text-zinc-400">
                  {item.name}
                </span>
                <span className="text-sm text-zinc-400 line-through dark:text-zinc-500">
                  x{item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
