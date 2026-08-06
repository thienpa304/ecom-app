"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { SearchSuggestItem } from "@/app/api/search-suggest/route";
import { SafeImage } from "@/components/SafeImage";
import { formatVnd } from "@/lib/format";

const SUGGEST_DEBOUNCE_MS = 250;
const SUGGEST_MIN_LENGTH = 2;
const PLACEHOLDER_ROTATE_MS = 3000;
const SUGGEST_LISTBOX_ID = "header-search-suggest";

const ROTATING_PLACEHOLDERS = [
  "máy rửa xe giá tốt lắm",
  "máy rửa xe giá siêu rẻ",
  "hãy điền mã rửa xe bạn muốn xem",
  "máy rửa xe cao áp giá rẻ nhất",
  "nhập mã máy bạn muốn xem giá",
];

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
  const [suggestQuery, setSuggestQuery] = useState("");
  const [items, setItems] = useState<SearchSuggestItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const formRef = useRef<HTMLFormElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const placeholders = useMemo(() => {
    const first = placeholder.trim() || "Tìm sản phẩm...";
    return [first, ...ROTATING_PLACEHOLDERS.filter((text) => text !== first)];
  }, [placeholder]);

  const activePlaceholder =
    placeholders[placeholderIndex % placeholders.length] ?? placeholder;

  useEffect(() => {
    setQ(urlQ);
    setSuggestQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  }, [urlQ]);

  useEffect(() => {
    if (placeholders.length < 2) return;
    if (q !== "" || isFocused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setPlaceholderIndex((current) => current + 1);
    }, PLACEHOLDER_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [placeholders, q, isFocused]);

  useEffect(() => {
    const query = suggestQuery.trim();

    if (query.length < SUGGEST_MIN_LENGTH) {
      abortRef.current?.abort();
      abortRef.current = null;
      setItems([]);
      setHasAnswered(false);
      setIsLoading(false);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timer = window.setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);

      fetch(`/api/search-suggest?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) return { items: [] as SearchSuggestItem[] };
          return (await res.json()) as { items?: SearchSuggestItem[] };
        })
        .then((payload) => {
          if (controller.signal.aborted) return;
          setItems(Array.isArray(payload.items) ? payload.items : []);
          setHasAnswered(true);
          setActiveIndex(-1);
          setIsOpen(true);
          setIsLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setItems([]);
          setHasAnswered(true);
          setIsLoading(false);
        });
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [suggestQuery]);

  useEffect(() => {
    if (!isOpen) return;

    function onMouseDown(event: MouseEvent) {
      if (formRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
      setActiveIndex(-1);
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  function goToProduct(item: SearchSuggestItem) {
    setIsOpen(false);
    setActiveIndex(-1);
    setSuggestQuery("");
    router.push(`/san-pham/${item.slug}`);
  }

  function submitSearch() {
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

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const highlighted =
      isOpen && activeIndex >= 0 ? items[activeIndex] : undefined;

    if (highlighted) {
      goToProduct(highlighted);
      return;
    }

    setIsOpen(false);
    setActiveIndex(-1);
    setSuggestQuery("");
    submitSearch();
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((current) => (current + 1) % items.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(items.length - 1);
        return;
      }
      setActiveIndex((current) =>
        current <= 0 ? items.length - 1 : current - 1,
      );
    }
  }

  function clear() {
    setQ("");
    setSuggestQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    if (!urlQ) return;
    const onCatalog = pathname.startsWith("/san-pham");
    if (!onCatalog) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    const qs = params.toString();
    router.push(`/san-pham${qs ? `?${qs}` : ""}`);
  }

  const showPanel = isOpen && (items.length > 0 || hasAnswered);

  return (
    <form
      ref={formRef}
      onSubmit={onSearch}
      className="relative min-w-0 flex-1"
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
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={SUGGEST_LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={
            showPanel && activeIndex >= 0
              ? `${SUGGEST_LISTBOX_ID}-option-${activeIndex}`
              : undefined
          }
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSuggestQuery(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={activePlaceholder}
          enterKeyHint="search"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-gray-900 outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
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

      <div
        id={SUGGEST_LISTBOX_ID}
        role="listbox"
        aria-label="Gợi ý sản phẩm"
        className={
          showPanel
            ? "absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
            : "hidden"
        }
      >
        {items.length === 0 ? (
          <p className="px-3 py-3 text-sm text-gray-500">
            Không tìm thấy sản phẩm nào
          </p>
        ) : (
          items.map((item, index) => (
            <button
              key={item.slug}
              id={`${SUGGEST_LISTBOX_ID}-option-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => goToProduct(item)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition ${
                index === activeIndex ? "bg-accent/5" : "hover:bg-gray-50"
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                {item.imageUrl ? (
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <SearchIcon className="h-4 w-4 text-gray-300" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-gray-900">
                  {item.name}
                </span>
                {item.model ? (
                  <span className="block truncate text-xs text-gray-500">
                    Mã {item.model}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm font-bold text-sale">
                {formatVnd(
                  item.salePrice != null && item.salePrice < item.price
                    ? item.salePrice
                    : item.price,
                )}
              </span>
            </button>
          ))
        )}
      </div>

      <span aria-live="polite" className="sr-only">
        {isLoading ? "Đang tìm gợi ý sản phẩm" : ""}
      </span>
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
