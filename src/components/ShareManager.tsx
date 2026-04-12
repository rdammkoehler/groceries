"use client";

import { useState } from "react";

interface ShareEntry {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface ShareManagerProps {
  listId: string;
  shares: ShareEntry[];
  onShareAdded: () => void;
  onShareRemoved: () => void;
}

export default function ShareManager({
  listId,
  shares,
  onShareAdded,
  onShareRemoved,
}: ShareManagerProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/lists/${listId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to share list.");
        return;
      }

      setSuccessMessage(`List shared with ${inviteEmail.trim()}`);
      setInviteEmail("");
      onShareAdded();
    } catch {
      setErrorMessage("Failed to share list. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await fetch(`/api/lists/${listId}/shares/${shareId}`, {
        method: "DELETE",
      });
      onShareRemoved();
    } catch {
      setErrorMessage("Failed to remove share.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleInvite} className="flex flex-col gap-3">
        <label
          htmlFor="inviteEmail"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Invite by email
        </label>
        <div className="flex gap-2">
          <input
            id="inviteEmail"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="user@example.com"
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Sharing..." : "Share"}
          </button>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </p>
        )}
      </form>

      {shares.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Shared with
          </h3>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {shares.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {share.user.name || share.user.email}
                  </span>
                  {share.user.name && (
                    <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {share.user.email}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveShare(share.id)}
                  className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shares.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your list is not shared with anyone yet.
        </p>
      )}
    </div>
  );
}
