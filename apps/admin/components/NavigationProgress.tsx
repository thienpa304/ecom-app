"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Top bar on internal link / menu navigation so soft nav doesn't feel idle. */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActive(false);
    if (timer.current) clearTimeout(timer.current);
  }, [pathname, searchParams]);

  useEffect(() => {
    function start() {
      setActive(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(false), 8000);
    }

    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const el = (e.target as HTMLElement | null)?.closest("a");
      if (!el) return;
      const href = el.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:")
      ) {
        return;
      }
      if (el.target && el.target !== "_self") return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const next = url.pathname + url.search;
        const current = window.location.pathname + window.location.search;
        if (next === current) return;
        start();
      } catch {
        /* ignore */
      }
    }

    function onNavStart() {
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("admin:navstart", onNavStart);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("admin:navstart", onNavStart);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="admin-nav-progress"
      role="progressbar"
      aria-label="Đang chuyển trang"
      aria-busy="true"
    >
      <div className="admin-nav-progress-bar" />
    </div>
  );
}

export function startAdminNavigation() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin:navstart"));
  }
}
