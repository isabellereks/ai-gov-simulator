"use client";
import { useRef, useEffect } from "react";
import { SCENES } from "@/src/lib/battleScenes";

export default function BattleCanvas({ sceneType = "congressional_office" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 160;
    canvas.height = 144;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const draw = SCENES[sceneType] || SCENES.congressional_office;
    draw(ctx);
  }, [sceneType]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
        zIndex: 0,
      }}
    />
  );
}
