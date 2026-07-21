import { NextResponse } from "next/server";
import { listBanks } from "@/server/paystack";

export async function GET() {
  try {
    const banks = await listBanks();
    return NextResponse.json(banks);
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Could not load banks" },
      { status: 500 },
    );
  }
}
