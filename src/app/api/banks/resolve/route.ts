import { NextResponse } from "next/server";
import { resolveAccountNumber } from "@/server/paystack";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bankCode = String(body.bankCode ?? "").trim();
    const accountNumber = String(body.accountNumber ?? "").trim();
    if (!bankCode || !accountNumber) {
      return NextResponse.json({ message: "Bank and account number are required" }, { status: 400 });
    }
    const data = await resolveAccountNumber(accountNumber, bankCode);
    return NextResponse.json({
      accountNumber: data.account_number,
      accountName: data.account_name,
    });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Could not resolve account" },
      { status: 400 },
    );
  }
}
