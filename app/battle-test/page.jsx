"use client";
import WindowShell from "@/src/components/battle/WindowShell";
import BattleViewport from "@/src/components/battle/BattleViewport";
import BattleSidebar from "@/src/components/battle/BattleSidebar";

export default function BattleTestPage() {
  return (
    <WindowShell>
      <BattleViewport />
      <BattleSidebar />
    </WindowShell>
  );
}
