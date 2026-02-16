"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export function useCurrentUser() {
  const { user, error, isLoading } = useUser();

  return {
    user: user
      ? {
          email: user.email as string,
          name: user.name as string,
          picture: user.picture as string,
          sub: user.sub as string,
          role:
            (user["https://adam.andykgroupinternational.com/role"] as string) ||
            "client",
        }
      : null,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin:
      user?.["https://adam.andykgroupinternational.com/role"] === "admin",
    isStaff:
      user?.["https://adam.andykgroupinternational.com/role"] === "staff",
    isClient:
      !user?.["https://adam.andykgroupinternational.com/role"] ||
      user?.["https://adam.andykgroupinternational.com/role"] === "client",
  };
}
