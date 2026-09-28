import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import { isAuthorizedAdminService } from "@/lib/withdrawals/admin-service-auth";

export const dynamic = "force-dynamic";

const WITHDRAWAL_STATUSES = [
  "RECEIVED",
  "REVIEWING",
  "RETURN_EXPECTED",
  "RETURN_RECEIVED",
  "ACCEPTED",
  "REFUSED",
  "CLOSED",
] as const;

const REFUND_STATUSES = [
  "NOT_STARTED",
  "PENDING",
  "PARTIAL",
  "REFUNDED",
  "FAILED",
  "NOT_REQUIRED",
] as const;

type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];
type RefundStatus = (typeof REFUND_STATUSES)[number];

type WithdrawalDoc = {
  reference?: unknown;
  lang?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  orderNumber?: unknown;
  orderedAt?: unknown;
  receivedAt?: unknown;
  products?: unknown;
  customerAddress?: unknown;
  message?: unknown;
  status?: unknown;
  submittedAt?: unknown;
  source?: unknown;
  adminNote?: unknown;
  refund?: {
    status?: unknown;
    amount?: unknown;
    currency?: unknown;
    method?: unknown;
    reference?: unknown;
    refundedAt?: unknown;
    note?: unknown;
  } | null;
  history?: unknown;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asDateIso(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeStatus(value: unknown): WithdrawalStatus {
  const normalized = clean(value).toUpperCase();

  return (WITHDRAWAL_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as WithdrawalStatus)
    : "RECEIVED";
}

function normalizeRefundStatus(value: unknown): RefundStatus {
  const normalized = clean(value).toUpperCase();

  return (REFUND_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as RefundStatus)
    : "NOT_STARTED";
}

function serialize(doc: WithdrawalDoc) {
  const refund = doc.refund ?? null;

  return {
    reference: clean(doc.reference),
    lang: clean(doc.lang) === "fr" ? "fr" : "en",
    firstName: clean(doc.firstName),
    lastName: clean(doc.lastName),
    email: clean(doc.email),
    orderNumber: clean(doc.orderNumber),
    orderedAt: clean(doc.orderedAt),
    receivedAt: clean(doc.receivedAt),
    products: clean(doc.products),
    customerAddress: clean(doc.customerAddress),
    message: clean(doc.message),
    status: normalizeStatus(doc.status),
    submittedAt: asDateIso(doc.submittedAt),
    source: clean(doc.source),
    adminNote: clean(doc.adminNote),
    refund: {
      status: normalizeRefundStatus(refund?.status),
      amount: asNumber(refund?.amount),
      currency: clean(refund?.currency) || "EUR",
      method: clean(refund?.method),
      reference: clean(refund?.reference),
      refundedAt: asDateIso(refund?.refundedAt),
      note: clean(refund?.note),
    },
  };
}

export async function GET(request: Request) {
  if (!isAuthorizedAdminService(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  await connectToDB();

  const db = mongoose.connection.db;

  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);

  const query = clean(url.searchParams.get("q")).slice(0, 150);
  const status = clean(url.searchParams.get("status")).toUpperCase();
  const refundStatus = clean(
    url.searchParams.get("refundStatus"),
  ).toUpperCase();
  const lang = clean(url.searchParams.get("lang")).toLowerCase();

  const page = Math.max(
    1,
    Number.parseInt(url.searchParams.get("page") || "1", 10) || 1,
  );

  const limit = Math.min(
    100,
    Math.max(
      10,
      Number.parseInt(url.searchParams.get("limit") || "50", 10) || 50,
    ),
  );

  const filters: Record<string, unknown>[] = [];

  if ((WITHDRAWAL_STATUSES as readonly string[]).includes(status)) {
    filters.push({ status });
  }

  if ((REFUND_STATUSES as readonly string[]).includes(refundStatus)) {
    filters.push({ "refund.status": refundStatus });
  }

  if (lang === "fr" || lang === "en") {
    filters.push({ lang });
  }

  if (query) {
    const regex = new RegExp(escapeRegex(query), "i");

    filters.push({
      $or: [
        { reference: regex },
        { email: regex },
        { orderNumber: regex },
        { firstName: regex },
        { lastName: regex },
        { products: regex },
      ],
    });
  }

  const mongoFilter =
    filters.length === 0
      ? {}
      : filters.length === 1
        ? filters[0]
        : { $and: filters };

  const collection = db.collection<WithdrawalDoc>("withdrawal_requests");

  const [docs, total] = await Promise.all([
    collection
      .find(mongoFilter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(mongoFilter),
  ]);

  return NextResponse.json(
    {
      items: docs.map(serialize),
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
