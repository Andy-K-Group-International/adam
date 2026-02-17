import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/auth0-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Validate webhook secret
    const webhookSecret = process.env.AUTH0_WEBHOOK_SECRET;
    const authHeader = request.headers.get("Authorization");
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const { auth0Id, email, firstName, lastName, imageUrl, role } = body;

      if (!auth0Id || !email || !firstName || !lastName) {
        return new Response("Missing required fields", { status: 400 });
      }

      const userId = await ctx.runMutation(api.users.upsert, {
        auth0Id,
        email,
        firstName,
        lastName,
        imageUrl,
        role: role || "client",
        accountStatus: "active",
      });

      // Link any questionnaires submitted with this email
      await ctx.runMutation(api.questionnaires.linkToUser, {
        email,
        userId,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Auth0 webhook error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Log the event for now
    console.log("Resend webhook event:", JSON.stringify(body));

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
