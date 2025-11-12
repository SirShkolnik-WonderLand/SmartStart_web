import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics-tracker";

type TrackArticleCta = (cta: string) => void;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function useArticleAnalytics(articleSlug: string): { trackArticleCta: TrackArticleCta } {
  const hasTrackedScrollRef = useRef(false);

  useEffect(() => {
    if (!isBrowser()) return;
    trackEvent("article_open", { article: articleSlug });
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
        trackEvent("article_scroll_75", { article: articleSlug });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [articleSlug]);

  const trackArticleCta: TrackArticleCta = (cta) => {
    if (!isBrowser()) return;
    trackEvent("article_cta_click", { article: articleSlug, cta });
  };

  return { trackArticleCta };
}


