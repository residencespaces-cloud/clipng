import { SignJWT, jwtVerify } from "jose";

function emailSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  return new TextEncoder().encode(secret ?? "dev-access-secret-change-me-32chars");
}

export async function signEmailActionToken(
  purpose: "verify_email" | "reset_password",
  userId: string,
  email: string,
  expiresIn: string,
) {
  return new SignJWT({ purpose, email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(emailSecret());
}

export async function verifyEmailActionToken(
  token: string,
  purpose: "verify_email" | "reset_password",
) {
  const { payload } = await jwtVerify(token, emailSecret());
  if (payload.purpose !== purpose || !payload.sub || typeof payload.email !== "string") {
    throw new Error("Invalid or expired link");
  }
  return { userId: payload.sub, email: payload.email };
}
