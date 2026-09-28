import "server-only";

import mongoose from "mongoose";
import type { Db } from "mongodb";

import Customer from "@/lib/models/Customer";
import { connectToDB } from "@/lib/mongoDB";

const CHALLENGES = "grindChallenges";
const ATTEMPTS = "grindAttempts";
const STREAKS = "grindStreakSeries";
const SHADOWS = "grindShadowChallenges";
const BADGES = "grindBadgeDefinitions";
const BADGE_AWARDS = "grindBadgeAwards";
const DURATION_SECONDS = 300;
const HUSTLER_LIMIT = 500;

type LeanCustomer = {
  clerkId?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type ClerkEmail = {
  id?: string;
  email_address?: string;
};

type ClerkPhone = {
  id?: string;
  phone_number?: string;
};

type ClerkDirectoryUser = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmail[];
  primary_phone_number_id?: string | null;
  phone_numbers?: ClerkPhone[];
};

type ClerkListPayload = ClerkDirectoryUser[] | { data?: ClerkDirectoryUser[] };

type HustlerDirectoryIdentity = {
  clerkId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  source: "CLERK" | "CUSTOMER" | "ACTIVITY";
};

async function getAdminDb(): Promise<Db> {
  await connectToDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MONGODB_NOT_CONNECTED");
  return db;
}

async function oid(value: string) {
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(value)) throw new Error("INVALID_ID");
  return new ObjectId(value);
}

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function clerkEmail(user: ClerkDirectoryUser) {
  const primary = user.email_addresses?.find((item) => item.id === user.primary_email_address_id)?.email_address;
  return clean(primary || user.email_addresses?.[0]?.email_address).toLowerCase();
}

function clerkPhone(user: ClerkDirectoryUser) {
  const primary = user.phone_numbers?.find((item) => item.id === user.primary_phone_number_id)?.phone_number;
  return clean(primary || user.phone_numbers?.[0]?.phone_number);
}

async function listClerkDirectory(): Promise<ClerkDirectoryUser[]> {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) return [];

  const users: ClerkDirectoryUser[] = [];
  const pageSize = 100;

  try {
    for (let offset = 0; offset < HUSTLER_LIMIT; offset += pageSize) {
      const url = new URL("https://api.clerk.com/v1/users");
      url.searchParams.set("limit", String(pageSize));
      url.searchParams.set("offset", String(offset));
      url.searchParams.set("order_by", "-created_at");

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: "no-store",
      });

      if (!response.ok) {
        console.warn(`[GTA_ADMIN] Clerk directory returned ${response.status}`);
        break;
      }

      const payload = (await response.json()) as ClerkListPayload;
      const page = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
      users.push(...page);
      if (page.length < pageSize) break;
    }
  } catch (error) {
    console.warn("[GTA_ADMIN] Clerk directory sync failed; using MongoDB customers/activity fallback.", error);
  }

  return users.slice(0, HUSTLER_LIMIT);
}

export async function assertAdmin(userId: string | null) {
  if (!userId) throw new Error("UNAUTHORIZED");
  const allowlist = (process.env.MBG_ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (allowlist.length && !allowlist.includes(userId)) throw new Error("FORBIDDEN");
  return userId;
}

export async function listAdminChallenges() {
  const db = await getAdminDb();
  const docs = await db.collection(CHALLENGES).find({}).sort({ createdAt: -1 }).limit(100).toArray();
  return docs.map((doc) => ({
    id: String(doc._id),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    category: String(doc.category ?? "CHALLENGE"),
    status: String(doc.status ?? "DRAFT"),
    durationSeconds: DURATION_SECONDS,
    audience: doc.audience ?? { mode: "ALL", clerkIds: [] },
    publishAt: doc.publishAt ? new Date(doc.publishAt).toISOString() : null,
    startsAt: doc.startsAt ? new Date(doc.startsAt).toISOString() : null,
    endsAt: doc.endsAt ? new Date(doc.endsAt).toISOString() : null,
    priority: Number(doc.priority ?? 0),
    media: doc.media ?? null,
    measurementType: String(doc.measurementType ?? "COUNT"),
    unitLabel: String(doc.unitLabel ?? "reps"),
    targetValue: doc.targetValue != null && Number.isFinite(Number(doc.targetValue)) ? Number(doc.targetValue) : null,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  }));
}

export async function createAdminChallenge(args: {
  adminId: string;
  title: string;
  description: string;
  category?: string;
  status?: "DRAFT" | "PUBLISHED";
  audienceMode?: "ALL" | "SELECTED_HUSTLERS";
  clerkIds?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
  priority?: number;
  media?: string | null;
  measurementType?: "COUNT" | "DISTANCE" | "TIME_HELD" | "PAGES" | "WORDS" | "CUSTOM";
  unitLabel?: string;
  targetValue?: number | null;
}) {
  const db = await getAdminDb();
  const now = new Date();
  const title = args.title.trim().slice(0, 140);
  if (!title) throw new Error("TITLE_REQUIRED");
  const result = await db.collection(CHALLENGES).insertOne({
    title,
    description: args.description.trim().slice(0, 1000),
    category: (args.category ?? "CHALLENGE").trim().slice(0, 60),
    status: args.status ?? "DRAFT",
    durationSeconds: DURATION_SECONDS,
    audience: {
      mode: args.audienceMode ?? "ALL",
      clerkIds: (args.clerkIds ?? []).filter(Boolean).slice(0, 500),
    },
    publishAt: args.status === "PUBLISHED" ? now : null,
    startsAt: args.startsAt ? new Date(args.startsAt) : null,
    endsAt: args.endsAt ? new Date(args.endsAt) : null,
    priority: Number(args.priority ?? 0),
    media: args.media ?? null,
    measurementType: args.measurementType ?? "COUNT",
    unitLabel: (args.unitLabel ?? "reps").trim().slice(0, 40) || "reps",
    targetValue: Number.isFinite(Number(args.targetValue)) && Number(args.targetValue) > 0
      ? Number(args.targetValue)
      : null,
    createdBy: args.adminId,
    createdAt: now,
    updatedAt: now,
  });
  return { id: String(result.insertedId) };
}

export async function updateAdminChallenge(args: {
  adminId: string;
  id: string;
  patch: Record<string, unknown>;
}) {
  const db = await getAdminDb();
  const _id = await oid(args.id);
  const allowed: Record<string, unknown> = {};
  for (const key of ["title", "description", "category", "status", "priority", "media", "measurementType", "unitLabel", "targetValue"]) {
    if (key in args.patch) allowed[key] = args.patch[key];
  }
  if ("audience" in args.patch) allowed.audience = args.patch.audience;
  if ("startsAt" in args.patch) allowed.startsAt = args.patch.startsAt ? new Date(String(args.patch.startsAt)) : null;
  if ("endsAt" in args.patch) allowed.endsAt = args.patch.endsAt ? new Date(String(args.patch.endsAt)) : null;
  if (args.patch.status === "PUBLISHED") allowed.publishAt = new Date();
  allowed.durationSeconds = DURATION_SECONDS;
  allowed.updatedAt = new Date();
  allowed.updatedBy = args.adminId;
  await db.collection(CHALLENGES).updateOne({ _id }, { $set: allowed });
  return { ok: true };
}

export async function deleteAdminChallenge(args: {
  adminId: string;
  id: string;
}) {
  const db = await getAdminDb();
  const _id = await oid(args.id);

  const existing = await db.collection(CHALLENGES).findOne({ _id });
  if (!existing) throw new Error("CHALLENGE_NOT_FOUND");

  const result = await db.collection(CHALLENGES).deleteOne({ _id });
  if (result.deletedCount !== 1) throw new Error("DELETE_FAILED");

  return {
    ok: true,
    id: args.id,
    deletedBy: args.adminId,
  };
}

export async function ensureBadgeCatalog() {
  const db = await getAdminDb();
  const collection = db.collection(BADGES);
  const defaults = [
    ["ENCOURAGEMENT", "ENCOURAGEMENT", "ENCOURAGEMENT", "Recognition for visible effort and momentum.", "Reconnaissance d'un effort visible et d'une dynamique positive.", "HEART", "MANUAL"],
    ["DONT_GIVE_UP", "DON'T GIVE UP", "N'ABANDONNE PAS", "Recognition for returning after a broken streak.", "Reconnaissance d'un retour après une série interrompue.", "RETURN", "BOTH"],
    ["EFFORT", "EFFORT", "EFFORT", "Recognition for accumulated 5-minute effort.", "Reconnaissance de l'accumulation d'efforts de cinq minutes.", "FLAME", "BOTH"],
    ["CHALLENGER", "CHALLENGER", "CHALLENGER", "Started a Shadow Challenge.", "A lancé un Shadow Challenge.", "TARGET", "BOTH"],
    ["SHADOW_BREAKER", "SHADOW BREAKER", "SHADOW BREAKER", "Beat a previous personal streak.", "A dépassé une ancienne série personnelle.", "SHIELD", "BOTH"],
    ["CONSISTENT", "CONSISTENT", "CONSISTENT", "Built reliable participation over time.", "A construit une participation régulière dans le temps.", "REPEAT", "BOTH"],
    ["LOCKED_IN", "LOCKED IN", "LOCKED IN", "Built a strong record of focused sessions.", "A construit un historique solide de sessions concentrées.", "FOCUS", "BOTH"],
  ];
  const now = new Date();
  for (const row of defaults) {
    const [code, nameEn, nameFr, descriptionEn, descriptionFr, iconKey, assignmentMode] = row;
    await collection.updateOne(
      { code },
      { $setOnInsert: { code, nameEn, nameFr, descriptionEn, descriptionFr, iconKey, assignmentMode, active: true, createdAt: now, updatedAt: now } },
      { upsert: true },
    );
  }
}

export async function listHustlers() {
  const db = await getAdminDb();
  await ensureBadgeCatalog();

  const [customers, clerkUsers, attemptIds, awardIds, shadowIds] = await Promise.all([
    Customer.find()
      .sort({ createdAt: "desc" })
      .select("clerkId name email phone")
      .limit(HUSTLER_LIMIT)
      .lean<LeanCustomer[]>(),
    listClerkDirectory(),
    db.collection(ATTEMPTS).distinct("clerkId"),
    db.collection(BADGE_AWARDS).distinct("clerkId"),
    db.collection(SHADOWS).distinct("clerkId"),
  ]);

  const identities = new Map<string, HustlerDirectoryIdentity>();

  for (const customer of customers ?? []) {
    const clerkId = clean(customer.clerkId);
    if (!clerkId) continue;
    identities.set(clerkId, {
      clerkId,
      name: clean(customer.name),
      email: clean(customer.email).toLowerCase(),
      phone: clean(customer.phone),
      avatarUrl: null,
      source: "CUSTOMER",
    });
  }

  for (const user of clerkUsers) {
    const clerkId = clean(user.id);
    if (!clerkId) continue;
    const existing = identities.get(clerkId);
    const name = [clean(user.first_name), clean(user.last_name)].filter(Boolean).join(" ").trim();
    identities.set(clerkId, {
      clerkId,
      name: existing?.name || name,
      email: existing?.email || clerkEmail(user),
      phone: existing?.phone || clerkPhone(user),
      avatarUrl: clean(user.image_url) || existing?.avatarUrl || null,
      source: "CLERK",
    });
  }

  for (const raw of [...attemptIds, ...awardIds, ...shadowIds]) {
    const clerkId = clean(raw);
    if (!clerkId || identities.has(clerkId)) continue;
    identities.set(clerkId, {
      clerkId,
      name: "",
      email: "",
      phone: "",
      avatarUrl: null,
      source: "ACTIVITY",
    });
  }

  const adminIds = new Set(
    (process.env.MBG_ADMIN_CLERK_IDS ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
  for (const adminId of adminIds) identities.delete(adminId);

  const clerkIds = [...identities.keys()].slice(0, HUSTLER_LIMIT);
  if (!clerkIds.length) return [];

  const [attemptDocs, streakDocs, shadowDocs, awardDocs, badgeDocs] = await Promise.all([
    db.collection(ATTEMPTS).find({ clerkId: { $in: clerkIds } }).sort({ startedAt: -1 }).limit(10000).toArray(),
    db.collection(STREAKS).find({ clerkId: { $in: clerkIds } }).sort({ startedAt: -1 }).limit(5000).toArray(),
    db.collection(SHADOWS).find({ clerkId: { $in: clerkIds } }).sort({ startedAt: -1 }).limit(5000).toArray(),
    db.collection(BADGE_AWARDS).find({
      clerkId: { $in: clerkIds },
      $or: [{ revokedAt: null }, { revokedAt: { $exists: false } }],
    }).sort({ awardedAt: -1 }).limit(10000).toArray(),
    db.collection(BADGES).find({}).toArray(),
  ]);

  const badgeMap = new Map(badgeDocs.map((doc) => [String(doc._id), doc]));

  const attemptsByUser = new Map<string, typeof attemptDocs>();
  for (const doc of attemptDocs) {
    const clerkId = clean(doc.clerkId);
    if (!clerkId) continue;
    const bucket = attemptsByUser.get(clerkId) ?? [];
    bucket.push(doc);
    attemptsByUser.set(clerkId, bucket);
  }

  const streaksByUser = new Map<string, typeof streakDocs>();
  for (const doc of streakDocs) {
    const clerkId = clean(doc.clerkId);
    if (!clerkId) continue;
    const bucket = streaksByUser.get(clerkId) ?? [];
    bucket.push(doc);
    streaksByUser.set(clerkId, bucket);
  }

  const shadowsByUser = new Map<string, typeof shadowDocs>();
  for (const doc of shadowDocs) {
    const clerkId = clean(doc.clerkId);
    if (!clerkId) continue;
    const bucket = shadowsByUser.get(clerkId) ?? [];
    bucket.push(doc);
    shadowsByUser.set(clerkId, bucket);
  }

  const awardsByUser = new Map<string, typeof awardDocs>();
  for (const doc of awardDocs) {
    const clerkId = clean(doc.clerkId);
    if (!clerkId) continue;
    const bucket = awardsByUser.get(clerkId) ?? [];
    bucket.push(doc);
    awardsByUser.set(clerkId, bucket);
  }

  const rows = clerkIds.map((clerkId) => {
    const identity = identities.get(clerkId)!;
    const attempts = attemptsByUser.get(clerkId) ?? [];
    const achieved = attempts.filter((item) => item.status === "ACHIEVED");
    const streaks = streaksByUser.get(clerkId) ?? [];
    const shadows = shadowsByUser.get(clerkId) ?? [];
    const awards = awardsByUser.get(clerkId) ?? [];

    const activeStreak = streaks.find((item) => item.active === true || !item.endedAt);
    const currentStreak = Number(activeStreak?.length ?? 0);
    const bestStreak = streaks.reduce((max, item) => Math.max(max, Number(item.length ?? 0)), currentStreak);

    const focusScores: number[] = achieved
      .map((item): number =>
        item.focusCheck === "LOCKED_IN"
          ? 100
          : item.focusCheck === "RETURNED"
            ? 70
            : item.focusCheck === "LOST_FOCUS"
              ? 30
              : 0,
      )
      .filter((value) => value > 0);
    const focusAverage = focusScores.length
      ? Math.round(focusScores.reduce((sum, value) => sum + value, 0) / focusScores.length)
      : 0;

    const breakCount = shadows.reduce((sum, item) => sum + Number(item.breakCount ?? 0), 0);
    const returnCount = shadows.reduce((sum, item) => sum + Number(item.returnCount ?? 0), 0);
    const shadowWins = shadows.filter((item) => item.status === "WON").length;
    const shadowWinRate = shadows.length ? Math.round((shadowWins / shadows.length) * 100) : 0;
    const returnRate = breakCount ? Math.min(100, Math.round((returnCount / breakCount) * 100)) : 0;

    const activeShadowDoc = shadows.find((item) => ["READY", "ACTIVE", "BROKEN", "RETURNED"].includes(String(item.status)));
    const lastAttempt = attempts[0];
    const lastActiveRaw = lastAttempt?.achievedAt || lastAttempt?.startedAt || null;

    const recentBadges = awards.slice(0, 12).map((award) => {
      const badge = badgeMap.get(String(award.badgeId));
      return {
        id: String(award._id),
        code: String(badge?.code ?? "BADGE"),
        name: String(badge?.nameEn ?? badge?.code ?? "BADGE"),
        message: clean(award.message),
        source: String(award.source ?? "ADMIN"),
        awardedAt: award.awardedAt ? new Date(award.awardedAt).toISOString() : null,
      };
    });

    return {
      clerkId,
      name: identity.name,
      email: identity.email,
      phone: identity.phone,
      avatarUrl: identity.avatarUrl,
      directorySource: identity.source,
      sessions: achieved.length,
      started: attempts.length,
      completionRate: attempts.length ? Math.round((achieved.length / attempts.length) * 100) : 0,
      lastActiveAt: lastActiveRaw ? new Date(lastActiveRaw).toISOString() : null,
      activeShadow: activeShadowDoc
        ? {
            id: String(activeShadowDoc._id),
            baselineLength: Number(activeShadowDoc.baselineLength ?? 0),
            currentRun: Number(activeShadowDoc.currentRun ?? 0),
            targetLength: Number(activeShadowDoc.targetLength ?? Number(activeShadowDoc.baselineLength ?? 0) + 1),
          }
        : null,
      badges: awards.length,
      recentBadges,
      stats: {
        currentStreak,
        bestStreak,
        focusAverage,
        returnRate,
        shadowWinRate,
        returns: returnCount,
      },
    };
  });

  return rows.sort((a, b) => {
    const aActive = a.lastActiveAt ? Date.parse(a.lastActiveAt) : 0;
    const bActive = b.lastActiveAt ? Date.parse(b.lastActiveAt) : 0;
    if (bActive !== aActive) return bActive - aActive;
    return (a.name || a.email || a.clerkId).localeCompare(b.name || b.email || b.clerkId);
  });
}

export async function listBadges() {
  const db = await getAdminDb();
  await ensureBadgeCatalog();
  const docs = await db.collection(BADGES).find({}).sort({ code: 1 }).toArray();
  return docs.map((doc) => ({
    id: String(doc._id),
    code: String(doc.code),
    nameEn: String(doc.nameEn ?? ""),
    nameFr: String(doc.nameFr ?? ""),
    descriptionEn: String(doc.descriptionEn ?? ""),
    descriptionFr: String(doc.descriptionFr ?? ""),
    iconKey: String(doc.iconKey ?? "MEDAL"),
    assignmentMode: String(doc.assignmentMode ?? "MANUAL"),
    active: Boolean(doc.active),
  }));
}

export async function awardBadge(args: { adminId: string; clerkId: string; badgeId: string; message?: string }) {
  const db = await getAdminDb();
  const clerkId = args.clerkId.trim();
  if (!clerkId) throw new Error("HUSTLER_REQUIRED");

  const badgeId = await oid(args.badgeId);
  const badge = await db.collection(BADGES).findOne({ _id: badgeId, active: true });
  if (!badge) throw new Error("BADGE_NOT_FOUND");

  const awards = db.collection(BADGE_AWARDS);
  const existing = await awards.findOne({ clerkId, badgeId, $or: [{ revokedAt: null }, { revokedAt: { $exists: false } }] });
  if (existing) return { id: String(existing._id), duplicate: true };

  const result = await awards.insertOne({
    clerkId,
    badgeId,
    source: "ADMIN",
    message: (args.message ?? "").trim().slice(0, 500),
    awardedBy: args.adminId,
    awardedAt: new Date(),
    revokedAt: null,
    revokedBy: null,
  });
  return { id: String(result.insertedId), duplicate: false };
}
