import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { DB } from "./govData";
import { Button } from "@/src/components/ui/button";
import { Card, CardTitle, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/src/components/ui/dialog";

// ─── DESIGN TOKENS ───
const C = {
  bg: "#f5f0e8", card: "#fff", cardAlt: "#faf7f2",
  border: "#ddd6c8", borderLight: "#ebe5d9",
  text: "#1a1510", textMid: "#6b604e", textMute: "#a89e8c",
  rep: "#c1432e", dem: "#2e5e8c", ind: "#6b5b95",
  yea: "#2a6e3f", nay: "#943232",
  yeaMute: "#5a7a5f", nayMute: "#a05050",
  bar: "#2c2418", barTrack: "#3d3428", barTrackAlt: "#4a3f30",
  barMute: "#6b604e", barFill: "#c5bca9", barKnob: "#f5f0e8",
};
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const R = { sm: 4, md: 6, lg: 8 };
const S = {
  sm: "0 1px 3px rgba(44,36,24,0.06)",
  md: "0 4px 16px rgba(44,36,24,0.08)",
  lg: "0 8px 32px rgba(44,36,24,0.10)",
};

// ─── NOTABLE MEMBERS (shimmer highlight) ───
const NOTABLE = new Set([
  "Ted Cruz", "Bernie Sanders", "Hakeem Jeffries",
  "Mike Johnson", "Chuck Schumer", "Alexandria Ocasio-Cortez",
]);

// ─── ISSUE LABELS ───
// Each issue has [leftLabel, rightLabel] — 0.0=left position, 1.0=right position
const ISSUE_DIR = {
  immigration:          ["pro-immigration", "border security"],
  taxes_spending:       ["higher taxes on wealthy", "tax cuts"],
  healthcare:           ["universal healthcare", "free-market healthcare"],
  gun_rights:           ["gun control", "gun rights expansion"],
  climate_energy:       ["climate action", "fossil fuel priority"],
  defense_military:     ["reduce military spending", "increase defense spending"],
  education:            ["public education funding", "school choice"],
  tech_regulation:      ["tech regulation", "tech deregulation"],
  criminal_justice:     ["criminal justice reform", "tough on crime"],
  trade_tariffs:        ["free trade", "protectionist tariffs"],
  abortion_social:      ["abortion rights", "abortion restrictions"],
  government_spending:  ["expand gov. programs", "cut gov. spending"],
  foreign_policy_hawks: ["diplomatic restraint", "military intervention"],
  civil_liberties:      ["civil liberties priority", "security priority"],
  labor_unions:         ["pro-union", "pro-business"],
};

// ─── MAP DATABASE TO SIM FORMAT ───
const ideologyScore = m => {
  if (!m.issues) return 0.5;
  const v = Object.values(m.issues);
  return v.reduce((a, b) => a + b, 0) / v.length;
};

const SEN = DB.senate.map((s, j) => ({
  ...s, id: `s${j}`, ch: "sen", n: s.name, s: s.state, p: s.party,
  r: s.leadership || "Senator", i: ideologyScore(s),
}));

const HOU = (DB.house && DB.house.length > 0
  ? DB.house.map((h, j) => ({
      ...h, id: `h${j}`, ch: "hou", n: h.name, s: h.state, p: h.party,
      r: h.leadership || "Rep.", i: ideologyScore(h),
    }))
  : [
    {n:"Mike Johnson",s:"LA",p:"R",r:"Speaker",i:.85},{n:"Steve Scalise",s:"LA",p:"R",r:"Majority Leader",i:.82},
    {n:"Tom Emmer",s:"MN",p:"R",r:"Majority Whip",i:.75},{n:"Jim Jordan",s:"OH",p:"R",r:"Judiciary Chair",i:.92},
    {n:"James Comer",s:"KY",p:"R",r:"Oversight Chair",i:.84},{n:"Byron Donalds",s:"FL",p:"R",r:"Rep.",i:.88},
    {n:"Lauren Boebert",s:"CO",p:"R",r:"Rep.",i:.93},{n:"Nancy Mace",s:"SC",p:"R",r:"Rep.",i:.65},
    {n:"Don Bacon",s:"NE",p:"R",r:"Rep.",i:.52},{n:"Brian Fitzpatrick",s:"PA",p:"R",r:"Rep.",i:.45},
    {n:"Mike Lawler",s:"NY",p:"R",r:"Rep.",i:.48},{n:"Chip Roy",s:"TX",p:"R",r:"Rep.",i:.89},
    {n:"Dan Crenshaw",s:"TX",p:"R",r:"Rep.",i:.71},{n:"Elise Stefanik",s:"NY",p:"R",r:"Rep.",i:.72},
    {n:"Anna Paulina Luna",s:"FL",p:"R",r:"Rep.",i:.86},{n:"Lisa McClain",s:"MI",p:"R",r:"Conf. Chair",i:.8},
    {n:"Hakeem Jeffries",s:"NY",p:"D",r:"Minority Leader",i:.18},{n:"Katherine Clark",s:"MA",p:"D",r:"Minority Whip",i:.12},
    {n:"Pete Aguilar",s:"CA",p:"D",r:"Caucus Chair",i:.22},{n:"Alexandria Ocasio-Cortez",s:"NY",p:"D",r:"Rep.",i:.04},
    {n:"Ilhan Omar",s:"MN",p:"D",r:"Rep.",i:.06},{n:"Rashida Tlaib",s:"MI",p:"D",r:"Rep.",i:.05},
    {n:"Ro Khanna",s:"CA",p:"D",r:"Rep.",i:.1},{n:"Jamie Raskin",s:"MD",p:"D",r:"Rep.",i:.08},
    {n:"Jim Clyburn",s:"SC",p:"D",r:"Rep.",i:.2},{n:"Maxine Waters",s:"CA",p:"D",r:"Rep.",i:.07},
    {n:"Pramila Jayapal",s:"WA",p:"D",r:"Prog. Chair",i:.06},{n:"Jared Golden",s:"ME",p:"D",r:"Rep.",i:.38},
    {n:"Henry Cuellar",s:"TX",p:"D",r:"Rep.",i:.4},{n:"Jerry Nadler",s:"NY",p:"D",r:"Rep.",i:.1},
    {n:"D. Wasserman Schultz",s:"FL",p:"D",r:"Rep.",i:.19},
  ].map((x, j) => ({ ...x, id: `h${j}`, ch: "hou" }))
);

const EXC = DB.executive.map((e, j) => ({
  ...e, id: `e${j}`, ch: "exc", n: e.name, p: "R", r: e.role, i: ideologyScore(e),
}));

const SCT = DB.scotus.map((j, idx) => {
  const avgConst = j.constitutional_issues
    ? Object.values(j.constitutional_issues).reduce((a, b) => a + b, 0) / Object.values(j.constitutional_issues).length
    : 0.5;
  return {
    ...j, id: `j${idx}`, ch: "sct", n: j.name,
    p: avgConst > 0.55 ? "R" : "D", r: j.role,
    ab: j.appointed_by, y: j.year_appointed, i: avgConst,
  };
});

// ─── ENRICHED PRESET POLICIES ───
const POLS = [
  {
    name: "Secure Borders Act", lean: "right", partySupport: "R",
    issueWeights: { immigration: 0.95, government_spending: 0.4, criminal_justice: 0.35, defense_military: 0.3 },
    issuePositions: { immigration: 0.92, government_spending: 0.75, criminal_justice: 0.80, defense_military: 0.80 },
    affectedIndustries: ["defense", "construction", "agriculture"],
    constitutionalIssues: { executive_power: 0.5, federal_vs_state_power: 0.45, individual_rights_vs_government: 0.3 },
    constitutionalPosition: { executive_power: 0.72, federal_vs_state_power: 0.65, individual_rights_vs_government: 0.65 },
  },
  {
    name: "Green New Deal 2.0", lean: "left", partySupport: "D",
    issueWeights: { climate_energy: 0.95, government_spending: 0.8, labor_unions: 0.6, taxes_spending: 0.5, education: 0.3 },
    issuePositions: { climate_energy: 0.08, government_spending: 0.15, labor_unions: 0.12, taxes_spending: 0.15, education: 0.18 },
    affectedIndustries: ["energy", "manufacturing", "construction", "transportation"],
    constitutionalIssues: { regulatory_authority_admin_state: 0.7, commerce_clause_scope: 0.5, federal_vs_state_power: 0.4 },
    constitutionalPosition: { regulatory_authority_admin_state: 0.25, commerce_clause_scope: 0.30, federal_vs_state_power: 0.30 },
  },
  {
    name: "Tax Relief & Jobs Act", lean: "right", partySupport: "R", startChamber: "hou",
    issueWeights: { taxes_spending: 0.95, government_spending: 0.7, labor_unions: 0.4, trade_tariffs: 0.3 },
    issuePositions: { taxes_spending: 0.88, government_spending: 0.82, labor_unions: 0.85, trade_tariffs: 0.70 },
    affectedIndustries: ["finance", "real estate", "manufacturing"],
    constitutionalIssues: { commerce_clause_scope: 0.2 },
    constitutionalPosition: { commerce_clause_scope: 0.55 },
  },
  {
    name: "Medicare for All", lean: "left", partySupport: "D",
    issueWeights: { healthcare: 0.95, taxes_spending: 0.7, government_spending: 0.8, labor_unions: 0.4 },
    issuePositions: { healthcare: 0.05, taxes_spending: 0.10, government_spending: 0.10, labor_unions: 0.15 },
    affectedIndustries: ["healthcare", "insurance", "pharmaceuticals"],
    constitutionalIssues: { commerce_clause_scope: 0.6, regulatory_authority_admin_state: 0.5, individual_rights_vs_government: 0.4 },
    constitutionalPosition: { commerce_clause_scope: 0.25, regulatory_authority_admin_state: 0.20, individual_rights_vs_government: 0.30 },
  },
  {
    name: "Infrastructure & AI Act", lean: "center", partySupport: "bipartisan",
    issueWeights: { tech_regulation: 0.7, government_spending: 0.6, education: 0.4, defense_military: 0.3, labor_unions: 0.3 },
    issuePositions: { tech_regulation: 0.45, government_spending: 0.40, education: 0.40, defense_military: 0.55, labor_unions: 0.40 },
    affectedIndustries: ["technology", "construction", "telecommunications", "education"],
    constitutionalIssues: { regulatory_authority_admin_state: 0.4, commerce_clause_scope: 0.3 },
    constitutionalPosition: { regulatory_authority_admin_state: 0.45, commerce_clause_scope: 0.45 },
  },
  {
    name: "2nd Amendment Expansion", lean: "right", partySupport: "R",
    issueWeights: { gun_rights: 0.95, civil_liberties: 0.5, criminal_justice: 0.3 },
    issuePositions: { gun_rights: 0.95, civil_liberties: 0.80, criminal_justice: 0.75 },
    affectedIndustries: ["firearms", "defense"],
    constitutionalIssues: { gun_rights_2A: 0.9, individual_rights_vs_government: 0.5, federal_vs_state_power: 0.4 },
    constitutionalPosition: { gun_rights_2A: 0.90, individual_rights_vs_government: 0.85, federal_vs_state_power: 0.75 },
  },
  {
    name: "Student Debt Relief", lean: "left", partySupport: "D",
    issueWeights: { education: 0.9, government_spending: 0.7, taxes_spending: 0.5 },
    issuePositions: { education: 0.10, government_spending: 0.12, taxes_spending: 0.15 },
    affectedIndustries: ["education", "finance"],
    constitutionalIssues: { executive_power: 0.6, regulatory_authority_admin_state: 0.5 },
    constitutionalPosition: { executive_power: 0.25, regulatory_authority_admin_state: 0.25 },
  },
  {
    name: "Tech Antitrust Reform", lean: "center", partySupport: "bipartisan",
    issueWeights: { tech_regulation: 0.95, civil_liberties: 0.5, trade_tariffs: 0.3, government_spending: 0.4 },
    issuePositions: { tech_regulation: 0.35, civil_liberties: 0.35, trade_tariffs: 0.45, government_spending: 0.30 },
    affectedIndustries: ["technology", "telecommunications", "media"],
    constitutionalIssues: { commerce_clause_scope: 0.6, free_speech_1A: 0.4, regulatory_authority_admin_state: 0.4 },
    constitutionalPosition: { commerce_clause_scope: 0.40, free_speech_1A: 0.45, regulatory_authority_admin_state: 0.40 },
  },
  {
    name: "Criminal Justice Reform", lean: "center", partySupport: "bipartisan",
    issueWeights: { criminal_justice: 0.95, civil_liberties: 0.6, government_spending: 0.3 },
    issuePositions: { criminal_justice: 0.30, civil_liberties: 0.30, government_spending: 0.35 },
    affectedIndustries: ["law enforcement", "legal services"],
    constitutionalIssues: { criminal_defendant_rights: 0.7, equal_protection_discrimination: 0.5, individual_rights_vs_government: 0.4 },
    constitutionalPosition: { criminal_defendant_rights: 0.30, equal_protection_discrimination: 0.30, individual_rights_vs_government: 0.35 },
  },
];

// ─── VOTE FUNCTIONS ───
function computeVote(member, bill) {
  // For House members without multi-dimensional issues, use legacy method
  if (!member.issues) {
    const center = bill.issuePositions
      ? Object.values(bill.issuePositions).reduce((a, b) => a + b, 0) / Object.values(bill.issuePositions).length
      : 0.5;
    return (1 - Math.abs((member.i || 0.5) - center) + (Math.random() - 0.5) * 0.35) > 0.5;
  }

  // How partisan is this bill? 0 = centrist, 1 = extreme
  const billPositions = Object.entries(bill.issueWeights || {})
    .filter(([iss]) => bill.issuePositions?.[iss] !== undefined)
    .map(([iss, w]) => ({ pos: bill.issuePositions[iss], w }));
  const avgBillPos = billPositions.length > 0
    ? billPositions.reduce((s, p) => s + p.pos * p.w, 0) / billPositions.reduce((s, p) => s + p.w, 0)
    : 0.5;
  const billPartisanship = Math.abs(avgBillPos - 0.5) * 2; // 0 = center, 1 = extreme

  let alignment = 0, totalWeight = 0;
  for (const [issue, weight] of Object.entries(bill.issueWeights || {})) {
    if (member.issues[issue] !== undefined && bill.issuePositions?.[issue] !== undefined) {
      const distance = Math.abs(member.issues[issue] - bill.issuePositions[issue]);
      // Side-aware: penalize when member and bill are on opposite ideological sides
      const memberSide = member.issues[issue] - 0.5;
      const billSide = bill.issuePositions[issue] - 0.5;
      const opposingSides = memberSide * billSide < 0 && Math.abs(memberSide) > 0.12 && Math.abs(billSide) > 0.12;
      const agree = opposingSides ? (0.2 - distance * 2.8) : (1 - distance * 2.2);
      alignment += agree * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return Math.random() > 0.5;

  // Controversy adds opposition: 0 = routine, 1 = highly divisive
  const controversy = bill.controversy_level || 0.3;
  let baseProb = (0.48 - controversy * 0.08) + (alignment / totalWeight) * 0.4;

  // Party loyalty — scales with how partisan the bill is
  if (member.behavior && bill.partySupport && bill.partySupport !== "bipartisan") {
    const loyaltyStrength = 0.1 + billPartisanship * 0.2;
    const partyAligned = bill.partySupport === member.p;
    if (partyAligned) baseProb += member.behavior.party_loyalty * loyaltyStrength;
    else baseProb -= member.behavior.party_loyalty * loyaltyStrength * 0.85;
  }

  // Lobbying & industry influence
  if (member.interests && bill.affectedIndustries) {
    const overlap = member.interests.filter(i =>
      bill.affectedIndustries.some(bi => i.toLowerCase().includes(bi.toLowerCase()) || bi.toLowerCase().includes(i.toLowerCase()))
    );
    if (overlap.length > 0) {
      const lobbySusceptibility = member.behavior?.lobby_susceptibility || 0.3;
      // Industry ties push member toward the status quo (against regulation)
      // Bills that regulate (position < 0.5) face lobby opposition from industry-tied members
      const lobbyPush = lobbySusceptibility * 0.15 * (avgBillPos < 0.5 ? -1 : 1);
      baseProb += lobbyPush;
    }
  }

  // Noise inversely proportional to ideological rigidity
  const rigidity = member.behavior?.ideological_rigidity || 0.5;
  const noise = (1 - rigidity) * (Math.random() - 0.5) * 0.3;

  return (baseProb + noise) > 0.5;
}

function computeVeto(president, cabinet, bill) {
  let alignment = 0, total = 0;
  for (const [issue, weight] of Object.entries(bill.issueWeights || {})) {
    if (president.issues?.[issue] !== undefined && bill.issuePositions?.[issue] !== undefined) {
      alignment += (1 - Math.abs(president.issues[issue] - bill.issuePositions[issue]) * 2) * weight;
      total += weight;
    }
  }
  let presScore = total > 0 ? 0.5 + (alignment / total) * 0.5 : 0.5;

  const relevantCabinet = cabinet.filter(c => {
    if (!c.veto_factors) return false;
    const triggers = [
      ...(c.veto_factors.issues_that_trigger_sign_recommendation || []),
      ...(c.veto_factors.issues_that_trigger_veto_recommendation || []),
    ];
    return triggers.some(t => {
      for (const [issue, w] of Object.entries(bill.issueWeights || {})) {
        if (w > 0.3 && issue.includes(t.split("_")[0])) return true;
      }
      return false;
    });
  });

  let cabinetPush = 0;
  relevantCabinet.forEach(c => {
    const influence = c.executive_behavior?.influence_on_president || 0.3;
    let cAlign = 0, cTotal = 0;
    for (const [issue, weight] of Object.entries(bill.issueWeights || {})) {
      if (c.issues?.[issue] !== undefined && bill.issuePositions?.[issue] !== undefined) {
        cAlign += (1 - Math.abs(c.issues[issue] - bill.issuePositions[issue]) * 2) * weight;
        cTotal += weight;
      }
    }
    cabinetPush += (cTotal > 0 ? cAlign / cTotal - 0.5 : 0) * influence;
  });

  const finalScore = presScore * 0.75 + (0.5 + cabinetPush) * 0.25;
  return finalScore > 0.45;
}

function computeSCOTUSVote(justice, bill) {
  if (!bill.constitutionalIssues || !justice.constitutional_issues) {
    return Math.random() > 0.5;
  }

  let alignment = 0, total = 0;
  for (const [issue, weight] of Object.entries(bill.constitutionalIssues)) {
    if (justice.constitutional_issues[issue] !== undefined && bill.constitutionalPosition?.[issue] !== undefined) {
      const distance = Math.abs(justice.constitutional_issues[issue] - bill.constitutionalPosition[issue]);
      alignment += (1 - distance * 2) * weight;
      total += weight;
    }
  }

  let prob = total > 0 ? 0.5 + (alignment / total) * 0.5 : 0.5;

  if (justice.judicial_behavior?.deference_to_legislature) {
    prob += justice.judicial_behavior.deference_to_legislature * 0.15;
  }
  if (justice.judicial_behavior?.willingness_to_overturn) {
    prob -= justice.judicial_behavior.willingness_to_overturn * 0.10;
  }

  const noise = (Math.random() - 0.5) * 0.1;
  return (prob + noise) > 0.5;
}

const LOBBY_GROUPS = {
  defense: ["Lockheed Martin", "Raytheon", "Northrop Grumman", "Boeing Defense", "General Dynamics"],
  energy: ["ExxonMobil", "Chevron", "Koch Industries", "BP America", "NextEra Energy"],
  technology: ["Google", "Meta", "Apple", "Amazon", "Microsoft"],
  telecommunications: ["AT&T", "Comcast", "Verizon", "T-Mobile", "Charter Communications"],
  finance: ["Goldman Sachs", "JPMorgan Chase", "BlackRock", "Citigroup", "Bank of America"],
  healthcare: ["UnitedHealth Group", "Pfizer", "PhRMA", "Blue Cross Blue Shield", "Johnson & Johnson"],
  insurance: ["UnitedHealth Group", "Anthem", "Cigna", "Aetna", "Humana"],
  pharmaceuticals: ["Pfizer", "PhRMA", "Johnson & Johnson", "Merck", "AbbVie"],
  agriculture: ["American Farm Bureau", "Cargill", "Monsanto", "John Deere", "ADM"],
  construction: ["Associated Builders", "Caterpillar", "US Chamber of Commerce", "Bechtel", "Turner Construction"],
  manufacturing: ["NAM", "US Chamber of Commerce", "Caterpillar", "3M", "Honeywell"],
  "real estate": ["NAR", "CBRE Group", "Zillow Group", "Brookfield", "Blackstone Real Estate"],
  education: ["NEA", "AFT", "College Board", "Pearson", "McGraw-Hill"],
  firearms: ["NRA", "NSSF", "Smith & Wesson", "Ruger", "Glock Inc."],
  transportation: ["AAR", "Airlines for America", "FedEx", "UPS", "Union Pacific"],
  "legal services": ["ABA", "Trial Lawyers Association", "LegalZoom", "DLA Piper"],
  "law enforcement": ["FOP", "NAPO", "IACP", "National Sheriffs' Association"],
  labor: ["AFL-CIO", "SEIU", "Teamsters", "UAW", "AFSCME"],
  media: ["News Corp", "Disney", "Warner Bros. Discovery", "Paramount", "iHeartMedia"],
  retail: ["Walmart", "Amazon", "Target", "Costco", "NRF"],
  automotive: ["GM", "Ford", "Toyota NA", "Alliance for Automotive Innovation", "Tesla"],
  "small business": ["NFIB", "US Chamber of Commerce", "SBA Council", "Main Street Alliance"],
  aerospace: ["Boeing", "Lockheed Martin", "SpaceX", "Northrop Grumman", "L3Harris"],
  banking: ["ABA", "JPMorgan Chase", "Goldman Sachs", "Wells Fargo", "Credit Union National Association"],
  "tribal affairs": ["NCAI", "National Indian Gaming Association"],
  veterans: ["VFW", "American Legion", "DAV", "IAVA"],
  "corporate governance": ["Business Roundtable", "US Chamber of Commerce", "SEC Advisory Committee"],
  environment: ["Sierra Club", "EDF", "NRDC", "League of Conservation Voters"],
  tourism: ["US Travel Association", "Marriott", "Hilton", "American Hotel & Lodging Association"],
};
function getLobbyInfluence(member, bill) {
  if (!member.interests || !bill.affectedIndustries) return null;
  const overlap = member.interests.filter(i =>
    bill.affectedIndustries.some(bi => i.toLowerCase().includes(bi.toLowerCase()) || bi.toLowerCase().includes(i.toLowerCase()))
  );
  if (overlap.length === 0) return null;
  const lobbySusceptibility = member.behavior?.lobby_susceptibility || 0;
  if (lobbySusceptibility < 0.3) return null;
  const avgPos = (() => {
    const ps = Object.entries(bill.issueWeights || {}).filter(([iss]) => bill.issuePositions?.[iss] !== undefined).map(([iss, w]) => ({ pos: bill.issuePositions[iss], w }));
    if (ps.length === 0) return 0.5;
    return ps.reduce((s, p) => s + p.pos * p.w, 0) / ps.reduce((s, p) => s + p.w, 0);
  })();
  const isRegulatory = avgPos < 0.5;
  const industry = overlap[0].replace(/_/g, " ");
  const strength = lobbySusceptibility > 0.6 ? "Strong" : "Moderate";
  const key = Object.keys(LOBBY_GROUPS).find(k => industry.toLowerCase().includes(k) || k.includes(industry.toLowerCase()));
  const groups = key ? LOBBY_GROUPS[key] : null;
  // Deterministic pick based on member name to avoid re-render flicker
  const hash = (member.n || member.name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const lobbyist = groups ? groups[hash % groups.length] : null;
  return { industry, strength, direction: isRegulatory ? "against" : "for", lobbySusceptibility, lobbyist };
}

function getVoteReason(member, bill) {
  if (!bill?.issueWeights) return null;
  if (member.ch === "sct") {
    if (!bill.constitutionalIssues || !member.constitutional_issues) return null;
    let maxW = 0, maxIssue = null;
    for (const [issue, weight] of Object.entries(bill.constitutionalIssues)) {
      if (weight > maxW && member.constitutional_issues[issue] !== undefined) { maxW = weight; maxIssue = issue; }
    }
    if (!maxIssue) return null;
    const dist = Math.abs(member.constitutional_issues[maxIssue] - (bill.constitutionalPosition?.[maxIssue] ?? 0.5));
    return (dist < 0.3 ? "Aligned on " : "Opposed on ") + maxIssue.replace(/_/g, " ");
  }
  if (!member.issues) return null;
  let maxW = 0, maxIssue = null;
  for (const [issue, weight] of Object.entries(bill.issueWeights)) {
    if (weight > maxW && member.issues[issue] !== undefined) { maxW = weight; maxIssue = issue; }
  }
  if (!maxIssue) return null;
  const memberPos = member.issues[maxIssue];
  const dir = ISSUE_DIR[maxIssue];
  if (!dir) return (memberPos < 0.5 ? "Leans left on " : "Leans right on ") + maxIssue.replace(/_/g, " ");
  return "Favors " + (memberPos < 0.5 ? dir[0] : dir[1]);
}

// ─── SIMULATION FUNCTIONS ───
function sim(members, bill) {
  const r = members.map(m => ({ ...m, v: computeVote(m, bill) }));
  const y = r.filter(x => x.v).length;
  return { r, y, n: r.length - y, ok: y > r.length / 2 };
}

function simSCOTUS(members, bill) {
  const r = members.map(m => ({ ...m, v: computeSCOTUSVote(m, bill) }));
  const y = r.filter(x => x.v).length;
  return { r, y, n: r.length - y, ok: y >= 5 };
}

// ─── VIEWS ───
const isFullHouse = HOU.length > 100;
const VIEWS_MOB = {
  idle: { x: -30, y: -20, w: 1340, h: 740 },
  hou: isFullHouse ? { x: -30, y: 340, w: 660, h: 360 } : { x: 60, y: 420, w: 460, h: 260 },
  sen: { x: 20, y: -10, w: 560, h: 300 },
  exc: { x: 480, y: 80, w: 460, h: 360 },
  sct: { x: 830, y: 120, w: 440, h: 300 },
  hou_override: isFullHouse ? { x: -30, y: 340, w: 660, h: 360 } : { x: 60, y: 420, w: 460, h: 260 },
  sen_override: { x: 20, y: -10, w: 560, h: 300 },
  done: { x: -30, y: -20, w: 1340, h: 740 },
};
const VIEWS_DT = {
  idle: { x: -40, y: -30, w: 1440, h: 840 },
  hou: isFullHouse ? { x: -30, y: 340, w: 660, h: 360 } : { x: 30, y: 400, w: 540, h: 300 },
  sen: { x: 10, y: -20, w: 580, h: 300 },
  exc: { x: 460, y: 50, w: 500, h: 430 },
  sct: { x: 830, y: 100, w: 440, h: 320 },
  hou_override: isFullHouse ? { x: -30, y: 340, w: 660, h: 360 } : { x: 30, y: 400, w: 540, h: 300 },
  sen_override: { x: 10, y: -20, w: 580, h: 300 },
  done: { x: -40, y: -30, w: 1440, h: 840 },
};

function lerp(a, b, t) { return a + (b - a) * t; }

// ─── TIMELINE BUILDER ───
function buildTimeline(policy) {
  const ev = []; let t = 0;
  const shuf = a => [...a].sort(() => Math.random() - 0.5);
  const startChamber = policy.startChamber || (Math.random() < 0.5 ? "hou" : "sen");

  // Determine chamber order — revenue bills must start in House (Art. I §7)
  const first = startChamber === "sen" ? { members: SEN, label: "sen", resultType: "senateResult", stagger: 18, nextLabel: "House Vote" }
    : { members: HOU, label: "hou", resultType: "houseResult", stagger: HOU.length > 100 ? 8 : 30, nextLabel: "Senate Vote" };
  const second = startChamber === "sen" ? { members: HOU, label: "hou", resultType: "houseResult", stagger: HOU.length > 100 ? 8 : 30, nextLabel: "Presidential Action" }
    : { members: SEN, label: "sen", resultType: "senateResult", stagger: 18, nextLabel: "Presidential Action" };

  // First chamber
  const r1 = sim(first.members, policy);
  ev.push({ t, type: "stage", val: first.label }, { t, type: "counter", y: 0, n: 0 }); t += 600;
  const s1 = shuf(r1.r); let y1 = 0, n1 = 0;
  s1.forEach((m, i) => { if (m.v) y1++; else n1++; ev.push({ t: t + i * first.stagger, type: "vote", id: m.id, v: m.v }, { t: t + i * first.stagger, type: "counter", y: y1, n: n1 }); });
  t += s1.length * first.stagger + 400; ev.push({ t, type: first.resultType, ...r1 });
  if (!r1.ok) { t += 300; ev.push({ t, type: "stage", val: "done" }, { t, type: "outcome", s: "Defeated", w: first.label === "hou" ? "House" : "Senate" }); return { events: ev, duration: t + 2000, startChamber }; }
  t += 600; ev.push({ t, type: "pause", next: first.nextLabel }); t += 100;

  // Second chamber
  const r2 = sim(second.members, policy);
  ev.push({ t, type: "stage", val: second.label }, { t, type: "counter", y: 0, n: 0 }); t += 600;
  const s2 = shuf(r2.r); let y2 = 0, n2 = 0;
  s2.forEach((m, i) => { if (m.v) y2++; else n2++; ev.push({ t: t + i * second.stagger, type: "vote", id: m.id, v: m.v }, { t: t + i * second.stagger, type: "counter", y: y2, n: n2 }); });
  t += s2.length * second.stagger + 400; ev.push({ t, type: second.resultType, ...r2 });
  if (!r2.ok) { t += 300; ev.push({ t, type: "stage", val: "done" }, { t, type: "outcome", s: "Defeated", w: second.label === "hou" ? "House" : "Senate" }); return { events: ev, duration: t + 2000, startChamber }; }
  t += 600; ev.push({ t, type: "pause", next: "Presidential Action" }); t += 100;

  // President
  ev.push({ t, type: "stage", val: "exc" }, { t, type: "counter", y: 0, n: 0 }); t += 1500;
  const signed = computeVeto(EXC[0], EXC.slice(2), policy);
  ev.push({ t, type: "vote", id: EXC[0].id, v: signed }, { t, type: "presResult", signed });

  if (!signed) {
    // Veto override
    const houOvrStagger = HOU.length > 100 ? 8 : 30;
    t += 1200; ev.push({ t, type: "pause", next: "Veto Override – House" }); t += 100;
    ev.push({ t, type: "stage", val: "hou_override" }, { t, type: "counter", y: 0, n: 0 }); t += 600;
    const hor = sim(HOU, policy); const hos = shuf(hor.r); let hoy = 0, hon = 0;
    hos.forEach((m, i) => { if (m.v) hoy++; else hon++; ev.push({ t: t + i * houOvrStagger, type: "vote", id: m.id, v: m.v }, { t: t + i * houOvrStagger, type: "counter", y: hoy, n: hon }); });
    t += hos.length * houOvrStagger + 400; const hOverride = hoy >= Math.ceil(HOU.length * 2 / 3);
    ev.push({ t, type: "overrideResult", chamber: "House", ok: hOverride, y: hoy, n: hon });
    if (!hOverride) { t += 800; ev.push({ t, type: "stage", val: "done" }, { t, type: "outcome", s: "Vetoed" }); return { events: ev, duration: t + 2000, startChamber }; }

    t += 600; ev.push({ t, type: "pause", next: "Veto Override – Senate" }); t += 100;
    ev.push({ t, type: "stage", val: "sen_override" }, { t, type: "counter", y: 0, n: 0 }); t += 600;
    const sor = sim(SEN, policy); const sos = shuf(sor.r); let soy = 0, son = 0;
    sos.forEach((m, i) => { if (m.v) soy++; else son++; ev.push({ t: t + i * 18, type: "vote", id: m.id, v: m.v }, { t: t + i * 18, type: "counter", y: soy, n: son }); });
    t += sos.length * 18 + 400; const sOverride = soy >= Math.ceil(SEN.length * 2 / 3);
    ev.push({ t, type: "overrideResult", chamber: "Senate", ok: sOverride, y: soy, n: son });
    if (!sOverride) { t += 800; ev.push({ t, type: "stage", val: "done" }, { t, type: "outcome", s: "Vetoed" }); return { events: ev, duration: t + 2000, startChamber }; }
    t += 800; ev.push({ t, type: "pause", next: "Supreme Court" }); t += 100;
  } else {
    t += 800; ev.push({ t, type: "pause", next: "Supreme Court" }); t += 100;
  }

  // SCOTUS
  ev.push({ t, type: "stage", val: "sct" }, { t, type: "counter", y: 0, n: 0 });
  const totalConst = Object.values(policy.constitutionalIssues || {}).reduce((a, b) => a + b, 0);
  const challenged = totalConst > 1.5 || (totalConst > 0.5 && Math.random() < 0.45);
  if (!challenged) {
    SCT.forEach((m, i) => { ev.push({ t: t + i * 80, type: "skip", id: m.id }); });
    t += SCT.length * 80 + 600;
    ev.push({ t, type: "scotusResult", ch: false });
    t += 400;
    ev.push({ t, type: "stage", val: "done" }, { t, type: "outcome", s: "Enacted" });
    return { events: ev, duration: t + 2000, startChamber };
  }
  t += 800;
  const cr = simSCOTUS(SCT, policy); const cs = shuf(cr.r); let cy2 = 0, cn2 = 0;
  cs.forEach((m, i) => { if (m.v) cy2++; else cn2++; ev.push({ t: t + i * 300, type: "vote", id: m.id, v: m.v }, { t: t + i * 300, type: "counter", y: cy2, n: cn2 }); });
  t += cs.length * 300 + 500; const upheld = cr.y >= 5;
  ev.push({ t, type: "scotusResult", ch: true, upheld, y: cr.y, n: cr.n }); t += 1000;
  ev.push({ t, type: "stage", val: "done" }, { t, type: "outcome", s: upheld ? "Enacted" : "Unconstitutional" });
  return { events: ev, duration: t + 2000, startChamber };
}

// ─── KEYWORD BILL ANALYZER ───
const BILL_KEYWORDS = {
  immigration: { keys: ["immigra","border","migrant","deport","asylum","visa","refugee","illegal alien","citizenship","daca","dreamer","ice ","customs","wall","undocument","alien","sanctuary"], con: ["secure border","deport","illegal","enforce","wall","ice ","ban entry","build the wall","close the border"], lib: ["pathway","amnesty","dreamer","daca","refugee","asylum","protect immigrant","undocument","sanctuary"] },
  taxes_spending: { keys: ["tax","taxes","taxation","irs","revenue","fiscal","tariff","duty","income tax"], con: ["cut tax","lower tax","flat tax","repeal tax","reduce tax","tax relief"], lib: ["raise tax","wealth tax","tax the rich","progressive tax","corporate tax"] },
  healthcare: { keys: ["health","medicare","medicaid","hospital","drug price","pharma","insurance","medical","obamacare","aca","prescription","mental health"], con: ["repeal aca","repeal obamacare","privatize","health savings","market-based"], lib: ["medicare for all","universal health","single payer","expand medicaid","public option","lower drug"] },
  gun_rights: { keys: ["gun","firearm","2nd amendment","second amendment","weapon","ar-15","rifle","ammunition","concealed carry","background check","nra","shoot","ar15"], con: ["protect gun","expand gun","concealed carry","2nd amendment","arm teacher","repeal gun"], lib: ["ban gun","gun control","assault weapon","background check","red flag","gun violence","gun safety"] },
  climate_energy: { keys: ["climate","carbon","emission","renewable","solar","wind","fossil","oil","gas","coal","energy","environment","pollution","epa","green","paris accord","drill"], con: ["drill","fossil","repeal epa","coal","deregulat","energy independence","pipeline"], lib: ["renewable","solar","wind","carbon tax","green new","paris","clean energy","climate action","ban fossil","net zero"] },
  defense_military: { keys: ["military","defense","pentagon","army","navy","troops","veteran","nato","missile","nuclear","weapon","warfare","soldier"], con: ["increase defense","military spending","strong military","rebuild military"], lib: ["cut defense","reduce military","withdraw","end war","peace"] },
  education: { keys: ["education","school","student","college","university","teacher","tuition","loan","curriculum","charter"], con: ["school choice","charter","voucher","homeschool","parental rights in ed"], lib: ["free college","student debt","public school","teacher pay","fund education","cancel student"] },
  tech_regulation: { keys: ["tech","silicon valley","algorithm","ai ","artificial intelligence","data privacy","social media","big tech","tiktok","facebook","google","apple","amazon","antitrust","monopoly","crypto","bitcoin","blockchain","internet","app ","platform"], con: ["deregulat","free market","crypto freedom","protect section 230"], lib: ["regulate tech","break up","antitrust","data privacy","ban tiktok","algorithm","ai safety","ai regulation"] },
  criminal_justice: { keys: ["crime","criminal","prison","police","sentencing","incarcerat","bail","parole","felony","law enforcement","drug offense","marijuana","cannabis","death penalty","fentanyl","weed","drug","jail","murder","kill"], con: ["tough on crime","mandatory minimum","death penalty","back the blue","increase sentencing","law and order","fund police"], lib: ["reform","decriminaliz","legaliz","abolish","defund police","end mandatory","reduce sentencing","ban death penalty","expunge","legalize weed","legalize marijuana","legalize cannabis"] },
  trade_tariffs: { keys: ["trade","tariff","import","export","china trade","nafta","usmca","wto","sanction","embargo","outsourc","supply chain","manufactur"], con: ["tariff","protect american","buy american","sanction","reshoring"], lib: ["free trade","lower tariff","global trade","trade agreement"] },
  abortion_social: { keys: ["abort","reproductive","roe","pro-life","pro-choice","planned parenthood","contracepti","fetal","trimester","lgbtq","transgender","marriage equality","gender","dei","woke","crt","critical race"], con: ["ban abort","pro-life","protect unborn","heartbeat","restrict abort","ban gender","anti-dei","ban crt","religious freedom","traditional marriage"], lib: ["pro-choice","reproductive right","codify roe","protect abort","lgbtq","transgender right","marriage equality","dei","equality act"] },
  government_spending: { keys: ["spend","budget","deficit","debt","fiscal","appropriat","entitlement","welfare","social security","stimulus","bailout","austerity"], con: ["cut spending","reduce deficit","balanced budget","austerity","slash budget","reduce debt"], lib: ["invest","fund","increase spending","stimulus","expand program","social safety"] },
  foreign_policy_hawks: { keys: ["foreign","diplomacy","sanction","nato","china","russia","iran","israel","ukraine","taiwan","ally","alliance","intelligence","cia","intervention","withdraw","north korea","middle east","gaza","palestine","declare war","invade","invasion","bomb","attack","strike against","war on","war with","regime change"], con: ["sanction","strong against","support israel","defend taiwan","increase aid to israel","confront china","confront russia","declare war","invade","bomb","attack iran","war on iran","war with iran","strike against iran","regime change"], lib: ["diplomacy","negotiate","withdraw","end aid","reduce intervention","peace","ceasefire"] },
  civil_liberties: { keys: ["privacy","surveillance","freedom","liberty","rights","constitution","first amendment","free speech","censor","warrant","patriot act","fisa","nsa"], con: ["protect speech","anti-censor","religious liberty","parental right"], lib: ["privacy","end surveillance","protect rights","voting rights","civil rights","anti-discriminat"] },
  labor_unions: { keys: ["labor","union","worker","wage","minimum wage","overtime","strike","collective bargain","gig economy","right to work","osha","workplace"], con: ["right to work","deregulat","reduce union","lower minimum"], lib: ["raise wage","minimum wage","pro-union","protect worker","collective bargain","paid leave","gig worker protect"] },
};

const CONST_KEYWORDS = {
  executive_power: { keys: ["executive order","presidential power","executive action","veto","pardon","emergency power"], con: ["expand executive","presidential authority"], lib: ["limit executive","check presidential","restrict executive"] },
  individual_rights_vs_government: { keys: ["individual right","personal freedom","government overreach","mandate","liberty","nanny state"], con: ["protect individual","limit government","personal freedom"], lib: ["public interest","collective","regulate for safety"] },
  federal_vs_state_power: { keys: ["state right","federal","preempt","10th amendment","local control","nationwide","uniform standard"], con: ["state right","local control","10th amendment"], lib: ["federal standard","nationwide","preempt state"] },
  regulatory_authority_admin_state: { keys: ["regulat","agency","epa","fda","sec","ftc","bureaucra","red tape","deregulat","admin"], con: ["deregulat","cut red tape","reduce regulation","limit agency"], lib: ["regulate","strengthen regulation","empower agency","new regulation"] },
  criminal_defendant_rights: { keys: ["defendant","due process","trial","bail","habeas","miranda","public defender"], con: ["victim right","tough on crime"], lib: ["defendant right","due process","reform bail","public defender"] },
  free_speech_1A: { keys: ["free speech","first amendment","censor","expression","press","protest","social media speech"], con: ["protect speech","anti-censor","free expression"], lib: ["hate speech","misinformation","content moderat","limit speech"] },
  gun_rights_2A: { keys: ["2nd amendment","second amendment","bear arms","gun right","firearm right"], con: ["protect 2nd","expand gun right","bear arms"], lib: ["limit 2nd","restrict firearm","gun control"] },
  religious_liberty: { keys: ["religious","faith","church","prayer","god","worship","conscience"], con: ["religious freedom","protect faith","conscience"], lib: ["separation of church","secular","limit religious exempt"] },
  commerce_clause_scope: { keys: ["interstate commerce","commerce clause","federal commerce","regulate commerce","economic activity"], con: ["limit commerce clause","narrow commerce"], lib: ["expand commerce","broad commerce","interstate regulat"] },
  equal_protection_discrimination: { keys: ["equal protection","discriminat","14th amendment","civil right","affirm action","disparate"], con: ["merit-based","end affirm action","equal treatment"], lib: ["anti-discriminat","affirm action","equity","protect minority"] },
};

const scoreKeywords = (input, keywordMap, weightStep, maxWeight) => {
  const weights = {}, positions = {};
  for (const [issue, { keys, con, lib }] of Object.entries(keywordMap)) {
    let weight = 0;
    for (const keyword of keys) { if (input.includes(keyword)) weight += weightStep; }
    weight = Math.min(weight, maxWeight);
    if (weight < 0.1) continue;
    weights[issue] = +weight.toFixed(2);
    let conMatches = 0, libMatches = 0;
    for (const keyword of con) { if (input.includes(keyword)) conMatches++; }
    for (const keyword of lib) { if (input.includes(keyword)) libMatches++; }
    const totalMatches = conMatches + libMatches;
    positions[issue] = +(totalMatches === 0 ? 0.5 : 0.15 + (conMatches / totalMatches) * 0.7).toFixed(2);
  }
  return { weights, positions };
};

const LEAN_THRESHOLD_RIGHT = 0.6;
const LEAN_THRESHOLD_LEFT = 0.4;
const BILL_NAME_MAX_WORDS = 6;

// Detect absurd, violent, or unconstitutional bill proposals
const ABSURD_PATTERNS = [
  // ── Violence & destruction ──
  /\b(kill|murder|execute|exterminate|genocide|slaughter|massacre|assassinate|behead|hang|shoot|stab|rape|molest|torture|kidnap|enslave|trafficking|blow up|bomb|nuke|detonate|explode|burn down|set fire|arson|poison|gas|weaponize|terrorize|ethnic cleansing)\b/,
  // Destructive intent toward places, groups, or institutions
  /\b(destroy|annihilate|wipe out|level|flatten|raze|obliterate|eradicate|purge|eliminate|get rid of|remove)\b.*\b(state|city|country|nation|people|population|race|church|mosque|synagogue|temple|school|hospital|congress|capitol|white house|pentagon|supreme court|alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/,
  // WMDs
  /\b(nuke|nuclear bomb|nuclear strike|nuclear attack|chemical weapon|biological weapon|bioweapon|dirty bomb|anthrax|sarin|mustard gas)\b/,
  // War and military aggression
  /\bdeclare war\b/, /\binvade \w+/, /\bwar (on|with) \w+/,

  // ── Targeting identity groups ──
  // Ban/deport/criminalize + any identity group
  /\b(ban|outlaw|prohibit|deport|criminalize|arrest|jail|imprison|intern|detain|round up|register all|exterminate|purge|remove|eliminate|eradicate|get rid of)\b.*\b(gays?|lesbians?|lgbt\w*|queers?|trans\w*|homosexuals?|bisexuals?|nonbinary|jews?|jewish|muslims?|islam\w*|christians?|catholics?|hindus?|sikhs?|buddhists?|atheists?|blacks?|africans?|asians?|hispanics?|latinos?|latinas?|latinx|mexicans?|chinese|arabs?|natives?|indigenous|immigrants?|refugees?|women|woman|men|disabled|autistic)\b/,
  // Reverse order: identity group + should be banned/killed/etc
  /\b(gay|gays|lesbian|lesbians|lgbt\w*|queer|trans\w*|homosexual|bisexual|jew|jews|jewish|muslim|muslims|islam\w*|black|blacks|african|asian|hispanic|latino|latina|mexican|chinese|arab|native|indigenous|immigrant|immigrants|refugee|women|disabled)\b.*\b(should die|should be killed|should be banned|should be deported|don'?t deserve|are subhuman|are animals|are vermin|are parasites|are inferior)\b/,

  // ── Hate speech & extremism ──
  /\b(white power|white supremac\w*|heil hitler|nazi|racial holy war|race war|day of the rope|great replacement|final solution|jewish question|zog|fourteen words|1488|blood and soil)\b/,
  // Impose theocracy
  /\b(institute|impose|establish|enforce|implement|mandate)\b.*\b(sharia|caliphate|theocracy|religious law|biblical law|christian nation|hindu rashtra|jewish state)\b/,

  // ── Arms dealing & sanctions violations ──
  /\b(sell|supply|give|send|export|ship|transfer|provide)\b.*\b(arms|weapons|missiles|bombs|guns|ammunition|nukes|nuclear)\b.*\b(to|for)\b.*\b(north korea|iran|russia|china|taliban|al.?qaeda|isis|hamas|hezbollah|cartel|terrorist)\b/,
  /\b(fund|finance|support|arm|equip)\b.*\b(terroris\w*|al.?qaeda|isis|isil|taliban|hamas|hezbollah|cartel|militia|insurgent)\b/,

  // ── Legalize clearly illegal acts ──
  /\b(legalize|legalise|allow|permit|authorize|decriminalize)\b.*\b(murder|rape|pedophil\w*|child abuse|child marriage|human trafficking|slavery|torture|terrorism|genocide|theft|robbery|arson|kidnap|incest|bestiality|cannibalism)\b/,

  // ── Banning fundamental rights ──
  /\b(ban|outlaw|prohibit|criminalize|abolish|end|eliminate|remove)\b.*\b(all voting|all elections|free speech|freedom of speech|freedom of religion|freedom of press|right to vote|democracy|constitution|bill of rights|due process|habeas corpus|trial by jury)\b/,
  // Suspend/overthrow government
  /\b(suspend|overthrow|dissolve|abolish|end|coup|disband)\b.*\b(constitution|congress|senate|house|government|democracy|elections|supreme court|judiciary)\b/,

  // ── Profanity-only (no policy content) ──
  /^[^a-z]*\b(fuck|shit|ass|bitch|damn|hell|crap|dick|cock|pussy|cunt|bastard|whore|slut|retard)\b[^a-z]*$/,
];

function analyzeBillText(text) {
  const normalized = text.toLowerCase().trim();

  // Check for absurd/violent/extreme proposals
  const isAbsurd = ABSURD_PATTERNS.some(pat => pat.test(normalized));

  // Check for gibberish/too-short inputs (under 3 real words after stripping noise)
  const realWords = normalized.replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 1);
  const isGibberish = realWords.length < 2;

  const issues = scoreKeywords(normalized, BILL_KEYWORDS, 0.3, 0.95);
  const constitutional = scoreKeywords(normalized, CONST_KEYWORDS, 0.35, 0.9);

  if (isAbsurd) {
    // Force extreme opposition across all dimensions — nearly no one votes yes
    // Override any keyword matches that might have been picked up
    issues.weights = {
      civil_liberties: 0.95, criminal_justice: 0.95, government_spending: 0.9,
      defense_military: 0.85, immigration: 0.7, healthcare: 0.6,
    };
    issues.positions = {
      civil_liberties: 0.99, criminal_justice: 0.99, government_spending: 0.95,
      defense_military: 0.95, immigration: 0.90, healthcare: 0.90,
    };
    constitutional.weights = {
      individual_rights_vs_government: 0.95, executive_power: 0.9,
      equal_protection_discrimination: 0.85, criminal_defendant_rights: 0.8,
    };
    constitutional.positions = {
      individual_rights_vs_government: 0.99, executive_power: 0.95,
      equal_protection_discrimination: 0.95, criminal_defendant_rights: 0.95,
    };
  }

  if (!isAbsurd && (isGibberish || Object.keys(issues.weights).length === 0)) {
    // Unrecognized or gibberish bill — make it divisive so it doesn't get unanimous votes
    issues.weights.government_spending = 0.7;
    issues.positions.government_spending = 0.25;
    issues.weights.civil_liberties = 0.6;
    issues.positions.civil_liberties = 0.30;
    issues.weights.criminal_justice = 0.5;
    issues.positions.criminal_justice = 0.35;
    constitutional.weights.individual_rights_vs_government = 0.7;
    constitutional.positions.individual_rights_vs_government = 0.30;
  }

  let totalWeight = 0, weightedLean = 0;
  for (const [issue, weight] of Object.entries(issues.weights)) {
    totalWeight += weight;
    weightedLean += weight * issues.positions[issue];
  }

  const averageLean = totalWeight > 0 ? weightedLean / totalWeight : 0.5;
  let partySupport, lean;
  if (averageLean > LEAN_THRESHOLD_RIGHT) { partySupport = "R"; lean = "right"; }
  else if (averageLean < LEAN_THRESHOLD_LEFT) { partySupport = "D"; lean = "left"; }
  else { partySupport = "bipartisan"; lean = "center"; }

  const words = text.trim().split(/\s+/).slice(0, BILL_NAME_MAX_WORDS)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const name = words.join(" ") + " Act";

  // Revenue-raising bills must originate in the House (Art. I §7)
  const revenueKeywords = ["tax","taxes","taxation","revenue","tariff","duty","irs","income tax","sales tax","excise","levy","fee increase"];
  const isRevenue = revenueKeywords.some(k => normalized.includes(k));
  const startChamber = isRevenue ? "hou" : (Math.random() < 0.5 ? "hou" : "sen");

  const controversy_level = isAbsurd ? 1.0 : isGibberish ? 0.75 : (Math.abs(averageLean - 0.5) > 0.25 ? 0.7 : 0.4);

  return { name, lean, partySupport, startChamber, controversy_level, issueWeights: issues.weights, issuePositions: issues.positions, constitutionalIssues: constitutional.weights, constitutionalPosition: constitutional.positions };
}

// ─── RESPONSIVE HOOKS ───
function useWindowSize() {
  const [size, setSize] = useState(null);
  useEffect(() => {
    function update() { setSize({ w: window.innerWidth, h: window.innerHeight }); }
    update(); window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size || { w: 1280, h: 800 };
}
function useMounted() { const [m, setM] = useState(false); useEffect(() => setM(true), []); return m; }

// ─── COMPONENT ───
export default function GovSim() {
  const mounted = useMounted();
  const win = useWindowSize();
  const mob = mounted && win.w < 768;
  const sm = mounted && win.w < 480;
  const [timeline, setTimeline] = useState(null);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pol, setPol] = useState(null);
  const [hov, setHov] = useState(null);
  const [mp, setMp] = useState({ x: 0, y: 0 });
  const [vb, setVb] = useState(VIEWS_DT.idle);
  const tgt = useRef(VIEWS_DT.idle); const cur = useRef(VIEWS_DT.idle); const lastT = useRef(null);

  // Custom bill state
  const [customBill, setCustomBill] = useState("");

  // API key state (persisted in localStorage)
  const [apiKey, setApiKey] = useState("");
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  useEffect(() => {
    const stored = localStorage.getItem("anthropic_key");
    if (stored) setApiKey(stored);
  }, []);

  // Derive state from playhead
  const snap = useMemo(() => {
    if (!timeline) return { stage: "idle", rv: {}, cy: 0, cn: 0, hR: null, sR: null, pR: null, cR: null, ovr: null, out: null, paused: null };
    const st = { stage: "idle", rv: {}, cy: 0, cn: 0, hR: null, sR: null, pR: null, cR: null, ovr: null, out: null, paused: null };
    for (const e of timeline.events) {
      if (e.t > playhead) break;
      if (e.type === "stage") st.stage = e.val;
      if (e.type === "vote") st.rv[e.id] = e.v;
      if (e.type === "skip") st.rv[e.id] = "skip";
      if (e.type === "counter") { st.cy = e.y; st.cn = e.n; }
      if (e.type === "houseResult") st.hR = e;
      if (e.type === "senateResult") st.sR = e;
      if (e.type === "presResult") st.pR = e;
      if (e.type === "overrideResult") st.ovr = e;
      if (e.type === "scotusResult") st.cR = e;
      if (e.type === "outcome") st.out = e;
      if (e.type === "pause") st.paused = e;
    }
    if (st.paused) {
      const pt = st.paused.t;
      const nx = timeline.events.filter(e => e.t > pt && e.type !== "pause");
      if (nx.length > 0 && playhead > nx[0].t) st.paused = null;
    }
    return st;
  }, [timeline, playhead]);

  // Animation loop
  useEffect(() => {
    let raf;
    const anim = (now) => {
      if (lastT.current === null) lastT.current = now;
      const dt = now - lastT.current; lastT.current = now;
      const t = tgt.current, c = cur.current;
      cur.current = { x: lerp(c.x, t.x, .07), y: lerp(c.y, t.y, .07), w: lerp(c.w, t.w, .07), h: lerp(c.h, t.h, .07) };
      setVb(cur.current);
      if (playing && timeline) {
        setPlayhead(prev => {
          const n = prev + dt * speed;
          if (n >= timeline.duration) { setPlaying(false); return timeline.duration; }
          for (const e of timeline.events) { if (e.type === "pause" && prev < e.t && n >= e.t) { setPlaying(false); return e.t; } }
          return n;
        });
      }
      raf = requestAnimationFrame(anim);
    };
    raf = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(raf);
  }, [playing, timeline, speed]);

  const VIEWS = mob ? VIEWS_MOB : VIEWS_DT;
  useEffect(() => { tgt.current = VIEWS[snap.stage] || VIEWS.idle; }, [snap.stage, mob]);

  // Positions
  const positions = useMemo(() => {
    const p = {};
    // Senate hemicycle — top left, ~94 members
    const senSorted = [...SEN].sort((a, b) => a.i - b.i);
    const senPerRow = 22;
    senSorted.forEach((s, idx) => {
      const a = Math.PI * 0.06 + (idx % senPerRow) / (senPerRow - 1) * Math.PI * 0.88;
      const row = Math.floor(idx / senPerRow);
      p[s.id] = { x: Math.cos(a) * (110 + row * 22) + 300, y: Math.sin(a) * (110 + row * 22) + 30 };
    });
    // House — bottom left (adaptive layout for 30-435 members)
    const houSorted = [...HOU].sort((a, b) => a.i - b.i);
    if (HOU.length > 100) {
      // Full 435-member hemicycle: ~25 per row, tighter spacing
      const perRow = Math.ceil(Math.sqrt(HOU.length * 1.5));
      houSorted.forEach((h, idx) => {
        const row = Math.floor(idx / perRow);
        const inRow = idx % perRow;
        const rowCount = Math.min(perRow, HOU.length - row * perRow);
        const a = Math.PI * 0.04 + (inRow / (rowCount - 1 || 1)) * Math.PI * 0.92;
        const r = 70 + row * 14;
        p[h.id] = { x: Math.cos(a) * r + 300, y: Math.sin(a) * r + 480 };
      });
    } else {
      houSorted.forEach((h, idx) => {
        const a = Math.PI * 0.04 + (idx / (HOU.length - 1)) * Math.PI * 0.92;
        const row = Math.floor(idx / 14);
        p[h.id] = { x: Math.cos(a) * (95 + row * 24) + 300, y: Math.sin(a) * (95 + row * 24) + 520 };
      });
    }
    // Executive cluster — center, 25 members
    const cx = 700, cy = 300;
    p[EXC[0].id] = { x: cx, y: cy }; // President
    if (EXC[1]) p[EXC[1].id] = { x: cx, y: cy - 55 }; // VP
    const ring1 = EXC.slice(2, 10); // inner ring — key cabinet
    ring1.forEach((e, idx) => {
      const a = (idx / ring1.length) * Math.PI * 2 - Math.PI / 2;
      p[e.id] = { x: cx + Math.cos(a) * 75, y: cy + Math.sin(a) * 75 };
    });
    const ring2 = EXC.slice(10); // outer ring
    ring2.forEach((e, idx) => {
      const a = (idx / ring2.length) * Math.PI * 2 - Math.PI / 2;
      p[e.id] = { x: cx + Math.cos(a) * 130, y: cy + Math.sin(a) * 130 };
    });
    // SCOTUS — right
    const bx = 1050, by = 300;
    p[SCT[0].id] = { x: bx, y: by - 70 };
    [3, 4, 8, 7, 6, 5, 2, 1].forEach((ji, idx) => {
      if (SCT[ji]) p[SCT[ji].id] = { x: bx - 140 + idx * 40, y: by };
    });
    return p;
  }, []);

  // Sections for scrub bar
  const sections = useMemo(() => {
    if (!timeline) return [];
    const so = [];
    for (const e of timeline.events) {
      if (e.type === "stage" && e.val !== "done") {
        if (!so.length || so[so.length - 1].val !== e.val) so.push({ val: e.val, start: e.t });
      }
      if (e.type === "stage" && e.val === "done" && so.length) so[so.length - 1].end = e.t;
    }
    so.forEach((s, i) => { if (!s.end) s.end = i < so.length - 1 ? so[i + 1].start : timeline.duration; });
    const lb = { hou: "House", sen: "Senate", exc: "President", sct: "Court", hou_override: "H Override", sen_override: "S Override" };
    return so.map(s => ({ label: lb[s.val] || "", start: s.start / timeline.duration, end: s.end / timeline.duration, mid: ((s.start + s.end) / 2) / timeline.duration }));
  }, [timeline]);

  const go = useCallback(policy => { setPol(policy); setTimeline(buildTimeline(policy)); setPlayhead(0); setPlaying(true); setAnalyzing(false); }, []);
  const reset = () => { setTimeline(null); setPol(null); setPlayhead(0); setPlaying(false); setAnalyzing(false); };
  const replay = () => { setPlayhead(0); setPlaying(true); cur.current = VIEWS.idle; };

  // Custom bill analyzer — Haiku when API key available, keyword fallback otherwise
  const [analyzing, setAnalyzing] = useState(false);
  const analyzeStartTime = useRef(0);
  const analyzeBill = useCallback(async (text) => {
    if (!text.trim()) return;
    if (!apiKey) {
      go(analyzeBillText(text));
      return;
    }
    // Optimistic: immediately show the visualization with dots popping in
    setAnalyzing(true);
    analyzeStartTime.current = Date.now();
    setPol({ name: text.trim().split(/\s+/).slice(0, 6).map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(" ") + " Act" });
    setTimeline(null); // hide hero, show SVG, but no timeline yet
    try {
      const res = await fetch("/api/analyze-bill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, apiKey }) });
      if (!res.ok) throw new Error("API error");
      const bill = await res.json();
      const minWait = 2500;
      const elapsed = Date.now() - analyzeStartTime.current;
      if (elapsed < minWait) await new Promise(r => setTimeout(r, minWait - elapsed));
      go(bill);
    } catch {
      const bill = analyzeBillText(text);
      const minWait = 2500;
      const elapsed = Date.now() - analyzeStartTime.current;
      if (elapsed < minWait) await new Promise(r => setTimeout(r, minWait - elapsed));
      go(bill);
    }
  }, [go, apiKey]);

  const partyColor = p => p === "R" ? C.rep : p === "D" ? C.dem : C.ind;
  const nc = m => { const v = snap.rv[m.id]; if (v === "skip") return C.borderLight; if (v === true) return C.yea; if (v === false) return C.nay; return partyColor(m.p); };
  const nr = m => {
    if (m.r === "President") return 12;
    if (m.r === "Chief Justice") return 10;
    if (m.r?.includes("Leader") || m.r?.includes("Speaker")) return isFullHouse ? 6 : 8;
    if (m.r?.includes("Whip") || m.r?.includes("Chair") || m.r === "Vice President") return isFullHouse ? 5 : 7;
    if (m.ch === "sct") return 9;
    if (m.ch === "exc") return 5;
    if (m.ch === "sen") return 4.5;
    if (m.ch === "hou") return isFullHouse ? 2.8 : 5.5;
    return 5.5;
  };

  const all = [...SEN, ...HOU, ...EXC, ...SCT];
  const vbStr = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;
  const pct = timeline ? Math.min(1, playhead / timeline.duration) : 0;
  const isActive = snap.stage !== "idle" && snap.stage !== "done";

  return (
    <div onMouseMove={e => setMp({ x: e.clientX, y: e.clientY })} onClick={e => { if (mob && hov && !e.target.closest("g")) setHov(null); }}
      style={{ width: "100%", height: "100dvh", overflow: "hidden", position: "relative", background: C.bg, fontFamily: SERIF, color: C.text, touchAction: "manipulation" }}>
      {/* Animations and hover styles are in globals.css */}
      {/* Texture */}
      <div style={{ position: "absolute", inset: 0, opacity: .02, pointerEvents: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px" }} />

      {/* SVG */}
      <svg viewBox={vbStr} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid meet">
        <text x="300" y="16" textAnchor="middle" style={{ fontSize: 14, fill: C.textMid, letterSpacing: 4, fontFamily: SANS, fontWeight: 700 }}>UNITED STATES SENATE</text>
        <text x="300" y="470" textAnchor="middle" style={{ fontSize: 14, fill: C.textMid, letterSpacing: 4, fontFamily: SANS, fontWeight: 700 }}>HOUSE OF REPRESENTATIVES</text>
        <text x="700" y="135" textAnchor="middle" style={{ fontSize: 14, fill: C.textMid, letterSpacing: 4, fontFamily: SANS, fontWeight: 700 }}>EXECUTIVE</text>
        <text x="1050" y="190" textAnchor="middle" style={{ fontSize: 14, fill: C.textMid, letterSpacing: 4, fontFamily: SANS, fontWeight: 700 }}>SUPREME COURT</text>

        {all.map((m, idx) => {
          const p = positions[m.id]; if (!p) return null;
          const r = nr(m), c = nc(m), isH = hov?.id === m.id, revealed = snap.rv[m.id] !== undefined;
          const notable = NOTABLE.has(m.n);
          return (
            <g key={m.id} style={{ cursor: "pointer" }}>
              {notable && <circle cx={p.x} cy={p.y} r={r + 3} fill="none" stroke={c} strokeWidth={1.5} opacity={0.6} className="gs-notable-ring" />}
              {isH && <circle cx={p.x} cy={p.y} r={r * 3} fill={c} opacity={.12} />}
              {mob && <circle cx={p.x} cy={p.y} r={Math.max(r * 1.8, 10)} fill="transparent"
                onPointerDown={e => { e.stopPropagation(); setMp({ x: e.clientX, y: e.clientY }); setHov(hov?.id === m.id ? null : m); }} />}
              <circle cx={p.x} cy={p.y} r={r} fill={c} opacity={isH ? 1 : notable ? 1 : .85} stroke={isH ? C.text : "none"} strokeWidth={1}
                className={`gs-member-circle${analyzing ? " gs-dot-pop-in" : ""}`}
                style={{ transform: `scale(${revealed ? 1.3 : 1})`, transformOrigin: `${p.x}px ${p.y}px`, ...(analyzing ? { animationDelay: `${500 + idx * 8}ms` } : {}) }}
                onMouseEnter={() => { if (!mob) setHov(m); }} onMouseLeave={() => { if (!mob) setHov(null); }} />
            </g>
          );
        })}

        {/* SCOTUS labels */}
        {SCT.map(j => { const p = positions[j.id]; return p && <text key={j.id + "l"} x={p.x} y={p.y + nr(j) + 16} textAnchor="middle" style={{ fontSize: 8, fill: C.textMid, fontFamily: SANS, fontWeight: 600, pointerEvents: "none" }}>{j.r === "Chief Justice" ? "CJ Roberts" : j.n.split(" ").pop()}</text>; })}
        {/* President + VP labels */}
        {EXC.slice(0, 2).map(m => { const p = positions[m.id]; return p && <text key={m.id + "l"} x={p.x} y={p.y + nr(m) + 14} textAnchor="middle" style={{ fontSize: 10, fill: C.text, fontFamily: SANS, fontWeight: 700, pointerEvents: "none" }}>{m.n.split(" ").pop()}</text>; })}
      </svg>

      {/* ─── Top bar ─── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: mob ? "10px 14px" : "16px 28px", display: "flex", flexDirection: mob ? "column" : "row", justifyContent: "space-between", alignItems: mob ? "flex-start" : "center", gap: mob ? 6 : 0, background: `linear-gradient(180deg, ${C.bg} 60%, ${C.bg}00)`, zIndex: 10, pointerEvents: "none" }}>
        <div>
          <div style={{ fontSize: mob ? 8 : 11, letterSpacing: mob ? 1 : 3, textTransform: "uppercase", color: C.textMute, fontFamily: SANS, fontWeight: 500 }}>PolicySim: U.S. Federal Policy Simulator</div>
          {pol && <div style={{ marginTop: 2, display: "flex", alignItems: "baseline", gap: mob ? 6 : 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: mob ? 10 : 12, fontFamily: SANS, fontWeight: 600, letterSpacing: mob ? 1 : 2, textTransform: "uppercase", color: C.textMute, background: `linear-gradient(90deg,${C.textMute},${C.text},${C.textMute})`, backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "var(--animate-shimmer)" }}>{analyzing ? "Analyzing bill\u2026" : "Now voting on:"}</span>
            <span style={{ fontSize: mob ? 16 : 22, fontWeight: 400, color: C.text }}>{pol.name}</span>
          </div>}
        </div>
        {pol && (() => {
          const hasOverride = snap.pR && !snap.pR.signed;
          const senFirst = timeline?.startChamber === "sen";
          const stages = hasOverride
            ? (senFirst ? ["sen", "hou", "exc", "hou_override", "sen_override", "sct"] : ["hou", "sen", "exc", "hou_override", "sen_override", "sct"])
            : (senFirst ? ["sen", "hou", "exc", "sct"] : ["hou", "sen", "exc", "sct"]);
          const labelsM = hasOverride
            ? (senFirst ? ["S", "H", "P", "H\u00B2", "S\u00B2", "C"] : ["H", "S", "P", "H\u00B2", "S\u00B2", "C"])
            : (senFirst ? ["S", "H", "P", "C"] : ["H", "S", "P", "C"]);
          const labelsD = hasOverride
            ? (senFirst ? ["Senate", "House", "President", "H Override", "S Override", "Court"] : ["House", "Senate", "President", "H Override", "S Override", "Court"])
            : (senFirst ? ["Senate", "House", "President", "Court"] : ["House", "Senate", "President", "Court"]);
          const labels = mob ? labelsM : labelsD;
          return <div style={{ display: "flex", gap: mob ? 6 : 10, flexWrap: "wrap" }}>
            {stages.map((s, i) => {
              const done = stages.indexOf(snap.stage) > i || snap.stage === "done";
              const act = snap.stage === s;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: mob ? 3 : 5 }}>
                  <div className="gs-stage-dot" style={{ width: mob ? 6 : 8, height: mob ? 6 : 8, borderRadius: "50%", background: act ? C.rep : done ? C.yea : C.border, boxShadow: act ? `0 0 8px ${C.rep}66` : "none" }} />
                  <span style={{ fontSize: mob ? 10 : 13, fontFamily: SANS, color: act ? C.text : done ? C.yeaMute : C.textMute, fontWeight: act ? 700 : 400 }}>{labels[i]}</span>
                  {i < stages.length - 1 && <span style={{ color: C.border, fontSize: mob ? 9 : 11 }}>{"\u2192"}</span>}
                </div>
              );
            })}
          </div>;
        })()}
      </div>

      {/* ─── Continue prompt ─── */}
      {snap.paused && !playing && <Card style={{ position: "absolute", bottom: mob ? 64 : 68, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 20, padding: mob ? "12px 18px" : "16px 32px", maxWidth: mob ? "90vw" : "none", animation: "var(--animate-fade-in-up)" }}>
        <div style={{ fontSize: mob ? 11 : 13, color: C.textMute, fontFamily: SANS, fontWeight: 500, marginBottom: mob ? 6 : 10 }}>
          {snap.ovr ? `${snap.ovr.chamber} override ${snap.ovr.ok ? "passed" : "failed"} ${snap.ovr.y}\u2013${snap.ovr.n}` : snap.pR ? `President ${snap.pR.signed ? "signed" : "vetoed"}` : snap.hR && snap.sR ? `${timeline?.startChamber === "sen" ? "House" : "Senate"} ${(timeline?.startChamber === "sen" ? snap.hR : snap.sR).ok ? "passed" : "failed"} ${(timeline?.startChamber === "sen" ? snap.hR : snap.sR).y}\u2013${(timeline?.startChamber === "sen" ? snap.hR : snap.sR).n}` : snap.hR ? `House ${snap.hR.ok ? "passed" : "failed"} ${snap.hR.y}\u2013${snap.hR.n}` : snap.sR ? `Senate ${snap.sR.ok ? "passed" : "failed"} ${snap.sR.y}\u2013${snap.sR.n}` : ""}
        </div>
        <Button variant="primary" size={mob ? "md" : "lg"} onClick={() => { setPlaying(true); setPlayhead(p => p + 150); }} style={{ pointerEvents: "auto", padding: mob ? "8px 18px" : "10px 28px", fontSize: mob ? 12 : 14 }}>
          Continue to {snap.paused.next}<span style={{ fontSize: mob ? 13 : 16 }}>{"\u2192"}</span>
        </Button>
      </Card>}

      {/* ─── Live counter ─── */}
      {isActive && !snap.out && !(snap.paused && !playing) && (snap.stage === "hou" || snap.stage === "sen" || snap.stage === "sct" || snap.stage === "hou_override" || snap.stage === "sen_override") && (snap.cy > 0 || snap.cn > 0) &&
        <Card style={{ position: "absolute", bottom: mob ? 64 : 68, left: "50%", transform: "translateX(-50%)", display: "flex", gap: mob ? 20 : 36, alignItems: "baseline", zIndex: 10, padding: mob ? "10px 24px" : "14px 40px", animation: "var(--animate-counter-in)" }}>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: mob ? 32 : 48, fontWeight: 300, color: C.yea, lineHeight: 1, fontFamily: SANS }}>{snap.cy}</div><div style={{ fontSize: mob ? 10 : 12, color: C.yeaMute, fontFamily: SANS, fontWeight: 600, letterSpacing: 2, marginTop: 2 }}>YEA</div></div>
          <div style={{ width: 1, height: mob ? 32 : 48, background: C.border }} />
          <div style={{ textAlign: "center" }}><div style={{ fontSize: mob ? 32 : 48, fontWeight: 300, color: C.nay, lineHeight: 1, fontFamily: SANS }}>{snap.cn}</div><div style={{ fontSize: mob ? 10 : 12, color: C.nayMute, fontFamily: SANS, fontWeight: 600, letterSpacing: 2, marginTop: 2 }}>NAY</div></div>
        </Card>}

      {/* ─── Presidential decision ─── */}
      {snap.pR && snap.stage === "exc" && !snap.out && !(snap.paused && !playing) &&
        <div style={{ position: "absolute", bottom: mob ? 64 : 68, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, maxWidth: mob ? "90vw" : "none", animation: "var(--animate-fade-in-up)" }}>
          <Card className="shadow-[var(--shadow-lg)]" style={{ padding: mob ? "14px 28px" : "18px 44px" }}>
            <CardTitle style={{ marginBottom: 4, fontSize: mob ? 10 : 11 }}>Presidential Action</CardTitle>
            <CardContent style={{ fontSize: mob ? 20 : 28, fontWeight: 600, fontFamily: SANS, color: snap.pR.signed ? C.yea : C.nay }}>{snap.pR.signed ? "Signed Into Law" : "Vetoed"}</CardContent>
          </Card>
        </div>}

      {/* ─── No judicial review ─── */}
      {snap.cR && !snap.cR.ch && snap.stage === "sct" && !snap.out && !(snap.paused && !playing) &&
        <div style={{ position: "absolute", bottom: mob ? 64 : 68, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, maxWidth: mob ? "90vw" : "none", animation: "var(--animate-fade-in-up)" }}>
          <Card className="shadow-[var(--shadow-lg)]" style={{ padding: mob ? "14px 28px" : "18px 44px" }}>
            <CardTitle style={{ marginBottom: 4, fontSize: mob ? 10 : 11 }}>Supreme Court</CardTitle>
            <CardContent style={{ fontSize: mob ? 18 : 24, fontWeight: 600, fontFamily: SANS, color: C.textMid }}>No Judicial Challenge</CardContent>
          </Card>
        </div>}

      {/* ─── Outcome ─── */}
      {snap.out && (() => {
        const won = snap.out.s === "Enacted";
        const label = { Enacted: "Law Enacted", Defeated: `Defeated in the ${snap.out.w}`, Vetoed: "Veto Sustained", Unconstitutional: "Ruled Unconstitutional" }[snap.out.s];
        const accent = won ? C.yea : C.nay;
        return <div style={{ position: "absolute", bottom: mob ? 64 : 68, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 20, maxWidth: mob ? "90vw" : "none", animation: "var(--animate-fade-in-up)" }}>
          <Card className="shadow-[var(--shadow-lg)]" style={{ padding: mob ? "16px 28px" : "22px 52px" }}>
            <CardTitle style={{ marginBottom: 6, fontSize: mob ? 10 : 11 }}>Final Result</CardTitle>
            <CardContent style={{ fontSize: mob ? 22 : 34, fontWeight: 600, fontFamily: SANS, color: accent, lineHeight: 1.1 }}>{label}</CardContent>
            <div style={{ marginTop: mob ? 8 : 10, display: "flex", gap: 8, justifyContent: "center" }}>
              <Button variant="ghost" size={mob ? "sm" : "md"} onClick={() => { reset(); }} style={{ padding: mob ? "7px 16px" : "8px 20px", fontSize: mob ? 11 : 12, fontWeight: 500, letterSpacing: 0 }}>Try a new bill</Button>
              <Button variant="ghost" size={mob ? "sm" : "md"} onClick={() => { setPlayhead(0); setPlaying(true); }} style={{ padding: mob ? "7px 16px" : "8px 20px", fontSize: mob ? 11 : 12, fontWeight: 500, letterSpacing: 0 }}>Replay</Button>
            </div>
          </Card>
        </div>;
      })()}

      {/* ─── Hero / idle ─── */}
      {!timeline && <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: mob ? "20px 16px" : "0", overflow: "auto", animation: "var(--animate-hero-in)", transition: "opacity 1s ease-in-out", opacity: analyzing ? 0 : 1, pointerEvents: analyzing ? "none" : "auto" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {[{ x: "8%", y: "18%", s: 80, c: C.rep, o: .06 }, { x: "85%", y: "22%", s: 60, c: C.dem, o: .06 }, { x: "15%", y: "75%", s: 50, c: C.dem, o: .05 }, { x: "78%", y: "70%", s: 70, c: C.rep, o: .05 }, { x: "50%", y: "12%", s: 40, c: C.textMute, o: .04 }, { x: "92%", y: "50%", s: 45, c: C.rep, o: .04 }, { x: "5%", y: "48%", s: 55, c: C.dem, o: .04 }].map((d, i) =>
            <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: mob ? d.s * .6 : d.s, height: mob ? d.s * .6 : d.s, borderRadius: "50%", background: d.c, opacity: d.o, transform: "translate(-50%,-50%)" }} />)}
        </div>
        <div style={{ textAlign: "center", marginBottom: mob ? 16 : 28, position: "relative", animation: "var(--animate-slide-up)" }}>
          <div style={{ fontSize: mob ? 10 : 12, letterSpacing: mob ? 3 : 6, textTransform: "uppercase", color: C.textMute, fontFamily: SANS, fontWeight: 600, marginBottom: mob ? 6 : 10 }}>U.S. Federal Government Simulator</div>
          <h1 style={{ fontSize: sm ? 32 : mob ? 40 : 56, fontWeight: 300, color: C.text, lineHeight: 1, margin: 0, letterSpacing: -1.5 }}>PolicySim</h1>
          <div style={{ fontSize: mob ? 12 : 14, color: C.textMute, marginTop: mob ? 8 : 12, fontFamily: SANS, fontWeight: 400, letterSpacing: 1 }}>Senate {"\u00B7"} House {"\u00B7"} Executive {"\u00B7"} Supreme Court</div>
        </div>
        <div style={{ position: "relative", width: mob ? "100%" : 400, maxWidth: 400, animation: "var(--animate-slide-up)", animationDelay: "80ms", animationFillMode: "backwards" }}>
          {/* Custom bill input */}
          <Card className="shadow-[var(--shadow-sm),var(--shadow-md)]" style={{ padding: mob ? "14px 16px" : "16px 20px", marginBottom: mob ? 12 : 16 }}>
            <CardTitle style={{ marginBottom: 10, fontSize: mob ? 10 : 11 }}>Describe your own bill</CardTitle>
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                type="text" value={customBill} onChange={e => setCustomBill(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") analyzeBill(customBill); }}
                placeholder={mob ? "e.g. Ban TikTok..." : "e.g. Ban TikTok nationwide, legalize marijuana..."}
                style={{ padding: mob ? "8px 10px" : "9px 14px", fontSize: mob ? 14 : 15 }}
              />
              <button
                className="gs-interactive gs-btn-primary"
                onClick={() => analyzeBill(customBill)} disabled={!customBill.trim() || analyzing}
                style={{ padding: mob ? "8px 14px" : "9px 20px", borderRadius: R.md, border: "none", background: C.bar, color: C.bg, fontFamily: SANS, fontWeight: 600, fontSize: mob ? 12 : 13, cursor: "pointer", whiteSpace: "nowrap", opacity: (!customBill.trim() || analyzing) ? 0.65 : 1, transition: "opacity 150ms ease-out, transform 150ms ease-out" }}
              >
                {analyzing ? "Analyzing…" : "Simulate"}
              </button>
            </div>
            {/* API key info banner */}
            <div style={{ marginTop: 8, fontSize: 11, fontFamily: SANS, color: C.textMute }}>
              {apiKey ? (
                <span>AI-powered mode {"\u00B7"} <button onClick={() => { setKeyDraft(apiKey); setKeyDialogOpen(true); }} style={{ background: "none", border: "none", padding: 0, color: C.textMid, fontFamily: SANS, fontSize: 11, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>change key</button></span>
              ) : (
                <span>Keyword-only mode — <button onClick={() => { setKeyDraft(""); setKeyDialogOpen(true); }} style={{ background: "none", border: "none", padding: 0, color: C.textMid, fontFamily: SANS, fontSize: 11, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>Add your API key</button> for AI-powered analysis</span>
              )}
            </div>
          </Card>

          {/* API Key Dialog */}
          <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI-Powered Analysis</DialogTitle>
                <DialogDescription>
                  Add your Anthropic API key for smarter bill analysis. Your key is stored only in your browser&apos;s local storage and sent directly to the Anthropic API. This project is{" "}
                  <a href="https://github.com/isabellereksopuro/ai-gov-simulator" target="_blank" rel="noopener noreferrer" style={{ color: C.textMid, textDecoration: "underline", textUnderlineOffset: 2 }}>open source</a>
                  {" "}&mdash; we don&apos;t track, log, or store your key on any server.
                </DialogDescription>
              </DialogHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Input
                  type="password" value={keyDraft} onChange={e => setKeyDraft(e.target.value)}
                  placeholder="sk-ant-..."
                  style={{ fontSize: 14, padding: "9px 14px" }}
                />
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.textMid, fontFamily: SANS, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Get a key from console.anthropic.com
                </a>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                  {apiKey && (
                    <button
                      onClick={() => { setApiKey(""); localStorage.removeItem("anthropic_key"); setKeyDraft(""); setKeyDialogOpen(false); }}
                      style={{ padding: "7px 16px", borderRadius: R.md, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, fontFamily: SANS, fontWeight: 500, fontSize: 12, cursor: "pointer" }}
                    >
                      Clear key
                    </button>
                  )}
                  <button
                    onClick={() => { const k = keyDraft.trim(); if (k) { setApiKey(k); localStorage.setItem("anthropic_key", k); } setKeyDialogOpen(false); }}
                    disabled={!keyDraft.trim()}
                    style={{ padding: "7px 20px", borderRadius: R.md, border: "none", background: C.bar, color: C.bg, fontFamily: SANS, fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: keyDraft.trim() ? 1 : 0.5 }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: mob ? 12 : 16 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.textMute, fontFamily: SANS, fontWeight: 500 }}>or choose a preset</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Preset policies */}
          <Card className="shadow-[var(--shadow-sm),var(--shadow-lg)] overflow-hidden !p-0">
            {POLS.map((p, idx) => (
              <div key={idx} className="gs-preset-item gs-interactive" onClick={() => go(p)}
                style={{ padding: mob ? "10px 16px" : "11px 20px", cursor: "pointer", borderBottom: idx < POLS.length - 1 ? `1px solid ${C.borderLight}` : "none", display: "flex", alignItems: "center", gap: mob ? 8 : 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: p.lean === "right" ? C.rep : p.lean === "left" ? C.dem : C.textMute }} />
                <span style={{ fontSize: mob ? 14 : 15, fontWeight: 500, color: C.text }}>{p.name}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>}

      {/* ─── Tooltip ─── */}
      {hov && <div className="gs-tooltip-content" style={mob
        ? { position: "fixed", left: Math.min(Math.max(mp.x, 80), win.w - 80), top: mp.y - 110, transform: "translateX(-50%)", background: C.card, border: `1px solid ${C.border}`, borderRadius: R.md, padding: "6px 12px", zIndex: 1000, pointerEvents: "none", boxShadow: S.md, maxWidth: "80vw" }
        : { position: "fixed", left: mp.x + 16, top: mp.y - 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: R.md, padding: "8px 14px", zIndex: 1000, pointerEvents: "none", boxShadow: S.md, maxWidth: 280 }}>
        <div style={{ fontSize: mob ? 13 : 15, fontWeight: 600, color: C.text }}>{hov.n}</div>
        <div style={{ fontSize: mob ? 10 : 11, color: C.textMute, marginTop: 1 }}>{hov.r}{hov.s ? `, ${hov.s}` : (hov.state ? `, ${hov.state}` : "")}{hov.district ? `-${hov.district}` : ""}{hov.department ? ` \u2014 ${hov.department}` : ""}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: R.sm, background: partyColor(hov.p) + "18", color: partyColor(hov.p), fontFamily: SANS, fontWeight: 600 }}>{hov.p === "R" ? "Republican" : hov.p === "D" ? "Democrat" : "Independent"}</span>
          {hov.personality?.archetype && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: R.sm, background: C.textMute + "18", color: C.textMid, fontFamily: SANS, fontWeight: 600 }}>{hov.personality.archetype}</span>}
        </div>
        {/* Committees (senators) */}
        {hov.committees && hov.committees.length > 0 && <div style={{ fontSize: 10, color: C.textMid, marginTop: 4, fontFamily: SANS }}>{hov.committees.slice(0, 3).join(", ")}</div>}
        {/* SCOTUS appointment */}
        {hov.ab && <div style={{ fontSize: 10, color: C.textMute, marginTop: 2, fontFamily: SANS }}>Appointed by {hov.ab}, {hov.y}</div>}
        {hov.judicial_philosophy && <div style={{ fontSize: 10, color: C.textMid, marginTop: 2, fontFamily: SANS }}>{hov.judicial_philosophy.primary}{hov.judicial_philosophy.secondary ? ` / ${hov.judicial_philosophy.secondary}` : ""}</div>}
        {/* Vote result + reason */}
        {snap.rv[hov.id] !== undefined && snap.rv[hov.id] !== "skip" && <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: snap.rv[hov.id] ? C.yea : C.nay, fontFamily: SANS }}>{snap.rv[hov.id] ? "Yea" : "Nay"}</span>
          {pol && (() => {
            const reason = getVoteReason(hov, pol);
            return reason ? <span style={{ fontSize: 10, color: C.textMid, fontFamily: SANS }}>{reason}</span> : null;
          })()}
        </div>}
        {/* Lobby influence tag */}
        {pol && snap.rv[hov.id] !== undefined && snap.rv[hov.id] !== "skip" && (() => {
          const lobby = getLobbyInfluence(hov, pol);
          if (!lobby) return null;
          const isStrong = lobby.strength === "Strong";
          return <div style={{ marginTop: 5 }}>
            <span style={{ display: "inline-block", fontSize: 9, fontFamily: SANS, fontWeight: 600, letterSpacing: 0.3,
              padding: "2px 7px", borderRadius: 4,
              background: isStrong ? "rgba(220,80,60,0.12)" : "rgba(200,160,60,0.12)",
              color: isStrong ? "#c0392b" : "#b8860b",
              border: `1px solid ${isStrong ? "rgba(220,80,60,0.25)" : "rgba(200,160,60,0.25)"}`,
            }}>
              {lobby.strength} lobby pressure from {lobby.lobbyist || lobby.industry}
            </span>
          </div>;
        })()}
      </div>}

      {/* ─── Video bar ─── */}
      {timeline && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30, background: C.bar, paddingBottom: mob ? "env(safe-area-inset-bottom, 8px)" : "0" }}>
        <div style={{ padding: mob ? "8px 12px" : "8px 20px", display: "flex", alignItems: "center", gap: mob ? 10 : 14, height: mob ? 40 : 48 }}>
          {/* Play */}
          <div className="gs-play-btn gs-interactive touch-target" onClick={() => { if (playhead >= (timeline?.duration || 0)) replay(); else setPlaying(!playing); }}
            style={{ width: mob ? 44 : 32, height: mob ? 44 : 32, borderRadius: "50%", background: C.barKnob, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "transform 150ms var(--ease-out)" }}>
            {playing
              ? <svg width="12" height="12" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" rx="1" fill={C.bar} /><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill={C.bar} /></svg>
              : <svg width="12" height="12" viewBox="0 0 14 14"><path d="M4 1.5l7.5 5.5L4 12.5z" fill={C.bar} /></svg>}
          </div>
          {/* Track */}
          <div style={{ flex: 1, position: "relative", height: 30, cursor: "pointer" }}
            onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setPlayhead(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * timeline.duration); cur.current = VIEWS.idle; }}
            onTouchStart={e => { const rect = e.currentTarget.getBoundingClientRect(); setPlayhead(Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width)) * timeline.duration); cur.current = VIEWS.idle; }}>
            {sections.map((s, idx) => (
              <div key={idx} style={{ position: "absolute", left: `${s.start * 100}%`, width: `${(s.end - s.start) * 100}%`, top: 0, height: 30 }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", fontSize: mob ? 8 : 9, color: C.barMute, fontFamily: SANS, fontWeight: 600, whiteSpace: "nowrap", letterSpacing: mob ? 0 : 1 }}>{mob ? s.label.charAt(0) : s.label}</div>
                <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 4, borderRadius: 2, background: idx % 2 === 0 ? C.barTrack : C.barTrackAlt }} />
                {idx > 0 && <div style={{ position: "absolute", top: 12, left: 0, width: 1, height: 8, background: C.barMute }} />}
              </div>
            ))}
            <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 4, background: "#352e22", borderRadius: 2, zIndex: -1 }} />
            <div className="gs-scrubber-fill" style={{ position: "absolute", top: 14, left: 0, height: 4, borderRadius: 2, width: `${pct * 100}%`, background: C.barFill, zIndex: 1 }} />
            <div className="gs-scrubber-knob" style={{ position: "absolute", top: 10, left: `${pct * 100}%`, transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: C.barKnob, boxShadow: "0 1px 4px rgba(0,0,0,.3)", zIndex: 2 }} />
          </div>
          {/* Speed + New */}
          <div style={{ display: "flex", alignItems: "center", gap: mob ? 6 : 8, flexShrink: 0 }}>
            {!sm && <div style={{ display: "flex", gap: 2 }}>
              {[.5, 1, 2].map(s => <div key={s} className="gs-speed-btn gs-interactive" onClick={() => setSpeed(s)} style={{ padding: "2px 6px", borderRadius: R.sm, cursor: "pointer", background: speed === s ? C.barKnob : "transparent", color: speed === s ? C.bar : C.barMute, fontSize: 11, fontFamily: SANS, fontWeight: 600, transition: "background 150ms var(--ease-out), color 150ms var(--ease-out)" }}>{s}x</div>)}
            </div>}
            <Button variant="bar" size="sm" className="touch-target" onClick={reset} style={{ padding: mob ? "8px 14px" : "4px 12px" }}>New</Button>
          </div>
        </div>
      </div>}
    </div>
  );
}
