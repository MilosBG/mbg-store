import "server-only";

const connectionUri = process.env.MONGODB_URL;

if (!connectionUri) {
  throw new Error("MONGODB_URL environment variable is not defined");
}

const uri: string = connectionUri;

let clientPromise: Promise<import("mongodb").MongoClient> | null = null;

async function getMongoClient(): Promise<import("mongodb").MongoClient> {
  if (!clientPromise) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getAdminDb(): Promise<import("mongodb").Db> {
  const client = await getMongoClient();
  return client.db("Mbg_Admin");
}
