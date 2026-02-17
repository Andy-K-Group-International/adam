"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ReactNode, useCallback, useMemo } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

function useAuth0ConvexAuth() {
  const { user, isLoading } = useUser();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      try {
        const response = await fetch("/api/auth/token");
        if (!response.ok) return null;
        const data = await response.json();
        return data.token ?? null;
      } catch {
        return null;
      }
    },
    []
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [isLoading, user, fetchAccessToken]
  );
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuth0ConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
