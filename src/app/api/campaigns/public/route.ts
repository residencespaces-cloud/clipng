import { NextResponse } from "next/server";
import { listPublic } from "@/server/services/campaigns.service";

export async function GET() {
  const campaigns = await listPublic(8);
  return NextResponse.json(campaigns);
}
