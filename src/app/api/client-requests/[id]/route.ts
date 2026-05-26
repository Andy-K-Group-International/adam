import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateClientRequest } from "@/lib/supabase/queries/client-requests";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import { sendClientRequestResponse } from "@/app/actions/email";
import type { ClientRequestStatus, ClientRequestPriority } from "@/lib/supabase/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);
  if (!user || !["admin", "staff"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { status, priority, admin_response } = body as {
    status?: ClientRequestStatus;
    priority?: ClientRequestPriority;
    admin_response?: string;
  };

  const patch: Parameters<typeof updateClientRequest>[2] = {};
  if (status !== undefined) patch.status = status;
  if (priority !== undefined) patch.priority = priority;
  if (admin_response !== undefined) {
    patch.admin_response = admin_response;
    patch.admin_responded_by = user.id;
    patch.admin_responded_at = new Date().toISOString();
  }

  const admin = createAdminClient();
  const updated = await updateClientRequest(admin, id, patch);

  if (admin_response && status && status !== "pending") {
    const clientData = updated.client;
    if (clientData?.contact_email) {
      sendClientRequestResponse({
        clientEmail: clientData.contact_email,
        clientName: clientData.contact_name,
        documentType: updated.document_type,
        adminResponse: admin_response,
        status,
      }).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}
