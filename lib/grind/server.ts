import "server-only";

import { getAdminDb } from "@/lib/adminDb";
import type {
  GrindChapter,
  GrindCheckInDTO,
  GrindCycleDTO,
  GrindCycleStatus,
  GrindDashboardDTO,
  GrindProfileDTO,
  GrindTask,
} from "@/types/grind";
import type { ObjectId } from "mongodb";

const PROFILE_COLLECTION = "grindProfiles";
const CYCLE_COLLECTION = "grindCycles";
const CHECKIN_COLLECTION = "grindCheckIns";

const PAID_STATES = new Set(["PAID", "SUCCEEDED", "SUCCESS", "CAPTURED", "COMPLETED"]);
const BLOCKED_STATES = new Set(["CANCELLED", "CANCELED", "REFUNDED", "FAILED", "DECLINED"]);

const iso = (value?: Date | string | null) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const dateKey = (value = new Date()) => value.toISOString().slice(0, 10);

const daysBetween = (a: string, b: string) => {
  const aa = Date.parse(`${a}T00:00:00.000Z`);
  const bb = Date.parse(`${b}T00:00:00.000Z`);
  return Math.round((bb - aa) / 86400000);
};

function isConfirmedOrder(order: Record<string, unknown>) {
  const fulfillment = String(order.fulfillmentStatus ?? order.status ?? "").toUpperCase();
  if (BLOCKED_STATES.has(fulfillment)) return false;

  const payment = String(
    order.paymentStatus ??
      order.payment_state ??
      order.paymentState ??
      order.financialStatus ??
      order.payment ??
      "",
  ).toUpperCase();

  if (payment) return PAID_STATES.has(payment);
  return fulfillment === "COMPLETED";
}

async function resolveUnlock(clerkId: string) {
  const db = await getAdminDb();
  const orders = db.collection<Record<string, unknown>>("orders");
  const candidates = await orders
    .find({ customerClerkId: clerkId })
    .sort({ createdAt: 1 })
    .limit(20)
    .toArray();

  const first = candidates.find(isConfirmedOrder);
  return first
    ? {
        unlocked: true,
        firstOrderId: String(first._id ?? ""),
        unlockedAt: iso((first.paidAt ?? first.completedAt ?? first.createdAt) as Date | string | null) ?? new Date().toISOString(),
      }
    : { unlocked: false, firstOrderId: null, unlockedAt: null };
}

type ProfileDoc = {
  clerkId: string;
  unlocked: boolean;
  unlockedAt?: Date | string | null;
  firstOrderId?: string | null;
  activeCycleId?: ObjectId | string | null;
  cyclesCompleted?: number;
  grindsCompleted?: number;
  returns?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastShowedUpDate?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type CycleDoc = {
  _id: ObjectId;
  clerkId: string;
  title: string;
  reason: string;
  status: GrindCycleStatus;
  currentChapter: GrindChapter;
  startedAt: Date;
  completedAt?: Date | null;
  archivedAt?: Date | null;
  reflection?: string;
  progress?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type CheckInDoc = {
  _id: ObjectId;
  cycleId: ObjectId;
  clerkId: string;
  dateKey: string;
  chapter: GrindChapter;
  tasks: GrindTask[];
  note?: string;
  showedUp: boolean;
  resilienceReturn: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function profileDTO(doc: ProfileDoc): GrindProfileDTO {
  return {
    clerkId: doc.clerkId,
    unlocked: Boolean(doc.unlocked),
    unlockedAt: iso(doc.unlockedAt),
    firstOrderId: doc.firstOrderId ?? null,
    activeCycleId: doc.activeCycleId ? String(doc.activeCycleId) : null,
    cyclesCompleted: Number(doc.cyclesCompleted ?? 0),
    grindsCompleted: Number(doc.grindsCompleted ?? 0),
    returns: Number(doc.returns ?? 0),
    currentStreak: Number(doc.currentStreak ?? 0),
    longestStreak: Number(doc.longestStreak ?? 0),
  };
}

function cycleDTO(doc: CycleDoc): GrindCycleDTO {
  return {
    id: String(doc._id),
    clerkId: doc.clerkId,
    title: doc.title,
    reason: doc.reason,
    status: doc.status,
    currentChapter: doc.currentChapter,
    startedAt: iso(doc.startedAt) ?? new Date().toISOString(),
    completedAt: iso(doc.completedAt),
    archivedAt: iso(doc.archivedAt),
    reflection: doc.reflection ?? "",
    progress: Number(doc.progress ?? 0),
  };
}

function checkInDTO(doc: CheckInDoc): GrindCheckInDTO {
  return {
    id: String(doc._id),
    cycleId: String(doc.cycleId),
    clerkId: doc.clerkId,
    dateKey: doc.dateKey,
    chapter: doc.chapter,
    tasks: Array.isArray(doc.tasks) ? doc.tasks : [],
    note: doc.note ?? "",
    showedUp: Boolean(doc.showedUp),
    resilienceReturn: Boolean(doc.resilienceReturn),
    createdAt: iso(doc.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(doc.updatedAt) ?? new Date().toISOString(),
  };
}

export async function ensureGrindProfile(clerkId: string) {
  const db = await getAdminDb();
  const profiles = db.collection<ProfileDoc>(PROFILE_COLLECTION);
  let profile = await profiles.findOne({ clerkId });
  const unlock = await resolveUnlock(clerkId);

  if (!profile) {
    const now = new Date();
    const created: ProfileDoc = {
      clerkId,
      unlocked: unlock.unlocked,
      unlockedAt: unlock.unlockedAt,
      firstOrderId: unlock.firstOrderId,
      activeCycleId: null,
      cyclesCompleted: 0,
      grindsCompleted: 0,
      returns: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastShowedUpDate: null,
      createdAt: now,
      updatedAt: now,
    };
    await profiles.insertOne(created);
    profile = created;
  } else if (!profile.unlocked && unlock.unlocked) {
    await profiles.updateOne(
      { clerkId },
      {
        $set: {
          unlocked: true,
          unlockedAt: unlock.unlockedAt,
          firstOrderId: unlock.firstOrderId,
          updatedAt: new Date(),
        },
      },
    );
    profile = { ...profile, ...unlock, unlocked: true };
  }

  return profileDTO(profile);
}

export async function getGrindDashboard(clerkId: string): Promise<GrindDashboardDTO> {
  const db = await getAdminDb();
  const profile = await ensureGrindProfile(clerkId);
  const cycles = db.collection<CycleDoc>(CYCLE_COLLECTION);
  const checkIns = db.collection<CheckInDoc>(CHECKIN_COLLECTION);

  const activeDoc = profile.activeCycleId
    ? await cycles.findOne({ _id: await toObjectId(profile.activeCycleId), clerkId, status: "ACTIVE" })
    : await cycles.findOne({ clerkId, status: "ACTIVE" }, { sort: { startedAt: -1 } });

  const activeCycle = activeDoc ? cycleDTO(activeDoc) : null;
  const todayDoc = activeDoc
    ? await checkIns.findOne({ clerkId, cycleId: activeDoc._id, dateKey: dateKey() })
    : null;

  const archiveDocs = await cycles
    .find({ clerkId, status: "COMPLETED" })
    .sort({ completedAt: -1 })
    .limit(20)
    .toArray();

  return {
    profile,
    activeCycle,
    today: todayDoc ? checkInDTO(todayDoc) : null,
    archive: archiveDocs.map(cycleDTO),
  };
}

async function toObjectId(value: string) {
  const { ObjectId } = await import("mongodb");
  return new ObjectId(value);
}

export async function createGrindCycle(clerkId: string, title: string, reason: string) {
  const db = await getAdminDb();
  const profiles = db.collection<ProfileDoc>(PROFILE_COLLECTION);
  const cycles = db.collection<CycleDoc>(CYCLE_COLLECTION);
  const profile = await ensureGrindProfile(clerkId);
  if (!profile.unlocked) throw new Error("GRIND_MODE_LOCKED");

  const active = await cycles.findOne({ clerkId, status: "ACTIVE" });
  if (active) return cycleDTO(active);

  const now = new Date();
  const result = await cycles.insertOne({
    clerkId,
    title: title.trim().slice(0, 140),
    reason: reason.trim().slice(0, 500),
    status: "ACTIVE",
    currentChapter: "GRIND",
    startedAt: now,
    completedAt: null,
    archivedAt: null,
    reflection: "",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  });

  await profiles.updateOne(
    { clerkId },
    { $set: { activeCycleId: result.insertedId, updatedAt: now } },
  );

  const created = await cycles.findOne({ _id: result.insertedId });
  if (!created) throw new Error("CYCLE_CREATE_FAILED");
  return cycleDTO(created);
}

function deriveChapter(totalShowUps: number, cycleProgress: number): GrindChapter {
  if (cycleProgress >= 100) return "ACHIEVE";
  if (totalShowUps >= 14) return "FOCUS";
  if (totalShowUps >= 7) return "CONSISTENCY";
  return "GRIND";
}

export async function saveTodayCheckIn(args: {
  clerkId: string;
  cycleId: string;
  tasks: GrindTask[];
  note?: string;
  showedUp: boolean;
}) {
  const db = await getAdminDb();
  const profiles = db.collection<ProfileDoc>(PROFILE_COLLECTION);
  const cycles = db.collection<CycleDoc>(CYCLE_COLLECTION);
  const checkIns = db.collection<CheckInDoc>(CHECKIN_COLLECTION);
  const cycleObjectId = await toObjectId(args.cycleId);
  const cycle = await cycles.findOne({ _id: cycleObjectId, clerkId: args.clerkId, status: "ACTIVE" });
  if (!cycle) throw new Error("ACTIVE_CYCLE_NOT_FOUND");

  const today = dateKey();
  const existing = await checkIns.findOne({ clerkId: args.clerkId, cycleId: cycleObjectId, dateKey: today });
  const profile = await profiles.findOne({ clerkId: args.clerkId });
  if (!profile) throw new Error("PROFILE_NOT_FOUND");

  const completedCount = args.tasks.filter((task) => task.completed).length;
  const showedUp = Boolean(args.showedUp || completedCount > 0);
  let resilienceReturn = false;
  let currentStreak = Number(profile.currentStreak ?? 0);
  let longestStreak = Number(profile.longestStreak ?? 0);
  let returns = Number(profile.returns ?? 0);
  let grindsCompleted = Number(profile.grindsCompleted ?? 0);

  if (showedUp && !existing?.showedUp) {
    if (profile.lastShowedUpDate) {
      const gap = daysBetween(profile.lastShowedUpDate, today);
      if (gap === 1) currentStreak += 1;
      else if (gap > 1) {
        resilienceReturn = true;
        returns += 1;
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
    longestStreak = Math.max(longestStreak, currentStreak);
    grindsCompleted += Math.max(1, completedCount);
  }

  const now = new Date();
  await checkIns.updateOne(
    { clerkId: args.clerkId, cycleId: cycleObjectId, dateKey: today },
    {
      $set: {
        chapter: resilienceReturn ? "RESILIENCE" : cycle.currentChapter,
        tasks: args.tasks.slice(0, 4),
        note: (args.note ?? "").trim().slice(0, 1000),
        showedUp,
        resilienceReturn: existing?.resilienceReturn || resilienceReturn,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  if (showedUp && !existing?.showedUp) {
    await profiles.updateOne(
      { clerkId: args.clerkId },
      {
        $set: {
          currentStreak,
          longestStreak,
          grindsCompleted,
          returns,
          lastShowedUpDate: today,
          updatedAt: now,
        },
      },
    );
  }

  const totalShowUps = await checkIns.countDocuments({ clerkId: args.clerkId, cycleId: cycleObjectId, showedUp: true });
  const progress = Math.min(95, Math.round((totalShowUps / 21) * 95));
  const nextChapter = resilienceReturn ? "RESILIENCE" : deriveChapter(totalShowUps, progress);

  await cycles.updateOne(
    { _id: cycleObjectId },
    { $set: { progress, currentChapter: nextChapter, updatedAt: now } },
  );

  const saved = await checkIns.findOne({ clerkId: args.clerkId, cycleId: cycleObjectId, dateKey: today });
  if (!saved) throw new Error("CHECKIN_SAVE_FAILED");
  return checkInDTO(saved);
}

export async function completeGrindCycle(clerkId: string, cycleId: string, reflection: string) {
  const db = await getAdminDb();
  const profiles = db.collection<ProfileDoc>(PROFILE_COLLECTION);
  const cycles = db.collection<CycleDoc>(CYCLE_COLLECTION);
  const _id = await toObjectId(cycleId);
  const cycle = await cycles.findOne({ _id, clerkId, status: "ACTIVE" });
  if (!cycle) throw new Error("ACTIVE_CYCLE_NOT_FOUND");

  const now = new Date();
  await cycles.updateOne(
    { _id },
    {
      $set: {
        status: "COMPLETED",
        currentChapter: "ACHIEVE",
        progress: 100,
        reflection: reflection.trim().slice(0, 2000),
        completedAt: now,
        archivedAt: now,
        updatedAt: now,
      },
    },
  );

  await profiles.updateOne(
    { clerkId },
    {
      $set: { activeCycleId: null, updatedAt: now },
      $inc: { cyclesCompleted: 1 },
    },
  );

  const completed = await cycles.findOne({ _id });
  if (!completed) throw new Error("CYCLE_COMPLETE_FAILED");
  return cycleDTO(completed);
}
