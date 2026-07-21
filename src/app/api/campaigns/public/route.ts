import { NextResponse } from "next/server";
import { listLive } from "@/server/services/campaigns.service";

export async function GET() {
  const campaigns = await listLive();
  return NextResponse.json(campaigns.slice(0, 8));
}
