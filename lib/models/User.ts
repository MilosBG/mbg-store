import "server-only";

export type UserDocument = import("mongoose").Document & {
  clerkId: string;
  wishlist: string[];
  createdAt: Date;
  updatedAt: Date;
};

let userModelPromise: Promise<import("mongoose").Model<UserDocument>> | null = null;

async function createUserModel() {
  const mongoose = await import("mongoose");

  const userSchema = new mongoose.Schema<UserDocument>({
    clerkId: { type: String, index: true, unique: true, required: true },
    wishlist: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

  return (mongoose.models.User as import("mongoose").Model<UserDocument> | undefined) ??
    mongoose.model<UserDocument>("User", userSchema);
}

export async function getUserModel(): Promise<import("mongoose").Model<UserDocument>> {
  if (!userModelPromise) {
    userModelPromise = createUserModel();
  }
  return userModelPromise;
}
