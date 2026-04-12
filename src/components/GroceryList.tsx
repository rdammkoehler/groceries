"use client";

import { GroceryItem } from "@/types/grocery";

interface GroceryListProps {
  items: GroceryItem[];
  onDelete: (itemId: string) => void;
}

export default function GroceryList({ items, onDelete }: GroceryListProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        No items yet. Add your first grocery item above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-3">
          <div>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {item.name}
            </span>
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
              x{item.quantity}
            </span>
            <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
              {new Date(item.dateEntered).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            aria-label={`Delete ${item.name}`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
