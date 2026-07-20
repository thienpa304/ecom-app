"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type HeaderProps = {
  siteName: string;
  phone: string;
  searchPlaceholder?: string;
};

export function Header({
  siteName,
  phone,
  searchPlaceholder = "Tìm sản phẩm...",
}: HeaderProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const tel = phone.replace(/\D/g, "");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/san-pham${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-page flex flex-wrap items-center gap-3 py-3 sm:gap-4">
        <Link
          href="/"
          className="max-w-[12rem] text-base font-extrabold leading-tight tracking-tight text-gray-900 sm:max-w-none sm:text-xl"
        >
          {siteName}
        </Link>

        <form
          onSubmit={onSearch}
          className="order-3 flex w-full flex-1 basis-full sm:order-none sm:basis-auto sm:px-4"
        >
          <label htmlFor="header-search" className="sr-only">
            Tìm sản phẩm
          </label>
          <div className="flex w-full overflow-hidden rounded-md border border-gray-300 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <input
              id="header-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Tìm
            </button>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/san-pham"
            className="hidden text-sm font-medium text-gray-700 hover:text-accent sm:inline"
          >
            Sản phẩm
          </Link>
          <a
            href={`tel:${tel}`}
            className="btn-primary whitespace-nowrap text-xs sm:text-sm"
          >
            Gọi {phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
