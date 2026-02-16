import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
    .unique();
  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  roles: ("admin" | "staff" | "client")[]
) {
  const user = await requireAuth(ctx);
  if (!roles.includes(user.role)) throw new Error("Insufficient permissions");
  return user;
}
