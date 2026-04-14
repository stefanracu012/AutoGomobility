/**
 * Seed MongoDB SiteSettings from local JSON data files.
 * Run once after first deploy: node scripts/seed-site-settings.mjs
 *
 * Requires DATABASE_URL to be set in .env.local or environment.
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const prisma = new PrismaClient();

const KEYS = ["fleet", "services", "pricing", "destinations", "locations"];

async function main() {
  console.log("🌱 Seeding SiteSettings from JSON files…\n");

  for (const key of KEYS) {
    const filePath = join(ROOT, "data", `${key}.json`);
    const value = JSON.parse(readFileSync(filePath, "utf-8"));

    await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    console.log(`  ✅ ${key}`);
  }

  console.log("\n✅ Done! SiteSettings seeded successfully.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    prisma.$disconnect();
    process.exit(1);
  });
