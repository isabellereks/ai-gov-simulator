"use client";
import { useState, useEffect, useRef } from "react";
import { TrainerSpriteFront } from "./CSSSprite";
import { playSelect } from "@/src/lib/sfx";

const CLASS_COLORS = {
  business_owner: { base: "#b8a060", glow: "rgba(139,105,20,0.15)" },
  campaign_operative: { base: "#b06060", glow: "rgba(148,50,50,0.15)" },
  lobbyist: { base: "#6088a8", glow: "rgba(46,94,140,0.15)" },
  policy_wonk: { base: "#6a9a7f", glow: "rgba(74,122,95,0.15)" },
  veteran: { base: "#8b7b5e", glow: "rgba(107,91,62,0.15)" },
  parent: { base: "#a882a1", glow: "rgba(139,98,129,0.15)" },
  party_insider: { base: "#7a6aaa", glow: "rgba(90,74,138,0.15)" },
  student_activist: { base: "#c8854e", glow: "rgba(193,101,46,0.15)" },
};

const MOVES = {
  policy_appeal: { name: "Policy Appeal", emoji: "📊", category: "logical" },
  constitutional_argument: { name: "Constitutional Argument", emoji: "📜", category: "logical" },
  bipartisan_framing: { name: "Bipartisan Framing", emoji: "🕊️", category: "logical" },
  constituent_pressure: { name: "Constituent Pressure", emoji: "📢", category: "pressure" },
  media_pressure: { name: "Media Pressure", emoji: "📰", category: "pressure" },
  primary_threat: { name: "Primary Threat", emoji: "⚠️", category: "pressure" },
  horse_trade: { name: "Horse Trade", emoji: "🤝", category: "transactional" },
  donor_leverage: { name: "Donor Leverage", emoji: "💰", category: "transactional" },
  local_impact: { name: "Local Impact", emoji: "🏠", category: "emotional" },
  personal_appeal: { name: "Personal Appeal", emoji: "💬", category: "emotional" },
  moral_authority: { name: "Moral Authority", emoji: "⚖️", category: "emotional" },
  backroom_deal: { name: "Backroom Deal", emoji: "🚪", category: "transactional" },
  blackmail: { name: "Blackmail", emoji: "🗂️", category: "pressure" },
};

const CAT_COLORS = {
  logical: "#4a7a5f",
  pressure: "#943232",
  transactional: "#b8a060",
  emotional: "#7a6aaa",
};

const TRAINER_NAMES = [
  "Ash",
  "Misty",
  "Brock",
  "Gary",
  "Dawn",
  "Serena",
  "May",
  "Cynthia",
  "Red",
  "Blue",
  "Leaf",
  "Hilda",
  "Nate",
  "Rosa",
  "Calem",
  "Iris",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ClassSelection({ classOptions, onSelect, playerName, onNameChange }) {
  const [flippedCards, setFlippedCards] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);
  const [animPlaceholder, setAnimPlaceholder] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  // Stable random appearance per card — generated once
  const appearancesRef = useRef(null);
  if (!appearancesRef.current && classOptions.length > 0) {
    const apps = classOptions.map(() => ({
      female: Math.random() > 0.5,
      skinIdx: Math.floor(Math.random() * 4),
      hairIdx: Math.floor(Math.random() * 6),
      hairVar: Math.floor(Math.random() * 4),
    }));
    // Force at least one female and one male on distinct cards
    const femaleIdx = Math.floor(Math.random() * apps.length);
    apps[femaleIdx].female = true;
    const malePool = [...Array(apps.length).keys()].filter((i) => i !== femaleIdx);
    apps[malePool[Math.floor(Math.random() * malePool.length)]].female = false;
    appearancesRef.current = apps;
  }
  const appearances = appearancesRef.current || [];

  // Animated placeholder — stop once a class is selected to avoid lag
  useEffect(() => {
    if (inputFocused || playerName || selectedClass) return;
    let cancelled = false;
    const names = [...TRAINER_NAMES].sort(() => Math.random() - 0.5);
    let idx = 0;
    async function cycle() {
      while (!cancelled) {
        const name = `I'm ${names[idx % names.length]}...`;
        for (let i = 0; i <= name.length; i++) {
          if (cancelled) return;
          setAnimPlaceholder(name.slice(0, i));
          await new Promise((r) => setTimeout(r, 60 + Math.random() * 40));
        }
        await new Promise((r) => setTimeout(r, 1800));
        for (let i = name.length; i >= 0; i--) {
          if (cancelled) return;
          setAnimPlaceholder(name.slice(0, i));
          await new Promise((r) => setTimeout(r, 30));
        }
        await new Promise((r) => setTimeout(r, 400));
        idx++;
      }
    }
    cycle();
    return () => {
      cancelled = true;
    };
  }, [inputFocused, playerName, selectedClass]);

  const handleFlip = (cls) => {
    playSelect();
    setFlippedCards((prev) => ({ ...prev, [cls.id]: !prev[cls.id] }));
  };

  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleSelect = (cls, idx) => {
    playSelect();
    setSelectedClass(cls);
    setSelectedIdx(idx);
  };

  const handleGo = () => {
    if (!selectedClass) return;
    if (!playerName?.trim()) onNameChange(pickRandom(TRAINER_NAMES));
    onSelect(selectedClass);
  };

  return (
    <div className="pokemac-class-select">
      {/* Header */}
      <div className="pokemac-class-header">
        <div className="pokemac-class-title">WELCOME TO WASHINGTON</div>
        <div className="pokemac-class-subtitle">Choose your identity</div>
      </div>

      {/* Name input */}
      <div className="pokemac-name-input-wrap">
        <input
          className="pokemac-name-input"
          type="text"
          value={playerName || ""}
          onChange={(e) => onNameChange(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={inputFocused ? "" : animPlaceholder || "Your name..."}
          maxLength={20}
        />
      </div>

      {/* Cards */}
      <div className="pokemac-class-cards">
        {classOptions.map((cls, idx) => {
          const colors = CLASS_COLORS[cls.id] || CLASS_COLORS.lobbyist;
          const isFlipped = flippedCards[cls.id];
          const isSelected = selectedClass?.id === cls.id;
          const app = appearances[idx] || {};

          return (
            <div
              key={cls.id}
              className={`pokemac-flip-container ${isSelected ? "pokemac-class-card--selected" : ""}`}
              style={{
                "--shimmer-color": colors.base,
                "--shimmer-glow": colors.glow,
              }}
            >
              <div
                className={`pokemac-flip-inner ${isFlipped ? "pokemac-flip-inner--flipped" : ""}`}
              >
                {/* Front — class info */}
                <div
                  className="pokemac-flip-face pokemac-flip-front-default"
                  onClick={() => handleFlip(cls)}
                >
                  <div className="pokemac-class-card-sprite">
                    <TrainerSpriteFront
                      trainerClass={cls.id}
                      size={36}
                      female={app.female}
                      skinIdx={app.skinIdx}
                      hairIdx={app.hairIdx}
                      hairVar={app.hairVar}
                    />
                  </div>
                  <div className="pokemac-class-card-name">{cls.name}</div>
                  <div className="pokemac-class-card-desc">{cls.description}</div>

                  <button
                    className={`pokemac-class-pick-btn ${isSelected ? "pokemac-class-pick-btn--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(cls, idx);
                    }}
                  >
                    {isSelected ? "SELECTED" : "PICK"}
                  </button>
                </div>

                {/* Back — moves + types */}
                <div
                  className="pokemac-flip-face pokemac-flip-back-moves"
                  onClick={() => handleFlip(cls)}
                >
                  <div className="pokemac-class-moves">
                    <div className="pokemac-class-moves-label">MOVES</div>
                    <div className="pokemac-class-moves-list">
                      {cls.coreMoves.map((id) => {
                        const m = MOVES[id];
                        return m ? (
                          <span
                            key={id}
                            className="pokemac-class-move"
                            style={{ borderColor: CAT_COLORS[m.category] }}
                          >
                            {m.name}
                          </span>
                        ) : null;
                      })}
                      <span className="pokemac-class-move pokemac-class-move--random">
                        +2 random
                      </span>
                    </div>
                  </div>

                  <div className="pokemac-class-card-types">
                    <div className="pokemac-class-type-row">
                      <span className="pokemac-class-type-label pokemac-class-type-label--strong">
                        Strong against
                      </span>
                      {cls.strong.map((s) => (
                        <span
                          key={s}
                          className="pokemac-class-type-tag pokemac-class-type-tag--strong"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="pokemac-class-type-row">
                      <span className="pokemac-class-type-label pokemac-class-type-label--weak">
                        Weak against
                      </span>
                      {cls.weak.map((w) => (
                        <span
                          key={w}
                          className="pokemac-class-type-tag pokemac-class-type-tag--weak"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className={`pokemac-class-pick-btn ${isSelected ? "pokemac-class-pick-btn--active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(cls, idx);
                    }}
                  >
                    {isSelected ? "SELECTED" : "PICK"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected preview + Go */}
      {selectedClass && (
        <div className="pokemac-class-confirm">
          <div className="pokemac-class-confirm-preview">
            <TrainerSpriteFront
              trainerClass={selectedClass.id}
              size={32}
              {...(appearances[selectedIdx] || {})}
            />
            <div>
              <div className="pokemac-class-confirm-name">{selectedClass.name}</div>
              <div className="pokemac-class-confirm-intro">{selectedClass.intro}</div>
            </div>
          </div>
          <button className="pokemac-class-go-btn" onClick={handleGo}>
            GO →
          </button>
        </div>
      )}
    </div>
  );
}
