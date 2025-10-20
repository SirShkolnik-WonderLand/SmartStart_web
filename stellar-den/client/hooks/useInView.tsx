import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number | number[];
  margin?: string;
}

export function useInView(
  options: UseInViewOptions = { threshold: 0.1, margin: "0px" }
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, {
      threshold: options.threshold,
      rootMargin: options.margin,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.threshold, options.margin]);

  return { ref, isInView };
}
