"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function PixelTypewriter({
  messages = [],
  speed = 30,
  onComplete,
  onAdvance,
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const currentMsg = messages[msgIndex] || "";

  // Reset when messages change
  useEffect(() => {
    setMsgIndex(0);
    setCharIndex(0);
    setDone(false);
  }, [messages]);

  // Typewriter effect
  useEffect(() => {
    if (done) return;
    if (charIndex >= currentMsg.length) return;

    intervalRef.current = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= currentMsg.length - 1) {
          clearInterval(intervalRef.current);
          return currentMsg.length;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [msgIndex, currentMsg, speed, done]);

  const handleClick = useCallback(() => {
    // If still typing, skip to end
    if (charIndex < currentMsg.length) {
      clearInterval(intervalRef.current);
      setCharIndex(currentMsg.length);
      return;
    }

    // If more messages, advance
    if (msgIndex < messages.length - 1) {
      const next = msgIndex + 1;
      setMsgIndex(next);
      setCharIndex(0);
      if (onAdvance) onAdvance(next);
      return;
    }

    // All messages done
    setDone(true);
    if (onComplete) onComplete();
  }, [charIndex, currentMsg, msgIndex, messages.length, onAdvance, onComplete]);

  const displayed = currentMsg.slice(0, charIndex + 1);
  const isFullyRevealed = charIndex >= currentMsg.length - 1 || currentMsg.length === 0;

  return (
    <div
      className="pokemac-dialogue"
      onClick={handleClick}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      <span className="pokemac-dialogue-text">
        {displayed}
        {isFullyRevealed && !done && (
          <span className="pokemac-dialogue-cursor">▼</span>
        )}
      </span>
    </div>
  );
}
