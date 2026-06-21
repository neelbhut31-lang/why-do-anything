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

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
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
    if (typeof payload.userId !== "string") return null;
    return db.user.findUnique({ where: { id: payload.userId } });
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
  const normalizedEmail = email.toLowerCase();
  let user = await db.user.findUnique({ where: { email: normalizedEmail } });

  // Creates the first administrator from private deployment settings.
  if (
    !user &&
    normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase() &&
    process.env.ADMIN_PASSWORD
  ) {
    user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      },
    });
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return user;
}
