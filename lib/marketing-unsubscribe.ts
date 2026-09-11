import "server-only";

import crypto from "node:crypto";

import { getAdminDb } from "@/lib/adminDb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanMarketingEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  return EMAIL_REGEX.test(email) ? email : "";
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type MarketingUnsubscribeTokenRecord = {
  valid: boolean;
  preview: boolean;
};

export async function getMarketingUnsubscribeTokenRecord(
  ownerClerkId: string,
  email: string,
  token: string,
): Promise<MarketingUnsubscribeTokenRecord> {
  const normalizedEmail = cleanMarketingEmail(email);
  if (!ownerClerkId || !normalizedEmail || !token) {
    return { valid: false, preview: false };
  }

  const db = await getAdminDb();
  const row = await db.collection("marketingunsubscribetokens").findOne({
    ownerClerkId,
    emailLower: normalizedEmail,
    tokenHash: hashToken(token),
  });

  if (!row) return { valid: false, preview: false };

  return {
    valid: true,
    preview: Boolean(row.preview),
  };
}

export async function markMarketingUnsubscribeTokenUsed({
  ownerClerkId,
  email,
  token,
}: {
  ownerClerkId: string;
  email: string;
  token: string;
}) {
  const normalizedEmail = cleanMarketingEmail(email);
  if (!ownerClerkId || !normalizedEmail || !token) return;

  const db = await getAdminDb();
  await db.collection("marketingunsubscribetokens").updateOne(
    {
      ownerClerkId,
      emailLower: normalizedEmail,
      tokenHash: hashToken(token),
    },
    { $set: { usedAt: new Date(), updatedAt: new Date() } },
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

  const emailLower = email.toLowerCase();

  await db.collection("marketingsuppressions").updateOne(
    {
      ownerClerkId,
      emailLower,
    },
    {
      $set: {
        reason: "UNSUBSCRIBE",
        updatedAt: now,
      },
      $setOnInsert: {
        ownerClerkId,
        emailLower,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  // Keep the newsletter source-of-truth aligned with the suppression list.
  await db.collection("marketingsubscribers").updateOne(
    { emailLower },
    {
      $set: {
        marketingConsent: false,
        status: "UNSUBSCRIBED",
        unsubscribedAt: now,
        updatedAt: now,
      },
    },
  );
}
