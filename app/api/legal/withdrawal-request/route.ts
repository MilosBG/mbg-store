import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";

export const dynamic = "force-dynamic";

type Lang = "en" | "fr";

type Payload = {
  lang: Lang;
  firstName: string;
  lastName: string;
  email: string;
  orderNumber: string;
  orderedAt: string;
  receivedAt: string;
  products: string;
  customerAddress: string;
  message: string;
};

function clean(value: unknown, max: number) {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

function normalizeLang(value: unknown): Lang {
  return value === "fr" ? "fr" : "en";
}

function reference() {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  return `MBG-WD-${date}-${crypto.randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

async function sendReceipt(
  payload: Payload,
  ref: string,
  receivedAt: Date,
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.WITHDRAWAL_FROM_EMAIL?.trim();

  if (!apiKey || !from) return false;

  const isFr = payload.lang === "fr";

  const subject = isFr
    ? `Milos BG — Demande de rétractation ${ref}`
    : `Milos BG — Withdrawal request ${ref}`;

  const text = isFr
    ? [
        "Votre demande de rétractation a été reçue par Milos BG.",
        `Référence : ${ref}`,
        `Reçue le : ${receivedAt.toISOString()}`,
        `Commande : ${payload.orderNumber}`,
        `Produit(s) : ${payload.products}`,
        `Nom : ${payload.firstName} ${payload.lastName}`,
        `Email : ${payload.email}`,
        `Adresse : ${payload.customerAddress}`,
        "",
        "Conservez cet email comme accusé de réception de votre demande.",
      ].join("\n")
    : [
        "Withdrawal request received by Milos BG.",
        `Reference: ${ref}`,
        `Received: ${receivedAt.toISOString()}`,
        `Order: ${payload.orderNumber}`,
        `Product(s): ${payload.products}`,
        `Name: ${payload.firstName} ${payload.lastName}`,
        `Email: ${payload.email}`,
        `Address: ${payload.customerAddress}`,
        "",
        "Keep this email as acknowledgement of your request.",
      ].join("\n");

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.email],
        bcc: [
          process.env.WITHDRAWAL_BCC_EMAIL?.trim() ||
            "contact@milos-bg.com",
        ],
        subject,
        text,
      }),
    },
  );

  return response.ok;
}

export async function POST(request: Request) {
  const raw: unknown = await request
    .json()
    .catch(() => null);

  if (!raw || typeof raw !== "object") {
    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  const body = raw as Record<string, unknown>;
  const lang = normalizeLang(body.lang);

  const payload: Payload = {
    lang,
    firstName: clean(body.firstName, 100),
    lastName: clean(body.lastName, 100),
    email: clean(body.email, 320).toLowerCase(),
    orderNumber: clean(body.orderNumber, 100),
    orderedAt: clean(body.orderedAt, 20),
    receivedAt: clean(body.receivedAt, 20),
    products: clean(body.products, 2000),
    customerAddress: clean(body.customerAddress, 1200),
    message: clean(body.message, 2000),
  };

  if (
    !payload.firstName ||
    !payload.lastName ||
    !payload.email ||
    !payload.orderNumber ||
    !payload.products ||
    !payload.customerAddress
  ) {
    return NextResponse.json(
      {
        error:
          lang === "fr"
            ? "Veuillez compléter tous les champs obligatoires."
            : "Please complete all required fields.",
      },
      {
        status: 400,
      },
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
    return NextResponse.json(
      {
        error:
          lang === "fr"
            ? "Adresse email invalide."
            : "Invalid email address.",
      },
      {
        status: 400,
      },
    );
  }

  await connectToDB();

  const db = mongoose.connection.db;

  if (!db) {
    return NextResponse.json(
      {
        error:
          lang === "fr"
            ? "Base de données indisponible."
            : "Database unavailable.",
      },
      {
        status: 503,
      },
    );
  }

  const ref = reference();
  const receivedAt = new Date();

  await db
    .collection("withdrawal_requests")
    .insertOne({
      ...payload,
      reference: ref,
      status: "RECEIVED",
      submittedAt: receivedAt,
      source: "WEB_WITHDRAWAL_PAGE",
    });

  const emailSent = await sendReceipt(
    payload,
    ref,
    receivedAt,
  ).catch((error) => {
    console.error(
      "[WITHDRAWAL] Receipt email failed",
      error,
    );

    return false;
  });

  return NextResponse.json({
    reference: ref,
    receivedAt: receivedAt.toISOString(),
    emailSent,
  });
}
