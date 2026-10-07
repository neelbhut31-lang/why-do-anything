import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "wda_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "development-only-secret-change-before-production",
);

export async function createSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return { id: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}

export async function verifyCredentials(email: string, password: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    let user = await db.user.findUnique({ where: { email: normalizedEmail } });

    // Creates administrator if database has no entry for this email yet
    if (!user) {
      const targetEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
      const targetPassword = process.env.ADMIN_PASSWORD || "change-me";
      if (normalizedEmail === targetEmail) {
        user = await db.user.create({
          data: {
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(targetPassword, 12),
          },
        });
      }
    }

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
    return user;
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return null;
  }
}
