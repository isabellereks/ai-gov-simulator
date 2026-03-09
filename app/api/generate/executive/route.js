import { EXECUTIVE_ROSTER } from "@/lib/rosters";
import { EXEC_SYSTEM, EXEC_PROMPT } from "@/lib/prompts";
import { generateBranch, validateProfile } from "@/lib/generate";
import { saveBranch } from "@/lib/db";

export const maxDuration = 300;

// POST /api/generate/executive — generates only executive profiles
export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send({ type: "branch_start", branch: "executive", total: EXECUTIVE_ROSTER.length });

        const result = await generateBranch(
          EXECUTIVE_ROSTER,
          EXEC_SYSTEM,
          EXEC_PROMPT,
          6,
          (progress) => send({ ...progress, branch: "executive" })
        );

        const warnings = [];
        result.profiles.forEach((p) => warnings.push(...validateProfile(p, "executive")));

        await saveBranch("executive", result.profiles);

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
