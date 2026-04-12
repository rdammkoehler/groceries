"use client";

import { useState } from "react";

interface AddItemFormProps {
  onItemAdded: () => void;
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    if (!itemName.trim()) {
      setErrorMessage("Please enter an item name.");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      setErrorMessage("Quantity must be a positive whole number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/grocery-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemName.trim(), quantity: parsedQuantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to add item.");
        return;
      }

      setItemName("");
      setQuantity("1");
      onItemAdded();
    } catch {
      setErrorMessage("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="itemName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Item Name
        </label>
        <input
          id="itemName"
          type="text"
          value={itemName}
          onChange={(event) => setItemName(event.target.value)}
          placeholder="e.g. Lays Chips"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="quantity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add Item"}
      </button>
    </form>
  );
}
