import { SCOTUS_ROSTER } from "@/lib/rosters";
import { SCOTUS_SYSTEM, SCOTUS_PROMPT } from "@/lib/prompts";
import { generateBranch, validateProfile } from "@/lib/generate";
import { saveBranch } from "@/lib/db";

export const maxDuration = 300;

// POST /api/generate/scotus — generates only SCOTUS profiles
export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: "branch_start", branch: "scotus", total: SCOTUS_ROSTER.length });

        const result = await generateBranch(
          SCOTUS_ROSTER,
          SCOTUS_SYSTEM,
          SCOTUS_PROMPT,
          9,
          (progress) => send({ ...progress, branch: "scotus" })
        );

        const warnings = [];
        result.profiles.forEach((p) => warnings.push(...validateProfile(p, "scotus")));

        await saveBranch("scotus", result.profiles);

        send({
          type: "complete",
          count: result.profiles.length,
          warnings,
          errors: result.errors,
          data: result.profiles,
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
