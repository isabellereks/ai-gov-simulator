"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

export const BATTLE_CLASSES = [
  {
    id: "business_owner", name: "Small Business Owner",
    description: "You employ 40 people in the district and this bill hits your bottom line. When you talk jobs and payroll, members listen.",
    intro: "You run a business in the senator's state. Your employees are counting on you.",
    coreMoves: ["local_impact", "horse_trade", "constituent_pressure", "policy_appeal"],
    randomPool: ["media_pressure", "bipartisan_framing", "donor_leverage", "personal_appeal"],
    strong: ["emotional", "transactional"], weak: ["pressure"],
  },
  {
    id: "campaign_operative", name: "Campaign Operative",
    description: "You ran the coordinated campaign last cycle and you know their polling numbers better than they do. Elections have consequences.",
    intro: "You ran the coordinated campaign last cycle. You know their numbers better than they do.",
    coreMoves: ["primary_threat", "constituent_pressure", "media_pressure", "local_impact"],
    randomPool: ["donor_leverage", "policy_appeal", "bipartisan_framing", "backroom_deal"],
    strong: ["pressure"], weak: ["logical"],
  },
  {
    id: "lobbyist", name: "K Street Lobbyist",
    description: "Your firm represents clients who care about this bill. A lot. Your rolodex is worth more than most PACs and everyone owes you a call back.",
    intro: "Your rolodex is worth more than most PACs. Everyone on the Hill owes you a call back.",
    coreMoves: ["donor_leverage", "horse_trade", "policy_appeal", "media_pressure"],
    randomPool: ["primary_threat", "constitutional_argument", "constituent_pressure", "backroom_deal"],
    strong: ["transactional"], weak: ["emotional"],
  },
  {
    id: "policy_wonk", name: "Policy Wonk",
    description: "You have a PhD and a 40-page brief on this exact issue. You've spent six months researching it and your briefing binder is two inches thick.",
    intro: "You've spent six months researching this issue. Your briefing binder is two inches thick.",
    coreMoves: ["policy_appeal", "constitutional_argument", "bipartisan_framing", "local_impact"],
    randomPool: ["constituent_pressure", "media_pressure", "horse_trade", "moral_authority"],
    strong: ["logical"], weak: ["transactional"],
  },
  {
    id: "veteran", name: "Veteran",
    description: "You did two tours overseas and earned every medal on your chest. When you talk about duty and sacrifice, people sit up straight.",
    intro: "You did two tours overseas. When you talk about duty, people listen.",
    coreMoves: ["constitutional_argument", "constituent_pressure", "local_impact", "media_pressure"],
    randomPool: ["primary_threat", "bipartisan_framing", "policy_appeal", "moral_authority"],
    strong: ["logical", "emotional"], weak: ["transactional"],
  },
  {
    id: "parent", name: "Parent & Community Leader",
    description: "Make it personal with local stories and grassroots credibility. Powerful emotional appeals but can't match a lobbyist's leverage.",
    intro: "You've lived in this community for 20 years. You coach little league and run the food drive.",
    coreMoves: ["local_impact", "constituent_pressure", "bipartisan_framing", "media_pressure"],
    randomPool: ["horse_trade", "primary_threat", "policy_appeal", "personal_appeal"],
    strong: ["emotional"], weak: ["transactional"],
  },
  {
    id: "party_insider", name: "Party Insider",
    description: "Former Hill staffer who spent eight years in the Senate. You know the rules, the favors owed, and where a few skeletons are buried.",
    intro: "You worked in the Senate for 8 years. You know the rules, the favors owed, and the skeletons.",
    coreMoves: ["horse_trade", "primary_threat", "donor_leverage", "constituent_pressure"],
    randomPool: ["policy_appeal", "media_pressure", "local_impact", "backroom_deal"],
    strong: ["transactional", "pressure"], weak: ["logical"],
  },
  {
    id: "student_activist", name: "Student Activist",
    description: "You're 22 with 500k followers and you organized the campus walkout that made national news. You're not going away until you get a meeting.",
    intro: "You organized the campus walkout that made national news. Now you want a meeting.",
    coreMoves: ["media_pressure", "constituent_pressure", "local_impact", "primary_threat"],
    randomPool: ["bipartisan_framing", "policy_appeal", "constitutional_argument", "personal_appeal", "moral_authority"],
    strong: ["pressure", "emotional"], weak: ["logical"],
  },
];

const MOVES = {
  policy_appeal: {
    id: "policy_appeal", name: "Policy Appeal", emoji: "📊", category: "logical", power: 15,
    description: "Present data, CBO scores, and expert analysis.",
    typeChart: { hawk: 0.5, establishment: 1.0, moderate: 2.0, populist: 0.5, progressive: 1.5, libertarian: 1.0, centrist: 1.5 },
  },
  constitutional_argument: {
    id: "constitutional_argument", name: "Constitutional Argument", emoji: "📜", category: "logical", power: 18,
    description: "Frame it as a rights or liberty issue.",
    typeChart: { hawk: 1.0, establishment: 0.5, moderate: 1.0, populist: 0.5, progressive: 1.0, libertarian: 2.0, centrist: 0.5 },
  },
  bipartisan_framing: {
    id: "bipartisan_framing", name: "Bipartisan Framing", emoji: "🕊️", category: "logical", power: 12,
    description: "Reframe the bill as common-sense centrism.",
    typeChart: { hawk: 0.5, establishment: 1.5, moderate: 2.0, populist: 0.5, progressive: 0.5, libertarian: 1.0, centrist: 2.0 },
  },
  constituent_pressure: {
    id: "constituent_pressure", name: "Constituent Pressure", emoji: "📢", category: "pressure", power: 16,
    description: "Show them what their voters actually want.",
    typeChart: { hawk: 1.0, establishment: 1.5, moderate: 1.5, populist: 2.0, progressive: 0.5, libertarian: 0.5, centrist: 1.5 },
  },
  media_pressure: {
    id: "media_pressure", name: "Media Pressure", emoji: "📰", category: "pressure", power: 20,
    description: "This vote will be on the front page tomorrow.",
    typeChart: { hawk: 1.5, establishment: 1.0, moderate: 0.5, populist: 1.5, progressive: 1.0, libertarian: 1.5, centrist: 1.0 },
  },
  primary_threat: {
    id: "primary_threat", name: "Primary Threat", emoji: "⚠️", category: "pressure", power: 22,
    description: "Your base will remember this in 2026.",
    typeChart: { hawk: 1.0, establishment: 0.5, moderate: 1.5, populist: 1.0, progressive: 1.0, libertarian: 1.0, centrist: 2.0 },
  },
  horse_trade: {
    id: "horse_trade", name: "Horse Trade", emoji: "🤝", category: "transactional", power: 14,
    description: "Offer to back something they care about.",
    typeChart: { hawk: 0.5, establishment: 2.0, moderate: 1.5, populist: 0.5, progressive: 0.5, libertarian: 0.5, centrist: 1.5 },
  },
  donor_leverage: {
    id: "donor_leverage", name: "Donor Leverage", emoji: "💰", category: "transactional", power: 18,
    description: "Your top donors support this bill.",
    typeChart: { hawk: 1.0, establishment: 1.5, moderate: 1.0, populist: 2.0, progressive: 0.5, libertarian: 1.0, centrist: 1.0 },
  },
  local_impact: {
    id: "local_impact", name: "Local Impact", emoji: "🏠", category: "emotional", power: 17,
    description: "Tell the story of a real person in their state.",
    typeChart: { hawk: 0.5, establishment: 1.0, moderate: 1.5, populist: 2.0, progressive: 1.0, libertarian: 0.5, centrist: 1.5 },
  },
  blackmail: {
    id: "blackmail", name: "Blackmail", emoji: "🗂️", category: "pressure", power: 0, // power randomized at use
    description: "You know something they don't want public. Rare, unpredictable, devastating or useless.",
    typeChart: { hawk: 1.5, establishment: 2.0, moderate: 0.5, populist: 0.5, progressive: 0.3, libertarian: 1.5, centrist: 1.0 },
    isRare: true,
  },
  personal_appeal: {
    id: "personal_appeal", name: "Personal Appeal", emoji: "💬", category: "emotional", power: 13,
    description: "Speak to them as a person, not a politician. Works on empathetic types.",
    typeChart: { hawk: 0.5, establishment: 0.5, moderate: 2.0, populist: 1.5, progressive: 2.0, libertarian: 0.3, centrist: 1.5 },
  },
  moral_authority: {
    id: "moral_authority", name: "Moral Authority", emoji: "⚖️", category: "emotional", power: 16,
    description: "Appeal to their conscience. History is watching.",
    typeChart: { hawk: 1.0, establishment: 0.5, moderate: 1.5, populist: 1.0, progressive: 2.0, libertarian: 0.5, centrist: 1.0 },
  },
  backroom_deal: {
    id: "backroom_deal", name: "Backroom Deal", emoji: "🚪", category: "transactional", power: 20,
    description: "Off-the-record arrangements. High reward for the right type.",
    typeChart: { hawk: 1.5, establishment: 2.0, moderate: 0.5, populist: 0.3, progressive: 0.3, libertarian: 0.5, centrist: 1.0 },
  },
};

const COUNTERS = {
  hawk: { name: "National Security Card", power: 12, templates: [
    "{name} stiffens. \"This weakens America. I won't be the one who let that happen.\"",
    "{name} leans forward. \"Let's talk about what our adversaries do while we debate this.\"",
    "{name} crosses their arms. \"I've been briefed on threats you can't imagine. This bill is reckless.\"",
    "{name} taps the table. \"You want to explain this to the Joint Chiefs? Because I don't.\"",
    "{name} narrows their eyes. \"My job is to keep this country safe. Everything else is secondary.\"",
    "{name} shakes their head slowly. \"I didn't serve on the Armed Services Committee to vote for this.\"",
    "{name} stands up. \"When you've sat in a SCIF hearing what I've heard, you'd think differently.\"",
  ]},
  establishment: { name: "Procedural Block", power: 10, templates: [
    "{name} shakes their head. \"This will die in conference committee and you know it.\"",
    "{name} checks their watch. \"I have a markup in 20 minutes. Is this going somewhere?\"",
    "{name} leans back. \"I've been here long enough to know how this plays out. It doesn't pass.\"",
    "{name} adjusts their glasses. \"The whip count isn't there and we both know it.\"",
    "{name} sighs. \"I've seen a dozen versions of this bill. None of them made it to the floor.\"",
    "{name} straightens their tie. \"Talk to me when you have the committee chair's support.\"",
    "{name} folds the briefing paper. \"This is a messaging bill, not a serious proposal.\"",
  ]},
  moderate: { name: "Both Sides", power: 8, templates: [
    "{name} sighs. \"My district is split on this. I can't afford to pick a side.\"",
    "{name} folds their arms. \"Come back when both sides have signed off.\"",
    "{name} looks uncomfortable. \"I promised my voters I'd be a bridge-builder, not a partisan.\"",
    "{name} shakes their head. \"If I vote yes, I lose half my coalition. You know that.\"",
    "{name} pauses. \"There's a reasonable middle ground here, and this bill isn't it.\"",
    "{name} rubs their temples. \"I need cover from the other side before I can move on this.\"",
    "{name} leans forward. \"Get me one Republican cosponsor and we'll talk.\"",
  ]},
  populist: { name: "Elitist Framing", power: 14, templates: [
    "{name} laughs. \"That's what the DC crowd wants. Not real Americans.\"",
    "{name} points at you. \"You sound just like the establishment types my voters sent me here to fight.\"",
    "{name} scoffs. \"I didn't come to Washington to rubber-stamp what lobbyists want.\"",
    "{name} leans in. \"The people back home see right through this. They always do.\"",
    "{name} shakes their head. \"This is what happens when policy gets written in boardrooms instead of living rooms.\"",
    "{name} laughs bitterly. \"Another bill that helps the powerful and forgets the working class.\"",
    "{name} stands. \"My voters didn't send me here to be polite. They sent me to fight.\"",
  ]},
  progressive: { name: "Not Enough", power: 9, templates: [
    "{name} shakes their head. \"This is a half-measure. My community deserves more than crumbs.\"",
    "{name} leans back. \"Until you address root causes, I can't support this.\"",
    "{name} frowns. \"This tinkers around the edges. Where's the structural change?\"",
    "{name} looks away. \"My district has waited long enough for real solutions, not incrementalism.\"",
    "{name} sighs deeply. \"I can't go home and tell people this is the best we could do.\"",
    "{name} crosses their arms. \"The communities I represent need transformative action, not tweaks.\"",
    "{name} pushes back. \"If it doesn't address equity, it doesn't address the problem.\"",
  ]},
  libertarian: { name: "Government Overreach", power: 11, templates: [
    "{name} raises an eyebrow. \"Another bill, another expansion of federal power. Hard pass.\"",
    "{name} pulls out a pocket Constitution. \"Show me where this is authorized.\"",
    "{name} smirks. \"The government that governs best governs least. This does the opposite.\"",
    "{name} shakes their head. \"Every new program is a new bureaucracy. My voters want less, not more.\"",
    "{name} leans back. \"The free market will sort this out faster than any committee.\"",
    "{name} stands firm. \"Individual liberty isn't negotiable. Not for political convenience.\"",
    "{name} waves dismissively. \"We don't need another agency, another mandate, another regulation.\"",
  ]},
  centrist: { name: "Political Risk", power: 7, templates: [
    "{name} winces. \"I can't sell this back home. It's too partisan.\"",
    "{name} hesitates. \"If I vote for this, I lose the independents.\"",
    "{name} looks at the floor. \"My reelection is already going to be tough. This doesn't help.\"",
    "{name} shakes their head slowly. \"The timing is wrong. Maybe after the midterms.\"",
    "{name} taps the desk nervously. \"My opponent will run ads on this for months.\"",
    "{name} sighs. \"I like the idea, but the politics are terrible right now.\"",
    "{name} shifts in their chair. \"I need to see how the wind blows before committing.\"",
  ]},
};

// Move-reactive counter dialogue — varies by what the player just used and how effective it was
const MOVE_COUNTERS = {
  policy_appeal: {
    strong: [
      "{name} fumbles with their papers. \"Those numbers... I hadn't seen those.\"",
      "{name} pauses mid-rebuttal. \"Wait, that's the actual CBO score?\"",
      "{name} frowns at the data. \"My staff didn't brief me on this.\"",
      "{name} pulls out a pen. \"Show me that chart again.\"",
      "{name} looks shaken. \"If those projections are right, I need to rethink this.\"",
    ],
    neutral: [
      "{name} waves a hand. \"Numbers can say anything you want them to.\"",
      "{name} shrugs. \"I've seen studies that say the opposite.\"",
      "{name} squints. \"Interesting data, but data doesn't vote. People do.\"",
      "{name} crosses their arms. \"My economists tell a different story.\"",
      "{name} nods slowly but doesn't look convinced. \"I'll have my staff review it.\"",
    ],
    weak: [
      "{name} laughs. \"You think a CBO score is going to change my mind?\"",
      "{name} pushes the briefing back. \"I don't need a lecture on policy.\"",
      "{name} rolls their eyes. \"I've heard this pitch from better wonks than you.\"",
      "{name} waves dismissively. \"Save the white papers for someone who reads them.\"",
      "{name} yawns. \"Policy appeal? That's your play? Come on.\"",
    ],
  },
  constituent_pressure: {
    strong: [
      "{name} glances nervously toward the door. \"How many calls did my office get?\"",
      "{name} loosens their collar. \"I... hadn't realized the polling was that clear.\"",
      "{name} shifts uncomfortably. \"My town halls have been rough lately.\"",
      "{name} pauses. \"You've been talking to my constituents, haven't you?\"",
      "{name} picks up the phone, then puts it down. \"I hear you.\"",
    ],
    neutral: [
      "{name} shakes their head. \"Polls come and go. Convictions don't.\"",
      "{name} scoffs. \"I know my district better than any survey.\"",
      "{name} leans back. \"My voters understand nuance, even if you don't.\"",
      "{name} waves a hand. \"Vocal minorities aren't majorities.\"",
      "{name} raises an eyebrow. \"You think you know my constituents better than I do?\"",
    ],
    weak: [
      "{name} laughs it off. \"My seat is safe and we both know it.\"",
      "{name} smirks. \"Nice try. I won by {15-25} points last time.\"",
      "{name} stands firm. \"My voters sent me here to lead, not to follow polls.\"",
      "{name} yawns. \"I've survived worse pressure than this.\"",
      "{name} looks amused. \"Constituent pressure? On me? Really?\"",
    ],
  },
  media_pressure: {
    strong: [
      "{name} goes quiet. \"...Who have you been talking to at the press corps?\"",
      "{name} visibly tenses. \"If that story runs, I need to get ahead of it.\"",
      "{name} picks up their phone. \"Hold on, I need to call my comms director.\"",
      "{name} lowers their voice. \"What exactly does the reporter know?\"",
      "{name} rubs their forehead. \"The last thing I need is another news cycle.\"",
    ],
    neutral: [
      "{name} shrugs. \"The media writes what they want regardless.\"",
      "{name} waves it off. \"I've been in worse headlines.\"",
      "{name} crosses their arms. \"Media pressure doesn't work on me.\"",
      "{name} smirks. \"My comms team can handle a story.\"",
      "{name} looks unbothered. \"The news cycle moves on. I don't.\"",
    ],
    weak: [
      "{name} laughs openly. \"The press? They love me.\"",
      "{name} grins. \"Go ahead, run the story. It'll only help me.\"",
      "{name} is unfazed. \"Controversy is free advertising in my district.\"",
      "{name} leans forward. \"You think a headline scares me? I thrive on it.\"",
      "{name} chuckles. \"The media boosted my fundraising by {40-60}% last time they tried this.\"",
    ],
  },
  primary_threat: {
    strong: [
      "{name} clenches their jaw. \"...Who's talking about a primary?\"",
      "{name} goes pale. \"My margin was thin last time. I know that.\"",
      "{name} glances at their aide. \"Get me the latest internal polling.\"",
      "{name} swallows hard. \"The base has been restless. I've heard the rumblings.\"",
      "{name} drums their fingers nervously. \"A primary challenge would be... inconvenient.\"",
    ],
    neutral: [
      "{name} narrows their eyes. \"Threats don't usually work on me.\"",
      "{name} waves a hand. \"There's always someone threatening a primary.\"",
      "{name} shakes their head. \"I've survived primaries before.\"",
      "{name} looks irritated. \"Is that a threat? Because it sounds like one.\"",
      "{name} scoffs. \"You don't have the infrastructure to primary me.\"",
    ],
    weak: [
      "{name} laughs. \"Primary me? With what army?\"",
      "{name} grins. \"I've been here for {12-20} years. Good luck with that.\"",
      "{name} leans back confidently. \"My war chest could fund three campaigns.\"",
      "{name} looks almost amused. \"The last person who tried to primary me is a lobbyist now.\"",
      "{name} is supremely unbothered. \"I won my primary by {30-45} points.\"",
    ],
  },
  horse_trade: {
    strong: [
      "{name} pauses. \"...What kind of support are we talking about?\"",
      "{name} leans forward, interested. \"Now you're speaking my language.\"",
      "{name} opens their calendar. \"Let's talk details.\"",
      "{name} raises an eyebrow. \"That infrastructure bill has been stuck for months. You can move it?\"",
      "{name} taps the desk thoughtfully. \"A fair trade might be possible.\"",
    ],
    neutral: [
      "{name} crosses their arms. \"I don't trade votes. Usually.\"",
      "{name} looks skeptical. \"Can you actually deliver on that?\"",
      "{name} shakes their head. \"I need more than promises.\"",
      "{name} considers it. \"The math doesn't quite work yet.\"",
      "{name} tilts their head. \"Interesting offer. But not enough.\"",
    ],
    weak: [
      "{name} laughs. \"You think I can be bought for an earmark?\"",
      "{name} stands up. \"I don't make deals in back hallways.\"",
      "{name} pushes back. \"My principles aren't for sale.\"",
      "{name} scoffs. \"I've turned down better offers this week.\"",
      "{name} looks offended. \"This isn't a bazaar.\"",
    ],
  },
  donor_leverage: {
    strong: [
      "{name} checks their phone. \"...My fundraising team just texted me about this.\"",
      "{name} gets quiet. \"The bundlers have been calling. I know.\"",
      "{name} sighs. \"Campaign finance is the real boss in this town.\"",
      "{name} rubs their temples. \"My next quarter is going to be rough if I vote no, isn't it?\"",
      "{name} nods slowly. \"Money talks. I get it.\"",
    ],
    neutral: [
      "{name} frowns. \"I'm not a puppet for donors.\"",
      "{name} waves it off. \"I have plenty of funding sources.\"",
      "{name} crosses their arms. \"Donor pressure is part of the job. I can handle it.\"",
      "{name} shrugs. \"Money comes and goes.\"",
      "{name} looks unimpressed. \"I've diversified my donor base.\"",
    ],
    weak: [
      "{name} laughs. \"I self-funded last time. Try again.\"",
      "{name} shakes their head. \"My small-dollar donors are all I need.\"",
      "{name} is unmoved. \"I won't be bought.\"",
      "{name} scoffs. \"You're talking to someone who ran on rejecting big money.\"",
      "{name} looks amused. \"Donor leverage? On me? You haven't done your homework.\"",
    ],
  },
  local_impact: {
    strong: [
      "{name} goes quiet. \"...I know that family you're talking about.\"",
      "{name} looks away. \"That factory closing hit my district hard. I know.\"",
      "{name} swallows. \"My own nephew is dealing with the same thing.\"",
      "{name} is visibly moved. \"I grew up in a neighborhood just like that.\"",
      "{name} sighs deeply. \"Those stories keep me up at night.\"",
    ],
    neutral: [
      "{name} nods. \"I hear these stories every week. But one story isn't policy.\"",
      "{name} folds their arms. \"Anecdotes aren't arguments.\"",
      "{name} looks sympathetic but firm. \"I care about these people. I just disagree on the solution.\"",
      "{name} shakes their head. \"Every bill has a sob story attached to it.\"",
      "{name} pauses. \"I appreciate the personal touch, but I need more than that.\"",
    ],
    weak: [
      "{name} shrugs. \"Sad, but that doesn't change the policy math.\"",
      "{name} is unmoved. \"I've heard worse. Much worse.\"",
      "{name} looks away. \"I can't legislate based on feelings.\"",
      "{name} taps the desk. \"Personal stories are nice. But I deal in facts.\"",
      "{name} nods politely. \"Noted. My answer is still no.\"",
    ],
  },
  constitutional_argument: {
    strong: [
      "{name} opens the pocket Constitution on their desk. \"...Hm. You might have a point.\"",
      "{name} hesitates. \"The precedent there is stronger than I realized.\"",
      "{name} looks troubled. \"I took an oath. If the Constitution says...\"",
      "{name} pauses for a long time. \"Let me re-read that clause.\"",
      "{name} nods slowly. \"The legal framework is sound. I'll give you that.\"",
    ],
    neutral: [
      "{name} shakes their head. \"Constitutional scholars disagree on this all the time.\"",
      "{name} frowns. \"That's one interpretation.\"",
      "{name} crosses their arms. \"The framers didn't envision this situation.\"",
      "{name} tilts their head. \"Interesting argument. Not sure it holds up.\"",
      "{name} looks unconvinced. \"The courts can sort that out.\"",
    ],
    weak: [
      "{name} waves dismissively. \"Don't lecture me on the Constitution.\"",
      "{name} scoffs. \"I've been on the Judiciary Committee for {8-14} years. I know the law.\"",
      "{name} pulls out their own brief. \"My counsel disagrees entirely.\"",
      "{name} rolls their eyes. \"Everyone thinks they're a constitutional scholar.\"",
      "{name} is unmoved. \"That argument wouldn't survive five minutes in court.\"",
    ],
  },
  bipartisan_framing: {
    strong: [
      "{name} pauses. \"...Both governors signed it? Really?\"",
      "{name} looks interested. \"Bipartisan wins do boost approval ratings.\"",
      "{name} considers it. \"If the other side is on board, that changes things.\"",
      "{name} nods. \"I've been looking for something to run on with both sides.\"",
      "{name} uncrosses their arms. \"Common ground is rare. I'll give this a harder look.\"",
    ],
    neutral: [
      "{name} shakes their head. \"Bipartisan in name only.\"",
      "{name} scoffs. \"The other side is playing games. This isn't real compromise.\"",
      "{name} frowns. \"Easy to call it bipartisan when it hasn't hit the floor.\"",
      "{name} looks skeptical. \"I've seen bipartisan deals fall apart before.\"",
      "{name} shrugs. \"Centrism isn't always a virtue.\"",
    ],
    weak: [
      "{name} laughs. \"Bipartisan? My base doesn't want bipartisan.\"",
      "{name} waves it off. \"Reaching across the aisle gets you primaried where I'm from.\"",
      "{name} scoffs. \"Don't insult me with both-sides nonsense.\"",
      "{name} stands firm. \"I wasn't elected to compromise. I was elected to fight.\"",
      "{name} shakes their head. \"The middle of the road is where you get run over.\"",
    ],
  },
  blackmail: {
    strong: [
      "{name} goes white. \"...Where did you get that?\"",
      "{name} grips the armrest. \"Let's not do anything hasty here.\"",
      "{name} whispers. \"How much do you know?\"",
      "{name} stands abruptly and closes the blinds. \"We need to talk.\"",
      "{name} stares at the envelope. Their hand is shaking.",
    ],
    neutral: [
      "{name} narrows their eyes. \"If you think threats work on me, you're wrong.\"",
      "{name} pushes the envelope back. \"I've dealt with worse than you.\"",
      "{name} leans back. \"Everyone has dirt. Mine is already priced in.\"",
      "{name} stares at you coldly. \"Be very careful what you're implying.\"",
      "{name} crosses their arms. \"That's a dangerous game you're playing.\"",
    ],
    weak: [
      "{name} laughs. \"Go ahead. Publish it. Nobody cares.\"",
      "{name} grins. \"I already went on cable news about that. Old news.\"",
      "{name} shrugs. \"My voters knew about this when they elected me.\"",
      "{name} looks bored. \"You'll have to do better than that.\"",
      "{name} calls your bluff. \"If you had anything real, you'd have used it already.\"",
    ],
  },
  personal_appeal: {
    strong: [
      "{name} looks away, blinking. \"...You remind me of my daughter.\"",
      "{name} is quiet for a long moment. \"Nobody's talked to me like a person in months.\"",
      "{name} takes off their glasses and rubs their eyes. \"You're right. I did get into this for the right reasons.\"",
      "{name} softens visibly. \"I... appreciate you being straight with me.\"",
      "{name} nods slowly. \"Sometimes I forget why I came to Washington.\"",
    ],
    neutral: [
      "{name} sighs. \"I appreciate the sincerity. But sincerity doesn't pass bills.\"",
      "{name} looks conflicted. \"This isn't about feelings. It's about votes.\"",
      "{name} shakes their head. \"I hear you. But my hands are tied.\"",
      "{name} pauses. \"Nice speech. But I've made commitments.\"",
      "{name} looks sympathetic but unmoved. \"I wish it were that simple.\"",
    ],
    weak: [
      "{name} hardens. \"Don't try to emotionally manipulate me.\"",
      "{name} crosses their arms. \"I didn't get here by being sentimental.\"",
      "{name} is stone-faced. \"Feelings don't factor into my calculus.\"",
      "{name} waves a hand. \"Save the personal touch for someone who falls for it.\"",
      "{name} scoffs. \"I've been doing this too long for that to work.\"",
    ],
  },
  moral_authority: {
    strong: [
      "{name} is silent for a long time. \"...History does judge harshly.\"",
      "{name} stares at the desk. \"My grandkids are going to ask about this. I know.\"",
      "{name} looks troubled. \"You're not wrong about the moral dimension.\"",
      "{name} closes their eyes. \"I didn't come to Washington to be on the wrong side of history.\"",
      "{name} exhales slowly. \"When you put it like that...\"",
    ],
    neutral: [
      "{name} folds their arms. \"Morality is subjective. Policy isn't.\"",
      "{name} frowns. \"Don't confuse disagreement with immorality.\"",
      "{name} shakes their head. \"I have my own moral compass, thank you.\"",
      "{name} looks unmoved. \"Every side claims the moral high ground.\"",
      "{name} pauses. \"I appreciate the conviction. But my conscience is clear.\"",
    ],
    weak: [
      "{name} laughs dryly. \"Don't lecture me on morality from the cheap seats.\"",
      "{name} stands. \"I've been serving the public for {15-25} years. I know right from wrong.\"",
      "{name} is unmoved. \"Moral authority? From you? Please.\"",
      "{name} waves dismissively. \"Spare me the sermon.\"",
      "{name} scoffs. \"You're not my priest, my rabbi, or my conscience.\"",
    ],
  },
  backroom_deal: {
    strong: [
      "{name} closes the door. \"...Tell me more about that committee assignment.\"",
      "{name} lowers their voice. \"If this stays between us...\"",
      "{name} looks around, then leans in. \"How soon can you deliver?\"",
      "{name} considers the offer seriously. \"My infrastructure bill would move?\"",
      "{name} nods slowly. \"Now we're having a real conversation.\"",
    ],
    neutral: [
      "{name} raises an eyebrow. \"You're going to have to sweeten that deal.\"",
      "{name} frowns. \"I've heard promises like that before.\"",
      "{name} shakes their head. \"You don't have the pull to deliver that.\"",
      "{name} looks skeptical. \"Talk is cheap on the Hill.\"",
      "{name} leans back. \"I need guarantees, not handshakes.\"",
    ],
    weak: [
      "{name} stands. \"I'm not cutting deals in the dark.\"",
      "{name} looks disgusted. \"That's exactly what's wrong with this town.\"",
      "{name} pushes back. \"My integrity isn't for sale. Not for any price.\"",
      "{name} scoffs. \"A backroom deal? Who do you think you're talking to?\"",
      "{name} shakes their head firmly. \"I campaigned against this exact kind of politics.\"",
    ],
  },
};

const STATE_DATA = {
  AL: { c: ["Birmingham","Huntsville","Mobile"], u: "University of Alabama", s: ["Vestavia Hills","Madison"] },
  AK: { c: ["Anchorage","Fairbanks","Juneau"], u: "University of Alaska", s: ["Wasilla","Eagle River"] },
  AZ: { c: ["Phoenix","Tucson","Mesa"], u: "Arizona State University", s: ["Scottsdale","Chandler"] },
  AR: { c: ["Little Rock","Fayetteville","Fort Smith"], u: "University of Arkansas", s: ["Conway","Bentonville"] },
  CA: { c: ["Los Angeles","San Francisco","San Diego"], u: "UC Berkeley", s: ["Irvine","Pasadena"] },
  CO: { c: ["Denver","Colorado Springs","Boulder"], u: "University of Colorado", s: ["Lakewood","Aurora"] },
  CT: { c: ["Hartford","New Haven","Stamford"], u: "University of Connecticut", s: ["West Hartford","Greenwich"] },
  DE: { c: ["Wilmington","Dover","Newark"], u: "University of Delaware", s: ["Middletown","Hockessin"] },
  FL: { c: ["Miami","Orlando","Tampa"], u: "University of Florida", s: ["Coral Gables","Winter Park"] },
  GA: { c: ["Atlanta","Savannah","Augusta"], u: "University of Georgia", s: ["Marietta","Decatur"] },
  HI: { c: ["Honolulu","Hilo","Kailua"], u: "University of Hawaii", s: ["Mililani","Kapolei"] },
  ID: { c: ["Boise","Meridian","Idaho Falls"], u: "University of Idaho", s: ["Eagle","Nampa"] },
  IL: { c: ["Chicago","Springfield","Naperville"], u: "University of Illinois", s: ["Evanston","Schaumburg"] },
  IN: { c: ["Indianapolis","Fort Wayne","South Bend"], u: "Indiana University", s: ["Carmel","Fishers"] },
  IA: { c: ["Des Moines","Cedar Rapids","Davenport"], u: "University of Iowa", s: ["West Des Moines","Ames"] },
  KS: { c: ["Wichita","Kansas City","Topeka"], u: "University of Kansas", s: ["Overland Park","Olathe"] },
  KY: { c: ["Louisville","Lexington","Bowling Green"], u: "University of Kentucky", s: ["Florence","Nicholasville"] },
  LA: { c: ["New Orleans","Baton Rouge","Shreveport"], u: "Louisiana State University", s: ["Metairie","Kenner"] },
  ME: { c: ["Portland","Bangor","Lewiston"], u: "University of Maine", s: ["Scarborough","Falmouth"] },
  MD: { c: ["Baltimore","Bethesda","Annapolis"], u: "University of Maryland", s: ["Columbia","Rockville"] },
  MA: { c: ["Boston","Cambridge","Worcester"], u: "University of Massachusetts", s: ["Brookline","Newton"] },
  MI: { c: ["Detroit","Grand Rapids","Ann Arbor"], u: "University of Michigan", s: ["Troy","Novi"] },
  MN: { c: ["Minneapolis","St. Paul","Rochester"], u: "University of Minnesota", s: ["Eden Prairie","Edina"] },
  MS: { c: ["Jackson","Gulfport","Southaven"], u: "University of Mississippi", s: ["Madison","Brandon"] },
  MO: { c: ["St. Louis","Kansas City","Springfield"], u: "University of Missouri", s: ["Lee's Summit","Chesterfield"] },
  MT: { c: ["Billings","Missoula","Great Falls"], u: "University of Montana", s: ["Helena","Bozeman"] },
  NE: { c: ["Omaha","Lincoln","Bellevue"], u: "University of Nebraska", s: ["Papillion","La Vista"] },
  NV: { c: ["Las Vegas","Reno","Henderson"], u: "University of Nevada", s: ["Summerlin","Sparks"] },
  NH: { c: ["Manchester","Concord","Nashua"], u: "University of New Hampshire", s: ["Bedford","Derry"] },
  NJ: { c: ["Newark","Jersey City","Trenton"], u: "Rutgers University", s: ["Princeton","Montclair"] },
  NM: { c: ["Albuquerque","Santa Fe","Las Cruces"], u: "University of New Mexico", s: ["Rio Rancho","Corrales"] },
  NY: { c: ["New York City","Buffalo","Albany"], u: "SUNY", s: ["White Plains","Yonkers"] },
  NC: { c: ["Charlotte","Raleigh","Durham"], u: "UNC Chapel Hill", s: ["Cary","Apex"] },
  ND: { c: ["Fargo","Bismarck","Grand Forks"], u: "University of North Dakota", s: ["West Fargo","Mandan"] },
  OH: { c: ["Columbus","Cleveland","Cincinnati"], u: "Ohio State University", s: ["Dublin","Westerville"] },
  OK: { c: ["Oklahoma City","Tulsa","Norman"], u: "University of Oklahoma", s: ["Edmond","Broken Arrow"] },
  OR: { c: ["Portland","Eugene","Salem"], u: "University of Oregon", s: ["Lake Oswego","Beaverton"] },
  PA: { c: ["Philadelphia","Pittsburgh","Harrisburg"], u: "Penn State", s: ["King of Prussia","Media"] },
  RI: { c: ["Providence","Warwick","Cranston"], u: "University of Rhode Island", s: ["East Greenwich","Barrington"] },
  SC: { c: ["Charleston","Columbia","Greenville"], u: "University of South Carolina", s: ["Mount Pleasant","Lexington"] },
  SD: { c: ["Sioux Falls","Rapid City","Aberdeen"], u: "University of South Dakota", s: ["Brandon","Harrisburg"] },
  TN: { c: ["Nashville","Memphis","Knoxville"], u: "University of Tennessee", s: ["Franklin","Brentwood"] },
  TX: { c: ["Houston","Dallas","Austin"], u: "University of Texas", s: ["Plano","Frisco"] },
  UT: { c: ["Salt Lake City","Provo","Ogden"], u: "University of Utah", s: ["Draper","Sandy"] },
  VT: { c: ["Burlington","Montpelier","Rutland"], u: "University of Vermont", s: ["Essex","South Burlington"] },
  VA: { c: ["Richmond","Virginia Beach","Arlington"], u: "University of Virginia", s: ["McLean","Fairfax"] },
  WA: { c: ["Seattle","Spokane","Tacoma"], u: "University of Washington", s: ["Bellevue","Redmond"] },
  WV: { c: ["Charleston","Huntington","Morgantown"], u: "West Virginia University", s: ["South Charleston","Teays Valley"] },
  WI: { c: ["Milwaukee","Madison","Green Bay"], u: "University of Wisconsin", s: ["Brookfield","Wauwatosa"] },
  WY: { c: ["Cheyenne","Casper","Laramie"], u: "University of Wyoming", s: ["Gillette","Sheridan"] },
  DC: { c: ["Washington"], u: "Georgetown University", s: ["Bethesda","Arlington"] },
};

const CONSTITUENT_CLASSES = ["business_owner", "veteran", "student_activist", "parent"];

function getStateData(stateAbbr) {
  return STATE_DATA[stateAbbr] || STATE_DATA["DC"];
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const TRAINER_NAMES = [
  "Ash", "Misty", "Brock", "Gary", "Dawn", "Serena", "May", "Cynthia",
  "Red", "Blue", "Leaf", "Hilda", "Nate", "Rosa", "Calem", "Iris",
  "Lance", "Riley", "Elio", "Selene", "Gloria", "Hop", "Marnie",
];

function getPlayerLocation(playerClass, member) {
  const st = member.s || member.state || "DC";
  const sd = getStateData(st);
  const city = pickRandom(sd.c);
  const isConstituent = CONSTITUENT_CLASSES.includes(playerClass.id);

  if (isConstituent) {
    const locMap = {
      business_owner: `You run a small business in ${city}, ${st}`,
      veteran: `You're a retired veteran living in ${city}, ${st}`,
      student_activist: `You're a junior at ${sd.u}`,
      parent: `You live in ${pickRandom(sd.s)}, ${st} with your three kids`,
    };
    return { fromState: true, state: st, location: locMap[playerClass.id], label: `${city}, ${st}` };
  }

  const isLocal = Math.random() > 0.5;
  if (isLocal) {
    const locMap = {
      campaign_operative: `You ran the ${st} coordinated campaign last cycle`,
      lobbyist: `Your firm's ${st} office represents local industry clients`,
      policy_wonk: `You're a researcher at the ${st} Policy Institute`,
      party_insider: `You staffed the ${st} delegation for 6 years`,
    };
    return { fromState: true, state: st, location: locMap[playerClass.id] || `You work in ${city}`, label: `${city}, ${st}` };
  }

  const dcMap = {
    campaign_operative: "You flew in from DC this morning. You've run races in 12 states.",
    lobbyist: "You're with a K Street firm three blocks from the Capitol.",
    policy_wonk: "You're a senior fellow at Brookings. You literally wrote the white paper on this.",
    party_insider: "You spent 8 years on the Hill. Half the chiefs of staff have your number.",
  };
  return { fromState: false, state: "DC", location: dcMap[playerClass.id] || "You're visiting from DC.", label: "Washington, DC" };
}

// ═══════════════════════════════════════════════════════════
// DIALOGUE TEMPLATES
// ═══════════════════════════════════════════════════════════

const MOVE_DIALOGUE = {
  policy_appeal: {
    _default: [
      "\"The CBO score is clear, {name}. This bill pays for itself in {6-10} years.\"",
      "\"Let me walk you through the data, {name}. The numbers don't lie.\"",
      "\"Every independent analysis I've seen supports this, {name}. The evidence is overwhelming.\"",
      "\"Look at the pilot program results from {state}, {name}. {73-89}% success rate.\"",
      "\"The nonpartisan research is in, {name}. This works. Other states have proven it.\"",
      "\"I brought the GAO report, {name}. Page {12-34}. The fiscal impact is net positive.\"",
      "\"The data from comparable programs abroad is clear, {name}. Canada saw a {15-25}% improvement.\"",
      "\"Let me show you the cost-benefit analysis, {name}. For every dollar in, {2-4} come back.\"",
      "\"The economic modeling predicts {40000-80000} new jobs in the first {3-5} years, {name}.\"",
      "\"I know you like to see the numbers, {name}. Here they are. Every single one supports this.\"",
    ],
    business_owner: ["\"I've run the numbers for my own business, {name}. This adds up.\""],
    policy_wonk: ["\"I have a {35-50}-page brief here, {name}. The aggregate data is unambiguous.\""],
    campaign_operative: ["\"The polling in your district says {58-67}% support this, {name}. I've seen the crosstabs.\""],
    veteran: ["\"I've studied the policy impact on veterans' services, {name}. The evidence is clear.\""],
  },
  constitutional_argument: {
    _default: [
      "\"This is a fundamental rights issue, {name}. The Constitution is clear.\"",
      "\"The framers anticipated exactly this situation, {name}.\"",
      "\"There's strong precedent here, {name}. The {1967-2003} ruling laid the groundwork.\"",
      "\"This falls squarely within Congress's Article I authority, {name}. No ambiguity.\"",
      "\"The Tenth Amendment doesn't apply here, {name}. This is clearly enumerated federal power.\"",
      "\"Every constitutional scholar I've consulted agrees, {name}. This is on solid ground.\"",
      "\"The Supreme Court has upheld similar legislation {3-5} times, {name}. The precedent is clear.\"",
      "\"Read the Federalist Papers, {name}. Hamilton argued for exactly this kind of action.\"",
      "\"This isn't a gray area, {name}. The due process clause couldn't be more explicit.\"",
      "\"Your oath was to the Constitution, {name}. This bill honors that oath.\"",
    ],
    policy_wonk: ["\"The legal scholarship is unanimous, {name}. This is well within the commerce clause.\""],
    veteran: ["\"I took an oath to defend the Constitution, {name}. This bill upholds it.\""],
    party_insider: ["\"Your own party's platform says this is a constitutional right, {name}. I was there when we wrote it.\""],
  },
  bipartisan_framing: {
    _default: [
      "\"This isn't left or right, {name}. It's common sense.\"",
      "\"Both sides of the aisle have supported versions of this, {name}.\"",
      "\"{2-4} Republican governors and {2-4} Democratic governors signed similar bills, {name}.\"",
      "\"Your colleague across the aisle told me the same thing you just said, {name}. You agree on this.\"",
      "\"This is one of those rare issues where the base on both sides wants the same thing, {name}.\"",
      "\"The last bipartisan win boosted everyone's approval by {5-12} points, {name}. This could too.\"",
      "\"Nobody back home cares which party wrote it, {name}. They care if it works.\"",
      "\"I've spoken to members on both sides, {name}. You'd be surprised how many agree with you.\"",
      "\"This passed committee with votes from both parties, {name}. That doesn't happen by accident.\"",
      "\"Your constituents didn't send you here to fight the other party, {name}. They sent you to solve problems.\"",
    ],
    parent: ["\"At the PTA meeting, nobody asks your party, {name}. They ask what's good for kids.\""],
    policy_wonk: ["\"The Heritage Foundation and Brookings both endorsed the framework, {name}. That's rare.\""],
  },
  constituent_pressure: {
    _default: [
      "\"Your voters are watching this vote, {name}. And they have long memories.\"",
      "\"I've talked to people in your {district_or_state}, {name}. They want you to vote yes.\"",
      "\"Town halls are getting louder, {name}. People are asking why you haven't acted.\"",
      "\"{58-72}% of your district supports this, {name}. That's not a partisan number.\"",
      "\"Your phone lines have been ringing nonstop, {name}. Your staff knows which way this goes.\"",
      "\"I was at the diner on Main Street in {city} last week, {name}. Everyone's talking about this.\"",
      "\"The letters your office is getting aren't form letters, {name}. People are writing these by hand.\"",
      "\"Your approval among independents drops {8-15} points if you vote no, {name}. The data is clear.\"",
      "\"People in {city} are organizing, {name}. With or without your support.\"",
      "\"I brought {45-80} signed letters from your constituents, {name}. Want to read a few?\"",
    ],
    campaign_operative: ["\"I knocked on {2500-4000} doors in your district last cycle, {name}. I know what your voters are saying.\""],
    student_activist: ["\"We registered {3000-5000} new voters on campus, {name}. They're all watching.\""],
    business_owner: ["\"My {35-50} employees all vote in your district, {name}. They're paying attention.\""],
    parent: ["\"Every parent at the school board meeting asked me about this, {name}.\""],
  },
  media_pressure: {
    _default: [
      "\"This vote will be on the front page tomorrow, {name}. Which headline do you want?\"",
      "\"The cameras are already in the hallway, {name}. Your statement will be the lead story.\"",
      "\"There's a reporter from the {city} Gazette who's been working this story for weeks, {name}.\"",
      "\"Social media is already buzzing about this vote, {name}. Trending in your state.\"",
      "\"The op-ed is already written, {name}. The only question is the headline.\"",
      "\"{3-5} cable news shows have requested interviews about this vote, {name}.\"",
      "\"Your opponent's campaign is watching this vote live, {name}. They're drafting the press release right now.\"",
      "\"The story writes itself either way, {name}. But only one version makes you look good.\"",
      "\"A no vote makes the Sunday shows, {name}. And not the way you'd want.\"",
      "\"The editorial board at the biggest paper in your state is publishing tomorrow, {name}. They called me for comment.\"",
    ],
    student_activist: ["\"My TikTok has {400-600}k followers, {name}. This is going viral either way.\""],
    campaign_operative: ["\"The attack ad writes itself, {name}. 'Voted against their own constituents.'\""],
    lobbyist: ["\"{2-4} editorial boards are ready to run pieces on this vote, {name}.\""],
  },
  primary_threat: {
    _default: [
      "\"Your base will remember this in 2026, {name}. Every vote is on the record.\"",
      "\"There are {2-4} people in your state who would love to primary you over this, {name}.\"",
      "\"Your margin last cycle was only {2-5} points, {name}. That's not comfortable.\"",
      "\"The activist wing of your party is already talking about a challenger, {name}.\"",
      "\"I've heard rumblings from the state party, {name}. They're not happy.\"",
      "\"Your base turnout was down {4-8}% last cycle, {name}. A no vote doesn't help that.\"",
      "\"The PAC money dries up fast when you break with the base, {name}. I've seen it happen.\"",
      "\"Someone's going to run against you on this, {name}. The question is how strong they'll be.\"",
      "\"Your state chair called me yesterday, {name}. They're worried about your positioning.\"",
      "\"The grassroots groups are already scoring this vote, {name}. It goes on the card.\"",
    ],
    campaign_operative: ["\"I've already been contacted by {2-3} potential primary challengers, {name}. Just saying.\""],
    party_insider: ["\"The party chair told me they're watching this vote closely, {name}. Very closely.\""],
    student_activist: ["\"We primaried {2-3} incumbents last cycle, {name}. We can do it again.\""],
  },
  horse_trade: {
    _default: [
      "\"What if we included a provision for {state}'s {industry} sector, {name}?\"",
      "\"I can help with that infrastructure bill you've been pushing, {name}. A vote for a vote.\"",
      "\"There's a {150-400}M grant program in the next omnibus, {name}. I can steer some your way.\"",
      "\"You've been trying to get that military base expansion, {name}. I know people.\"",
      "\"What do you need for your district, {name}? Let's talk about what a yes vote looks like.\"",
      "\"I hear your transportation bill needs a cosponsor, {name}. I can make some calls.\"",
      "\"Your water treatment project has been stuck in committee, {name}. I can unstick it.\"",
      "\"The conference report has room for an amendment, {name}. Something for {state} maybe?\"",
      "\"Nobody's asking you to do this for free, {name}. What would make this worth your while?\"",
      "\"I talked to the committee chair, {name}. Your appropriations request could move forward if this passes.\"",
    ],
    lobbyist: ["\"My clients would be willing to support your highway project, {name}. In exchange for this.\""],
    party_insider: ["\"I can get you a seat on the appropriations subcommittee, {name}. Just say the word.\""],
    business_owner: ["\"I'll publicly endorse your small business initiative, {name}. It's a fair trade.\""],
  },
  donor_leverage: {
    _default: [
      "\"Your top donors are on our side of this, {name}. All of them.\"",
      "\"The industry groups who funded your campaign support this bill, {name}.\"",
      "\"The big money in your state is behind this, {name}. A no vote sends a bad signal.\"",
      "\"Your fundraising quarter is coming up, {name}. The bundlers are watching.\"",
      "\"The super PAC that spent ${2-5}M on your race last time? They want a yes vote, {name}.\"",
      "\"I was at the donor retreat last weekend, {name}. Your name came up. A lot.\"",
      "\"The business community is united on this one, {name}. That doesn't happen often.\"",
      "\"Your campaign treasury needs replenishing, {name}. The people who fill it care about this vote.\"",
      "\"Three of your top five donors called my office this week, {name}. All asking the same question.\"",
      "\"The fundraising circuit dries up fast for a no vote, {name}. I've watched it happen to colleagues.\"",
    ],
    lobbyist: ["\"My firm's PAC raised ${1.5-3}M for your last race, {name}. We'd like to continue that relationship.\""],
    party_insider: ["\"The donor call last Tuesday? Every major bundler asked about this vote, {name}.\""],
    campaign_operative: ["\"Your fundraising numbers go to zero if you vote no, {name}. I've seen it happen.\""],
  },
  local_impact: {
    _default: [
      "\"Let me tell you about a family in {city}, {name}. This bill changes everything for them.\"",
      "\"There's a single mom in {city} working {2-3} jobs, {name}. This bill is the difference.\"",
      "\"I met a teacher in {city} who's paying for supplies out of pocket, {name}. Every single month.\"",
      "\"A factory in {city} laid off {150-300} people last year, {name}. This bill could bring those jobs back.\"",
      "\"The clinic in {city} is about to close, {name}. {8000-15000} people depend on it.\"",
      "\"Talk to the farmers in {state}, {name}. They'll tell you what this bill means.\"",
      "\"There's a bridge in your district that's been rated structurally deficient for {4-7} years, {name}.\"",
      "\"I drove through {city} last month, {name}. The main street has {3-6} shuttered businesses.\"",
      "\"The waitlist for affordable housing in {city} is {8-18} months long, {name}. Families are sleeping in cars.\"",
      "\"A veteran in {city} waited {7-14} months for a disability claim, {name}. He served this country.\"",
    ],
    business_owner: ["\"I had to let {2-4} people go last month. Maria has {2-4} kids, {name}.\""],
    veteran: ["\"My buddy from the {3-5}rd Infantry can't get his VA claim processed. {6-10} months, {name}.\""],
    parent: ["\"My daughter asked why her school doesn't have a nurse, {name}. I didn't know what to say.\""],
    student_activist: ["\"My roommate dropped out, {name}. She was going to be a teacher.\""],
    policy_wonk: ["\"The aggregate shows {12000-18000} families affected, but let me tell you about one, {name}.\""],
    lobbyist: ["\"My client employs {1500-3000} people in your district, {name}. Here's what happens to them.\""],
  },
  blackmail: {
    _default: [
      "You slide a manila envelope across the table. {name} goes pale.",
      "\"I wasn't going to bring this up, {name}. But I have documents.\"",
      "\"Remember that meeting in {city} last March, {name}? Someone was taking notes.\"",
      "\"There's a filing at the FEC that doesn't quite add up, {name}. I've seen it.\"",
      "\"I know about the real estate deal, {name}. And so does a reporter I know.\"",
      "\"Your chief of staff talks too much at happy hour, {name}. Just so you know.\"",
      "\"I have the receipts, {name}. Literally.\"",
      "\"This doesn't have to be unpleasant, {name}. But it can be.\"",
      "\"A friend at the Inspector General's office mentioned something interesting about you, {name}.\"",
      "\"I'd hate for certain photographs from the fundraiser to surface, {name}.\"",
    ],
    party_insider: ["\"I was there when it happened, {name}. I still have the emails.\""],
    lobbyist: ["\"My firm keeps very detailed records, {name}. Very detailed.\""],
    campaign_operative: ["\"The opposition research file on you is thick, {name}. I've read every page.\""],
  },
  personal_appeal: {
    _default: [
      "\"Forget the politics for a second, {name}. I'm talking to you as a human being.\"",
      "\"I know this isn't easy, {name}. But think about why you got into public service.\"",
      "\"Your daughter goes to public school, {name}. Think about what this means for her.\"",
      "\"I'm not here as a lobbyist or an operative, {name}. I'm here as a neighbor.\"",
      "\"Look me in the eye, {name}. You know this is the right thing to do.\"",
      "\"I watched your speech at the {state} town hall, {name}. You believed every word. What changed?\"",
      "\"Your mom would be proud of a yes vote, {name}. You know that.\"",
      "\"This isn't about your career, {name}. This is about the kind of person you want to be.\"",
      "\"I drove {3-7} hours to be here, {name}. Doesn't that tell you something?\"",
      "\"You and I both know what the right thing is here, {name}. The question is whether you'll do it.\"",
    ],
    parent: ["\"My kid drew a picture of the Capitol, {name}. She thinks you help people. Don't prove her wrong.\""],
    veteran: ["\"I didn't serve overseas so politicians could play it safe, {name}. I served so they could do the right thing.\""],
  },
  moral_authority: {
    _default: [
      "\"History will judge this vote, {name}. Which side do you want to be on?\"",
      "\"There's a moral dimension here that can't be reduced to polling, {name}.\"",
      "\"Your constituents elected a leader, {name}. Not a weathervane.\"",
      "\"When your grandkids ask about this vote, {name}, what will you tell them?\"",
      "\"Sometimes doing the right thing costs you politically, {name}. That's what separates leaders from politicians.\"",
      "\"This isn't a gray area, {name}. People are suffering. You can help stop it.\"",
      "\"The moral arc of the universe bends toward justice, {name}. Don't bend the other way.\"",
      "\"In {10-20} years nobody will remember the horse-trading, {name}. They'll remember who stood up.\"",
      "\"I'm asking you to be brave, {name}. I know you have it in you.\"",
      "\"Every generation has a vote that defines it, {name}. This is yours.\"",
    ],
    veteran: ["\"I've seen what happens when leaders don't act, {name}. People die. This is your moment.\""],
    student_activist: ["\"My generation is watching, {name}. We'll remember who fought for us and who didn't.\""],
    policy_wonk: ["\"The evidence and the ethics point the same direction, {name}. That's rare. Don't waste it.\""],
  },
  backroom_deal: {
    _default: [
      "\"Let's step into the cloakroom for a minute, {name}. Off the record.\"",
      "\"Nobody has to know about this arrangement, {name}. It stays between us.\"",
      "\"I've already spoken to the committee chair, {name}. Your amendment gets a vote if this passes.\"",
      "\"There's a leadership vacancy coming up, {name}. The right vote here opens doors.\"",
      "\"Your state needs that military contract, {name}. I can make a call.\"",
      "\"The omnibus has room for a {200-500}M earmark, {name}. Your district could use it.\"",
      "\"I have a meeting with the White House tomorrow, {name}. I can mention your infrastructure priority.\"",
      "\"The party wants to invest in your race next cycle, {name}. A yes vote seals the deal.\"",
      "\"Let's not pretend this is about principle, {name}. Tell me what you need.\"",
      "\"There are {2-4} committee assignments opening up, {name}. The right people are watching this vote.\"",
    ],
    lobbyist: ["\"My clients are prepared to host a fundraiser in {city}, {name}. {500-800}k. You know the drill.\""],
    party_insider: ["\"I still have the Speaker's ear, {name}. One phone call and your priorities move to the front of the line.\""],
  },
};

function getMoveDialogue(moveId, playerClass, member, city) {
  const templates = MOVE_DIALOGUE[moveId];
  if (!templates) return `"You make your case to ${member.n}."`;
  const classTemplates = templates[playerClass.id] || [];
  const allTemplates = [...classTemplates, ...templates._default];
  const template = pickRandom(allTemplates);
  const st = member.s || member.state || "DC";
  const sd = getStateData(st);
  const industry = member.interests?.[0] || member.state_context?.key_industries?.[0] || "business";
  const distOrState = member.district ? `${st}-${member.district}` : st;
  return template
    .replace(/\{name\}/g, member.n)
    .replace(/\{state\}/g, st)
    .replace(/\{city\}/g, city || pickRandom(sd.c))
    .replace(/\{industry\}/g, industry)
    .replace(/\{district_or_state\}/g, distOrState)
    // Resolve {min-max} range placeholders into random numbers
    .replace(/\{(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\}/g, (_, minStr, maxStr) => {
      const isFloat = minStr.includes(".") || maxStr.includes(".");
      const min = parseFloat(minStr), max = parseFloat(maxStr);
      if (isFloat) return (min + Math.random() * (max - min)).toFixed(1);
      return String(randRange(Math.round(min), Math.round(max)));
    });
}

// ═══════════════════════════════════════════════════════════
// BERNIE SANDERS DIALOGUE
// ═══════════════════════════════════════════════════════════

const BERNIE_INTROS = [
  "{player}, you're {votesShort} votes short in the {chamber}. You've got 3 shots at this — but convince the right person and their allies might follow.",
  "{player}, your bill needs {votesShort} more votes in the {chamber}. I'll give you 3 battles. Pick your targets wisely — some carry more weight than others.",
  "Well {player}, {votesShort} votes short in the {chamber}. You get 3 battles to close the gap. Win over a leader and you might flip their whole bloc.",
  "{player}! {votesShort} votes to go in the {chamber}. 3 chances to make your case. A single win can move more than one vote if you target the right group.",
  "{player}, the {chamber} vote fell short by {votesShort}. You've got 3 rounds of persuasion ahead. Each battle could swing more than one member your way.",
];

const BERNIE_ADVICE = [
  "Not every argument works on every member.",
  "Bigger groups mean more votes if you win.",
  "Some targets are easier to flip than others.",
  "Mix up your approach — repetition gets tuned out.",
  "Read the matchup before you pick your move.",
  "Your class matters more than you think.",
  "Go for the winnable fights first.",
  "Pay attention to what lands and what doesn't.",
];

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function computeFlippability(member, bill) {
  if (bill.isAbsurd) return 0;

  if (!member.issues) {
    const center = bill.issuePositions
      ? Object.values(bill.issuePositions).reduce((a, b) => a + b, 0) / Object.values(bill.issuePositions).length
      : 0.5;
    const val = 0.5 + (1 - Math.abs((member.i || 0.5) - center)) * 0.5;
    const floor = 0.08 + (Math.abs(Math.sin(member.id?.length || 3)) * 0.10);
    return Math.max(floor, Math.min(1, val));
  }

  const billPositions = Object.entries(bill.issueWeights || {})
    .filter(([iss]) => bill.issuePositions?.[iss] !== undefined)
    .map(([iss, w]) => ({ pos: bill.issuePositions[iss], w }));
  const avgBillPos = billPositions.length > 0
    ? billPositions.reduce((s, p) => s + p.pos * p.w, 0) / billPositions.reduce((s, p) => s + p.w, 0)
    : 0.5;
  const billPartisanship = Math.abs(avgBillPos - 0.5) * 2;

  let alignment = 0, totalWeight = 0;
  for (const [issue, weight] of Object.entries(bill.issueWeights || {})) {
    if (member.issues[issue] !== undefined && bill.issuePositions?.[issue] !== undefined) {
      const distance = Math.abs(member.issues[issue] - bill.issuePositions[issue]);
      const memberSide = member.issues[issue] - 0.5;
      const billSide = bill.issuePositions[issue] - 0.5;
      const opposingSides = memberSide * billSide < 0 && Math.abs(memberSide) > 0.12 && Math.abs(billSide) > 0.12;
      const agree = opposingSides ? (0.2 - distance * 2.8) : (1 - distance * 2.2);
      alignment += agree * weight;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return 0.5;

  let baseProb = (0.48) + (alignment / totalWeight) * 0.4;
  if (member.behavior && bill.partySupport && bill.partySupport !== "bipartisan") {
    const loyaltyStrength = 0.1 + billPartisanship * 0.2;
    const partyAligned = bill.partySupport === member.p;
    if (partyAligned) baseProb += member.behavior.party_loyalty * loyaltyStrength;
    else baseProb -= member.behavior.party_loyalty * loyaltyStrength * 0.85;
  }

  // Floor of 8-18% — even the toughest members should have a fighting chance
  const floor = 0.08 + (Math.abs(Math.sin(member.id?.length || 3)) * 0.10);
  return Math.max(floor, Math.min(1, baseProb));
}

export function groupTargets(nayVoters, bill) {
  const groups = {};
  for (const m of nayVoters) {
    const arch = m.personality?.archetype || "establishment";
    const key = `${m.p}_${arch}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }

  return Object.entries(groups)
    .map(([key, members]) => {
      members.sort((a, b) => computeFlippability(b, bill) - computeFlippability(a, bill));
      // Prefer Tier 1 members (those with biography/lobbying) as the face
      const tier1 = members.find(m => m.biography || m.lobbying);
      const face = tier1 || members[0];
      const arch = face.personality?.archetype || "establishment";
      const avgFlip = members.reduce((s, m) => s + computeFlippability(m, bill), 0) / members.length;
      return {
        key,
        face,
        group: members,
        count: members.length,
        archetype: arch,
        party: face.p,
        avgFlippability: avgFlip,
      };
    })
    .filter(g => g.count > 0)
    .sort((a, b) => b.avgFlippability - a.avgFlippability);
}

function calculateDamage(move, member, playerClass, bill, battleState, playerLocation) {
  // Blackmail has random power: could be devastating (35) or useless (5)
  let damage = move.isRare ? Math.floor(Math.random() * 31) + 5 : move.power;
  const archetype = member.personality?.archetype || "establishment";
  damage *= move.typeChart[archetype] || 1.0;

  if (playerClass.strong.includes(move.category)) damage *= 1.4;
  if (playerClass.weak.includes(move.category)) damage *= 0.6;

  // Member-specific modifiers
  if (move.id === "donor_leverage") damage *= (member.behavior?.lobby_susceptibility || 0.5) * 1.5;
  if (move.id === "media_pressure") damage *= (member.behavior?.media_sensitivity || 0.5) * 1.5;
  if (move.id === "horse_trade") damage *= (member.behavior?.deal_maker || 0.5) * 1.5;
  if (move.id === "constituent_pressure") {
    if (member.electoral?.seat_safety === "toss-up") damage *= 1.5;
    if (member.electoral?.seat_safety === "safe") damage *= 0.7;
  }
  if (move.id === "primary_threat") {
    if (member.electoral?.primary_vulnerable) damage *= 1.8;
    if (member.electoral?.seat_safety === "safe" && (member.seniority || 0) > 12) {
      if (Math.random() < 0.3) return { damage: Math.round(-damage * 0.5), backfire: true };
    }
  }

  // Combos
  if (move.id === "local_impact" && battleState.usedMoves.includes("constituent_pressure")) damage *= 1.4;
  if (move.id === "donor_leverage" && bill.affectedIndustries && member.lobbying?.top_industries) {
    const overlap = member.lobbying.top_industries.some(ind =>
      bill.affectedIndustries.some(bi => ind.toLowerCase().includes(bi.toLowerCase()))
    );
    if (overlap) damage *= 1.5;
  }

  // Variety bonus/penalty
  const usedMoves = battleState.usedMoves;
  const lastMoveId = usedMoves[usedMoves.length - 1];
  if (lastMoveId) {
    const lastCat = MOVES[lastMoveId]?.category;
    if (lastCat === move.category) damage *= 0.75;
    else damage *= 1.1;
  }
  // Well-rounded bonus: 3 different categories in last 3 moves
  if (usedMoves.length >= 2) {
    const last3 = [...usedMoves.slice(-2), move.id];
    const cats = new Set(last3.map(id => MOVES[id]?.category));
    if (cats.size >= 3) damage *= 1.2;
  }

  // Location bonus
  if (playerLocation?.fromState && (move.id === "constituent_pressure" || move.id === "local_impact")) {
    damage *= 1.2;
  }
  if (!playerLocation?.fromState && (move.id === "policy_appeal" || move.id === "donor_leverage")) {
    damage *= 1.15;
  }

  // Random ±15%
  damage *= 0.85 + Math.random() * 0.3;
  return { damage: Math.round(damage), backfire: false };
}

function calcCounterDamage(member) {
  const arch = member.personality?.archetype || "establishment";
  let dmg = COUNTERS[arch]?.power || 10;
  dmg += (member.seniority || 0) * 0.3;
  dmg += (member.behavior?.ideological_rigidity || 0.5) * 8;
  dmg *= 0.85 + Math.random() * 0.3;
  return Math.round(dmg);
}

function resolveGroupFlip(group, bill, battleWon) {
  if (!battleWon) return [];
  const flipped = [];
  for (const member of group.group) {
    if (member.id === group.face.id) { flipped.push(member); continue; }
    const flip = computeFlippability(member, bill);
    // Winning the leader convinces colleagues more easily — threshold scales with flippability
    // Base 40% chance even for low-flippability colleagues, plus their actual flippability
    const followChance = 0.4 + flip * 0.5;
    if (Math.random() < followChance) {
      flipped.push(member);
    }
  }
  return flipped;
}

function drawBattleMoves(playerClass) {
  const core = [...playerClass.coreMoves];
  const pool = [...playerClass.randomPool].sort(() => Math.random() - 0.5);
  const drawn = [...core, ...pool.slice(0, 2)];
  // ~15% chance to replace one random pool move with blackmail
  if (Math.random() < 0.15 && drawn.length > 4) {
    drawn[drawn.length - 1] = "blackmail";
  }
  return drawn;
}

function getEffectivenessLabel(multiplier) {
  if (multiplier >= 2.0) return { text: "It's super effective!", color: "#d4a017", type: "super" };
  if (multiplier >= 1.5) return { text: "It's very effective!", color: "#88b04b", type: "strong" };
  if (multiplier <= 0.5) return { text: "It's not very effective...", color: "#888", type: "weak" };
  if (multiplier < 0) return { text: "It backfired!", color: "#c44", type: "backfire" };
  return null;
}

function getMoveEffectiveness(move, member, playerClass) {
  const archetype = member.personality?.archetype || "establishment";
  let mult = move.typeChart[archetype] || 1.0;
  if (playerClass.strong.includes(move.category)) mult *= 1.4;
  if (playerClass.weak.includes(move.category)) mult *= 0.6;
  return mult;
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function HPBar({ value, max = 100, color }) {
  const segs = 20;
  const filled = Math.ceil((value / max) * segs);
  const c = value > 50 ? (color || "#4a8") : value > 25 ? "#ca2" : "#c44";
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} style={{
          width: 10, height: 8,
          background: i < filled ? c : "#33302a",
          transition: "background 0.15s ease",
          transitionDelay: `${i * 30}ms`,
        }} />
      ))}
    </div>
  );
}

function TypewriterText({ text, speed = 25, onComplete, style }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
        if (onComplete) onComplete();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span style={style}>
      {displayed}
      {done && <span style={{ animation: "blink 1s step-end infinite", marginLeft: 4 }}>▼</span>}
    </span>
  );
}

function EffectivenessPopup({ label, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!label) return null;
  const scale = label.type === "super" ? "1.3" : label.type === "backfire" ? "1.2" : "1";
  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%", transform: `translate(-50%,-50%) scale(${scale})`,
      fontSize: 22, fontWeight: 700, color: label.color,
      textShadow: `0 0 20px ${label.color}44`,
      animation: "effectiveness-pop 1.5s ease-out forwards",
      zIndex: 100, pointerEvents: "none", whiteSpace: "nowrap",
      fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
    }}>
      {label.text}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CLASS SELECTION
// ═══════════════════════════════════════════════════════════

function ClassSelection({ classOptions, onSelect, playerName, onNameChange, colors, fonts, radii, mob }) {
  const C = colors, SANS = fonts.sans, SERIF = fonts.serif;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [tappedCard, setTappedCard] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [animPlaceholder, setAnimPlaceholder] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const CLASS_COLORS = {
    business_owner:     { base: "#b8a060", glow: "rgba(139,105,20,0.15)" },
    campaign_operative: { base: "#b06060", glow: "rgba(148,50,50,0.15)" },
    lobbyist:           { base: "#6088a8", glow: "rgba(46,94,140,0.15)" },
    policy_wonk:        { base: "#6a9a7f", glow: "rgba(74,122,95,0.15)" },
    veteran:            { base: "#8b7b5e", glow: "rgba(107,91,62,0.15)" },
    parent:             { base: "#a882a1", glow: "rgba(139,98,129,0.15)" },
    party_insider:      { base: "#7a6aaa", glow: "rgba(90,74,138,0.15)" },
    student_activist:   { base: "#c8854e", glow: "rgba(193,101,46,0.15)" },
  };

  useEffect(() => {
    if (inputFocused || playerName) return;
    let cancelled = false;
    const names = [...TRAINER_NAMES].sort(() => Math.random() - 0.5);
    let idx = 0;
    async function cycle() {
      while (!cancelled) {
        const name = `I'm ${names[idx % names.length]}...`;
        // Type
        for (let i = 0; i <= name.length; i++) {
          if (cancelled) return;
          setAnimPlaceholder(name.slice(0, i));
          await new Promise(r => setTimeout(r, 60 + Math.random() * 40));
        }
        await new Promise(r => setTimeout(r, 1800));
        // Delete
        for (let i = name.length; i >= 0; i--) {
          if (cancelled) return;
          setAnimPlaceholder(name.slice(0, i));
          await new Promise(r => setTimeout(r, 30));
        }
        await new Promise(r => setTimeout(r, 400));
        idx++;
      }
    }
    cycle();
    return () => { cancelled = true; };
  }, [inputFocused, playerName]);

  const handleCardClick = (cls) => {
    // On mobile (no hover), toggle flip via tap
    if (mob) setTappedCard(prev => prev === cls.id ? null : cls.id);
    setSelectedClass(cls);
  };

  const handleGo = () => {
    if (!selectedClass) return;
    if (!playerName.trim()) onNameChange(pickRandom(TRAINER_NAMES));
    onSelect(selectedClass);
  };

  // Get the available moves for a class
  const getClassMoves = (cls) => {
    const allMoveIds = [...cls.coreMoves, ...cls.randomPool];
    return allMoveIds.map(id => MOVES[id]).filter(Boolean);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: mob ? 16 : 32, overflow: "auto",
    }}>
      {/* Texture overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: .02, pointerEvents: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px" }} />

      {/* Header */}
      <div className="gs-fade-in-up" style={{
        textAlign: "center", marginBottom: mob ? 16 : 28,
      }}>
        <div style={{ fontSize: mob ? 10 : 12, letterSpacing: 4, textTransform: "uppercase", color: C.textMute, fontFamily: SANS, fontWeight: 600, marginBottom: 8 }}>
          CHOOSE YOUR CLASS
        </div>
        <div style={{
          fontSize: mob ? 14 : 17, color: C.textMid, fontFamily: SERIF,
          maxWidth: 460, margin: "0 auto", lineHeight: 1.5,
        }}>
          How will you make your case on Capitol Hill?
        </div>
      </div>

      {/* Name input */}
      <div style={{
        marginBottom: mob ? 16 : 24, width: "100%", maxWidth: 340,
      }} className="gs-fade-in-up-d1">
        <label style={{ fontSize: 11, fontFamily: SANS, fontWeight: 600, color: C.textMid, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Your Name
        </label>
        <input
          type="text" value={playerName} onChange={e => onNameChange(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder={animPlaceholder || "Enter your name..."}
          maxLength={30}
          style={{
            width: "100%", padding: "10px 14px", fontSize: 15, fontFamily: SERIF,
            border: `1px solid ${C.border}`, borderRadius: radii.md, background: C.card,
            color: C.text, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Class cards */}
      <div style={{
        display: "flex", flexDirection: mob ? "column" : "row", gap: mob ? 12 : 16,
        width: "100%", maxWidth: 780, justifyContent: "center",
        perspective: "1000px",
      }}>
        {classOptions.map((cls, idx) => {
          const isFlipped = mob ? tappedCard === cls.id : hoveredCard === cls.id;
          const isSelected = selectedClass?.id === cls.id;
          const moves = getClassMoves(cls);
          const cc = CLASS_COLORS[cls.id] || CLASS_COLORS.business_owner;
          return (
            <div
              key={cls.id}
              className={`gs-fade-in-up-d${idx + 2} gs-class-shimmer${isSelected ? " gs-class-selected" : ""}`}
              onClick={() => handleCardClick(cls)}
              onMouseEnter={() => { setHoveredCard(cls.id); setSelectedClass(cls); }}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                "--shimmer-color": cc.base,
                "--shimmer-glow": cc.glow,
                flex: mob ? "none" : "1 1 0",
                height: mob ? 140 : 180,
                cursor: "pointer",
                perspective: "600px",
              }}
            >
              <div style={{
                position: "relative", width: "100%", height: "100%",
                transformStyle: "preserve-3d",
                transition: "transform 0.5s ease",
                transform: isFlipped ? "rotateY(180deg)" : "none",
              }}>
                {/* FRONT */}
                <div className="gs-class-face" style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden",
                  background: C.card,
                  borderRadius: radii.lg,
                  padding: mob ? "16px 20px" : "20px 24px",
                  overflow: "hidden",
                }}>
                  <div style={{ fontSize: mob ? 16 : 18, fontWeight: 600, color: C.text, marginBottom: 4 }}>{cls.name}</div>
                  <div style={{ fontSize: mob ? 12 : 13, color: C.textMid, fontFamily: SANS, lineHeight: 1.4 }}>{cls.description}</div>
                </div>
                {/* BACK */}
                <div className="gs-class-face" style={{
                  position: "absolute", inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: C.card,
                  borderRadius: radii.lg,
                  padding: mob ? "16px 20px" : "20px 24px",
                  overflow: "hidden",
                }}>
                  <div style={{ fontSize: mob ? 14 : 16, fontWeight: 600, color: C.text, marginBottom: 10 }}>{cls.name}</div>
                  <div style={{ fontSize: 11, fontFamily: SANS, color: C.textMid }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Possible moves:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {moves.slice(0, 5).map(m => (
                        <span key={m.name} style={{ background: C.bg, padding: "2px 6px", borderRadius: radii.sm, fontSize: 10 }}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Let's go button */}
      <div className="gs-fade-in-up-d4" style={{ marginTop: mob ? 20 : 28 }}>
        <button
          onClick={handleGo}
          disabled={!selectedClass}
          className={selectedClass ? "gs-interactive gs-btn-primary" : ""}
          style={{
            padding: "12px 36px", borderRadius: radii.md, border: "none",
            background: selectedClass ? `linear-gradient(135deg, ${C.text}, #3d3428)` : C.card,
            color: selectedClass ? C.bg : C.textMute,
            fontFamily: SANS, fontWeight: 700, fontSize: 15, cursor: selectedClass ? "pointer" : "not-allowed",
            transition: "all 200ms ease",
            opacity: selectedClass ? 1 : 0.5,
            boxShadow: selectedClass ? "0 2px 8px rgba(44,36,24,0.15)" : "0 1px 4px rgba(44,36,24,0.08)",
          }}
        >
          Let&apos;s go! →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BATTLE TRIGGER
// ═══════════════════════════════════════════════════════════

function BattleTrigger({ chamberLabel, yeaCount, nayCount, needed, onFight, onSkip, colors, fonts, radii, mob }) {
  const C = colors, SANS = fonts.sans, SERIF = fonts.serif;
  const votesShort = needed - yeaCount;

  return (
    <div className="gs-fade-in-up" style={{
      position: "absolute", bottom: mob ? 64 : 68, left: "50%", transform: "translateX(-50%)",
      zIndex: 20,
      maxWidth: mob ? "92vw" : "none",
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
        padding: mob ? "16px 20px" : "22px 32px", textAlign: "center",
        boxShadow: "0 4px 16px rgba(44,36,24,0.08)",
      }}>
        <div style={{ fontSize: mob ? 13 : 15, fontWeight: 500, color: C.text, fontFamily: SANS, marginBottom: 4 }}>
          {chamberLabel} vote failed {yeaCount}&ndash;{nayCount}
        </div>
        <div style={{ fontSize: mob ? 12 : 13, color: C.textMid, fontFamily: SANS, marginBottom: mob ? 14 : 18 }}>
          You need {votesShort} more vote{votesShort !== 1 ? "s" : ""} to pass
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onFight} className="gs-interactive gs-btn-primary" style={{
            padding: mob ? "8px 20px" : "10px 28px",
            borderRadius: radii.md, border: "none",
            background: `linear-gradient(135deg, ${C.text}, #3d3428)`,
            color: C.bg, fontFamily: SANS, fontWeight: 700,
            fontSize: mob ? 12 : 14, cursor: "pointer",
            transition: "all 150ms ease",
            boxShadow: "0 2px 8px rgba(44,36,24,0.15)",
          }}>
            Battle for it
          </button>

          <button onClick={onSkip} className="gs-interactive gs-btn-ghost" style={{
            padding: mob ? "8px 20px" : "10px 28px",
            borderRadius: radii.md, border: "none",
            background: C.bg, color: C.textMid, fontFamily: SANS, fontWeight: 600,
            fontSize: mob ? 12 : 14, cursor: "pointer",
            transition: "all 150ms ease",
            boxShadow: "0 1px 4px rgba(44,36,24,0.08)",
          }}>
            Accept defeat
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TARGET SELECTION
// ═══════════════════════════════════════════════════════════

function TargetSelection({ groups, battlesRemaining, yeaCount, needed, onSelect, onGiveUp, colors, fonts, radii, mob, chamberLabel }) {
  const C = colors, SANS = fonts.sans, SERIF = fonts.serif;

  return (
    <div style={{ padding: mob ? 16 : 32, maxWidth: 700, margin: "0 auto", width: "100%" }}>
      <div className="gs-fade-in-up" style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          fontSize: 11, fontFamily: SANS, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4,
          background: `linear-gradient(90deg, ${C.textMute}, ${C.text}, ${C.textMute})`,
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          animation: "shimmer 5s ease-in-out infinite",
        }}>
          Choose Your Target
        </div>
        <div style={{ fontSize: mob ? 14 : 16, fontFamily: SANS, color: C.textMid }}>
          {battlesRemaining} battle{battlesRemaining !== 1 ? "s" : ""} remaining · {yeaCount} of {needed} votes secured
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {groups.map((g, idx) => {
          // Bigger groups look harder but can flip more votes
          const sizePenalty = g.count > 1 ? 1 - Math.min(0.35, (g.count - 1) * 0.07) : 1;
          const flipPct = Math.round(g.avgFlippability * sizePenalty * 100);
          const filledSegs = Math.round(flipPct / 10);
          const partyTint = g.party === "R" ? "#8b5a50" : g.party === "D" ? "#50698b" : "#6b5b7a";
          const weaknesses = [];
          for (const [moveId, move] of Object.entries(MOVES)) {
            if ((move.typeChart[g.archetype] || 1) >= 1.5) weaknesses.push(move.name);
          }

          return (
            <div
              key={g.key}
              className="gs-fade-in-up"
              onClick={() => onSelect(g)}
              style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
                padding: mob ? "14px 16px" : "16px 20px", cursor: "pointer",
                transition: "all 200ms ease",
                animationDelay: `${idx * 80}ms`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: mob ? 15 : 17, fontWeight: 600, color: C.text }}>
                    {g.archetype.charAt(0).toUpperCase() + g.archetype.slice(1)} {g.party === "R" ? "Republicans" : "Democrats"}{" "}
                    <span style={{ color: C.textMute, fontWeight: 400 }}>({"\u00D7"}{g.count})</span>
                  </div>
                  <div style={{ fontSize: mob ? 12 : 13, fontFamily: SANS, marginTop: 2, color: C.textMid }}>
                    Led by <span style={{ fontWeight: 700, color: C.text }}>{g.face.n}</span>{" "}
                    <span style={{ color: partyTint, fontWeight: 600 }}>({g.face.p}-{g.face.s || g.face.state})</span>
                  </div>
                </div>
                <div className="gs-btn-ghost" style={{
                  padding: "4px 12px", borderRadius: radii.md, border: "none",
                  fontSize: 12, fontFamily: SANS, fontWeight: 600, color: C.text, whiteSpace: "nowrap",
                  transition: "all 150ms ease",
                  boxShadow: "0 1px 4px rgba(44,36,24,0.10)",
                }}>
                  BATTLE →
                </div>
              </div>

              {weaknesses.length > 0 && (
                <div style={{ fontSize: 11, fontFamily: SANS, color: C.textMid, marginBottom: 6 }}>
                  Weak to: {weaknesses.slice(0, 3).join(", ")}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: SANS, fontWeight: 600, color: C.textMute, width: 70 }}>Flippability</span>
                <div style={{ display: "flex", gap: 1, flex: 1 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 6, borderRadius: 1,
                      background: i < filledSegs ? (flipPct > 60 ? "#4a8" : flipPct > 35 ? "#ca2" : "#c44") : "#ddd6c8",
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 600, color: C.text, width: 36, textAlign: "right" }}>{flipPct}%</span>
              </div>

              {g.count > 1 && (
                <div style={{ fontSize: 10, fontFamily: SANS, color: C.textMute, marginTop: 6 }}>
                  Could flip up to <span style={{ fontWeight: 700, color: C.yea }}>{g.count} votes</span>
                  {" · "}
                  {g.group.slice(1, 4).map(m => m.n.split(" ").pop()).join(", ")}
                  {g.group.length > 4 ? ` + ${g.group.length - 4} more` : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button onClick={onGiveUp} style={{
          background: "none", border: "none", color: C.textMute, fontFamily: SANS,
          fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2,
        }}>
          Give up — accept defeat
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BATTLE INTRO (Prof. Bernie — welcome to Capitol Hill)
// ═══════════════════════════════════════════════════════════

function BattleIntro({ playerClass, playerName, votesShort, chamberLabel, onContinue, colors, fonts, radii, mob }) {
  const C = colors, SANS = fonts.sans, SERIF = fonts.serif;
  const [intro] = useState(() => pickRandom(BERNIE_INTROS)
    .replace(/\{player\}/g, playerName || "friend")
    .replace(/\{votesShort\}/g, String(votesShort))
    .replace(/\{chamber\}/g, chamberLabel)
    .replace(/\{(\d+)-(\d+)\}/g, (_, min, max) => String(randRange(+min, +max))));
  const [advice] = useState(() => pickRandom(BERNIE_ADVICE));

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: mob ? 20 : 40,
    }} className="gs-fade-in-up">
      <div style={{ fontSize: mob ? 40 : 56, marginBottom: 12 }}>🧓</div>
      <div style={{ fontSize: 11, fontFamily: SANS, fontWeight: 600, color: C.textMute, letterSpacing: 2, marginBottom: 12 }}>
        PROF. BERNIE SANDERS
      </div>

      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
        padding: mob ? "16px 20px" : "20px 28px", maxWidth: 520, marginBottom: 20,
      }}>
        <div style={{ fontSize: mob ? 14 : 16, fontFamily: SERIF, fontStyle: "italic", color: C.text, lineHeight: 1.5, marginBottom: 12 }}>
          &ldquo;{intro}&rdquo;
        </div>
        <div style={{ height: 1, background: C.border, margin: "12px 0" }} />
        <div style={{ fontSize: mob ? 12 : 13, fontFamily: SANS, color: C.textMid, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: C.text }}>Tip:</span> {advice}
        </div>
      </div>


      <button onClick={onContinue} className="gs-interactive gs-btn-primary" style={{
        padding: "12px 32px", borderRadius: radii.md, border: "none",
        background: `linear-gradient(135deg, ${C.text}, #3d3428)`,
        color: C.bg, fontFamily: SANS, fontWeight: 700, fontSize: 14, cursor: "pointer",
        transition: "all 150ms ease",
        boxShadow: "0 2px 8px rgba(44,36,24,0.15)",
      }}>
        I&apos;m ready!
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BATTLE SCREEN
// ═══════════════════════════════════════════════════════════

function BattleScreen({ target, playerClass, playerName, playerLocation, bill, onComplete, colors, fonts, radii, mob }) {
  const C = colors, SANS = fonts.sans, SERIF = fonts.serif;
  const member = target.face;
  const archetype = member.personality?.archetype || "establishment";
  const city = playerLocation.fromState ? getStateData(playerLocation.state).c[0] : "Washington";

  const [senatorHP, setSenatorHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [turnPhase, setTurnPhase] = useState("select"); // select | player_attack | effectiveness | counter | win | lose
  const [currentMove, setCurrentMove] = useState(null);
  const [effectLabel, setEffectLabel] = useState(null);
  const [dialogueText, setDialogueText] = useState(() => {
    // Context-aware openings that reference who the player is
    const loc = playerLocation;
    const classOpenings = {
      business_owner: [
        `${member.n} looks you over. "A business owner from ${loc.label}. Alright, what's this about?"`,
        `${member.n} nods. "I know your company. Sit down. You have five minutes."`,
        `${member.n} gestures to a chair. "My scheduler said a small business owner needed to see me."`,
      ],
      campaign_operative: [
        `${member.n} narrows their eyes. "I know who you are. What does the campaign want?"`,
        `${member.n} leans back. "An operative. This should be interesting. Talk."`,
        `${member.n} sighs. "Another campaign person. Fine. What's the pitch?"`,
      ],
      lobbyist: [
        `${member.n} checks their watch. "K Street, right? You've got three minutes."`,
        `${member.n} waves you in but doesn't stand. "I know your firm. What do you want?"`,
        `${member.n} raises an eyebrow. "A lobbyist. Bold of you to come in person."`,
      ],
      policy_wonk: [
        `${member.n} eyes the binder in your hands. "A policy brief? This better not be 40 pages."`,
        `${member.n} gestures to a chair. "I hear you're the one who wrote the white paper. Convince me."`,
        `${member.n} looks up. "A researcher. Good. I've been wanting to talk facts."`,
      ],
      veteran: [
        `${member.n} stands to shake your hand. "Thank you for your service. What can I do for you?"`,
        `${member.n} nods respectfully. "A veteran. I'll hear you out."`,
        `${member.n} gestures to a chair. "My father served. Sit down. You have my attention."`,
      ],
      parent: [
        `${member.n} waves you in. "You're on the PTA board, right? What's on your mind?"`,
        `${member.n} nods. "A parent from the district. These are the meetings that matter. Talk to me."`,
        `${member.n} gestures to a seat. "My staff said a community leader wanted to see me. Go ahead."`,
      ],
      party_insider: [
        `${member.n} closes the door. "I know you from the Hill. What's the play?"`,
        `${member.n} narrows their eyes. "A party insider. You're here about the vote."`,
        `${member.n} leans back. "I heard you were making the rounds. What's your angle?"`,
      ],
      student_activist: [
        `${member.n} looks surprised. "They let students in here? Alright, you have five minutes."`,
        `${member.n} sizes you up. "You're the one from the campus walkout. Sit down."`,
        `${member.n} raises an eyebrow. "A student activist. This should be interesting."`,
      ],
    };
    const generic = [
      `${member.n} eyes you skeptically. "You have five minutes."`,
      `${member.n} glances at their watch. "Make it quick."`,
      `${member.n} waves you in. "I'm listening. For now."`,
      `${member.n} doesn't look up from their desk. "Talk."`,
      `${member.n} crosses their arms. "I know why you're here. You've got three minutes."`,
      `${member.n} sighs. "My chief of staff told me not to take this meeting. Prove them wrong."`,
      `${member.n} looks up from a stack of briefing papers. "Five minutes. Clock starts now."`,
      `${member.n} motions for you to close the door. "Alright, let's hear it."`,
      `${member.n} sets down their coffee. "You're the third person today about this bill. Surprise me."`,
    ];
    const pool = [...(classOpenings[playerClass.id] || []), ...generic];
    return pickRandom(pool);
  });
  const [dialogueKey, setDialogueKey] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const battleStateRef = useRef({ usedMoves: [] });
  const pendingAction = useRef(null);
  const maxTurns = 8;

  const [availableMoves] = useState(() => drawBattleMoves(playerClass));

  const onDialogueComplete = useCallback(() => {
    if (pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      // Small pause after text finishes before next action
      setTimeout(action, 400);
    }
  }, []);

  const executeMove = useCallback((moveId) => {
    const move = MOVES[moveId];
    if (!move) return;
    setCurrentMove(move);
    setTurnPhase("player_attack");
    battleStateRef.current.usedMoves.push(moveId);

    const result = calculateDamage(move, member, playerClass, bill, battleStateRef.current, playerLocation);
    const effectiveness = getMoveEffectiveness(move, member, playerClass);
    const effLabel = getEffectivenessLabel(effectiveness);

    // Announce the move first, Pokemon-style
    const playerLabel = playerName || "You";
    const announce = `${playerLabel} used ${move.name}!`;
    setDialogueText(announce);
    setDialogueKey(k => k + 1);

    // After announcement types out, show the dialogue
    pendingAction.current = () => {
      const dialogue = getMoveDialogue(moveId, playerClass, member, city);
      const effText = result.backfire
        ? "\n\nIt backfired!"
        : effLabel ? `\n\n${effLabel.text}` : "";
      setDialogueText(dialogue + effText);
      setDialogueKey(k => k + 1);

      // When dialogue + effectiveness finishes typing, apply damage and continue
      pendingAction.current = () => {
        // Apply damage
        if (result.backfire) {
          setSenatorHP(hp => Math.min(100, hp - result.damage));
        } else {
          setSenatorHP(hp => Math.max(0, hp - result.damage));
          setShaking(true);
          setTimeout(() => setShaking(false), 500);
        }

        // After a beat, continue to next phase
        setTimeout(() => {
          // Check win
          const newSenHP = result.backfire ? Math.min(100, senatorHP - result.damage) : Math.max(0, senatorHP - result.damage);
          if (newSenHP <= 0) {
            setTurnPhase("win");
            const winLines = [
              `${member.n} pauses. "...You make a compelling case. I'll reconsider."`,
              `${member.n} exhales slowly. "Alright. You've convinced me."`,
              `${member.n} stares at the ceiling for a long moment. "...Fine. I'll change my vote."`,
              `${member.n} leans back. "I didn't expect to say this, but... you're right."`,
              `${member.n} nods reluctantly. "You've done your homework. I'm in."`,
              `${member.n} closes their binder. "Tell your people they have my vote."`,
              `${member.n} stands and extends a hand. "You made your case. I'll vote yea."`,
              `${member.n} sighs deeply. "My staff is going to kill me, but... I'm with you."`,
              `${member.n} removes their glasses. "I came in here to say no. But I can't. Not after that."`,
              `${member.n} taps the desk twice. "You win. But you owe me one."`,
              `${member.n} looks out the window. "My constituents deserve better than a no vote. I'll switch."`,
              `${member.n} shakes their head with a small smile. "Damn. Alright, you got me."`,
            ];
            setDialogueText(pickRandom(winLines));
            setDialogueKey(k => k + 1);
            pendingAction.current = null;
            return;
          }

          // Counter-attack — mix archetype counters with move-reactive counters
          setTurnPhase("counter");
          const counter = COUNTERS[archetype] || COUNTERS.establishment;
          let counterText;
          // 50% chance of a move-reactive counter instead of generic archetype counter
          const moveReactive = MOVE_COUNTERS[move.id];
          if (moveReactive && Math.random() < 0.5) {
            const bucket = effectiveness >= 1.5 ? moveReactive.strong : effectiveness <= 0.5 ? moveReactive.weak : moveReactive.neutral;
            counterText = pickRandom(bucket || moveReactive.neutral).replace(/\{name\}/g, member.n);
          } else {
            counterText = pickRandom(counter.templates).replace(/\{name\}/g, member.n);
          }
          setDialogueText(counterText);
          setDialogueKey(k => k + 1);

          const cDmg = calcCounterDamage(member);

          pendingAction.current = () => {
            setPlayerHP(hp => Math.max(0, hp - cDmg));
            setPlayerShaking(true);
            setTimeout(() => setPlayerShaking(false), 500);

            setTimeout(() => {
              const newPlayerHP = Math.max(0, playerHP - cDmg);
              const newTurn = turnCount + 1;
              setTurnCount(newTurn);

              if (newPlayerHP <= 0 || newTurn >= maxTurns) {
                setTurnPhase("lose");
                const loseLines = newPlayerHP <= 0 ? [
                  `Your argument falls apart. ${member.n} stands firm.`,
                  `${member.n} shakes their head. "I think we're done here."`,
                  `${member.n} picks up the phone. "Send in my next meeting."`,
                  `You've lost the thread. ${member.n} isn't budging.`,
                  `${member.n} stands. "I appreciate the effort, but my mind is made up."`,
                  `${member.n} closes their folder. "Better luck next time."`,
                ] : [
                  `Time's up. ${member.n} has made up their mind.`,
                  `${member.n} glances at the clock. "I have another meeting. We're done."`,
                  `An aide knocks on the door. ${member.n} shrugs. "Out of time."`,
                  `${member.n} stands and straightens their jacket. "I've heard enough."`,
                  `The conversation's over. ${member.n} wasn't persuaded.`,
                  `${member.n} walks you to the door. "Good talk. But my vote is no."`,
                ];
                setDialogueText(pickRandom(loseLines));
                setDialogueKey(k => k + 1);
                pendingAction.current = null;
              } else {
                setTurnPhase("select");
                setDialogueText("What's your next move?");
                setDialogueKey(k => k + 1);
                pendingAction.current = null;
              }
            }, 600);
          };
        }, 600);
      };
    };
  }, [member, playerClass, playerName, bill, playerLocation, city, archetype, senatorHP, playerHP, turnCount]);

  const handleBattleEnd = useCallback(() => {
    onComplete(turnPhase === "win");
  }, [turnPhase, onComplete]);

  const partyColor = member.p === "R" ? C.rep : member.p === "D" ? C.dem : C.ind;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      padding: mob ? "16px" : "24px 32px", position: "relative",
    }}>
      {/* Senator info (top) */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
        padding: mob ? "12px 16px" : "14px 20px", marginBottom: 16,
        animation: shaking ? "battle-shake 0.4s ease" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <span style={{ fontSize: mob ? 15 : 18, fontWeight: 700, color: C.text }}>{member.n}</span>
            <span style={{ fontSize: 12, color: partyColor, fontFamily: SANS, marginLeft: 8 }}>({member.p}-{member.s || member.state})</span>
          </div>
          <div style={{ fontSize: 12, fontFamily: SANS, color: C.textMid }}>
            {archetype.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: SANS, fontWeight: 600, color: C.textMute, width: 70 }}>CONVICTION</span>
          <HPBar value={senatorHP} color={C.nay} />
          <span style={{ fontSize: 13, fontFamily: SANS, fontWeight: 700, color: C.text, width: 36, textAlign: "right" }}>{senatorHP}%</span>
        </div>
        {target.count > 1 && (
          <div style={{ fontSize: 11, fontFamily: SANS, color: C.textMute, marginTop: 4 }}>
            + {target.count - 1} colleague{target.count - 1 !== 1 ? "s" : ""} watching
          </div>
        )}
      </div>


      {/* Dialogue box */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
        padding: mob ? "14px 16px" : "16px 20px", marginBottom: 16,
        minHeight: mob ? 60 : 80, flex: "0 0 auto",
      }}>
        <TypewriterText key={dialogueKey} text={dialogueText} speed={40} onComplete={onDialogueComplete} style={{
          fontSize: mob ? 13 : 15, fontFamily: SERIF, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap",
        }} />
      </div>

      {/* Win/Lose banners */}
      {turnPhase === "win" && (
        <div className="gs-fade-in-up" style={{
          textAlign: "center", padding: "16px 0",
        }}>
          <div style={{ fontSize: mob ? 22 : 28, fontWeight: 700, fontFamily: SANS, color: C.yea }}>
            CHANGED VOTE TO YEA
          </div>
          <button onClick={handleBattleEnd} className="gs-interactive gs-btn-primary" style={{
            marginTop: 12, padding: "10px 28px", borderRadius: radii.md, border: "none",
            background: `linear-gradient(135deg, ${C.text}, #3d3428)`, color: C.bg,
            fontFamily: SANS, fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(44,36,24,0.15)", transition: "all 150ms ease",
          }}>Continue</button>
        </div>
      )}

      {turnPhase === "lose" && (
        <div className="gs-fade-in-up" style={{
          textAlign: "center", padding: "16px 0",
        }}>
          <div style={{ fontSize: mob ? 22 : 28, fontWeight: 700, fontFamily: SANS, color: C.nay }}>
            YOUR ARGUMENT COLLAPSED
          </div>
          <button onClick={handleBattleEnd} className="gs-interactive gs-btn-ghost" style={{
            marginTop: 12, padding: "10px 28px", borderRadius: radii.md, border: "none",
            background: C.bg, color: C.textMid,
            fontFamily: SANS, fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 1px 4px rgba(44,36,24,0.08)", transition: "all 150ms ease",
          }}>Continue</button>
        </div>
      )}

      {/* Move selection */}
      {turnPhase === "select" && (
        <div className="gs-fade-in-up" style={{
          display: "grid",
          gridTemplateColumns: mob ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: mob ? 8 : 10,
        }}>
          {availableMoves.map(moveId => {
            const move = MOVES[moveId];
            if (!move) return null;
            const eff = getMoveEffectiveness(move, member, playerClass);
            const effLabel = eff >= 2.0 ? "SUPER" : eff >= 1.5 ? "STRONG" : eff <= 0.5 ? "WEAK" : eff < 1 ? "POOR" : "OK";
            const effColor = eff >= 1.5 ? C.yea : eff <= 0.5 ? C.nay : eff < 1 ? "#ca2" : C.textMid;

            return (
              <button
                key={moveId}
                onClick={() => executeMove(moveId)}
                style={{
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.md,
                  padding: mob ? "10px 12px" : "12px 14px", cursor: "pointer",
                  textAlign: "left", transition: "all 150ms ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: mob ? 13 : 14, fontWeight: 600, color: move.isRare ? "#d4a017" : C.text }}>{move.name}{move.isRare ? " [RARE]" : ""}</span>
                </div>
                <div style={{ fontSize: 10, color: C.textMute, fontFamily: SANS, marginBottom: 6, lineHeight: 1.3 }}>
                  {move.description}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: SANS, fontWeight: 600, color: C.textMute }}>PWR</span>
                    <div style={{ display: "flex", gap: 1 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ width: 8, height: 4, background: move.isRare ? (i < 3 ? "#d4a017" : C.borderLight) : (i < Math.round(move.power / 5) ? C.text : C.borderLight) }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontFamily: SANS, fontWeight: 600, color: move.isRare ? "#d4a017" : C.text }}>{move.isRare ? "???" : move.power}</span>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color: effColor }}>
                    vs {archetype.slice(0, 4).toUpperCase()}: {effLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Player info (bottom) */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
        padding: mob ? "10px 16px" : "12px 20px", marginTop: "auto",
        animation: playerShaking ? "battle-shake 0.4s ease" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <span style={{ fontSize: mob ? 14 : 16, fontWeight: 600, color: C.text }}>
              {playerName || "You"}
            </span>
            <span style={{ fontSize: 11, color: C.textMid, fontFamily: SANS, marginLeft: 8 }}>{playerClass.name}</span>
          </div>
          <span style={{ fontSize: 11, fontFamily: SANS, color: C.textMute }}>Turn {turnCount + 1}/{maxTurns}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: SANS, fontWeight: 600, color: C.textMute, width: 70 }}>SUPPORT</span>
          <HPBar value={playerHP} color={C.yea} />
          <span style={{ fontSize: 13, fontFamily: SANS, fontWeight: 700, color: C.text, width: 36, textAlign: "right" }}>{playerHP}%</span>
        </div>
        <div style={{ fontSize: 10, fontFamily: SANS, color: C.textMute, marginTop: 2 }}>{playerLocation.label}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BATTLE RESULT (group cascade)
// ═══════════════════════════════════════════════════════════

function BattleResult({ target, won, flippedMembers, yeaCount, newYeaCount, needed, onContinue, colors, fonts, radii, mob }) {
  const C = colors, SANS = fonts.sans, SERIF = fonts.serif;
  const nowPassing = newYeaCount >= needed;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: mob ? 20 : 40, textAlign: "center",
    }} className="gs-fade-in-up">
      {won ? (
        <>
          <div style={{ fontSize: mob ? 22 : 28, fontWeight: 700, fontFamily: SANS, color: C.yea, marginBottom: 16 }}>
            {target.face.n} changed their vote to YEA!
          </div>

          {target.count > 1 && (
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
              padding: mob ? "16px 20px" : "20px 28px", maxWidth: 400, width: "100%", marginBottom: 16,
              textAlign: "left",
            }}>
              <div style={{ fontSize: 13, fontFamily: SANS, fontWeight: 600, color: C.textMid, marginBottom: 12 }}>
                Their colleagues followed:
              </div>
              {target.group.slice(1).map(m => {
                const didFlip = flippedMembers.some(f => f.id === m.id);
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13, fontFamily: SANS }}>
                    <span style={{ color: didFlip ? C.yea : C.nay, fontWeight: 700 }}>{didFlip ? "✓" : "✗"}</span>
                    <span style={{ color: C.text }}>{m.r || "Rep."} {m.n} ({m.p}-{m.s || m.state})</span>
                    <span style={{ color: didFlip ? C.yea : C.nay, fontSize: 11, marginLeft: "auto" }}>
                      {didFlip ? "flipped" : "held firm"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: 16, fontFamily: SANS, fontWeight: 600, color: C.text, marginBottom: 8 }}>
            {flippedMembers.length} of {target.count} flipped! Vote count: {yeaCount} → {newYeaCount}
          </div>

          {nowPassing && (
            <div style={{
              fontSize: mob ? 20 : 24, fontWeight: 700, fontFamily: SANS, color: C.yea,
              marginBottom: 16, padding: "8px 20px",
              border: `2px solid ${C.yea}`, borderRadius: radii.lg,
              animation: "battle-flash 0.6s ease",
            }}>
              THE BILL NOW HAS ENOUGH VOTES!
            </div>
          )}
        </>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: mob ? 22 : 28, fontWeight: 700, fontFamily: SANS, color: C.nay, marginBottom: 8 }}>
            {target.face.n} held firm.
          </div>
          <div style={{ fontSize: 14, fontFamily: SANS, color: C.textMid }}>
            No votes flipped from this group.
          </div>
        </div>
      )}

      <button onClick={onContinue} className="gs-interactive gs-btn-ghost" style={{
        padding: "12px 32px", borderRadius: radii.md, border: "none",
        background: C.bg, color: C.textMid,
        fontFamily: SANS, fontWeight: 700, fontSize: 14, cursor: "pointer",
        boxShadow: "0 1px 4px rgba(44,36,24,0.08)", transition: "all 150ms ease",
      }}>
        Continue
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN BATTLE SYSTEM
// ═══════════════════════════════════════════════════════════

export default function BattleSystem({
  policy, chamber, chamberLabel, members, voteResults,
  yeaCount, nayCount, threshold,
  playerClass, setPlayerClass, playerName, setPlayerName, classOptions,
  onComplete, onSkip,
  colors, fonts, radii, shadows, mob, sm,
}) {
  const C = colors;
  const [phase, setPhase] = useState("trigger");
  const [battlesRemaining, setBattlesRemaining] = useState(3);
  const [allFlippedMembers, setAllFlippedMembers] = useState([]);
  const [currentYeaCount, setCurrentYeaCount] = useState(yeaCount);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [playerLocation, setPlayerLocation] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  // Get nay voters and group them
  const nayVoters = useMemo(() => {
    if (!voteResults?.r) return [];
    return voteResults.r.filter(m => !m.v && !allFlippedMembers.some(f => f.id === m.id));
  }, [voteResults, allFlippedMembers]);

  const groups = useMemo(() => groupTargets(nayVoters, policy), [nayVoters, policy]);

  const handleFight = () => {
    setPhase("class_select");
  };

  const handleClassSelected = (cls) => {
    setPlayerClass(cls);
    setPhase("intro");
  };

  const handleIntroComplete = () => setPhase("target_select");

  const handleSelectTarget = (group) => {
    setCurrentTarget(group);
    setPlayerLocation(getPlayerLocation(playerClass, group.face));
    setPhase("battle");
  };

  const handleBattleComplete = useCallback((won) => {
    const flipped = resolveGroupFlip(currentTarget, policy, won);
    const newYea = currentYeaCount + flipped.length;
    setAllFlippedMembers(prev => [...prev, ...flipped]);
    setCurrentYeaCount(newYea);
    setBattleResult({ won, flipped, prevYea: currentYeaCount, newYea });
    setBattlesRemaining(b => b - 1);
    setPhase("result");
  }, [currentTarget, policy, currentYeaCount]);

  // VP tie-breaker: if Senate is 50-50 after all battles, offer a Vance battle
  const isSenate = chamber === "sen";
  const is5050 = isSenate && currentYeaCount === threshold - 1; // 50 of 51 needed

  const handleResultContinue = () => {
    // Check if bill now passes
    if (currentYeaCount >= threshold) {
      onComplete(allFlippedMembers.map(m => m.id));
      return;
    }
    // Check battles remaining
    if (battlesRemaining <= 0) {
      if (currentYeaCount >= threshold) {
        onComplete(allFlippedMembers.map(m => m.id));
      } else if (is5050 && phase !== "vp_result") {
        // 50-50 tie — offer the VP tie-breaker
        setPhase("vp_tiebreak");
      } else {
        onComplete([]); // not enough, defeat
      }
      return;
    }
    // More battles available
    setCurrentTarget(null);
    setBattleResult(null);
    setPhase("target_select");
  };

  const VP_VANCE = useMemo(() => ({
    id: "vp_vance", n: "JD Vance", p: "R", s: "OH",
    r: "Vice President",
    personality: { archetype: "populist" },
    behavior: { party_loyalty: 0.85, ideological_rigidity: 0.7, lobby_susceptibility: 0.3, media_sensitivity: 0.4, deal_maker: 0.5 },
    electoral: { seat_safety: "safe" },
    seniority: 4,
  }), []);

  const handleVPBattle = () => {
    const vpGroup = { key: "vp_tiebreak", face: VP_VANCE, group: [VP_VANCE], count: 1, archetype: "populist", party: "R", avgFlippability: 0.3 };
    setCurrentTarget(vpGroup);
    setPlayerLocation(getPlayerLocation(playerClass, VP_VANCE));
    setPhase("battle");
  };

  const handleVPSkip = () => {
    onComplete([]); // defeat
  };

  // Override handleBattleComplete for VP battle
  const origHandleBattleComplete = handleBattleComplete;
  const handleBattleCompleteWrapped = useCallback((won) => {
    if (is5050 && battlesRemaining <= 0) {
      // This was the VP tie-breaker battle
      if (won) {
        // VP breaks the tie — bill passes
        setCurrentYeaCount(threshold);
        setBattleResult({ won: true, flipped: [VP_VANCE], prevYea: currentYeaCount, newYea: threshold });
        setPhase("vp_result");
      } else {
        setBattleResult({ won: false, flipped: [], prevYea: currentYeaCount, newYea: currentYeaCount });
        setPhase("vp_result");
      }
      return;
    }
    origHandleBattleComplete(won);
  }, [is5050, battlesRemaining, origHandleBattleComplete, VP_VANCE, currentYeaCount, threshold]);

  const handleVPResultContinue = () => {
    if (currentYeaCount >= threshold) {
      onComplete(allFlippedMembers.map(m => m.id));
    } else {
      onComplete([]);
    }
  };

  const handleGiveUp = () => onSkip();

  // Trigger phase: just a card floating over the sim, no full-screen overlay
  if (phase === "trigger") {
    return (
      <BattleTrigger
        chamberLabel={chamberLabel}
        yeaCount={yeaCount} nayCount={nayCount} needed={threshold}
        onFight={handleFight} onSkip={onSkip}
        colors={C} fonts={fonts} radii={radii} mob={mob}
      />
    );
  }

  // All other phases: full-screen overlay
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: C.bg,
      display: "flex", flexDirection: "column",
      overflow: "auto",
    }}>
      {/* Texture */}
      <div style={{ position: "absolute", inset: 0, opacity: .02, pointerEvents: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px" }} />

      {/* Header */}
      <div style={{
        padding: mob ? "10px 16px" : "14px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: fonts.sans, flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMute, letterSpacing: 2, textTransform: "uppercase" }}>
          {chamberLabel?.toUpperCase()} IN DELIBERATION: <span style={{ fontWeight: 700, color: C.text }}>{policy?.name}</span>
        </div>
        <div style={{ fontSize: 12, color: C.textMid }}>
          {playerName || "You"} <span style={{ color: C.textMute }}>·</span> {playerClass?.name || "—"}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        {phase === "class_select" && (
          <ClassSelection
            classOptions={classOptions}
            onSelect={handleClassSelected}
            playerName={playerName}
            onNameChange={setPlayerName}
            colors={C}
            fonts={fonts}
            radii={radii}
            mob={mob}
          />
        )}

        {phase === "target_select" && (
          <TargetSelection
            groups={groups}
            battlesRemaining={battlesRemaining}
            yeaCount={currentYeaCount} needed={threshold}
            onSelect={handleSelectTarget} onGiveUp={handleGiveUp}
            colors={C} fonts={fonts} radii={radii} mob={mob}
            chamberLabel={chamberLabel}
          />
        )}

        {phase === "intro" && (
          <BattleIntro
            playerClass={playerClass}
            playerName={playerName}
            votesShort={threshold - yeaCount}
            chamberLabel={chamberLabel}
            onContinue={handleIntroComplete}
            colors={C} fonts={fonts} radii={radii} mob={mob}
          />
        )}

        {phase === "battle" && currentTarget && playerLocation && (
          <BattleScreen
            target={currentTarget}
            playerClass={playerClass}
            playerName={playerName}
            playerLocation={playerLocation}
            bill={policy}
            onComplete={handleBattleCompleteWrapped}
            colors={C} fonts={fonts} radii={radii} mob={mob}
          />
        )}

        {phase === "result" && currentTarget && battleResult && (
          <BattleResult
            target={currentTarget}
            won={battleResult.won}
            flippedMembers={battleResult.flipped}
            yeaCount={battleResult.prevYea}
            newYeaCount={battleResult.newYea}
            needed={threshold}
            onContinue={handleResultContinue}
            colors={C} fonts={fonts} radii={radii} mob={mob}
          />
        )}

        {phase === "vp_tiebreak" && (
          <div className="gs-fade-in-up" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: mob ? 20 : 40,
          }}>
            <div style={{ fontSize: 11, fontFamily: fonts.sans, fontWeight: 600, color: C.textMute, letterSpacing: 2, marginBottom: 16 }}>
              SENATE TIED 50–50
            </div>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: radii.lg,
              padding: mob ? "20px 24px" : "28px 36px", maxWidth: 480, marginBottom: 24,
            }}>
              <div style={{ fontSize: mob ? 18 : 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                Vice President JD Vance
              </div>
              <div style={{ fontSize: mob ? 13 : 15, fontFamily: fonts.serif, color: C.textMid, lineHeight: 1.5, marginBottom: 16 }}>
                The Senate is deadlocked. As President of the Senate, Vice President Vance holds the tie-breaking vote. You have one shot to convince him.
              </div>
              <div style={{ fontSize: 12, fontFamily: fonts.sans, color: C.textMute }}>
                Archetype: Populist · Party: Republican · Ohio
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleVPBattle} className="gs-interactive gs-btn-primary" style={{
                padding: mob ? "10px 24px" : "12px 32px", borderRadius: radii.md, border: "none",
                background: `linear-gradient(135deg, ${C.text}, #3d3428)`, color: C.bg,
                fontFamily: fonts.sans, fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(44,36,24,0.15)", transition: "all 150ms ease",
              }}>
                Make your case
              </button>
              <button onClick={handleVPSkip} className="gs-interactive gs-btn-ghost" style={{
                padding: mob ? "10px 24px" : "12px 32px", borderRadius: radii.md, border: "none",
                background: C.bg, color: C.textMid, fontFamily: fonts.sans, fontWeight: 600,
                fontSize: 14, cursor: "pointer",
                boxShadow: "0 1px 4px rgba(44,36,24,0.08)", transition: "all 150ms ease",
              }}>
                Accept defeat
              </button>
            </div>
          </div>
        )}

        {phase === "vp_result" && battleResult && (
          <div className="gs-fade-in-up" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: mob ? 20 : 40,
          }}>
            {battleResult.won ? (
              <>
                <div style={{ fontSize: mob ? 22 : 28, fontWeight: 700, fontFamily: fonts.sans, color: C.yea, marginBottom: 12 }}>
                  VP VANCE BREAKS THE TIE
                </div>
                <div style={{ fontSize: mob ? 14 : 16, fontFamily: fonts.sans, color: C.textMid, marginBottom: 8 }}>
                  The Vice President casts the deciding vote in favor.
                </div>
                <div style={{
                  fontSize: mob ? 20 : 24, fontWeight: 700, fontFamily: fonts.sans, color: C.yea,
                  padding: "8px 20px", border: `2px solid ${C.yea}`, borderRadius: radii.lg,
                  animation: "battle-flash 0.6s ease", marginBottom: 20,
                }}>
                  THE BILL PASSES 51–50
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: mob ? 22 : 28, fontWeight: 700, fontFamily: fonts.sans, color: C.nay, marginBottom: 12 }}>
                  VP VANCE VOTES NO
                </div>
                <div style={{ fontSize: mob ? 14 : 16, fontFamily: fonts.sans, color: C.textMid, marginBottom: 20 }}>
                  The tie stands. The bill fails in the Senate.
                </div>
              </>
            )}
            <button onClick={handleVPResultContinue} className="gs-interactive gs-btn-ghost" style={{
              padding: "12px 32px", borderRadius: radii.md, border: "none",
              background: C.bg, color: C.textMid, fontFamily: fonts.sans, fontWeight: 700,
              fontSize: 14, cursor: "pointer",
              boxShadow: "0 1px 4px rgba(44,36,24,0.08)", transition: "all 150ms ease",
            }}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
