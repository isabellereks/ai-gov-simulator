"use client";
import PixelTypewriter from "./PixelTypewriter";
import CSSSprite, { TrainerSprite } from "./CSSSprite";

export default function BattleViewport({
  // Enemy data
  enemyName = "SEN. MCCONNELL",
  enemyParty = "R",
  enemyArchetype = "establishment",
  enemyLevel = 42,
  enemyHp = 72,
  enemyMaxHp = 100,
  // Player data
  playerName = "YOU",
  playerClass = "lobbyist",
  playerLevel = 1,
  playerHp = 100,
  playerMaxHp = 100,
  // Dialogue
  messages = ["Wild SEN. MCCONNELL appeared!"],
  onDialogueComplete,
  onDialogueAdvance,
  // Render slots
  moveGrid = null,
  children,
}) {
  const enemyHpPct = Math.max(0, (enemyHp / enemyMaxHp) * 100);
  const playerHpPct = Math.max(0, (playerHp / playerMaxHp) * 100);
  const enemyHpColor = enemyHpPct > 50 ? "#4a8" : enemyHpPct > 25 ? "#ca2" : "#c44";
  const playerHpColor = playerHpPct > 50 ? "#4a8" : playerHpPct > 25 ? "#ca2" : "#c44";

  return (
    <div className="pokemac-viewport">
      {/* Battle scene */}
      <div className="pokemac-scene">
        {/* Enemy side (top-right) */}
        <div className="pokemac-enemy-area">
          <div className="pokemac-nameplate pokemac-nameplate--enemy">
            <div className="pokemac-nameplate-row">
              <span className="pokemac-nameplate-name">{enemyName}</span>
              <span className="pokemac-nameplate-level">Lv {enemyLevel}</span>
            </div>
            <div className="pokemac-nameplate-sub">{enemyArchetype}</div>
            <div className="pokemac-hp-track">
              <div className="pokemac-hp-label">HP</div>
              <div className="pokemac-hp-bar">
                <div className="pokemac-hp-fill" style={{ width: `${enemyHpPct}%`, background: enemyHpColor }} />
              </div>
            </div>
          </div>
          <CSSSprite name={enemyName} party={enemyParty} size={48} />
        </div>

        {/* Player side (bottom-left) */}
        <div className="pokemac-player-area">
          <TrainerSprite trainerClass={playerClass} size={40} />
          <div className="pokemac-nameplate pokemac-nameplate--player">
            <div className="pokemac-nameplate-row">
              <span className="pokemac-nameplate-name">{playerName}</span>
              <span className="pokemac-nameplate-level">Lv {playerLevel}</span>
            </div>
            <div className="pokemac-nameplate-sub">{playerClass}</div>
            <div className="pokemac-hp-track">
              <div className="pokemac-hp-label">HP</div>
              <div className="pokemac-hp-bar">
                <div className="pokemac-hp-fill" style={{ width: `${playerHpPct}%`, background: playerHpColor }} />
              </div>
            </div>
            <div className="pokemac-hp-numbers">{playerHp} / {playerMaxHp}</div>
          </div>
        </div>

        {/* Ground ellipses */}

        {/* Extra overlays (effectiveness popups, etc.) */}
        {children}
      </div>

      {/* Dialogue box / move grid */}
      {moveGrid || (
        <PixelTypewriter
          messages={messages}
          onComplete={onDialogueComplete}
          onAdvance={onDialogueAdvance}
        />
      )}
    </div>
  );
}
