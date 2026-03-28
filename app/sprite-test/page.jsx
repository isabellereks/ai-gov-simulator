"use client";
import CSSSprite, { TrainerSprite } from "@/src/components/battle/CSSSprite";

const SAMPLE_SENATORS = [
  { name: "Mitch McConnell", party: "R" },
  { name: "Chuck Schumer", party: "D" },
  { name: "Bernie Sanders", party: "I" },
  { name: "Susan Collins", party: "R" },
  { name: "Joe Manchin", party: "D" },
  { name: "Lisa Murkowski", party: "R" },
  { name: "Elizabeth Warren", party: "D" },
  { name: "Ted Cruz", party: "R" },
  { name: "Cory Booker", party: "D" },
  { name: "Rand Paul", party: "R" },
];

const TRAINER_CLASSES = [
  "business_owner", "lobbyist", "campaign_operative", "policy_wonk",
  "parent", "veteran", "student_activist", "party_insider",
];

const CLASS_LABELS = {
  business_owner: "Small Business Owner",
  lobbyist: "K Street Lobbyist",
  campaign_operative: "Campaign Operative",
  policy_wonk: "Policy Wonk",
  parent: "Parent & Community Leader",
  veteran: "Veteran",
  student_activist: "Student Activist",
  party_insider: "Party Insider",
};

export default function SpriteTestPage() {
  return (
    <div style={{
      background: "#f5f0e8",
      minHeight: "100vh",
      padding: 40,
      color: "#1a1510",
      fontFamily: "var(--font-family-sans)",
    }}>
      <h1 style={{ fontFamily: "var(--font-pixel), monospace", fontSize: 14, marginBottom: 32, letterSpacing: 2 }}>
        SPRITE GALLERY
      </h1>

      {/* Senator sprites */}
      <h2 style={{ fontSize: 12, color: "#6b604e", marginBottom: 16, fontFamily: "var(--font-pixel), monospace", letterSpacing: 1 }}>
        SENATORS
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
        {SAMPLE_SENATORS.map((s) => (
          <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ background: "#fff", padding: 10, border: "1px solid #ddd6c8", borderRadius: 6 }}>
              <CSSSprite name={s.name} party={s.party} size={48} />
            </div>
            <div style={{ fontSize: 9, color: "#6b604e", textAlign: "center", maxWidth: 60 }}>{s.name}</div>
            <div style={{
              fontSize: 8,
              fontWeight: 700,
              color: s.party === "R" ? "#c1432e" : s.party === "D" ? "#2e5e8c" : "#6b5b95",
            }}>
              {s.party === "R" ? "REP" : s.party === "D" ? "DEM" : "IND"}
            </div>
          </div>
        ))}
      </div>

      {/* Trainer class sprites (back view) */}
      <h2 style={{ fontSize: 12, color: "#6b604e", marginBottom: 16, fontFamily: "var(--font-pixel), monospace", letterSpacing: 1 }}>
        TRAINER CLASSES
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
        {TRAINER_CLASSES.map((cls) => (
          <div key={cls} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ background: "#fff", padding: 10, border: "1px solid #ddd6c8", borderRadius: 6 }}>
              <TrainerSprite trainerClass={cls} size={48} />
            </div>
            <div style={{ fontSize: 9, color: "#6b604e", textAlign: "center", maxWidth: 70 }}>
              {CLASS_LABELS[cls]}
            </div>
          </div>
        ))}
      </div>

      {/* Size comparison */}
      <h2 style={{ fontSize: 12, color: "#6b604e", marginBottom: 16, fontFamily: "var(--font-pixel), monospace", letterSpacing: 1 }}>
        SIZE COMPARISON
      </h2>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
        {[24, 32, 48, 64, 96].map((size) => (
          <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ background: "#fff", padding: 6, border: "1px solid #ddd6c8", borderRadius: 4 }}>
              <CSSSprite name="Test Senator" party="D" size={size} />
            </div>
            <div style={{ fontSize: 9, color: "#a89e8c" }}>{size}px</div>
          </div>
        ))}
      </div>
    </div>
  );
}
