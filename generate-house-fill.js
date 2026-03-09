#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// FILL-IN SCRIPT: Re-generate failed state batches with smaller groups
// Targets: Mid-Atlantic, Southeast, Midwest-East, Pacific
// ═══════════════════════════════════════════════════════════════

import { readFileSync } from "fs";
try {
  const envContent = readFileSync(new URL("./.env.local", import.meta.url), "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

import { callAPI } from "./lib/generate.js";
import { loadProfiles, saveProfiles } from "./lib/db.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));

const TIER2_SYSTEM = `You are a congressional data analyst with knowledge of every member of the 119th U.S. Congress (seated January 2025). Generate lightweight voting profiles for House members based on actual voting records and DW-NOMINATE data.

RULES:
1. List ALL current serving House members from the specified states
2. Exclude any members listed as "already covered" — do NOT include them
3. Include members who won special elections to fill vacancies
4. If a seat is currently vacant, skip it
5. Base issue scores on ACTUAL DW-NOMINATE data and interest group ratings
6. District type matters: suburban swing districts produce moderates; safe rural/urban districts produce ideologues
7. Use two decimal places for all scores

Return ONLY a valid JSON array. No markdown fences, no commentary.`;

const tier2Prompt = (states, excludeNames) => `List ALL currently serving House members from these states: ${states.join(", ")}

ALREADY COVERED (do NOT include these): ${excludeNames.join(", ")}

For each member, generate a lightweight profile:
{
  "name": "Full Name",
  "state": "XX",
  "district": number,
  "party": "R|D",
  "committees": ["Committee1", "Committee2"],
  "seniority": number,
  "tier": 2,
  "issues": {
    "immigration": 0.00-1.00, "taxes_spending": 0.00-1.00, "healthcare": 0.00-1.00,
    "gun_rights": 0.00-1.00, "climate_energy": 0.00-1.00, "defense_military": 0.00-1.00,
    "education": 0.00-1.00, "tech_regulation": 0.00-1.00, "criminal_justice": 0.00-1.00,
    "trade_tariffs": 0.00-1.00, "abortion_social": 0.00-1.00, "government_spending": 0.00-1.00,
    "foreign_policy_hawks": 0.00-1.00, "civil_liberties": 0.00-1.00, "labor_unions": 0.00-1.00
  },
  "behavior": {
    "party_loyalty": 0.00-1.00,
    "bipartisan_index": 0.00-1.00,
    "ideological_rigidity": 0.00-1.00
  },
  "electoral": {
    "seat_safety": "safe|lean|toss-up",
    "last_margin": number
  },
  "personality": {
    "archetype": "hawk|establishment|moderate|populist|progressive|libertarian|centrist"
  }
}

SCORING: 0.00=far left, 1.00=far right. Use two decimal places. Include EVERY serving member.`;

// Split failed batches into smaller chunks (max ~20 members per call)
const FILL_BATCHES = [
  // Mid-Atlantic — split into 3
  { label: "New Jersey", states: ["NJ"] },
  { label: "New York", states: ["NY"] },
  { label: "Pennsylvania", states: ["PA"] },
  // Southeast — split into 4
  { label: "Florida", states: ["FL"] },
  { label: "Georgia + South Carolina", states: ["GA", "SC"] },
  { label: "Virginia + Maryland + Delaware + DC", states: ["VA", "MD", "DE", "DC"] },
  { label: "North Carolina", states: ["NC"] },
  // Midwest East — split into 3
  { label: "Illinois", states: ["IL"] },
  { label: "Ohio", states: ["OH"] },
  { label: "Indiana + Michigan + Wisconsin", states: ["IN", "MI", "WI"] },
  // Pacific — split into 3
  { label: "California (north)", states: ["CA"] },  // Will need special handling for 52 members
  { label: "Oregon + Washington + Alaska + Hawaii", states: ["OR", "WA", "AK", "HI"] },
];

async function main() {
  console.log("═══════════════════════════════════");
  console.log("  HOUSE FILL-IN GENERATION");
  console.log("═══════════════════════════════════\n");

  const db = await loadProfiles();
  if (!db || !db.house) { console.error("No house data found"); process.exit(1); }

  const existing = db.house;
  const existingNames = existing.map(p => p.name);
  console.log(`Existing profiles: ${existing.length}`);
  console.log(`Existing names count: ${existingNames.length}\n`);

  const newProfiles = [];
  const errors = [];

  for (let i = 0; i < FILL_BATCHES.length; i++) {
    const batch = FILL_BATCHES[i];
    // Get names to exclude for these states
    const allExclude = [...existingNames, ...newProfiles.map(p => p.name)];
    console.log(`[${i + 1}/${FILL_BATCHES.length}] ${batch.label} (${batch.states.join(", ")})`);

    try {
      const profiles = await callAPI(TIER2_SYSTEM, tier2Prompt(batch.states, allExclude), 3);
      if (Array.isArray(profiles)) {
        const filtered = profiles.filter(p =>
          !allExclude.some(n => n.toLowerCase() === p.name?.toLowerCase())
        );
        newProfiles.push(...filtered);
        console.log(`  ✓ Got ${filtered.length} profiles (${profiles.length - filtered.length} dupes filtered)`);
      } else {
        console.log(`  ✗ Not an array`);
        errors.push(batch.label);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
      errors.push(batch.label);
    }

    if (i < FILL_BATCHES.length - 1) await sleep(2500);
  }

  console.log(`\nNew profiles generated: ${newProfiles.length}`);
  if (errors.length > 0) console.log(`Errors: ${errors.join(", ")}`);

  // Merge
  db.house = [...existing, ...newProfiles];
  db.updated_at = new Date().toISOString();
  console.log(`\nTotal house profiles: ${db.house.length}`);
  const reps = db.house.filter(p => p.party === "R").length;
  const dems = db.house.filter(p => p.party === "D").length;
  console.log(`Party: ${reps}R / ${dems}D`);

  await saveProfiles(db);
  console.log("✓ Saved to database");

  // Regenerate govData.js
  const compact = {
    senate: db.senate.map(s => ({
      name: s.name, state: s.state, party: s.party, committees: s.committees,
      leadership: s.leadership, issues: s.issues, behavior: s.behavior,
      personality: { archetype: s.personality?.archetype, temperament: s.personality?.temperament, known_for: s.personality?.known_for },
      interests: s.interests, electoral: s.electoral,
    })),
    executive: db.executive.map(e => ({
      name: e.name, role: e.role, department: e.department, issues: e.issues,
      executive_behavior: e.executive_behavior, veto_factors: e.veto_factors,
      personality: { archetype: e.personality?.archetype, temperament: e.personality?.temperament, known_for: e.personality?.known_for },
      department_interests: e.department_interests,
    })),
    scotus: db.scotus.map(j => ({
      name: j.name, role: j.role, appointed_by: j.appointed_by, year_appointed: j.year_appointed,
      judicial_philosophy: j.judicial_philosophy, constitutional_issues: j.constitutional_issues,
      judicial_behavior: j.judicial_behavior,
      personality: { temperament: j.personality?.temperament, known_for: j.personality?.known_for },
    })),
    house: db.house.map(h => {
      const base = {
        name: h.name, state: h.state, district: h.district, party: h.party,
        committees: h.committees, seniority: h.seniority, leadership: h.leadership,
        tier: h.tier || 2, issues: h.issues, behavior: h.behavior,
        electoral: h.electoral,
        personality: { archetype: h.personality?.archetype },
      };
      if (h.tier === 1) {
        base.personality.temperament = h.personality?.temperament;
        base.personality.known_for = h.personality?.known_for;
        base.interests = h.interests;
      }
      return base;
    }),
  };

  const { writeFile } = await import("fs/promises");
  await writeFile(
    new URL("./src/govData.js", import.meta.url),
    "// Auto-generated from government-profiles.json\nexport const DB = " + JSON.stringify(compact) + ";\n"
  );
  console.log("✓ Updated src/govData.js");
  console.log("\nDONE!");
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
