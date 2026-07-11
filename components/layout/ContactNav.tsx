"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function ContactNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="https://wa.me/2348164758649" className="text-lg font-bold text-paper bg-wine-950 px-3 py-2 rounded-md">
          Report an issue
        </Link>
      </nav>
    </header>
  );
}