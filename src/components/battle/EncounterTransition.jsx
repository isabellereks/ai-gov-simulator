"use client";
import { useState, useEffect } from "react";

export default function EncounterTransition({ onComplete, duration = 800 }) {
  const [phase, setPhase] = useState("enter"); // enter | hold | exit

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), duration / 2);
    const exitTimer = setTimeout(() => {
      setPhase("exit");
      setTimeout(onComplete, duration / 2);
    }, duration);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className="pokemac-encounter-transition" data-phase={phase}>
      <div className="pokemac-encounter-bar pokemac-encounter-bar--top" />
      <div className="pokemac-encounter-bar pokemac-encounter-bar--bottom" />
    </div>
  );
}
