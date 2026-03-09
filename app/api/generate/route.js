import { SENATE_ROSTER, EXECUTIVE_ROSTER, SCOTUS_ROSTER } from "@/lib/rosters";
import { SENATE_SYSTEM, SENATE_PROMPT, EXEC_SYSTEM, EXEC_PROMPT, SCOTUS_SYSTEM, SCOTUS_PROMPT } from "@/lib/prompts";
import { generateBranch, validateProfile } from "@/lib/generate";
import { saveProfiles } from "@/lib/db";

export const maxDuration = 300; // 5 min max for serverless (increase if self-hosted)

// POST /api/generate — generates all profiles, streams progress via SSE
export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const db = {
          generated_at: new Date().toISOString(),
          version: "1.0",
          senate: [],
          executive: [],
          scotus: [],
        };

        // Senate
        send({ type: "branch_start", branch: "senate", total: SENATE_ROSTER.length });
        const senateResult = await generateBranch(
          SENATE_ROSTER,
          SENATE_SYSTEM,
          SENATE_PROMPT,
          5,
          (progress) => send({ ...progress, branch: "senate" })
        );
        db.senate = senateResult.profiles;
        send({ type: "branch_done", branch: "senate", count: db.senate.length, errors: senateResult.errors.length });

        // Executive
        send({ type: "branch_start", branch: "executive", total: EXECUTIVE_ROSTER.length });
        const execResult = await generateBranch(
          EXECUTIVE_ROSTER,
          EXEC_SYSTEM,
          EXEC_PROMPT,
          6,
          (progress) => send({ ...progress, branch: "executive" })
        );
        db.executive = execResult.profiles;
        send({ type: "branch_done", branch: "executive", count: db.executive.length, errors: execResult.errors.length });

        // SCOTUS
        send({ type: "branch_start", branch: "scotus", total: SCOTUS_ROSTER.length });
        const scotusResult = await generateBranch(
          SCOTUS_ROSTER,
          SCOTUS_SYSTEM,
          SCOTUS_PROMPT,
          9,
          (progress) => send({ ...progress, branch: "scotus" })
        );
        db.scotus = scotusResult.profiles;
        send({ type: "branch_done", branch: "scotus", count: db.scotus.length, errors: scotusResult.errors.length });

        // Validate
        const warnings = [];
        db.senate.forEach((p) => warnings.push(...validateProfile(p, "senate")));
        db.executive.forEach((p) => warnings.push(...validateProfile(p, "executive")));
        db.scotus.forEach((p) => warnings.push(...validateProfile(p, "scotus")));

        // Save to JSON database
        await saveProfiles(db);
        send({ type: "saved", path: "data/government-profiles.json" });

        send({
          type: "complete",
          summary: {
            senate: db.senate.length,
            executive: db.executive.length,
            scotus: db.scotus.length,
            total: db.senate.length + db.executive.length + db.scotus.length,
            warnings: warnings.length,
          },
          warnings,
          data: db,
        });
      } catch (err) {
        send({ type: "error", message: err.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
