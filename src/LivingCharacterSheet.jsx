import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Flame, Heart, Sparkles, FlaskConical, Dices, Search, Swords,
  Shield, Brain, RefreshCw, X, Plus, Minus, ChevronRight, Info,
  Zap, Eye, Timer, RotateCcw, BookOpen, Target, Wind
} from "lucide-react";

/* ============================================================
   PALETTE & TYPE — "Field Notes: Detective's Memo Book"
   kraft cover: #CDBC94  paper card: #E7DCC0  ink: #292520
   FN orange: #C9501A  olive: #55663B  record red: #8F2B22
   ============================================================ */
const C = {
  ink: "#CDBC94", panel: "#E7DCC0", panel2: "#DBCFAD", line: "#4A4030",
  brass: "#C9501A", brassDim: "#8F3E18", verd: "#55663B", ember: "#8F2B22",
  parch: "#292520", dim: "#57503C", dimmer: "#83795D",
};
const F = {
  disp: "'Jost', 'Futura', 'Century Gothic', sans-serif",
  body: "'Jost', 'Futura', 'Century Gothic', sans-serif",
  mono: "'Courier Prime', 'Courier New', monospace",
};

/* ============================================================
   CHARACTER DATA MODEL — Thomask (from the shared template)
   ============================================================ */
const CHAR = {
  name: "Thomask Hon'bluray",
  build: "Gnome Investigator (Empiricist) 14 · NG · Loki",
  player: "Eddie",
  hpMax: 160,
  ac: { total: 24, touch: 17, flat: 20 },
  saves: { fort: 9, ref: 13, will: 12 },
  init: 2,
  speed: 20,
  abilities: { STR: 10, DEX: 18, CON: 16, INT: 33, WIS: 11, CHA: 15 },
  intMod: 11,
  bab: { melee: 13, ranged: 17 },
  bombs: { max: 19, dice: 7, bonus: 11, type: "fire" },
  inspiration: { max: 15, die: "1d8 (roll twice)" },
  studied: { atk: 6, dmg: 6, strikeDice: 6, rounds: 11 },
  featsTalents: [
    "Studied Combat", "Studied Strike", "Ranged Study (Bombs)", "Precise Bombs",
    "Snake Style", "Tenacious Inspiration", "Amazing Inspiration",
    "Expanded Inspiration", "Inspirational Expertise", "Empathy", "Quick Runner's Shirt",
  ],
  gear: [
    ["Quick Runner's Shirt", "1/day swift: extra move action"],
    ["Bombchucker", "+10 ft bomb range, needs free hand"],
    ["Poisoner's Gloves", "Apply poison as swift action"],
    ["Boots of Striding & Springing", "+10 ft speed"],
    ["Belt of Dex +2 · Ring of Prot +2 · Cloak of Res +1", ""],
    ["Handy Haversack", "Alchemy lab, infiltration kit, manacles"],
  ],
};

/* Mutable base numbers — level up changes these */
const BASE = { level: 14, hpMax: 160, melee: 13, ranged: 17 };

/* Structured skills: total = ability mod + ranks + (class skill +3 if ranks>0) + misc.
   Seeded to match the Google Sheet totals — edit ranks/misc in the Sheet tab to correct any. */
/* Ability modifiers exactly as the Google Sheet uses them (DEX reads +2 there — matches AC & Init) */
const MODS = { STR: 0, DEX: 2, CON: 3, INT: 11, WIS: 0, CHA: 2 };
const abilityModOf = (ab) => MODS[ab];
const DEFAULT_SKILLS = [
  { name: "Perception", ability: "INT", ranks: 14, cls: true, misc: 7, note: "Ceaseless Observation: INT" },
  { name: "Sense Motive", ability: "INT", ranks: 14, cls: true, misc: 13, note: "Skill Focus +6, Empathy" },
  { name: "Disguise", ability: "INT", ranks: 13, cls: true, misc: 10, note: "Clever Wordplay: INT · Stalker's Mask" },
  { name: "Craft (Alchemy)", ability: "INT", ranks: 13, cls: true, misc: 12 },
  { name: "Stealth", ability: "DEX", ranks: 13, cls: true, misc: 5 },
  { name: "Bluff", ability: "CHA", ranks: 13, cls: true, misc: 5, note: "Sound Mimicry +4 situational" },
  { name: "Diplomacy", ability: "INT", ranks: 13, cls: true, misc: 0, note: "Ceaseless Observation: INT" },
  { name: "Intimidate", ability: "INT", ranks: 6, cls: true, misc: 6, note: "Ceaseless Observation: INT" },
  { name: "Disable Device", ability: "INT", ranks: 6, cls: true, misc: 2, note: "+6 vs traps (Trapfinding)" },
  { name: "Knowledge (Arcana)", ability: "INT", ranks: 13, cls: true, misc: 0 },
  { name: "Knowledge (Dungeoneering)", ability: "INT", ranks: 6, cls: true, misc: 0 },
  { name: "Knowledge (Engineering)", ability: "INT", ranks: 2, cls: true, misc: 0 },
  { name: "Knowledge (Geography)", ability: "INT", ranks: 1, cls: true, misc: -3, note: "sheet total 12 — verify" },
  { name: "Knowledge (History)", ability: "INT", ranks: 2, cls: true, misc: 0 },
  { name: "Knowledge (Local)", ability: "INT", ranks: 13, cls: true, misc: 0 },
  { name: "Knowledge (Nature)", ability: "INT", ranks: 8, cls: true, misc: 0 },
  { name: "Knowledge (Nobility)", ability: "INT", ranks: 2, cls: true, misc: 0 },
  { name: "Knowledge (Planes)", ability: "INT", ranks: 13, cls: true, misc: 0 },
  { name: "Knowledge (Religion)", ability: "INT", ranks: 13, cls: true, misc: 0 },
  { name: "Acrobatics", ability: "DEX", ranks: 1, cls: true, misc: 10 },
  { name: "Appraise", ability: "INT", ranks: 1, cls: true, misc: 0 },
  { name: "Climb", ability: "STR", ranks: 1, cls: true, misc: 0 },
  { name: "Escape Artist", ability: "DEX", ranks: 3, cls: true, misc: 0 },
  { name: "Fly", ability: "DEX", ranks: 1, cls: false, misc: 2 },
  { name: "Handle Animal", ability: "CHA", ranks: 0, cls: false, misc: 1, tr: true },
  { name: "Heal", ability: "WIS", ranks: 0, cls: true, misc: 0 },
  { name: "Linguistics", ability: "INT", ranks: 10, cls: true, misc: 0, tr: true },
  { name: "Perform (Orator)", ability: "CHA", ranks: 4, cls: true, misc: 3 },
  { name: "Perform (Sing)", ability: "CHA", ranks: 1, cls: true, misc: 3 },
  { name: "Ride", ability: "DEX", ranks: 0, cls: false, misc: 0 },
  { name: "Sleight of Hand", ability: "DEX", ranks: 3, cls: true, misc: 0, tr: true },
  { name: "Spellcraft", ability: "INT", ranks: 1, cls: true, misc: -5, tr: true, note: "sheet total 10 — verify" },
  { name: "Survival", ability: "WIS", ranks: 2, cls: false, misc: 0 },
  { name: "Swim", ability: "STR", ranks: 2, cls: false, misc: 0 },
  { name: "Use Magic Device", ability: "INT", ranks: 5, cls: true, misc: 0, tr: true, note: "Ceaseless Observation: INT" },
];
const skillTotal = (s) => abilityModOf(s.ability) + s.ranks + (s.cls && s.ranks > 0 ? 3 : 0) + s.misc;
const skillLines = (s) => [
  { label: `${s.ability} modifier`, val: abilityModOf(s.ability) },
  { label: "Ranks", val: s.ranks },
  ...(s.cls && s.ranks > 0 ? [{ label: "Class skill", val: 3 }] : []),
  ...(s.misc ? [{ label: "Misc (gear, feats, traits)", val: s.misc }] : []),
];

/* Which Knowledge identifies which creature type (PF1 monster ID rules) */
const CREATURE_KNOWLEDGE = [
  ["Aberrations · Oozes", "Knowledge (Dungeoneering)"],
  ["Animals · Fey · Plants · Monstrous Humanoids", "Knowledge (Nature)"],
  ["Constructs · Dragons · Magical Beasts", "Knowledge (Arcana)"],
  ["Humanoids", "Knowledge (Local)"],
  ["Outsiders (demons, devils, angels)", "Knowledge (Planes)"],
  ["Undead", "Knowledge (Religion)"],
];

/* Complete abilities catalog — imported from the sheet, organized as sections */
const FEAT_SECTIONS = [
  ["Feats", [
    ["Snake Style", "Immediate action: Sense Motive (+41) replaces AC vs one attack. Eats next turn's swift."],
    ["Ranged Study (Bombs)", "Studied Combat & Studied Strike work with bombs."],
    ["Weapon Focus (Bombs)", "+1 attack with bombs (already in your +17)."],
    ["Point-Blank Shot", "+1 attack & damage on ranged within 30 ft (in your +17)."],
    ["Skill Focus (Sense Motive)", "+6 Sense Motive (in your +41)."],
    ["Alertness", "+2 Perception & Sense Motive (in totals)."],
    ["Extra Inspiration", "+2 uses in your daily pool."],
    ["Persuasive", "+2 Diplomacy & Intimidate (in totals)."],
    ["Extra Talent → Inspirational Expertise", "Free action: ID a foe with a Knowledge check → all allies +4 ATK vs it."],
  ]],
  ["Talents & Discoveries", [
    ["Bomber", "Bombs: 7d6+11 fire, 19/day, 30 ft, splash 13."],
    ["Acid Bombs", "Your bombs can deal acid damage instead of fire."],
    ["Remote Bombs", "Spend 2 bomb uses: place a bomb, detonate at will from anywhere. Button in Combat tab."],
    ["Precise Bombs", "Choose 5 squares exempted from your bomb's splash."],
    ["Amazing Inspiration", "Inspiration die is d8."],
    ["Tenacious Inspiration", "Roll inspiration twice, take higher — automatic in the roller."],
    ["Expanded Inspiration", "Free inspiration on Diplomacy, Heal, Perception, Profession, Sense Motive."],
    ["Empathy", "Sense Motive roll twice; spend 1 inspiration → Detect Thoughts."],
    ["Investigator's Certainty", "Twice/day: roll Sense Motive four times, take best."],
  ]],
  ["Class Features", [
    ["Studied Combat", "Move action: +6 ATK/DMG vs one foe, 11 rounds."],
    ["Studied Strike", "Free on hit: +6d6, ends Studied Combat. Precision — never multiplied on crits."],
    ["Poison Immunity", "You are immune to poison."],
    ["Unfailing Logic", "+4 insight on Will saves vs illusions; spend 1 inspiration to use INT (+11) instead of WIS on the save."],
    ["Ceaseless Observation", "INT instead of the usual ability on Perception, Diplomacy, Intimidate, Disable Device, UMD (in totals)."],
    ["Mutagen", "1 hr to brew: +4 to one physical ability, −2 paired mental, 10 min/level."],
    ["Trapfinding & Trap Sense", "+6 Perception/Disable vs traps, can disarm magic traps, +4 Reflex & dodge AC vs traps."],
    ["Keen Recollection", "All Knowledge skills usable untrained."],
    ["Swift Alchemy", "Craft alchemical items in half time; apply poison as a move (gloves make it swift)."],
    ["Alchemy", "ID potions with Craft (Alchemy) like detect magic (hold 1 round). Extract save DC = 21 + extract level."],
  ]],
  ["Gnome Racial Traits", [
    ["Low-Light Vision", "See twice as far in dim light."],
    ["Illusion Resistance", "+2 saves vs illusion (stacks with Unfailing Logic's +4)."],
    ["Gnome Magic", "+1 DC on illusion spells you cast."],
    ["Gift of Tongues", "+1 Bluff/Diplomacy, extra language per rank in Linguistics."],
    ["Sound Mimicry", "+4 Bluff to mimic voices and sounds."],
    ["Small Size", "+1 AC & attack, −1 CMB/CMD, +4 Stealth (in totals)."],
    ["Obsessive", "+2 on one Craft or Profession (Alchemy)."],
  ]],
  ["Traits & Flaws", [
    ["Clever Wordplay", "Disguise uses INT (in your +37)."],
    ["Firebug", "+1 attack with bombs and alchemical weapons (in your +17)."],
    ["Hot-Blooded (flaw)", "Roleplay: quick to anger."],
    ["Claustrophobia (flaw)", "Roleplay: fears tight spaces."],
  ]],
];

/* Prepared extracts (from the Spellcasting tab). used = consumed today */
const START_EXTRACTS = {
  1: { slots: 8, list: ["Enlarge Person", "True Strike", "Bomber's Eye", "Targeted Bomb Admixture", "Comprehend Languages"] },
  2: { slots: 8, list: ["Bear's Endurance", "Blistering Invective", "Enshroud Thoughts", "See Invisibility", "Investigative Mind"] },
  3: { slots: 7, list: ["Bouncing Bomb Admixture", "Displacement", "Channel Vigor", "Cure Serious Wounds", "Hypercognition"] },
  4: { slots: 6, list: ["Adjustable Polymorph", "Enchantment Foil", "Fire Shield", "Invisibility, Greater"] },
  5: { slots: 4, list: ["Ancestral Memory", "Dream"] },
};

/* ============================================================
   EFFECTS CATALOG — modifiers hook into the roll engine
   ============================================================ */
const EFFECTS = {
  "Studied Combat": { kind: "buff", rounds: 11, atk: 6, dmg: 6, note: "vs studied target", hasTarget: true },
  "Channel Vigor (Limbs)": { kind: "buff", rounds: 14, atk: 1, ac: 1, extraAttack: true, note: "Haste effect" },
  "Channel Vigor (Spirit)": { kind: "buff", rounds: 14, note: "+6 Will, +6 Intimidate/Bluff" },
  "Displacement": { kind: "buff", rounds: 14, note: "50% miss chance" },
  "Bomber's Eye": { kind: "buff", rounds: 14, bombAtk: 1, note: "+10 ft throw range" },
  "True Strike": { kind: "buff", rounds: 1, atk: 20, oneShot: true, note: "next attack only" },
  "Targeted Bomb Admixture": { kind: "buff", rounds: 14, nextBomb: true, bombDmg: 11, note: "next bomb: single target, no splash, +11 dmg" },
  "Bouncing Bomb Admixture": { kind: "buff", rounds: 140, nextBomb: true, note: "next bomb bounces to a new target on a miss" },
  "Invisibility, Greater": { kind: "buff", rounds: 14, note: "foes flat-footed vs you" },
  "Bear's Endurance": { kind: "buff", rounds: 140, note: "+4 CON (+28 HP feel)" },
  "Heroism": { kind: "buff", rounds: 140, atk: 2, note: "+2 saves & skills too" },
  "Mutagen": { kind: "buff", rounds: 140, note: "+4 one physical ability, −2 paired mental · 1 hr to brew" },
  "Inspirational Expertise": { kind: "party", rounds: 99, note: "ALL allies +4 to hit the studied foe", hasTarget: true },
  "Shaken": { kind: "cond", rounds: 3, atk: -2, note: "-2 saves, skills" },
  "Sickened": { kind: "cond", rounds: 3, atk: -2, dmg: -2, note: "-2 saves, skills" },
  "Fatigued": { kind: "cond", rounds: 99, note: "no run/charge, -2 STR/DEX" },
  "Entangled": { kind: "cond", rounds: 99, atk: -2, note: "-4 DEX, half speed" },
  "Nauseated": { kind: "cond", rounds: 3, note: "MOVE ACTION ONLY" },
  "Slowed": { kind: "cond", rounds: 3, atk: -1, ac: -1, note: "1 action/turn" },
  "Confused": { kind: "cond", rounds: 4, note: "d% each turn: 1-25 act normal · 26-50 babble · 51-75 hurt self · 76-100 attack nearest" },
  "Paralyzed": { kind: "cond", rounds: 3, note: "HELPLESS — no actions, coup de grace risk" },
  "Stunned": { kind: "cond", rounds: 1, note: "drop items, NO actions, -2 AC, DEX denied" },
  "Dazed": { kind: "cond", rounds: 1, note: "no actions (can still defend)" },
  "Staggered": { kind: "cond", rounds: 3, note: "only 1 move OR standard per turn" },
  "Blinded": { kind: "cond", rounds: 3, note: "-2 AC, DEX denied, your attacks 50% miss" },
  "Dazzled": { kind: "cond", rounds: 3, atk: -1, note: "-1 Perception too" },
  "Frightened": { kind: "cond", rounds: 3, atk: -2, note: "-2 saves/skills, must flee source" },
  "Panicked": { kind: "cond", rounds: 3, note: "drop items and FLEE; cower if cornered" },
  "Prone": { kind: "cond", rounds: 99, atk: -4, note: "-4 melee atk; +4 AC vs ranged, -4 vs melee; move to stand" },
  "Grappled": { kind: "cond", rounds: 99, atk: -2, note: "-4 DEX, no move, no 2-hand actions" },
  "Deafened": { kind: "cond", rounds: 99, note: "-4 init, 20% verbal spell failure" },
};
const ADDABLE_BUFFS = ["Studied Combat", "Inspirational Expertise", "Channel Vigor (Limbs)", "Channel Vigor (Spirit)", "Heroism", "Mutagen"];
const ADDABLE_CONDS = ["Shaken", "Frightened", "Panicked", "Sickened", "Nauseated", "Fatigued", "Entangled", "Grappled", "Prone", "Blinded", "Dazzled", "Deafened", "Confused", "Paralyzed", "Stunned", "Dazed", "Staggered", "Slowed"];

/* ============================================================
   ROLL ENGINE
   ============================================================ */
const d = (sides) => Math.floor(Math.random() * sides) + 1;
const rollDice = (n, sides) => Array.from({ length: n }, () => d(sides));

function bombAttackLines(effects) {
  const lines = [{ label: "Base ranged attack", val: BASE.ranged }];
  effects.forEach((e) => {
    const def = EFFECTS[e.name] || {};
    const v = (def.atk || 0) + (def.bombAtk || 0);
    if (v) lines.push({ label: e.name, val: v, live: true });
  });
  return lines;
}
function bombDamageLines(effects, useStrike) {
  const lines = [
    { label: `Bomb ${CHAR.bombs.dice}d6 ${CHAR.bombs.type}`, dice: [CHAR.bombs.dice, 6] },
    { label: "Bomb bonus (INT)", val: CHAR.bombs.bonus },
  ];
  effects.forEach((e) => {
    const def = EFFECTS[e.name] || {};
    if (def.dmg) lines.push({ label: e.name, val: def.dmg, live: true });
    if (def.bombDmg) lines.push({ label: e.name, val: def.bombDmg, live: true });
  });
  if (useStrike) lines.push({ label: "Studied Strike", dice: [CHAR.studied.strikeDice, 6], live: true });
  return lines;
}
function meleeAttackLines(effects) {
  const lines = [{ label: "Base melee attack", val: BASE.melee }];
  effects.forEach((e) => {
    const def = EFFECTS[e.name] || {};
    if (def.atk) lines.push({ label: e.name, val: def.atk, live: true });
  });
  return lines;
}
const ROLL_DEFS = {
  bombAtk: { title: "Bomb Attack", die: 20, lines: bombAttackLines, consumes: "bomb", chain: "bombDmg", icon: Flame, critRange: 20, critMult: 2, note: "Splash: 13 dmg adjacent · Precise Bombs exempts 5 squares" },
  bombDmg: { title: "Bomb Damage", die: null, lines: (fx) => bombDamageLines(fx, false), strikeOption: true, icon: Flame, note: "Acid Bombs discovery: can deal acid instead of fire" },
  meleeAtk: { title: "Rapier Attack", die: 20, lines: meleeAttackLines, chain: "meleeDmg", icon: Swords, critRange: 18, critMult: 2 },
  meleeDmg: { title: "Rapier Damage", die: null, lines: () => [{ label: "Rapier 1d4", dice: [1, 4] }], strikeOption: true, icon: Swords },
  daggerAtk: { title: "Dagger +1 Attack", die: 20, lines: (fx) => [{ label: "Base melee attack", val: BASE.melee }, { label: "Enhancement +1", val: 1 }, ...meleeAttackLines(fx).slice(1)], chain: "daggerDmg", icon: Swords, critRange: 19, critMult: 2 },
  daggerDmg: { title: "Dagger +1 Damage", die: null, lines: () => [{ label: "Dagger 1d4", dice: [1, 4] }, { label: "Enhancement", val: 1 }], strikeOption: true, icon: Swords, note: "On hit: can sicken the target" },
  xbowAtk: { title: "Heavy Crossbow (MW) Attack", die: 20, lines: (fx) => [{ label: "BAB + DEX + size", val: 13 }, { label: "Masterwork", val: 1 }, ...meleeAttackLines(fx).slice(1)], chain: "xbowDmg", icon: Target, critRange: 19, critMult: 2, note: "+1 more within 30 ft (Point-Blank) · range 120 ft · acid/poison bolts available" },
  xbowDmg: { title: "Heavy Crossbow Damage", die: null, lines: () => [{ label: "Crossbow 1d8", dice: [1, 8] }, { label: "Bonus", val: 1 }], strikeOption: true, icon: Target, note: "Acid bolt: +1d6 acid · Poison bolt: apply poison" },
  cmb: { title: "Combat Maneuver", die: 20, lines: () => [{ label: "CMB", val: 9 }], icon: Swords, note: "Your CMD is 25" },
  studiedStrike: { title: "Studied Strike", die: null, lines: () => [{ label: "Studied Strike", dice: [CHAR.studied.strikeDice, 6], live: true }], icon: Target, note: "Free action on a hit vs your studied foe · precision, not multiplied on crits · ends Studied Combat", endsStudied: true },
  init: { title: "Initiative", die: 20, lines: () => [{ label: "Initiative", val: CHAR.init }], icon: Zap },
  fort: { title: "Fortitude Save", die: 20, lines: () => [{ label: "Fort", val: CHAR.saves.fort }], icon: Shield },
  ref: { title: "Reflex Save", die: 20, lines: () => [{ label: "Reflex", val: CHAR.saves.ref }], icon: Shield },
  will: { title: "Will Save", die: 20, lines: () => [{ label: "Will", val: CHAR.saves.will }], icon: Shield },
  snakeStyle: { title: "Snake Style — Sense Motive as AC", die: 20, lines: () => [{ label: "Sense Motive (replaces AC vs one attack)", val: 41 }], icon: Shield, defense: true, note: "Immediate action — uses next turn's swift" },
};
/* Inspiration economy — investigator base: Knowledge/Linguistics/Spellcraft free;
   Expanded Inspiration adds Diplomacy, Heal, Perception, Profession, Sense Motive free.
   Other skills: 1 use. Attacks & saves: 2 uses (base rule). */
const FREE_INSP_SKILLS = ["Knowledge", "Linguistics", "Spellcraft", "Diplomacy", "Heal", "Perception", "Profession", "Sense Motive"];
function inspCost(key) {
  if (key === "snakeStyle") return 0;
  if (key.startsWith("skill:")) {
    const n = key.slice(6);
    return FREE_INSP_SKILLS.some((f) => n.startsWith(f)) ? 0 : 1;
  }
  if (["bombAtk", "meleeAtk", "daggerAtk", "fort", "ref", "will"].includes(key)) return 2;
  return 1;
}

/* Crit: multiply weapon dice + static bonuses; precision (Studied Strike) is NEVER multiplied */
function applyCrit(lines, mult) {
  return lines.map((l) =>
    l.dice
      ? { ...l, dice: [l.dice[0] * mult, l.dice[1]], label: `${l.label} ×${mult}` }
      : { ...l, val: l.val * mult, label: `${l.label} ×${mult}` }
  );
}

const SEQUENCES = [
  { name: "Standard Bomb Turn", steps: ["bombAtk"], desc: "Studied Combat (move) → Bomb (standard) → Strike on hit" },
  { name: "Haste Double Bomb", steps: ["bombAtk", "bombAtk"], desc: "Requires Channel Vigor (Limbs) — two bombs" },
  { name: "True Strike Nuke", steps: ["bombAtk"], desc: "Drink True Strike first (swift-ish) → guaranteed delivery" },
];

/* ============================================================
   ANTHROPIC API HELPERS
   ============================================================ */
async function callClaude(prompt, useSearch = false) {
  const endpoint = (typeof window !== "undefined" && window.__CLAUDE_ENDPOINT__) || "https://api.anthropic.com/v1/messages";
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  };
  if (useSearch) body.tools = [{
    type: "web_search_20250305",
    name: "web_search",
    allowed_domains: ["d20pfsrd.com", "www.d20pfsrd.com"],
    max_uses: 3,
  }];
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "API error");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

function stateSummary(st) {
  const fx = st.effects.map((e) => `${e.name} (${e.rounds} rds${e.target ? ", vs " + e.target : ""})`).join("; ") || "none";
  const ex = Object.entries(st.extracts).map(([lv, o]) =>
    `L${lv}: ${o.slots - o.used.length}/${o.slots} slots, available: ${o.list.filter((s) => !o.used.includes(s)).join(", ") || "none prepared"}`
  ).join(" | ");
  return `HP ${st.hp}/${BASE.hpMax} · Bombs ${st.bombs}/${CHAR.bombs.max} · Inspiration ${st.insp}/${CHAR.inspiration.max}
Quick Runner's Shirt: ${st.shirtUsed ? "USED" : "available"} · Round ${st.round}
Active effects: ${fx}
Extracts: ${ex}`;
}

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
const Panel = ({ children, style }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, ...style }}>{children}</div>
);
const Label = ({ children, color = C.dim }) => (
  <div style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color }}>{children}</div>
);
const Btn = ({ children, onClick, tone = "ghost", small, disabled, style }) => {
  const tones = {
    ghost: { background: "transparent", border: `1px solid ${C.line}`, color: C.parch },
    brass: { background: C.brass, border: `1px solid ${C.brass}`, color: C.ink, fontWeight: 700 },
    ember: { background: "transparent", border: `1px solid ${C.ember}`, color: C.ember },
    verd: { background: "transparent", border: `1px solid ${C.verd}`, color: C.verd },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...tones[tone], borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1, padding: small ? "4px 10px" : "8px 14px",
      fontFamily: F.body, fontSize: small ? 12 : 13, ...style,
    }}>{children}</button>
  );
};

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {
  const [hp, setHp] = useState(CHAR.hpMax);
  const [bombs, setBombs] = useState(CHAR.bombs.max);
  const [insp, setInsp] = useState(CHAR.inspiration.max);
  const [shirtUsed, setShirtUsed] = useState(false);
  const [round, setRound] = useState(1);
  const [effects, setEffects] = useState([]);
  const [extracts, setExtracts] = useState(() =>
    Object.fromEntries(Object.entries(START_EXTRACTS).map(([lv, o]) => [lv, { ...o, used: [] }]))
  );
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [base, setBase] = useState({ level: 14, hpMax: 160, melee: 13, ranged: 17 });
  const [levelUp, setLevelUp] = useState(null); // { hpGain, applied, text, loading }
  const [inspAuto, setInspAuto] = useState(true);
  const [hpEdit, setHpEdit] = useState(null); // { amount: "" }
  const [knowPick, setKnowPick] = useState(false); // Inspirational Expertise creature-type picker
  useEffect(() => { Object.assign(BASE, base); }, [base]);

  /* resolve roll defs — skills and Snake Style read the live skill model */
  const smTotal = () => skillTotal(skills.find((s) => s.name === "Sense Motive"));
  const getDef = (key) => {
    if (key === "snakeStyle") {
      return { ...ROLL_DEFS.snakeStyle, lines: () => [{ label: "Sense Motive (replaces AC vs one attack)", val: smTotal() }] };
    }
    if (key && key.startsWith("skill:")) {
      const sk = skills.find((s) => s.name === key.slice(6));
      if (sk) return { title: sk.name, die: 20, lines: () => skillLines(sk), icon: Eye };
    }
    return ROLL_DEFS[key];
  };
  const [priority, setPriority] = useState("Damage");
  const [tab, setTab] = useState("combat");
  const [roll, setRoll] = useState(null);        // active roll builder {defKey, custom:[], useStrike}
  const [result, setResult] = useState(null);    // result card
  const [seq, setSeq] = useState(null);          // {name, steps, i}
  const [optText, setOptText] = useState("");
  const [optLoading, setOptLoading] = useState(false);
  const [optStale, setOptStale] = useState(true);
  const [query, setQuery] = useState("");
  const [searchRes, setSearchRes] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef(null);

  const st = { hp, bombs, insp, shirtUsed, round, effects, extracts };

  /* ---------- persistence ---------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("thomask_state_v2");
        if (r?.value) {
          const s = JSON.parse(r.value);
          setHp(s.hp); setBombs(s.bombs); setInsp(s.insp); setShirtUsed(s.shirtUsed);
          setRound(s.round); setEffects(s.effects); setExtracts(s.extracts);
          setRecent(s.recent || []);
          if (s.skills && s.skillsV === 2) {
            const saved = s.skills;
            const merged = [...saved, ...DEFAULT_SKILLS.filter((d) => !saved.some((x) => x.name === d.name))];
            setSkills(merged);
          } // older saves keep the fresh sheet-imported defaults
          if (s.base) setBase(s.base);
          if (typeof s.inspAuto === "boolean") setInspAuto(s.inspAuto);
        }
      } catch (e) { /* first run — nothing saved yet */ }
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      window.storage.set("thomask_state_v2", JSON.stringify({ ...st, skills, skillsV: 2, base, inspAuto, recent })).catch(() => {});
    }, 600);
    setOptStale(true);
  }, [hp, bombs, insp, shirtUsed, round, effects, extracts, skills, base, inspAuto, recent, loaded]);

  /* ---------- optimizer ---------- */
  const runOptimizer = useCallback(async () => {
    setOptLoading(true); setOptStale(false);
    try {
      const prompt = `You are a Pathfinder 1e turn optimizer for this exact character. Be concise — read at the table.

CHARACTER: ${CHAR.name}, Gnome Investigator (Empiricist) level ${BASE.level}, NG
Key numbers: ranged atk +${BASE.ranged} (bombs ${CHAR.bombs.dice}d6+${CHAR.bombs.bonus} fire, ${CHAR.bombs.max}/day), melee +${BASE.melee}, Studied Combat +${CHAR.studied.atk}/+${CHAR.studied.dmg} (move action, ${CHAR.studied.rounds} rds), Studied Strike +${CHAR.studied.strikeDice}d6 (free on hit, ends SC). Feats/talents: ${CHAR.featsTalents.join(", ")}. Key gear: Quick Runner's Shirt (1/day swift = extra move), Bombchucker (+10ft), Poisoner's Gloves.
Defense: Snake Style — immediate action, Sense Motive (+41) replaces AC vs one attack (consumes next turn's swift; don't recommend swift actions if it was used since last turn). Inspiration (2d8 take higher): free on Perception/Sense Motive/Diplomacy/Knowledge, 1 use other skills, 2 uses on attacks/saves.
Also: POISON IMMUNE. Remote Bombs (2 uses = 1 placed bomb, detonate at will). Acid Bombs (bombs can be acid). Precise Bombs (exempt 5 splash squares). MW heavy crossbow +14 (19-20/x2, acid/poison bolts). Mutagen available (+4 physical, 1hr brew). Unfailing Logic: +4 Will vs illusion, 1 inspiration to save with INT. Trap Sense +4. Sniping: re-Stealth at -20 after attacking. Inspirational Expertise (free action, Knowledge check to ID a foe → whole party +4 to hit it): if "Inspirational Expertise" is already in active effects, that buff is up — don't re-recommend it; if it's NOT up and allies are attacking this foe, recommend it as the free action.

CURRENT STATE:
${stateSummary(st)}

PRIORITY MODE: ${priority}

Recommend this turn's optimal FREE / SWIFT / MOVE / STANDARD actions in that labeled format, one line each, with a one-line "why". If Channel Vigor (Limbs) is active, include the extra attack. Show expected avg damage. Flag anything easy to forget. Max ~120 words.`;
      const text = await callClaude(prompt);
      setOptText(text || "No recommendation returned — try recalculating.");
    } catch (e) {
      setOptText("Optimizer call failed. Check connection and hit Recalculate.");
    }
    setOptLoading(false);
  }, [hp, bombs, insp, shirtUsed, round, effects, extracts, priority]);

  /* ---------- wiki search ---------- */
  const pills = [
    ...new Set([
      ...recent.slice(0, 4),
      "Studied Combat", "Studied Strike", "Channel Vigor", "Bouncing Bomb Admixture",
      "Snake Style", "Precise Bombs", "Splash weapon rules",
    ]),
  ].slice(0, 9);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setQuery(q); setSearchLoading(true); setSearchRes("");
    setRecent((r) => [q, ...r.filter((x) => x !== q)].slice(0, 8));
    try {
      const text = await callClaude(
        `Search for the Pathfinder 1e rule: "${q}". All results come from d20pfsrd.com — the authoritative source for this game.
Summarize the rule accurately and concisely (under 150 words). Where a number depends on the character, annotate with THIS character's values: ${CHAR.name}, Investigator (Empiricist) 14, INT mod +11, Studied Combat +6/+6, Studied Strike +6d6, bombs ${CHAR.bombs.dice}d6+${CHAR.bombs.bonus}, Sense Motive +41, immune to poison. End with the d20pfsrd URL.`,
        true
      );
      setSearchRes(text || "The search returned nothing — try different wording.");
    } catch (e) {
      setSearchRes(`Search failed: ${e.message}. Try again in a moment.`);
    }
    setSearchLoading(false);
  };

  /* ---------- state mutations ---------- */
  const addEffect = (name, target) => {
    const def = EFFECTS[name];
    setEffects((fx) => [...fx.filter((e) => e.name !== name), { name, rounds: def.rounds, target }]);
  };
  const removeEffect = (name) => setEffects((fx) => fx.filter((e) => e.name !== name));
  const tickEffect = (name) =>
    setEffects((fx) => fx.map((e) => (e.name === name ? { ...e, rounds: e.rounds - 1 } : e)).filter((e) => e.rounds > 0));
  const endTurn = () => {
    setEffects((fx) => fx.map((e) => (EFFECTS[e.name]?.kind === "party" ? e : { ...e, rounds: e.rounds - 1 })).filter((e) => e.rounds > 0));
    setRound((r) => r + 1);
  };
  const drinkExtract = (lv, name) => {
    setExtracts((ex) => {
      const o = ex[lv];
      if (o.used.length >= o.slots) return ex;
      return { ...ex, [lv]: { ...o, used: [...o.used, name] } };
    });
    if (EFFECTS[name]) addEffect(name, name === "Studied Combat" ? undefined : undefined);
  };
  const applyLevelUp = async () => {
    const hpGain = Math.max(1, parseInt(levelUp.hpGain, 10) || 8);
    const newL = base.level + 1;
    const babDelta = Math.floor(newL * 0.75) - Math.floor(base.level * 0.75); // investigator 3/4 BAB
    setBase((b) => ({ level: newL, hpMax: b.hpMax + hpGain, melee: b.melee + babDelta, ranged: b.ranged + babDelta }));
    setHp((h) => h + hpGain);
    setLevelUp((l) => ({ ...l, applied: true, babDelta, newL, loading: true }));
    try {
      const text = await callClaude(
        `${CHAR.name}, a Pathfinder 1e Gnome Investigator (Empiricist archetype), bomb-focused (Ranged Study feat), INT 33, just leveled from ${base.level} to ${newL}.
List concisely for level ${newL}:
1) Class features gained (new investigator talent? studied combat/strike scaling? extract slots/levels?)
2) Whether a new character feat is gained at this level
3) Top 3 investigator talent picks with one-line reasons (strongly consider Quick Study if not owned — swift-action Studied Combat)
4) Top 3 feat picks for this build with one-line reasons
5) Reminder: ${6 + CHAR.intMod} skill ranks to assign (6 + INT).
Under 180 words, plain text, numbered.`
      );
      setLevelUp((l) => ({ ...l, loading: false, text }));
    } catch (e) {
      setLevelUp((l) => ({ ...l, loading: false, text: "Couldn't fetch level-up picks — base changes applied. Try the Rules Search tab for talent/feat options." }));
    }
  };

  const resetDay = () => {
    setHp(base.hpMax); setBombs(CHAR.bombs.max); setInsp(CHAR.inspiration.max);
    setShirtUsed(false); setRound(1); setEffects([]);
    setExtracts(Object.fromEntries(Object.entries(START_EXTRACTS).map(([lv, o]) => [lv, { ...o, used: [] }])));
  };

  /* ---------- rolling ---------- */
  const openRoll = (defKey, fromSeq, critMult) => {
    setResult(null);
    const def = getDef(defKey);
    const cost = inspCost(defKey);
    const autoInsp = inspAuto && def?.die === 20 && insp >= cost;
    setRoll({ defKey, custom: [], useStrike: false, useInsp: autoInsp, crit: critMult || null, customLabel: "", customVal: "" });
    if (fromSeq) setSeq(fromSeq);
  };
  const executeRoll = () => {
    const def = getDef(roll.defKey);
    let baseLines = def.lines(effects);
    if (roll.crit) baseLines = applyCrit(baseLines, roll.crit);
    const lines = def.strikeOption && roll.useStrike
      ? [...baseLines, { label: `Studied Strike${roll.crit ? " (precision — not multiplied)" : ""}`, dice: [CHAR.studied.strikeDice, 6], live: true }]
      : baseLines;
    const allLines = [...lines, ...roll.custom];
    let total = 0, d20 = null, diceDetail = [];
    if (def.die === 20) { d20 = d(20); total += d20; }
    allLines.forEach((ln) => {
      if (ln.dice) {
        const rolled = rollDice(ln.dice[0], ln.dice[1]);
        diceDetail.push({ label: ln.label, rolled, sum: rolled.reduce((a, b) => a + b, 0) });
        total += rolled.reduce((a, b) => a + b, 0);
      } else total += ln.val;
    });
    if (roll.useInsp) {
      const cost = inspCost(roll.defKey);
      const two = [d(8), d(8)];
      const high = Math.max(...two);
      diceDetail.push({ label: `Inspiration 2d8↑ ${cost ? `(−${cost} use${cost > 1 ? "s" : ""})` : "(free — Expanded Insp.)"}`, rolled: two, sum: high });
      total += high;
      if (cost) setInsp((v) => Math.max(0, v - cost));
    }
    if (def.consumes === "bomb") setBombs((b) => Math.max(0, b - 1));
    if (def.endsStudied) removeEffect("Studied Combat");
    if (roll.defKey === "bombDmg") {
      // next-bomb admixtures (Targeted, Bouncing) are spent once the bomb lands
      setEffects((fx) => fx.filter((e) => !EFFECTS[e.name]?.nextBomb));
    }
    if (roll.useStrike) removeEffect("Studied Combat");
    const trueStrikeActive = effects.some((e) => e.name === "True Strike");
    if (def.die === 20 && trueStrikeActive) removeEffect("True Strike");
    const flatMods = allLines.reduce((a, l) => a + (l.val || 0), 0);
    const threat = def.critRange && d20 !== null && d20 >= def.critRange && d20 !== 1;
    const isKnowledge = roll.defKey.startsWith("skill:Knowledge");
    setResult({
      defKey: roll.defKey, title: def.title + (roll.crit ? ` — CRIT ×${roll.crit}` : ""), d20, total,
      lines: allLines, diceDetail, chain: def.chain, usedStrike: roll.useStrike,
      threat, critRange: def.critRange, critMult: def.critMult, flatMods, confirm: null, isKnowledge,
    });
    setRoll(null);
  };
  const confirmCrit = () => {
    const cd = d(20);
    setResult((r) => ({ ...r, confirm: { d20: cd, total: cd + r.flatMods } }));
  };
  const nextInSequence = () => {
    if (!seq) return setResult(null);
    const i = seq.i + 1;
    if (i >= seq.steps.length) { setSeq(null); setResult(null); return; }
    setSeq({ ...seq, i });
    openRoll(seq.steps[i]);
  };

  /* ---------- computed chip modifiers ---------- */
  const bombMod = bombAttackLines(effects).reduce((a, l) => a + (l.val || 0), 0);
  const meleeMod = meleeAttackLines(effects).reduce((a, l) => a + (l.val || 0), 0);

  const scActiveChip = effects.some((e) => e.name === "Studied Combat");
  const chips = [
    { key: "bombAtk", label: `Bomb Atk +${bombMod}`, icon: Flame, hot: bombMod > CHAR.bab.ranged },
    { key: "bombDmg", label: `Bomb Dmg ${CHAR.bombs.dice}d6+${CHAR.bombs.bonus + effects.reduce((a, e) => a + (EFFECTS[e.name]?.dmg || 0), 0)}`, icon: Flame },
    { key: "studiedStrike", label: `Studied Strike ${CHAR.studied.strikeDice}d6`, icon: Target, hot: scActiveChip },
    { key: "meleeAtk", label: `Rapier +${meleeMod}`, icon: Swords },
    { key: "daggerAtk", label: `Dagger +${meleeMod + 1}`, icon: Swords },
    { key: "xbowAtk", label: `Crossbow +${14 + effects.reduce((a, e) => a + (EFFECTS[e.name]?.atk || 0), 0)}`, icon: Target },
    { key: "cmb", label: "CMB +9", icon: Swords },
    { key: "init", label: `Init +${CHAR.init}`, icon: Zap },
    { key: "skill:Perception", label: `Perception +${skillTotal(skills.find((s) => s.name === "Perception"))}`, icon: Eye },
    { key: "skill:Sense Motive", label: `Sense Motive +${smTotal()}`, icon: Eye },
    { key: "snakeStyle", label: `Snake AC (SM +${smTotal()})`, icon: Shield, hot: true },
    { key: "fort", label: `Fort +${CHAR.saves.fort}`, icon: Shield },
    { key: "ref", label: `Ref +${CHAR.saves.ref}`, icon: Shield },
    { key: "will", label: `Will +${CHAR.saves.will}`, icon: Shield },
  ];

  /* ============================================================ RENDER */
  return (
    <div style={{ minHeight: "100vh", background: C.ink, color: C.parch, fontFamily: F.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;700&family=Courier+Prime:wght@400;700&family=Caveat:wght@600&display=swap');
        *::-webkit-scrollbar{width:8px;height:8px} *::-webkit-scrollbar-thumb{background:${C.line};border-radius:4px}
        @media (prefers-reduced-motion: reduce){ *{transition:none!important;animation:none!important} }
        button:focus-visible{outline:2px solid ${C.brass};outline-offset:2px}
        input:focus{outline:1px solid ${C.brass}}
      `}</style>

      {/* ===== HEADER — the cover ===== */}
      <header style={{
        borderBottom: `4px solid ${C.brass}`, padding: "16px 20px 12px",
        display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap",
        background: "linear-gradient(180deg, #5C4330 0%, #4E3826 55%, #43301F 100%)",
      }}>
        <h1 style={{ fontFamily: F.disp, fontSize: 24, fontWeight: 700, color: "#E06426", margin: 0, letterSpacing: 5, textTransform: "uppercase" }}>
          {CHAR.name}
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 500, color: "#E9DCC0", letterSpacing: 1, textTransform: "uppercase" }}>
            Investigator Field Record:{" "}
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "#D9BE8C", letterSpacing: 0, textTransform: "none" }}>
              Gnome, Empiricist {base.level}
            </span>
          </span>
          <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 500, color: "#E9DCC0", letterSpacing: 1, textTransform: "uppercase" }}>
            If found, return to:{" "}
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "#D9BE8C", letterSpacing: 0, textTransform: "none" }}>
              City of the Sun
            </span>
          </span>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: "#C7B48E", marginTop: 2 }}>
            AC {CHAR.ac.total} · Touch {CHAR.ac.touch} · Flat-Footed {CHAR.ac.flat} · Round {round}
          </span>
        </div>
        <Btn small onClick={resetDay} tone="ghost" style={{ display: "flex", alignItems: "center", gap: 6, color: "#E9DCC0", borderColor: "#8A6F4E" }}>
          <RotateCcw size={12} /> New day
        </Btn>
      </header>

      {/* ===== THE RULED PAGE — everything below the cover sits on notebook paper ===== */}
      <div style={{
        background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #B9D9EC 27px, #B9D9EC 28.5px), #F8F2E0`,
      }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* ===== MAIN COLUMN ===== */}
        <main style={{ flex: "1 1 560px", minWidth: 320, padding: 16 }}>
          {/* tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
            {[["combat", "Combat", Swords], ["extracts", "Extracts", FlaskConical], ["sheet", "Sheet", BookOpen], ["search", "Rules Search", Search]].map(([k, lbl, Ic]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                border: `1px solid ${tab === k ? C.brass : C.line}`, cursor: "pointer",
                background: tab === k ? "#F1DDC9" : C.panel,
                color: tab === k ? C.brass : C.dim, fontFamily: F.mono, fontSize: 12,
              }}><Ic size={13} />{lbl}</button>
            ))}
          </div>

          {/* -------- COMBAT TAB -------- */}
          {tab === "combat" && (
            <div style={{ display: "grid", gap: 14 }}>
              <Panel style={{ padding: 14, borderColor: C.brass }}>
                <Label color={C.brass}>Free actions — use every round, cost you nothing</Label>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {(() => {
                    const scOn = effects.some((e) => e.name === "Studied Combat");
                    const ieOn = effects.some((e) => e.name === "Inspirational Expertise");
                    const items = [
                      {
                        name: "Studied Combat", tag: scOn ? "ACTIVE" : "not up", on: scOn,
                        desc: scOn ? "+6 ATK / +6 DMG vs your foe" : "MOVE action to start (+6/+6). Do this first.",
                        action: scOn ? null : { label: "Start", fn: () => addEffect("Studied Combat", "the foe") },
                      },
                      {
                        name: "Studied Strike", tag: scOn ? "ready" : "needs Studied Combat", on: scOn,
                        desc: "Free on a hit: +6d6, ends Studied Combat",
                        action: scOn ? { label: "Roll 6d6", fn: () => openRoll("studiedStrike") } : null,
                      },
                      {
                        name: "Inspirational Expertise", tag: ieOn ? "PARTY +4 UP" : "not up", on: ieOn,
                        desc: ieOn ? "Allies +4 to hit the marked foe" : "Free: Knowledge check to ID a foe → party +4",
                        action: ieOn ? null : { label: "ID foe", fn: () => setKnowPick(true) },
                      },
                      {
                        name: "Drop prone / speak / drop item", tag: "anytime", on: false,
                        desc: "Standard free actions available to everyone",
                        action: null,
                      },
                    ];
                    return items.map((it) => (
                      <div key={it.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 8, background: C.panel2, borderLeft: `3px solid ${it.on ? C.brass : C.line}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontFamily: F.mono, color: it.on ? C.brass : C.parch }}>{it.name}</span>
                            <span style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: 1, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", color: it.on ? C.brass : C.dimmer, border: `1px solid ${it.on ? C.brass : C.line}` }}>{it.tag}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>{it.desc}</div>
                        </div>
                        {it.action && <Btn small tone="brass" onClick={it.action.fn}>{it.action.label}</Btn>}
                      </div>
                    ));
                  })()}
                </div>
              </Panel>

              <Panel style={{ padding: 14 }}>
                <Label>Quick rolls — live modifiers</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {chips.map((c) => (
                    <button key={c.key} onClick={() => openRoll(c.key)} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20,
                      border: `1px solid ${c.hot ? C.brass : C.line}`, cursor: "pointer",
                      background: c.hot ? "rgba(201,80,26,0.12)" : C.panel2,
                      color: c.hot ? C.brass : C.parch, fontFamily: F.mono, fontSize: 12,
                    }}><c.icon size={12} />{c.label}</button>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  <Label>Knowledge — free action to ID a foe (Inspirational Expertise: allies +4 ATK)</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {skills.filter((s) => s.name.startsWith("Knowledge")).map((sk) => (
                      <button key={sk.name} onClick={() => openRoll("skill:" + sk.name)} style={{
                        padding: "5px 10px", borderRadius: 14, border: `1px solid ${C.line}`,
                        background: C.panel2, color: C.dim, fontFamily: F.mono, fontSize: 11, cursor: "pointer",
                      }}><Brain size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />
                        {sk.name.replace("Knowledge (", "").replace(")", "")} +{skillTotal(sk)}</button>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel style={{ padding: 14 }}>
                <Label>Action sequences</Label>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {SEQUENCES.map((s) => (
                    <button key={s.name} onClick={() => { setSeq({ ...s, i: 0 }); openRoll(s.steps[0]); }} style={{
                      textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      border: `1px solid ${C.line}`, background: C.panel2, color: C.parch,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: F.mono, fontSize: 13, color: C.brass }}>
                        <ChevronRight size={13} />{s.name}
                      </div>
                      <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{s.desc}</div>
                    </button>
                  ))}
                  <button onClick={() => setBombs((b) => Math.max(0, b - 2))} disabled={bombs < 2} style={{
                    textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: bombs < 2 ? "not-allowed" : "pointer",
                    border: `1px solid ${C.line}`, background: C.panel2, color: C.parch, opacity: bombs < 2 ? 0.4 : 1,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: F.mono, fontSize: 13, color: C.brass }}>
                      <Flame size={13} />Set a remote bomb (−2 💣)
                    </div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>Remote Bombs discovery: place now, detonate whenever — costs 2 bomb uses each</div>
                  </button>
                </div>
                <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 6, background: C.panel2, fontSize: 11, color: C.dim, lineHeight: 1.6 }}>
                  <span style={{ color: C.brass, fontFamily: F.mono }}>TACTICS</span> · Sniping: attack from Stealth, re-Stealth after at −20 · Poisoner's Gloves: apply poison as a swift · You are IMMUNE to poison · Unfailing Logic: +4 Will vs illusions (spend 1 inspiration to save with INT +11)
                </div>
              </Panel>

              <Panel style={{ padding: 14 }}>
                <Label>Apply effect / condition</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {ADDABLE_BUFFS.map((n) => (
                    <Btn key={n} small tone="verd" onClick={() => addEffect(n)}>{n}</Btn>
                  ))}
                  {ADDABLE_CONDS.map((n) => (
                    <Btn key={n} small tone="ember" onClick={() => addEffect(n)}>{n}</Btn>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.dimmer, marginTop: 8 }}>
                  Buffs from extracts apply automatically when you drink them in the Extracts tab.
                </div>
              </Panel>
            </div>
          )}

          {/* -------- EXTRACTS TAB -------- */}
          {tab === "extracts" && (
            <div style={{ display: "grid", gap: 12 }}>
              {Object.entries(extracts).map(([lv, o]) => (
                <Panel key={lv} style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Label color={C.brass}>Level {lv}</Label>
                    <span style={{ fontFamily: F.mono, fontSize: 12, color: o.slots - o.used.length === 0 ? C.ember : C.verd }}>
                      {o.slots - o.used.length}/{o.slots} slots
                    </span>
                    <span style={{ fontFamily: F.mono, fontSize: 11, color: C.dimmer, marginLeft: "auto" }}>save DC {21 + parseInt(lv, 10)}</span>
                  </div>
                  <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                    {o.list.map((name) => {
                      const usedCount = o.used.filter((u) => u === name).length;
                      const noSlots = o.used.length >= o.slots;
                      return (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 6, background: C.panel2 }}>
                          <FlaskConical size={13} color={EFFECTS[name] ? C.verd : C.dim} />
                          <span style={{ fontSize: 13, flex: 1 }}>{name}</span>
                          {usedCount > 0 && <span style={{ fontFamily: F.mono, fontSize: 11, color: C.dimmer }}>×{usedCount} drunk</span>}
                          <Btn small tone={EFFECTS[name] ? "verd" : "ghost"} disabled={noSlots} onClick={() => drinkExtract(lv, name)}>Drink</Btn>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              ))}
            </div>
          )}

          {/* -------- SHEET TAB -------- */}
          {tab === "sheet" && (
            <div style={{ display: "grid", gap: 12 }}>
              <Panel style={{ padding: 14 }}>
                <Label>Abilities</Label>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
                  {Object.entries(CHAR.abilities).map(([k, v]) => (
                    <div key={k} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.dim }}>{k}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 20, color: k === "INT" ? C.brass : C.parch }}>{v}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.dimmer }}>{abilityModOf(k) >= 0 ? "+" : ""}{abilityModOf(k)}</div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel style={{ padding: 14 }}>
                <Label>Skills — tap name to roll · ranks & misc are editable</Label>
                <div style={{ marginTop: 10, overflowX: "auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 56px 44px 56px 56px", gap: 4, fontFamily: F.mono, fontSize: 10, color: C.dimmer, textTransform: "uppercase", letterSpacing: 1, padding: "0 6px" }}>
                    <span>Skill</span><span>Abil</span><span>Ranks</span><span>Cls</span><span>Misc</span><span style={{ textAlign: "right" }}>Total</span>
                  </div>
                  {skills.map((s, i) => (
                    <div key={s.name} style={{ display: "grid", gridTemplateColumns: "1fr 52px 56px 44px 56px 56px", gap: 4, alignItems: "center", padding: "4px 6px", borderRadius: 6, background: i % 2 ? "transparent" : C.panel2 }}>
                      <button onClick={() => openRoll("skill:" + s.name)} style={{ textAlign: "left", background: "none", border: "none", color: s.tr && s.ranks === 0 ? C.dimmer : C.parch, fontSize: 12, cursor: "pointer", padding: 0, fontFamily: F.body }}>
                        {s.name}{s.tr && s.ranks === 0 && <span style={{ color: C.ember, fontSize: 10 }}> †</span>}{s.note && <span style={{ color: C.dimmer, fontSize: 10 }}> · {s.note}</span>}
                      </button>
                      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.dim }}>{s.ability}{abilityModOf(s.ability) >= 0 ? "+" : ""}{abilityModOf(s.ability)}</span>
                      <input type="number" value={s.ranks} onChange={(e) => {
                        const v = parseInt(e.target.value, 10) || 0;
                        setSkills((sk) => sk.map((x, j) => j === i ? { ...x, ranks: v } : x));
                      }} style={{ width: 48, background: C.ink, border: `1px solid ${C.line}`, borderRadius: 4, padding: "3px 5px", color: C.parch, fontFamily: F.mono, fontSize: 11 }} />
                      <span style={{ fontFamily: F.mono, fontSize: 11, color: s.cls && s.ranks > 0 ? C.verd : C.dimmer }}>{s.cls && s.ranks > 0 ? "+3" : "—"}</span>
                      <input type="number" value={s.misc} onChange={(e) => {
                        const v = parseInt(e.target.value, 10) || 0;
                        setSkills((sk) => sk.map((x, j) => j === i ? { ...x, misc: v } : x));
                      }} style={{ width: 48, background: C.ink, border: `1px solid ${C.line}`, borderRadius: 4, padding: "3px 5px", color: C.parch, fontFamily: F.mono, fontSize: 11 }} />
                      <span style={{ fontFamily: F.mono, fontSize: 13, color: C.brass, textAlign: "right", fontWeight: 600 }}>+{skillTotal(s)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.dimmer, marginTop: 8 }}>
                  † trained only — can't be rolled with 0 ranks. Values imported from your Google Sheet. A couple of rows (marked "verify") didn't decompose cleanly on the sheet — misc absorbs the difference so totals match; adjust if you know better.
                </div>
              </Panel>
              <Panel style={{ padding: 14 }}>
                <Label>Identity & Defense</Label>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 8, lineHeight: 1.7 }}>
                  Age 50 · 4'0" · 80 lbs · Grey hair · Green eyes · Edge City · Speed 20 ft · Low-light vision
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontFamily: F.mono, fontSize: 12 }}>
                  <span>AC <span style={{ color: C.brass }}>24</span></span>
                  <span>Touch <span style={{ color: C.brass }}>17</span></span>
                  <span>Flat-Footed <span style={{ color: C.brass }}>20</span></span>
                  <span>CMB <span style={{ color: C.brass }}>+9</span></span>
                  <span>CMD <span style={{ color: C.brass }}>25</span></span>
                </div>
                <div style={{ fontSize: 11, color: C.dimmer, marginTop: 6, fontFamily: F.mono }}>
                  AC = 10 + armor 1 + shield 1 + DEX 2 + size 1 + natural 3 + deflection 1 + misc 2 + temp 3
                </div>
                <div style={{ fontSize: 12, color: C.verd, marginTop: 8, lineHeight: 1.6 }}>
                  Immune to poison · +2 saves vs illusion (+4 more insight via Unfailing Logic) · +4 Reflex & dodge AC vs traps · Snake Style: Sense Motive as AC (chip in Combat)
                </div>
              </Panel>
              <Panel style={{ padding: 14 }}>
                <Label>Languages ({"17"})</Label>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 8, lineHeight: 1.7 }}>
                  Common, Gnome, Sylvan, Orc, Elven, Dwarven, Halfling, Necril, Infernal, Undercommon, Giant, Draconic, Abyssal, Ignan, Dark Folk, Goblin, Treant
                </div>
              </Panel>
              <Panel style={{ padding: 14 }}>
                <Label>Feats, talents & abilities — what they do at the table</Label>
                {FEAT_SECTIONS.map(([section, items]) => (
                  <div key={section} style={{ marginTop: 12 }}>
                    <div style={{ fontFamily: F.mono, fontSize: 11, color: C.brass, letterSpacing: 1, textTransform: "uppercase" }}>{section}</div>
                    <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                      {items.map(([name, mech]) => (
                        <div key={name} style={{ padding: "7px 10px", borderRadius: 6, background: C.panel2, borderLeft: `3px solid ${C.brassDim}` }}>
                          <div style={{ fontSize: 12, color: C.brass, fontFamily: F.mono }}>{name}</div>
                          <div style={{ fontSize: 12, color: C.dim, marginTop: 2, lineHeight: 1.5 }}>{mech}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Panel>
              <Panel style={{ padding: 14 }}>
                <Label>Key gear</Label>
                <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  {CHAR.gear.map(([g, note]) => (
                    <div key={g} style={{ fontSize: 13 }}>
                      <span style={{ color: C.parch }}>{g}</span>
                      {note && <span style={{ color: C.dimmer }}> — {note}</span>}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {/* -------- SEARCH TAB -------- */}
          {tab === "search" && (
            <div style={{ display: "grid", gap: 12 }}>
              <Panel style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
                    placeholder="Search d20pfsrd — rules, spells, feats…"
                    style={{
                      flex: 1, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8,
                      padding: "10px 12px", color: C.parch, fontFamily: F.body, fontSize: 14,
                    }}
                  />
                  <Btn tone="brass" onClick={() => doSearch(query)}>{searchLoading ? "…" : "Search"}</Btn>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {pills.map((p) => (
                    <button key={p} onClick={() => doSearch(p)} style={{
                      padding: "4px 11px", borderRadius: 14, border: `1px solid ${C.line}`,
                      background: "transparent", color: C.dim, fontFamily: F.mono, fontSize: 11, cursor: "pointer",
                    }}>{p}</button>
                  ))}
                </div>
              </Panel>
              {(searchLoading || searchRes) && (
                <Panel style={{ padding: 16 }}>
                  {searchLoading ? (
                    <div style={{ color: C.dim, fontFamily: F.mono, fontSize: 12 }}>Consulting the archives…</div>
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{searchRes}</div>
                  )}
                </Panel>
              )}
            </div>
          )}
        </main>

        {/* ===== SIDEBAR ===== */}
        <aside style={{ flex: "0 1 340px", minWidth: 300, padding: 16, display: "grid", gap: 12, alignSelf: "stretch", borderLeft: `1px solid ${C.line}` }}>
          {/* Zone 1 — resources */}
          <Panel style={{ padding: 12 }}>
            <Label>Resources</Label>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {/* HP */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Heart size={14} color={hp / base.hpMax < 0.3 ? C.ember : C.verd} />
                <button onClick={() => setHpEdit({ amount: "" })} style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8, background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 10, background: C.panel2, borderRadius: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(hp / base.hpMax) * 100}%`, background: hp / base.hpMax < 0.3 ? C.ember : C.verd, transition: "width .3s" }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: 13, color: C.parch }}>{hp}/{base.hpMax}</span>
                </button>
                <Btn small onClick={() => setHp((h) => Math.max(0, h - 5))}><Minus size={11} /></Btn>
                <Btn small onClick={() => setHp((h) => Math.min(base.hpMax, h + 5))}><Plus size={11} /></Btn>
              </div>
              <div style={{ fontSize: 10, color: C.dimmer, marginTop: -4, marginLeft: 22 }}>tap the bar to enter damage or healing</div>
              {/* Bombs / Inspiration */}
              {[
                ["Bombs", bombs, CHAR.bombs.max, setBombs, Flame, C.brass],
                ["Inspiration", insp, CHAR.inspiration.max, setInsp, Sparkles, C.verd],
              ].map(([lbl, val, max, setter, Ic, col]) => (
                <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Ic size={14} color={col} />
                  <span style={{ fontSize: 12, color: C.dim, width: 74 }}>{lbl}</span>
                  <span style={{ fontFamily: F.mono, fontSize: 13, flex: 1 }}>{val}/{max}</span>
                  <Btn small onClick={() => setter((v) => Math.max(0, v - 1))}><Minus size={11} /></Btn>
                  <Btn small onClick={() => setter((v) => Math.min(max, v + 1))}><Plus size={11} /></Btn>
                </div>
              ))}
              {/* extract slots inline */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FlaskConical size={14} color={C.dim} />
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.dim }}>
                  {Object.entries(extracts).map(([lv, o]) => `L${lv}:${o.slots - o.used.length}`).join("  ")}
                </span>
              </div>
              {/* shirt */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wind size={14} color={shirtUsed ? C.dimmer : C.brass} />
                <span style={{ fontSize: 12, color: C.dim, flex: 1 }}>Quick Runner's Shirt</span>
                <Btn small tone={shirtUsed ? "ghost" : "brass"} onClick={() => setShirtUsed((s) => !s)}>
                  {shirtUsed ? "Used" : "Ready"}
                </Btn>
              </div>
              {/* universal inspiration auto toggle */}
              <button onClick={() => setInspAuto((a) => !a)} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px",
                borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: `1px solid ${inspAuto ? C.verd : C.line}`,
                background: inspAuto ? "rgba(85,102,59,0.1)" : "transparent",
              }}>
                <Sparkles size={14} color={inspAuto ? C.verd : C.dimmer} />
                <span style={{ fontSize: 12, color: inspAuto ? C.verd : C.dim, flex: 1 }}>
                  Auto-apply Inspiration to rolls (2d8, take higher)
                </span>
                <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 700, color: inspAuto ? C.verd : C.dimmer }}>
                  {inspAuto ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </Panel>

          {/* Zone 2 — active effects */}
          <Panel style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Label>Active effects</Label>
              <Btn small onClick={endTurn} tone="brass" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                <Timer size={11} /> End turn
              </Btn>
            </div>
            <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
              {effects.length === 0 && <div style={{ fontSize: 12, color: C.dimmer }}>Nothing active. Drink an extract or apply an effect.</div>}
              {effects.map((e) => {
                const def = EFFECTS[e.name] || {};
                const col = def.kind === "cond" ? C.ember : def.kind === "party" ? C.brass : C.verd;
                return (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, background: C.panel2, borderLeft: `3px solid ${col}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.parch }}>{e.name}{e.target ? ` — ${e.target}` : ""}</div>
                      {def.note && <div style={{ fontSize: 10, color: C.dimmer }}>{def.note}</div>}
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: 12, color: col }}>{def.kind === "party" ? "up" : `${e.rounds}r`}</span>
                    {def.kind !== "party" && <Btn small onClick={() => tickEffect(e.name)}>−1</Btn>}
                    <button onClick={() => removeEffect(e.name)} style={{ background: "none", border: "none", color: C.dimmer, cursor: "pointer", padding: 2 }}><X size={13} /></button>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Zone 3 — optimizer */}
          <Panel style={{ padding: 12, borderColor: optStale ? C.line : C.brassDim }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Label color={C.brass}>Optimal turn</Label>
              {optStale && optText && <span style={{ fontFamily: F.mono, fontSize: 9, color: C.ember }}>STALE</span>}
              <Btn small onClick={runOptimizer} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }} disabled={optLoading}>
                <RefreshCw size={11} style={optLoading ? { animation: "spin 1s linear infinite" } : {}} />
                {optLoading ? "Thinking…" : "Recalculate"}
              </Btn>
            </div>
            {/* priority toggle */}
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              {[["Damage", Swords], ["Control", Target], ["Survive", Shield], ["Utility", Eye]].map(([m, Ic]) => (
                <button key={m} onClick={() => setPriority(m)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  padding: "6px 0", borderRadius: 6, cursor: "pointer", fontFamily: F.mono, fontSize: 10,
                  border: `1px solid ${priority === m ? C.brass : C.line}`,
                  background: priority === m ? "rgba(201,80,26,0.12)" : "transparent",
                  color: priority === m ? C.brass : C.dim,
                }}><Ic size={11} />{m}</button>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: optText ? C.parch : C.dimmer, fontFamily: optText ? F.body : F.mono }}>
              {optLoading ? "Reading the state of the battlefield…" : optText || "Tap Recalculate for a turn recommendation based on current state."}
            </div>
          </Panel>
        </aside>
      </div>

      {/* ===== ROLL BUILDER MODAL ===== */}
      {roll && (() => {
        const def = getDef(roll.defKey);
        let baseLines = def.lines(effects);
        if (roll.crit) baseLines = applyCrit(baseLines, roll.crit);
        const lines = def.strikeOption && roll.useStrike
          ? [...baseLines, { label: `Studied Strike${roll.crit ? " (precision — not ×)" : ""}`, dice: [CHAR.studied.strikeDice, 6], live: true }]
          : baseLines;
        const allLines = [
          ...lines,
          ...(roll.useInsp ? [{ label: "Inspiration (take higher)", dice: [2, 8], live: true }] : []),
          ...roll.custom,
        ];
        const flatTotal = allLines.reduce((a, l) => a + (l.val || 0), 0);
        const diceStr = allLines.filter((l) => l.dice).map((l) => `${l.dice[0]}d${l.dice[1]}`).join(" + ");
        const scActive = effects.some((e) => e.name === "Studied Combat");
        return (
          <Overlay onClose={() => { setRoll(null); setSeq(null); }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <def.icon size={16} color={C.brass} />
              <span style={{ fontFamily: F.disp, fontSize: 20, fontWeight: 700, color: C.brass }}>{def.title}</span>
              {roll.crit && <span style={{ fontFamily: F.mono, fontSize: 11, color: C.ember, border: `1px solid ${C.ember}`, borderRadius: 4, padding: "2px 6px" }}>CRIT ×{roll.crit}</span>}
              {def.critRange && !roll.crit && <span style={{ fontFamily: F.mono, fontSize: 10, color: C.dim }}>threat {def.critRange === 20 ? "20" : `${def.critRange}–20`}</span>}
              {seq && <span style={{ fontFamily: F.mono, fontSize: 10, color: C.dim, marginLeft: "auto" }}>{seq.name} · step {seq.i + 1}/{seq.steps.length}</span>}
            </div>
            {/* ledger */}
            <div style={{ marginTop: 14, borderTop: `1.5px solid ${C.line}` }}>
              {allLines.map((l, i) => (
                <div key={i} style={{ display: "flex", padding: "7px 2px", borderBottom: `1px dotted ${C.line}`, fontFamily: F.mono, fontSize: 13 }}>
                  <span style={{ flex: 1, color: l.live ? C.verd : C.parch }}>{l.label}{l.live ? "  ✓" : ""}</span>
                  <span style={{ color: C.brass }}>{l.dice ? `${l.dice[0]}d${l.dice[1]}` : (l.val >= 0 ? `+${l.val}` : l.val)}</span>
                </div>
              ))}
              <div style={{ display: "flex", padding: "9px 2px", fontFamily: F.mono, fontSize: 14, fontWeight: 600 }}>
                <span style={{ flex: 1, color: C.dim }}>TOTAL</span>
                <span style={{ color: C.brass }}>
                  {def.die === 20 ? `1d20${flatTotal >= 0 ? "+" : ""}${flatTotal}` : `${diceStr}${flatTotal ? `${flatTotal >= 0 ? " +" : " "}${flatTotal}` : ""}`}
                </span>
              </div>
            </div>
            {/* studied strike toggle on damage rolls */}
            {def.strikeOption && scActive && (
              <button onClick={() => setRoll((r) => ({ ...r, useStrike: !r.useStrike }))} style={{
                marginTop: 8, width: "100%", padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${roll.useStrike ? C.verd : C.line}`,
                background: roll.useStrike ? "rgba(85,102,59,0.12)" : "transparent",
                color: roll.useStrike ? C.verd : C.dim, fontFamily: F.mono, fontSize: 12, textAlign: "left",
              }}>
                {roll.useStrike ? "✓ " : "+ "}Studied Strike (+{CHAR.studied.strikeDice}d6 — ends Studied Combat)
              </button>
            )}
            {/* inspiration toggle — any d20 roll */}
            {def.die === 20 && (() => {
              const cost = inspCost(roll.defKey);
              const cantAfford = insp < cost;
              return (
                <button onClick={() => !cantAfford && setRoll((r) => ({ ...r, useInsp: !r.useInsp }))} style={{
                  marginTop: 8, width: "100%", padding: "9px 12px", borderRadius: 8,
                  cursor: cantAfford ? "not-allowed" : "pointer", opacity: cantAfford ? 0.4 : 1,
                  border: `1px solid ${roll.useInsp ? C.brass : C.line}`,
                  background: roll.useInsp ? "rgba(201,80,26,0.12)" : "transparent",
                  color: roll.useInsp ? C.brass : C.dim, fontFamily: F.mono, fontSize: 12, textAlign: "left",
                }}>
                  {roll.useInsp ? "✓ " : "+ "}Inspiration — 2d8 take higher {cost === 0 ? "(free)" : `(costs ${cost} use${cost > 1 ? "s" : ""})`}
                </button>
              );
            })()}
            {def.note && (
              <div style={{ marginTop: 8, fontSize: 11, color: C.ember, fontFamily: F.mono }}>⚠ {def.note}</div>
            )}
            {/* custom modifier */}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input placeholder="Situational (e.g. flanking)" value={roll.customLabel}
                onChange={(e) => setRoll((r) => ({ ...r, customLabel: e.target.value }))}
                style={{ flex: 2, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", color: C.parch, fontSize: 12 }} />
              <input placeholder="+2" value={roll.customVal}
                onChange={(e) => setRoll((r) => ({ ...r, customVal: e.target.value }))}
                style={{ flex: 0.6, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", color: C.parch, fontSize: 12, fontFamily: F.mono }} />
              <Btn small onClick={() => {
                const v = parseInt(roll.customVal, 10);
                if (!isNaN(v) && roll.customLabel) setRoll((r) => ({ ...r, custom: [...r.custom, { label: r.customLabel, val: v }], customLabel: "", customVal: "" }));
              }}><Plus size={12} /></Btn>
            </div>
            <Btn tone="brass" onClick={executeRoll} style={{ width: "100%", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15 }}>
              <Dices size={16} /> Roll
            </Btn>
          </Overlay>
        );
      })()}

      {/* ===== RESULT CARD ===== */}
      {result && (
        <Overlay onClose={() => { setResult(null); setSeq(null); }}>
          <div style={{ fontFamily: F.disp, fontSize: 20, fontWeight: 700, color: C.brass }}>{result.title}</div>
          {result.d20 !== null && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
              <D20Face value={result.d20} color={result.threat ? C.ember : result.d20 === 1 ? C.ember : result.d20 === 20 ? C.verd : C.parch} />
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.dim, lineHeight: 1.7 }}>
                <div>raw roll</div>
                {result.critRange && <div>crit threat on: {result.critRange === 20 ? "20" : `${result.critRange}–20`}</div>}
                {result.d20 === 1 && <div style={{ color: C.ember }}>rolled a 1 — automatic miss</div>}
                {result.d20 === 20 && !result.threat && <div style={{ color: C.verd }}>rolled a 20!</div>}
              </div>
            </div>
          )}
          {result.threat && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.ember}`, background: "rgba(143,43,34,0.08)" }}>
              <div style={{ fontFamily: F.mono, fontSize: 12, color: C.ember, fontWeight: 600 }}>⚔ CRITICAL THREAT</div>
              {!result.confirm ? (
                <Btn tone="ember" small style={{ marginTop: 8, width: "100%" }} onClick={confirmCrit}>
                  Roll to confirm (1d20+{result.flatMods})
                </Btn>
              ) : (
                <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 13 }}>
                  Confirm: d20 → {result.confirm.d20} + {result.flatMods} = <span style={{ color: C.ember, fontWeight: 700 }}>{result.confirm.total}</span>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 3 }}>Beats AC? → roll crit damage below</div>
                </div>
              )}
            </div>
          )}
          {result.diceDetail.map((dd, i) => (
            <div key={i} style={{ marginTop: 8, fontFamily: F.mono, fontSize: 13, color: C.dim }}>
              {dd.label}: [{dd.rolled.join(", ")}] = <span style={{ color: C.parch }}>{dd.sum}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "12px 0", borderTop: `1px dotted ${C.line}`, display: "flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: F.mono, fontSize: 12, color: C.dim, flex: 1 }}>TOTAL</span>
            <span style={{ fontFamily: F.mono, fontSize: 32, fontWeight: 700, color: C.brass }}>{result.total}</span>
          </div>
          {result.usedStrike && <div style={{ fontFamily: F.mono, fontSize: 11, color: C.ember }}>⚡ Studied Combat ended (Strike used)</div>}
          {result.isKnowledge && (
            <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.brass}`, background: "rgba(201,80,26,0.08)" }}>
              <div style={{ fontFamily: F.mono, fontSize: 12, color: C.brass, fontWeight: 600 }}>★ INSPIRATIONAL EXPERTISE</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4, lineHeight: 1.5 }}>
                If this beats the DC, your whole party gets +4 to hit this foe. Name it so the table can track it:
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input placeholder="foe name (e.g. Orc Chief)" value={result.foeName || ""}
                  onChange={(e) => setResult((r) => ({ ...r, foeName: e.target.value }))}
                  style={{ flex: 1, background: C.ink, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 10px", color: C.parch, fontFamily: F.body, fontSize: 13 }} />
                <Btn tone="brass" small onClick={() => {
                  addEffect("Inspirational Expertise", result.foeName || "the foe");
                  setResult(null); setSeq(null);
                }}>Mark +4 active</Btn>
              </div>
            </div>
          )}
          {result.defKey === "bombAtk" && <div style={{ fontFamily: F.mono, fontSize: 11, color: C.dim, marginTop: 4 }}>💣 {bombs} bombs remaining</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {result.chain ? (
              <>
                <Btn tone={result.confirm ? "ember" : "brass"} style={{ flex: 1 }} onClick={() => { const mult = result.confirm ? result.critMult : null; setResult(null); openRoll(result.chain, null, mult); }}>
                  {result.confirm ? `Hit — CRIT ×${result.critMult}` : "Hit"}
                </Btn>
                <Btn tone="ghost" style={{ flex: 1 }} onClick={() => {
                  if (seq && seq.i < seq.steps.length - 1) nextInSequence();
                  else { setResult(null); setSeq(null); }
                }}>Miss</Btn>
              </>
            ) : seq && seq.i < seq.steps.length - 1 ? (
              <Btn tone="verd" style={{ flex: 1 }} onClick={nextInSequence}>Next: {getDef(seq.steps[seq.i + 1]).title} →</Btn>
            ) : (
              <Btn style={{ flex: 1 }} onClick={() => { setResult(null); setSeq(null); }}>Done</Btn>
            )}
          </div>
        </Overlay>
      )}
      {/* ===== LEVEL UP FOOTER ===== */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "20px 16px", display: "flex", justifyContent: "center" }}>
        <Btn tone="brass" onClick={() => setLevelUp({ hpGain: 8, applied: false, text: "", loading: false })} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "12px 24px" }}>
          <Sparkles size={15} /> Level up — {base.level} → {base.level + 1}
        </Btn>
      </footer>
      </div>{/* end ruled page */}

      {/* ===== KNOWLEDGE PICKER (Inspirational Expertise) ===== */}
      {knowPick && (
        <Overlay onClose={() => setKnowPick(false)}>
          <div style={{ fontFamily: F.disp, fontSize: 20, fontWeight: 700, color: C.brass, textTransform: "uppercase", letterSpacing: 1 }}>Identify the foe</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 6, lineHeight: 1.5 }}>
            Pick the creature type — it maps to the right Knowledge skill. Beating the DC lets you grant the party +4 to hit it.
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 14 }}>
            {CREATURE_KNOWLEDGE.map(([type, know]) => {
              const sk = skills.find((s) => s.name === know);
              return (
                <button key={know} onClick={() => { setKnowPick(false); openRoll("skill:" + know); }} style={{
                  textAlign: "left", padding: "9px 11px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${C.line}`, background: C.panel2, color: C.parch,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.parch }}>{type}</div>
                    <div style={{ fontSize: 11, color: C.dim, fontFamily: F.mono, marginTop: 2 }}>{know.replace("Knowledge ", "")}</div>
                  </div>
                  <span style={{ fontFamily: F.mono, fontSize: 15, color: C.brass, fontWeight: 700 }}>+{skillTotal(sk)}</span>
                </button>
              );
            })}
          </div>
        </Overlay>
      )}

      {/* ===== HP DAMAGE / HEAL MODAL ===== */}
      {hpEdit && (() => {
        const amt = Math.max(0, parseInt(hpEdit.amount, 10) || 0);
        return (
          <Overlay onClose={() => setHpEdit(null)}>
            <div style={{ fontFamily: F.disp, fontSize: 22, fontWeight: 700, color: C.brass }}>Hit Points</div>
            <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 14, color: C.dim }}>
              Current: <span style={{ color: C.parch }}>{hp}/{base.hpMax}</span>
            </div>
            <input
              type="number" autoFocus placeholder="0" value={hpEdit.amount}
              onChange={(e) => setHpEdit({ amount: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter" && amt) { setHp((h) => Math.max(0, h - amt)); setHpEdit(null); } }}
              style={{
                width: "100%", marginTop: 14, background: C.ink, border: `1px solid ${C.line}`,
                borderRadius: 8, padding: "14px 12px", color: C.parch, fontFamily: F.mono,
                fontSize: 28, textAlign: "center",
              }}
            />
            {amt > 0 && (
              <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 12, color: C.dimmer, textAlign: "center" }}>
                damage → {Math.max(0, hp - amt)}/{base.hpMax} · heal → {Math.min(base.hpMax, hp + amt)}/{base.hpMax}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn tone="ember" style={{ flex: 1, fontSize: 15, padding: "12px 0" }} disabled={!amt}
                onClick={() => { setHp((h) => Math.max(0, h - amt)); setHpEdit(null); }}>
                − Take {amt || ""} damage
              </Btn>
              <Btn tone="verd" style={{ flex: 1, fontSize: 15, padding: "12px 0" }} disabled={!amt}
                onClick={() => { setHp((h) => Math.min(base.hpMax, h + amt)); setHpEdit(null); }}>
                + Heal {amt || ""}
              </Btn>
            </div>
            <div style={{ fontSize: 11, color: C.dimmer, marginTop: 10, textAlign: "center" }}>
              Enter ↵ applies damage (the common case)
            </div>
          </Overlay>
        );
      })()}

      {/* ===== LEVEL UP MODAL ===== */}
      {levelUp && (
        <Overlay onClose={() => setLevelUp(null)}>
          <div style={{ fontFamily: F.disp, fontSize: 22, fontWeight: 700, color: C.brass }}>
            Level {base.level} → {levelUp.applied ? levelUp.newL : base.level + 1}
          </div>
          {!levelUp.applied ? (
            <>
              <div style={{ marginTop: 12, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
                Applies automatically: level, max HP, and BAB-based attack bonuses
                {Math.floor((base.level + 1) * 0.75) - Math.floor(base.level * 0.75) > 0 ? " (+1 melee & ranged this level)" : " (no BAB step this level)"}.
                Then Claude fetches your talent/feat picks and reminders.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                <span style={{ fontFamily: F.mono, fontSize: 12, color: C.dim }}>HP gained (roll d8+3 or avg 8):</span>
                <input type="number" value={levelUp.hpGain} onChange={(e) => setLevelUp((l) => ({ ...l, hpGain: e.target.value }))}
                  style={{ width: 60, background: C.ink, border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 8px", color: C.parch, fontFamily: F.mono, fontSize: 13 }} />
              </div>
              <Btn tone="brass" onClick={applyLevelUp} style={{ width: "100%", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={14} /> Apply & get my picks
              </Btn>
            </>
          ) : (
            <>
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(85,102,59,0.08)", border: `1px solid ${C.verd}`, fontFamily: F.mono, fontSize: 12, color: C.verd, lineHeight: 1.7 }}>
                ✓ Level {levelUp.newL} applied<br />
                ✓ Max HP +{Math.max(1, parseInt(levelUp.hpGain, 10) || 8)} → {base.hpMax}<br />
                {levelUp.babDelta > 0 ? `✓ Attacks +1 → melee +${base.melee} / ranged +${base.ranged}` : "· No BAB increase this level"}<br />
                → Assign {6 + CHAR.intMod} skill ranks in the Sheet tab (editable)
              </div>
              <div style={{ marginTop: 14 }}>
                <Label color={C.brass}>Your picks at level {levelUp.newL}</Label>
                <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", color: levelUp.loading ? C.dimmer : C.parch }}>
                  {levelUp.loading ? "Consulting the guildhall records…" : levelUp.text}
                </div>
              </div>
              <Btn onClick={() => setLevelUp(null)} style={{ width: "100%", marginTop: 14 }}>Done</Btn>
            </>
          )}
        </Overlay>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* modal overlay */
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(41,37,32,0.78)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.panel, border: `1px solid ${C.brassDim}`, borderRadius: 12,
        padding: 20, width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 10px 30px rgba(41,37,32,0.3)",
      }}>{children}</div>
    </div>
  );
}

/* d20 face — icosahedron front view with the rolled number inside */
function D20Face({ value, color, size = 68 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`d20 showing ${value}`}>
      <polygon points="50,3 91,26 91,74 50,97 9,74 9,26"
        fill="rgba(0,0,0,0.05)" stroke={color} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="50,15 85,71 15,71"
        fill="none" stroke={color} strokeWidth="1.4" opacity="0.45" strokeLinejoin="round" />
      <g stroke={color} strokeWidth="1.4" opacity="0.3">
        <line x1="50" y1="3" x2="50" y2="15" />
        <line x1="91" y1="26" x2="85" y2="71" />
        <line x1="9" y1="26" x2="15" y2="71" />
        <line x1="91" y1="74" x2="85" y2="71" />
        <line x1="9" y1="74" x2="15" y2="71" />
        <line x1="50" y1="97" x2="50" y2="71" />
      </g>
      <text x="50" y="55" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontFamily="'Courier Prime', monospace" fontSize="30" fontWeight="700">{value}</text>
    </svg>
  );
}
