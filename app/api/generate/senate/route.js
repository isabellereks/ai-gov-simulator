import { SENATE_ROSTER } from "@/lib/rosters";
import { SENATE_SYSTEM, SENATE_PROMPT } from "@/lib/prompts";
import { generateBranch, validateProfile } from "@/lib/generate";
import { saveBranch } from "@/lib/db";

export const maxDuration = 300;

// POST /api/generate/senate — generates only senate profiles
export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: "branch_start", branch: "senate", total: SENATE_ROSTER.length });

        const result = await generateBranch(
          SENATE_ROSTER,
          SENATE_SYSTEM,
          SENATE_PROMPT,
          5,
          (progress) => send({ ...progress, branch: "senate" })
        );

        const warnings = [];
        result.profiles.forEach((p) => warnings.push(...validateProfile(p, "senate")));

        const partyCount = {
          R: result.profiles.filter((p) => p.party === "R").length,
          D: result.profiles.filter((p) => p.party === "D").length,
          I: result.profiles.filter((p) => p.party === "I").length,
        };

        await saveBranch("senate", result.profiles);

        send({
          type: "complete",
          count: result.profiles.length,
          parties: partyCount,
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
