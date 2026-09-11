import "server-only";

import { getAdminDb } from "@/lib/adminDb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanEmail(value: unknown) {
  const email = String(value || "").trim().toLowerCase();
  return EMAIL_REGEX.test(email) ? email : "";
}

function cleanFirstName(value: unknown) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export async function subscribeToMarketing({
  email,
  firstName,
  source,
}: {
  email: unknown;
  firstName?: unknown;
  source?: string;
}) {
  const emailLower = cleanEmail(email);
  if (!emailLower) {
    return {
      ok: false as const,
      message: "Saisissez une adresse e-mail valide.",
    };
  }

  const db = await getAdminDb();
  const now = new Date();
  const previous = await db.collection("marketingsubscribers").findOne({ emailLower });

  // A fresh, explicit subscription overrides a previous marketing unsubscribe.
  // Other future suppression reasons (bounce/complaint) remain untouched.
  const suppressionResult = await db.collection("marketingsuppressions").deleteMany({
    emailLower,
    reason: "UNSUBSCRIBE",
  });

  const name = cleanFirstName(firstName);
  await db.collection("marketingsubscribers").updateOne(
    { emailLower },
    {
      $set: {
        emailLower,
        email: emailLower,
        ...(name ? { firstName: name } : {}),
        marketingConsent: true,
        status: "SUBSCRIBED",
        source: source || "NEWSLETTER_FORM",
        consentAt: now,
        subscribedAt: now,
        updatedAt: now,
      },
      $unset: {
        unsubscribedAt: "",
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  const wasResubscribed = suppressionResult.deletedCount > 0 || previous?.status === "UNSUBSCRIBED";
  const alreadySubscribed =
    !wasResubscribed && previous?.status === "SUBSCRIBED" && previous?.marketingConsent === true;

  return {
    ok: true as const,
    status: wasResubscribed
      ? ("RESUBSCRIBED" as const)
      : alreadySubscribed
        ? ("ALREADY_SUBSCRIBED" as const)
        : ("SUBSCRIBED" as const),
    message: wasResubscribed
      ? "Votre inscription est réactivée. Bienvenue à nouveau dans le Grind."
      : alreadySubscribed
        ? "Cette adresse est déjà inscrite à la newsletter Milos BG."
        : "Inscription confirmée. Bienvenue dans le Grind.",
  };
}
