"use client";

import { useState, useEffect, useCallback } from "react";
import ShoppingList from "@/components/ShoppingList";
import { GroceryItem } from "@/types/grocery";

export default function ShoppingPage() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/grocery-items");
      const data = await response.json();
      setGroceryItems(data);
    } catch (error) {
      console.error("Failed to fetch grocery items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleTogglePurchased = async (itemId: string, purchased: boolean) => {
    try {
      const response = await fetch(`/api/grocery-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased }),
      });
      const updatedItem = await response.json();
      setGroceryItems((previous) =>
        previous.map((item) => (item.id === itemId ? updatedItem : item))
      );
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Shopping View
      </h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {isLoading ? (
          <p className="py-8 text-center text-zinc-500">Loading...</p>
        ) : (
          <ShoppingList
            items={groceryItems}
            onTogglePurchased={handleTogglePurchased}
          />
        )}
      </div>
    </div>
  );
}
