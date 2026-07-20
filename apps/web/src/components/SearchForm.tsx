"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({
  placeholder = "Tìm sản phẩm...",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/san-pham${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={onSearch}
      className="order-last w-full basis-full sm:order-none sm:mx-2 sm:w-auto sm:flex-1 sm:basis-auto"
    >
      <label htmlFor="header-search" className="sr-only">
        Tìm sản phẩm
      </label>
      <div className="flex w-full overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
        <input
          id="header-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          className="shrink-0 bg-accent px-3.5 text-sm font-semibold text-white hover:bg-accent-dark sm:px-4"
        >
          Tìm
        </button>
      </div>
    </form>
  );
}
