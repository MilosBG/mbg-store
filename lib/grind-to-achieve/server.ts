import "server-only";

import { getAdminDb } from "@/lib/adminDb";
import type {
  GTAChallengeDTO,
  GTADashboardDTO,
  GTAAttemptDTO,
  GTAAttemptStatus,
  GTAFocusCheck,
  GTAShadowDTO,
  GTAShadowStatus,
  GTAStatsDTO,
  GTAStreakSeriesDTO,
  GTABadgeAwardDTO,
} from "@/types/grind-achieve";
import type { ObjectId, WithId } from "mongodb";

const CHALLENGES = "grindChallenges";
const ATTEMPTS = "grindAttempts";
const SHADOWS = "grindShadowChallenges";
const SERIES = "grindStreakSeries";
const BADGES = "grindBadgeDefinitions";
const BADGE_AWARDS = "grindBadgeAwards";
const ORDERS = "orders";
const DURATION_SECONDS = 300;
const TZ = "Europe/Paris";

const PAID_STATES = new Set(["PAID", "SUCCEEDED", "SUCCESS", "CAPTURED", "COMPLETED"]);
const BLOCKED_STATES = new Set(["CANCELLED", "CANCELED", "REFUNDED", "FAILED", "DECLINED"]);

const iso = (value?: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const pct = (num: number, den: number) => (den <= 0 ? 0 : Math.round((num / den) * 100));

const dayKey = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const dayNumber = (key: string) => Math.floor(Date.parse(`${key}T12:00:00.000Z`) / 86400000);

async function objectId(value: string) {
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(value)) throw new Error("INVALID_ID");
  return new ObjectId(value);
}

function isConfirmedOrder(order: Record<string, unknown>) {
  const fulfillment = String(order.fulfillmentStatus ?? order.status ?? "").toUpperCase();
  if (BLOCKED_STATES.has(fulfillment)) return false;
  const payment = String(
    order.paymentStatus ?? order.payment_state ?? order.paymentState ?? order.financialStatus ?? order.payment ?? "",
  ).toUpperCase();
  if (payment) return PAID_STATES.has(payment);
  return fulfillment === "COMPLETED";
}

async function hasAccess(clerkId: string) {
  const db = await getAdminDb();
  const orders = db.collection<Record<string, unknown>>(ORDERS);
  const candidates = await orders.find({ customerClerkId: clerkId }).sort({ createdAt: -1 }).limit(30).toArray();
  return candidates.some(isConfirmedOrder);
}

type ChallengeDoc = {
  title: string;
  description?: string;
  category?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationSeconds?: number;
  audience?: { mode?: "ALL" | "SELECTED_HUSTLERS"; clerkIds?: string[] };
  publishAt?: Date | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  priority?: number;
  media?: string | null;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

type AttemptDoc = {
  clerkId: string;
  type: "ADMIN" | "SHADOW";
  challengeId?: ObjectId | null;
  shadowChallengeId?: ObjectId | null;
  title: string;
  description?: string;
  startedAt: Date;
  endsAt: Date;
  timerReachedZero: boolean;
  achievedAt?: Date | null;
  status: GTAAttemptStatus;
  focusCheck?: GTAFocusCheck | null;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

type ShadowDoc = {
  clerkId: string;
  baselineSeriesId: string;
  baselineLength: number;
  targetLength: number;
  currentRun: number;
  bestRun: number;
  attempts: number;
  breakCount: number;
  returnCount: number;
  status: GTAShadowStatus;
  startedAt: Date;
  wonAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type SeriesDoc = {
  clerkId: string;
  syntheticId: string;
  startedAt: Date;
  endedAt?: Date | null;
  length: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type BadgeDefinitionDoc = {
  code: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  iconKey: string;
  assignmentMode: "MANUAL" | "AUTOMATIC" | "BOTH";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type BadgeAwardDoc = {
  clerkId: string;
  badgeId: ObjectId;
  source: "ADMIN" | "SYSTEM";
  message?: string;
  awardedBy?: string | null;
  awardedAt: Date;
  revokedAt?: Date | null;
  revokedBy?: string | null;
};

function challengeDTO(doc: WithId<ChallengeDoc>): GTAChallengeDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    category: doc.category ?? "CHALLENGE",
    source: "ADMIN",
    durationSeconds: DURATION_SECONDS,
    media: doc.media ?? null,
    priority: Number(doc.priority ?? 0),
    startsAt: iso(doc.startsAt),
    endsAt: iso(doc.endsAt),
  };
}

function attemptDTO(doc: WithId<AttemptDoc>): GTAAttemptDTO {
  return {
    id: String(doc._id),
    clerkId: doc.clerkId,
    type: doc.type,
    challengeId: doc.challengeId ? String(doc.challengeId) : null,
    shadowChallengeId: doc.shadowChallengeId ? String(doc.shadowChallengeId) : null,
    title: doc.title,
    description: doc.description ?? "",
    startedAt: doc.startedAt.toISOString(),
    endsAt: doc.endsAt.toISOString(),
    timerReachedZero: Boolean(doc.timerReachedZero),
    achievedAt: iso(doc.achievedAt),
    status: doc.status,
    focusCheck: doc.focusCheck ?? null,
    note: doc.note ?? "",
  };
}

function shadowDTO(doc: WithId<ShadowDoc>): GTAShadowDTO {
  return {
    id: String(doc._id),
    clerkId: doc.clerkId,
    baselineSeriesId: doc.baselineSeriesId,
    baselineLength: doc.baselineLength,
    targetLength: doc.targetLength,
    currentRun: doc.currentRun,
    bestRun: doc.bestRun,
    attempts: doc.attempts,
    breakCount: doc.breakCount,
    returnCount: doc.returnCount,
    status: doc.status,
    startedAt: doc.startedAt.toISOString(),
    wonAt: iso(doc.wonAt),
  };
}

function seriesDTO(doc: WithId<SeriesDoc>): GTAStreakSeriesDTO {
  return {
    id: doc.syntheticId || String(doc._id),
    clerkId: doc.clerkId,
    startedAt: doc.startedAt.toISOString(),
    endedAt: iso(doc.endedAt),
    length: doc.length,
    active: doc.active,
  };
}

export async function listPublishedChallenges(clerkId: string) {
  const db = await getAdminDb();
  const now = new Date();
  const docs = await db.collection<ChallengeDoc>(CHALLENGES)
    .find({
      status: "PUBLISHED",
      $and: [
        { $or: [{ publishAt: null }, { publishAt: { $exists: false } }, { publishAt: { $lte: now } }] },
        { $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
        {
          $or: [
            { "audience.mode": "ALL" },
            { "audience.mode": { $exists: false } },
            { "audience.clerkIds": clerkId },
          ],
        },
      ],
    })
    .sort({ priority: -1, createdAt: -1 })
    .limit(30)
    .toArray();
  return docs.map(challengeDTO);
}

async function getAchievedAttempts(clerkId: string, limit = 500) {
  const db = await getAdminDb();
  return db.collection<AttemptDoc>(ATTEMPTS)
    .find({ clerkId, status: "ACHIEVED", achievedAt: { $ne: null } })
    .sort({ achievedAt: 1 })
    .limit(limit)
    .toArray();
}

function deriveSeries(achieved: WithId<AttemptDoc>[]) {
  const byDay = new Map<string, Date>();
  for (const attempt of achieved) {
    const at = attempt.achievedAt ?? attempt.endsAt;
    const key = dayKey(at);
    const existing = byDay.get(key);
    if (!existing || at < existing) byDay.set(key, at);
  }
  const days = [...byDay.keys()].sort();
  const result: Array<{ startKey: string; endKey: string; startedAt: Date; endedAt: Date; length: number; active: boolean }> = [];
  if (!days.length) return result;

  let start = days[0];
  let prev = days[0];
  for (let i = 1; i <= days.length; i += 1) {
    const current = days[i];
    if (current && dayNumber(current) - dayNumber(prev) === 1) {
      prev = current;
      continue;
    }
    const length = dayNumber(prev) - dayNumber(start) + 1;
    const today = dayKey();
    result.push({
      startKey: start,
      endKey: prev,
      startedAt: byDay.get(start) ?? new Date(`${start}T12:00:00Z`),
      endedAt: byDay.get(prev) ?? new Date(`${prev}T12:00:00Z`),
      length,
      active: dayNumber(today) - dayNumber(prev) <= 1,
    });
    if (!current) break;
    start = current;
    prev = current;
  }
  return result;
}

export async function rebuildStreakSeries(clerkId: string) {
  const db = await getAdminDb();
  const achieved = await getAchievedAttempts(clerkId);
  const derived = deriveSeries(achieved);
  const collection = db.collection<SeriesDoc>(SERIES);
  await collection.deleteMany({ clerkId });
  if (!derived.length) return [] as GTAStreakSeriesDTO[];
  const now = new Date();
  await collection.insertMany(
    derived.map((item) => ({
      clerkId,
      syntheticId: `${item.startKey}_${item.endKey}`,
      startedAt: item.startedAt,
      endedAt: item.active ? null : item.endedAt,
      length: item.length,
      active: item.active,
      createdAt: now,
      updatedAt: now,
    })),
  );
  const docs = await collection.find({ clerkId }).sort({ startedAt: -1 }).toArray();
  return docs.map(seriesDTO);
}

function hoursBetween(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / 3600000);
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function rateForDays(activeDayKeys: Set<string>, days: number, offsetDays = 0) {
  const nowKey = dayKey();
  const nowDay = dayNumber(nowKey);
  let active = 0;
  for (let i = 0; i < days; i += 1) {
    const target = nowDay - offsetDays - i;
    const date = new Date(target * 86400000 + 12 * 3600000);
    const key = date.toISOString().slice(0, 10);
    if (activeDayKeys.has(key)) active += 1;
  }
  return Math.round((active / days) * 100);
}

function weekLabel(date: Date) {
  const key = dayKey(date);
  const d = dayNumber(key);
  const monday = d - ((new Date(`${key}T12:00:00Z`).getUTCDay() + 6) % 7);
  return new Date(monday * 86400000 + 12 * 3600000).toISOString().slice(0, 10);
}

export async function calculateStats(clerkId: string): Promise<GTAStatsDTO> {
  const db = await getAdminDb();
  const attempts = await db.collection<AttemptDoc>(ATTEMPTS).find({ clerkId }).sort({ startedAt: 1 }).limit(1000).toArray();
  const achieved = attempts.filter((item) => item.status === "ACHIEVED" && item.achievedAt);
  const derived = deriveSeries(achieved);
  const activeDays = new Set(achieved.map((item) => dayKey(item.achievedAt ?? item.endsAt)));

  const currentStreak = derived.find((series) => series.active)?.length ?? 0;
  const bestStreak = derived.reduce((best, series) => Math.max(best, series.length), 0);
  const sevenDayRate = rateForDays(activeDays, 7);
  const twentyEightDayRate = rateForDays(activeDays, 28);
  const previousTwentyEightDayRate = rateForDays(activeDays, 28, 28);
  const progressionPoints = twentyEightDayRate - previousTwentyEightDayRate;
  const completionRate = pct(achieved.length, attempts.length);

  const breaks = Math.max(0, derived.length - (derived.some((s) => s.active) ? 1 : 0));
  const returns = Math.max(0, derived.length - 1);
  const returnRate = breaks === 0 ? 0 : pct(Math.min(returns, breaks), breaks);
  const recoveryHours: number[] = [];
  for (let i = 1; i < derived.length; i += 1) {
    recoveryHours.push(hoursBetween(derived[i - 1].endedAt, derived[i].startedAt));
  }
  const medianRecoveryHours = median(recoveryHours);
  const recoveryScore = medianRecoveryHours === null
    ? 0
    : medianRecoveryHours <= 24
      ? 100
      : medianRecoveryHours <= 48
        ? 80
        : medianRecoveryHours <= 72
          ? 60
          : medianRecoveryHours <= 168
            ? 40
            : 20;

  const shadows = await db.collection<ShadowDoc>(SHADOWS).find({ clerkId }).toArray();
  const shadowStarted = shadows.length;
  const shadowWon = shadows.filter((item) => item.status === "WON").length;
  const shadowWinRate = pct(shadowWon, shadowStarted);
  const bestComebackStreak = derived.slice(1).reduce((best, series) => Math.max(best, series.length), 0);
  const resilienceSamples = [breaks > 0 ? returnRate : null, shadowStarted > 0 ? shadowWinRate : null, medianRecoveryHours !== null ? recoveryScore : null].filter((v): v is number => v !== null);
  const resilienceRating = resilienceSamples.length
    ? Math.round(resilienceSamples.reduce((sum, value) => sum + value, 0) / resilienceSamples.length)
    : 0;

  const timerReached = attempts.filter((item) => item.timerReachedZero).length;
  const timerCompletionRate = pct(timerReached, attempts.length);
  const recentFocus = [...achieved].reverse().slice(0, 20);
  const focusScores: number[] = recentFocus
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
  const focusCheckAverage = focusScores.length ? Math.round(focusScores.reduce((a, b) => a + b, 0) / focusScores.length) : 0;
  const cleanSessions = achieved.filter((item) => item.timerReachedZero && item.focusCheck === "LOCKED_IN").length;
  const lastTen = [...achieved].reverse().slice(0, 10);
  const repeatFocusRate = pct(lastTen.filter((item) => item.timerReachedZero && item.focusCheck === "LOCKED_IN").length, lastTen.length);
  const focusRating = Math.round(timerCompletionRate * 0.7 + focusCheckAverage * 0.3);
  const consistencyRating = Math.round(twentyEightDayRate * 0.55 + sevenDayRate * 0.25 + completionRate * 0.2);

  const weeks = new Map<string, WithId<AttemptDoc>[]>();
  for (const attempt of attempts.slice(-250)) {
    const key = weekLabel(attempt.startedAt);
    weeks.set(key, [...(weeks.get(key) ?? []), attempt]);
  }
  const trend = [...weeks.entries()].slice(-8).map(([week, weekAttempts]) => {
    const achievedWeek = weekAttempts.filter((item) => item.status === "ACHIEVED");
    const focused: number[] = achievedWeek
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
    return {
      week,
      resilience: resilienceRating,
      consistency: pct(new Set(achievedWeek.map((item) => dayKey(item.achievedAt ?? item.endsAt))).size, 7),
      focus: focused.length ? Math.round(focused.reduce((a, b) => a + b, 0) / focused.length) : 0,
    };
  });

  return {
    totals: {
      sessionsStarted: attempts.length,
      sessionsAchieved: achieved.length,
      totalMinutes: achieved.length * 5,
      currentStreak,
      bestStreak,
    },
    resilience: {
      rating: clamp(resilienceRating),
      returnRate,
      medianRecoveryHours: medianRecoveryHours === null ? null : Math.round(medianRecoveryHours * 10) / 10,
      shadowWinRate,
      bestComebackStreak,
      returns,
      breaks,
    },
    consistency: {
      rating: clamp(consistencyRating),
      currentStreak,
      bestStreak,
      sevenDayRate,
      twentyEightDayRate,
      previousTwentyEightDayRate,
      progressionPoints,
      completionRate,
    },
    focus: {
      rating: clamp(focusRating),
      timerCompletionRate,
      focusCheckAverage,
      cleanSessions,
      repeatFocusRate,
    },
    trend,
  };
}

async function ensureDefaultBadgeDefinitions() {
  const db = await getAdminDb();
  const badges = db.collection<BadgeDefinitionDoc>(BADGES);
  const defaults = [
    ["ENCOURAGEMENT", "ENCOURAGEMENT", "ENCOURAGEMENT", "Recognition for visible effort and momentum.", "Reconnaissance d'un effort visible et d'une dynamique positive.", "HEART"],
    ["DONT_GIVE_UP", "DON'T GIVE UP", "N'ABANDONNE PAS", "Awarded for returning after a broken streak.", "Attribué après un retour réussi à la suite d'une série interrompue.", "RETURN"],
    ["EFFORT", "EFFORT", "EFFORT", "Recognition for accumulated 5-minute work.", "Reconnaissance de l'accumulation d'efforts de cinq minutes.", "FLAME"],
    ["CHALLENGER", "CHALLENGER", "CHALLENGER", "Started a Shadow Challenge.", "A lancé un Shadow Challenge.", "TARGET"],
    ["SHADOW_BREAKER", "SHADOW BREAKER", "SHADOW BREAKER", "Beat a previous personal streak.", "A dépassé une ancienne série personnelle.", "SHIELD"],
    ["CONSISTENT", "CONSISTENT", "CONSISTENT", "Built reliable participation over time.", "A construit une participation régulière dans le temps.", "REPEAT"],
    ["LOCKED_IN", "LOCKED IN", "LOCKED IN", "Built a strong record of focused sessions.", "A construit un historique solide de sessions concentrées.", "FOCUS"],
  ] as const;
  const now = new Date();
  for (const [code, nameEn, nameFr, descriptionEn, descriptionFr, iconKey] of defaults) {
    await badges.updateOne(
      { code },
      {
        $setOnInsert: {
          code,
          nameEn,
          nameFr,
          descriptionEn,
          descriptionFr,
          iconKey,
          assignmentMode: code === "ENCOURAGEMENT" ? "MANUAL" : "BOTH",
          active: true,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }
}

async function awardBadgeIfMissing(clerkId: string, code: string) {
  const db = await getAdminDb();
  const definitions = db.collection<BadgeDefinitionDoc>(BADGES);
  const awards = db.collection<BadgeAwardDoc>(BADGE_AWARDS);
  const badge = await definitions.findOne({ code, active: true });
  if (!badge) return;
  const existing = await awards.findOne({ clerkId, badgeId: badge._id, $or: [{ revokedAt: null }, { revokedAt: { $exists: false } }] });
  if (existing) return;
  await awards.insertOne({
    clerkId,
    badgeId: badge._id,
    source: "SYSTEM",
    message: "",
    awardedBy: null,
    awardedAt: new Date(),
    revokedAt: null,
    revokedBy: null,
  });
}

async function applyAutomaticBadges(clerkId: string, stats: GTAStatsDTO) {
  await ensureDefaultBadgeDefinitions();
  if (stats.totals.sessionsAchieved >= 10) await awardBadgeIfMissing(clerkId, "EFFORT");
  if (stats.resilience.returns >= 1) await awardBadgeIfMissing(clerkId, "DONT_GIVE_UP");
  if (stats.consistency.sevenDayRate >= 70 && stats.consistency.twentyEightDayRate >= 50) await awardBadgeIfMissing(clerkId, "CONSISTENT");
  if (stats.focus.repeatFocusRate >= 80 && stats.totals.sessionsAchieved >= 10) await awardBadgeIfMissing(clerkId, "LOCKED_IN");
  const db = await getAdminDb();
  const shadowCount = await db.collection<ShadowDoc>(SHADOWS).countDocuments({ clerkId });
  if (shadowCount > 0) await awardBadgeIfMissing(clerkId, "CHALLENGER");
  const shadowWon = await db.collection<ShadowDoc>(SHADOWS).countDocuments({ clerkId, status: "WON" });
  if (shadowWon > 0) await awardBadgeIfMissing(clerkId, "SHADOW_BREAKER");
}

export async function getBadgeAwards(clerkId: string, lang: "en" | "fr" = "en"): Promise<GTABadgeAwardDTO[]> {
  const db = await getAdminDb();
  await ensureDefaultBadgeDefinitions();
  const awards = await db.collection<BadgeAwardDoc>(BADGE_AWARDS)
    .find({ clerkId, $or: [{ revokedAt: null }, { revokedAt: { $exists: false } }] })
    .sort({ awardedAt: -1 })
    .toArray();
  if (!awards.length) return [];
  const ids = awards.map((item) => item.badgeId);
  const definitions = await db.collection<BadgeDefinitionDoc>(BADGES).find({ _id: { $in: ids } }).toArray();
  const byId = new Map(definitions.map((item) => [String(item._id), item]));
  return awards.flatMap((award) => {
    const badge = byId.get(String(award.badgeId));
    if (!badge) return [];
    return [{
      id: String(award._id),
      badgeId: String(badge._id),
      code: badge.code,
      name: lang === "fr" ? badge.nameFr : badge.nameEn,
      description: lang === "fr" ? badge.descriptionFr : badge.descriptionEn,
      iconKey: badge.iconKey,
      source: award.source,
      message: award.message ?? "",
      awardedAt: award.awardedAt.toISOString(),
    }];
  });
}

async function getActiveAttempt(clerkId: string) {
  const db = await getAdminDb();
  const attempts = db.collection<AttemptDoc>(ATTEMPTS);
  const doc = await attempts.findOne({ clerkId, status: "LIVE" }, { sort: { startedAt: -1 } });
  if (!doc) return null;
  if (Date.now() >= doc.endsAt.getTime() && !doc.timerReachedZero) {
    await attempts.updateOne({ _id: doc._id }, { $set: { timerReachedZero: true, updatedAt: new Date() } });
    doc.timerReachedZero = true;
  }
  return attemptDTO(doc);
}

async function getActiveShadow(clerkId: string) {
  const db = await getAdminDb();
  const doc = await db.collection<ShadowDoc>(SHADOWS).findOne({ clerkId, status: { $in: ["READY", "ACTIVE", "BROKEN", "RETURNED"] } }, { sort: { startedAt: -1 } });
  return doc ? shadowDTO(doc) : null;
}

export async function getDashboard(clerkId: string, lang: "en" | "fr" = "en"): Promise<GTADashboardDTO> {
  const unlocked = await hasAccess(clerkId);
  const emptyStats: GTAStatsDTO = {
    totals: { sessionsStarted: 0, sessionsAchieved: 0, totalMinutes: 0, currentStreak: 0, bestStreak: 0 },
    resilience: { rating: 0, returnRate: 0, medianRecoveryHours: null, shadowWinRate: 0, bestComebackStreak: 0, returns: 0, breaks: 0 },
    consistency: { rating: 0, currentStreak: 0, bestStreak: 0, sevenDayRate: 0, twentyEightDayRate: 0, previousTwentyEightDayRate: 0, progressionPoints: 0, completionRate: 0 },
    focus: { rating: 0, timerCompletionRate: 0, focusCheckAverage: 0, cleanSessions: 0, repeatFocusRate: 0 },
    trend: [],
  };
  if (!unlocked) return { unlocked, challenges: [], activeAttempt: null, activeShadow: null, historicalSeries: [], stats: emptyStats, badges: [] };

  const [challenges, activeAttempt, activeShadow, historicalSeries, stats] = await Promise.all([
    listPublishedChallenges(clerkId),
    getActiveAttempt(clerkId),
    getActiveShadow(clerkId),
    rebuildStreakSeries(clerkId),
    calculateStats(clerkId),
  ]);
  await applyAutomaticBadges(clerkId, stats);
  const badges = await getBadgeAwards(clerkId, lang);
  return { unlocked, challenges, activeAttempt, activeShadow, historicalSeries, stats, badges };
}

export async function startAttempt(args: { clerkId: string; challengeId?: string; shadowId?: string }) {
  if (!(await hasAccess(args.clerkId))) throw new Error("LOCKED");
  const db = await getAdminDb();
  const attempts = db.collection<AttemptDoc>(ATTEMPTS);
  const existing = await attempts.findOne({ clerkId: args.clerkId, status: "LIVE" });
  if (existing) return attemptDTO(existing);

  const now = new Date();
  let type: "ADMIN" | "SHADOW" = "ADMIN";
  let title = "5 MINUTE CHALLENGE";
  let description = "";
  let challengeId: ObjectId | null = null;
  let shadowChallengeId: ObjectId | null = null;

  if (args.shadowId) {
    type = "SHADOW";
    shadowChallengeId = await objectId(args.shadowId);
    const shadow = await db.collection<ShadowDoc>(SHADOWS).findOne({ _id: shadowChallengeId, clerkId: args.clerkId, status: { $in: ["READY", "ACTIVE", "BROKEN", "RETURNED"] } });
    if (!shadow) throw new Error("SHADOW_NOT_FOUND");
    title = `SHADOW ${shadow.baselineLength}`;
    description = `Beat your previous run of ${shadow.baselineLength}.`;
    await db.collection<ShadowDoc>(SHADOWS).updateOne(
      { _id: shadow._id },
      { $set: { status: "ACTIVE", updatedAt: now }, $inc: { attempts: 1 } },
    );
  } else {
    if (!args.challengeId) throw new Error("CHALLENGE_REQUIRED");
    challengeId = await objectId(args.challengeId);
    const challenge = await db.collection<ChallengeDoc>(CHALLENGES).findOne({ _id: challengeId, status: "PUBLISHED" });
    if (!challenge) throw new Error("CHALLENGE_NOT_FOUND");
    const audience = challenge.audience;
    if (audience?.mode === "SELECTED_HUSTLERS" && !audience.clerkIds?.includes(args.clerkId)) throw new Error("FORBIDDEN");
    title = challenge.title;
    description = challenge.description ?? "";
  }

  const endsAt = new Date(now.getTime() + DURATION_SECONDS * 1000);
  const result = await attempts.insertOne({
    clerkId: args.clerkId,
    type,
    challengeId,
    shadowChallengeId,
    title,
    description,
    startedAt: now,
    endsAt,
    timerReachedZero: false,
    achievedAt: null,
    status: "LIVE",
    focusCheck: null,
    note: "",
    createdAt: now,
    updatedAt: now,
  });
  const created = await attempts.findOne({ _id: result.insertedId });
  if (!created) throw new Error("ATTEMPT_CREATE_FAILED");
  return attemptDTO(created);
}

async function updateShadowAfterAchieve(clerkId: string, shadowId: ObjectId) {
  const db = await getAdminDb();
  const shadows = db.collection<ShadowDoc>(SHADOWS);
  const shadow = await shadows.findOne({ _id: shadowId, clerkId });
  if (!shadow) return;
  const series = await rebuildStreakSeries(clerkId);
  const currentRun = series.find((item) => item.active)?.length ?? 0;
  const bestRun = Math.max(shadow.bestRun, currentRun);
  const won = currentRun >= shadow.targetLength;
  const comebackDetected = shadow.currentRun > 1 && currentRun === 1;
  await shadows.updateOne(
    { _id: shadow._id },
    {
      $set: {
        currentRun,
        bestRun,
        status: won ? "WON" : comebackDetected ? "RETURNED" : "ACTIVE",
        wonAt: won ? new Date() : shadow.wonAt ?? null,
        updatedAt: new Date(),
      },
      ...(comebackDetected ? { $inc: { breakCount: 1, returnCount: 1 } } : {}),
    },
  );
}

export async function achieveAttempt(args: { clerkId: string; attemptId: string; focusCheck: GTAFocusCheck; note?: string }) {
  const db = await getAdminDb();
  const attempts = db.collection<AttemptDoc>(ATTEMPTS);
  const _id = await objectId(args.attemptId);
  const attempt = await attempts.findOne({ _id, clerkId: args.clerkId, status: "LIVE" });
  if (!attempt) throw new Error("ATTEMPT_NOT_FOUND");
  if (Date.now() < attempt.endsAt.getTime()) throw new Error("TIMER_NOT_FINISHED");
  const now = new Date();
  await attempts.updateOne(
    { _id, clerkId: args.clerkId, status: "LIVE" },
    {
      $set: {
        timerReachedZero: true,
        achievedAt: now,
        status: "ACHIEVED",
        focusCheck: args.focusCheck,
        note: (args.note ?? "").trim().slice(0, 600),
        updatedAt: now,
      },
    },
  );
  if (attempt.shadowChallengeId) await updateShadowAfterAchieve(args.clerkId, attempt.shadowChallengeId);
  await rebuildStreakSeries(args.clerkId);
  const stats = await calculateStats(args.clerkId);
  await applyAutomaticBadges(args.clerkId, stats);
  const updated = await attempts.findOne({ _id });
  if (!updated) throw new Error("ATTEMPT_NOT_FOUND");
  return attemptDTO(updated);
}

export async function createShadow(clerkId: string, seriesId: string) {
  if (!(await hasAccess(clerkId))) throw new Error("LOCKED");
  const db = await getAdminDb();
  const shadows = db.collection<ShadowDoc>(SHADOWS);
  const existing = await shadows.findOne({ clerkId, status: { $in: ["READY", "ACTIVE", "BROKEN", "RETURNED"] } });
  if (existing) return shadowDTO(existing);

  const series = await rebuildStreakSeries(clerkId);
  const baseline = series.find((item) => item.id === seriesId && !item.active);
  if (!baseline) throw new Error("SERIES_NOT_FOUND");
  const now = new Date();
  const result = await shadows.insertOne({
    clerkId,
    baselineSeriesId: baseline.id,
    baselineLength: baseline.length,
    targetLength: baseline.length + 1,
    currentRun: 0,
    bestRun: 0,
    attempts: 0,
    breakCount: 0,
    returnCount: 0,
    status: "READY",
    startedAt: now,
    wonAt: null,
    createdAt: now,
    updatedAt: now,
  });
  await awardBadgeIfMissing(clerkId, "CHALLENGER");
  const created = await shadows.findOne({ _id: result.insertedId });
  if (!created) throw new Error("SHADOW_CREATE_FAILED");
  return shadowDTO(created);
}

export async function abandonShadow(clerkId: string, shadowId: string) {
  const db = await getAdminDb();
  const _id = await objectId(shadowId);
  await db.collection<ShadowDoc>(SHADOWS).updateOne(
    { _id, clerkId, status: { $ne: "WON" } },
    { $set: { status: "ABANDONED", updatedAt: new Date() } },
  );
}
