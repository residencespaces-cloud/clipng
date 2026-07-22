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

export type PaystackBank = { name: string; code: string; slug?: string };

const DEV_BANKS: PaystackBank[] = [
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Access Bank", code: "044" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "United Bank For Africa", code: "033" },
];

export async function listBanks(): Promise<PaystackBank[]> {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return DEV_BANKS;
  }
  const banks = await paystackFetch<PaystackBank[]>("/bank?country=nigeria");
  return banks.sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveAccountNumber(accountNumber: string, bankCode: string) {
  const acct = accountNumber.replace(/\D/g, "");
  if (acct.length !== 10) {
    throw new Error("Enter a valid 10-digit account number.");
  }
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return { account_number: acct, account_name: "Test Account (dev mode)" };
  }
  return paystackFetch<{ account_number: string; account_name: string }>(
    `/bank/resolve?account_number=${encodeURIComponent(acct)}&bank_code=${encodeURIComponent(bankCode)}`,
  );
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
      reason: params.reason ?? "KudiClip clipper payout",
    }),
  });
}
