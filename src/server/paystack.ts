const PAYSTACK_BASE = "https://api.paystack.co";

type PaystackResponse<T> = { status: boolean; message: string; data: T };

async function paystackFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY.");

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const json = (await res.json()) as PaystackResponse<T>;
  if (!json.status) {
    throw new Error(json.message || "Paystack request failed");
  }
  return json.data;
}

export type PaystackBank = { name: string; code: string };

export async function listBanks(): Promise<PaystackBank[]> {
  return paystackFetch<PaystackBank[]>("/bank?country=nigeria");
}

export async function findBankCode(bankName: string): Promise<string> {
  const banks = await listBanks();
  const normalized = bankName.toLowerCase().trim();
  const match = banks.find(
    (b) =>
      b.name.toLowerCase() === normalized ||
      b.name.toLowerCase().includes(normalized) ||
      normalized.includes(b.name.toLowerCase()),
  );
  if (!match) {
    throw new Error(
      `Bank "${bankName}" not found. Use your bank's official name (e.g. GTBank, Access Bank).`,
    );
  }
  return match.code;
}

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) {
  return paystackFetch<{ recipient_code: string }>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: "NGN",
    }),
  });
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackFetch<{ authorization_url: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        amount: params.amountKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
      }),
    },
  );
}

export async function initiateTransfer(params: {
  amountKobo: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}) {
  return paystackFetch<{ transfer_code: string; reference: string }>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: params.amountKobo,
      recipient: params.recipientCode,
      reference: params.reference,
      reason: params.reason ?? "ClipNG clipper payout",
    }),
  });
}
