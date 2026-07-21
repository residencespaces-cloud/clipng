"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { onNavigationStart } from "@/app/lib/page-transition";
import { PageLoader } from "./PageLoader";

const MIN_VISIBLE_MS = 380;

function isInternalNavigation(href: string, currentPath: string) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    const next = url.pathname + url.search;
    return next !== currentPath;
  } catch {
    return false;
  }
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const shownAt = useRef(0);
  const prevRouteKey = useRef(routeKey);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const safetyTimer = useRef<ReturnType<typeof setTimeout>>();

  const startLoading = useCallback(() => {
    shownAt.current = Date.now();
    loadingRef.current = true;
    setLoading(true);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => {
      if (!loadingRef.current) return;
      loadingRef.current = false;
      setLoading(false);
    }, 15000);
  }, []);

  useEffect(() => onNavigationStart(startLoading), [startLoading]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const current = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      if (isInternalNavigation(href, current)) startLoading();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, searchParams, startLoading]);

  useEffect(() => {
    if (prevRouteKey.current === routeKey) return;

    const wasNavigating = loadingRef.current;
    prevRouteKey.current = routeKey;

    if (!wasNavigating) return;

    const elapsed = Date.now() - shownAt.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    hideTimer.current = setTimeout(() => {
      loadingRef.current = false;
      setLoading(false);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    }, remaining);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [routeKey]);

  useEffect(() => {
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  return (
    <>
      <PageLoader visible={loading} />
      {children}
    </>
  );
}
