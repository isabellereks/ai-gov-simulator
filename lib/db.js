import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "government-profiles.json");

export async function saveProfiles(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  return DB_PATH;
}

export async function loadProfiles() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveBranch(branch, profiles) {
  const db = (await loadProfiles()) || {
    generated_at: new Date().toISOString(),
    version: "1.0",
    senate: [],
    executive: [],
    scotus: [],
  };
  db[branch] = profiles;
  db.updated_at = new Date().toISOString();
  await saveProfiles(db);
  return db;
}
