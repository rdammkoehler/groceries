"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {session.user.name || session.user.email}
      </span>
      {session.user.image && (
        <Image
          src={session.user.image}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        Sign out
      </button>
    </div>
  );
}
