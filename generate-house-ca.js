#!/usr/bin/env node
// Fill California House delegation (~47 missing members)
// Split into sub-batches by district ranges

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

const SYSTEM = `You are a congressional data analyst with knowledge of every member of the 119th U.S. Congress. Generate lightweight voting profiles for California House members.

RULES:
1. List ALL current serving House members from California in the specified district range
2. Exclude any members listed as "already covered"
3. Base issue scores on actual DW-NOMINATE data and interest group ratings
4. Use two decimal places for all scores

Return ONLY a valid JSON array. No markdown fences.`;

const prompt = (districtRange, excludeNames) => `List ALL currently serving California House members from districts ${districtRange}.

ALREADY COVERED (do NOT include): ${excludeNames.join(", ")}

Schema:
{
  "name": "Full Name", "state": "CA", "district": number, "party": "R|D",
  "committees": ["Committee1", "Committee2"], "seniority": number, "tier": 2,
  "issues": {
    "immigration": 0.00-1.00, "taxes_spending": 0.00-1.00, "healthcare": 0.00-1.00,
    "gun_rights": 0.00-1.00, "climate_energy": 0.00-1.00, "defense_military": 0.00-1.00,
    "education": 0.00-1.00, "tech_regulation": 0.00-1.00, "criminal_justice": 0.00-1.00,
    "trade_tariffs": 0.00-1.00, "abortion_social": 0.00-1.00, "government_spending": 0.00-1.00,
    "foreign_policy_hawks": 0.00-1.00, "civil_liberties": 0.00-1.00, "labor_unions": 0.00-1.00
  },
  "behavior": { "party_loyalty": 0.00-1.00, "bipartisan_index": 0.00-1.00, "ideological_rigidity": 0.00-1.00 },
  "electoral": { "seat_safety": "safe|lean|toss-up", "last_margin": number },
  "personality": { "archetype": "hawk|establishment|moderate|populist|progressive|libertarian|centrist" }
}

SCORING: 0.00=far left, 1.00=far right.`;

async function main() {
  console.log("California House fill-in\n");

  const db = await loadProfiles();
  const existing = db.house;
  const caExisting = existing.filter(h => h.state === "CA");
  console.log(`Existing CA members: ${caExisting.length}`);
  const excludeNames = existing.map(p => p.name);

  const batches = [
    "1-13", "14-26", "27-39", "40-52"
  ];

  const newProfiles = [];
  for (let i = 0; i < batches.length; i++) {
    const range = batches[i];
    const allExclude = [...excludeNames, ...newProfiles.map(p => p.name)];
    console.log(`[${i+1}/${batches.length}] CA districts ${range}`);
    try {
      const profiles = await callAPI(SYSTEM, prompt(range, allExclude), 3);
      if (Array.isArray(profiles)) {
        const filtered = profiles.filter(p => !allExclude.some(n => n.toLowerCase() === p.name?.toLowerCase()));
        newProfiles.push(...filtered);
        console.log(`  ✓ Got ${filtered.length} profiles`);
      } else {
        console.log(`  ✗ Not an array`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }
    if (i < batches.length - 1) await sleep(2500);
  }

  console.log(`\nNew CA profiles: ${newProfiles.length}`);
  db.house = [...existing, ...newProfiles];
  db.updated_at = new Date().toISOString();

  const totalR = db.house.filter(p => p.party === "R").length;
  const totalD = db.house.filter(p => p.party === "D").length;
  console.log(`Total house: ${db.house.length} (${totalR}R / ${totalD}D)`);

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
        tier: h.tier || 2, issues: h.issues, behavior: h.behavior, electoral: h.electoral,
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
  await writeFile(new URL("./src/govData.js", import.meta.url),
    "// Auto-generated from government-profiles.json\nexport const DB = " + JSON.stringify(compact) + ";\n");
  console.log("✓ Updated src/govData.js\nDONE!");
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
