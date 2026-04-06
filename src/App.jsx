import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ── Persistence helpers ──────────────────────────────────────────────
const store = {
  async get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  async set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
};

// ── Card data ────────────────────────────────────────────────────────
const SUITS=["Wands","Cups","Swords","Pentacles"];
const MAJOR_ARCANA=[
  {name:"The Fool",num:"0",keywords:["beginnings","spontaneity","innocence","free spirit"],meaning:"A leap into the unknown. Pure potential and new adventures await those willing to embrace uncertainty."},
  {name:"The Magician",num:"I",keywords:["manifestation","resourcefulness","power","inspired action"],meaning:"You have all the tools you need. Channel your will and watch the world bend to your intention."},
  {name:"The High Priestess",num:"II",keywords:["intuition","sacred knowledge","divine feminine","the subconscious"],meaning:"Be still. The answers live beneath the surface — trust what you know without knowing why."},
  {name:"The Empress",num:"III",keywords:["femininity","beauty","nature","nurturing","abundance"],meaning:"Creation flows through you. This is a time of fertility, abundance, and sensory richness."},
  {name:"The Emperor",num:"IV",keywords:["authority","structure","protection","fatherhood"],meaning:"Build on solid foundations. Stability and order are the scaffolding of lasting achievement."},
  {name:"The Hierophant",num:"V",keywords:["spiritual wisdom","tradition","conformity","institutions"],meaning:"Seek guidance from established wisdom. There is power in ritual and shared belief systems."},
  {name:"The Lovers",num:"VI",keywords:["love","harmony","relationships","values alignment"],meaning:"A significant choice rooted in your deepest values. Love — of another, of self, of a path."},
  {name:"The Chariot",num:"VII",keywords:["control","willpower","success","determination"],meaning:"Victory through discipline. You must hold opposing forces in tension and drive forward with purpose."},
  {name:"Strength",num:"VIII",keywords:["strength","courage","patience","inner power"],meaning:"True strength is soft. Approach what frightens you with compassion rather than force."},
  {name:"The Hermit",num:"IX",keywords:["soul-searching","introspection","solitude","inner guidance"],meaning:"Step back from the noise. The lantern you carry lights only the next step — that is enough."},
  {name:"Wheel of Fortune",num:"X",keywords:["good luck","karma","life cycles","destiny","turning point"],meaning:"The wheel always turns. What rises must fall; what has fallen will rise again. Trust the cycle."},
  {name:"Justice",num:"XI",keywords:["justice","fairness","truth","cause and effect","law"],meaning:"Honest reckoning. Every action ripples outward — what you send returns to you in kind."},
  {name:"The Hanged Man",num:"XII",keywords:["surrender","letting go","new perspectives","suspension"],meaning:"Pause voluntarily before you are made to stop. A new angle of vision awaits the patient."},
  {name:"Death",num:"XIII",keywords:["endings","transformation","transition","letting go"],meaning:"Something must end for something new to begin. Death is the most honest transformer."},
  {name:"Temperance",num:"XIV",keywords:["balance","moderation","patience","purpose","meaning"],meaning:"Alchemy happens slowly. Blend, test, adjust. The middle path leads somewhere remarkable."},
  {name:"The Devil",num:"XV",keywords:["shadow self","addiction","restriction","materialism"],meaning:"You may be more free than you feel. Examine what chains you — many are of your own making."},
  {name:"The Tower",num:"XVI",keywords:["sudden change","upheaval","chaos","revelation","awakening"],meaning:"The structure was never as solid as you believed. What falls in fire was built on false ground."},
  {name:"The Star",num:"XVII",keywords:["hope","faith","rejuvenation","spirituality"],meaning:"After the storm, the stars appear. Renewal is not just possible — it is already underway."},
  {name:"The Moon",num:"XVIII",keywords:["illusion","fear","the unconscious","confusion","complexity"],meaning:"Not everything you fear is real. Navigate the liminal space between waking and dreaming with care."},
  {name:"The Sun",num:"XIX",keywords:["positivity","fun","warmth","success","vitality"],meaning:"Uncomplicated joy. Bask in what is going right. The sun asks nothing of you but to feel it."},
  {name:"Judgement",num:"XX",keywords:["reflection","reckoning","awakening","absolution"],meaning:"Answer the call. You are being invited to step into a larger version of yourself."},
  {name:"The World",num:"XXI",keywords:["completion","integration","accomplishment","travel"],meaning:"A cycle closes in wholeness. You have arrived. Let yourself inhabit this completion fully."},
];
const MINOR={Wands:{pips:[{n:1,name:"Ace of Wands",keywords:["inspiration","new venture","spark","creative force"],meaning:"A bolt of creative fire. A new passion, project, or calling is being handed to you — take it."},{n:2,name:"2 of Wands",keywords:["planning","future vision","discovery","restlessness"],meaning:"You hold the world in your hands but haven't stepped through the door yet. The plan is forming; trust its pull."},{n:3,name:"3 of Wands",keywords:["expansion","foresight","overseas opportunities","progress"],meaning:"Your ships are coming in. Early efforts bear fruit and the horizon widens — keep watching for what returns."},{n:4,name:"4 of Wands",keywords:["celebration","homecoming","harmony","milestones"],meaning:"A moment of genuine joy and stability. Celebrate what you've built — the foundation is worthy of a party."},{n:5,name:"5 of Wands",keywords:["competition","conflict","rivalry","tension"],meaning:"Too many wands swinging at once. This isn't war — it's the creative friction of people who all care."},{n:6,name:"6 of Wands",keywords:["victory","recognition","public praise","confidence"],meaning:"You've earned this win, and others see it too. Accept the laurels — visibility is part of the reward."},{n:7,name:"7 of Wands",keywords:["defensiveness","perseverance","standing your ground","challenge"],meaning:"You're on higher ground but under pressure. Hold your position — you have the advantage."},{n:8,name:"8 of Wands",keywords:["swift action","movement","messages","momentum"],meaning:"Everything accelerates. News arrives, plans take flight, and delays dissolve. Ride the current."},{n:9,name:"9 of Wands",keywords:["resilience","persistence","last stand","boundaries"],meaning:"You're battle-weary but still standing. One more push is all that's needed."},{n:10,name:"10 of Wands",keywords:["burden","overcommitment","responsibility","hard work"],meaning:"You're carrying too much and it shows. Some of these burdens were never yours. Set a few down."}],courts:[{court:"Page",name:"Page of Wands",keywords:["exploration","excitement","free spirit","discovery"],meaning:"A spark of curiosity lights up — an idea, an invitation, or news that stirs your creative hunger."},{court:"Knight",name:"Knight of Wands",keywords:["energy","passion","adventure","impulsiveness"],meaning:"Headlong into the fire. The Knight charges forward on charisma and conviction — inspiring but not always careful."},{court:"Queen",name:"Queen of Wands",keywords:["courage","confidence","warmth","determination"],meaning:"She walks into every room like she belongs there — because she does. Magnetic confidence paired with genuine warmth."},{court:"King",name:"King of Wands",keywords:["leadership","vision","boldness","entrepreneurship"],meaning:"A natural leader who inspires through sheer force of vision. He sees the big picture and has the nerve to build it."}]},
Cups:{pips:[{n:1,name:"Ace of Cups",keywords:["new love","compassion","emotional awakening","creativity"],meaning:"The cup overflows. A new emotional beginning — love, deep feeling, or spiritual connection pours in."},{n:2,name:"2 of Cups",keywords:["partnership","mutual attraction","unity","connection"],meaning:"Two hearts finding each other. A bond of genuine reciprocity — romantic, platonic, or creative."},{n:3,name:"3 of Cups",keywords:["friendship","celebration","community","collaboration"],meaning:"Raise a glass with the people who see you. Joy shared is joy multiplied — this is the card of chosen family."},{n:4,name:"4 of Cups",keywords:["apathy","contemplation","disconnection","reevaluation"],meaning:"A gift sits before you, but you can't see it through the fog of discontent. Look up — something is being offered."},{n:5,name:"5 of Cups",keywords:["loss","grief","regret","disappointment"],meaning:"Three cups have spilled, but two still stand behind you. Mourning is necessary, but don't forget what remains."},{n:6,name:"6 of Cups",keywords:["nostalgia","childhood","innocence","reunion"],meaning:"A tender glance backward. Old memories, old friends, or the return of something you thought was lost to time."},{n:7,name:"7 of Cups",keywords:["fantasy","illusion","choices","wishful thinking"],meaning:"So many glittering options, but which are real? Not every vision in the clouds can survive contact with the ground."},{n:8,name:"8 of Cups",keywords:["walking away","disillusionment","seeking deeper meaning","leaving behind"],meaning:"Something that once fulfilled you no longer does. Walking away isn't failure — it's honesty about what you need."},{n:9,name:"9 of Cups",keywords:["contentment","satisfaction","wish fulfilled","emotional stability"],meaning:"The wish card. What you wanted has arrived or is arriving. Let yourself feel the simple pleasure of enough."},{n:10,name:"10 of Cups",keywords:["divine love","harmony","family","emotional fulfillment"],meaning:"The whole rainbow. Deep, lasting happiness — the kind that comes from love freely given and a life well-shared."}],courts:[{court:"Page",name:"Page of Cups",keywords:["creative spark","intuition","curiosity","emotional openness"],meaning:"A dreamy messenger bearing a surprising feeling or creative impulse. Stay open to what the little fish has to say."},{court:"Knight",name:"Knight of Cups",keywords:["romance","charm","imagination","following the heart"],meaning:"The romantic on a white horse. He follows his heart above all else — beautiful, if sometimes impractical."},{court:"Queen",name:"Queen of Cups",keywords:["compassion","emotional depth","intuition","nurturing"],meaning:"She feels everything and has learned to hold it all without drowning. Deeply intuitive, a steady emotional anchor."},{court:"King",name:"King of Cups",keywords:["emotional maturity","diplomacy","calm","wisdom"],meaning:"Still waters run deep. He has mastered his emotions without suppressing them — composure born of genuine understanding."}]},
Swords:{pips:[{n:1,name:"Ace of Swords",keywords:["clarity","breakthrough","truth","new idea"],meaning:"The sword cuts through the fog. A moment of razor-sharp clarity, a new idea, or a truth that can no longer be denied."},{n:2,name:"2 of Swords",keywords:["indecision","stalemate","denial","difficult choices"],meaning:"The blindfold is self-imposed. You already know the answer — you're choosing not to look at it yet."},{n:3,name:"3 of Swords",keywords:["heartbreak","sorrow","grief","painful truth"],meaning:"The three swords pierce the heart in rain. Some truths hurt. Name the pain so it can begin to pass through you."},{n:4,name:"4 of Swords",keywords:["rest","recovery","contemplation","restoration"],meaning:"Lay down your sword. This is not defeat — it is the strategic retreat that makes the next fight possible."},{n:5,name:"5 of Swords",keywords:["conflict","defeat","betrayal","hollow victory"],meaning:"Someone won, but nobody feels good about it. Ask whether the battle was worth the cost — to anyone."},{n:6,name:"6 of Swords",keywords:["transition","moving on","calmer waters","leaving behind"],meaning:"The boat moves toward quieter shores. You carry your sorrows with you, but at least you're moving forward."},{n:7,name:"7 of Swords",keywords:["deception","strategy","stealth","getting away with something"],meaning:"Someone is slipping away with swords that aren't theirs. Check your blind spots — or check your own hands."},{n:8,name:"8 of Swords",keywords:["restriction","isolation","self-imposed limitation","victim mentality"],meaning:"Bound and blindfolded, but the bindings are loose. The prison is more mental than physical — you can walk away."},{n:9,name:"9 of Swords",keywords:["anxiety","nightmares","despair","mental anguish"],meaning:"The swords on the wall are fears, not facts. The worst hour is the one before dawn — and dawn is coming."},{n:10,name:"10 of Swords",keywords:["rock bottom","painful ending","defeat","finality"],meaning:"Ten swords in the back — overkill, almost theatrical. This is the absolute end. But look: the sun is rising."}],courts:[{court:"Page",name:"Page of Swords",keywords:["curiosity","mental agility","new ideas","vigilance"],meaning:"Sharp-eyed and quick-witted, the Page watches everything. A message about truth, or the restless hunger to understand."},{court:"Knight",name:"Knight of Swords",keywords:["ambition","fast action","drive","intellectual charge"],meaning:"He charges headlong into the fray, sword raised, thinking later. Brilliant speed — but mind the collateral damage."},{court:"Queen",name:"Queen of Swords",keywords:["independence","clear perception","direct communication","truth"],meaning:"She has suffered, and her suffering made her wise. Unflinching honesty wrapped in hard-won composure."},{court:"King",name:"King of Swords",keywords:["intellectual authority","truth","analytical power","ethics"],meaning:"He judges clearly and speaks precisely. Authority grounded in fairness and mental discipline — not warmth, but justice."}]},
Pentacles:{pips:[{n:1,name:"Ace of Pentacles",keywords:["new opportunity","prosperity","manifestation","abundance"],meaning:"A golden coin offered from the heavens. A material opportunity — financial, professional, or physical — is arriving."},{n:2,name:"2 of Pentacles",keywords:["balance","adaptability","juggling priorities","flexibility"],meaning:"The figure-eight dance of keeping two things in the air. You can manage this — just don't pretend the juggle isn't happening."},{n:3,name:"3 of Pentacles",keywords:["teamwork","craftsmanship","collaboration","skill"],meaning:"The mason, the monk, and the architect all need each other. Mastery is built collaboratively, stone by careful stone."},{n:4,name:"4 of Pentacles",keywords:["control","security","possessiveness","conservation"],meaning:"Holding on tight to what you have. Security is wise, but grip too hard and you close yourself to what could flow in."},{n:5,name:"5 of Pentacles",keywords:["hardship","poverty","isolation","worry"],meaning:"Out in the cold, passing beneath a lit window. Help is closer than you think — but you have to be willing to ask."},{n:6,name:"6 of Pentacles",keywords:["generosity","charity","sharing wealth","reciprocity"],meaning:"One hand gives, another receives, and the scales hang between them. The flow of generosity keeps abundance alive."},{n:7,name:"7 of Pentacles",keywords:["patience","long-term investment","assessment","perseverance"],meaning:"The gardener pauses to look at what's growing. Not every harvest is immediate — trust the slow work you've put in."},{n:8,name:"8 of Pentacles",keywords:["apprenticeship","skill development","diligence","mastery"],meaning:"Head down, hands busy, one pentacle at a time. The quiet devotion of someone becoming genuinely good at what they do."},{n:9,name:"9 of Pentacles",keywords:["luxury","self-sufficiency","financial independence","refinement"],meaning:"The falcon on her wrist, the vineyard at her feet. You built this abundance yourself — enjoy what your discipline created."},{n:10,name:"10 of Pentacles",keywords:["legacy","inheritance","family wealth","long-term success"],meaning:"Three generations under one arch. Wealth that lasts because it was built on something deeper than money."}],courts:[{court:"Page",name:"Page of Pentacles",keywords:["ambition","desire to learn","new financial opportunity","studiousness"],meaning:"Steady eyes fixed on the coin. The Page studies with quiet intensity — a new skill, a new plan, a seed of future abundance."},{court:"Knight",name:"Knight of Pentacles",keywords:["reliability","hard work","routine","methodical progress"],meaning:"The slowest knight, but the one who always arrives. Dependable, thorough, and willing to do the unglamorous work."},{court:"Queen",name:"Queen of Pentacles",keywords:["nurturing","practical abundance","domestic comfort","generosity"],meaning:"She makes any space feel like home. Abundance expressed through care — good food, warm rooms, and a steady presence."},{court:"King",name:"King of Pentacles",keywords:["wealth","business acumen","security","material success"],meaning:"He built an empire with patience and pragmatism. Abundance achieved, managed wisely, and shared with quiet confidence."}]}};
function buildMinors(){const c=[];SUITS.forEach(s=>{MINOR[s].pips.forEach(p=>c.push({name:p.name,suit:s,keywords:p.keywords,meaning:p.meaning}));MINOR[s].courts.forEach(p=>c.push({name:p.name,suit:s,court:p.court,keywords:p.keywords,meaning:p.meaning}));});return c;}
const ALL_CARDS=[...MAJOR_ARCANA,...buildMinors()];

// ── Suit & Rank study descriptions ───────────────────────────────────
const SUIT_STUDY={"Major Arcana":{element:"The Journey",keywords:"archetypes · karma · life lessons",desc:"The Major Arcana traces the Fool's journey through 22 archetypal experiences — from innocence through mastery to completion. These cards point to significant life themes and moments of deep transformation that transcend the everyday."},Wands:{element:"Fire",keywords:"passion · will · creativity · ambition",desc:"The suit of fire — what drives you, your calling, the spark that initiates action. Wands speak to career, creative projects, and raw willpower. When Wands dominate a reading, the question is about energy and what you're building."},Cups:{element:"Water",keywords:"emotion · intuition · relationships · heart",desc:"The suit of water — matters of the heart, creative flow, and spiritual connection. Cups speak to love, friendship, and the inner life. When Cups appear, the question is about feeling, fulfillment, and what nourishes you."},Swords:{element:"Air",keywords:"intellect · truth · conflict · clarity",desc:"The suit of air — Swords cut to the heart of things, sometimes painfully. They speak to thought, communication, and the stories you tell yourself. When Swords dominate, the question is about honesty and mental clarity."},Pentacles:{element:"Earth",keywords:"material · work · body · resources",desc:"The suit of earth — material reality, craft, health, and resources. Pentacles ground the reading in the physical world. When Pentacles appear, the question is about security, skill, and what you're cultivating."}};
const RANK_STUDY={Ace:{name:"Aces",desc:"Pure potential — the seed of each element. Aces are gifts, beginnings, and raw force offered to you. It's up to you to take them."},"2":{name:"Twos",desc:"Duality and balance — the first encounter with choice. Twos ask you to weigh, partner, or find equilibrium."},"3":{name:"Threes",desc:"Growth and expression — the creative first fruits. Threes bring expansion, collaboration, and the first tangible results."},"4":{name:"Fours",desc:"Structure and stability — a foundation is set. Fours consolidate and protect, but can also restrict."},"5":{name:"Fives",desc:"Conflict and disruption — the break in the pattern. Fives challenge, destabilize, and force growth through friction."},"6":{name:"Sixes",desc:"Harmony and reciprocity — balance restored. Sixes offer healing, generosity, and the resolution of what the Fives disrupted."},"7":{name:"Sevens",desc:"Reflection and inner work — a step inward. Sevens ask you to assess, strategize, and confront what's hidden."},"8":{name:"Eights",desc:"Mastery and momentum — power in motion. Eights bring skill, speed, and the strength born of sustained effort."},"9":{name:"Nines",desc:"Near completion — the home stretch. Nines carry the weight of everything before, for better or worse."},"10":{name:"Tens",desc:"Culmination — the end of a cycle. Tens bring the fullest expression of their suit's energy, pointing toward what comes next."},Page:{name:"Pages",desc:"The student — curiosity, messages, and fresh perspective. Pages bring news or invite you to approach something with beginner's mind."},Knight:{name:"Knights",desc:"The seeker — action, pursuit, and movement. Knights charge toward their goal, embodying their element in its most active form."},Queen:{name:"Queens",desc:"Mastery turned inward. Queens hold their element with depth, intuition, and emotional intelligence."},King:{name:"Kings",desc:"Mastery turned outward. Kings command their element with experience, responsibility, and leadership."}};

// ── Spreads & layouts ────────────────────────────────────────────────
const DEFAULT_SPREADS=[{id:"s1",name:"Three Card",positions:[{id:"p1",label:"Past",meaning:"What has led to this moment"},{id:"p2",label:"Present",meaning:"Where you stand right now"},{id:"p3",label:"Future",meaning:"Where this path leads"}]},{id:"s2",name:"Daily Card",positions:[{id:"p1",label:"Today",meaning:"The energy or lesson of the day"}]},{id:"s3",name:"Celtic Cross",positions:[{id:"p1",label:"Present",meaning:"The heart of the matter"},{id:"p2",label:"Challenge",meaning:"What crosses you"},{id:"p3",label:"Foundation",meaning:"Foundations beneath"},{id:"p4",label:"Recent Past",meaning:"What is passing away"},{id:"p5",label:"Crown",meaning:"What could emerge"},{id:"p6",label:"Near Future",meaning:"What approaches"},{id:"p7",label:"Self",meaning:"How you show up"},{id:"p8",label:"Environment",meaning:"Outside influences"},{id:"p9",label:"Hopes & Fears",meaning:"Your inner stakes"},{id:"p10",label:"Outcome",meaning:"Where this leads"}]},{id:"s4",name:"Situation · Advice · Outcome",positions:[{id:"p1",label:"Situation",meaning:"The current state of things"},{id:"p2",label:"Advice",meaning:"What the cards suggest"},{id:"p3",label:"Outcome",meaning:"Likely result if advice followed"}]}];
const SLOT_W=54,SLOT_H=66;
const PRESET_LAYOUTS={s1:{height:100,cards:[{posId:"p1",cx:18,cy:50},{posId:"p2",cx:50,cy:50},{posId:"p3",cx:82,cy:50}]},s2:{height:100,cards:[{posId:"p1",cx:50,cy:50}]},s3:{height:330,cards:[{posId:"p1",cx:26,cy:42},{posId:"p2",cx:26,cy:42,rotate:90},{posId:"p3",cx:26,cy:72},{posId:"p4",cx:8,cy:42},{posId:"p5",cx:26,cy:13},{posId:"p6",cx:44,cy:42},{posId:"p7",cx:80,cy:86},{posId:"p8",cx:80,cy:62},{posId:"p9",cx:80,cy:38},{posId:"p10",cx:80,cy:14}]},s4:{height:100,cards:[{posId:"p1",cx:18,cy:50},{posId:"p2",cx:50,cy:50},{posId:"p3",cx:82,cy:50}]}};
function autoLayout(pos){const n=pos.length;if(!n)return{height:100,cards:[]};if(n===1)return{height:100,cards:[{posId:pos[0].id,cx:50,cy:50}]};const cols=n<=3?n:n<=8?Math.min(4,Math.ceil(n/2)):Math.min(4,Math.ceil(n/3));const rows=Math.ceil(n/cols);const cw=100/cols;return{height:rows*90+16,cards:pos.map((p,i)=>{const r=Math.floor(i/cols),c=i%cols,ir=Math.min(cols,n-r*cols),o=(cols-ir)*cw/2;return{posId:p.id,cx:o+c*cw+cw/2,cy:((r+.5)/rows)*100};})};}
function getSpreadLayout(sp){return PRESET_LAYOUTS[sp.id]||autoLayout(sp.positions);}
function getEntryLayout(e){if(e.spreadId&&PRESET_LAYOUTS[e.spreadId])return PRESET_LAYOUTS[e.spreadId];const m=DEFAULT_SPREADS.find(s=>s.name===e.spreadName);return(m&&PRESET_LAYOUTS[m.id])||autoLayout((e.slots||[]).map((s,i)=>({id:s.posId||`a${i}`,label:s.label})));}

// ══════════════════════════════════════════════════════════════════
// THEME SYSTEM — 3 presets, dynamic application
// ══════════════════════════════════════════════════════════════════
const THEMES = {
  forest: {
    id:"forest", name:"Forest Canopy", mode:"light",
    gradient:"linear-gradient(180deg,#3a6844 0%,#5a8a5a 12%,#7aaa78 24%,#a0c898 38%,#c4debb 50%,#dcecd4 62%,#e8f2e4 72%,#dcecd4 82%,#b0d0a8 90%,#7aaa78 96%,#4a7a50 100%)",
    headerBg:"rgba(58,104,68,0.92)", navBg:"rgba(64,108,72,0.92)",
    lightText:"#f0f8ec", lightDim:"#b8d8b0", navActive:"#e8f8e0", navInactive:"#b8d8b0",
    accent:"#3a6a3e", accentDim:"#5a8a5e", moss:"#3a8a50",
    text:"#1e3a22", textMid:"#4a6a3e", textDim:"#5a8a5e", rose:"#904030",
    card:"rgba(248,244,234,0.55)", cardHover:"rgba(248,244,234,0.65)", input:"rgba(240,236,224,0.45)",
    border:"rgba(200,190,165,0.3)", borderFaint:"rgba(200,190,165,0.18)",
    shadow:"0 1px 4px rgba(40,60,30,0.06)", pill:"rgba(60,90,50,0.08)", pillBorder:"rgba(80,110,60,0.18)",
    suitColors:{Wands:"#a04820",Cups:"#2860a0",Swords:"#6a7080",Pentacles:"#2a6a28"},
  },
  twilight: {
    id:"twilight", name:"Twilight Grove", mode:"dark",
    gradient:"linear-gradient(180deg,#1e1832 0%,#2a2048 12%,#3a3065 24%,#5a4890 38%,#7868b0 48%,#9888c8 56%,#b8a8d8 62%,#9888c8 72%,#6858a0 82%,#3a3065 92%,#241a3a 100%)",
    headerBg:"rgba(30,24,50,0.92)", navBg:"rgba(36,26,58,0.92)",
    lightText:"#e8e0f0", lightDim:"#b0a0c8", navActive:"#e8daf0", navInactive:"#a898c0",
    accent:"#c9a96e", accentDim:"#a08848", moss:"#b0986a",
    text:"#ede0d0", textMid:"#c8b8a0", textDim:"#8a7a98", rose:"#c07070",
    card:"rgba(40,30,60,0.55)", cardHover:"rgba(50,38,75,0.65)", input:"rgba(30,22,48,0.5)",
    border:"rgba(100,80,140,0.3)", borderFaint:"rgba(80,60,120,0.2)",
    shadow:"0 1px 4px rgba(10,6,20,0.15)", pill:"rgba(200,170,110,0.1)", pillBorder:"rgba(200,170,110,0.2)",
    suitColors:{Wands:"#e08040",Cups:"#60a0d0",Swords:"#a0b0b8",Pentacles:"#60aa58"},
  },
  autumn: {
    id:"autumn", name:"Autumn Moor", mode:"light",
    gradient:"linear-gradient(180deg,#5a3828 0%,#7a5438 12%,#a07850 24%,#c4a070 38%,#dcc098 50%,#ece0cc 60%,#f4ece0 70%,#ece0cc 80%,#c4a878 90%,#8a6840 96%,#5a3a28 100%)",
    headerBg:"rgba(90,56,40,0.92)", navBg:"rgba(96,60,44,0.92)",
    lightText:"#f4ece0", lightDim:"#d0b898", navActive:"#f4ece0", navInactive:"#c8b090",
    accent:"#7a4a28", accentDim:"#9a6a40", moss:"#8a6030",
    text:"#3a2818", textMid:"#6a4a30", textDim:"#9a7a58", rose:"#8a3030",
    card:"rgba(252,248,240,0.55)", cardHover:"rgba(252,248,240,0.65)", input:"rgba(244,236,220,0.45)",
    border:"rgba(180,150,110,0.3)", borderFaint:"rgba(180,150,110,0.18)",
    shadow:"0 1px 4px rgba(60,40,20,0.06)", pill:"rgba(120,70,30,0.08)", pillBorder:"rgba(140,90,40,0.18)",
    suitColors:{Wands:"#a04820",Cups:"#2860a0",Swords:"#6a7080",Pentacles:"#4a7a30"},
  },
};

// ── Mutable theme state ──────────────────────────────────────────────
let C = {}, V = {};
function applyTheme(id) {
  const t = THEMES[id] || THEMES.forest;
  C = { ...t, fontDisplay:"'Marcellus',Georgia,serif", fontBody:"'Lora',Georgia,serif" };
  V = { card:t.card, cardHover:t.cardHover, input:t.input, border:t.border, borderFaint:t.borderFaint, shadow:t.shadow, pill:t.pill, pillBorder:t.pillBorder };
}
applyTheme("forest"); // initial

// ── Suit helpers (theme-aware) ───────────────────────────────────────
const suitSymbol=c=>{if(!c)return"✦";return{Wands:"🜂",Cups:"🜄",Swords:"🜁",Pentacles:"🜃"}[c.suit]||"✦";};
const suitColor=c=>{if(!c||!c.suit)return C.accent;return C.suitColors?.[c.suit]||C.accent;};
const suitBg=c=>{if(!c||!c.suit)return V.card;const dk=C.mode==="dark";const m={Wands:dk?"rgba(80,40,20,0.3)":"rgba(248,240,232,0.65)",Cups:dk?"rgba(20,40,80,0.3)":"rgba(234,242,250,0.65)",Swords:dk?"rgba(50,55,65,0.3)":"rgba(242,244,248,0.65)",Pentacles:dk?"rgba(25,55,25,0.3)":"rgba(238,246,236,0.65)"};return m[c.suit]||V.card;};
const suitBorder=c=>{if(!c||!c.suit)return V.border;const dk=C.mode==="dark";const m={Wands:dk?"rgba(200,120,60,0.25)":"rgba(180,120,90,0.25)",Cups:dk?"rgba(80,140,200,0.25)":"rgba(80,120,170,0.2)",Swords:dk?"rgba(160,170,190,0.25)":"rgba(140,150,170,0.25)",Pentacles:dk?"rgba(80,160,70,0.25)":"rgba(70,120,60,0.2)"};return m[c.suit]||V.border;};
const suitBar=c=>{if(!c||!c.suit)return"transparent";const sc=suitColor(c);return`linear-gradient(180deg,${sc}50,${sc}15)`;};
const suitSymbolBg=c=>{const sc=suitColor(c);return sc+"18";};

const todayKey=()=>new Date().toISOString().slice(0,10);
const formatDate=()=>new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

// ── Compute styles from current theme ────────────────────────────────
function computeStyles(){return{
  root:{minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:C.fontBody,color:C.text,maxWidth:480,margin:"0 auto",position:"relative"},
  gradientBg:{position:"fixed",inset:0,background:C.gradient,zIndex:0},
  loading:{minHeight:"100vh",background:C.mode==="dark"?"#1e1832":"#dcecd4",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12},
  header:{background:C.headerBg,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",padding:"max(16px, env(safe-area-inset-top, 16px)) 0 0",textAlign:"center",position:"sticky",top:0,zIndex:10},
  headerTitle:{fontSize:22,letterSpacing:8,color:C.lightText,fontWeight:400,fontFamily:C.fontDisplay},
  headerSub:{fontSize:10,letterSpacing:4,color:C.lightDim,marginTop:3,textTransform:"uppercase"},
  settingsBtn:{position:"absolute",top:"50%",right:16,transform:"translateY(-50%)",background:"none",border:"none",color:C.lightText,fontSize:18,cursor:"pointer",padding:4,lineHeight:1,opacity:0.7},
  main:{flex:1,overflowY:"auto",paddingBottom:90,position:"relative",zIndex:1,background:C.mode==="dark"?"rgba(20,14,36,0.25)":"rgba(248,244,234,0.35)"},
  nav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.navBg,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",zIndex:10,paddingBottom:"max(14px, env(safe-area-inset-bottom, 14px))"},
  navBtn:{flex:1,background:"none",border:"none",color:C.navInactive,cursor:"pointer",padding:"10px 0 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"color .2s"},
  navBtnActive:{color:C.navActive},navIcon:{fontSize:18},navLabel:{fontSize:9,letterSpacing:2,textTransform:"uppercase"},
  section:{padding:"22px 16px 16px",position:"relative",zIndex:1},
  sectionSafe:{padding:"max(22px, env(safe-area-inset-top, 22px)) 16px 16px",position:"relative",zIndex:1},
  pageTitle:{fontFamily:C.fontDisplay,fontSize:25,fontWeight:400,letterSpacing:3,color:C.text,margin:"0 0 22px",textAlign:"center"},
  backBtn:{background:"none",border:"none",color:C.text,fontSize:14,cursor:"pointer",padding:"0 0 18px",letterSpacing:1,fontWeight:500,opacity:0.8},
  quickRow:{display:"flex",gap:12,marginBottom:22},
  quickBtn:{flex:1,background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"18px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer",boxShadow:V.shadow},
  quickBtnLabel:{fontSize:11,letterSpacing:2,textTransform:"uppercase"},
  stalkerBox:{background:V.card,border:`1px solid ${C.accent}30`,borderRadius:12,padding:"16px",marginBottom:22,textAlign:"center",boxShadow:V.shadow},
  stalkerLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase",marginBottom:5},
  stalkerCard:{fontSize:19,color:C.accent,letterSpacing:1,fontFamily:C.fontDisplay},
  stalkerCount:{fontSize:11,color:C.textDim,marginTop:5},
  sectionHeaderRow:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,marginTop:6},
  sectionHeaderLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase"},
  sectionHeaderAction:{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",letterSpacing:1},
  entryCard:{width:"100%",background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"13px 15px",marginBottom:10,textAlign:"left",cursor:"pointer",boxShadow:V.shadow},
  entryCardPill:{fontSize:10,background:V.pill,border:`1px solid ${V.pillBorder}`,borderRadius:12,padding:"2px 9px",color:C.textMid},
  drawArea:{display:"flex",justifyContent:"center",padding:"32px 0"},
  cardBack:{width:132,height:204,background:V.cardHover,border:`2px solid ${C.accentDim}`,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",boxShadow:"0 8px 32px rgba(0,0,0,0.1)"},
  drawnCard:{border:"1px solid",borderRadius:14,padding:"22px 18px",marginBottom:16,textAlign:"center",boxShadow:V.shadow},
  drawnCardName:{fontSize:21,letterSpacing:2,color:C.text,margin:"10px 0",fontFamily:C.fontDisplay},
  drawnCardMeaning:{fontSize:14,color:C.textMid,lineHeight:1.7,fontStyle:"italic",margin:0},
  slotPanel:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"15px",marginBottom:12,boxShadow:V.shadow},
  slotPanelHeader:{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12},
  slotPanelNum:{width:28,height:28,borderRadius:"50%",background:V.input,border:`1px solid ${C.accentDim}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.accent,flexShrink:0,fontFamily:C.fontDisplay},
  slotPanelNav:{display:"flex",justifyContent:"space-between",marginTop:12,gap:8},
  slotNavBtn:{background:"none",border:`1px solid ${V.borderFaint}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.textDim,cursor:"pointer",flex:1,textAlign:"center"},
  slotLabel:{fontSize:14,color:C.accent,letterSpacing:1,marginBottom:3},slotMeaning:{fontSize:11,color:C.textDim,fontStyle:"italic"},
  clarifierToggle:{background:"none",border:"none",color:C.textDim,fontSize:11,letterSpacing:1,cursor:"pointer",marginTop:7,padding:0},
  clarifierArea:{display:"flex",gap:10,alignItems:"flex-start",marginTop:10,paddingLeft:14},
  clarifierLine:{width:2,alignSelf:"stretch",background:V.border,borderRadius:2},
  clarifierLabel:{fontSize:10,color:C.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:5},
  cardPill:{display:"inline-block",border:"1px solid",borderRadius:20,padding:"4px 13px",fontSize:12,margin:"4px 4px 0 0"},
  slotCardCompact:{display:"flex",alignItems:"center",background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:"10px 13px",marginBottom:6,cursor:"pointer",boxShadow:V.shadow},
  slotDetailExpanded:{border:"1px solid",borderRadius:12,padding:"15px",marginBottom:12,boxShadow:`0 2px 12px rgba(0,0,0,0.06)`},
  mapProgress:{textAlign:"center",fontSize:10,color:C.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:14},
  mapHint:{textAlign:"center",fontSize:10,color:C.textDim,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12,marginTop:-8},
  cardSelectBtn:{width:"100%",background:V.input,border:`1px solid ${V.border}`,borderRadius:9,padding:"11px 13px",textAlign:"left",fontSize:13,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",gap:9},
  cardSelectOpen:{background:V.cardHover,border:`1px solid ${V.border}`,borderRadius:12,overflow:"hidden",marginBottom:4},
  cardSearchInput:{width:"100%",background:V.input,border:"none",borderBottom:`1px solid ${V.border}`,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",boxSizing:"border-box",fontFamily:C.fontBody},
  cardList:{maxHeight:190,overflowY:"auto"},
  cardListItem:{width:"100%",background:"none",border:"none",borderBottom:`1px solid ${V.borderFaint}`,padding:"10px 13px",textAlign:"left",fontSize:12,color:C.textMid,cursor:"pointer"},
  cardSelectCancel:{width:"100%",background:"none",border:"none",borderTop:`1px solid ${V.border}`,padding:"10px",fontSize:11,color:C.textDim,cursor:"pointer",letterSpacing:2,textTransform:"uppercase"},
  spreadPickCard:{width:"100%",background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"15px 17px",marginBottom:10,textAlign:"left",cursor:"pointer",boxShadow:V.shadow},
  spreadPickName:{fontSize:15,color:C.accent,letterSpacing:1,marginBottom:5,fontFamily:C.fontDisplay},
  spreadPickPositions:{fontSize:11,color:C.textDim},
  posRow:{display:"flex",gap:9,alignItems:"flex-start",marginBottom:10},
  posReorder:{display:"flex",flexDirection:"column",gap:3,paddingTop:2},
  reorderBtn:{background:V.card,border:`1px solid ${V.border}`,borderRadius:4,color:C.textDim,fontSize:10,cursor:"pointer",padding:"2px 6px"},
  removeBtn:{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:15,paddingTop:10},
  entryQuestion:{fontSize:13,color:C.textMid,fontStyle:"italic",textAlign:"center",marginBottom:16,padding:"12px 16px",background:V.card,borderRadius:10,border:`1px solid ${V.border}`},
  globalNote:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"15px",fontSize:13,color:C.textMid,lineHeight:1.7,fontStyle:"italic",marginTop:8,marginBottom:8,boxShadow:V.shadow},
  savedBanner:{textAlign:"center",color:C.accent,fontSize:13,letterSpacing:2,padding:"16px",background:V.card,border:`1px solid ${C.accentDim}50`,borderRadius:12,marginTop:10},
  infoNote:{fontSize:11,color:C.textDim,background:V.card,border:`1px solid ${V.border}`,borderRadius:9,padding:"9px 13px",marginBottom:12,textAlign:"center"},
  filterRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18},
  filterBtn:{background:V.card,border:`1px solid ${V.border}`,borderRadius:18,padding:"6px 13px",fontSize:11,color:C.textDim,cursor:"pointer",letterSpacing:1},
  filterBtnActive:{background:V.cardHover,borderColor:C.accentDim+"50",color:C.accent},
  cardGrid:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:9},
  cardGridItem:{background:V.card,border:"1px solid",borderRadius:10,padding:"11px 7px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",position:"relative",boxShadow:V.shadow},
  cardGridName:{fontSize:10,color:C.textMid,textAlign:"center",lineHeight:1.3},
  cardGridEdited:{position:"absolute",top:5,right:7,fontSize:9,color:C.accentDim},
  cardDetailHero:{border:"1px solid",borderRadius:14,padding:"26px 16px",textAlign:"center",marginBottom:18,boxShadow:V.shadow},
  cardDetailName:{fontSize:23,letterSpacing:3,color:C.text,fontWeight:400,margin:"10px 0 5px",fontFamily:C.fontDisplay},
  tabRow:{display:"flex",gap:0,marginBottom:18,border:`1px solid ${V.border}`,borderRadius:9,overflow:"hidden"},
  tabBtn:{flex:1,background:"none",border:"none",padding:"11px",fontSize:12,color:C.textDim,cursor:"pointer",letterSpacing:1},
  tabBtnActive:{background:V.cardHover,color:C.accent},
  cardStandard:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"18px",boxShadow:V.shadow},
  cardMeaningText:{fontSize:14,color:C.textMid,lineHeight:1.8,fontStyle:"italic",margin:0},
  cardMine:{display:"flex",flexDirection:"column",gap:9},
  deckGrid:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:13,marginTop:8},
  deckCard:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",textAlign:"left",boxShadow:V.shadow},
  deckThumb:{width:"100%",height:115,objectFit:"cover"},
  deckThumbPlaceholder:{width:"100%",height:115,background:V.input,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,color:C.textDim+"40"},
  tagRow:{display:"flex",flexWrap:"wrap",gap:7,marginBottom:13},
  tag:{background:V.cardHover,border:`1px solid ${C.accentDim}50`,borderRadius:14,padding:"4px 12px",fontSize:11,color:C.accent},
  photoUpload:{display:"block",width:"100%",background:V.card,border:`2px dashed ${V.border}`,borderRadius:12,padding:"22px",textAlign:"center",fontSize:13,color:C.textDim,cursor:"pointer",marginBottom:13,boxSizing:"border-box"},
  photoGrid:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:9,marginBottom:16},
  photoThumb:{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:9},
  input:{width:"100%",background:V.input,border:`1px solid ${V.border}`,borderRadius:9,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",marginBottom:9,fontFamily:"inherit",boxSizing:"border-box"},
  textarea:{width:"100%",background:V.input,border:`1px solid ${V.border}`,borderRadius:9,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",resize:"vertical",fontFamily:C.fontBody,lineHeight:1.7,boxSizing:"border-box"},
  fieldLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase",display:"block",marginBottom:5},
  btnPrimary:{width:"100%",background:V.cardHover,border:`1px solid ${C.accentDim}50`,borderRadius:10,padding:"14px",fontSize:13,color:C.accent,cursor:"pointer",letterSpacing:2,textTransform:"uppercase",marginTop:5},
  btnSecondary:{flex:1,background:"none",border:`1px solid ${V.border}`,borderRadius:10,padding:"12px",fontSize:12,color:C.textDim,cursor:"pointer",letterSpacing:1},
  btnRow:{display:"flex",gap:10,marginTop:10},
  settingsList:{display:"flex",flexDirection:"column",gap:2,marginBottom:24},
  settingsRow:{display:"flex",alignItems:"center",justifyContent:"space-between",background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:"12px 14px",boxShadow:V.shadow},
  settingsRowBtn:{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",letterSpacing:.5},
  emptyState:{textAlign:"center",color:C.textDim,fontSize:12,letterSpacing:2,padding:"28px 0",textTransform:"uppercase"},
  modalOverlay:{position:"fixed",inset:0,background:C.mode==="dark"?"rgba(10,6,20,0.6)":"rgba(30,58,34,0.4)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24},
  modalBox:{background:C.mode==="dark"?"#2a2040":"#f0f6ee",border:`1px solid ${V.border}`,borderRadius:14,padding:"24px 20px",maxWidth:340,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"},
  modalMessage:{fontSize:14,color:C.text,lineHeight:1.7,margin:"0 0 18px",textAlign:"center"},
  editCardDisplay:{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:"13px 16px",fontSize:15,color:C.text,textAlign:"center",marginBottom:16,letterSpacing:1},
  editMeta:{fontSize:11,color:C.textDim,letterSpacing:2,textAlign:"center",marginBottom:16,textTransform:"uppercase"},
  alreadyPulledBox:{background:V.card,border:`2px solid ${C.accentDim}50`,borderRadius:14,padding:"22px 18px",textAlign:"center",boxShadow:V.shadow},
  // Study header (suit/number expandable)
  studyHeader:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"14px 16px",marginBottom:14,cursor:"pointer",boxShadow:V.shadow},
  studyHeaderExpanded:{background:V.cardHover,border:`1px solid ${C.accent}30`,borderRadius:12,padding:"14px 16px",marginBottom:14,boxShadow:V.shadow},
  // Theme picker
  themePicker:{display:"flex",gap:8,marginBottom:24},
  themeOption:{flex:1,borderRadius:10,padding:"14px 8px",textAlign:"center",cursor:"pointer",border:"2px solid transparent",transition:"all 0.2s"},
  themeOptionActive:{borderColor:C.accent},
};}

let styles = computeStyles();

// ── Confirm Modal ────────────────────────────────────────────────────
function ConfirmModal({message,onConfirm,onCancel}){return(<div style={styles.modalOverlay}><div style={styles.modalBox}><p style={styles.modalMessage}>{message}</p><div style={styles.btnRow}><button style={styles.btnSecondary} onClick={onCancel}>Cancel</button><button style={{...styles.btnPrimary,flex:1,borderColor:C.rose+"60",color:C.rose}} onClick={onConfirm}>Delete</button></div></div></div>);}

// ═══════════════════════════════════════════════════════════════════
export default function TarotApp(){
  const [tab,setTab]=useState("journal");const [spreads,setSpreads]=useState(DEFAULT_SPREADS);const [entries,setEntries]=useState([]);const [cardNotes,setCardNotes]=useState({});const [decks,setDecks]=useState([]);const [loaded,setLoaded]=useState(false);const [showSettings,setShowSettings]=useState(false);
  const [themeId,setThemeId]=useState("forest");
  const [suitNotes,setSuitNotes]=useState({});const [rankNotes,setRankNotes]=useState({});

  // Apply theme synchronously before render
  applyTheme(themeId);
  styles = computeStyles();

  useEffect(()=>{(async()=>{
    const e=await store.get("entries");if(e)setEntries(e);
    const cn=await store.get("cardNotes");if(cn)setCardNotes(cn);
    const d=await store.get("decks");if(d)setDecks(d);
    const sp=await store.get("spreads");if(sp)setSpreads(sp);
    const ti=await store.get("themeId");if(ti)setThemeId(ti);
    const sn=await store.get("suitNotes");if(sn)setSuitNotes(sn);
    const rn=await store.get("rankNotes");if(rn)setRankNotes(rn);
    setLoaded(true);
  })();},[]);

  const saveEntries=useCallback(v=>{setEntries(v);store.set("entries",v);},[]);
  const saveCardNotes=useCallback(v=>{setCardNotes(v);store.set("cardNotes",v);},[]);
  const saveDecks=useCallback(v=>{setDecks(v);store.set("decks",v);},[]);
  const saveSpreads=useCallback(v=>{setSpreads(v);store.set("spreads",v);},[]);
  const saveSuitNotes=useCallback(v=>{setSuitNotes(v);store.set("suitNotes",v);},[]);
  const saveRankNotes=useCallback(v=>{setRankNotes(v);store.set("rankNotes",v);},[]);
  const saveTheme=useCallback(id=>{setThemeId(id);store.set("themeId",id);},[]);

  if(!loaded)return<div style={styles.loading}><div style={{color:C.accent,fontSize:32}}>✦</div><div style={{color:C.accent,fontFamily:C.fontBody,fontSize:14,letterSpacing:3}}>LOADING</div></div>;
  if(showSettings)return<div style={styles.root}><div style={styles.gradientBg}/><SettingsSection spreads={spreads} saveSpreads={saveSpreads} themeId={themeId} saveTheme={saveTheme} onBack={()=>setShowSettings(false)}/></div>;

  return(<div style={styles.root}><div style={styles.gradientBg}/>
    <Header onSettings={()=>setShowSettings(true)}/>
    <main style={styles.main}>
      {tab==="journal"&&<JournalSection entries={entries} saveEntries={saveEntries} spreads={spreads}/>}
      {tab==="cards"&&<CardsSection cardNotes={cardNotes} saveCardNotes={saveCardNotes} entries={entries} suitNotes={suitNotes} saveSuitNotes={saveSuitNotes} rankNotes={rankNotes} saveRankNotes={saveRankNotes}/>}
      {tab==="decks"&&<DecksSection decks={decks} saveDecks={saveDecks}/>}
    </main>
    <nav style={styles.nav}>{[{id:"journal",label:"Journal",icon:"◈"},{id:"cards",label:"Cards",icon:"✦"},{id:"decks",label:"Decks",icon:"◎"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{...styles.navBtn,...(tab===t.id?styles.navBtnActive:{})}}><span style={styles.navIcon}>{t.icon}</span><span style={styles.navLabel}>{t.label}</span></button>)}</nav>
  </div>);
}

function Header({onSettings}){return(<header style={styles.header}><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}><span style={{color:C.lightDim,fontSize:13}}>✦</span><span style={styles.headerTitle}>Arcana</span><span style={{color:C.lightDim,fontSize:13}}>✦</span></div><div style={styles.headerSub}>Personal Tarot Journal</div><div style={{height:1,background:`linear-gradient(90deg,transparent,${C.lightDim}30,transparent)`,marginTop:10}}/><button onClick={onSettings} style={styles.settingsBtn}>⚙</button></header>);}
function BackBtn({onClick}){return<button onClick={onClick} style={styles.backBtn}>← Back</button>;}
function SectionHeader({label,action,onAction}){return<div style={styles.sectionHeaderRow}><div style={styles.sectionHeaderLabel}>{label}</div>{action&&<button style={styles.sectionHeaderAction} onClick={onAction}>{action}</button>}</div>;}
function EmptyState({text}){return<div style={styles.emptyState}>{text}</div>;}
function EntryCard({entry,onClick}){return(<button style={styles.entryCard} onClick={onClick}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{fontSize:13,color:C.accent,letterSpacing:.5}}>{entry.spreadName}</span><span style={{fontSize:10,color:C.textDim,letterSpacing:1}}>{entry.date}</span></div>{entry.question&&<div style={{fontSize:12,color:C.textMid,fontStyle:"italic",marginBottom:5}}>"{entry.question}"</div>}{entry.isDaily&&entry.card&&<div style={{fontSize:13,color:C.text}}>{entry.card}</div>}{!entry.isDaily&&(entry.slots||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:5}}>{entry.slots.filter(s=>s.card).map(s=><span key={s.posId} style={styles.entryCardPill}>{s.card}</span>)}</div>}</button>);}

// ── Spread Map ───────────────────────────────────────────────────────
function SpreadMap({layout,slots,activeIdx,onSelect,readOnly}){if(!layout||!layout.cards)return null;return(<div style={{position:"relative",width:"100%",height:layout.height,marginBottom:16,borderRadius:14,background:V.input,border:`1px solid ${V.borderFaint}`,overflow:"hidden"}}><div style={{position:"absolute",inset:0,opacity:0.04,backgroundImage:`radial-gradient(circle,${C.accent} 1px,transparent 1px)`,backgroundSize:"28px 28px"}}/>{layout.cards.map((pos,li)=>{const si=slots.findIndex(s=>s.posId===pos.posId);const slot=si>=0?slots[si]:null;if(!slot)return null;const card=slot.card?ALL_CARDS.find(c=>c.name===slot.card):null;const hc=!!slot.card,hn=!!(slot.note&&slot.note.trim()),ia=si===activeIdx,rot=pos.rotate||0;let bg=V.input,bc=V.borderFaint;if(ia){bg=V.cardHover;bc=C.accent;}else if(hc&&hn){bg=V.cardHover;bc=suitColor(card)+"50";}else if(hc){bg=V.card;bc=suitColor(card)+"40";}return(<button key={pos.posId} onClick={()=>!readOnly&&onSelect&&onSelect(si)} style={{position:"absolute",left:`${pos.cx}%`,top:`${pos.cy}%`,transform:`translate(-50%,-50%)${rot?` rotate(${rot}deg)`:""}`,width:SLOT_W,height:SLOT_H,background:bg,border:`1.5px solid ${bc}`,borderRadius:8,cursor:readOnly?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,padding:3,zIndex:ia?5:rot?3:1,transition:"all 0.2s",boxShadow:ia?`0 0 12px ${C.accent}25`:hc?V.shadow:"none"}}>{hc?<span style={{fontSize:16,color:suitColor(card),lineHeight:1,transform:rot?`rotate(-${rot}deg)`:"none"}}>{suitSymbol(card)}</span>:<span style={{fontSize:13,color:C.textDim,fontWeight:600,lineHeight:1}}>{li+1}</span>}<span style={{fontSize:7,color:hc?C.textMid:C.textDim,textTransform:"uppercase",letterSpacing:.5,maxWidth:SLOT_W-8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center",lineHeight:1.2,transform:rot?`rotate(-${rot}deg)`:"none"}}>{slot.label}</span>{hc&&hn&&!ia&&<div style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:C.accent,transform:rot?`rotate(-${rot}deg)`:"none"}}/>}</button>);})}</div>);}

// ── Journal Section ──────────────────────────────────────────────────
function JournalSection({entries,saveEntries,spreads}){const [view,setView]=useState("home");const [ae,setAe]=useState(null);const [cd,setCd]=useState(null);const del=id=>saveEntries(entries.filter(e=>e.id!==id));const upd=u=>{saveEntries(entries.map(e=>e.id===u.id?u:e));setAe(u);};
  if(view==="daily")return<DailyPull onBack={()=>setView("home")} entries={entries} saveEntries={saveEntries}/>;
  if(view==="newEntry")return<NewEntry spreads={spreads} onSave={e=>{saveEntries([e,...entries]);setView("home");}} onBack={()=>setView("home")}/>;
  if(view==="editEntry"&&ae)return<EditEntry entry={ae} onSave={u=>{upd(u);setView("entry");}} onBack={()=>setView("entry")}/>;
  if(view==="entry"&&ae)return<EntryDetail entry={ae} onBack={()=>setView("home")} onEdit={()=>setView("editEntry")} onDelete={()=>setCd(ae.id)}/>;
  const stalker=getStalkerCard(entries);
  return(<div style={styles.section}>{cd&&<ConfirmModal message="Delete this reading?" onConfirm={()=>{del(cd);setCd(null);}} onCancel={()=>setCd(null)}/>}
    <div style={styles.quickRow}><QuickBtn icon="☽" label="Daily Pull" onClick={()=>setView("daily")} accent={C.text}/><QuickBtn icon="◈" label="New Reading" onClick={()=>setView("newEntry")} accent={C.moss}/></div>
    {stalker&&<div style={styles.stalkerBox}><div style={styles.stalkerLabel}>✦ Recurring Card</div><div style={styles.stalkerCard}>{stalker.name}</div><div style={styles.stalkerCount}>appeared {stalker.count}× in your journal</div></div>}
    <SectionHeader label="Past Readings"/>{entries.filter(e=>!e.isDaily).length===0&&<EmptyState text="Your readings will appear here"/>}{entries.filter(e=>!e.isDaily).map(e=><EntryCard key={e.id} entry={e} onClick={()=>{setAe(e);setView("entry");}}/>)}
    <SectionHeader label="Daily Pulls"/>{entries.filter(e=>e.isDaily).length===0&&<EmptyState text="Your daily pulls will appear here"/>}{entries.filter(e=>e.isDaily).map(e=><EntryCard key={e.id} entry={e} onClick={()=>{setAe(e);setView("entry");}}/>)}
  </div>);}
function getStalkerCard(entries){const c={};entries.forEach(e=>{(e.slots||[]).forEach(s=>{if(s.card)c[s.card]=(c[s.card]||0)+1;if(s.clarifier)c[s.clarifier]=(c[s.clarifier]||0)+1;});if(e.card)c[e.card]=(c[e.card]||0)+1;});const t=Object.entries(c).sort((a,b)=>b[1]-a[1])[0];return t&&t[1]>=2?{name:t[0],count:t[1]}:null;}
function QuickBtn({icon,label,onClick,accent}){return<button onClick={onClick} style={styles.quickBtn}><span style={{fontSize:22,color:accent}}>{icon}</span><span style={{...styles.quickBtnLabel,color:accent}}>{label}</span></button>;}

// ── Daily Pull ───────────────────────────────────────────────────────
// ── Moon phase calculation ────────────────────────────────────────────
function getMoon(){const d=new Date();const y=d.getFullYear();const m=d.getMonth()+1;const day=d.getDate();
  let yr=y,mo=m;if(mo<=2){yr--;mo+=12;}
  const A=Math.floor(yr/100);const B=2-A+Math.floor(A/4);
  const JD=Math.floor(365.25*(yr+4716))+Math.floor(30.6001*(mo+1))+day+B-1524.5;
  const refNew=2451550.1;const cyc=29.530588853;const age=(((JD-refNew)/cyc)%1+1)%1*cyc;
  if(age<1.85)return{phase:"New Moon",icon:"🌑",msg:"Plant seeds in darkness. Set quiet intentions."};
  if(age<5.55)return{phase:"Waxing Crescent",icon:"🌒",msg:"First stirrings of growth. Nurture what you've begun."};
  if(age<9.25)return{phase:"First Quarter",icon:"🌓",msg:"Challenges clarify commitment. Push through."};
  if(age<12.95)return{phase:"Waxing Gibbous",icon:"🌔",msg:"Momentum builds. Refine before fullness arrives."};
  if(age<16.65)return{phase:"Full Moon",icon:"🌕",msg:"Illumination. What was hidden comes to light."};
  if(age<20.35)return{phase:"Waning Gibbous",icon:"🌖",msg:"Gratitude and sharing. Distribute what you've harvested."};
  if(age<24.05)return{phase:"Last Quarter",icon:"🌗",msg:"Release what no longer serves. Let go."};
  if(age<27.75)return{phase:"Waning Crescent",icon:"🌘",msg:"Rest and surrender. The cycle nears completion."};
  return{phase:"New Moon",icon:"🌑",msg:"Plant seeds in darkness. Set quiet intentions."};}

function DailyPull({onBack,entries,saveEntries}){
  const [card,setCard]=useState(null);
  const [note,setNote]=useState("");
  const [saved,setSaved]=useState(false);
  const [ap,setAp]=useState(false);
  const [ee,setEe]=useState(null);
  const [revealing,setRevealing]=useState(false);
  const [revealed,setRevealed]=useState(false);

  useEffect(()=>{const t=todayKey(),e=entries.find(x=>x.isDaily&&x.dateKey===t);if(e){setAp(true);setEe(e);}},[entries]);

  // Inject breathing animation CSS
  useEffect(()=>{
    const id="arcana-breath-css";
    if(document.getElementById(id))return;
    const style=document.createElement("style");style.id=id;
    style.textContent=`
      @keyframes arcana-breathe {
        0%,100% { transform:scale(0.85);opacity:0.25; }
        50% { transform:scale(1.2);opacity:0.5; }
      }
      @keyframes arcana-fade-in {
        0% { opacity:0;transform:scale(0.95) translateY(8px); }
        100% { opacity:1;transform:scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return()=>{const el=document.getElementById(id);if(el)el.remove();};
  },[]);

  const draw=()=>{
    const c=ALL_CARDS[Math.floor(Math.random()*ALL_CARDS.length)];
    setCard(c);setRevealing(true);setRevealed(false);setSaved(false);setNote("");
    setTimeout(()=>{setRevealing(false);setRevealed(true);},900);
  };

  const save=()=>{saveEntries([{id:Date.now().toString(),isDaily:true,date:formatDate(),dateKey:todayKey(),card:card.name,note,spreadName:"Daily Pull",slots:[]},...entries]);setSaved(true);};

  const moon=getMoon();
  const now=new Date();
  const dayName=now.toLocaleDateString("en-US",{weekday:"long"});
  const dateStr=now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

  // Already pulled today
  if(ap&&!card) return(
    <div style={styles.section}>
      <BackBtn onClick={onBack}/>
      <h2 style={styles.pageTitle}>Daily Pull</h2>
      <div style={styles.alreadyPulledBox}>
        <div style={{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase",marginBottom:8}}>Today's Card</div>
        <div style={{fontSize:21,letterSpacing:2,color:C.accent,marginBottom:6,fontFamily:C.fontDisplay}}>{ee?.card}</div>
        <div style={{fontSize:11,color:C.textDim}}>pulled earlier today</div>
        {ee?.note&&<p style={{fontSize:13,color:C.textMid,fontStyle:"italic",lineHeight:1.7,marginTop:12}}>{ee.note}</p>}
      </div>
      <button style={{...styles.btnSecondary,width:"100%",marginTop:14}} onClick={()=>{setAp(false);setEe(null);}}>Draw another card anyway</button>
    </div>
  );

  // Pre-draw ritual screen
  if(!card) return(
    <div style={styles.section}>
      <BackBtn onClick={onBack}/>
      <div style={{textAlign:"center",paddingTop:16,position:"relative",minHeight:380,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>

        {/* Breathing glow */}
        <div style={{position:"absolute",top:"50%",left:"50%",width:280,height:280,marginLeft:-140,marginTop:-140,borderRadius:"50%",background:`radial-gradient(circle,${C.accent}18 0%,transparent 70%)`,animation:"arcana-breathe 8s ease-in-out infinite",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",width:180,height:180,marginLeft:-90,marginTop:-90,borderRadius:"50%",background:`radial-gradient(circle,${C.accent}10 0%,transparent 70%)`,animation:"arcana-breathe 8s ease-in-out infinite 0.5s",pointerEvents:"none"}}/>

        {/* Date & day */}
        <div style={{position:"relative",zIndex:1,marginBottom:8}}>
          <div style={{fontSize:13,color:C.textDim,letterSpacing:3,textTransform:"uppercase"}}>{dayName}</div>
          <div style={{fontSize:22,color:C.text,fontFamily:C.fontDisplay,letterSpacing:2,marginTop:4}}>{dateStr}</div>
        </div>

        {/* Moon phase */}
        <div style={{position:"relative",zIndex:1,marginBottom:32}}>
          <div style={{fontSize:28,marginBottom:4}}>{moon.icon}</div>
          <div style={{fontSize:12,color:C.accent,letterSpacing:1.5,marginBottom:4}}>{moon.phase}</div>
          <div style={{fontSize:12,color:C.textDim,fontStyle:"italic",maxWidth:240,lineHeight:1.5}}>{moon.msg}</div>
        </div>

        {/* Card back */}
        <div style={{...styles.cardBack,position:"relative",zIndex:1}} onClick={draw}>
          <div style={{fontSize:44,color:C.accentDim}}>✦</div>
          <div style={{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase"}}>Tap to draw</div>
        </div>
      </div>
    </div>
  );

  // Revealing / revealed card
  return(
    <div style={styles.section}>
      <BackBtn onClick={onBack}/>
      <h2 style={styles.pageTitle}>Daily Pull</h2>

      {/* Date & moon compact */}
      <div style={{textAlign:"center",marginBottom:14}}>
        <span style={{fontSize:11,color:C.textDim,letterSpacing:1}}>{dateStr}</span>
        <span style={{margin:"0 8px",color:C.textDim}}>·</span>
        <span style={{fontSize:14}}>{moon.icon}</span>
        <span style={{fontSize:11,color:C.textDim,letterSpacing:1,marginLeft:4}}>{moon.phase}</span>
      </div>

      {/* Card with fade-in animation */}
      <div style={{opacity:revealing?0:1,transform:revealing?"scale(0.95) translateY(8px)":"scale(1) translateY(0)",transition:"opacity 0.8s ease-out, transform 0.8s ease-out"}}>
        <div style={{...styles.drawnCard,borderColor:suitBorder(card),background:suitBg(card),position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(card),borderRadius:"3px 0 0 3px"}}/>
          <div style={{width:40,height:40,borderRadius:"50%",background:suitSymbolBg(card),display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}>
            <span style={{color:suitColor(card),fontSize:22}}>{suitSymbol(card)}</span>
          </div>
          <div style={styles.drawnCardName}>{card.name}</div>
          <div style={{fontSize:11,color:suitColor(card),letterSpacing:1.5,marginBottom:12,opacity:.7}}>{card.keywords.join(" · ")}</div>
          <p style={styles.drawnCardMeaning}>{card.meaning}</p>
        </div>

        {!saved?<>
          <textarea style={styles.textarea} placeholder="What does this card stir in you today?" value={note} onChange={e=>setNote(e.target.value)} rows={4}/>
          <div style={styles.btnRow}>
            <button style={styles.btnSecondary} onClick={()=>{setCard(null);setRevealed(false);setRevealing(false);}}>Draw Again</button>
            <button style={styles.btnPrimary} onClick={save}>Save to Journal</button>
          </div>
        </>:<div style={styles.savedBanner}>✦ Saved to your journal</div>}
      </div>
    </div>
  );
}

// ── New/Edit Entry + CardSelect (same structure as before) ───────────
function NewEntry({spreads,onSave,onBack}){const [step,setStep]=useState("pick");const [spread,setSpread]=useState(null);const [slots,setSlots]=useState([]);const [question,setQuestion]=useState("");const [globalNote,setGlobalNote]=useState("");const [as,setAs]=useState(0);
  const pick=sp=>{setSpread(sp);setSlots(sp.positions.map(p=>({posId:p.id,label:p.label,meaning:p.meaning,card:"",clarifier:"",showClarifier:false,note:""})));setAs(0);setStep("fill");};
  const us=(i,k,v)=>{const n=[...slots];n[i]={...n[i],[k]:v};setSlots(n);};const fc=slots.filter(s=>s.card).length;
  const save=()=>onSave({id:Date.now().toString(),isDaily:false,date:formatDate(),dateKey:todayKey(),spreadId:spread.id,spreadName:spread.name,question,slots,note:globalNote});
  if(step==="pick")return<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Choose a Spread</h2>{spreads.map(sp=><button key={sp.id} style={styles.spreadPickCard} onClick={()=>pick(sp)}><div style={styles.spreadPickName}>{sp.name}</div><div style={styles.spreadPickPositions}>{sp.positions.map(p=>p.label).join(" · ")}</div><div style={{fontSize:10,color:C.textDim,marginTop:4}}>{sp.positions.length} {sp.positions.length===1?"card":"cards"}</div></button>)}</div>;
  if(step==="fill"){const layout=getSpreadLayout(spread);const slot=slots[as];const ac=slot?.card?ALL_CARDS.find(c=>c.name===slot.card):null;
    return<div style={styles.section}><BackBtn onClick={()=>setStep("pick")}/><h2 style={styles.pageTitle}>{spread.name}</h2><input style={styles.input} placeholder="Your question or intention (optional)" value={question} onChange={e=>setQuestion(e.target.value)}/><SpreadMap layout={layout} slots={slots} activeIdx={as} onSelect={setAs}/><div style={styles.mapProgress}>{fc} of {slots.length} filled{slots.every(s=>s.card)&&<span style={{color:C.accent}}> ✦</span>}</div>
      {slot&&<div style={styles.slotPanel}><div style={styles.slotPanelHeader}><div style={styles.slotPanelNum}>{as+1}</div><div><div style={styles.slotLabel}>{slot.label}</div><div style={styles.slotMeaning}>{slot.meaning}</div></div></div><CardSelect value={slot.card} onChange={v=>us(as,"card",v)} placeholder="Select card…"/>{slot.card&&ac&&<div style={{display:"flex",alignItems:"center",marginTop:6,paddingLeft:2}}><span style={{color:suitColor(ac),marginRight:6}}>{suitSymbol(ac)}</span><span style={{color:C.textDim,fontStyle:"italic",fontSize:12}}>{ac.keywords.join(" · ")}</span></div>}{slot.card&&<button style={styles.clarifierToggle} onClick={()=>us(as,"showClarifier",!slot.showClarifier)}>{slot.showClarifier?"− Remove clarifier":"+ Add clarifier"}</button>}{slot.showClarifier&&<div style={styles.clarifierArea}><div style={styles.clarifierLine}/><div style={{flex:1}}><div style={styles.clarifierLabel}>Clarifier</div><CardSelect value={slot.clarifier} onChange={v=>us(as,"clarifier",v)} placeholder="Select clarifier…"/></div></div>}<textarea style={{...styles.textarea,marginTop:8}} placeholder="Notes…" value={slot.note} onChange={e=>us(as,"note",e.target.value)} rows={2}/><div style={styles.slotPanelNav}><button style={{...styles.slotNavBtn,...(as===0?{opacity:.3}:{})}} disabled={as===0} onClick={()=>setAs(as-1)}>← {as>0?slots[as-1].label:""}</button><button style={{...styles.slotNavBtn,...(as===slots.length-1?{opacity:.3}:{})}} disabled={as===slots.length-1} onClick={()=>setAs(as+1)}>{as<slots.length-1?slots[as+1].label:""} →</button></div></div>}<button style={styles.btnPrimary} onClick={()=>setStep("notes")}>Continue to Reflection →</button></div>;}
  return<div style={styles.section}><BackBtn onClick={()=>setStep("fill")}/><h2 style={styles.pageTitle}>Overall Reflection</h2><textarea style={styles.textarea} placeholder="Overall impressions…" value={globalNote} onChange={e=>setGlobalNote(e.target.value)} rows={6}/><button style={styles.btnPrimary} onClick={save}>Save Reading ✦</button></div>;}

function EditEntry({entry,onSave,onBack}){const [q,setQ]=useState(entry.question||"");const [note,setNote]=useState(entry.note||"");const [dn,setDn]=useState(entry.isDaily?(entry.note||""):"");const [slots,setSlots]=useState((entry.slots||[]).map(s=>({...s})));const [as,setAs]=useState(0);
  const us=(i,k,v)=>{const n=[...slots];n[i]={...n[i],[k]:v};setSlots(n);};
  const save=()=>entry.isDaily?onSave({...entry,note:dn}):onSave({...entry,question:q,note,slots});
  if(entry.isDaily)return<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Edit Daily Pull</h2><div style={styles.editCardDisplay}><span style={{color:suitColor(ALL_CARDS.find(c=>c.name===entry.card)||{}),marginRight:8}}>{suitSymbol(ALL_CARDS.find(c=>c.name===entry.card)||{})}</span>{entry.card}</div><label style={styles.fieldLabel}>Your Reflection</label><textarea style={styles.textarea} value={dn} onChange={e=>setDn(e.target.value)} rows={5}/><button style={styles.btnPrimary} onClick={save}>Save Changes ✦</button></div>;
  const layout=getEntryLayout(entry);const slot=slots[as];
  return<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Edit Reading</h2><div style={styles.editMeta}>{entry.spreadName} · {entry.date}</div><label style={styles.fieldLabel}>Question</label><input style={styles.input} value={q} onChange={e=>setQ(e.target.value)}/><SpreadMap layout={layout} slots={slots} activeIdx={as} onSelect={setAs}/>{slot&&<div style={styles.slotPanel}><div style={styles.slotPanelHeader}><div style={styles.slotPanelNum}>{as+1}</div><div><div style={styles.slotLabel}>{slot.label}</div><div style={styles.slotMeaning}>{slot.meaning}</div></div></div><CardSelect value={slot.card} onChange={v=>us(as,"card",v)} placeholder="Select card…"/>{slot.card&&<button style={styles.clarifierToggle} onClick={()=>us(as,"showClarifier",!slot.showClarifier||!!slot.clarifier)}>{slot.showClarifier||slot.clarifier?"−":"+"} clarifier</button>}{(slot.showClarifier||slot.clarifier)&&<div style={styles.clarifierArea}><div style={styles.clarifierLine}/><div style={{flex:1}}><div style={styles.clarifierLabel}>Clarifier</div><CardSelect value={slot.clarifier} onChange={v=>us(as,"clarifier",v)} placeholder="Select clarifier…"/></div></div>}<textarea style={{...styles.textarea,marginTop:8}} placeholder="Notes…" value={slot.note} onChange={e=>us(as,"note",e.target.value)} rows={2}/></div>}<label style={{...styles.fieldLabel,marginTop:12}}>Overall Reflection</label><textarea style={styles.textarea} value={note} onChange={e=>setNote(e.target.value)} rows={5}/><button style={styles.btnPrimary} onClick={save}>Save Changes ✦</button></div>;}

function CardSelect({value,onChange,placeholder}){const [open,setOpen]=useState(false);const [search,setSearch]=useState("");const filtered=ALL_CARDS.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).slice(0,20);const card=ALL_CARDS.find(c=>c.name===value);
  if(!open)return<button style={{...styles.cardSelectBtn,borderColor:card?suitColor(card)+"40":V.border}} onClick={()=>setOpen(true)}>{card?<><span style={{color:suitColor(card)}}>{suitSymbol(card)}</span> {card.name}</>:<span style={{opacity:.4}}>{placeholder}</span>}</button>;
  return<div style={styles.cardSelectOpen}><input autoFocus style={styles.cardSearchInput} placeholder="Search cards…" value={search} onChange={e=>setSearch(e.target.value)}/><div style={styles.cardList}>{filtered.map(c=><button key={c.name} style={styles.cardListItem} onClick={()=>{onChange(c.name);setOpen(false);setSearch("");}}><span style={{color:suitColor(c),marginRight:6}}>{suitSymbol(c)}</span>{c.name}</button>)}</div><button style={styles.cardSelectCancel} onClick={()=>setOpen(false)}>Cancel</button></div>;}

// ── Entry Detail ─────────────────────────────────────────────────────
function EntryDetail({entry,onBack,onEdit,onDelete}){const [cd,setCd]=useState(false);const [es,setEs]=useState(null);const hasSlots=(entry.slots||[]).length>0&&!entry.isDaily;const layout=hasSlots?getEntryLayout(entry):null;
  return<div style={styles.section}>{cd&&<ConfirmModal message="Delete this reading permanently?" onConfirm={()=>{setCd(false);onDelete();}} onCancel={()=>setCd(false)}/>}<BackBtn onClick={onBack}/><div style={{textAlign:"center",marginBottom:8}}><h2 style={styles.pageTitle}>{entry.spreadName}</h2><div style={{fontSize:11,color:C.textDim,letterSpacing:2,marginBottom:16}}>{entry.date}</div></div>
    {entry.question&&<div style={styles.entryQuestion}>"{entry.question}"</div>}
    {entry.isDaily&&entry.card&&(()=>{const c=ALL_CARDS.find(x=>x.name===entry.card);return<div style={{...styles.drawnCard,borderColor:suitBorder(c),background:suitBg(c),position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(c),borderRadius:"3px 0 0 3px"}}/><div style={styles.drawnCardName}>{entry.card}</div>{entry.note&&<p style={styles.drawnCardMeaning}>{entry.note}</p>}</div>;})()}
    {hasSlots&&layout&&<><SpreadMap layout={layout} slots={entry.slots} activeIdx={es} onSelect={setEs}/><div style={styles.mapHint}>tap a position to see details</div></>}
    {hasSlots&&es!==null&&entry.slots[es]&&(()=>{const slot=entry.slots[es];const card=ALL_CARDS.find(c=>c.name===slot.card);const clar=ALL_CARDS.find(c=>c.name===slot.clarifier);return<div style={{...styles.slotDetailExpanded,background:card?suitBg(card):V.card,borderColor:card?suitBorder(card):V.border,position:"relative",overflow:"hidden"}}>{card&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(card),borderRadius:"3px 0 0 3px"}}/>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={styles.slotLabel}>{slot.label}</div><div style={styles.slotMeaning}>{slot.meaning}</div></div><button onClick={()=>setEs(null)} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:16,padding:0}}>✕</button></div>{card&&<div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}><div style={{width:32,height:32,borderRadius:"50%",background:suitSymbolBg(card),display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:suitColor(card),fontSize:16}}>{suitSymbol(card)}</span></div><span style={{fontSize:14,color:C.text,fontFamily:C.fontDisplay}}>{card.name}</span></div>}{card&&<div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginTop:6}}>{card.keywords.join(" · ")}</div>}{card&&<p style={{fontSize:12,color:C.textMid,fontStyle:"italic",lineHeight:1.7,marginTop:6,marginBottom:0}}>{card.meaning}</p>}{clar&&<div style={{...styles.cardPill,borderColor:suitColor(clar)+"30",color:suitColor(clar),fontSize:11,marginTop:6}}>↳ {clar.name}</div>}{slot.note&&<p style={{fontSize:12,color:C.textMid,fontStyle:"italic",margin:"8px 0 0",lineHeight:1.6}}>{slot.note}</p>}</div>;})()}
    {hasSlots&&es===null&&(entry.slots||[]).map((slot,i)=>{const card=ALL_CARDS.find(c=>c.name===slot.card);if(!card)return null;return<div key={i} style={styles.slotCardCompact} onClick={()=>setEs(i)}><span style={{color:suitColor(card),marginRight:8}}>{suitSymbol(card)}</span><span style={{fontSize:12,color:C.textMid,flex:1}}><span style={{color:C.accent}}>{slot.label}:</span> {card.name}</span>{slot.note&&<span style={{fontSize:10,color:C.accentDim}}>✎</span>}</div>;})}
    {entry.note&&!entry.isDaily&&<div style={styles.globalNote}>{entry.note}</div>}
    <div style={styles.btnRow}><button style={styles.btnSecondary} onClick={onEdit}>✎ Edit</button><button style={{...styles.btnSecondary,borderColor:C.rose+"40",color:C.rose}} onClick={()=>setCd(true)}>Delete</button></div>
  </div>;}

// ══════════════════════════════════════════════════════════════════
// CARDS SECTION — with expandable suit/number study headers
// ══════════════════════════════════════════════════════════════════
function CardsSection({cardNotes,saveCardNotes,entries,suitNotes,saveSuitNotes,rankNotes,saveRankNotes}){
  const [view,setView]=useState("list");const [activeCard,setActiveCard]=useState(null);const [filter,setFilter]=useState("All");const [studyOpen,setStudyOpen]=useState(false);const [studyNote,setStudyNote]=useState("");
  const counts={};entries.forEach(e=>{(e.slots||[]).forEach(s=>{if(s.card)counts[s.card]=(counts[s.card]||0)+1;if(s.clarifier)counts[s.clarifier]=(counts[s.clarifier]||0)+1;});if(e.card)counts[e.card]=(counts[e.card]||0)+1;});
  const filters=["All","Major Arcana",...SUITS,"By Number"];
  const isByNumber=filter==="By Number";
  const isStudyFilter=["Major Arcana",...SUITS].includes(filter);

  // Get rank key from card
  const getRank=c=>{if(!c.suit)return null;const n=c.name.split(" ")[0];return["Page","Knight","Queen","King"].includes(n)?n:n==="Ace"?"Ace":n;};
  const RANKS=["Ace","2","3","4","5","6","7","8","9","10","Page","Knight","Queen","King"];

  const filtered=isByNumber?ALL_CARDS.filter(c=>c.suit):ALL_CARDS.filter(c=>{if(filter==="All")return true;if(filter==="Major Arcana")return!c.suit;return c.suit===filter;});

  // Reset study state when filter changes
  useEffect(()=>{setStudyOpen(false);setStudyNote("");},[filter]);

  if(view==="card")return<CardDetail card={activeCard} notes={cardNotes[activeCard.name]||{}} onSave={n=>saveCardNotes({...cardNotes,[activeCard.name]:n})} onBack={()=>setView("list")} count={counts[activeCard.name]||0}/>;

  const studyData=isStudyFilter?SUIT_STUDY[filter]:null;
  const myStudyNote=isStudyFilter?(suitNotes[filter]||""):"";

  return<div style={styles.section}><h2 style={styles.pageTitle}>The 78 Cards</h2>
    <div style={styles.filterRow}>{filters.map(f=><button key={f} style={{...styles.filterBtn,...(filter===f?styles.filterBtnActive:{})}} onClick={()=>setFilter(f)}>{f==="All"?"All":f==="Major Arcana"?"Major":f==="By Number"?"Numbers":f}</button>)}</div>

    {/* Expandable suit/major study header */}
    {isStudyFilter&&studyData&&(
      <div style={studyOpen?styles.studyHeaderExpanded:styles.studyHeader} onClick={()=>{if(!studyOpen){setStudyOpen(true);setStudyNote(myStudyNote);}}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:14,color:C.accent,fontFamily:C.fontDisplay,letterSpacing:1}}>{filter}</div><div style={{fontSize:10,color:C.textDim,marginTop:2}}>{studyData.element} · {studyData.keywords}</div></div>
          <span style={{fontSize:12,color:C.textDim}}>{studyOpen?"▼":"▶"}</span>
        </div>
        {studyOpen&&<div onClick={e=>e.stopPropagation()}>
          <p style={{fontSize:13,color:C.textMid,lineHeight:1.7,fontStyle:"italic",marginTop:10,marginBottom:10}}>{studyData.desc}</p>
          <label style={styles.fieldLabel}>My Notes on {filter}</label>
          <textarea style={styles.textarea} value={studyNote} onChange={e=>setStudyNote(e.target.value)} placeholder={`What ${filter} energy means to you…`} rows={3}/>
          <div style={styles.btnRow}><button style={styles.btnPrimary} onClick={()=>{saveSuitNotes({...suitNotes,[filter]:studyNote});setStudyOpen(false);}}>Save Notes ✦</button></div>
        </div>}
      </div>
    )}

    {/* By Number view — grouped by rank with expandable headers */}
    {isByNumber?RANKS.map(rank=>{
      const rankData=RANK_STUDY[rank];
      const rankCards=filtered.filter(c=>getRank(c)===rank);
      if(!rankCards.length)return null;
      return<RankGroup key={rank} rank={rank} rankData={rankData} cards={rankCards} counts={counts} cardNotes={cardNotes} rankNotes={rankNotes} saveRankNotes={saveRankNotes} onCardClick={c=>{setActiveCard(c);setView("card");}}/>;
    })
    :<div style={styles.cardGrid}>{filtered.map(card=><button key={card.name} style={{...styles.cardGridItem,borderColor:suitColor(card)+"25"}} onClick={()=>{setActiveCard(card);setView("card");}}>
      <div style={{color:suitColor(card),fontSize:18,marginBottom:4}}>{suitSymbol(card)}</div><div style={styles.cardGridName}>{card.name}</div>
      {counts[card.name]&&<div style={{fontSize:9,color:C.accent,marginTop:2}}>{counts[card.name]}×</div>}{cardNotes[card.name]?.myMeaning&&<div style={styles.cardGridEdited}>✎</div>}
    </button>)}</div>}
  </div>;
}

function RankGroup({rank,rankData,cards,counts,cardNotes,rankNotes,saveRankNotes,onCardClick}){
  const [open,setOpen]=useState(false);const [note,setNote]=useState(rankNotes[rank]||"");
  return<div style={{marginBottom:14}}>
    <div style={open?styles.studyHeaderExpanded:styles.studyHeader} onClick={()=>{if(!open){setOpen(true);setNote(rankNotes[rank]||"");}}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:14,color:C.accent,fontFamily:C.fontDisplay,letterSpacing:1}}>{rankData?.name||rank}</div></div>
        <span style={{fontSize:12,color:C.textDim}}>{open?"▼":"▶"}</span>
      </div>
      {open&&<div onClick={e=>e.stopPropagation()}>
        {rankData&&<p style={{fontSize:13,color:C.textMid,lineHeight:1.7,fontStyle:"italic",marginTop:10,marginBottom:10}}>{rankData.desc}</p>}
        <label style={styles.fieldLabel}>My Notes on {rankData?.name||rank}</label>
        <textarea style={styles.textarea} value={note} onChange={e=>setNote(e.target.value)} placeholder={`What ${rankData?.name||rank} mean to you across suits…`} rows={3}/>
        <div style={styles.btnRow}><button style={styles.btnPrimary} onClick={()=>{saveRankNotes({...rankNotes,[rank]:note});setOpen(false);}}>Save Notes ✦</button></div>
      </div>}
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {cards.map(card=><button key={card.name} style={{...styles.cardGridItem,borderColor:suitColor(card)+"25",width:100,flex:"0 0 auto"}} onClick={()=>onCardClick(card)}>
        <div style={{color:suitColor(card),fontSize:16,marginBottom:2}}>{suitSymbol(card)}</div><div style={styles.cardGridName}>{card.name}</div>
        {counts[card.name]&&<div style={{fontSize:9,color:C.accent,marginTop:2}}>{counts[card.name]}×</div>}
      </button>)}
    </div>
  </div>;
}

function CardDetail({card,notes,onSave,onBack,count}){const [mk,setMk]=useState(notes.myKeywords||"");const [mm,setMm]=useState(notes.myMeaning||"");const [mn,setMn]=useState(notes.myNote||"");const [tab,setTab]=useState("standard");
  return<div style={styles.section}><BackBtn onClick={onBack}/>
    <div style={{...styles.cardDetailHero,background:suitBg(card),borderColor:suitBorder(card),position:"relative",overflow:"hidden"}}>{card.suit&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(card),borderRadius:"3px 0 0 3px"}}/>}<div style={{width:48,height:48,borderRadius:"50%",background:suitSymbolBg(card),display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}><span style={{fontSize:28,color:suitColor(card)}}>{suitSymbol(card)}</span></div><h2 style={styles.cardDetailName}>{card.name}</h2>{card.num&&<div style={{fontSize:13,color:C.textDim,letterSpacing:3}}>{card.num}</div>}{count>0&&<div style={{fontSize:11,color:C.accent,marginTop:7}}>Appeared {count}× in your journal</div>}</div>
    <div style={styles.tabRow}><button style={{...styles.tabBtn,...(tab==="standard"?styles.tabBtnActive:{})}} onClick={()=>setTab("standard")}>Standard</button><button style={{...styles.tabBtn,...(tab==="mine"?styles.tabBtnActive:{})}} onClick={()=>setTab("mine")}>My Notes</button></div>
    {tab==="standard"&&<div style={styles.cardStandard}><div style={{fontSize:12,color:suitColor(card),letterSpacing:1.5,marginBottom:12,textAlign:"center"}}>{card.keywords.join(" · ")}</div><p style={styles.cardMeaningText}>{card.meaning}</p></div>}
    {tab==="mine"&&<div style={styles.cardMine}><label style={styles.fieldLabel}>My Keywords</label><input style={styles.input} placeholder="Your own keywords…" value={mk} onChange={e=>setMk(e.target.value)}/><label style={styles.fieldLabel}>My Meaning</label><textarea style={styles.textarea} placeholder="What this card means to you…" value={mm} onChange={e=>setMm(e.target.value)} rows={3}/><label style={styles.fieldLabel}>Personal Notes</label><textarea style={styles.textarea} placeholder="Memories, readings, associations…" value={mn} onChange={e=>setMn(e.target.value)} rows={4}/><button style={styles.btnPrimary} onClick={()=>onSave({myKeywords:mk,myMeaning:mm,myNote:mn})}>Save Notes ✦</button></div>}
  </div>;}

// ── Decks (unchanged structure) ──────────────────────────────────────
function DecksSection({decks,saveDecks}){const [view,setView]=useState("list");const [ad,setAd]=useState(null);const [editing,setEditing]=useState(false);const del=id=>{saveDecks(decks.filter(d=>d.id!==id));setView("list");};
  if(view==="new"||editing)return<DeckForm deck={editing?ad:null} onSave={d=>{if(editing){saveDecks(decks.map(x=>x.id===d.id?d:x));setAd(d);setEditing(false);setView("detail");}else{saveDecks([d,...decks]);setView("list");}}} onBack={()=>{setEditing(false);setView(editing?"detail":"list");}}/>;
  if(view==="detail")return<DeckDetail deck={ad} onBack={()=>setView("list")} onEdit={()=>setEditing(true)} onDelete={()=>del(ad.id)} onSave={d=>{saveDecks(decks.map(x=>x.id===d.id?d:x));setAd(d);}}/>;
  return<div style={styles.section}><h2 style={styles.pageTitle}>My Decks</h2><div style={{display:"flex",justifyContent:"center",marginTop:-14,marginBottom:18}}><button style={{...styles.btnPrimary,width:"auto",padding:"10px 28px",fontSize:12}} onClick={()=>setView("new")}>+ Add Deck</button></div>{decks.length===0&&<EmptyState text="Add your first deck"/>}<div style={styles.deckGrid}>{decks.map(dk=><button key={dk.id} style={styles.deckCard} onClick={()=>{setAd(dk);setView("detail");}}>{dk.photo?<img src={dk.photo} alt={dk.name} style={styles.deckThumb}/>:<div style={styles.deckThumbPlaceholder}><span style={{fontSize:28,opacity:.3}}>◎</span></div>}<div style={{fontSize:13,color:C.text,padding:"9px 11px 3px"}}>{dk.name}</div>{dk.acquired&&<div style={{fontSize:10,color:C.textDim,padding:"0 11px 9px"}}>{dk.acquired}</div>}</button>)}</div></div>;}

function DeckDetail({deck,onBack,onEdit,onDelete,onSave}){const [ap,setAp]=useState(false);const [cd,setCd]=useState(false);const hp=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>onSave({...deck,photos:[...(deck.photos||[]),ev.target.result]});r.readAsDataURL(f);};
  return<div style={styles.section}>{cd&&<ConfirmModal message={`Delete "${deck.name}"?`} onConfirm={()=>{setCd(false);onDelete();}} onCancel={()=>setCd(false)}/>}<BackBtn onClick={onBack}/><div style={{textAlign:"center",marginBottom:18}}>{deck.photo?<img src={deck.photo} alt={deck.name} style={{width:"100%",maxHeight:210,objectFit:"cover",borderRadius:12,marginBottom:14}}/>:<div style={styles.deckThumbPlaceholder}>◎</div>}<h2 style={styles.pageTitle}>{deck.name}</h2>{deck.acquired&&<div style={{fontSize:11,color:C.textDim,letterSpacing:2}}>{deck.acquired}</div>}</div>{deck.notes&&<p style={styles.globalNote}>{deck.notes}</p>}{deck.tags&&deck.tags.length>0&&<div style={styles.tagRow}>{deck.tags.map(t=><span key={t} style={styles.tag}>{t}</span>)}</div>}<SectionHeader label="Photos" action="+ Add" onAction={()=>setAp(true)}/>{ap&&<label style={styles.photoUpload}><input type="file" accept="image/*" capture="environment" onChange={hp} style={{display:"none"}}/><span>📷 Tap to take or choose a photo</span></label>}{(deck.photos||[]).length===0&&!ap&&<EmptyState text="No photos yet"/>}<div style={styles.photoGrid}>{(deck.photos||[]).map((p,i)=><img key={i} src={p} alt="" style={styles.photoThumb}/>)}</div><div style={styles.btnRow}><button style={styles.btnSecondary} onClick={onEdit}>Edit</button><button style={{...styles.btnSecondary,borderColor:C.rose+"40",color:C.rose}} onClick={()=>setCd(true)}>Delete</button></div></div>;}

function DeckForm({deck,onSave,onBack}){const [name,setName]=useState(deck?.name||"");const [acq,setAcq]=useState(deck?.acquired||"");const [notes,setNotes]=useState(deck?.notes||"");const [tags,setTags]=useState(deck?.tags?.join(", ")||"");const [photo,setPhoto]=useState(deck?.photo||null);
  const hc=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPhoto(ev.target.result);r.readAsDataURL(f);};
  return<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>{deck?"Edit Deck":"Add a Deck"}</h2><label style={styles.photoUpload}>{photo?<img src={photo} alt="cover" style={{width:"100%",borderRadius:8,maxHeight:180,objectFit:"cover"}}/>:<span>📷 Add cover photo</span>}<input type="file" accept="image/*" capture="environment" onChange={hc} style={{display:"none"}}/></label><label style={styles.fieldLabel}>Deck Name *</label><input style={styles.input} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rider Waite Smith"/><label style={styles.fieldLabel}>Date Acquired</label><input style={styles.input} value={acq} onChange={e=>setAcq(e.target.value)} placeholder="e.g. March 2024"/><label style={styles.fieldLabel}>Tags (comma separated)</label><input style={styles.input} value={tags} onChange={e=>setTags(e.target.value)} placeholder="e.g. shadow work, daily reader"/><label style={styles.fieldLabel}>Notes</label><textarea style={styles.textarea} value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder="Your thoughts on this deck…"/><button style={styles.btnPrimary} onClick={()=>{if(!name.trim())return;onSave({id:deck?.id||Date.now().toString(),name:name.trim(),acquired:acq,notes,tags:tags.split(",").map(t=>t.trim()).filter(Boolean),photo,photos:deck?.photos||[]});}}>Save Deck ✦</button></div>;}

// ── Settings (with theme picker) ─────────────────────────────────────
function SettingsSection({spreads,saveSpreads,themeId,saveTheme,onBack}){const [view,setView]=useState("main");const [editSpread,setEditSpread]=useState(null);const [cd,setCd]=useState(null);
  if(view==="editSpread")return<SpreadBuilder spread={editSpread} onSave={sp=>{if(editSpread)saveSpreads(spreads.map(s=>s.id===sp.id?sp:s));else saveSpreads([...spreads,sp]);setView("main");}} onBack={()=>setView("main")}/>;
  return<div style={styles.sectionSafe}>{cd&&<ConfirmModal message="Delete this spread?" onConfirm={()=>{saveSpreads(spreads.filter(s=>s.id!==cd));setCd(null);}} onCancel={()=>setCd(null)}/>}<BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Settings</h2>

    {/* Theme picker */}
    <SectionHeader label="Theme"/>
    <div style={styles.themePicker}>
      {Object.values(THEMES).map(t=>(
        <button key={t.id} onClick={()=>saveTheme(t.id)} style={{...styles.themeOption,...(themeId===t.id?{borderColor:C.accent}:{})}}>
          <div style={{width:"100%",height:48,borderRadius:6,background:t.gradient,marginBottom:6,border:`1px solid ${t.mode==="dark"?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.08)"}`}}/>
          <div style={{fontSize:11,color:C.text,letterSpacing:.5}}>{t.name}</div>
        </button>
      ))}
    </div>

    <SectionHeader label="Spread Templates" action="+ New" onAction={()=>{setEditSpread(null);setView("editSpread");}}/>
    <div style={styles.settingsList}>{spreads.map(sp=><div key={sp.id} style={styles.settingsRow}><div style={{flex:1}}><div style={{fontSize:14,color:C.text,letterSpacing:.5}}>{sp.name}</div><div style={{fontSize:11,color:C.textDim,marginTop:2}}>{sp.positions.length} positions</div></div><div style={{display:"flex",gap:12}}><button style={styles.settingsRowBtn} onClick={()=>{setEditSpread(sp);setView("editSpread");}}>Edit</button>{!DEFAULT_SPREADS.find(d=>d.id===sp.id)&&<button style={{...styles.settingsRowBtn,color:C.rose}} onClick={()=>setCd(sp.id)}>Delete</button>}</div></div>)}</div>
  </div>;
}

function SpreadBuilder({spread,onSave,onBack}){const [name,setName]=useState(spread?.name||"");const [pos,setPos]=useState(spread?.positions||[]);const isD=spread&&DEFAULT_SPREADS.find(s=>s.id===spread.id);
  const up=(i,k,v)=>{const n=[...pos];n[i]={...n[i],[k]:v};setPos(n);};
  const pl=getSpreadLayout({id:spread?.id||"preview",positions:pos});const ps=pos.map(p=>({posId:p.id,label:p.label,meaning:p.meaning,card:"",note:""}));
  return<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>{spread?"Edit Spread":"New Spread"}</h2>{isD&&<div style={styles.infoNote}>✦ Editing a default creates a customised version.</div>}<input style={styles.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Spread name…"/>{pos.length>0&&<><div style={{...styles.fieldLabel,marginBottom:8}}>Layout Preview</div><SpreadMap layout={pl} slots={ps} activeIdx={-1} readOnly/></>}{pos.map((p,i)=><div key={p.id} style={styles.posRow}><div style={styles.posReorder}><button style={styles.reorderBtn} onClick={()=>{if(!i)return;const n=[...pos];[n[i-1],n[i]]=[n[i],n[i-1]];setPos(n);}}>▲</button><button style={styles.reorderBtn} onClick={()=>{if(i===pos.length-1)return;const n=[...pos];[n[i],n[i+1]]=[n[i+1],n[i]];setPos(n);}}>▼</button></div><div style={{flex:1}}><input style={{...styles.input,marginBottom:4}} value={p.label} onChange={e=>up(i,"label",e.target.value)} placeholder={`Position ${i+1}`}/><input style={styles.input} value={p.meaning} onChange={e=>up(i,"meaning",e.target.value)} placeholder="Meaning"/></div><button style={styles.removeBtn} onClick={()=>setPos(pos.filter((_,idx)=>idx!==i))}>✕</button></div>)}<button style={styles.btnSecondary} onClick={()=>setPos([...pos,{id:Date.now().toString(),label:"",meaning:""}])}>+ Add Position</button><button style={{...styles.btnPrimary,marginTop:8}} onClick={()=>{if(!name.trim())return;onSave({id:spread?.id||Date.now().toString(),name:name.trim(),positions:pos});}}>Save Spread ✦</button></div>;}
