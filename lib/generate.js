import Anthropic from "@anthropic-ai/sdk";

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;
const BETWEEN_BATCH_DELAY_MS = 2000;

let client;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

export async function callAPI(system, prompt, retries = RETRY_ATTEMPTS) {
  const anthropic = getClient();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        system,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content.map((c) => c.text || "").join("");
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(clean);
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        throw err;
      }
    }
  }
}

export function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export async function generateBranch(roster, system, promptFn, batchSize, onProgress) {
  const batches = chunk(roster, batchSize);
  const allProfiles = [];
  const errors = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const names = batch.map((m) => m.name.split(" ").pop()).join(", ");

    onProgress?.({
      type: "batch_start",
      batch: i + 1,
      total: batches.length,
      names,
    });

    try {
      const profiles = await callAPI(system, promptFn(batch));
      if (Array.isArray(profiles)) {
        const active = profiles.filter((p) => !p.status || p.status !== "no_longer_serving");
        allProfiles.push(...active);
        const skipped = profiles.length - active.length;
        onProgress?.({
          type: "batch_done",
          batch: i + 1,
          total: batches.length,
          count: active.length,
          skipped,
        });
      } else {
        errors.push({ batch: i, error: "Response was not an array" });
        onProgress?.({ type: "batch_error", batch: i + 1, error: "Not an array" });
      }
    } catch (err) {
      errors.push({ batch: i, members: batch.map((m) => m.name), error: err.message });
      onProgress?.({ type: "batch_error", batch: i + 1, error: err.message });
    }

    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, BETWEEN_BATCH_DELAY_MS));
    }
  }

  return { profiles: allProfiles, errors };
}

export function validateProfile(profile, type) {
  const warnings = [];
  const name = profile.name || "UNKNOWN";

  if (type === "senate") {
    if (!profile.issues) {
      warnings.push(`${name}: missing issues`);
    } else {
      const vals = Object.values(profile.issues);
      if (vals.some((v) => v < 0 || v > 1)) warnings.push(`${name}: issue score out of range`);
      if (vals.every((v) => v === vals[0])) warnings.push(`${name}: all issue scores identical`);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (profile.party === "D" && avg > 0.65) warnings.push(`${name}: Democrat with high conservative avg`);
      if (profile.party === "R" && avg < 0.35) warnings.push(`${name}: Republican with low conservative avg`);
    }
    if (!profile.behavior) warnings.push(`${name}: missing behavior`);
    if (!profile.personality) warnings.push(`${name}: missing personality`);
  }

  if (type === "scotus") {
    if (!profile.constitutional_issues) warnings.push(`${name}: missing constitutional_issues`);
    if (!profile.judicial_behavior) warnings.push(`${name}: missing judicial_behavior`);
    if (!profile.voting_patterns) warnings.push(`${name}: missing voting_patterns`);
  }

  if (type === "executive") {
    if (!profile.issues) warnings.push(`${name}: missing issues`);
    if (!profile.executive_behavior) warnings.push(`${name}: missing executive_behavior`);
    if (!profile.veto_factors) warnings.push(`${name}: missing veto_factors`);
  }

  return warnings;
}
