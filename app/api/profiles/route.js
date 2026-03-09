import { loadProfiles } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/profiles — returns the full saved database
// GET /api/profiles?branch=senate — returns only one branch
// GET /api/profiles?name=Ted Cruz — search by name (partial match)
export async function GET(request) {
  const db = await loadProfiles();

  if (!db) {
    return NextResponse.json(
      { error: "No profiles generated yet. POST to /api/generate first." },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");
  const name = searchParams.get("name");

  // Filter by branch
  if (branch) {
    if (!db[branch]) {
      return NextResponse.json(
        { error: `Unknown branch: ${branch}. Use senate, executive, or scotus.` },
        { status: 400 }
      );
    }

    let profiles = db[branch];

    // Filter by name within branch
    if (name) {
      const q = name.toLowerCase();
      profiles = profiles.filter((p) => p.name?.toLowerCase().includes(q));
    }

    return NextResponse.json({
      branch,
      count: profiles.length,
      generated_at: db.generated_at,
      updated_at: db.updated_at,
      data: profiles,
    });
  }

  // Search by name across all branches
  if (name) {
    const q = name.toLowerCase();
    const results = [
      ...db.senate.filter((p) => p.name?.toLowerCase().includes(q)).map((p) => ({ ...p, _branch: "senate" })),
      ...db.executive.filter((p) => p.name?.toLowerCase().includes(q)).map((p) => ({ ...p, _branch: "executive" })),
      ...db.scotus.filter((p) => p.name?.toLowerCase().includes(q)).map((p) => ({ ...p, _branch: "scotus" })),
    ];

    return NextResponse.json({
      query: name,
      count: results.length,
      data: results,
    });
  }

  // Return full database with summary
  return NextResponse.json({
    generated_at: db.generated_at,
    updated_at: db.updated_at,
    version: db.version,
    summary: {
      senate: db.senate.length,
      executive: db.executive.length,
      scotus: db.scotus.length,
      total: db.senate.length + db.executive.length + db.scotus.length,
    },
    data: db,
  });
}
