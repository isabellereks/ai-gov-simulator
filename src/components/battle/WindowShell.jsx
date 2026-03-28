"use client";

export default function WindowShell({ children, title = "POLICYSIM BATTLE" }) {
  return (
    <div className="pokemac-page">
      <div className="pokemac-shell">
        {/* Title bar */}
        <div className="pokemac-titlebar">
          <span className="pokemac-title">{title}</span>
        </div>

        {/* Two-zone content */}
        <div className="pokemac-content">
          {children}
        </div>
      </div>
    </div>
  );
}
