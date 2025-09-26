import "server-only";

let isConnected = false;
let mongooseModulePromise: Promise<typeof import("mongoose")> | null = null;

async function loadMongoose() {
  if (!mongooseModulePromise) {
    mongooseModulePromise = import("mongoose");
  }
  return mongooseModulePromise;
}

export const connectToDB = async (): Promise<void> => {
  const mongoose = await loadMongoose();
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("using existing database connection");
    return;
  }

  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error("MONGODB_URL environment variable is not defined");
  }

  try {
    await mongoose.connect(uri, {
      dbName: "Mbg_Store",
    });

    isConnected = true;
    console.log("MongoDB is connected");
  } catch (err) {
    console.log(err);
  }
};
