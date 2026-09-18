export type GrindLearningStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export type GrindLearningSessionDTO = {
  id: string;
  clerkId: string;
  cycleId: string;
  clue: string;
  attentionCue: string;
  durationMinutes: number;
  startedAt: string;
  endsAt: string;
  completedAt: string | null;
  status: GrindLearningStatus;
  recall: string;
  observation: string;
  nextAction: string;
  reviewIndex: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
};

export type GrindLearningDashboardDTO = {
  activeSession: GrindLearningSessionDTO | null;
  dueReviews: GrindLearningSessionDTO[];
  recentSessions: GrindLearningSessionDTO[];
};
