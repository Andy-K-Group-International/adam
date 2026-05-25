import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("users").select("id").limit(1);

  if (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok", timestamp: new Date() });
}
