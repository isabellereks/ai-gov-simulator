"use client";
import { useState } from "react";
import CSSSprite from "./CSSSprite";
import { playSelect } from "@/src/lib/sfx";

const ARCHETYPE_LABELS = {
  hawk: "Hawk",
  establishment: "Establishment",
  moderate: "Moderate",
  populist: "Populist",
  progressive: "Progressive",
  libertarian: "Libertarian",
  centrist: "Centrist",
};

export default function TargetSelection({
  groups,
  battlesRemaining,
  yeaCount,
  needed,
  onSelect,
  onGiveUp,
  chamberLabel,
}) {
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const votesShort = Math.max(0, needed - yeaCount);

  return (
    <div className="pokemac-target-select">
      <div className="pokemac-target-header">
        <div className="pokemac-target-title">CHOOSE YOUR TARGET</div>
        <div className="pokemac-target-subtitle">
          {votesShort} vote{votesShort !== 1 ? "s" : ""} short in the {chamberLabel || "chamber"}
          {" · "}
          {battlesRemaining} battle{battlesRemaining !== 1 ? "s" : ""} remaining
        </div>
      </div>

      <div className="pokemac-target-cards">
        {groups.map((group) => {
          const face = group.face;
          const arch = ARCHETYPE_LABELS[group.archetype] || group.archetype;
          const isHovered = hoveredGroup === group.key;
          const flipPct = Math.round(group.avgFlippability * 100);
          const difficultyLabel = flipPct >= 60 ? "EASY" : flipPct >= 35 ? "MEDIUM" : "HARD";
          const difficultyColor = flipPct >= 60 ? "#4a8" : flipPct >= 35 ? "#d4a017" : "#c44";

          return (
            <button
              key={group.key}
              className={`pokemac-target-card ${isHovered ? "pokemac-target-card--hover" : ""}`}
              onClick={() => { playSelect(); onSelect(group); }}
              onMouseEnter={() => setHoveredGroup(group.key)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <div className="pokemac-target-card-sprite">
                <CSSSprite name={face.n || "Unknown"} party={face.p || "I"} size={40} />
              </div>
              <div className="pokemac-target-card-info">
                <div className="pokemac-target-card-name">{face.n || "Unknown"}</div>
                <div className="pokemac-target-card-arch">{arch}</div>
                <div className="pokemac-target-card-meta">
                  <span className="pokemac-target-card-party" style={{
                    color: face.p === "R" ? "#c1432e" : face.p === "D" ? "#2e5e8c" : "#6b5b95"
                  }}>
                    {face.p === "R" ? "GOP" : face.p === "D" ? "DEM" : "IND"}
                  </span>
                  <span className="pokemac-target-card-count">
                    {group.count} member{group.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="pokemac-target-card-difficulty" style={{ color: difficultyColor }}>
                  {difficultyLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button className="pokemac-give-up-btn" onClick={onGiveUp}>
        GIVE UP
      </button>
    </div>
  );
}
