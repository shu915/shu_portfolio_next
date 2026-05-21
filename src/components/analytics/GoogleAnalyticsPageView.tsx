"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Props = {
  gaId: string;
};

const GTAG_WAIT_MS = 50;
const GTAG_MAX_ATTEMPTS = 100;

function isGtagReady(): boolean {
  return typeof window.gtag === "function";
}

function sendPageView(gaId: string, pagePath: string) {
  if (!isGtagReady()) return;

  window.gtag!("config", gaId, {
    page_path: pagePath,
  });
}

/** gtag 初期化前に useEffect が走っても、準備完了まで再試行する */
function whenGtagReady(run: () => void): () => void {
  if (isGtagReady()) {
    run();
    return () => {};
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (isGtagReady()) {
      window.clearInterval(timer);
      run();
    } else if (attempts >= GTAG_MAX_ATTEMPTS) {
      window.clearInterval(timer);
    }
  }, GTAG_WAIT_MS);

  return () => window.clearInterval(timer);
}

/** App Router のクライアント遷移ごとに page_view を送信 */
export function GoogleAnalyticsPageView({ gaId }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    return whenGtagReady(() => {
      sendPageView(gaId, pagePath);
    });
  }, [gaId, pathname, searchParams]);

  return null;
}
