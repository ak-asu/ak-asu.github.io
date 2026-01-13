import { useState, useEffect } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "reduce motion" in their system settings
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Create event handler
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Listen for changes
    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}
