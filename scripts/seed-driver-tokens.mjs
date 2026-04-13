/**
 * One-time script: stamp driverToken on all existing Booking documents
 * that don't have one yet, so the unique index can be created.
 */
import { MongoClient } from "mongodb";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read DATABASE_URL from .env
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
if (!match) throw new Error("DATABASE_URL not found in .env");
const url = match[1].trim();

const client = new MongoClient(url);

async function main() {
  await client.connect();
  const db = client.db(); // uses the db from the connection string
  const col = db.collection("Booking");

  const bookings = await col.find({ driverToken: { $in: [null, undefined] }, $nor: [{ driverToken: { $exists: true, $ne: null } }] }).toArray();
  // Simpler: just find all with no driverToken
  const all = await col.find({}).toArray();
  const needsToken = all.filter(b => !b.driverToken);

  console.log(`Found ${needsToken.length} bookings without driverToken`);

  for (const booking of needsToken) {
    const token = randomBytes(16).toString("hex");
    await col.updateOne({ _id: booking._id }, { $set: { driverToken: token } });
    console.log(`  Updated ${booking._id} → ${token}`);
  }

  console.log("Done!");
  await client.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
