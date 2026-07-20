"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function SearchForm({
  placeholder = "Tìm sản phẩm...",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQ);

  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    const onCatalog = pathname.startsWith("/san-pham");
    const params = onCatalog
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();

    if (query) params.set("q", query);
    else params.delete("q");
    params.delete("page");

    const qs = params.toString();
    router.push(`/san-pham${qs ? `?${qs}` : ""}`);
  }

  function clear() {
    setQ("");
    if (!urlQ) return;
    const onCatalog = pathname.startsWith("/san-pham");
    if (!onCatalog) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    const qs = params.toString();
    router.push(`/san-pham${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={onSearch}
      className="order-last w-full basis-full sm:order-none sm:mx-2 sm:w-auto sm:flex-1 sm:basis-auto"
      role="search"
    >
      <label htmlFor="header-search" className="sr-only">
        Tìm sản phẩm
      </label>
      <div className="flex h-10 w-full items-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 focus-within:border-accent focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/20 sm:h-11 sm:rounded-lg">
        <span className="pl-3 text-gray-400" aria-hidden>
          <SearchIcon className="h-4 w-4" />
        </span>
        <input
          id="header-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {q ? (
          <button
            type="button"
            onClick={clear}
            className="mr-0.5 inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            aria-label="Xóa tìm kiếm"
          >
            <ClearIcon className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="m-0.5 mr-1 flex h-8 shrink-0 items-center justify-center rounded-full bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-dark sm:h-9 sm:rounded-md sm:px-4"
        >
          <span className="sm:hidden">
            <SearchIcon className="h-4 w-4" />
            <span className="sr-only">Tìm</span>
          </span>
          <span className="hidden sm:inline">Tìm</span>
        </button>
      </div>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
