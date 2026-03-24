"use client";
import { useState, useEffect, useRef } from "react";

const SEGMENTS = 20;

export default function HPBar({ value, max = 100, showNumbers = false, animDelay = 0 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);
  const animRef = useRef(null);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    // Staggered drain animation
    const startTime = performance.now() + animDelay;
    const duration = Math.abs(from - to) * 15 + 200; // longer for bigger changes

    function animate(now) {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 2);
      setDisplayValue(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [value, animDelay]);

  const pct = Math.max(0, displayValue / max);
  const filled = Math.ceil(pct * SEGMENTS);
  const color = pct > 0.5 ? "#4a8" : pct > 0.25 ? "#ca2" : "#c44";

  return (
    <div>
      <div className="pokemac-hp-track">
        <div className="pokemac-hp-label">HP</div>
        <div className="pokemac-hp-bar">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className="pokemac-hp-segment"
              style={{
                background: i < filled ? color : "#1a1510",
                transitionDelay: `${i * 25}ms`,
              }}
            />
          ))}
        </div>
      </div>
      {showNumbers && (
        <div className="pokemac-hp-numbers">{Math.max(0, displayValue)} / {max}</div>
      )}
    </div>
  );
}
