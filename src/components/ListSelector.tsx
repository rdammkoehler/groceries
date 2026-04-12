"use client";

interface ListOption {
  id: string;
  ownerName: string | null;
  ownerEmail: string;
  isOwn: boolean;
}

interface ListSelectorProps {
  lists: ListOption[];
  selectedListId: string;
  onSelectList: (listId: string) => void;
}

export default function ListSelector({
  lists,
  selectedListId,
  onSelectList,
}: ListSelectorProps) {
  if (lists.length <= 1) return null;

  return (
    <div className="mb-4">
      <label
        htmlFor="listSelector"
        className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Shopping List
      </label>
      <select
        id="listSelector"
        value={selectedListId}
        onChange={(event) => onSelectList(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      >
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.isOwn
              ? "My List"
              : `${list.ownerName || list.ownerEmail}'s List`}
          </option>
        ))}
      </select>
    </div>
  );
}
