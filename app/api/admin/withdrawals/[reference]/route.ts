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

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

type UpdatePayload = {
  status?: unknown;
  adminNote?: unknown;
  refundStatus?: unknown;
  refundAmount?: unknown;
  refundCurrency?: unknown;
  refundMethod?: unknown;
  refundReference?: unknown;
  refundedAt?: unknown;
  refundNote?: unknown;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseAmount(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(String(value).replace(",", "."));

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : null;
}

function parseDate(value: unknown): Date | null {
  const raw = clean(value);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function normalizeStatus(
  value: unknown,
): WithdrawalStatus | null {
  const normalized = clean(value).toUpperCase();

  return (
    WITHDRAWAL_STATUSES as readonly string[]
  ).includes(normalized)
    ? (normalized as WithdrawalStatus)
    : null;
}

function normalizeRefundStatus(
  value: unknown,
): RefundStatus | null {
  const normalized = clean(value).toUpperCase();

  return (
    REFUND_STATUSES as readonly string[]
  ).includes(normalized)
    ? (normalized as RefundStatus)
    : null;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  // ---------------------------------------------------------------------------
  // SERVICE AUTH
  // ---------------------------------------------------------------------------

  if (!isAuthorizedAdminService(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // REFERENCE
  // ---------------------------------------------------------------------------

  const { reference } = await context.params;

  const decodedReference =
    decodeURIComponent(reference).trim();

  if (!decodedReference) {
    return NextResponse.json(
      {
        error: "Reference required",
      },
      {
        status: 400,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // PAYLOAD
  // ---------------------------------------------------------------------------

  const raw: unknown = await request
    .json()
    .catch(() => null);

  if (!isRecord(raw)) {
    return NextResponse.json(
      {
        error: "Invalid payload",
      },
      {
        status: 400,
      },
    );
  }

  const body = raw as UpdatePayload;

  // Les clés pointées MongoDB sont volontairement stockées
  // dans un Record générique.
  const set: Record<string, unknown> = {};

  // Ces variables gardent des types stricts pour l'historique.
  let historyStatus: WithdrawalStatus | null = null;
  let historyRefundStatus: RefundStatus | null = null;

  // ---------------------------------------------------------------------------
  // WITHDRAWAL STATUS
  // ---------------------------------------------------------------------------

  if (body.status !== undefined) {
    const status =
      normalizeStatus(body.status);

    if (!status) {
      return NextResponse.json(
        {
          error: "Invalid withdrawal status",
        },
        {
          status: 400,
        },
      );
    }

    set.status = status;
    historyStatus = status;
  }

  // ---------------------------------------------------------------------------
  // ADMIN NOTE
  // ---------------------------------------------------------------------------

  if (body.adminNote !== undefined) {
    set.adminNote =
      clean(body.adminNote).slice(
        0,
        5000,
      );
  }

  // ---------------------------------------------------------------------------
  // REFUND STATUS
  // ---------------------------------------------------------------------------

  if (body.refundStatus !== undefined) {
    const refundStatus =
      normalizeRefundStatus(
        body.refundStatus,
      );

    if (!refundStatus) {
      return NextResponse.json(
        {
          error: "Invalid refund status",
        },
        {
          status: 400,
        },
      );
    }

    set["refund.status"] =
      refundStatus;

    historyRefundStatus =
      refundStatus;

    // Si le remboursement vient d'être marqué REMBOURSÉ
    // sans date fournie, on renseigne automatiquement maintenant.
    if (
      refundStatus === "REFUNDED" &&
      body.refundedAt === undefined
    ) {
      set["refund.refundedAt"] =
        new Date();
    }
  }

  // ---------------------------------------------------------------------------
  // REFUND AMOUNT
  // ---------------------------------------------------------------------------

  if (body.refundAmount !== undefined) {
    const amount =
      parseAmount(body.refundAmount);

    if (
      body.refundAmount !== "" &&
      amount === null
    ) {
      return NextResponse.json(
        {
          error: "Invalid refund amount",
        },
        {
          status: 400,
        },
      );
    }

    set["refund.amount"] =
      amount;
  }

  // ---------------------------------------------------------------------------
  // REFUND CURRENCY
  // ---------------------------------------------------------------------------

  if (
    body.refundCurrency !== undefined
  ) {
    set["refund.currency"] =
      clean(body.refundCurrency)
        .toUpperCase()
        .slice(0, 3) || "EUR";
  }

  // ---------------------------------------------------------------------------
  // REFUND METHOD
  // ---------------------------------------------------------------------------

  if (
    body.refundMethod !== undefined
  ) {
    set["refund.method"] =
      clean(body.refundMethod).slice(
        0,
        100,
      );
  }

  // ---------------------------------------------------------------------------
  // REFUND REFERENCE
  // ---------------------------------------------------------------------------

  if (
    body.refundReference !==
    undefined
  ) {
    set["refund.reference"] =
      clean(body.refundReference).slice(
        0,
        200,
      );
  }

  // ---------------------------------------------------------------------------
  // REFUND DATE
  // ---------------------------------------------------------------------------

  if (body.refundedAt !== undefined) {
    const refundedAt =
      parseDate(body.refundedAt);

    if (
      clean(body.refundedAt) &&
      !refundedAt
    ) {
      return NextResponse.json(
        {
          error: "Invalid refund date",
        },
        {
          status: 400,
        },
      );
    }

    set["refund.refundedAt"] =
      refundedAt;
  }

  // ---------------------------------------------------------------------------
  // REFUND NOTE
  // ---------------------------------------------------------------------------

  if (
    body.refundNote !== undefined
  ) {
    set["refund.note"] =
      clean(body.refundNote).slice(
        0,
        5000,
      );
  }

  // ---------------------------------------------------------------------------
  // NOTHING TO UPDATE
  // ---------------------------------------------------------------------------

  if (
    Object.keys(set).length === 0
  ) {
    return NextResponse.json(
      {
        error: "Nothing to update",
      },
      {
        status: 400,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // DATABASE
  // ---------------------------------------------------------------------------

  await connectToDB();

  const db =
    mongoose.connection.db;

  if (!db) {
    return NextResponse.json(
      {
        error:
          "Database unavailable",
      },
      {
        status: 503,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // HISTORY ENTRY
  // ---------------------------------------------------------------------------

  const actor =
    request.headers
      .get("x-mbg-admin-user-id")
      ?.trim() ||
    "MBG_ADMIN";

  const historyEntry = {
    at: new Date(),
    actor,
    type: "ADMIN_UPDATE",
    status: historyStatus,
    refundStatus:
      historyRefundStatus,
  };

  // ---------------------------------------------------------------------------
  // ATOMIC UPDATE
  // ---------------------------------------------------------------------------
  //
  // On utilise ici une UPDATE PIPELINE au lieu de :
  //
  // $push: { history: historyEntry }
  //
  // Pourquoi ?
  //
  // Avec une collection MongoDB inférée comme `Document`, TypeScript ne peut
  // pas déterminer que `history` est un tableau et refuse le PushOperator.
  //
  // La pipeline :
  // 1. applique toutes les modifications ($set)
  // 2. recrée `history` en concaténant l'ancien tableau et la nouvelle entrée
  //
  // Tout reste réalisé dans UNE SEULE opération atomique.
  // ---------------------------------------------------------------------------

  const result = await db
    .collection(
      "withdrawal_requests",
    )
    .findOneAndUpdate(
      {
        reference:
          decodedReference,
      },
      [
        {
          $set: set,
        },
        {
          $set: {
            history: {
              $concatArrays: [
                {
                  $cond: [
                    {
                      $isArray:
                        "$history",
                    },
                    "$history",
                    [],
                  ],
                },
                [
                  historyEntry,
                ],
              ],
            },
          },
        },
      ],
      {
        returnDocument: "after",
      },
    );

  // ---------------------------------------------------------------------------
  // NOT FOUND
  // ---------------------------------------------------------------------------

  if (!result) {
    return NextResponse.json(
      {
        error:
          "Withdrawal request not found",
      },
      {
        status: 404,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------------------------------

  return NextResponse.json(
    {
      ok: true,
      reference:
        decodedReference,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}
