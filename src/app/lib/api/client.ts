const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export type ApiTokens = { accessToken: string; refreshToken: string };

let memoryTokens: ApiTokens | null = null;

export function setTokens(tokens: ApiTokens | null) {
  memoryTokens = tokens;
  if (typeof window !== 'undefined') {
    if (tokens) {
      localStorage.setItem('clipng_tokens', JSON.stringify(tokens));
      document.cookie = 'clipng_session=1; path=/; max-age=604800; SameSite=Lax';
    } else {
      localStorage.removeItem('clipng_tokens');
      document.cookie = 'clipng_session=; path=/; max-age=0';
    }
  }
}

export function getTokens(): ApiTokens | null {
  if (memoryTokens) return memoryTokens;
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('clipng_tokens');
  if (!raw) return null;
  try {
    memoryTokens = JSON.parse(raw) as ApiTokens;
    return memoryTokens;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  if (!res.ok) {
    setTokens(null);
    return null;
  }
  const next = (await res.json()) as ApiTokens;
  setTokens(next);
  return next.accessToken;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const tokens = getTokens();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (tokens?.accessToken) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`);
  }

  let res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && tokens?.refreshToken) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set('Authorization', `Bearer ${newAccess}`);
      res = await fetch(`${API_BASE}${path}`, { ...init, headers });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const raw = err.message ?? err.error ?? res.statusText;
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw || "Request failed");
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function publicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      apiFetch<ApiTokens>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    signupClipper: (body: Record<string, string>) =>
      apiFetch<ApiTokens>('/auth/signup/clipper', { method: 'POST', body: JSON.stringify(body) }),
    signupFunder: (body: Record<string, string>) =>
      apiFetch<ApiTokens>('/auth/signup/funder', { method: 'POST', body: JSON.stringify(body) }),
    me: () => apiFetch<{
      id: string;
      email: string;
      role: string;
      name: string;
      bankName?: string;
      accountNumber?: string;
      businessName?: string;
      phone?: string;
    }>('/auth/me'),
    logout: () => {
      const tokens = getTokens();
      if (tokens?.refreshToken) {
        return apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
      return Promise.resolve({ success: true });
    },
  },
  profile: {
    updateClipper: (body: { bankCode: string; bankName: string; accountNumber: string }) =>
      apiFetch('/profile/clipper', { method: 'PATCH', body: JSON.stringify(body) }),
    updateFunder: (body: { businessName: string; phone?: string }) =>
      apiFetch('/profile/funder', { method: 'PATCH', body: JSON.stringify(body) }),
  },
  banks: {
    list: () => publicFetch<{ name: string; code: string }[]>('/banks'),
    resolve: (bankCode: string, accountNumber: string) =>
      publicFetch<{ accountNumber: string; accountName: string }>('/banks/resolve', {
        method: 'POST',
        body: JSON.stringify({ bankCode, accountNumber }),
      }),
  },
  campaigns: {
    public: () => publicFetch<import('@/app/types').Campaign[]>('/campaigns/public'),
    live: () => apiFetch<import('@/app/types').Campaign[]>('/campaigns/live'),
    my: () => apiFetch<import('@/app/types').Campaign[]>('/campaigns/my'),
    create: (body: Record<string, unknown>) =>
      apiFetch<import('@/app/types').Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(body) }),
    join: (id: string) =>
      apiFetch<{ verificationCode: string }>(`/campaigns/${id}/join`, { method: 'POST' }),
  },
  wallet: {
    balance: () => apiFetch<{ balance: number; escrow: number }>('/wallet'),
    transactions: () => apiFetch<import('@/app/types').WalletTransaction[]>('/wallet/transactions'),
    initiateTopUp: (amount: number) =>
      apiFetch<{ reference: string; authorizationUrl: string }>('/wallet/topups/initiate', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }),
  },
  submissions: {
    create: (body: Record<string, unknown>) =>
      apiFetch('/submissions', { method: 'POST', body: JSON.stringify(body) }),
    mine: () => apiFetch<import('@/app/types').MyClip[]>('/submissions/me'),
    earnings: () => apiFetch<import('@/app/types').EarningsSummary>('/earnings/me'),
  },
  admin: {
    pending: () => apiFetch('/admin/submissions/pending'),
    awaitingViews: () => apiFetch('/admin/submissions/awaiting-views'),
    readyForPayout: () => apiFetch('/admin/payouts/ready'),
    approve: (id: string, codeVerified: boolean) =>
      apiFetch(`/admin/submissions/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ codeVerified }),
      }),
    reject: (id: string, reason?: string) =>
      apiFetch(`/admin/submissions/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    verifyViews: (id: string, viewCount: number) =>
      apiFetch(`/admin/submissions/${id}/verify-views`, {
        method: 'POST',
        body: JSON.stringify({ viewCount }),
      }),
    triggerPayout: (id: string) =>
      apiFetch(`/admin/payouts/${id}/trigger`, { method: 'POST' }),
    campaigns: () => apiFetch<import('@/app/types').Campaign[]>('/admin/campaigns'),
    payouts: () => apiFetch<import('@/app/types').Payout[]>('/admin/payouts'),
    auditLogs: () => apiFetch<import('@/app/types').AuditLog[]>('/admin/audit-logs'),
  },
};
