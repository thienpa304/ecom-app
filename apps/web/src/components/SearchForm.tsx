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
          placeholder={placeholder}
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
  );
}
