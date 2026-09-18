import "server-only";

import { getAdminDb } from "@/lib/adminDb";
import type {
  GrindLearningDashboardDTO,
  GrindLearningSessionDTO,
  GrindLearningStatus,
} from "@/types/grind-learning";
import type { ObjectId, WithId } from "mongodb";

const LEARNING_COLLECTION = "grindLearningSessions";
const CYCLE_COLLECTION = "grindCycles";

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;

const iso = (value?: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const addDays = (value: Date, days: number) => {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

type LearningSessionDoc = {
  clerkId: string;
  cycleId: ObjectId;
  clue: string;
  attentionCue: string;
  durationMinutes: number;
  startedAt: Date;
  endsAt: Date;
  completedAt?: Date | null;
  status: GrindLearningStatus;
  recall?: string;
  observation?: string;
  nextAction?: string;
  reviewIndex?: number;
  nextReviewAt?: Date | null;
  lastReviewedAt?: Date | null;
  reviews?: Array<{ at: Date; recall: string; stage: number }>;
  createdAt: Date;
  updatedAt: Date;
};

function dto(doc: WithId<LearningSessionDoc>): GrindLearningSessionDTO {
  return {
    id: String(doc._id),
    clerkId: doc.clerkId,
    cycleId: String(doc.cycleId),
    clue: doc.clue,
    attentionCue: doc.attentionCue,
    durationMinutes: Number(doc.durationMinutes || 0),
    startedAt: iso(doc.startedAt) ?? new Date().toISOString(),
    endsAt: iso(doc.endsAt) ?? new Date().toISOString(),
    completedAt: iso(doc.completedAt),
    status: doc.status,
    recall: doc.recall ?? "",
    observation: doc.observation ?? "",
    nextAction: doc.nextAction ?? "",
    reviewIndex: Number(doc.reviewIndex ?? 0),
    nextReviewAt: iso(doc.nextReviewAt),
    lastReviewedAt: iso(doc.lastReviewedAt),
  };
}

async function objectId(value: string) {
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(value)) throw new Error("INVALID_ID");
  return new ObjectId(value);
}

async function assertActiveCycle(clerkId: string, cycleId: string) {
  const db = await getAdminDb();
  const cycles = db.collection<Record<string, unknown>>(CYCLE_COLLECTION);
  const _id = await objectId(cycleId);
  const cycle = await cycles.findOne({ _id, clerkId, status: "ACTIVE" });
  if (!cycle) throw new Error("ACTIVE_CYCLE_NOT_FOUND");
  return _id;
}

export async function getLearningDashboard(clerkId: string): Promise<GrindLearningDashboardDTO> {
  const db = await getAdminDb();
  const sessions = db.collection<LearningSessionDoc>(LEARNING_COLLECTION);
  const now = new Date();

  const activeDoc = await sessions.findOne(
    { clerkId, status: "ACTIVE" },
    { sort: { startedAt: -1 } },
  );

  const dueDocs = await sessions
    .find({
      clerkId,
      status: "COMPLETED",
      nextReviewAt: { $ne: null, $lte: now },
    })
    .sort({ nextReviewAt: 1 })
    .limit(6)
    .toArray();

  const recentDocs = await sessions
    .find({ clerkId, status: "COMPLETED" })
    .sort({ completedAt: -1 })
    .limit(8)
    .toArray();

  return {
    activeSession: activeDoc ? dto(activeDoc) : null,
    dueReviews: dueDocs.map(dto),
    recentSessions: recentDocs.map(dto),
  };
}

export async function startImmersionSession(args: {
  clerkId: string;
  cycleId: string;
  clue: string;
  attentionCue: string;
  durationMinutes: number;
}) {
  const db = await getAdminDb();
  const sessions = db.collection<LearningSessionDoc>(LEARNING_COLLECTION);
  const cycleObjectId = await assertActiveCycle(args.clerkId, args.cycleId);

  const durationMinutes = Math.min(45, Math.max(5, Math.round(args.durationMinutes || 10)));
  const clue = args.clue.trim().slice(0, 240);
  const attentionCue = args.attentionCue.trim().slice(0, 500);
  if (!clue || !attentionCue) throw new Error("MISSING_IMMERSION_INPUT");

  const now = new Date();
  const existing = await sessions.findOne({ clerkId: args.clerkId, status: "ACTIVE" });
  if (existing) return dto(existing);

  const endsAt = new Date(now.getTime() + durationMinutes * 60_000);
  const insert = await sessions.insertOne({
    clerkId: args.clerkId,
    cycleId: cycleObjectId,
    clue,
    attentionCue,
    durationMinutes,
    startedAt: now,
    endsAt,
    completedAt: null,
    status: "ACTIVE",
    recall: "",
    observation: "",
    nextAction: "",
    reviewIndex: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    reviews: [],
    createdAt: now,
    updatedAt: now,
  });

  const created = await sessions.findOne({ _id: insert.insertedId });
  if (!created) throw new Error("LEARNING_SESSION_CREATE_FAILED");
  return dto(created);
}

export async function completeImmersionSession(args: {
  clerkId: string;
  sessionId: string;
  recall: string;
  observation: string;
  nextAction?: string;
}) {
  const db = await getAdminDb();
  const sessions = db.collection<LearningSessionDoc>(LEARNING_COLLECTION);
  const _id = await objectId(args.sessionId);
  const now = new Date();

  const recall = args.recall.trim().slice(0, 1500);
  const observation = args.observation.trim().slice(0, 1500);
  const nextAction = (args.nextAction ?? "").trim().slice(0, 600);
  if (!recall || !observation) throw new Error("MISSING_DEBRIEF");

  await sessions.updateOne(
    { _id, clerkId: args.clerkId, status: "ACTIVE" },
    {
      $set: {
        status: "COMPLETED",
        completedAt: now,
        recall,
        observation,
        nextAction,
        reviewIndex: 0,
        nextReviewAt: addDays(now, REVIEW_INTERVAL_DAYS[0]),
        updatedAt: now,
      },
    },
  );

  const updated = await sessions.findOne({ _id, clerkId: args.clerkId });
  if (!updated) throw new Error("LEARNING_SESSION_NOT_FOUND");
  return dto(updated);
}

export async function reviewLearningSession(args: {
  clerkId: string;
  sessionId: string;
  recall: string;
}) {
  const db = await getAdminDb();
  const sessions = db.collection<LearningSessionDoc>(LEARNING_COLLECTION);
  const _id = await objectId(args.sessionId);
  const session = await sessions.findOne({ _id, clerkId: args.clerkId, status: "COMPLETED" });
  if (!session) throw new Error("LEARNING_SESSION_NOT_FOUND");

  const recall = args.recall.trim().slice(0, 1500);
  if (!recall) throw new Error("MISSING_RECALL");

  const now = new Date();
  const currentIndex = Math.max(0, Number(session.reviewIndex ?? 0));
  const nextIndex = currentIndex + 1;
  const nextInterval = REVIEW_INTERVAL_DAYS[nextIndex] ?? null;

  await sessions.updateOne(
    { _id, clerkId: args.clerkId },
    {
      $set: {
        reviewIndex: nextIndex,
        lastReviewedAt: now,
        nextReviewAt: nextInterval === null ? null : addDays(now, nextInterval),
        updatedAt: now,
      },
      $push: {
        reviews: {
          at: now,
          recall,
          stage: nextIndex,
        },
      },
    },
  );

  const updated = await sessions.findOne({ _id, clerkId: args.clerkId });
  if (!updated) throw new Error("LEARNING_SESSION_NOT_FOUND");
  return dto(updated);
}

export async function abandonImmersionSession(clerkId: string, sessionId: string) {
  const db = await getAdminDb();
  const sessions = db.collection<LearningSessionDoc>(LEARNING_COLLECTION);
  const _id = await objectId(sessionId);
  const now = new Date();
  await sessions.updateOne(
    { _id, clerkId, status: "ACTIVE" },
    { $set: { status: "ABANDONED", updatedAt: now } },
  );
}
