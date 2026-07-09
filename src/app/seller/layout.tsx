import { redirect } from "next/navigation";
import { getMySeller } from "@/app/actions/sellers";
import { signOut } from "@/app/actions/auth-signout";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getMySeller() reads through the sellers_select_own RLS policy
  // (get_my_role() = 'seller' AND auth_id = auth.uid()), so it already
  // returns null for anyone who isn't an authenticated, role='seller' user
  // with a linked sellers row — no separate role check needed here.
  const seller = await getMySeller();

  if (!seller) {
    redirect("/sign-in");
  }

  // auth_id is only ever set once registration completes (registerSeller
  // sets it together with status='pending_nda' in the same update), so an
  // authenticated seller can never actually be 'invited' here — this branch
  // is defensive only, kept for parity with the other statuses rather than
  // because it's reachable today.
  if (seller.status === "invited") {
    redirect("/seller-register");
  }
  if (seller.status === "pending_nda") {
    redirect("/seller-agreement");
  }
  if (seller.status === "suspended") {
    // /seller-agreement already renders the correct "account suspended"
    // message for this status — reused rather than building a second page.
    redirect("/seller-agreement");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-grid-300 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="gradient-text font-bold tracking-tight text-lg leading-none">A.D.A.M.</p>
            <p className="text-[10px] font-mono text-muted-2 uppercase tracking-[0.15em] mt-0.5">
              Seller Partner Portal
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted-2 hover:text-highlight transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-screen-xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
