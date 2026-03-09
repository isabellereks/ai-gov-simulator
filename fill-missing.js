#!/usr/bin/env node
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

const MISSING_HOUSE = [
  "CA-20", "CA-44", "CO-3", "FL-14", "FL-28",
  "IL-3", "MN-7", "NY-9", "TN-7", "VA-9", "WA-8"
];

async function main() {
  const db = await loadProfiles();

  // ── Fix missing House seats ──
  console.log("Filling missing House seats:", MISSING_HOUSE.join(", "));
  const houseProfiles = await callAPI(
    "You are a congressional data analyst. Generate voting profiles for specific House seats in the 119th Congress. Return ONLY a valid JSON array.",
    `Generate profiles for the current 119th Congress House members holding these seats: ${MISSING_HOUSE.join(", ")}

If a seat is currently vacant, return {"name":"VACANT","state":"XX","district":0,"status":"vacant"}.

Schema:
{
  "name": "Full Name", "state": "XX", "district": number, "party": "R|D",
  "committees": ["Committee1"], "seniority": number, "tier": 2,
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
SCORING: 0.00=far left, 1.00=far right.`
  );

  const activeHouse = houseProfiles.filter(p => p.status !== "vacant");
  console.log(`Got ${activeHouse.length} House profiles`);
  for (const p of activeHouse) {
    const exists = db.house.find(h => h.state === p.state && h.district === p.district);
    if (!exists) { db.house.push(p); console.log(`  + ${p.name} (${p.state}-${p.district})`); }
    else console.log(`  = ${exists.name} already at ${p.state}-${p.district}`);
  }

  // ── Fix missing Senators ──
  // Check which senators from the 100-seat Senate are missing
  console.log("\nChecking Senate coverage...");
  console.log(`Current senators: ${db.senate.length}`);

  // Generate missing senators
  const senateNames = db.senate.map(s => s.name);
  const missingSenatorsResp = await callAPI(
    "You are a congressional data analyst. Identify senators from the 119th Congress (seated Jan 2025) who are NOT in the provided list. Return a JSON array of profiles for any missing active senators.",
    `Here are the ${senateNames.length} senators currently in our database:
${senateNames.join(", ")}

The 119th Congress Senate should have ~100 members (some seats may be vacant due to resignations/appointments).
List any ACTIVE senators who are missing from this list. Do NOT include senators who resigned, retired, or lost their elections.

For each missing senator, generate a profile:
{
  "name": "Full Name", "state": "XX", "party": "R|D|I",
  "committees": ["Committee1", "Committee2"], "seniority": number,
  "leadership": null | "Title",
  "class": 1|2|3,
  "issues": {
    "immigration": 0.00-1.00, "taxes_spending": 0.00-1.00, "healthcare": 0.00-1.00,
    "gun_rights": 0.00-1.00, "climate_energy": 0.00-1.00, "defense_military": 0.00-1.00,
    "education": 0.00-1.00, "tech_regulation": 0.00-1.00, "criminal_justice": 0.00-1.00,
    "trade_tariffs": 0.00-1.00, "abortion_social": 0.00-1.00, "government_spending": 0.00-1.00,
    "foreign_policy_hawks": 0.00-1.00, "civil_liberties": 0.00-1.00, "labor_unions": 0.00-1.00
  },
  "behavior": {
    "party_loyalty": 0.00-1.00, "bipartisan_index": 0.00-1.00,
    "lobby_susceptibility": 0.00-1.00, "media_sensitivity": 0.00-1.00,
    "deal_maker": 0.00-1.00, "ideological_rigidity": 0.00-1.00
  },
  "electoral": { "seat_safety": "safe|lean|toss-up", "last_margin": number, "next_election": 2026|2028|2030, "primary_vulnerable": true|false },
  "personality": {
    "archetype": "hawk|establishment|moderate|populist|progressive|libertarian|centrist",
    "temperament": "combative|measured|folksy|academic|fiery|reserved",
    "known_for": "One sentence",
    "pressure_point": "What could move them",
    "dealbreaker": "What makes them dig in"
  },
  "interests": ["industry1", "industry2"],
  "state_context": { "key_industries": ["industry1"], "hot_button": "Key local issue" }
}

If ALL senators are accounted for, return an empty array [].
SCORING: 0.00=far left, 1.00=far right. Use two decimal places.`
  );

  if (Array.isArray(missingSenatorsResp) && missingSenatorsResp.length > 0) {
    const activeSen = missingSenatorsResp.filter(p => !p.status || p.status !== "no_longer_serving");
    console.log(`Found ${activeSen.length} missing senators`);
    for (const s of activeSen) {
      const exists = db.senate.find(x => x.name === s.name);
      if (!exists) { db.senate.push(s); console.log(`  + ${s.name} (${s.party}-${s.state})`); }
      else console.log(`  = ${s.name} already exists`);
    }
  } else {
    console.log("No missing senators found (or empty response)");
  }

  // ── Save ──
  db.updated_at = new Date().toISOString();
  await saveProfiles(db);
  console.log(`\nFinal counts — Senate: ${db.senate.length}, House: ${db.house.length}`);
  console.log(`House: ${db.house.filter(h=>h.party==='R').length}R / ${db.house.filter(h=>h.party==='D').length}D`);
  console.log(`Senate: ${db.senate.filter(s=>s.party==='R').length}R / ${db.senate.filter(s=>s.party==='D').length}D / ${db.senate.filter(s=>s.party==='I').length}I`);

  // ── Regenerate govData.js ──
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
  console.log("✓ Done");
}

main().catch(e => { console.error(e); process.exit(1); });
