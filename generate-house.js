#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// HOUSE OF REPRESENTATIVES PROFILE GENERATOR
// Generates 435 House member profiles in two tiers:
//   Tier 1 (50 key members): Full profiles matching Senate schema
//   Tier 2 (~385 remaining): Lightweight profiles for vote simulation
// ═══════════════════════════════════════════════════════════════

// Load .env.local for API key (Next.js doesn't do this for standalone scripts)
import { readFileSync } from "fs";
try {
  const envContent = readFileSync(new URL("./.env.local", import.meta.url), "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch { /* no .env.local */ }

import { callAPI, chunk } from "./lib/generate.js";
import { loadProfiles, saveProfiles } from "./lib/db.js";
import { HOUSE_TIER1_ROSTER, STATE_GROUPS } from "./lib/house-roster.js";

const BETWEEN_BATCH_DELAY = 2500;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── TIER 1 SYSTEM PROMPT (full profiles, same quality as Senate) ──
const TIER1_SYSTEM = `You are a nonpartisan congressional research analyst with encyclopedic knowledge of every serving U.S. House member. You have access to:
- DW-NOMINATE scores from voteview.com
- Interest group ratings: NRA, LCV, ACLU, Heritage Action, AFL-CIO, NumbersUSA, FreedomWorks
- Complete roll-call voting records from the 118th-119th Congress
- Campaign finance data from OpenSecrets
- Biographical information

ACCURACY IS PARAMOUNT. These profiles drive a realistic policy simulation.

RULES:
1. Base ALL issue scores on ACTUAL voting records and interest group ratings
2. Every member is unique — ideology varies by issue dimension
3. District context matters — a Republican from a swing NYC-suburban district ≠ a Republican from rural Alabama
4. Capture known idiosyncrasies: Massie is libertarian, Crenshaw is establishment-hawk not MAGA, Golden is the most conservative Democrat
5. For members who resigned or left: return {"name": "...", "status": "no_longer_serving", "note": "reason"}
6. BIOGRAPHY must include real facts. If unsure, omit rather than fabricate.
7. LOBBYING data should reflect actual top industry donors from OpenSecrets.

Return ONLY a valid JSON array. No markdown fences, no commentary.`;

const tier1Prompt = (batch) => `Generate full profiles for these ${batch.length} House members:
${batch.map(m => `- ${m.name} (${m.party}-${m.state}-${m.district})${m.leadership ? ", " + m.leadership : ""}, committees: [${m.committees.join(", ")}], ${m.seniority}yr seniority${m.note ? " — NOTE: " + m.note : ""}`).join("\n")}

Return a JSON array. For any member who has left the House (resigned, retired, lost election), return: {"name": "...", "status": "no_longer_serving", "note": "reason"}

For active members, use this exact schema:
{
  "name": "Full Name",
  "state": "XX",
  "district": number,
  "party": "R|D",
  "committees": ["Committee1", "Committee2"],
  "seniority": number,
  "leadership": null | "Title string",
  "tier": 1,
  "issues": {
    "immigration": 0.00-1.00,
    "taxes_spending": 0.00-1.00,
    "healthcare": 0.00-1.00,
    "gun_rights": 0.00-1.00,
    "climate_energy": 0.00-1.00,
    "defense_military": 0.00-1.00,
    "education": 0.00-1.00,
    "tech_regulation": 0.00-1.00,
    "criminal_justice": 0.00-1.00,
    "trade_tariffs": 0.00-1.00,
    "abortion_social": 0.00-1.00,
    "government_spending": 0.00-1.00,
    "foreign_policy_hawks": 0.00-1.00,
    "civil_liberties": 0.00-1.00,
    "labor_unions": 0.00-1.00
  },
  "behavior": {
    "party_loyalty": 0.00-1.00,
    "bipartisan_index": 0.00-1.00,
    "lobby_susceptibility": 0.00-1.00,
    "media_sensitivity": 0.00-1.00,
    "deal_maker": 0.00-1.00,
    "ideological_rigidity": 0.00-1.00
  },
  "electoral": {
    "seat_safety": "safe|lean|toss-up",
    "last_margin": number,
    "next_election": 2026,
    "primary_vulnerable": true|false
  },
  "personality": {
    "archetype": "hawk|establishment|moderate|populist|progressive|libertarian|centrist",
    "temperament": "combative|measured|folksy|academic|fiery|reserved",
    "known_for": "One sentence — what defines this member",
    "pressure_point": "The argument that could move them",
    "dealbreaker": "The argument that makes them dig in"
  },
  "interests": ["industry1", "industry2", "industry3"],
  "state_context": {
    "key_industries": ["industry1", "industry2"],
    "hot_button": "The #1 local issue"
  },
  "biography": {
    "born": "City, State, Year",
    "age": number,
    "education": "Degrees and institutions",
    "career_before_politics": "Career history",
    "family": "Spouse, children",
    "military_service": null | "Details",
    "religion": "Affiliation",
    "personal_style": "How they present themselves",
    "notable_story": "One defining anecdote",
    "hobbies_interests": "Outside politics"
  },
  "lobbying": {
    "top_industries": ["industry1 with $amount", "industry2 with $amount"],
    "top_donors": ["Org1", "Org2"],
    "total_raised_last_cycle": "$X million",
    "pac_support": ["PAC1", "PAC2"],
    "notable_donor_conflicts": "Any conflicts",
    "lobbying_vulnerability": "Which industries have leverage"
  }
}

SCORING: 0.00=far left, 1.00=far right. Use two decimal places. A single member WILL have different scores across issues.`;

// ── TIER 2 SYSTEM PROMPT (lightweight — roster + profiles combined) ──
const TIER2_SYSTEM = `You are a congressional data analyst with knowledge of every member of the 119th U.S. Congress (seated January 2025). Generate lightweight voting profiles for House members based on actual voting records and DW-NOMINATE data.

RULES:
1. List ALL current serving House members from the specified states
2. Exclude any members listed as "already covered" — do NOT include them
3. Include members who won special elections to fill vacancies
4. If a seat is currently vacant, skip it
5. Base issue scores on ACTUAL DW-NOMINATE data and interest group ratings
6. District type matters: suburban swing districts produce moderates; safe rural/urban districts produce ideologues
7. Use two decimal places for all scores

Return ONLY a valid JSON array. No markdown fences, no commentary, no explanation.`;

const tier2Prompt = (stateGroup, alreadyCoveredNames) => `List ALL currently serving House members from these states: ${stateGroup.states.join(", ")}

ALREADY COVERED (do NOT include these): ${alreadyCoveredNames.join(", ")}

For each member, generate a lightweight profile with this exact schema:
{
  "name": "Full Name",
  "state": "XX",
  "district": number,
  "party": "R|D",
  "committees": ["Committee1", "Committee2"],
  "seniority": number (years in House),
  "tier": 2,
  "issues": {
    "immigration": 0.00-1.00,
    "taxes_spending": 0.00-1.00,
    "healthcare": 0.00-1.00,
    "gun_rights": 0.00-1.00,
    "climate_energy": 0.00-1.00,
    "defense_military": 0.00-1.00,
    "education": 0.00-1.00,
    "tech_regulation": 0.00-1.00,
    "criminal_justice": 0.00-1.00,
    "trade_tariffs": 0.00-1.00,
    "abortion_social": 0.00-1.00,
    "government_spending": 0.00-1.00,
    "foreign_policy_hawks": 0.00-1.00,
    "civil_liberties": 0.00-1.00,
    "labor_unions": 0.00-1.00
  },
  "behavior": {
    "party_loyalty": 0.00-1.00,
    "bipartisan_index": 0.00-1.00,
    "ideological_rigidity": 0.00-1.00
  },
  "electoral": {
    "seat_safety": "safe|lean|toss-up",
    "last_margin": number (margin of victory in percentage points)
  },
  "personality": {
    "archetype": "hawk|establishment|moderate|populist|progressive|libertarian|centrist"
  }
}

SCORING: 0.00 = far left (e.g., progressive Democrats in safe urban seats), 1.00 = far right (e.g., Freedom Caucus in safe rural seats).

IMPORTANT: Include EVERY serving member from these states. The 119th Congress House has 435 total members. Be thorough — do not skip anyone.`;

// ── MAIN GENERATION LOGIC ──
async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  HOUSE OF REPRESENTATIVES PROFILE GENERATOR");
  console.log("═══════════════════════════════════════════════════\n");

  const allProfiles = [];
  const errors = [];
  const startTime = Date.now();

  // ── PHASE 1: Tier 1 (full profiles) ──
  console.log("PHASE 1: Generating Tier 1 profiles (50 key members)...\n");
  const tier1Batches = chunk(HOUSE_TIER1_ROSTER, 5);

  for (let i = 0; i < tier1Batches.length; i++) {
    const batch = tier1Batches[i];
    const names = batch.map(m => m.name).join(", ");
    console.log(`  [T1 ${i + 1}/${tier1Batches.length}] Generating: ${names}`);

    try {
      const profiles = await callAPI(TIER1_SYSTEM, tier1Prompt(batch));
      if (Array.isArray(profiles)) {
        const active = profiles.filter(p => !p.status || p.status !== "no_longer_serving");
        const skipped = profiles.filter(p => p.status === "no_longer_serving");
        allProfiles.push(...active);
        if (skipped.length > 0) {
          console.log(`    ⚠ Skipped (no longer serving): ${skipped.map(s => s.name).join(", ")}`);
        }
        console.log(`    ✓ Got ${active.length} profiles`);
      } else {
        console.log(`    ✗ Response was not an array`);
        errors.push({ phase: "tier1", batch: i, names, error: "Not an array" });
      }
    } catch (err) {
      console.log(`    ✗ Error: ${err.message}`);
      errors.push({ phase: "tier1", batch: i, names, error: err.message });
    }

    if (i < tier1Batches.length - 1) await sleep(BETWEEN_BATCH_DELAY);
  }

  console.log(`\nPhase 1 complete: ${allProfiles.length} Tier 1 profiles\n`);

  // ── PHASE 2: Tier 2 (lightweight profiles by state group) ──
  console.log("PHASE 2: Generating Tier 2 profiles (remaining members by state)...\n");
  const coveredNames = allProfiles.map(p => p.name);
  // Also include Tier 1 roster names that may have been skipped (no longer serving)
  const allT1Names = HOUSE_TIER1_ROSTER.map(r => r.name);
  const excludeNames = [...new Set([...coveredNames, ...allT1Names])];

  for (let i = 0; i < STATE_GROUPS.length; i++) {
    const group = STATE_GROUPS[i];
    const stateExcludes = excludeNames.filter(n => {
      // Include all Tier 1 names to exclude (regardless of state, safer)
      return true;
    });
    console.log(`  [T2 ${i + 1}/${STATE_GROUPS.length}] ${group.label} (${group.states.join(", ")}) — ~${group.approxMembers} members`);

    try {
      const profiles = await callAPI(TIER2_SYSTEM, tier2Prompt(group, excludeNames), 3);
      if (Array.isArray(profiles)) {
        // Filter out any Tier 1 duplicates just in case
        const filtered = profiles.filter(p =>
          !excludeNames.some(n => n.toLowerCase() === p.name?.toLowerCase())
        );
        allProfiles.push(...filtered);
        console.log(`    ✓ Got ${filtered.length} profiles (${profiles.length - filtered.length} duplicates filtered)`);
        // Add new names to exclusion list
        filtered.forEach(p => excludeNames.push(p.name));
      } else {
        console.log(`    ✗ Response was not an array`);
        errors.push({ phase: "tier2", group: group.label, error: "Not an array" });
      }
    } catch (err) {
      console.log(`    ✗ Error: ${err.message}`);
      errors.push({ phase: "tier2", group: group.label, error: err.message });
    }

    if (i < STATE_GROUPS.length - 1) await sleep(BETWEEN_BATCH_DELAY);
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  GENERATION COMPLETE`);
  console.log(`  Total profiles: ${allProfiles.length}`);
  console.log(`  Tier 1: ${allProfiles.filter(p => p.tier === 1).length}`);
  console.log(`  Tier 2: ${allProfiles.filter(p => p.tier === 2).length}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Time: ${elapsed} minutes`);
  console.log(`═══════════════════════════════════════════════════\n`);

  if (errors.length > 0) {
    console.log("ERRORS:");
    errors.forEach(e => console.log(`  - ${e.phase} ${e.group || e.names}: ${e.error}`));
    console.log("");
  }

  // ── PHASE 3: Validate ──
  console.log("Validating profiles...");
  let warnings = 0;
  for (const p of allProfiles) {
    if (!p.issues) { console.log(`  ⚠ ${p.name}: missing issues`); warnings++; }
    else {
      const vals = Object.values(p.issues);
      if (vals.some(v => v < 0 || v > 1)) { console.log(`  ⚠ ${p.name}: issue score out of range`); warnings++; }
      if (vals.every(v => v === vals[0])) { console.log(`  ⚠ ${p.name}: all issue scores identical`); warnings++; }
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (p.party === "D" && avg > 0.65) { console.log(`  ⚠ ${p.name}: Democrat with high conservative avg (${avg.toFixed(2)})`); warnings++; }
      if (p.party === "R" && avg < 0.35) { console.log(`  ⚠ ${p.name}: Republican with low conservative avg (${avg.toFixed(2)})`); warnings++; }
    }
    if (!p.behavior) { console.log(`  ⚠ ${p.name}: missing behavior`); warnings++; }
  }
  console.log(`Validation: ${warnings} warnings\n`);

  // ── PHASE 4: Party breakdown ──
  const reps = allProfiles.filter(p => p.party === "R").length;
  const dems = allProfiles.filter(p => p.party === "D").length;
  console.log(`Party breakdown: ${reps}R / ${dems}D (total ${reps + dems})`);
  if (reps + dems < 400) {
    console.log("⚠ WARNING: Fewer than 400 members generated. Some may be missing.");
  }

  // ── PHASE 5: Merge into database ──
  console.log("\nSaving to database...");
  const db = (await loadProfiles()) || {
    generated_at: new Date().toISOString(),
    version: "1.0",
    senate: [],
    executive: [],
    scotus: [],
  };
  db.house = allProfiles;
  db.updated_at = new Date().toISOString();
  await saveProfiles(db);
  console.log("✓ Saved to data/government-profiles.json");

  // ── PHASE 6: Update govData.js ──
  console.log("\nUpdating src/govData.js...");
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
      // Tier 1 gets extra fields
      if (h.tier === 1) {
        base.personality.temperament = h.personality?.temperament;
        base.personality.known_for = h.personality?.known_for;
        base.interests = h.interests;
      }
      return base;
    }),
  };

  const govDataContent = "// Auto-generated from government-profiles.json\nexport const DB = " + JSON.stringify(compact) + ";\n";
  const { writeFile } = await import("fs/promises");
  await writeFile(new URL("./src/govData.js", import.meta.url), govDataContent);
  console.log("✓ Updated src/govData.js\n");

  console.log("DONE! Run `npm run dev` to see the updated simulator.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
