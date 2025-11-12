import { useEffect, useRef } from "react";

type TrackArticleCta = (cta: string) => void;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitEvent(eventName: string, properties: Record<string, unknown>) {
  if (!isBrowser()) return;

  let attempts = 0;
  const maxAttempts = 25;

  const attemptEmit = () => {
    const analytics = (window as any).analyticsHub;
    if (analytics && typeof analytics.trackEvent === "function") {
      analytics.trackEvent(eventName, properties);
      return;
    }

    if (attempts < maxAttempts) {
      attempts += 1;
      window.setTimeout(attemptEmit, 200);
    }
  };

  attemptEmit();
}

export function useArticleAnalytics(articleSlug: string): { trackArticleCta: TrackArticleCta } {
  const hasTrackedScrollRef = useRef(false);

  useEffect(() => {
    emitEvent("article_open", { article: articleSlug });
  }, [articleSlug]);

  useEffect(() => {
    if (!isBrowser()) return;

    const handleScroll = () => {
      if (hasTrackedScrollRef.current) return;

      const root = document.documentElement;
      const scrollTop = root.scrollTop || document.body.scrollTop;
      const maxScroll = root.scrollHeight - root.clientHeight;
      const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;

      if (ratio >= 0.75) {
        hasTrackedScrollRef.current = true;
        emitEvent("article_scroll_75", { article: articleSlug });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleSlug]);

  const trackArticleCta: TrackArticleCta = (cta) => {
    emitEvent("article_cta_click", { article: articleSlug, cta });
  };

  return { trackArticleCta };
}



