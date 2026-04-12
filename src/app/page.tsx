"use client";

import { useState, useEffect, useCallback } from "react";
import AddItemForm from "@/components/AddItemForm";
import GroceryList from "@/components/GroceryList";
import { GroceryItem } from "@/types/grocery";

export default function Home() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/grocery-items");
      if (response.ok) {
        const data = await response.json();
        setGroceryItems(data);
      }
    } catch (fetchError) {
      console.error("Failed to fetch grocery items:", fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (itemId: string) => {
    try {
      await fetch(`/api/grocery-items/${itemId}`, { method: "DELETE" });
      setGroceryItems((previous) =>
        previous.filter((item) => item.id !== itemId)
      );
    } catch (deleteError) {
      console.error("Failed to delete item:", deleteError);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Grocery List
      </h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <AddItemForm onItemAdded={fetchItems} />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Items
        </h2>
        {isLoading ? (
          <p className="py-8 text-center text-zinc-500">Loading...</p>
        ) : (
          <GroceryList items={groceryItems} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
