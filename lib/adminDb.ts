import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URL;

if (!uri) {
  throw new Error("MONGODB_URL environment variable is not defined");
}

let clientPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getAdminDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db("Mbg_Admin");
}
