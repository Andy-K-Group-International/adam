"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAutoSave<T>(
  key: string,
  data: T,
  debounceMs: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [key, data]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, debounceMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [save, debounceMs]);

  const load = useCallback((): T | null => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }, [key]);

  return { load, clear };
}
