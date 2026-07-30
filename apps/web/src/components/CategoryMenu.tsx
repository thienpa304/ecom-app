"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Category } from "@ecom/shared";

type CategoryMenuProps = {
  categories: Category[];
};

type CategoryNode = {
  category: Category;
  children: Category[];
};

const ALL_PRODUCTS_HREF = "/san-pham";

function categoryHref(slug: string): string {
  return `/danh-muc/${slug}`;
}

function byOrderThenName(a: Category, b: Category): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "vi");
}

export function CategoryMenu({ categories }: CategoryMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tree = useMemo<CategoryNode[]>(() => {
    const roots = categories
      .filter((c) => c.parentId === null)
      .sort(byOrderThenName);

    return roots.map((category) => ({
      category,
      children: categories
        .filter((c) => c.parentId === category.id)
        .sort(byOrderThenName),
    }));
  }, [categories]);

  const hasCategories = tree.length > 0;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (drawerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 640px)").matches) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!hasCategories) {
    return (
      <Link
        href={ALL_PRODUCTS_HREF}
        aria-label="Danh sách sản phẩm"
        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-semibold text-gray-800 transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-3.5"
      >
        <MenuIcon className="h-5 w-5 shrink-0" />
        <span className="hidden whitespace-nowrap sm:inline">
          Danh sách sản phẩm
        </span>
      </Link>
    );
  }

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Danh sách sản phẩm"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 text-sm font-semibold text-gray-800 transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-3.5"
      >
        <MenuIcon className="h-5 w-5 shrink-0" />
        <span className="hidden whitespace-nowrap sm:inline">
          Danh sách sản phẩm
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Danh sách sản phẩm"
          className="absolute left-0 top-full z-50 mt-2 hidden max-h-[70vh] w-72 overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl sm:block"
        >
          <CategoryList tree={tree} onNavigate={close} />
        </div>
      ) : null}

      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[60] sm:hidden">
              <button
                type="button"
                aria-label="Đóng danh mục"
                onClick={close}
                className="absolute inset-0 h-full w-full cursor-default bg-black/50"
              />
              <div
                ref={drawerRef}
                role="menu"
                aria-label="Danh sách sản phẩm"
                className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3">
                  <span className="text-sm font-bold text-gray-900">
                    Danh sách sản phẩm
                  </span>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Đóng danh mục"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
                  <CategoryList tree={tree} onNavigate={close} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function CategoryList({
  tree,
  onNavigate,
}: {
  tree: CategoryNode[];
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col">
      {tree.map(({ category, children }) => (
        <div key={category.id}>
          <Link
            href={categoryHref(category.slug)}
            role="menuitem"
            onClick={onNavigate}
            className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="min-w-0 truncate">{category.name}</span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-accent" />
          </Link>

          {children.length ? (
            <div className="mb-1 flex flex-col border-l border-gray-100 pl-3 ml-4">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={categoryHref(child.slug)}
                  role="menuitem"
                  onClick={onNavigate}
                  className="truncate rounded-md px-2 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ))}

      <div className="mt-1 border-t border-gray-100 pt-1">
        <Link
          href={ALL_PRODUCTS_HREF}
          role="menuitem"
          onClick={onNavigate}
          className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Xem tất cả sản phẩm →
        </Link>
      </div>
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
