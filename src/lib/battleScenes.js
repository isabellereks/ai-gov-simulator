// ═══════════════════════════════════════════════════════════
// PIXEL ART BATTLE BACKGROUNDS — GameBoy-style (160×144)
// ═══════════════════════════════════════════════════════════

const TILE = 8; // 8×8 pixel tiles, 20×18 grid

// ─── Helpers ───

function fillTile(ctx, tx, ty, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
}

function dither(ctx, x, y, w, h, c1, c2) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      ctx.fillStyle = (px + py) % 2 === 0 ? c1 : c2;
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

function drawPlatform(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const xSpan = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
    ctx.fillRect(cx - xSpan, cy + y, xSpan * 2, 1);
  }
}

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ─── Scene mapping ───

export function getSceneType(chamber, playerClass, enemyArchetype) {
  if (playerClass?.id === "lobbyist") return "lobbyist_office";
  if (playerClass?.id === "student_activist" || playerClass?.id === "parent") return "town_hall";
  if (chamber === "sen") return "senate_chamber";
  if (chamber === "hr") return "capitol_exterior";
  return "congressional_office";
}

// ═══════════════════════════════════════════════════════════
// 1. CONGRESSIONAL OFFICE (default)
// ═══════════════════════════════════════════════════════════

function drawCongressionalOffice(ctx) {
  const P = {
    wallDark: "#5a4a3a",
    wallMid: "#7a6a52",
    wallLight: "#8a7a62",
    panelLine: "#4a3a2a",
    carpet: "#3a2828",
    carpetLight: "#4a3838",
    carpetSeal: "#4a3a30",
    window: "#6688aa",
    windowLight: "#88aacc",
    skyline: "#445566",
    desk: "#6a5a42",
    deskTop: "#7a6a52",
    flagRed: "#aa3333",
    flagWhite: "#ddccbb",
    flagBlue: "#334488",
    frame: "#3a3020",
    platEnemy: "#5a4a3a",
    platPlayer: "#4a3a2a",
  };

  // Wall — wood paneling (top half)
  for (let ty = 0; ty < 9; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const shade = ty % 2 === 0 ? P.wallDark : P.wallMid;
      fillTile(ctx, tx, ty, shade);
    }
  }
  // Horizontal panel lines
  for (let ty = 0; ty < 9; ty += 2) {
    fillRect(ctx, 0, ty * TILE + 7, 160, 1, P.panelLine);
  }
  // Vertical panel dividers every 4 tiles
  for (let tx = 0; tx < 20; tx += 4) {
    fillRect(ctx, tx * TILE, 0, 1, 72, P.panelLine);
  }

  // Window (tiles 8-11, rows 1-5)
  fillRect(ctx, 64, 8, 32, 40, P.window);
  fillRect(ctx, 66, 10, 28, 36, P.windowLight);
  // Skyline silhouette in window
  fillRect(ctx, 66, 30, 6, 16, P.skyline);
  fillRect(ctx, 74, 34, 4, 12, P.skyline);
  fillRect(ctx, 80, 28, 5, 18, P.skyline);
  fillRect(ctx, 87, 32, 7, 14, P.skyline);
  // Window frame
  fillRect(ctx, 64, 8, 32, 1, P.frame);
  fillRect(ctx, 64, 47, 32, 1, P.frame);
  fillRect(ctx, 64, 8, 1, 40, P.frame);
  fillRect(ctx, 95, 8, 1, 40, P.frame);
  fillRect(ctx, 79, 8, 2, 40, P.frame);

  // American flag (left side, tiles 2-3, rows 1-5)
  fillRect(ctx, 18, 10, 10, 30, P.flagWhite);
  for (let i = 0; i < 6; i++) {
    fillRect(ctx, 18, 10 + i * 5, 10, 3, P.flagRed);
  }
  fillRect(ctx, 18, 10, 5, 14, P.flagBlue);
  // Flagpole
  fillRect(ctx, 17, 6, 1, 36, P.frame);

  // Desk (tiles 12-17, row 6-7)
  fillRect(ctx, 100, 48, 48, 16, P.desk);
  fillRect(ctx, 100, 48, 48, 4, P.deskTop);

  // Carpet (bottom half)
  for (let ty = 9; ty < 18; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const shade = (tx + ty) % 3 === 0 ? P.carpetLight : P.carpet;
      fillTile(ctx, tx, ty, shade);
    }
  }
  // Seal hint on carpet (dithered circle)
  dither(ctx, 60, 96, 40, 20, P.carpetSeal, P.carpet);

  // Platforms
  drawPlatform(ctx, 116, 62, 22, 6, P.platEnemy);
  drawPlatform(ctx, 40, 110, 26, 7, P.platPlayer);
}

// ═══════════════════════════════════════════════════════════
// 2. CAPITOL EXTERIOR
// ═══════════════════════════════════════════════════════════

function drawCapitolExterior(ctx) {
  const P = {
    skyTop: "#4488bb",
    skyBot: "#6699cc",
    cloud1: "#aabbcc",
    cloud2: "#88aacc",
    domeWhite: "#ddddcc",
    domeShadow: "#bbbbaa",
    domeHighlight: "#eeeedd",
    column: "#ccccbb",
    columnShadow: "#aaaaaa",
    steps: "#bbbbaa",
    stepsLight: "#ccccbb",
    grass: "#3a6a3a",
    grassLight: "#4a7a4a",
    grassDark: "#2a5a2a",
    path: "#aa9977",
    platEnemy: "#bbbbaa",
    platPlayer: "#3a6a3a",
  };

  // Sky gradient (top 8 tiles)
  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, ty < 4 ? P.skyTop : P.skyBot);
    }
  }
  // Cloud dithering
  dither(ctx, 10, 12, 30, 8, P.cloud1, P.skyTop);
  dither(ctx, 110, 8, 25, 6, P.cloud1, P.skyTop);
  dither(ctx, 50, 20, 20, 5, P.cloud2, P.skyBot);

  // Capitol dome
  // Base building
  fillRect(ctx, 48, 40, 64, 24, P.domeWhite);
  fillRect(ctx, 48, 40, 64, 4, P.domeHighlight);
  // Dome curve (simplified)
  fillRect(ctx, 62, 24, 36, 16, P.domeShadow);
  fillRect(ctx, 66, 20, 28, 6, P.domeWhite);
  fillRect(ctx, 70, 16, 20, 6, P.domeHighlight);
  fillRect(ctx, 74, 12, 12, 6, P.domeWhite);
  fillRect(ctx, 78, 8, 4, 6, P.domeHighlight);
  // Lantern on top
  fillRect(ctx, 79, 5, 2, 4, P.domeShadow);
  // Columns
  for (let i = 0; i < 8; i++) {
    const cx = 52 + i * 8;
    fillRect(ctx, cx, 44, 3, 18, P.column);
    fillRect(ctx, cx + 3, 44, 1, 18, P.columnShadow);
  }
  // Steps
  for (let s = 0; s < 3; s++) {
    fillRect(ctx, 44 - s * 4, 64 + s * 4, 72 + s * 8, 4, s % 2 === 0 ? P.steps : P.stepsLight);
  }

  // Grass (bottom half)
  for (let ty = 10; ty < 18; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const shade = (tx + ty) % 3 === 0 ? P.grassLight : (tx * ty) % 5 === 0 ? P.grassDark : P.grass;
      fillTile(ctx, tx, ty, shade);
    }
  }
  // Path
  fillRect(ctx, 72, 80, 16, 64, P.path);

  // Platforms
  drawPlatform(ctx, 116, 62, 22, 6, P.platEnemy);
  drawPlatform(ctx, 40, 110, 26, 7, P.platPlayer);
}

// ═══════════════════════════════════════════════════════════
// 3. SENATE CHAMBER
// ═══════════════════════════════════════════════════════════

function drawSenateChamber(ctx) {
  const P = {
    wallDark: "#3a2a22",
    wallMid: "#4a3a2a",
    wallLight: "#5a4a38",
    ceiling: "#2a2218",
    ceilingDither: "#3a3028",
    carpet: "#6a2222",
    carpetLight: "#7a3232",
    carpetDark: "#5a1818",
    deskWood: "#5a4a32",
    deskTop: "#6a5a42",
    deskShadow: "#3a2a1a",
    seatRed: "#8a3030",
    seatDark: "#6a2020",
    podium: "#7a6a4a",
    trim: "#8a7a52",
    platEnemy: "#5a4a32",
    platPlayer: "#6a2222",
  };

  // Ornate ceiling (top 3 tiles)
  for (let ty = 0; ty < 3; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, P.ceiling);
    }
  }
  dither(ctx, 0, 0, 160, 24, P.ceiling, P.ceilingDither);
  // Ceiling trim
  fillRect(ctx, 0, 23, 160, 1, P.trim);

  // Dark wood walls (rows 3-8)
  for (let ty = 3; ty < 9; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, ty % 2 === 0 ? P.wallDark : P.wallMid);
    }
  }
  // Wainscoting line
  fillRect(ctx, 0, 55, 160, 1, P.trim);
  fillRect(ctx, 0, 71, 160, 1, P.trim);

  // Curved desk rows (semicircle pattern)
  // Row 1 — smaller arc
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI * (0.15 + 0.7 * i / 9);
    const dx = Math.round(80 + Math.cos(angle) * 50);
    const dy = Math.round(65 + Math.sin(angle) * 12);
    fillRect(ctx, dx - 3, dy, 6, 4, P.deskWood);
    fillRect(ctx, dx - 3, dy, 6, 1, P.deskTop);
  }
  // Row 2 — wider arc
  for (let i = 0; i < 14; i++) {
    const angle = Math.PI * (0.1 + 0.8 * i / 13);
    const dx = Math.round(80 + Math.cos(angle) * 65);
    const dy = Math.round(75 + Math.sin(angle) * 14);
    fillRect(ctx, dx - 3, dy, 6, 4, P.deskWood);
    fillRect(ctx, dx - 3, dy, 6, 1, P.deskTop);
    // Seat behind each desk
    fillRect(ctx, dx - 2, dy + 4, 4, 3, P.seatRed);
  }

  // Podium at center-top
  fillRect(ctx, 72, 56, 16, 12, P.podium);
  fillRect(ctx, 72, 56, 16, 2, P.trim);

  // Red carpet (bottom)
  for (let ty = 11; ty < 18; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const shade = (tx + ty) % 2 === 0 ? P.carpet : P.carpetLight;
      fillTile(ctx, tx, ty, shade);
    }
  }
  // Carpet border
  fillRect(ctx, 0, 88, 160, 2, P.carpetDark);

  // Platforms
  drawPlatform(ctx, 116, 62, 22, 6, P.platEnemy);
  drawPlatform(ctx, 40, 110, 26, 7, P.platPlayer);
}

// ═══════════════════════════════════════════════════════════
// 4. TOWN HALL
// ═══════════════════════════════════════════════════════════

function drawTownHall(ctx) {
  const P = {
    wallBeige: "#c8b898",
    wallLight: "#d4c8a8",
    wallTrim: "#a89878",
    ceiling: "#d8d0b8",
    fluorescent: "#eeeedd",
    fluorescentGlow: "#ffffee",
    floor: "#a89070",
    floorLight: "#b8a080",
    chair: "#555555",
    chairSeat: "#666666",
    chairLeg: "#444444",
    banner: "#bb3333",
    bannerText: "#ddccaa",
    podiumWood: "#7a6a4a",
    curtain: "#886644",
    platEnemy: "#a89070",
    platPlayer: "#a89070",
  };

  // Ceiling (top 2 tiles)
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, P.ceiling);
    }
  }
  // Fluorescent lights
  fillRect(ctx, 20, 6, 40, 3, P.fluorescent);
  fillRect(ctx, 22, 7, 36, 1, P.fluorescentGlow);
  fillRect(ctx, 100, 6, 40, 3, P.fluorescent);
  fillRect(ctx, 102, 7, 36, 1, P.fluorescentGlow);

  // Beige walls (rows 2-8)
  for (let ty = 2; ty < 9; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, ty % 3 === 0 ? P.wallLight : P.wallBeige);
    }
  }
  // Wall trim at bottom
  fillRect(ctx, 0, 70, 160, 2, P.wallTrim);

  // Banner on wall
  fillRect(ctx, 60, 20, 40, 24, P.banner);
  fillRect(ctx, 62, 22, 36, 20, P.banner);
  // Banner text hint (horizontal lines)
  fillRect(ctx, 66, 26, 28, 2, P.bannerText);
  fillRect(ctx, 70, 32, 20, 2, P.bannerText);

  // Podium at center
  fillRect(ctx, 70, 52, 20, 16, P.podiumWood);

  // Folding chairs in rows
  for (let row = 0; row < 3; row++) {
    const rowY = 84 + row * 14;
    for (let i = 0; i < 12; i++) {
      const cx = 14 + i * 12;
      // Chair back
      fillRect(ctx, cx, rowY, 5, 6, P.chair);
      // Chair seat
      fillRect(ctx, cx, rowY + 6, 5, 2, P.chairSeat);
      // Legs
      fillRect(ctx, cx, rowY + 8, 1, 3, P.chairLeg);
      fillRect(ctx, cx + 4, rowY + 8, 1, 3, P.chairLeg);
    }
  }

  // Floor
  for (let ty = 14; ty < 18; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, (tx + ty) % 2 === 0 ? P.floor : P.floorLight);
    }
  }

  // Platforms
  drawPlatform(ctx, 116, 62, 22, 6, P.platEnemy);
  drawPlatform(ctx, 40, 110, 26, 7, P.platPlayer);
}

// ═══════════════════════════════════════════════════════════
// 5. LOBBYIST OFFICE (night scene)
// ═══════════════════════════════════════════════════════════

function drawLobbyistOffice(ctx) {
  const P = {
    nightSky: "#0a0a1e",
    nightMid: "#12122a",
    buildingDark: "#1a1a2e",
    buildingMid: "#222238",
    windowLit: "#ddaa44",
    windowDim: "#886622",
    windowFrame: "#2a2a40",
    glass: "#181830",
    glassReflect: "#222244",
    floor: "#2a2a20",
    floorLight: "#333328",
    desk: "#3a3a30",
    deskTop: "#4a4a3a",
    chair: "#2a2218",
    chairBack: "#332a20",
    plant: "#2a5a2a",
    plantPot: "#5a4a3a",
    plantLeaf: "#3a7a3a",
    lampGlow: "#ffdd88",
    lampShade: "#aa8844",
    platEnemy: "#2a2a40",
    platPlayer: "#2a2a20",
  };

  // Night sky (top 3 tiles)
  for (let ty = 0; ty < 3; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, ty === 0 ? P.nightSky : P.nightMid);
    }
  }
  // Stars
  const stars = [[10,4],[30,8],[55,3],[90,6],[120,2],[145,10],[70,12],[135,5]];
  ctx.fillStyle = "#ffffff";
  for (const [sx, sy] of stars) {
    ctx.fillRect(sx, sy, 1, 1);
  }

  // Floor-to-ceiling windows (rows 0-9, the city shows through)
  // Glass panels across width
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      if (ty >= 3) fillTile(ctx, tx, ty, P.glass);
    }
  }
  // Window frame dividers
  for (let tx = 0; tx < 20; tx += 4) {
    fillRect(ctx, tx * TILE, 0, 2, 80, P.windowFrame);
  }
  fillRect(ctx, 0, 40, 160, 2, P.windowFrame);

  // City skyline through windows
  // Building 1
  fillRect(ctx, 8, 30, 16, 50, P.buildingDark);
  fillRect(ctx, 10, 32, 4, 4, P.windowLit);
  fillRect(ctx, 18, 36, 4, 4, P.windowDim);
  fillRect(ctx, 10, 42, 4, 4, P.windowDim);
  fillRect(ctx, 18, 46, 4, 4, P.windowLit);
  // Building 2
  fillRect(ctx, 36, 22, 20, 58, P.buildingMid);
  fillRect(ctx, 38, 26, 4, 4, P.windowLit);
  fillRect(ctx, 46, 26, 4, 4, P.windowDim);
  fillRect(ctx, 38, 34, 4, 4, P.windowDim);
  fillRect(ctx, 46, 34, 4, 4, P.windowLit);
  fillRect(ctx, 42, 44, 4, 4, P.windowLit);
  // Building 3 (tall)
  fillRect(ctx, 68, 18, 14, 62, P.buildingDark);
  fillRect(ctx, 70, 22, 3, 3, P.windowLit);
  fillRect(ctx, 76, 22, 3, 3, P.windowDim);
  fillRect(ctx, 70, 30, 3, 3, P.windowLit);
  fillRect(ctx, 76, 34, 3, 3, P.windowLit);
  // Building 4
  fillRect(ctx, 94, 28, 18, 52, P.buildingMid);
  fillRect(ctx, 96, 32, 4, 4, P.windowDim);
  fillRect(ctx, 104, 32, 4, 4, P.windowLit);
  fillRect(ctx, 96, 40, 4, 4, P.windowLit);
  fillRect(ctx, 104, 44, 4, 4, P.windowDim);
  // Building 5
  fillRect(ctx, 124, 34, 24, 46, P.buildingDark);
  fillRect(ctx, 126, 38, 4, 4, P.windowLit);
  fillRect(ctx, 136, 38, 4, 4, P.windowDim);
  fillRect(ctx, 130, 48, 4, 4, P.windowLit);
  fillRect(ctx, 140, 46, 4, 4, P.windowLit);

  // Glass reflection effect
  dither(ctx, 0, 60, 160, 20, P.glassReflect, P.glass);

  // Floor (bottom half)
  for (let ty = 10; ty < 18; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      fillTile(ctx, tx, ty, (tx + ty) % 2 === 0 ? P.floor : P.floorLight);
    }
  }

  // Sleek desk (right side)
  fillRect(ctx, 100, 88, 48, 12, P.desk);
  fillRect(ctx, 100, 88, 48, 3, P.deskTop);

  // Leather chair silhouette (behind desk)
  fillRect(ctx, 116, 78, 16, 10, P.chairBack);
  fillRect(ctx, 118, 80, 12, 6, P.chair);

  // Potted plant (left side)
  fillRect(ctx, 12, 100, 6, 10, P.plantPot);
  // Leaves
  fillRect(ctx, 8, 88, 4, 12, P.plant);
  fillRect(ctx, 14, 86, 5, 14, P.plantLeaf);
  fillRect(ctx, 10, 82, 6, 8, P.plant);
  fillRect(ctx, 18, 90, 3, 8, P.plantLeaf);

  // Desk lamp glow
  fillRect(ctx, 104, 84, 3, 4, P.lampShade);
  dither(ctx, 100, 82, 10, 6, P.lampGlow, "transparent");

  // Platforms
  drawPlatform(ctx, 116, 62, 22, 6, P.platEnemy);
  drawPlatform(ctx, 40, 110, 26, 7, P.platPlayer);
}

// ─── Scene registry ───

export const SCENES = {
  congressional_office: drawCongressionalOffice,
  capitol_exterior: drawCapitolExterior,
  senate_chamber: drawSenateChamber,
  town_hall: drawTownHall,
  lobbyist_office: drawLobbyistOffice,
};

export const SCENE_NAMES = {
  congressional_office: "Congressional Office",
  capitol_exterior: "Capitol Exterior",
  senate_chamber: "Senate Chamber",
  town_hall: "Town Hall",
  lobbyist_office: "Lobbyist Office",
};
