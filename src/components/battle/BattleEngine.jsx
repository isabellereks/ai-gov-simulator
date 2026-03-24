"use client";
import { useState, useCallback, useRef } from "react";
import WindowShell from "./WindowShell";
import BattleViewport from "./BattleViewport";
import BattleSidebar from "./BattleSidebar";
import {
  playHit,
  playSuperEffective,
  playNotEffective,
  playFaint,
  playVictory,
  playSelect,
} from "@/src/lib/sfx";

const MOVES = {
  policy_appeal: {
    id: "policy_appeal",
    name: "Policy Appeal",
    emoji: "📊",
    category: "logical",
    power: 15,
    typeChart: {
      hawk: 0.5,
      establishment: 1.0,
      moderate: 2.0,
      populist: 0.5,
      progressive: 1.5,
      libertarian: 1.0,
      centrist: 1.5,
    },
  },
  constitutional_argument: {
    id: "constitutional_argument",
    name: "Constitutional Argument",
    emoji: "📜",
    category: "logical",
    power: 18,
    typeChart: {
      hawk: 1.0,
      establishment: 0.5,
      moderate: 1.0,
      populist: 0.5,
      progressive: 1.0,
      libertarian: 2.0,
      centrist: 0.5,
    },
  },
  bipartisan_framing: {
    id: "bipartisan_framing",
    name: "Bipartisan Framing",
    emoji: "🕊️",
    category: "logical",
    power: 12,
    typeChart: {
      hawk: 0.5,
      establishment: 1.5,
      moderate: 2.0,
      populist: 0.5,
      progressive: 0.5,
      libertarian: 1.0,
      centrist: 2.0,
    },
  },
  constituent_pressure: {
    id: "constituent_pressure",
    name: "Constituent Pressure",
    emoji: "📢",
    category: "pressure",
    power: 16,
    typeChart: {
      hawk: 1.0,
      establishment: 1.5,
      moderate: 1.5,
      populist: 2.0,
      progressive: 0.5,
      libertarian: 0.5,
      centrist: 1.5,
    },
  },
  media_pressure: {
    id: "media_pressure",
    name: "Media Pressure",
    emoji: "📰",
    category: "pressure",
    power: 20,
    typeChart: {
      hawk: 1.5,
      establishment: 1.0,
      moderate: 0.5,
      populist: 1.5,
      progressive: 1.0,
      libertarian: 1.5,
      centrist: 1.0,
    },
  },
  primary_threat: {
    id: "primary_threat",
    name: "Primary Threat",
    emoji: "⚠️",
    category: "pressure",
    power: 22,
    typeChart: {
      hawk: 1.0,
      establishment: 0.5,
      moderate: 1.5,
      populist: 1.0,
      progressive: 1.0,
      libertarian: 1.0,
      centrist: 2.0,
    },
  },
  horse_trade: {
    id: "horse_trade",
    name: "Horse Trade",
    emoji: "🤝",
    category: "transactional",
    power: 14,
    typeChart: {
      hawk: 0.5,
      establishment: 2.0,
      moderate: 1.5,
      populist: 0.5,
      progressive: 0.5,
      libertarian: 0.5,
      centrist: 1.5,
    },
  },
  donor_leverage: {
    id: "donor_leverage",
    name: "Donor Leverage",
    emoji: "💰",
    category: "transactional",
    power: 18,
    typeChart: {
      hawk: 1.0,
      establishment: 1.5,
      moderate: 1.0,
      populist: 2.0,
      progressive: 0.5,
      libertarian: 1.0,
      centrist: 1.0,
    },
  },
  local_impact: {
    id: "local_impact",
    name: "Local Impact",
    emoji: "🏠",
    category: "emotional",
    power: 17,
    typeChart: {
      hawk: 0.5,
      establishment: 1.0,
      moderate: 1.5,
      populist: 2.0,
      progressive: 1.0,
      libertarian: 0.5,
      centrist: 1.5,
    },
  },
  blackmail: {
    id: "blackmail",
    name: "Blackmail",
    emoji: "🗂️",
    category: "pressure",
    power: 0,
    typeChart: {
      hawk: 1.5,
      establishment: 2.0,
      moderate: 0.5,
      populist: 0.5,
      progressive: 0.3,
      libertarian: 1.5,
      centrist: 1.0,
    },
    isRare: true,
  },
  personal_appeal: {
    id: "personal_appeal",
    name: "Personal Appeal",
    emoji: "💬",
    category: "emotional",
    power: 13,
    typeChart: {
      hawk: 0.5,
      establishment: 0.5,
      moderate: 2.0,
      populist: 1.5,
      progressive: 2.0,
      libertarian: 0.3,
      centrist: 1.5,
    },
  },
  moral_authority: {
    id: "moral_authority",
    name: "Moral Authority",
    emoji: "⚖️",
    category: "emotional",
    power: 16,
    typeChart: {
      hawk: 1.0,
      establishment: 0.5,
      moderate: 1.5,
      populist: 1.0,
      progressive: 2.0,
      libertarian: 0.5,
      centrist: 1.0,
    },
  },
  backroom_deal: {
    id: "backroom_deal",
    name: "Backroom Deal",
    emoji: "🚪",
    category: "transactional",
    power: 20,
    typeChart: {
      hawk: 1.5,
      establishment: 2.0,
      moderate: 0.5,
      populist: 0.3,
      progressive: 0.3,
      libertarian: 0.5,
      centrist: 1.0,
    },
  },
};

const COUNTERS = {
  hawk: {
    names: ["National Security Card", "Defense Posture", "Threat Briefing", "Hawkish Rebuttal"],
    power: 12,
    templates: [
      '{name} stiffens. "This weakens America."',
      '{name} leans forward. "Let\'s talk about what our adversaries do while we debate this."',
      "{name} crosses their arms. \"I've been briefed on threats you can't imagine.\"",
      '{name} slams a fist on the desk. "Our enemies are watching this vote."',
      '{name} shakes their head. "You clearly haven\'t read the latest intelligence assessment."',
      '{name} narrows their eyes. "I won\'t be the one who left America vulnerable."',
      '{name} pulls out a classified folder. "You want to talk security? Let\'s talk security."',
      "{name} leans back. \"I've sat in the Situation Room. You haven't.\"",
    ],
  },
  establishment: {
    names: ["Procedural Block", "Seniority Pull", "Committee Leverage", "Institutional Memory"],
    power: 10,
    templates: [
      '{name} shakes their head. "This will die in conference committee."',
      '{name} checks their watch. "I have a markup in 20 minutes."',
      '{name} leans back. "I\'ve been here long enough to know how this plays out."',
      '{name} sighs. "I\'ve seen a hundred bills like this. They all stall."',
      "{name} adjusts their reading glasses. \"The whip count isn't there. I've checked.\"",
      '{name} waves a hand. "Come back when you have the chairman\'s support."',
      '{name} flips through a binder. "My staff already flagged twelve problems with this."',
      '{name} looks past you at the door. "My next meeting is with someone who has actual votes."',
    ],
  },
  moderate: {
    names: ["Both Sides", "District Calculus", "Swing Vote Dodge", "Bipartisan Shield"],
    power: 8,
    templates: [
      '{name} sighs. "My district is split on this."',
      '{name} folds their arms. "Come back when both sides have signed off."',
      '{name} glances at polling numbers on their desk. "It\'s 48-48 back home."',
      '{name} rubs their temples. "I can\'t afford to alienate either side."',
      '{name} shakes their head slowly. "I need bipartisan cover for this."',
      "{name} looks pained. \"You're asking me to take a risk I can't afford.\"",
      '{name} pulls up a map of their district. "See these precincts? They\'ll decide my future."',
      '{name} stares out the window. "Every vote I take is a calculated risk."',
    ],
  },
  populist: {
    names: ["Elitist Framing", "Base Appeal", "Outsider Card", "Anti-Establishment Rant"],
    power: 14,
    templates: [
      '{name} laughs. "That\'s what the DC crowd wants. Not real Americans."',
      '{name} scoffs. "I didn\'t come to Washington to rubber-stamp what lobbyists want."',
      '{name} points at you. "You sound just like every other swamp creature in this town."',
      '{name} leans forward. "My voters didn\'t send me here to play nice with insiders."',
      "{name} grins. \"Go ahead, tell me more about what the 'experts' think.\"",
      '{name} shakes their head. "The forgotten men and women of this country disagree with you."',
      '{name} stands up. "I answer to the people, not to whoever sent you."',
      "{name} crosses their arms. \"Washington wants this. That's exactly why I'm against it.\"",
    ],
  },
  progressive: {
    names: ["Not Enough", "Systemic Critique", "Justice Demand", "Movement Pressure"],
    power: 9,
    templates: [
      '{name} shakes their head. "This is a half-measure."',
      '{name} leans back. "Until you address root causes, I can\'t support this."',
      '{name} looks unimpressed. "Where\'s the equity analysis? Who benefits?"',
      "{name} frowns. \"My community has been promised 'incremental progress' for fifty years.\"",
      '{name} slides a report across the desk. "This doesn\'t even begin to address the disparities."',
      '{name} raises an eyebrow. "Is this really the best we can do? Because it shouldn\'t be."',
      '{name} crosses their arms. "The movement didn\'t put me here to settle for crumbs."',
      '{name} taps the desk. "Go bigger or don\'t bother."',
    ],
  },
  libertarian: {
    names: ["Government Overreach", "Constitutional Objection", "Liberty Card", "Spending Veto"],
    power: 11,
    templates: [
      '{name} raises an eyebrow. "Another bill, another expansion of federal power."',
      '{name} pulls out a pocket Constitution. "Show me where this is authorized."',
      '{name} leans back. "The government that governs least, governs best."',
      '{name} shakes their head. "This is exactly the kind of overreach the founders warned about."',
      '{name} scoffs. "You want to spend how much? With whose money?"',
      '{name} waves dismissively. "The free market will solve this faster than any bureaucrat."',
      '{name} narrows their eyes. "Every regulation has an unseen cost. Have you calculated yours?"',
      '{name} crosses their arms. "I didn\'t come here to grow the government."',
    ],
  },
  centrist: {
    names: ["Political Risk", "Poll Check", "Consultant Call", "Independent Calculus"],
    power: 7,
    templates: [
      '{name} winces. "I can\'t sell this back home."',
      '{name} hesitates. "If I vote for this, I lose the independents."',
      '{name} checks their phone. "My consultants are telling me to stay away from this."',
      '{name} sighs. "The focus groups were... not encouraging."',
      '{name} shakes their head. "I need something I can put in a mailer without scaring anyone."',
      "{name} looks at their approval rating on the screen. \"I'm at 47. I can't risk it.\"",
      '{name} drums their fingers. "What does the polling say in my suburbs?"',
      '{name} frowns. "My opponent will use this in an attack ad. I guarantee it."',
    ],
  },
};

const CATEGORY_COLORS = {
  logical: "#4a8",
  pressure: "#c44",
  transactional: "#d4a017",
  emotional: "#6b5b95",
};

const ARCHETYPE_DEFAULT_SENIORITY = {
  hawk: 18,
  establishment: 20,
  moderate: 8,
  populist: 6,
  progressive: 8,
  libertarian: 10,
  centrist: 6,
};

// ─── CLASS-BASED INTRO DIALOGUE (trainer meets the rep/senator) ───
const CLASS_INTROS = {
  business_owner: [
    '{name} looks you over. "A business owner from {location}. Alright, what\'s this about?"',
    '{name} nods. "I know your company. Sit down. You have five minutes."',
    '{name} gestures to a chair. "My scheduler said a small business owner needed to see me."',
  ],
  campaign_operative: [
    '{name} narrows their eyes. "I know who you are. What does the campaign want?"',
    '{name} leans back. "An operative. This should be interesting. Talk."',
    '{name} sighs. "Another campaign person. Fine. What\'s the pitch?"',
  ],
  lobbyist: [
    '{name} checks their watch. "K Street, right? You\'ve got three minutes."',
    '{name} waves you in but doesn\'t stand. "I know your firm. What do you want?"',
    '{name} raises an eyebrow. "A lobbyist. Bold of you to come in person."',
  ],
  policy_wonk: [
    '{name} eyes the binder in your hands. "A policy brief? This better not be 40 pages."',
    '{name} gestures to a chair. "I hear you\'re the one who wrote the white paper. Convince me."',
    '{name} looks up. "A researcher. Good. I\'ve been wanting to talk facts."',
  ],
  veteran: [
    '{name} stands to shake your hand. "Thank you for your service. What can I do for you?"',
    '{name} nods respectfully. "A veteran. I\'ll hear you out."',
    '{name} gestures to a chair. "My father served. Sit down. You have my attention."',
  ],
  parent: [
    "{name} waves you in. \"You're on the PTA board, right? What's on your mind?\"",
    '{name} nods. "A parent from the district. These are the meetings that matter. Talk to me."',
    '{name} gestures to a seat. "My staff said a community leader wanted to see me. Go ahead."',
  ],
  party_insider: [
    '{name} closes the door. "I know you from the Hill. What\'s the play?"',
    '{name} narrows their eyes. "A party insider. You\'re here about the vote."',
    '{name} leans back. "I heard you were making the rounds. What\'s your angle?"',
  ],
  student_activist: [
    '{name} looks surprised. "They let students in here? Alright, you have five minutes."',
    '{name} sizes you up. "You\'re the one from the campus walkout. Sit down."',
    '{name} raises an eyebrow. "A student activist. This should be interesting."',
  ],
};

const GENERIC_INTROS = [
  '{name} eyes you skeptically. "You have five minutes."',
  '{name} glances at their watch. "Make it quick."',
  '{name} waves you in. "I\'m listening. For now."',
  '{name} doesn\'t look up from their desk. "Talk."',
  "{name} crosses their arms. \"I know why you're here. You've got three minutes.\"",
  '{name} sighs. "My chief of staff told me not to take this meeting. Prove them wrong."',
  '{name} looks up from a stack of briefing papers. "Five minutes. Clock starts now."',
  '{name} motions for you to close the door. "Alright, let\'s hear it."',
  '{name} sets down their coffee. "You\'re the third person today about this bill. Surprise me."',
];

function buildIntroMessage(member, playerClass, playerLocation) {
  const classPool = CLASS_INTROS[playerClass?.id] || [];
  const pool = [...classPool, ...GENERIC_INTROS];
  let msg = pickRandom(pool);
  const loc = playerLocation?.label || "Washington, DC";
  return msg.replace(/\{name\}/g, member.n).replace(/\{location\}/g, loc);
}

// ─── MOVE-REACTIVE COUNTERS ───
const MOVE_COUNTERS = {
  policy_appeal: {
    strong: [
      '{name} fumbles with their papers. "Those numbers... I hadn\'t seen those."',
      '{name} pauses mid-rebuttal. "Wait, that\'s the actual CBO score?"',
      '{name} frowns at the data. "My staff didn\'t brief me on this."',
    ],
    neutral: [
      '{name} waves a hand. "Numbers can say anything you want them to."',
      '{name} shrugs. "I\'ve seen studies that say the opposite."',
      '{name} squints. "Interesting data, but data doesn\'t vote. People do."',
    ],
    weak: [
      '{name} laughs. "You think a CBO score is going to change my mind?"',
      '{name} pushes the briefing back. "I don\'t need a lecture on policy."',
      '{name} rolls their eyes. "I\'ve heard this pitch from better wonks than you."',
    ],
  },
  constituent_pressure: {
    strong: [
      '{name} glances nervously toward the door. "How many calls did my office get?"',
      '{name} loosens their collar. "I... hadn\'t realized the polling was that clear."',
      '{name} shifts uncomfortably. "My town halls have been rough lately."',
    ],
    neutral: [
      '{name} shakes their head. "Polls come and go. Convictions don\'t."',
      '{name} scoffs. "I know my district better than any survey."',
      '{name} leans back. "My voters understand nuance, even if you don\'t."',
    ],
    weak: [
      '{name} laughs it off. "My seat is safe and we both know it."',
      '{name} stands firm. "My voters sent me here to lead, not to follow polls."',
      '{name} looks amused. "Constituent pressure? On me? Really?"',
    ],
  },
  media_pressure: {
    strong: [
      '{name} goes quiet. "...Who have you been talking to at the press corps?"',
      '{name} visibly tenses. "If that story runs, I need to get ahead of it."',
      '{name} picks up their phone. "Hold on, I need to call my comms director."',
    ],
    neutral: [
      '{name} shrugs. "The media writes what they want regardless."',
      '{name} waves it off. "I\'ve been in worse headlines."',
      '{name} crosses their arms. "Media pressure doesn\'t work on me."',
    ],
    weak: [
      '{name} laughs openly. "The press? They love me."',
      '{name} grins. "Go ahead, run the story. It\'ll only help me."',
      '{name} is unfazed. "Controversy is free advertising in my district."',
    ],
  },
  primary_threat: {
    strong: [
      '{name} clenches their jaw. "...Who\'s talking about a primary?"',
      '{name} goes pale. "My margin was thin last time. I know that."',
      '{name} glances at their aide. "Get me the latest internal polling."',
    ],
    neutral: [
      '{name} narrows their eyes. "Threats don\'t usually work on me."',
      '{name} waves a hand. "There\'s always someone threatening a primary."',
      '{name} shakes their head. "I\'ve survived primaries before."',
    ],
    weak: [
      '{name} laughs. "Primary me? With what army?"',
      '{name} leans back confidently. "My war chest could fund three campaigns."',
      '{name} is supremely unbothered. "I won my primary by 30 points."',
    ],
  },
  horse_trade: {
    strong: [
      '{name} pauses. "...What kind of support are we talking about?"',
      '{name} leans forward, interested. "Now you\'re speaking my language."',
      '{name} opens their calendar. "Let\'s talk details."',
    ],
    neutral: [
      '{name} crosses their arms. "I don\'t trade votes. Usually."',
      '{name} looks skeptical. "Can you actually deliver on that?"',
      '{name} shakes their head. "I need more than promises."',
    ],
    weak: [
      '{name} laughs. "You think I can be bought for an earmark?"',
      '{name} stands up. "I don\'t make deals in back hallways."',
      '{name} pushes back. "My principles aren\'t for sale."',
    ],
  },
  donor_leverage: {
    strong: [
      '{name} checks their phone. "...My fundraising team just texted me about this."',
      '{name} gets quiet. "The bundlers have been calling. I know."',
      '{name} sighs. "Campaign finance is the real boss in this town."',
    ],
    neutral: [
      '{name} frowns. "I\'m not a puppet for donors."',
      '{name} waves it off. "I have plenty of funding sources."',
      '{name} crosses their arms. "Donor pressure is part of the job."',
    ],
    weak: [
      '{name} laughs. "I self-funded last time. Try again."',
      '{name} shakes their head. "My small-dollar donors are all I need."',
      '{name} is unmoved. "I won\'t be bought."',
    ],
  },
  local_impact: {
    strong: [
      '{name} goes quiet. "...I know that family you\'re talking about."',
      '{name} looks away. "That factory closing hit my district hard. I know."',
      '{name} swallows. "My own nephew is dealing with the same thing."',
    ],
    neutral: [
      '{name} nods. "I hear these stories every week. But one story isn\'t policy."',
      '{name} folds their arms. "Anecdotes aren\'t arguments."',
      '{name} looks sympathetic but firm. "I care. I just disagree on the solution."',
    ],
    weak: [
      '{name} shrugs. "Sad, but that doesn\'t change the policy math."',
      '{name} is unmoved. "I\'ve heard worse. Much worse."',
      '{name} taps the desk. "Personal stories are nice. But I deal in facts."',
    ],
  },
  constitutional_argument: {
    strong: [
      '{name} opens the pocket Constitution on their desk. "...Hm. You might have a point."',
      '{name} hesitates. "The precedent there is stronger than I realized."',
      '{name} looks troubled. "I took an oath. If the Constitution says..."',
    ],
    neutral: [
      '{name} shakes their head. "Constitutional scholars disagree on this all the time."',
      '{name} frowns. "That\'s one interpretation."',
      '{name} tilts their head. "Interesting argument. Not sure it holds up."',
    ],
    weak: [
      '{name} waves dismissively. "Don\'t lecture me on the Constitution."',
      '{name} pulls out their own brief. "My counsel disagrees entirely."',
      '{name} rolls their eyes. "Everyone thinks they\'re a constitutional scholar."',
    ],
  },
  bipartisan_framing: {
    strong: [
      '{name} pauses. "...Both governors signed it? Really?"',
      '{name} looks interested. "Bipartisan wins do boost approval ratings."',
      '{name} considers it. "If the other side is on board, that changes things."',
    ],
    neutral: [
      '{name} shakes their head. "Bipartisan in name only."',
      '{name} scoffs. "The other side is playing games. This isn\'t real compromise."',
      '{name} looks skeptical. "I\'ve seen bipartisan deals fall apart before."',
    ],
    weak: [
      '{name} laughs. "Bipartisan? My base doesn\'t want bipartisan."',
      '{name} waves it off. "Reaching across the aisle gets you primaried where I\'m from."',
      '{name} scoffs. "Don\'t insult me with both-sides nonsense."',
    ],
  },
  personal_appeal: {
    strong: [
      '{name} looks away, blinking. "...You remind me of my daughter."',
      '{name} is quiet for a long moment. "Nobody\'s talked to me like a person in months."',
      '{name} softens visibly. "I... appreciate you being straight with me."',
    ],
    neutral: [
      '{name} sighs. "I appreciate the sincerity. But sincerity doesn\'t pass bills."',
      "{name} looks conflicted. \"This isn't about feelings. It's about votes.\"",
      '{name} pauses. "Nice speech. But I\'ve made commitments."',
    ],
    weak: [
      '{name} hardens. "Don\'t try to emotionally manipulate me."',
      '{name} crosses their arms. "I didn\'t get here by being sentimental."',
      '{name} is stone-faced. "Feelings don\'t factor into my calculus."',
    ],
  },
  moral_authority: {
    strong: [
      '{name} is silent for a long time. "...History does judge harshly."',
      '{name} stares at the desk. "My grandkids are going to ask about this. I know."',
      '{name} looks troubled. "You\'re not wrong about the moral dimension."',
    ],
    neutral: [
      '{name} folds their arms. "Morality is subjective. Policy isn\'t."',
      '{name} frowns. "Don\'t confuse disagreement with immorality."',
      '{name} shakes their head. "I have my own moral compass, thank you."',
    ],
    weak: [
      '{name} laughs dryly. "Don\'t lecture me on morality from the cheap seats."',
      '{name} is unmoved. "Moral authority? From you? Please."',
      '{name} waves dismissively. "Spare me the sermon."',
    ],
  },
  backroom_deal: {
    strong: [
      '{name} closes the door. "...Tell me more about that committee assignment."',
      '{name} lowers their voice. "If this stays between us..."',
      '{name} looks around, then leans in. "How soon can you deliver?"',
    ],
    neutral: [
      '{name} raises an eyebrow. "You\'re going to have to sweeten that deal."',
      '{name} frowns. "I\'ve heard promises like that before."',
      '{name} shakes their head. "You don\'t have the pull to deliver that."',
    ],
    weak: [
      '{name} stands. "I\'m not cutting deals in the dark."',
      "{name} looks disgusted. \"That's exactly what's wrong with this town.\"",
      '{name} pushes back. "My integrity isn\'t for sale. Not for any price."',
    ],
  },
};

// ─── ARCHETYPE-FLAVORED WIN LINES ───
const ARCHETYPE_WIN_LINES = {
  hawk: [
    '{name} straightens up. "I still have reservations about national security, but... you\'ve made your case."',
    '{name} nods stiffly. "For the sake of the troops, I\'ll reconsider."',
    '{name} sighs. "If this strengthens America... fine. I\'ll switch my vote."',
  ],
  establishment: [
    '{name} adjusts their glasses. "You\'ve done your homework. I can work with this."',
    '{name} checks their calendar. "Alright. But I want a seat at the table when this goes to conference."',
    '{name} nods slowly. "You\'ve been around long enough to know this means you owe me one."',
  ],
  moderate: [
    '{name} looks relieved. "Finally — now I have cover to vote yes."',
    "{name} exhales. \"If I can tell my district it's bipartisan, I'm in.\"",
    '{name} nods. "My polling just needed one good reason. You gave me one."',
  ],
  populist: [
    '{name} points at you. "My voters might not like it, but the numbers don\'t lie."',
    "{name} laughs. \"Alright, you're not as bad as the usual DC crowd. I'm in.\"",
    '{name} slaps the desk. "You fight like a real person. Fine. You got my vote."',
  ],
  progressive: [
    "{name} leans forward. \"It's not enough — but it's a start. I'll vote yes.\"",
    "{name} nods reluctantly. \"Progress is progress, even when it's incremental. I'm in.\"",
    '{name} sighs. "My base will push for more, but you\'ve moved the needle. Fine."',
  ],
  libertarian: [
    '{name} raises an eyebrow. "I still think government is the problem, but... this bill isn\'t."',
    "{name} smirks. \"You've convinced me this doesn't expand federal power. Barely. I'll vote yes.\"",
    '{name} tucks the Constitution back in their pocket. "Alright. Liberty isn\'t threatened here."',
  ],
  centrist: [
    "{name} checks the polls one more time. \"The independents won't punish me for this. I'm in.\"",
    '{name} nods cautiously. "My consultants agree — this is a safe yes. You have my vote."',
    '{name} relaxes. "I was looking for a way to vote yes. You gave me one."',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function drawBattleMoves(playerClass) {
  const core = [...playerClass.coreMoves];
  const pool = [...playerClass.randomPool].sort(() => Math.random() - 0.5);
  const drawn = [...core, ...pool.slice(0, 2)];
  if (Math.random() < 0.15 && drawn.length > 4) {
    drawn[drawn.length - 1] = "blackmail";
  }
  return drawn;
}

function getMoveEffectiveness(move, member, playerClass) {
  const archetype = member.personality?.archetype || "establishment";
  let mult = move.typeChart[archetype] || 1.0;
  if (playerClass.strong.includes(move.category)) mult *= 1.4;
  if (playerClass.weak.includes(move.category)) mult *= 0.6;
  return mult;
}

function getEffectivenessLabel(multiplier) {
  if (multiplier >= 2.0) return { text: "It's super effective!", color: "#d4a017", type: "super" };
  if (multiplier >= 1.5) return { text: "It's very effective!", color: "#88b04b", type: "strong" };
  if (multiplier <= 0.5) return { text: "It's not very effective...", color: "#888", type: "weak" };
  if (multiplier < 0) return { text: "It backfired!", color: "#c44", type: "backfire" };
  return null;
}

function calculateDamage(move, member, playerClass, bill, battleState, playerLocation) {
  let damage = move.isRare ? Math.floor(Math.random() * 31) + 5 : move.power;
  const archetype = member.personality?.archetype || "establishment";
  damage *= move.typeChart[archetype] || 1.0;
  if (playerClass.strong.includes(move.category)) damage *= 1.4;
  if (playerClass.weak.includes(move.category)) damage *= 0.6;
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
  if (move.id === "local_impact" && battleState.usedMoves.includes("constituent_pressure"))
    damage *= 1.4;
  if (move.id === "donor_leverage" && bill?.affectedIndustries && member.lobbying?.top_industries) {
    const overlap = member.lobbying.top_industries.some((ind) =>
      bill.affectedIndustries.some((bi) => ind.toLowerCase().includes(bi.toLowerCase())),
    );
    if (overlap) damage *= 1.5;
  }
  const usedMoves = battleState.usedMoves;
  const lastMoveId = usedMoves[usedMoves.length - 1];
  if (lastMoveId) {
    const lastCat = MOVES[lastMoveId]?.category;
    if (lastCat === move.category) damage *= 0.75;
    else damage *= 1.1;
  }
  if (usedMoves.length >= 2) {
    const last3 = [...usedMoves.slice(-2), move.id];
    const cats = new Set(last3.map((id) => MOVES[id]?.category));
    if (cats.size >= 3) damage *= 1.2;
  }
  if (
    playerLocation?.fromState &&
    (move.id === "constituent_pressure" || move.id === "local_impact")
  )
    damage *= 1.2;
  if (!playerLocation?.fromState && (move.id === "policy_appeal" || move.id === "donor_leverage"))
    damage *= 1.15;
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

// ═══════════════════════════════════════════════════════════
// BATTLE ENGINE COMPONENT
// ═══════════════════════════════════════════════════════════

export default function BattleEngine({
  target,
  playerClass,
  playerName,
  playerLocation,
  bill,
  onComplete,
}) {
  const member = target.face;
  const archetype = member.personality?.archetype || "establishment";
  const maxTurns = 8;

  const [senatorHP, setSenatorHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [turnPhase, setTurnPhase] = useState("opening"); // opening | select | player_attack | counter | win | lose
  const [turnCount, setTurnCount] = useState(0);
  const [messages, setMessages] = useState(() => {
    return [buildIntroMessage(member, playerClass, playerLocation)];
  });
  const [effectivenessPopup, setEffectivenessPopup] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const battleStateRef = useRef({ usedMoves: [] });

  const [availableMoves] = useState(() => drawBattleMoves(playerClass));

  const senatorHPRef = useRef(100);
  const playerHPRef = useRef(100);

  // ─── Move Grid Component ───
  const moveGrid =
    turnPhase === "select" ? (
      <div className="pokemac-move-grid">
        {availableMoves.map((moveId) => {
          const move = MOVES[moveId];
          if (!move) return null;
          const eff = getMoveEffectiveness(move, member, playerClass);
          const effLabel = eff >= 2.0 ? "S.EFF" : eff >= 1.5 ? "EFF!" : eff <= 0.5 ? "WEAK" : "";
          const catColor = CATEGORY_COLORS[move.category] || "#a89e8c";

          return (
            <button
              key={moveId}
              className="pokemac-move-btn"
              onClick={() => executeMove(moveId)}
              style={{ borderColor: catColor }}
            >
              <div className="pokemac-move-name">
                <span>
                  {move.emoji} {move.name}
                </span>
                {move.isRare && <span className="pokemac-move-rare">RARE</span>}
              </div>
              <div className="pokemac-move-meta">
                <span className="pokemac-move-cat" style={{ color: catColor }}>
                  {move.category}
                </span>
                <span className="pokemac-move-pwr">PWR {move.isRare ? "???" : move.power}</span>
                {effLabel && (
                  <span
                    className="pokemac-move-eff"
                    style={{ color: eff >= 1.5 ? "#4a8" : "#c44" }}
                  >
                    {effLabel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    ) : null;

  // ─── Execute a move ───
  const executeMove = useCallback(
    (moveId) => {
      const move = MOVES[moveId];
      if (!move) return;

      playSelect();
      setTurnPhase("player_attack");
      battleStateRef.current.usedMoves.push(moveId);

      const result = calculateDamage(
        move,
        member,
        playerClass,
        bill,
        battleStateRef.current,
        playerLocation,
      );
      const effectiveness = getMoveEffectiveness(move, member, playerClass);
      const effLabel = getEffectivenessLabel(effectiveness);

      // Log it
      setBattleLog((log) => [...log, { text: `You used ${move.name}!`, type: "player" }]);

      // Announce
      setMessages([`You used ${move.name}!`]);

      // After announcement: show damage
      setTimeout(() => {
        // Apply damage
        const actualDmg = result.backfire ? result.damage : result.damage;
        const newSenHP = result.backfire
          ? Math.min(100, senatorHPRef.current - actualDmg)
          : Math.max(0, senatorHPRef.current - actualDmg);
        senatorHPRef.current = newSenHP;
        setSenatorHP(newSenHP);

        // Hit flash + SFX
        if (!result.backfire) {
          if (effectiveness >= 1.5) {
            playSuperEffective();
            setEffectivenessPopup(effLabel);
            setBattleLog((log) => [...log, { text: effLabel.text, type: "effective" }]);
          } else if (effectiveness <= 0.5) {
            playNotEffective();
            setEffectivenessPopup(effLabel);
            setBattleLog((log) => [...log, { text: effLabel.text, type: "weak" }]);
          } else {
            playHit();
          }
        } else {
          setBattleLog((log) => [...log, { text: "It backfired!", type: "weak" }]);
        }

        // Clear effectiveness popup
        setTimeout(() => setEffectivenessPopup(null), 1500);

        // Check win
        setTimeout(() => {
          if (newSenHP <= 0) {
            setTurnPhase("win");
            playVictory();
            const genericWinLines = [
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
            const archetypeWins = ARCHETYPE_WIN_LINES[archetype];
            let winLine;
            if (archetypeWins && Math.random() < 0.5) {
              winLine = pickRandom(archetypeWins).replace(/\{name\}/g, member.n);
            } else {
              winLine = pickRandom(genericWinLines);
            }
            setMessages([winLine]);
            setBattleLog((log) => [
              ...log,
              { text: `${member.n} changed their vote!`, type: "effective" },
            ]);
            return;
          }

          // Counter-attack — mix archetype counters with move-reactive counters
          setTurnPhase("counter");
          const lastMove =
            battleStateRef.current.usedMoves[battleStateRef.current.usedMoves.length - 1];
          const counter = COUNTERS[archetype] || COUNTERS.establishment;
          let counterText;
          // Build a combined pool — all move-reactive lines for this move + archetype lines
          const moveReactive = MOVE_COUNTERS[lastMove];
          let pool = [...counter.templates];
          if (moveReactive) {
            const bucket =
              effectiveness >= 1.5
                ? moveReactive.strong
                : effectiveness <= 0.5
                  ? moveReactive.weak
                  : moveReactive.neutral;
            pool = [...pool, ...(bucket || moveReactive.neutral)];
          }
          // Filter out recently used lines to avoid repetition
          const recent = battleStateRef.current.usedCounterLines || [];
          const fresh = pool.filter((t) => !recent.includes(t));
          const chosen = fresh.length > 0 ? pickRandom(fresh) : pickRandom(pool);
          if (!battleStateRef.current.usedCounterLines)
            battleStateRef.current.usedCounterLines = [];
          battleStateRef.current.usedCounterLines.push(chosen);
          if (battleStateRef.current.usedCounterLines.length > 4)
            battleStateRef.current.usedCounterLines.shift();
          counterText = chosen.replace(/\{name\}/g, member.n);
          setMessages([counterText]);
          setBattleLog((log) => [
            ...log,
            { text: `${member.n} used ${pickRandom(counter.names)}!`, type: "enemy" },
          ]);

          const cDmg = calcCounterDamage(member);

          setTimeout(() => {
            const newPlayerHP = Math.max(0, playerHPRef.current - cDmg);
            playerHPRef.current = newPlayerHP;
            setPlayerHP(newPlayerHP);
            playHit();

            setTimeout(() => {
              const newTurn = turnCount + 1;
              setTurnCount(newTurn);

              if (newPlayerHP <= 0 || newTurn >= maxTurns) {
                setTurnPhase("lose");
                playFaint();
                const hpLoseLines = [
                  `Your argument falls apart. ${member.n} stands firm.`,
                  `${member.n} shakes their head. "I think we're done here."`,
                  `${member.n} picks up the phone. "Send in my next meeting."`,
                  `You've lost the thread. ${member.n} isn't budging.`,
                  `${member.n} stands. "I appreciate the effort, but my mind is made up."`,
                  `${member.n} closes their folder. "Better luck next time."`,
                ];
                const timeLoseLines = [
                  `Time's up. ${member.n} has made up their mind.`,
                  `${member.n} glances at the clock. "I have another meeting. We're done."`,
                  `An aide knocks on the door. ${member.n} shrugs. "Out of time."`,
                  `${member.n} stands and straightens their jacket. "I've heard enough."`,
                  `The conversation's over. ${member.n} wasn't persuaded.`,
                  `${member.n} walks you to the door. "Good talk. But my vote is no."`,
                ];
                setMessages([pickRandom(newPlayerHP <= 0 ? hpLoseLines : timeLoseLines)]);
                setBattleLog((log) => [...log, { text: "You lost the argument.", type: "weak" }]);
              } else {
                setTurnPhase("select");
                setMessages(["What's your next move?"]);
              }
            }, 1000);
          }, 2200);
        }, 1000);
      }, 1000);
    },
    [member, playerClass, bill, playerLocation, archetype, turnCount],
  );

  // ─── Handle battle end ───
  const handleEnd = useCallback(() => {
    onComplete(turnPhase === "win");
  }, [turnPhase, onComplete]);

  // ─── Dialogue complete → advance to select on opening ───
  const onDialogueComplete = useCallback(() => {
    if (turnPhase === "opening") {
      setTurnPhase("select");
      setMessages(["What will you do?"]);
    }
  }, [turnPhase]);

  const seniority = member.seniority || ARCHETYPE_DEFAULT_SENIORITY[archetype] || 10;

  return (
    <WindowShell title={`${member.n} — BATTLE`}>
      <BattleViewport
        enemyName={member.n}
        enemyParty={member.p}
        enemyArchetype={archetype}
        enemyLevel={seniority}
        enemyHp={senatorHP}
        enemyMaxHp={100}
        playerName={playerName || "You"}
        playerClass={playerClass.id}
        playerLevel={playerClass.level || 10}
        playerHp={playerHP}
        playerMaxHp={100}
        messages={messages}
        onDialogueComplete={onDialogueComplete}
        moveGrid={moveGrid}
      >
        {/* Effectiveness popup */}
        {effectivenessPopup && (
          <div className="pokemac-effectiveness" style={{ color: effectivenessPopup.color }}>
            {effectivenessPopup.text}
          </div>
        )}
      </BattleViewport>

      <BattleSidebar
        trainerName={playerName || "You"}
        trainerClass={playerClass.name}
        trainerDetail={playerClass.intro}
        billName={bill?.name || "Unknown Bill"}
        battleLog={battleLog}
        intel={{
          type: archetype,
          party: member.p === "R" ? "Republican" : member.p === "D" ? "Democrat" : "Independent",
          seniority: `${seniority} years`,
          seat: member.electoral?.seat_safety || "Unknown",
        }}
        turnPhase={turnPhase}
        onEndBattle={handleEnd}
        target={target}
      />
    </WindowShell>
  );
}
