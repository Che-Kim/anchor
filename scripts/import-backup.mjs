/**
 * One-off restore of the pre-Postgres SQLite export in prisma/backup/.
 *
 *   SEED_VISITOR_ID=<your anchor_vid cookie> node scripts/import-backup.mjs
 *
 * Find the cookie in DevTools → Application → Cookies → anchor_vid after
 * loading the app once. Rows imported under any other id simply won't show,
 * because every read is scoped to the visitor.
 */
import { readFileSync } from "node:fs";
import { Client } from "pg";

const visitorId = process.env.SEED_VISITOR_ID;
if (!visitorId) {
  console.error("SEED_VISITOR_ID is required — see the comment in this file.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const read = (name) => {
  try {
    return JSON.parse(readFileSync(`prisma/backup/${name}.json`, "utf8"));
  } catch {
    return [];
  }
};

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let checkIns = 0;
for (const c of read("checkins")) {
  await client.query(
    `INSERT INTO "CheckIn" (id, "visitorId", mood, "stressLevel", note, "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
    [c.id, visitorId, c.mood, c.stressLevel, c.note, new Date(c.createdAt)],
  );
  checkIns += 1;
}

let entries = 0;
for (const e of read("diary")) {
  await client.query(
    `INSERT INTO "DiaryEntry" ("visitorId", date, mode, content, mood, highlights, transcript, "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT ("visitorId", date) DO UPDATE SET content = EXCLUDED.content`,
    [
      visitorId,
      e.date,
      e.mode,
      e.content,
      e.mood,
      e.highlights,
      e.transcript,
      new Date(e.createdAt ?? Date.now()),
      new Date(e.updatedAt ?? Date.now()),
    ],
  );
  entries += 1;
}

await client.end();
console.log(`Imported ${checkIns} check-in(s) and ${entries} diary entr(y|ies).`);
