import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const LegalSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "main",
      trim: true,
    },
    businessAddress: {
      type: String,
      default: "",
      trim: true,
    },
    rneRegistration: {
      type: String,
      default: "",
      trim: true,
    },
    repTextileIdu: {
      type: String,
      default: "",
      trim: true,
    },
    returnAddress: {
      type: String,
      default: "",
      trim: true,
    },
    emailProvider: {
      type: String,
      default: "",
      trim: true,
    },
    carrier: {
      type: String,
      default: "",
      trim: true,
    },
    termsLastUpdated: {
      type: String,
      default: "2026-09-25",
      trim: true,
    },
    privacyLastUpdated: {
      type: String,
      default: "2026-09-25",
      trim: true,
    },
    legalNoticeLastUpdated: {
      type: String,
      default: "2026-09-25",
      trim: true,
    },
    updatedBy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "legal_settings",
  },
);

export type LegalSettingsShape = InferSchemaType<
  typeof LegalSettingsSchema
>;

const existingModel = mongoose.models.LegalSettings as
  | Model<LegalSettingsShape>
  | undefined;

const LegalSettings: Model<LegalSettingsShape> =
  existingModel ??
  mongoose.model<LegalSettingsShape>(
    "LegalSettings",
    LegalSettingsSchema,
  );

export default LegalSettings;
