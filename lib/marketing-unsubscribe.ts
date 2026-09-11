import "server-only";

import crypto from "node:crypto";

import { getAdminDb } from "@/lib/adminDb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanMarketingEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  return EMAIL_REGEX.test(email) ? email : "";
}

function unsubscribeSecret() {
  return String(process.env.MARKETING_UNSUBSCRIBE_SECRET || "");
}

export function verifyMarketingUnsubscribeToken(
  ownerClerkId: string,
  email: string,
  token: string,
) {
  const secret = unsubscribeSecret();
  if (!secret || !ownerClerkId || !email || !token) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ownerClerkId}:${email.toLowerCase()}`)
    .digest("hex");

  if (expected.length !== token.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(token, "utf8"),
  );
}

export async function suppressMarketingEmail({
  ownerClerkId,
  email,
}: {
  ownerClerkId: string;
  email: string;
}) {
  const db = await getAdminDb();
  const now = new Date();

  await db.collection("marketingsuppressions").updateOne(
    {
      ownerClerkId,
      emailLower: email.toLowerCase(),
    },
    {
      $set: {
        reason: "UNSUBSCRIBE",
        updatedAt: now,
      },
      $setOnInsert: {
        ownerClerkId,
        emailLower: email.toLowerCase(),
        createdAt: now,
      },
    },
    { upsert: true },
  );
}
