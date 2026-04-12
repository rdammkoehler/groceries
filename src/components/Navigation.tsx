"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

export default function Navigation() {
  const pathname = usePathname();

  const linkClasses = (href: string) => {
    const isActive = pathname === href;
    return `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    }`;
  };

  return (
    <nav className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-700">
      <div className="flex gap-2">
        <Link href="/" className={linkClasses("/")}>
          Grocery List
        </Link>
        <Link href="/shopping" className={linkClasses("/shopping")}>
          Shopping View
        </Link>
        <Link href="/share" className={linkClasses("/share")}>
          Sharing
        </Link>
      </div>
      <UserMenu />
    </nav>
  );
}
