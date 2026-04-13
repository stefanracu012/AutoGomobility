/**
 * One-time: stamp driverToken on all existing Booking docs that don't have one.
 * Uses $runCommandRaw to bypass Prisma type system (field not generated yet).
 * Run with:  npx tsx scripts/seed-driver-tokens.ts
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  // Use runCommandRaw to find all bookings without a driverToken
  const result = await prisma.$runCommandRaw({
    find: "Booking",
    filter: { driverToken: { $exists: false } },
    projection: { _id: 1 },
  }) as { cursor: { firstBatch: Array<{ _id: { $oid: string } | string }> } };

  const ids = result.cursor.firstBatch;
  console.log(`Found ${ids.length} bookings without driverToken`);

  for (const doc of ids) {
    const token = randomBytes(16).toString("hex");
    const rawId = doc._id;
    const oidStr = typeof rawId === "object" && "$oid" in rawId ? rawId.$oid : String(rawId);
    await prisma.$runCommandRaw({
      update: "Booking",
      updates: [
        {
          q: { _id: { $oid: oidStr } },
          u: { $set: { driverToken: token } },
        },
      ],
    });
    console.log(`  Updated ${oidStr} -> ${token}`);
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
