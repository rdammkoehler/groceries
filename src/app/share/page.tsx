"use client";

import { useState, useEffect, useCallback } from "react";
import ShareManager from "@/components/ShareManager";

interface ShareEntry {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface ListData {
  id: string;
}

export default function SharePage() {
  const [listId, setListId] = useState<string>("");
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListAndShares = useCallback(async () => {
    try {
      const listsResponse = await fetch("/api/lists");
      if (!listsResponse.ok) return;

      const listsData = await listsResponse.json();
      const ownList: ListData | null = listsData.ownList;

      if (!ownList) return;
      setListId(ownList.id);

      const sharesResponse = await fetch(`/api/lists/${ownList.id}/shares`);
      if (sharesResponse.ok) {
        const sharesData = await sharesResponse.json();
        setShares(sharesData);
      }
    } catch (fetchError) {
      console.error("Failed to fetch shares:", fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListAndShares();
  }, [fetchListAndShares]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Share Your List
      </h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {isLoading ? (
          <p className="py-8 text-center text-zinc-500">Loading...</p>
        ) : listId ? (
          <ShareManager
            listId={listId}
            shares={shares}
            onShareAdded={fetchListAndShares}
            onShareRemoved={fetchListAndShares}
          />
        ) : (
          <p className="py-8 text-center text-zinc-500">
            No grocery list found. Add an item first.
          </p>
        )}
      </div>
    </div>
  );
}
