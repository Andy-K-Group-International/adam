import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  allowInsecureRequests: process.env.NODE_ENV !== "production",

  async onCallback(error, context, session) {
    if (error) {
      console.error("Auth0 callback error:", error);
      return NextResponse.redirect(
        new URL("/", process.env.APP_BASE_URL!)
      );
    }

    // Sync user to Convex after login
    if (session) {
      const user = session.user;
      try {
        const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
        if (convexSiteUrl) {
          await fetch(`${convexSiteUrl}/sync-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auth0Id: user.sub,
              email: user.email,
              firstName: user.given_name || user.name?.split(" ")[0] || "",
              lastName:
                user.family_name ||
                user.name?.split(" ").slice(1).join(" ") ||
                "",
              imageUrl: user.picture,
            }),
          });
        }
      } catch (err) {
        // Don't block login if sync fails
        console.error("Failed to sync user to Convex:", err);
      }
    }

    return NextResponse.redirect(
      new URL(context.returnTo || "/", process.env.APP_BASE_URL!)
    );
  },
});
