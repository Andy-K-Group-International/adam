"use client";

import { useEffect, useState, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { PreviewContext } from "@/lib/preview-context";
import type { User } from "@/lib/supabase/types";

interface CurrentUser {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  role: string | null;
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  clientId: string | null;
}

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isPreview, previewClientId } = useContext(PreviewContext);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", authUser.id)
          .single();

        if (profileError) {
          setError(profileError.message);
          setIsLoading(false);
          return;
        }

        setUser(profile as User);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
        } else {
          fetchUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // In preview mode, overlay the preview client's ID onto the admin user
  const effectiveUser =
    user && isPreview && previewClientId
      ? { ...user, client_id: previewClientId }
      : user;

  return {
    user: effectiveUser,
    isLoading,
    error,
    role: effectiveUser?.role ?? null,
    isAdmin: effectiveUser?.role === "admin",
    isStaff: effectiveUser?.role === "staff",
    isClient: effectiveUser?.role === "client",
    clientId: effectiveUser?.client_id ?? null,
  };
}
