"use client";
import { useState } from "react";
import WindowShell from "@/src/components/battle/WindowShell";
import BattleViewport from "@/src/components/battle/BattleViewport";
import BattleSidebar from "@/src/components/battle/BattleSidebar";
import { SCENE_NAMES } from "@/src/lib/battleScenes";

const SCENE_KEYS = Object.keys(SCENE_NAMES);

export default function BattleTestPage() {
  const [sceneType, setSceneType] = useState("congressional_office");

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SCENE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSceneType(key)}
            style={{
              padding: "8px 16px",
              background: sceneType === key ? "#1a1510" : "#f5f0e8",
              color: sceneType === key ? "#f5f0e8" : "#1a1510",
              border: "2px solid #ddd6c8",
              fontFamily: "monospace",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            {SCENE_NAMES[key]}
          </button>
        ))}
      </div>
      <WindowShell title={`SCENE PREVIEW — ${SCENE_NAMES[sceneType]?.toUpperCase()}`}>
        <BattleViewport sceneType={sceneType} />
        <BattleSidebar />
      </WindowShell>
    </div>
  );
}
