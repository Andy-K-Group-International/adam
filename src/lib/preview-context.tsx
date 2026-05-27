"use client";

import { createContext, useContext } from "react";

export interface PreviewContextValue {
  isPreview: boolean;
  previewClientId: string | null;
  previewClientName: string | null;
}

export const PreviewContext = createContext<PreviewContextValue>({
  isPreview: false,
  previewClientId: null,
  previewClientName: null,
});

export function usePreviewContext(): PreviewContextValue {
  return useContext(PreviewContext);
}
