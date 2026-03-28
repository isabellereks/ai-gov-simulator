"use client";

let Tone = null;
let synth = null;
let initialized = false;
let initPromise = null;

async function doInit() {
  try {
    Tone = await import("tone");
    await Tone.start();
    synth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.05, release: 0.1 },
      volume: -12,
    }).toDestination();
    initialized = true;
  } catch {
    initialized = false;
  }
}

// Pre-initialize Tone.js — call from a user gesture context
export function ensureSfxInit() {
  if (initialized || initPromise) return;
  initPromise = doInit();
}

export function playHit() {
  if (!synth) return;
  synth.triggerAttackRelease("C4", "16n");
  setTimeout(() => synth?.triggerAttackRelease("E3", "16n"), 60);
}

export function playSuperEffective() {
  if (!synth) return;
  synth.triggerAttackRelease("E5", "16n");
  setTimeout(() => synth?.triggerAttackRelease("G5", "16n"), 80);
  setTimeout(() => synth?.triggerAttackRelease("C6", "8n"), 160);
}

export function playNotEffective() {
  if (!synth) return;
  synth.triggerAttackRelease("C3", "8n");
}

export function playFaint() {
  if (!synth) return;
  const notes = ["E4", "D4", "C4", "B3", "A3"];
  notes.forEach((note, i) => {
    setTimeout(() => synth?.triggerAttackRelease(note, "8n"), i * 120);
  });
}

export function playVictory() {
  if (!synth) return;
  const notes = ["C5", "E5", "G5", "C6"];
  notes.forEach((note, i) => {
    setTimeout(() => synth?.triggerAttackRelease(note, "8n"), i * 150);
  });
}

export function playSelect() {
  if (!synth) return;
  synth.triggerAttackRelease("E5", "32n");
}
