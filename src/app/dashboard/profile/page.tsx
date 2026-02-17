"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { User, Mail } from "lucide-react";

export default function ProfilePage() {
  const user = useQuery(api.users.getCurrent);

  if (user === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted mt-1">Your account information.</p>
      </div>

      <div className="bg-white rounded-xl border border-grid-300 p-6 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-highlight/10 flex items-center justify-center">
            <User className="h-7 w-7 text-highlight" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-muted-2">{user.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-2" />
            <span className="text-foreground">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
