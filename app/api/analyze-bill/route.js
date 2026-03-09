import Anthropic from "@anthropic-ai/sdk";

const BILL_SYSTEM_PROMPT = `You are a congressional policy analyst. Given a bill description, return ONLY a JSON object (no markdown, no backticks) with this exact schema:
{
  "name": "Short official-sounding bill title",
  "summary": "One sentence description",
  "issueWeights": { ... },
  "issuePositions": { ... },
  "partySupport": "R" or "D" or "bipartisan",
  "affectedIndustries": ["industry1", "industry2"],
  "constitutionalIssues": { ... },
  "constitutionalPosition": { ... },
  "committees": ["Committee1", "Committee2"],
  "controversy_level": 0.0-1.0,
  "startChamber": "hou" or "sen",
  "factions": {
    "supporters": "Who supports this and why (one sentence)",
    "opponents": "Who opposes this and why (one sentence)"
  }
}

issueWeights: how much each of these 15 issues matters to this bill (0.0 = irrelevant, 1.0 = core issue):
immigration, taxes_spending, healthcare, gun_rights, climate_energy, defense_military, education, tech_regulation, criminal_justice, trade_tariffs, abortion_social, government_spending, foreign_policy_hawks, civil_liberties, labor_unions

issuePositions: what POSITION this bill takes on each relevant issue (0.0 = most liberal, 1.0 = most conservative). Only include issues where weight > 0.

constitutionalIssues: how much each constitutional dimension matters (0.0 = not relevant, 1.0 = core question):
executive_power, individual_rights_vs_government, federal_vs_state_power, regulatory_authority_admin_state, criminal_defendant_rights, free_speech_1A, gun_rights_2A, religious_liberty, commerce_clause_scope, equal_protection_discrimination

constitutionalPosition: what position the bill takes (0.0 = expansive/liberal interpretation, 1.0 = restrictive/conservative interpretation). Only include issues where weight > 0.

startChamber: which chamber the bill originates in. Per Article I Section 7, bills that raise revenue MUST start in "hou" (House). All other bills can start in either chamber — randomly pick "hou" or "sen".

Be precise about which issues a bill actually touches.`;

export async function POST(request) {
  try {
    const { text, apiKey: bodyKey } = await request.json();
    if (!text?.trim()) {
      return Response.json({ error: "No bill text provided" }, { status: 400 });
    }

    const key = bodyKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return Response.json({ error: "No API key provided" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: key });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: BILL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const raw = response.content[0].text;
    const billText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const bill = JSON.parse(billText);
    return Response.json(bill);
  } catch (e) {
    console.error("analyze-bill error:", e?.status || "", e?.error?.type || "");
    const status = e?.status === 401 ? 401 : 500;
    const msg = e?.status === 401 ? "Invalid API key" : "Failed to analyze bill";
    return Response.json({ error: msg }, { status });
  }
}
