# PolicySim

an interactive simulator that models how U.S. legislation moves through Congress. pick a bill (or write your own), watch it go through the Senate, House, presidential veto, and Supreme Court review — all with vote-by-vote animations.

every vote is computed from real member profiles based on the 119th Congress. each legislator has scores across 15 policy dimensions (immigration, healthcare, taxes, etc.), behavioral traits (party loyalty, bipartisan index), and electoral context (seat safety, margin). the simulator uses all of this to figure out how each person would actually vote.

## how it works

1. **pick a policy** — choose from presets like "Secure Borders Act" or "Medicare for All", or write your own bill using the custom bill creator
2. **Senate vote** — 100 senators vote in an animated hemicycle, with staggered reveals
3. **House vote** — 436 representatives vote (yes, all of them), rendered as a massive hemicycle
4. **Presidential veto** — the president decides whether to sign or veto based on cabinet alignment and personal ideology
5. **Veto override** — if vetoed, Congress can attempt a 2/3 override
6. **SCOTUS review** — if the bill has constitutional implications, the 9 justices weigh in

hover over any member during the sim to see their name, party, state, key committee assignments, vote reasoning, and any lobby pressure they're facing (with real org names like "Moderate lobby pressure from Lockheed Martin").

## the data

all 570 government profiles live in `data/government-profiles.json`:
- **100 senators** — full profiles with 15 issue dimensions, 6 behavioral traits, personality archetypes, state context
- **436 house members** — tier 1 (50 key members with deep profiles) and tier 2 (386 with lightweight profiles)
- **25 executive branch** — president, VP, and cabinet secretaries with veto factors
- **9 SCOTUS justices** — judicial philosophy, constitutional issue positions, deference scores

the frontend imports a compact version from `src/govData.js` (auto-generated, strips out biography/lobbying data to keep bundle size down).

## custom bills

you can write your own bill in plain English. the app analyzes your text client-side using keyword matching to figure out which policy dimensions it touches, then runs it through the full simulation pipeline. 

you can also bring your own API key! in testing, i used haiku 4.5 to make it a bit more accurate.

## project structure

```
src/GovSim.jsx          — the entire simulator (single-file React component)
src/govData.js           — auto-generated compact data for the frontend
data/government-profiles.json — full database of all 570 profiles
app/layout.jsx           — Next.js layout
app/page.jsx             — entry point
generate-house.js        — script to generate house profiles via Claude API
generate-house-fill.js   — fill-in script for missing state batches
generate-house-ca.js     — California-specific generation (52 members)
fill-missing.js          — patch script for remaining gaps
lib/db.js                — read/write the JSON database
lib/generate.js          — Claude API wrapper with retry logic
lib/house-roster.js      — tier 1 roster + state groupings
```

## running locally

```bash
npm install
npm run dev
```

if you want to regenerate profiles (requires an Anthropic API key in `.env.local`):

```bash
node generate-house.js
node fill-missing.js
```

## tech

- Next.js + React
- pure SVG for all visualizations (no charting library)
- Anthropic Claude API for profile generation and bill analysis
- Vercel for hosting + analytics

built mostly by Claude.
