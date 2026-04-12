"use client";

import { useState, useEffect, useCallback } from "react";
import ShoppingList from "@/components/ShoppingList";
import ListSelector from "@/components/ListSelector";
import { GroceryItem } from "@/types/grocery";

interface ListData {
  id: string;
  owner: { name: string | null; email: string };
  items: GroceryItem[];
}

interface ListsResponse {
  ownList: ListData | null;
  sharedLists: (ListData & { shareId: string })[];
}

export default function ShoppingPage() {
  const [listsData, setListsData] = useState<ListsResponse | null>(null);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data: ListsResponse = await response.json();
        setListsData(data);

        if (!selectedListId && data.ownList) {
          setSelectedListId(data.ownList.id);
        }
      }
    } catch (fetchError) {
      console.error("Failed to fetch lists:", fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [selectedListId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleTogglePurchased = async (
    itemId: string,
    purchased: boolean
  ) => {
    try {
      const response = await fetch(`/api/grocery-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchased }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setListsData((previous) => {
          if (!previous) return previous;
          const updateItems = (items: GroceryItem[]) =>
            items.map((item) => (item.id === itemId ? updatedItem : item));

          return {
            ownList: previous.ownList
              ? { ...previous.ownList, items: updateItems(previous.ownList.items) }
              : null,
            sharedLists: previous.sharedLists.map((list) => ({
              ...list,
              items: updateItems(list.items),
            })),
          };
        });
      }
    } catch (updateError) {
      console.error("Failed to update item:", updateError);
    }
  };

  const allLists =
    listsData
      ? [
          ...(listsData.ownList
            ? [
                {
                  id: listsData.ownList.id,
                  ownerName: "My List",
                  ownerEmail: listsData.ownList.owner.email,
                  isOwn: true,
                },
              ]
            : []),
          ...listsData.sharedLists.map((list) => ({
            id: list.id,
            ownerName: list.owner.name,
            ownerEmail: list.owner.email,
            isOwn: false,
          })),
        ]
      : [];

  const selectedItems =
    listsData && selectedListId
      ? (selectedListId === listsData.ownList?.id
          ? listsData.ownList?.items
          : listsData.sharedLists.find((list) => list.id === selectedListId)
              ?.items) ?? []
      : [];

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Shopping View
      </h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {isLoading ? (
          <p className="py-8 text-center text-zinc-500">Loading...</p>
        ) : (
          <>
            <ListSelector
              lists={allLists}
              selectedListId={selectedListId}
              onSelectList={setSelectedListId}
            />
            <ShoppingList
              items={selectedItems}
              onTogglePurchased={handleTogglePurchased}
            />
          </>
        )}
      </div>
    </div>
  );
}
