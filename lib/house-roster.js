// ═══════════════════════════════════════════════════════════════
// HOUSE TIER 1 ROSTER — 50 key members for full profile generation
// 119th Congress (Jan 2025 – )
// ═══════════════════════════════════════════════════════════════

export const HOUSE_TIER1_ROSTER = [
  // ── REPUBLICAN LEADERSHIP ──
  { name: "Mike Johnson", state: "LA", district: 4, party: "R", committees: [], seniority: 8, leadership: "Speaker of the House" },
  { name: "Steve Scalise", state: "LA", district: 1, party: "R", committees: ["Energy and Commerce"], seniority: 16, leadership: "Majority Leader" },
  { name: "Tom Emmer", state: "MN", district: 6, party: "R", committees: [], seniority: 10, leadership: "Majority Whip" },
  { name: "Lisa McClain", state: "MI", district: 9, party: "R", committees: ["Ways and Means"], seniority: 4, leadership: "Republican Conference Chair" },

  // ── REPUBLICAN COMMITTEE CHAIRS ──
  { name: "Jim Jordan", state: "OH", district: 4, party: "R", committees: ["Judiciary"], seniority: 18, leadership: "Judiciary Committee Chair" },
  { name: "James Comer", state: "KY", district: 1, party: "R", committees: ["Oversight"], seniority: 8, leadership: "Oversight Committee Chair" },
  { name: "Jason Smith", state: "MO", district: 8, party: "R", committees: ["Ways and Means"], seniority: 10, leadership: "Ways and Means Chair" },
  { name: "Sam Graves", state: "MO", district: 6, party: "R", committees: ["Transportation"], seniority: 22, leadership: "Transportation Chair" },
  { name: "Michael McCaul", state: "TX", district: 10, party: "R", committees: ["Foreign Affairs"], seniority: 20, leadership: "Foreign Affairs Chair" },
  { name: "Mike Rogers", state: "AL", district: 3, party: "R", committees: ["Armed Services"], seniority: 22, leadership: "Armed Services Chair" },
  { name: "Virginia Foxx", state: "NC", district: 5, party: "R", committees: ["Education"], seniority: 18, leadership: "Education Committee Chair" },
  { name: "Tom Cole", state: "OK", district: 4, party: "R", committees: ["Appropriations"], seniority: 22, leadership: "Appropriations Chair" },
  { name: "Mark Green", state: "TN", district: 7, party: "R", committees: ["Homeland Security"], seniority: 6, leadership: "Homeland Security Chair", note: "Resigned early 2025 — flag status" },

  // ── REPUBLICAN NOTABLES (Freedom Caucus / MAGA) ──
  { name: "Marjorie Taylor Greene", state: "GA", district: 14, party: "R", committees: ["Oversight","Homeland Security"], seniority: 4, leadership: null },
  { name: "Lauren Boebert", state: "CO", district: 4, party: "R", committees: ["Natural Resources"], seniority: 4, leadership: null, note: "Switched from CO-3 to CO-4 for 2024" },
  { name: "Chip Roy", state: "TX", district: 21, party: "R", committees: ["Judiciary","Rules"], seniority: 6, leadership: null },
  { name: "Byron Donalds", state: "FL", district: 19, party: "R", committees: ["Financial Services","Oversight"], seniority: 4, leadership: null },
  { name: "Anna Paulina Luna", state: "FL", district: 13, party: "R", committees: ["Oversight","Natural Resources"], seniority: 2, leadership: null },
  { name: "Andy Biggs", state: "AZ", district: 5, party: "R", committees: ["Judiciary"], seniority: 8, leadership: null },
  { name: "Thomas Massie", state: "KY", district: 4, party: "R", committees: ["Rules","Judiciary"], seniority: 12, leadership: null },
  { name: "Wesley Hunt", state: "TX", district: 38, party: "R", committees: ["Armed Services","Intelligence"], seniority: 2, leadership: null },
  { name: "Scott Perry", state: "PA", district: 10, party: "R", committees: ["Foreign Affairs","Oversight"], seniority: 10, leadership: null },
  { name: "Matt Rosendale", state: "MT", district: 2, party: "R", committees: ["Natural Resources","Veterans Affairs"], seniority: 4, leadership: null, note: "Verify still serving — was considering Senate run" },
  { name: "Ralph Norman", state: "SC", district: 5, party: "R", committees: ["Rules","Financial Services"], seniority: 6, leadership: null },

  // ── REPUBLICAN MODERATES / SWING DISTRICT ──
  { name: "Dan Crenshaw", state: "TX", district: 2, party: "R", committees: ["Energy and Commerce","Intelligence"], seniority: 6, leadership: null },
  { name: "Nancy Mace", state: "SC", district: 1, party: "R", committees: ["Oversight"], seniority: 4, leadership: null },
  { name: "Don Bacon", state: "NE", district: 2, party: "R", committees: ["Armed Services","Agriculture"], seniority: 8, leadership: null },
  { name: "Brian Fitzpatrick", state: "PA", district: 1, party: "R", committees: ["Intelligence","Ethics"], seniority: 8, leadership: null },
  { name: "Mike Lawler", state: "NY", district: 17, party: "R", committees: ["Financial Services","Foreign Affairs"], seniority: 2, leadership: null, note: "Swing district — verify won 2024" },
  { name: "Young Kim", state: "CA", district: 40, party: "R", committees: ["Foreign Affairs","Financial Services"], seniority: 4, leadership: null },
  { name: "Mike Garcia", state: "CA", district: 27, party: "R", committees: ["Appropriations","Transportation"], seniority: 4, leadership: null, note: "Swing district — verify won 2024" },

  // ── DEMOCRATIC LEADERSHIP ──
  { name: "Hakeem Jeffries", state: "NY", district: 8, party: "D", committees: [], seniority: 12, leadership: "Minority Leader" },
  { name: "Katherine Clark", state: "MA", district: 5, party: "D", committees: [], seniority: 10, leadership: "Minority Whip" },
  { name: "Pete Aguilar", state: "CA", district: 33, party: "D", committees: ["Appropriations"], seniority: 10, leadership: "Democratic Caucus Chair" },

  // ── DEMOCRATIC NOTABLES (Progressive Wing) ──
  { name: "Alexandria Ocasio-Cortez", state: "NY", district: 14, party: "D", committees: ["Oversight","Financial Services"], seniority: 6, leadership: null },
  { name: "Ilhan Omar", state: "MN", district: 5, party: "D", committees: ["Budget","Education"], seniority: 6, leadership: null },
  { name: "Rashida Tlaib", state: "MI", district: 12, party: "D", committees: ["Oversight","Natural Resources"], seniority: 6, leadership: null },
  { name: "Pramila Jayapal", state: "WA", district: 7, party: "D", committees: ["Judiciary","Budget"], seniority: 8, leadership: "Congressional Progressive Caucus Chair" },
  { name: "Ro Khanna", state: "CA", district: 17, party: "D", committees: ["Armed Services","Oversight"], seniority: 8, leadership: null },
  { name: "Jamie Raskin", state: "MD", district: 8, party: "D", committees: ["Judiciary","Oversight"], seniority: 8, leadership: null },

  // ── DEMOCRATIC NOTABLES (Senior/Institutional) ──
  { name: "Jim Clyburn", state: "SC", district: 6, party: "D", committees: [], seniority: 30, leadership: null },
  { name: "Jerry Nadler", state: "NY", district: 12, party: "D", committees: ["Judiciary"], seniority: 32, leadership: null },
  { name: "Maxine Waters", state: "CA", district: 43, party: "D", committees: ["Financial Services"], seniority: 34, leadership: null },
  { name: "Rosa DeLauro", state: "CT", district: 3, party: "D", committees: ["Appropriations"], seniority: 34, leadership: null },
  { name: "Debbie Wasserman Schultz", state: "FL", district: 25, party: "D", committees: ["Appropriations"], seniority: 18, leadership: null },
  { name: "Adam Smith", state: "WA", district: 9, party: "D", committees: ["Armed Services"], seniority: 26, leadership: null },

  // ── DEMOCRATIC NOTABLES (Moderate/Swing) ──
  { name: "Jared Golden", state: "ME", district: 2, party: "D", committees: ["Armed Services","Small Business"], seniority: 6, leadership: null },
  { name: "Henry Cuellar", state: "TX", district: 28, party: "D", committees: ["Appropriations"], seniority: 20, leadership: null, note: "Under indictment — verify still serving" },
  { name: "Marie Gluesenkamp Perez", state: "WA", district: 3, party: "D", committees: ["Transportation","Agriculture"], seniority: 2, leadership: null },
  { name: "Greg Stanton", state: "AZ", district: 4, party: "D", committees: ["Judiciary","Transportation"], seniority: 6, leadership: null },
];

// ═══════════════════════════════════════════════════════════════
// STATE GROUPS for Tier 2 generation (remaining ~385 members)
// Each group covers a region; the API will be asked to list
// ALL current House members from those states minus Tier 1
// ═══════════════════════════════════════════════════════════════
export const STATE_GROUPS = [
  { label: "New England", states: ["CT","MA","ME","NH","RI","VT"], approxMembers: 20 },
  { label: "Mid-Atlantic", states: ["NJ","NY","PA"], approxMembers: 45 },
  { label: "Southeast - Atlantic", states: ["DE","FL","GA","MD","NC","SC","VA","DC"], approxMembers: 65 },
  { label: "Deep South", states: ["AL","AR","KY","LA","MS","TN","WV"], approxMembers: 35 },
  { label: "Midwest - East", states: ["IL","IN","MI","OH","WI"], approxMembers: 50 },
  { label: "Midwest - West", states: ["IA","KS","MN","MO","ND","NE","SD"], approxMembers: 25 },
  { label: "Texas", states: ["TX"], approxMembers: 36 },
  { label: "Mountain & Plains", states: ["AZ","CO","ID","MT","NM","NV","UT","WY"], approxMembers: 25 },
  { label: "Pacific", states: ["AK","CA","HI","OR","WA"], approxMembers: 65 },
  { label: "Territories & At-Large", states: ["OK"], approxMembers: 5 },
];
