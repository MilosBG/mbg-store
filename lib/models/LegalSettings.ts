import mongoose, { Schema, type Model } from "mongoose";

export type LegalTrackerCategory =
  | "ANALYTICS"
  | "ADVERTISING"
  | "PERSONALIZATION"
  | "SOCIAL"
  | "OTHER";

export type LegalTrackerShape = {
  provider: string;
  name: string;
  purposeFr: string;
  purposeEn: string;
  duration: string;
  category: LegalTrackerCategory;
};

export type LegalSettingsShape = {
  key: string;
  businessAddress: string;
  rneRegistration: string;
  repTextileIdu: string;
  returnAddress: string;
  emailProvider: string;
  carrier: string;
  trackers: LegalTrackerShape[];
  termsLastUpdated: string;
  privacyLastUpdated: string;
  legalNoticeLastUpdated: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const LegalTrackerSchema = new Schema<LegalTrackerShape>(
  {
    provider: { type: String, default: "", trim: true },
    name: { type: String, default: "", trim: true },
    purposeFr: { type: String, default: "", trim: true },
    purposeEn: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: ["ANALYTICS", "ADVERTISING", "PERSONALIZATION", "SOCIAL", "OTHER"],
      default: "OTHER",
    },
  },
  { _id: false },
);

const LegalSettingsSchema = new Schema<LegalSettingsShape>(
  {
    key: { type: String, required: true, unique: true, default: "main", trim: true },
    businessAddress: { type: String, default: "", trim: true },
    rneRegistration: { type: String, default: "", trim: true },
    repTextileIdu: { type: String, default: "", trim: true },
    returnAddress: { type: String, default: "", trim: true },
    emailProvider: { type: String, default: "", trim: true },
    carrier: { type: String, default: "", trim: true },
    trackers: { type: [LegalTrackerSchema], default: [] },
    termsLastUpdated: { type: String, default: "2026-09-28", trim: true },
    privacyLastUpdated: { type: String, default: "2026-09-28", trim: true },
    legalNoticeLastUpdated: { type: String, default: "2026-09-28", trim: true },
    updatedBy: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "legal_settings" },
);

const existingModel = mongoose.models.LegalSettings as
  | Model<LegalSettingsShape>
  | undefined;

const LegalSettings: Model<LegalSettingsShape> =
  existingModel ?? mongoose.model<LegalSettingsShape>("LegalSettings", LegalSettingsSchema);

export default LegalSettings;
