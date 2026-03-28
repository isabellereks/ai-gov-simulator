"use client";
import { useRef, useEffect } from "react";

export default function BattleSidebar({
  trainerName = "Ash",
  trainerClass = "K Street Lobbyist",
  trainerDetail = "",
  billName = "H.R. 1234",
  yeaCount,
  nayCount,
  needed,
  battleLog = [],
  intel = {},
  turnPhase,
  onEndBattle,
  target,
}) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [battleLog.length]);

  return (
    <div className="pokemac-sidebar">
      {/* Trainer Profile */}
      <div className="pokemac-panel">
        <div className="pokemac-panel-header">TRAINER</div>
        <div className="pokemac-panel-body">
          <div className="pokemac-trainer-name">{trainerName}</div>
          <div className="pokemac-trainer-class">{trainerClass}</div>
          {trainerDetail && (
            <div className="pokemac-trainer-detail">{trainerDetail}</div>
          )}
        </div>
      </div>

      {/* Bill Info */}
      <div className="pokemac-panel">
        <div className="pokemac-panel-header">BILL</div>
        <div className="pokemac-panel-body">
          <div className="pokemac-bill-name">{billName}</div>
          {yeaCount !== undefined && (
            <div className="pokemac-bill-status">
              <span className="pokemac-bill-yea">YEA {yeaCount}</span>
              <span className="pokemac-bill-sep">/</span>
              <span className="pokemac-bill-nay">NAY {nayCount}</span>
              <span className="pokemac-bill-sep">·</span>
              <span className="pokemac-bill-needed">Need {needed}</span>
            </div>
          )}
          {target && target.count > 1 && (
            <div style={{ fontSize: 10, color: "#6b604e", marginTop: 4, fontFamily: "var(--font-family-sans)" }}>
              + {target.count - 1} colleague{target.count - 1 !== 1 ? "s" : ""} watching
            </div>
          )}
        </div>
      </div>

      {/* Battle Log */}
      <div className="pokemac-panel pokemac-panel--grow">
        <div className="pokemac-panel-header">BATTLE LOG</div>
        <div className="pokemac-panel-body pokemac-log-scroll">
          {battleLog.length === 0 ? (
            <div className="pokemac-log-entry" style={{ fontStyle: "italic" }}>Waiting for battle to begin...</div>
          ) : (
            battleLog.map((entry, i) => (
              <div
                key={i}
                className={`pokemac-log-entry ${
                  entry.type === "effective" ? "pokemac-log-entry--effective" :
                  entry.type === "weak" ? "pokemac-log-entry--weak" :
                  entry.type === "enemy" ? "pokemac-log-entry--enemy" : ""
                }`}
              >
                {entry.text}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Senator Intel */}
      <div className="pokemac-panel">
        <div className="pokemac-panel-header">INTEL</div>
        <div className="pokemac-panel-body">
          {Object.entries(intel).map(([key, value]) => (
            <div key={key} className="pokemac-intel-row">
              <span className="pokemac-intel-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span className="pokemac-intel-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Win/Lose action */}
      {(turnPhase === "win" || turnPhase === "lose") && onEndBattle && (
        <div className="pokemac-panel" style={{ padding: "12px 14px" }}>
          <button
            className="pokemac-end-btn"
            onClick={onEndBattle}
          >
            {turnPhase === "win" ? "CONTINUE →" : "CONTINUE"}
          </button>
        </div>
      )}
    </div>
  );
}
