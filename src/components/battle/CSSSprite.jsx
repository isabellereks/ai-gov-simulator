"use client";

// ═══════════════════════════════════════════════════════════
// CSS Pixel-Art Sprites — Game Boy Pokemon style
// All hard edges, no border-radius. "Roundness" comes from
// stacking offset rectangles like real pixel art.
// ═══════════════════════════════════════════════════════════

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SKIN = ["#f5d0a9", "#e8b88a", "#c9956b", "#8d6346", "#5c3a21"];
const HAIR_COL = ["#2c1810", "#4a3728", "#8b6914", "#c44a17", "#6b6b6b", "#f5e6c8"];
const PARTY_COL = { R: "#c1432e", D: "#2e5e8c", I: "#6b5b95" };
const OL = "#1a1510"; // outline

// Override skin/hair for well-known figures whose hash gives wrong results
const APPEARANCE_OVERRIDES = {
  // ── Existing ──
  "Lindsey Graham":   { skin: "#f5d0a9", hair: "#f5e6c8" },  // white, gray/blond
  "Mitch McConnell":  { skin: "#f5d0a9", hair: "#6b6b6b" },  // white, gray
  "Chuck Grassley":   { skin: "#f5d0a9", hair: "#6b6b6b" },  // white, gray
  "Bernie Sanders":   { skin: "#f5d0a9", hair: "#6b6b6b" },  // white, gray
  "Joe Manchin":      { skin: "#e8b88a", hair: "#4a3728" },   // white, dark
  "John Fetterman":   { skin: "#f5d0a9", hair: "#2c1810" },   // white, dark/bald
  "Tim Scott":        { skin: "#5c3a21", hair: "#2c1810" },   // Black
  "Cory Booker":      { skin: "#5c3a21", hair: "#2c1810" },   // Black
  "Raphael Warnock":  { skin: "#5c3a21", hair: "#2c1810" },   // Black
  "Ted Cruz":         { skin: "#e8b88a", hair: "#2c1810" },   // Hispanic, dark
  "Marco Rubio":      { skin: "#e8b88a", hair: "#2c1810" },   // Hispanic, dark
  "Nancy Pelosi":     { skin: "#f5d0a9", hair: "#8b6914" },   // white, auburn
  "Chuck Schumer":    { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Susan Collins":    { skin: "#f5d0a9", hair: "#4a3728" },   // white, short brown
  "Lisa Murkowski":   { skin: "#f5d0a9", hair: "#4a3728" },   // white, brown
  "Patty Murray":     { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  // ── New Senate ──
  "John Thune":       { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Rand Paul":        { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, curly gray
  "Josh Hawley":      { skin: "#f5d0a9", hair: "#4a3728" },   // white, dark brown
  "Tom Cotton":       { skin: "#f5d0a9", hair: "#4a3728" },   // white, dark brown
  "Rick Scott":       { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, bald/gray
  "Marsha Blackburn": { skin: "#f5d0a9", hair: "#f5e6c8" },   // white, blond
  "Tommy Tuberville": { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Joni Ernst":       { skin: "#f5d0a9", hair: "#4a3728" },   // white, brown
  "Elizabeth Warren":  { skin: "#f5d0a9", hair: "#f5e6c8" },   // white, blond/gray
  "Amy Klobuchar":    { skin: "#f5d0a9", hair: "#4a3728" },   // white, brown
  "Dick Durbin":      { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Kirsten Gillibrand":{ skin: "#f5d0a9", hair: "#f5e6c8" },  // white, blond
  "Ed Markey":        { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, white hair
  "Tammy Duckworth":  { skin: "#c9956b", hair: "#2c1810" },   // Thai-American, black
  "Mark Kelly":       { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, bald/gray
  "Jon Ossoff":       { skin: "#f5d0a9", hair: "#2c1810" },   // white, dark hair
  "Adam Schiff":      { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  // ── New House ──
  "Mike Johnson":     { skin: "#f5d0a9", hair: "#4a3728" },   // white, brown
  "Steve Scalise":    { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Jim Jordan":       { skin: "#f5d0a9", hair: "#f5e6c8" },   // white, light/blond
  "Marjorie Taylor Greene": { skin: "#f5d0a9", hair: "#f5e6c8" }, // white, blond
  "Lauren Boebert":   { skin: "#f5d0a9", hair: "#4a3728" },   // white, dark brown
  "Dan Crenshaw":     { skin: "#e8b88a", hair: "#2c1810" },   // white, dark hair
  "Elise Stefanik":   { skin: "#f5d0a9", hair: "#4a3728" },   // white, brown
  "Chip Roy":         { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Matt Gaetz":       { skin: "#f5d0a9", hair: "#4a3728" },   // white, dark brown
  "Thomas Massie":    { skin: "#f5d0a9", hair: "#4a3728" },   // white, brown
  "Hakeem Jeffries":  { skin: "#5c3a21", hair: "#2c1810" },   // Black, dark hair
  "Alexandria Ocasio-Cortez": { skin: "#c9956b", hair: "#2c1810" }, // Hispanic, dark
  "Ilhan Omar":       { skin: "#8d6346", hair: "#2c1810" },   // Somali, dark hair
  "Rashida Tlaib":    { skin: "#c9956b", hair: "#2c1810" },   // Palestinian-American
  "Pramila Jayapal":  { skin: "#8d6346", hair: "#2c1810" },   // South Asian, dark
  "Jamie Raskin":     { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Jim Clyburn":      { skin: "#5c3a21", hair: "#6b6b6b" },   // Black, gray
  "Maxine Waters":    { skin: "#5c3a21", hair: "#6b6b6b" },   // Black, gray
  "Jerry Nadler":     { skin: "#f5d0a9", hair: "#6b6b6b" },   // white, gray
  "Ro Khanna":        { skin: "#8d6346", hair: "#2c1810" },   // South Asian, dark
};

// Common female first names for gender inference
const FEMALE_NAMES = new Set([
  "lisa","susan","patty","maria","tammy","amy","kirsten","jeanne","maggie",
  "catherine","shelley","debbie","joni","marsha","cindy","martha","jacky",
  "tina","mazie","dianne","elizabeth","kamala","kyrsten","cynthia","deb",
  "nancy","rosa","elise","katherine","virginia","diana","ann","anne",
  "mary","linda","barbara","betty","margaret","sandra","ashley","dorothy",
  "kimberly","emily","donna","michelle","carol","amanda","melissa","deborah",
  "stephanie","rebecca","sharon","laura","cynthia","kathleen","julia",
  "joyce","victoria","kelly","nicole","christina","ruth","janet","andrea",
  "angela","helen","karen","sarah","anna","brenda","pamela","christine",
  "samantha","marie","teresa","gloria","wendy","alice","jean","denise",
  "frances","janice","cheryl","marge","lois","jan","maxine","val",
  "elissa","katie","suzan","dina","terri","pramila","cheri","grace",
  "nikema","kathy","adriano","lori","jen","jennifer","jill","jo","haley",
  "claudia","veronica","linda","yvette","frederica","sheila","robin",
  "gwen","angie","deborah","lucille","tulsi","alexandria","rashida",
  "ilhan","ayanna","abigail","mikie","sara","cori","marie","summer",
  "lauren","hillary","madeleine","becca","brittany","kat","andrea",
  "susie","annie","val","nikki","liz","deb","kay","jaime",
]);

function isFemale(name) {
  const first = (name || "").split(" ")[0].toLowerCase().trim();
  return FEMALE_NAMES.has(first);
}

// Helper: place a pixel block
function B(top, left, w, h, bg) {
  return { position: "absolute", top, left, width: w, height: h, background: bg };
}

// ═══════════════════════════════════════
// SENATOR SPRITE (front-facing)
// ═══════════════════════════════════════
export default function CSSSprite({
  name = "Unknown",
  party = "D",
  size = 32,
  flip = false,
}) {
  // Special sprites for notable figures
  if (name === "JD Vance") return <VanceSprite size={size} flip={flip} />;

  const hv = hashStr(name);
  const ovr = APPEARANCE_OVERRIDES[name];
  const skin = ovr?.skin || SKIN[hv % SKIN.length];
  const hair = ovr?.hair || HAIR_COL[(hv >> 3) % HAIR_COL.length];
  const suit = PARTY_COL[party] || PARTY_COL.I;
  const female = isFemale(name);
  const hairVar = (hv >> 6) % 4; // 4 hair variants per gender
  const hasGlasses = (hv >> 10) % 5 === 0;

  // Grid: 16x16. Each cell = size/16 px.
  const u = size / 16;
  const p = (v) => `${v * u}px`;

  // All blocks as [top, left, width, height, color]
  const blocks = [];
  const add = (t, l, w, h, c) => blocks.push([t, l, w, h, c]);

  // ── HEAD OUTLINE (stepped pixels for round shape) ──
  //   Row 1:   ████████  (cols 4-11, 8 wide)
  //   Row 2:  ██████████ (cols 3-12, 10 wide)
  //   Row 3: ████████████(cols 3-12, 10 wide)
  //   ...
  //   Row 7:  ██████████ (cols 3-12, 10 wide)
  //   Row 8:   ████████  (cols 4-11, 8 wide)
  add(1, 4, 8, 1, OL);  // top edge
  add(2, 3, 10, 1, OL); // wider
  add(3, 3, 10, 1, OL);
  add(4, 3, 10, 1, OL);
  add(5, 3, 10, 1, OL);
  add(6, 3, 10, 1, OL);
  add(7, 3, 10, 1, OL);
  add(8, 4, 8, 1, OL);  // bottom edge

  // ── HEAD FILL (skin, inset 1px from outline) ──
  add(1, 5, 6, 1, skin);  // top row narrow
  add(2, 4, 8, 1, skin);
  add(3, 4, 8, 1, skin);
  add(4, 4, 8, 1, skin);
  add(5, 4, 8, 1, skin);
  add(6, 4, 8, 1, skin);
  add(7, 4, 8, 1, skin);

  // ── EYEBROWS (males get brows above eyes) ──
  if (!female) {
    add(4, 6, 2, 1, darken(hair));
    add(4, 9, 2, 1, darken(hair));
  }

  // ── EYES (1x2 vertical blocks) ──
  add(5, 6, 1, 2, OL);
  add(5, 9, 1, 2, OL);

  // ── MOUTH ──
  add(7, 7, 2, 1, darken(skin));

  // ── HAIR ──
  // Hair wraps around top of head, covering outline rows 1-3 and sides
  if (female) {
    if (hairVar === 0) {
      // Long straight — covers top, flows past head
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 3, hair);
      add(2, 3, 1, 3, hair);  add(2, 12, 1, 3, hair);
      add(5, 2, 1, 6, hair);  add(5, 13, 1, 6, hair); // long sides
    } else if (hairVar === 1) {
      // Bob — wraps head, ends at chin
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 3, hair);
      add(2, 3, 1, 3, hair);  add(2, 12, 1, 3, hair);
      add(5, 2, 2, 4, hair);  add(5, 12, 2, 4, hair);
    } else if (hairVar === 2) {
      // Updo / bun — poof on top
      add(-1, 6, 4, 1, hair);
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 3, hair);
      add(2, 3, 1, 3, hair);  add(2, 12, 1, 3, hair);
    } else {
      // Bangs — thick fringe over forehead
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 4, hair); // thick — covers eyes area too
      add(2, 3, 1, 3, hair);  add(2, 12, 1, 3, hair);
      add(5, 2, 1, 5, hair);  add(5, 13, 1, 5, hair);
      // Re-draw eyes on top of bangs
      add(5, 6, 1, 2, OL);  add(5, 9, 1, 2, OL);
    }
  } else {
    if (hairVar === 0) {
      // Short neat — wraps top
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 2, hair);
      add(2, 3, 1, 2, hair);  add(2, 12, 1, 2, hair);
    } else if (hairVar === 1) {
      // Buzz — thin cap
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 1, hair);
      add(1, 3, 1, 2, hair);  add(1, 12, 1, 2, hair);
    } else if (hairVar === 2) {
      // Tall / spiky — extra height
      add(-1, 6, 4, 1, hair);
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 2, hair);
      add(2, 3, 1, 2, hair);  add(2, 12, 1, 2, hair);
    } else {
      // Side part — asymmetric
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 2, hair);
      add(1, 3, 2, 3, hair); // thicker left side
      add(2, 12, 1, 2, hair);
    }
  }

  // ── GLASSES ──
  if (hasGlasses) {
    add(4, 4, 3, 2, "rgba(180,200,220,0.4)");
    add(4, 9, 3, 2, "rgba(180,200,220,0.4)");
    // frames
    add(4, 4, 3, 1, "rgba(50,50,50,0.6)");
    add(5, 4, 1, 1, "rgba(50,50,50,0.6)");
    add(5, 6, 1, 1, "rgba(50,50,50,0.6)");
    add(4, 9, 3, 1, "rgba(50,50,50,0.6)");
    add(5, 9, 1, 1, "rgba(50,50,50,0.6)");
    add(5, 11, 1, 1, "rgba(50,50,50,0.6)");
    add(4, 7, 2, 1, "rgba(50,50,50,0.5)"); // bridge
  }

  // ── BODY (bell shape — wide torso tapering to feet) ──
  // Outline
  add(9, 4, 8, 1, OL);    // shoulders
  add(10, 3, 10, 1, OL);  // wide
  add(11, 3, 10, 1, OL);
  add(12, 3, 10, 1, OL);
  add(13, 4, 8, 1, OL);   // narrower bottom
  // Fill
  add(9, 5, 6, 1, suit);
  add(10, 4, 8, 1, suit);
  add(11, 4, 8, 1, suit);
  add(12, 4, 8, 1, suit);

  // Collar
  add(9, 7, 2, 1, "#e8e0d4");

  // Tie / necklace
  if (female) {
    add(10, 7, 2, 1, darken(suit));
  } else {
    add(10, 7, 1, 2, darken(suit));
  }

  // ── ARMS (stubs on sides) ──
  add(10, 2, 2, 2, OL);
  add(10, 12, 2, 2, OL);
  add(10, 2, 1, 1, suit);
  add(10, 13, 1, 1, suit);

  // ── FEET (poking out bottom of body) ──
  add(14, 4, 3, 1, OL);
  add(14, 9, 3, 1, OL);

  return (
    <div className="pokemac-sprite" style={{
      width: p(16), height: p(16), position: "relative",
      imageRendering: "pixelated",
      transform: flip ? "scaleX(-1)" : undefined,
    }}>
      {blocks.map(([t, l, w, h, c], i) => (
        <div key={i} style={B(p(t), p(l), p(w), p(h), c)} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// TRAINER SPRITE (back-facing)
// ═══════════════════════════════════════
const CLASS_ACCENTS = {
  business_owner: "#d4a017",
  lobbyist: "#2e3d4f",
  campaign_operative: "#943232",
  policy_wonk: "#4a7a5f",
  parent: "#a882a1",
  veteran: "#5a6b4a",
  student_activist: "#c8854e",
  party_insider: "#7a6aaa",
};

export function TrainerSprite({ trainerClass = "lobbyist", size = 32 }) {
  const accent = CLASS_ACCENTS[trainerClass] || "#4a3f30";
  const u = size / 16;
  const p = (v) => `${v * u}px`;

  const hair = "#4a3728";
  const skin = "#e8b88a";
  const blocks = [];
  const add = (t, l, w, h, c) => blocks.push([t, l, w, h, c]);

  // ── HEAD OUTLINE (stepped, back view) ──
  add(1, 4, 8, 1, OL);
  add(2, 3, 10, 1, OL);
  add(3, 3, 10, 1, OL);
  add(4, 3, 10, 1, OL);
  add(5, 3, 10, 1, OL);
  add(6, 3, 10, 1, OL);
  add(7, 3, 10, 1, OL);
  add(8, 4, 8, 1, OL);

  // ── HEAD FILL (skin at bottom/sides) ──
  add(6, 4, 8, 1, skin);
  add(7, 4, 8, 1, skin);

  // ── HAIR (covers most of back of head) ──
  add(1, 5, 6, 1, hair);
  add(2, 4, 8, 1, hair);
  add(3, 4, 8, 1, hair);
  add(4, 4, 8, 1, hair);
  add(5, 4, 8, 1, hair);
  // Side hair
  add(2, 3, 1, 4, hair);
  add(2, 12, 1, 4, hair);

  // ── CLASS ACCESSORIES ──
  if (trainerClass === "business_owner") {
    // Hard hat
    add(0, 3, 10, 2, "#d4a017");
    add(-1, 4, 8, 1, "#d4a017");
    add(0, 2, 1, 1, "#d4a017"); // brim
    add(0, 13, 1, 1, "#d4a017");
  } else if (trainerClass === "campaign_operative") {
    // Backwards baseball cap
    add(0, 3, 10, 2, "#943232");
    add(2, 12, 3, 2, "#943232"); // brim going back
    add(0, 7, 2, 1, "#fff"); // logo
  } else if (trainerClass === "lobbyist") {
    // Briefcase
    add(12, 13, 3, 2, "#5a4a30");
    add(12, 14, 1, 1, "#d4a017"); // latch
  } else if (trainerClass === "policy_wonk") {
    // Glasses arms visible on sides + book
    add(4, 2, 1, 1, "#333");
    add(4, 13, 1, 1, "#333");
    add(11, 0, 2, 3, "#8b4513");
    add(11, 0, 1, 2, "#f5e6c8"); // pages
  } else if (trainerClass === "veteran") {
    // Military beret
    add(-1, 3, 10, 2, "#3d4a32");
    add(0, 1, 2, 2, "#3d4a32"); // floppy side
  } else if (trainerClass === "student_activist") {
    // Beanie
    add(-1, 4, 8, 2, "#c8854e");
    add(0, 3, 1, 1, "#c8854e");
    add(0, 12, 1, 1, "#c8854e");
    add(1, 4, 8, 1, darken("#c8854e")); // band
    // Protest sign
    add(7, 14, 1, 8, "#8b7355");
    add(5, 13, 3, 3, "#f5f0e0");
  } else if (trainerClass === "parent") {
    // Tote bag
    add(8, 12, 1, 4, "#7a5c6a");
    add(11, 12, 3, 3, "#9a7290");
  } else if (trainerClass === "party_insider") {
    // Fedora
    add(-1, 2, 12, 1, "#5a4a7a"); // brim
    add(-2, 4, 8, 2, "#7a6aaa");  // crown
    add(-1, 5, 6, 1, "#5a4a7a");  // band
  }

  // ── BODY (bell shape) ──
  add(9, 4, 8, 1, OL);
  add(10, 3, 10, 1, OL);
  add(11, 3, 10, 1, OL);
  add(12, 3, 10, 1, OL);
  add(13, 4, 8, 1, OL);
  // Fill
  add(9, 5, 6, 1, accent);
  add(10, 4, 8, 1, accent);
  add(11, 4, 8, 1, accent);
  add(12, 4, 8, 1, accent);

  // ── ARMS ──
  add(10, 2, 2, 2, OL);
  add(10, 12, 2, 2, OL);
  add(10, 2, 1, 1, accent);
  add(10, 13, 1, 1, accent);

  // ── FEET ──
  add(14, 4, 3, 1, OL);
  add(14, 9, 3, 1, OL);

  return (
    <div className="pokemac-sprite" style={{
      width: p(16), height: p(16), position: "relative",
      imageRendering: "pixelated",
    }}>
      {blocks.map(([t, l, w, h, c], i) => (
        <div key={i} style={B(p(t), p(l), p(w), p(h), c)} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// JD VANCE — special sprite
// Dark short hair, beard, suit & tie
// ═══════════════════════════════════════
function VanceSprite({ size = 32, flip = false }) {
  const u = size / 16;
  const p = (v) => `${v * u}px`;
  const blocks = [];
  const add = (t, l, w, h, c) => blocks.push([t, l, w, h, c]);

  const skin = "#e8b88a";
  const hair = "#2c1810"; // dark brown/black
  const beard = "#3d2e18";
  const suit = "#1a2a3a"; // dark navy suit

  // ── HEAD OUTLINE ──
  add(1, 4, 8, 1, OL);
  add(2, 3, 10, 1, OL);
  add(3, 3, 10, 1, OL);
  add(4, 3, 10, 1, OL);
  add(5, 3, 10, 1, OL);
  add(6, 3, 10, 1, OL);
  add(7, 3, 10, 1, OL);
  add(8, 4, 8, 1, OL);

  // ── HEAD FILL ──
  add(1, 5, 6, 1, skin);
  add(2, 4, 8, 1, skin);
  add(3, 4, 8, 1, skin);
  add(4, 4, 8, 1, skin);
  add(5, 4, 8, 1, skin);
  add(6, 4, 8, 1, skin);
  add(7, 4, 8, 1, skin);

  // ── HAIR — short, neat, parted ──
  add(0, 5, 6, 1, hair);
  add(1, 4, 8, 2, hair);
  add(2, 3, 1, 2, hair);
  add(2, 12, 1, 2, hair);
  // Receding a bit — show skin at temples
  add(2, 4, 1, 1, skin);
  add(2, 11, 1, 1, skin);

  // ── EYES (1x2 vertical) ──
  add(5, 6, 1, 2, OL);
  add(5, 9, 1, 2, OL);

  // ── BEARD — covers lower face ──
  add(7, 5, 6, 1, beard);  // chin
  add(6, 4, 1, 2, beard);  // jaw left
  add(6, 11, 1, 2, beard); // jaw right
  add(6, 5, 6, 1, beard);  // under nose/cheeks

  // ── MOUTH (visible through beard) ──
  add(7, 7, 2, 1, "#5a3a28");

  // ── BODY (bell shape, dark suit) ──
  add(9, 4, 8, 1, OL);
  add(10, 3, 10, 1, OL);
  add(11, 3, 10, 1, OL);
  add(12, 3, 10, 1, OL);
  add(13, 4, 8, 1, OL);
  add(9, 5, 6, 1, suit);
  add(10, 4, 8, 1, suit);
  add(11, 4, 8, 1, suit);
  add(12, 4, 8, 1, suit);

  // White shirt collar
  add(9, 6, 1, 1, "#e8e0d4");
  add(9, 9, 1, 1, "#e8e0d4");
  // Red tie
  add(9, 7, 2, 1, "#c1432e");
  add(10, 7, 1, 2, "#c1432e");

  // ── ARMS ──
  add(10, 2, 2, 2, OL);
  add(10, 12, 2, 2, OL);
  add(10, 2, 1, 1, suit);
  add(10, 13, 1, 1, suit);

  // ── FEET ──
  add(14, 4, 3, 1, OL);
  add(14, 9, 3, 1, OL);

  return (
    <div className="pokemac-sprite" style={{
      width: p(16), height: p(16), position: "relative",
      imageRendering: "pixelated",
      transform: flip ? "scaleX(-1)" : undefined,
    }}>
      {blocks.map(([t, l, w, h, c], i) => (
        <div key={i} style={B(p(t), p(l), p(w), p(h), c)} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// TRAINER SPRITE — FRONT-FACING (for cards)
// Same class accessories, but with a face
// Supports gender + hair/skin randomization
// ═══════════════════════════════════════
const TRAINER_SKINS = ["#f5d0a9", "#e8b88a", "#c9956b", "#8d6346"];
const TRAINER_HAIRS = ["#2c1810", "#4a3728", "#8b6914", "#c44a17", "#6b6b6b", "#f5e6c8"];

export function TrainerSpriteFront({ trainerClass = "lobbyist", size = 32, female = false, skinIdx = 0, hairIdx = 0, hairVar = 0 }) {
  const accent = CLASS_ACCENTS[trainerClass] || "#4a3f30";
  const u = size / 16;
  const p = (v) => `${v * u}px`;

  const skin = TRAINER_SKINS[skinIdx % TRAINER_SKINS.length];
  const hair = TRAINER_HAIRS[hairIdx % TRAINER_HAIRS.length];
  const blocks = [];
  const add = (t, l, w, h, c) => blocks.push([t, l, w, h, c]);

  // ── HEAD OUTLINE ──
  add(1, 4, 8, 1, OL);
  add(2, 3, 10, 1, OL);
  add(3, 3, 10, 1, OL);
  add(4, 3, 10, 1, OL);
  add(5, 3, 10, 1, OL);
  add(6, 3, 10, 1, OL);
  add(7, 3, 10, 1, OL);
  add(8, 4, 8, 1, OL);

  // ── HEAD FILL ──
  add(1, 5, 6, 1, skin);
  add(2, 4, 8, 1, skin);
  add(3, 4, 8, 1, skin);
  add(4, 4, 8, 1, skin);
  add(5, 4, 8, 1, skin);
  add(6, 4, 8, 1, skin);
  add(7, 4, 8, 1, skin);

  // ── EYEBROWS (males) ──
  if (!female) {
    add(4, 6, 2, 1, darken(hair));
    add(4, 9, 2, 1, darken(hair));
  }

  // ── EYES ──
  add(5, 6, 1, 2, OL);
  add(5, 9, 1, 2, OL);

  // ── MOUTH ──
  add(7, 7, 2, 1, darken(skin));

  // ── HAIR ──
  if (female) {
    const hv = hairVar % 4;
    if (hv === 0) {
      // Long straight
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 3, hair);
      add(2, 3, 1, 3, hair); add(2, 12, 1, 3, hair);
      add(5, 2, 1, 6, hair); add(5, 13, 1, 6, hair);
    } else if (hv === 1) {
      // Bob
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 3, hair);
      add(2, 3, 1, 3, hair); add(2, 12, 1, 3, hair);
      add(5, 2, 2, 4, hair); add(5, 12, 2, 4, hair);
    } else if (hv === 2) {
      // Updo / bun
      add(-1, 6, 4, 1, hair);
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 3, hair);
      add(2, 3, 1, 3, hair); add(2, 12, 1, 3, hair);
    } else {
      // Bangs
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 4, hair);
      add(2, 3, 1, 3, hair); add(2, 12, 1, 3, hair);
      add(5, 2, 1, 5, hair); add(5, 13, 1, 5, hair);
      // Re-draw eyes on top of bangs
      add(5, 6, 1, 2, OL); add(5, 9, 1, 2, OL);
    }
    // Necklace
    add(10, 7, 2, 1, darken(accent));
  } else {
    const hv = hairVar % 4;
    if (hv === 0) {
      // Short neat
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 2, hair);
      add(2, 3, 1, 2, hair); add(2, 12, 1, 2, hair);
    } else if (hv === 1) {
      // Buzz
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 1, hair);
      add(1, 3, 1, 2, hair); add(1, 12, 1, 2, hair);
    } else if (hv === 2) {
      // Tall / spiky
      add(-1, 6, 4, 1, hair);
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 2, hair);
      add(2, 3, 1, 2, hair); add(2, 12, 1, 2, hair);
    } else {
      // Side part
      add(0, 5, 6, 1, hair);
      add(1, 4, 8, 2, hair);
      add(1, 3, 2, 3, hair); // thicker left
      add(2, 12, 1, 2, hair);
    }
    // Tie
    add(10, 7, 1, 2, darken(accent));
  }

  // ── CLASS ACCESSORIES ──
  if (trainerClass === "business_owner") {
    add(0, 3, 10, 2, "#d4a017");
    add(-1, 4, 8, 1, "#d4a017");
    add(0, 2, 1, 1, "#d4a017");
    add(0, 13, 1, 1, "#d4a017");
  } else if (trainerClass === "campaign_operative") {
    add(0, 3, 10, 2, "#943232");
    add(-1, 2, 12, 1, "#943232");
    add(0, 7, 2, 1, "#fff");
  } else if (trainerClass === "lobbyist") {
    add(12, 0, 3, 2, "#5a4a30");
    add(12, 1, 1, 1, "#d4a017");
  } else if (trainerClass === "policy_wonk") {
    add(4, 5, 3, 2, "rgba(180,200,220,0.4)");
    add(4, 9, 3, 2, "rgba(180,200,220,0.4)");
    add(4, 5, 3, 1, "rgba(50,50,50,0.6)");
    add(5, 5, 1, 1, "rgba(50,50,50,0.6)");
    add(5, 7, 1, 1, "rgba(50,50,50,0.6)");
    add(4, 9, 3, 1, "rgba(50,50,50,0.6)");
    add(5, 9, 1, 1, "rgba(50,50,50,0.6)");
    add(5, 11, 1, 1, "rgba(50,50,50,0.6)");
    add(4, 7, 2, 1, "rgba(50,50,50,0.5)");
    add(11, 0, 2, 3, "#8b4513");
    add(11, 0, 1, 2, "#f5e6c8");
  } else if (trainerClass === "veteran") {
    add(-1, 3, 10, 2, "#3d4a32");
    add(0, 2, 2, 2, "#3d4a32");
  } else if (trainerClass === "student_activist") {
    add(-1, 4, 8, 2, "#c8854e");
    add(0, 3, 1, 1, "#c8854e");
    add(0, 12, 1, 1, "#c8854e");
    add(1, 4, 8, 1, darken("#c8854e"));
    add(5, 14, 3, 3, "#f5f0e0");
    add(7, 15, 1, 8, "#8b7355");
  } else if (trainerClass === "parent") {
    add(8, 0, 1, 4, "#7a5c6a");
    add(11, -1, 3, 3, "#9a7290");
  } else if (trainerClass === "party_insider") {
    add(-1, 2, 12, 1, "#5a4a7a");
    add(-2, 4, 8, 2, "#7a6aaa");
    add(-1, 5, 6, 1, "#5a4a7a");
  }

  // ── BODY (bell shape) ──
  add(9, 4, 8, 1, OL);
  add(10, 3, 10, 1, OL);
  add(11, 3, 10, 1, OL);
  add(12, 3, 10, 1, OL);
  add(13, 4, 8, 1, OL);
  add(9, 5, 6, 1, accent);
  add(10, 4, 8, 1, accent);
  add(11, 4, 8, 1, accent);
  add(12, 4, 8, 1, accent);

  // Collar
  add(9, 7, 2, 1, "#e8e0d4");

  // ── ARMS ──
  add(10, 2, 2, 2, OL);
  add(10, 12, 2, 2, OL);
  add(10, 2, 1, 1, accent);
  add(10, 13, 1, 1, accent);

  // ── FEET ──
  if (female) {
    // Skirt hint — slightly wider bottom
    add(13, 3, 10, 1, accent);
    add(14, 5, 2, 1, OL);
    add(14, 9, 2, 1, OL);
  } else {
    add(14, 4, 3, 1, OL);
    add(14, 9, 3, 1, OL);
  }

  return (
    <div className="pokemac-sprite" style={{
      width: p(16), height: p(16), position: "relative",
      imageRendering: "pixelated",
    }}>
      {blocks.map(([t, l, w, h, c], i) => (
        <div key={i} style={B(p(t), p(l), p(w), p(h), c)} />
      ))}
    </div>
  );
}

function darken(hex) {
  if (!hex || hex[0] !== "#") return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * 0.7)},${Math.round(g * 0.7)},${Math.round(b * 0.7)})`;
}
