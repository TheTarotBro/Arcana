import { useState, useEffect, useCallback } from "react";

// ── Persistence helpers ──────────────────────────────────────────────
const store = {
  async get(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

// ── Rider-Waite-Smith 78 cards ───────────────────────────────────────
const SUITS = ["Wands","Cups","Swords","Pentacles"];
const COURTS = ["Page","Knight","Queen","King"];
const MAJOR_ARCANA = [
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

const MINOR_ARCANA_DATA = {
  Wands:{pips:[
    {n:1,name:"Ace of Wands",keywords:["inspiration","new venture","spark","creative force"],meaning:"A bolt of creative fire. A new passion, project, or calling is being handed to you — take it."},
    {n:2,name:"2 of Wands",keywords:["planning","future vision","discovery","restlessness"],meaning:"You hold the world in your hands but haven't stepped through the door yet. The plan is forming; trust its pull."},
    {n:3,name:"3 of Wands",keywords:["expansion","foresight","overseas opportunities","progress"],meaning:"Your ships are coming in. Early efforts bear fruit and the horizon widens — keep watching for what returns."},
    {n:4,name:"4 of Wands",keywords:["celebration","homecoming","harmony","milestones"],meaning:"A moment of genuine joy and stability. Celebrate what you've built — the foundation is worthy of a party."},
    {n:5,name:"5 of Wands",keywords:["competition","conflict","rivalry","tension"],meaning:"Too many wands swinging at once. This isn't war — it's the creative friction of people who all care. Find the signal in the noise."},
    {n:6,name:"6 of Wands",keywords:["victory","recognition","public praise","confidence"],meaning:"You've earned this win, and others see it too. Accept the laurels — visibility is part of the reward."},
    {n:7,name:"7 of Wands",keywords:["defensiveness","perseverance","standing your ground","challenge"],meaning:"You're on higher ground but under pressure. Hold your position — you have the advantage even if it doesn't feel like it."},
    {n:8,name:"8 of Wands",keywords:["swift action","movement","messages","momentum"],meaning:"Everything accelerates. News arrives, plans take flight, and delays dissolve. Ride the current — don't fight it."},
    {n:9,name:"9 of Wands",keywords:["resilience","persistence","last stand","boundaries"],meaning:"You're battle-weary but still standing. One more push is all that's needed — you've survived worse than this."},
    {n:10,name:"10 of Wands",keywords:["burden","overcommitment","responsibility","hard work"],meaning:"You're carrying too much and it shows. Some of these burdens were never yours. Set a few down before you buckle."},
  ],courts:[
    {court:"Page",name:"Page of Wands",keywords:["exploration","excitement","free spirit","discovery"],meaning:"A spark of curiosity lights up. The Page arrives with an idea, an invitation, or news that stirs your creative hunger."},
    {court:"Knight",name:"Knight of Wands",keywords:["energy","passion","adventure","impulsiveness"],meaning:"Headlong into the fire. The Knight charges forward on charisma and conviction — inspiring but not always careful."},
    {court:"Queen",name:"Queen of Wands",keywords:["courage","confidence","warmth","determination"],meaning:"She walks into every room like she belongs there — because she does. Magnetic confidence paired with genuine warmth."},
    {court:"King",name:"King of Wands",keywords:["leadership","vision","boldness","entrepreneurship"],meaning:"A natural leader who inspires through sheer force of vision. He sees the big picture and has the nerve to build it."},
  ]},
  Cups:{pips:[
    {n:1,name:"Ace of Cups",keywords:["new love","compassion","emotional awakening","creativity"],meaning:"The cup overflows. A new emotional beginning — love, deep feeling, or spiritual connection pours in."},
    {n:2,name:"2 of Cups",keywords:["partnership","mutual attraction","unity","connection"],meaning:"Two hearts finding each other. A bond of genuine reciprocity — romantic, platonic, or creative."},
    {n:3,name:"3 of Cups",keywords:["friendship","celebration","community","collaboration"],meaning:"Raise a glass with the people who see you. Joy shared is joy multiplied — this is the card of chosen family."},
    {n:4,name:"4 of Cups",keywords:["apathy","contemplation","disconnection","reevaluation"],meaning:"A gift sits before you, but you can't see it through the fog of discontent. Look up — something is being offered."},
    {n:5,name:"5 of Cups",keywords:["loss","grief","regret","disappointment"],meaning:"Three cups have spilled, but two still stand behind you. Mourning is necessary, but don't forget what remains."},
    {n:6,name:"6 of Cups",keywords:["nostalgia","childhood","innocence","reunion"],meaning:"A tender glance backward. Old memories, old friends, or the return of something you thought was lost to time."},
    {n:7,name:"7 of Cups",keywords:["fantasy","illusion","choices","wishful thinking"],meaning:"So many glittering options, but which are real? Not every vision in the clouds can survive contact with the ground."},
    {n:8,name:"8 of Cups",keywords:["walking away","disillusionment","seeking deeper meaning","leaving behind"],meaning:"Something that once fulfilled you no longer does. Walking away isn't failure — it's honesty about what you need."},
    {n:9,name:"9 of Cups",keywords:["contentment","satisfaction","wish fulfilled","emotional stability"],meaning:"The wish card. What you wanted has arrived or is arriving. Let yourself feel the simple pleasure of enough."},
    {n:10,name:"10 of Cups",keywords:["divine love","harmony","family","emotional fulfillment"],meaning:"The whole rainbow. Deep, lasting happiness — the kind that comes from love freely given and a life well-shared."},
  ],courts:[
    {court:"Page",name:"Page of Cups",keywords:["creative spark","intuition","curiosity","emotional openness"],meaning:"A dreamy messenger bearing a surprising feeling or creative impulse. Stay open to what the little fish in the cup has to say."},
    {court:"Knight",name:"Knight of Cups",keywords:["romance","charm","imagination","following the heart"],meaning:"The romantic on a white horse. He follows his heart above all else — beautiful, if sometimes impractical."},
    {court:"Queen",name:"Queen of Cups",keywords:["compassion","emotional depth","intuition","nurturing"],meaning:"She feels everything and has learned to hold it all without drowning. Deeply intuitive, deeply caring, a steady emotional anchor."},
    {court:"King",name:"King of Cups",keywords:["emotional maturity","diplomacy","calm","wisdom"],meaning:"Still waters run deep. He has mastered his emotions without suppressing them — composure born of genuine understanding."},
  ]},
  Swords:{pips:[
    {n:1,name:"Ace of Swords",keywords:["clarity","breakthrough","truth","new idea"],meaning:"The sword cuts through the fog. A moment of razor-sharp clarity, a new idea, or a truth that can no longer be denied."},
    {n:2,name:"2 of Swords",keywords:["indecision","stalemate","denial","difficult choices"],meaning:"The blindfold is self-imposed. You already know the answer — you're choosing not to look at it yet."},
    {n:3,name:"3 of Swords",keywords:["heartbreak","sorrow","grief","painful truth"],meaning:"The three swords pierce the heart in rain. Some truths hurt. Name the pain so it can begin to pass through you."},
    {n:4,name:"4 of Swords",keywords:["rest","recovery","contemplation","restoration"],meaning:"Lay down your sword. This is not defeat — it is the strategic retreat that makes the next fight possible."},
    {n:5,name:"5 of Swords",keywords:["conflict","defeat","betrayal","hollow victory"],meaning:"Someone won, but nobody feels good about it. Ask whether the battle was worth the cost — to anyone."},
    {n:6,name:"6 of Swords",keywords:["transition","moving on","calmer waters","leaving behind"],meaning:"The boat moves toward quieter shores. You carry your sorrows with you, but at least you're moving forward."},
    {n:7,name:"7 of Swords",keywords:["deception","strategy","stealth","getting away with something"],meaning:"Someone is slipping away with swords that aren't theirs. Check your blind spots — or check your own hands."},
    {n:8,name:"8 of Swords",keywords:["restriction","isolation","self-imposed limitation","victim mentality"],meaning:"Bound and blindfolded, but the bindings are loose. The prison is more mental than physical — you can walk away."},
    {n:9,name:"9 of Swords",keywords:["anxiety","nightmares","despair","mental anguish"],meaning:"The swords on the wall behind you are fears, not facts. The worst hour is the one before dawn — and dawn is coming."},
    {n:10,name:"10 of Swords",keywords:["rock bottom","painful ending","defeat","finality"],meaning:"Ten swords in the back — overkill, almost theatrical. This is the absolute end. But look: the sun is rising on the horizon."},
  ],courts:[
    {court:"Page",name:"Page of Swords",keywords:["curiosity","mental agility","new ideas","vigilance"],meaning:"Sharp-eyed and quick-witted, the Page watches everything. A message about truth, or the restless hunger to understand."},
    {court:"Knight",name:"Knight of Swords",keywords:["ambition","fast action","drive","intellectual charge"],meaning:"He charges headlong into the fray, sword raised, thinking later. Brilliant speed — but mind the collateral damage."},
    {court:"Queen",name:"Queen of Swords",keywords:["independence","clear perception","direct communication","truth"],meaning:"She has suffered, and her suffering made her wise. Unflinching honesty wrapped in hard-won composure."},
    {court:"King",name:"King of Swords",keywords:["intellectual authority","truth","analytical power","ethics"],meaning:"He judges clearly and speaks precisely. Authority grounded in fairness and mental discipline — not warmth, but justice."},
  ]},
  Pentacles:{pips:[
    {n:1,name:"Ace of Pentacles",keywords:["new opportunity","prosperity","manifestation","abundance"],meaning:"A golden coin offered from the heavens. A material opportunity — financial, professional, or physical — is arriving. Take it with both hands."},
    {n:2,name:"2 of Pentacles",keywords:["balance","adaptability","juggling priorities","flexibility"],meaning:"The figure-eight dance of keeping two things in the air. You can manage this — just don't pretend the juggle isn't happening."},
    {n:3,name:"3 of Pentacles",keywords:["teamwork","craftsmanship","collaboration","skill"],meaning:"The mason, the monk, and the architect all need each other. Mastery is built collaboratively, stone by careful stone."},
    {n:4,name:"4 of Pentacles",keywords:["control","security","possessiveness","conservation"],meaning:"Holding on tight to what you have. Security is wise, but grip too hard and you close yourself to what could flow in."},
    {n:5,name:"5 of Pentacles",keywords:["hardship","poverty","isolation","worry"],meaning:"Out in the cold, passing beneath a lit window. Help is closer than you think — but you have to be willing to ask."},
    {n:6,name:"6 of Pentacles",keywords:["generosity","charity","sharing wealth","reciprocity"],meaning:"One hand gives, another receives, and the scales hang between them. The flow of generosity keeps abundance alive."},
    {n:7,name:"7 of Pentacles",keywords:["patience","long-term investment","assessment","perseverance"],meaning:"The gardener pauses to look at what's growing. Not every harvest is immediate — trust the slow work you've put in."},
    {n:8,name:"8 of Pentacles",keywords:["apprenticeship","skill development","diligence","mastery"],meaning:"Head down, hands busy, one pentacle at a time. This is the quiet devotion of someone becoming genuinely good at what they do."},
    {n:9,name:"9 of Pentacles",keywords:["luxury","self-sufficiency","financial independence","refinement"],meaning:"The falcon on her wrist, the vineyard at her feet. You built this abundance yourself — enjoy the life your discipline created."},
    {n:10,name:"10 of Pentacles",keywords:["legacy","inheritance","family wealth","long-term success"],meaning:"Three generations under one arch. Wealth that lasts because it was built on something deeper than money — belonging, lineage, home."},
  ],courts:[
    {court:"Page",name:"Page of Pentacles",keywords:["ambition","desire to learn","new financial opportunity","studiousness"],meaning:"Steady eyes fixed on the coin. The Page studies with quiet intensity — a new skill, a new plan, a seed of future abundance."},
    {court:"Knight",name:"Knight of Pentacles",keywords:["reliability","hard work","routine","methodical progress"],meaning:"The slowest knight, but the one who always arrives. Dependable, thorough, and willing to do the unglamorous work."},
    {court:"Queen",name:"Queen of Pentacles",keywords:["nurturing","practical abundance","domestic comfort","generosity"],meaning:"She makes any space feel like home. Abundance expressed through care — good food, warm rooms, and a steady presence."},
    {court:"King",name:"King of Pentacles",keywords:["wealth","business acumen","security","material success"],meaning:"He built an empire with patience and pragmatism. Abundance achieved, managed wisely, and shared with quiet confidence."},
  ]}
};

function buildMinors(){const cards=[];SUITS.forEach(suit=>{const d=MINOR_ARCANA_DATA[suit];d.pips.forEach(p=>{cards.push({name:p.name,suit,keywords:p.keywords,meaning:p.meaning});});d.courts.forEach(c=>{cards.push({name:c.name,suit,court:c.court,keywords:c.keywords,meaning:c.meaning});});});return cards;}
const ALL_CARDS=[...MAJOR_ARCANA,...buildMinors()];

// ── Spreads & layouts ────────────────────────────────────────────────
const DEFAULT_SPREADS=[{id:"s1",name:"Three Card",positions:[{id:"p1",label:"Past",meaning:"What has led to this moment"},{id:"p2",label:"Present",meaning:"Where you stand right now"},{id:"p3",label:"Future",meaning:"Where this path leads"}]},{id:"s2",name:"Daily Card",positions:[{id:"p1",label:"Today",meaning:"The energy or lesson of the day"}]},{id:"s3",name:"Celtic Cross",positions:[{id:"p1",label:"Present",meaning:"The heart of the matter"},{id:"p2",label:"Challenge",meaning:"What crosses you"},{id:"p3",label:"Foundation",meaning:"Foundations beneath"},{id:"p4",label:"Recent Past",meaning:"What is passing away"},{id:"p5",label:"Crown",meaning:"What could emerge"},{id:"p6",label:"Near Future",meaning:"What approaches"},{id:"p7",label:"Self",meaning:"How you show up"},{id:"p8",label:"Environment",meaning:"Outside influences"},{id:"p9",label:"Hopes & Fears",meaning:"Your inner stakes"},{id:"p10",label:"Outcome",meaning:"Where this leads"}]},{id:"s4",name:"Situation · Advice · Outcome",positions:[{id:"p1",label:"Situation",meaning:"The current state of things"},{id:"p2",label:"Advice",meaning:"What the cards suggest"},{id:"p3",label:"Outcome",meaning:"Likely result if advice followed"}]}];
const SLOT_W=54,SLOT_H=66;
const PRESET_LAYOUTS={s1:{height:100,cards:[{posId:"p1",cx:18,cy:50},{posId:"p2",cx:50,cy:50},{posId:"p3",cx:82,cy:50}]},s2:{height:100,cards:[{posId:"p1",cx:50,cy:50}]},s3:{height:330,cards:[{posId:"p1",cx:26,cy:42},{posId:"p2",cx:26,cy:42,rotate:90},{posId:"p3",cx:26,cy:72},{posId:"p4",cx:8,cy:42},{posId:"p5",cx:26,cy:13},{posId:"p6",cx:44,cy:42},{posId:"p7",cx:80,cy:86},{posId:"p8",cx:80,cy:62},{posId:"p9",cx:80,cy:38},{posId:"p10",cx:80,cy:14}]},s4:{height:100,cards:[{posId:"p1",cx:18,cy:50},{posId:"p2",cx:50,cy:50},{posId:"p3",cx:82,cy:50}]}};
function autoLayout(positions){const n=positions.length;if(n===0)return{height:100,cards:[]};if(n===1)return{height:100,cards:[{posId:positions[0].id,cx:50,cy:50}]};const cols=n<=3?n:n<=8?Math.min(4,Math.ceil(n/2)):Math.min(4,Math.ceil(n/3));const rows=Math.ceil(n/cols);const cellW=100/cols;const height=rows*90+16;return{height,cards:positions.map((p,i)=>{const row=Math.floor(i/cols);const col=i%cols;const ir=Math.min(cols,n-row*cols);const off=(cols-ir)*cellW/2;return{posId:p.id,cx:off+col*cellW+cellW/2,cy:((row+0.5)/rows)*100};})};}
function getSpreadLayout(sp){if(PRESET_LAYOUTS[sp.id])return PRESET_LAYOUTS[sp.id];return autoLayout(sp.positions);}
function getEntryLayout(e){if(e.spreadId&&PRESET_LAYOUTS[e.spreadId])return PRESET_LAYOUTS[e.spreadId];const m=DEFAULT_SPREADS.find(s=>s.name===e.spreadName);if(m&&PRESET_LAYOUTS[m.id])return PRESET_LAYOUTS[m.id];return autoLayout((e.slots||[]).map((s,i)=>({id:s.posId||`a${i}`,label:s.label})));}

// ── Elemental suit colours ───────────────────────────────────────────
const suitSymbol=(card)=>{if(!card)return"✦";if(card.suit==="Wands")return"🜂";if(card.suit==="Cups")return"🜄";if(card.suit==="Swords")return"🜁";if(card.suit==="Pentacles")return"🜃";return"✦";};
const suitColor=(card)=>{if(!card||!card.suit)return C.accent;if(card.suit==="Wands")return"#a04820";if(card.suit==="Cups")return"#2860a0";if(card.suit==="Swords")return"#6a7080";if(card.suit==="Pentacles")return"#2a6a28";return C.accent;};
const suitBg=(card)=>{if(!card||!card.suit)return V.card;if(card.suit==="Wands")return"rgba(248,240,232,0.65)";if(card.suit==="Cups")return"rgba(234,242,250,0.65)";if(card.suit==="Swords")return"rgba(242,244,248,0.65)";if(card.suit==="Pentacles")return"rgba(238,246,236,0.65)";return V.card;};
const suitBorder=(card)=>{if(!card||!card.suit)return V.border;if(card.suit==="Wands")return"rgba(180,120,90,0.25)";if(card.suit==="Cups")return"rgba(80,120,170,0.2)";if(card.suit==="Swords")return"rgba(140,150,170,0.25)";if(card.suit==="Pentacles")return"rgba(70,120,60,0.2)";return V.border;};
const suitBar=(card)=>{if(!card||!card.suit)return"transparent";if(card.suit==="Wands")return"linear-gradient(180deg,rgba(180,70,30,0.35),rgba(180,70,30,0.08))";if(card.suit==="Cups")return"linear-gradient(180deg,rgba(40,90,160,0.35),rgba(40,90,160,0.08))";if(card.suit==="Swords")return"linear-gradient(180deg,rgba(120,130,150,0.35),rgba(120,130,150,0.08))";if(card.suit==="Pentacles")return"linear-gradient(180deg,rgba(50,110,45,0.35),rgba(50,110,45,0.08))";return"transparent";};
const suitSymbolBg=(card)=>{if(!card||!card.suit)return"rgba(60,106,62,0.1)";if(card.suit==="Wands")return"rgba(180,70,30,0.1)";if(card.suit==="Cups")return"rgba(40,90,160,0.1)";if(card.suit==="Swords")return"rgba(120,130,150,0.12)";if(card.suit==="Pentacles")return"rgba(50,110,45,0.1)";return"rgba(60,106,62,0.1)";};

const todayKey=()=>new Date().toISOString().slice(0,10);
const formatDate=()=>new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

// ── Vellum tokens (translucent surfaces) ─────────────────────────────
const V = {
  card:   "rgba(248,244,234,0.55)",
  cardHover:"rgba(248,244,234,0.65)",
  input:  "rgba(240,236,224,0.45)",
  border: "rgba(200,190,165,0.3)",
  borderFaint:"rgba(200,190,165,0.18)",
  shadow: "0 1px 4px rgba(40,60,30,0.06)",
  pill:   "rgba(60,90,50,0.08)",
  pillBorder:"rgba(80,110,60,0.18)",
};

// ── Colour tokens ────────────────────────────────────────────────────
const C = {
  accent:"#3a6a3e", accentDim:"#5a8a5e", moss:"#3a8a50",
  text:"#1e3a22", textMid:"#4a6a3e", textDim:"#5a8a5e",
  rose:"#904030",
  // Gradient zone (header/nav)
  headerBg:"rgba(58,104,68,0.92)", navBg:"rgba(64,108,72,0.92)",
  lightText:"#f0f8ec", lightDim:"#a0d0a0",
  navActive:"#e8f8e0", navInactive:"#b8d8b0",
  fontDisplay:"'Marcellus',Georgia,serif", fontBody:"'Lora',Georgia,serif",
  gradient:"linear-gradient(180deg,#3a6844 0%,#5a8a5a 12%,#7aaa78 24%,#a0c898 38%,#c4debb 50%,#dcecd4 62%,#e8f2e4 72%,#dcecd4 82%,#b0d0a8 90%,#7aaa78 96%,#4a7a50 100%)",
};

// ── Confirm Modal ────────────────────────────────────────────────────
function ConfirmModal({message,onConfirm,onCancel}){return(
  <div style={styles.modalOverlay}><div style={styles.modalBox}><p style={styles.modalMessage}>{message}</p><div style={styles.btnRow}>
    <button style={styles.btnSecondary} onClick={onCancel}>Cancel</button>
    <button style={{...styles.btnPrimary,flex:1,borderColor:"#c07060",color:"#904030"}} onClick={onConfirm}>Delete</button>
  </div></div></div>);}

// ═══════════════════════════════════════════════════════════════════
export default function TarotApp(){
  const [tab,setTab]=useState("journal");const [spreads,setSpreads]=useState(DEFAULT_SPREADS);const [entries,setEntries]=useState([]);const [cardNotes,setCardNotes]=useState({});const [decks,setDecks]=useState([]);const [loaded,setLoaded]=useState(false);const [showSettings,setShowSettings]=useState(false);
  useEffect(()=>{(async()=>{const e=await store.get("entries");if(e)setEntries(e);const cn=await store.get("cardNotes");if(cn)setCardNotes(cn);const d=await store.get("decks");if(d)setDecks(d);const sp=await store.get("spreads");if(sp)setSpreads(sp);setLoaded(true);})();},[]);
  const saveEntries=useCallback(v=>{setEntries(v);store.set("entries",v);},[]);const saveCardNotes=useCallback(v=>{setCardNotes(v);store.set("cardNotes",v);},[]);const saveDecks=useCallback(v=>{setDecks(v);store.set("decks",v);},[]);const saveSpreads=useCallback(v=>{setSpreads(v);store.set("spreads",v);},[]);

  if(!loaded)return<div style={styles.loading}><div style={{color:C.accent,fontSize:32}}>✦</div><div style={{color:C.accent,fontFamily:C.fontBody,fontSize:14,letterSpacing:3}}>LOADING</div></div>;
  if(showSettings)return<div style={styles.root}><div style={styles.gradientBg}/><SettingsSection spreads={spreads} saveSpreads={saveSpreads} onBack={()=>setShowSettings(false)}/></div>;

  return(
    <div style={styles.root}>
      <div style={styles.gradientBg}/>
      <Header onSettings={()=>setShowSettings(true)}/>
      <main style={styles.main}>
        {tab==="journal"&&<JournalSection entries={entries} saveEntries={saveEntries} spreads={spreads}/>}
        {tab==="cards"&&<CardsSection cardNotes={cardNotes} saveCardNotes={saveCardNotes} entries={entries}/>}
        {tab==="decks"&&<DecksSection decks={decks} saveDecks={saveDecks}/>}
      </main>
      <nav style={styles.nav}>
        {[{id:"journal",label:"Journal",icon:"◈"},{id:"cards",label:"Cards",icon:"✦"},{id:"decks",label:"Decks",icon:"◎"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{...styles.navBtn,...(tab===t.id?styles.navBtnActive:{})}}>
            <span style={styles.navIcon}>{t.icon}</span><span style={styles.navLabel}>{t.label}</span>
          </button>))}
      </nav>
    </div>);
}

function Header({onSettings}){return(
  <header style={styles.header}>
    <div style={styles.headerInner}><span style={{color:C.lightDim,fontSize:13}}>✦</span><span style={styles.headerTitle}>Arcana</span><span style={{color:C.lightDim,fontSize:13}}>✦</span></div>
    <div style={styles.headerSub}>Personal Tarot Journal</div>
    <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,232,192,0.2),transparent)",marginTop:10}}/>
    <button onClick={onSettings} style={styles.settingsBtn}>⚙</button>
  </header>);}

// ── Spread Map ───────────────────────────────────────────────────────
function SpreadMap({layout,slots,activeIdx,onSelect,readOnly}){
  if(!layout||!layout.cards)return null;
  return(<div style={{position:"relative",width:"100%",height:layout.height,marginBottom:16,borderRadius:14,background:V.input,border:`1px solid ${V.borderFaint}`,overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,opacity:0.04,backgroundImage:`radial-gradient(circle,${C.accent} 1px,transparent 1px)`,backgroundSize:"28px 28px"}}/>
    {layout.cards.map((pos,li)=>{const si=slots.findIndex(s=>s.posId===pos.posId);const slot=si>=0?slots[si]:null;if(!slot)return null;
      const card=slot.card?ALL_CARDS.find(c=>c.name===slot.card):null;const hasCard=!!slot.card;const hasNotes=!!(slot.note&&slot.note.trim());const isActive=si===activeIdx;const rot=pos.rotate||0;
      let bg=V.input,bc=V.borderFaint;
      if(isActive){bg=V.cardHover;bc=C.accent;}else if(hasCard&&hasNotes){bg=V.cardHover;bc=suitColor(card)+"50";}else if(hasCard){bg=V.card;bc=suitColor(card)+"40";}
      return(<button key={pos.posId} onClick={()=>!readOnly&&onSelect&&onSelect(si)} style={{position:"absolute",left:`${pos.cx}%`,top:`${pos.cy}%`,transform:`translate(-50%,-50%)${rot?` rotate(${rot}deg)`:""}`,width:SLOT_W,height:SLOT_H,background:bg,border:`1.5px solid ${bc}`,borderRadius:8,cursor:readOnly?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,padding:3,zIndex:isActive?5:rot?3:1,transition:"all 0.2s",boxShadow:isActive?`0 0 12px ${C.accent}25`:hasCard?V.shadow:"none"}}>
        {hasCard?<span style={{fontSize:16,color:suitColor(card),lineHeight:1,transform:rot?`rotate(-${rot}deg)`:"none"}}>{suitSymbol(card)}</span>:<span style={{fontSize:13,color:C.textDim,fontWeight:600,lineHeight:1}}>{li+1}</span>}
        <span style={{fontSize:7,color:hasCard?C.textMid:C.textDim,textTransform:"uppercase",letterSpacing:0.5,maxWidth:SLOT_W-8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center",lineHeight:1.2,transform:rot?`rotate(-${rot}deg)`:"none"}}>{slot.label}</span>
        {hasCard&&hasNotes&&!isActive&&<div style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:C.accent,transform:rot?`rotate(-${rot}deg)`:"none"}}/>}
      </button>);})}
  </div>);}

// ── Journal ──────────────────────────────────────────────────────────
function JournalSection({entries,saveEntries,spreads}){
  const [view,setView]=useState("home");const [activeEntry,setActiveEntry]=useState(null);const [confirmDelete,setConfirmDelete]=useState(null);
  const deleteEntry=id=>saveEntries(entries.filter(e=>e.id!==id));
  const updateEntry=u=>{saveEntries(entries.map(e=>e.id===u.id?u:e));setActiveEntry(u);};
  if(view==="daily")return<DailyPull onBack={()=>setView("home")} entries={entries} saveEntries={saveEntries}/>;
  if(view==="newEntry")return<NewEntry spreads={spreads} onSave={e=>{saveEntries([e,...entries]);setView("home");}} onBack={()=>setView("home")}/>;
  if(view==="editEntry"&&activeEntry)return<EditEntry entry={activeEntry} onSave={u=>{updateEntry(u);setView("entry");}} onBack={()=>setView("entry")}/>;
  if(view==="entry"&&activeEntry)return<EntryDetail entry={activeEntry} onBack={()=>setView("home")} onEdit={()=>setView("editEntry")} onDelete={()=>setConfirmDelete(activeEntry.id)}/>;
  const stalker=getStalkerCard(entries);
  return(<div style={styles.section}>
    {confirmDelete&&<ConfirmModal message="Delete this reading? This cannot be undone." onConfirm={()=>{deleteEntry(confirmDelete);setConfirmDelete(null);}} onCancel={()=>setConfirmDelete(null)}/>}
    <div style={styles.quickRow}><QuickBtn icon="☽" label="Daily Pull" onClick={()=>setView("daily")} accent={C.text}/><QuickBtn icon="◈" label="New Reading" onClick={()=>setView("newEntry")} accent={C.moss}/></div>
    {stalker&&<div style={styles.stalkerBox}><div style={styles.stalkerLabel}>✦ Recurring Card</div><div style={styles.stalkerCard}>{stalker.name}</div><div style={styles.stalkerCount}>has appeared {stalker.count}× in your journal</div></div>}
    <SectionHeader label="Past Readings"/>{entries.filter(e=>!e.isDaily).length===0&&<EmptyState text="Your readings will appear here"/>}{entries.filter(e=>!e.isDaily).map(e=><EntryCard key={e.id} entry={e} onClick={()=>{setActiveEntry(e);setView("entry");}}/>)}
    <SectionHeader label="Daily Pulls"/>{entries.filter(e=>e.isDaily).length===0&&<EmptyState text="Your daily pulls will appear here"/>}{entries.filter(e=>e.isDaily).map(e=><EntryCard key={e.id} entry={e} onClick={()=>{setActiveEntry(e);setView("entry");}}/>)}
  </div>);}

function getStalkerCard(entries){const counts={};entries.forEach(e=>{(e.slots||[]).forEach(s=>{if(s.card)counts[s.card]=(counts[s.card]||0)+1;if(s.clarifier)counts[s.clarifier]=(counts[s.clarifier]||0)+1;});if(e.card)counts[e.card]=(counts[e.card]||0)+1;});const top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];if(!top||top[1]<2)return null;return{name:top[0],count:top[1]};}
function QuickBtn({icon,label,onClick,accent}){return<button onClick={onClick} style={styles.quickBtn}><span style={{fontSize:22,color:accent}}>{icon}</span><span style={{...styles.quickBtnLabel,color:accent}}>{label}</span></button>;}

// ── Daily Pull ───────────────────────────────────────────────────────
function DailyPull({onBack,entries,saveEntries}){
  const [card,setCard]=useState(null);const [note,setNote]=useState("");const [saved,setSaved]=useState(false);const [alreadyPulled,setAlreadyPulled]=useState(false);const [existingEntry,setExistingEntry]=useState(null);
  useEffect(()=>{const t=todayKey();const e=entries.find(x=>x.isDaily&&x.dateKey===t);if(e){setAlreadyPulled(true);setExistingEntry(e);}},[entries]);
  const draw=()=>{setCard(ALL_CARDS[Math.floor(Math.random()*ALL_CARDS.length)]);setSaved(false);setNote("");};
  const drawAnyway=()=>{setAlreadyPulled(false);setExistingEntry(null);draw();};
  const save=()=>{saveEntries([{id:Date.now().toString(),isDaily:true,date:formatDate(),dateKey:todayKey(),card:card.name,note,spreadName:"Daily Pull",slots:[]},...entries]);setSaved(true);};
  return(<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Daily Pull</h2>
    {alreadyPulled&&!card?<div><div style={styles.alreadyPulledBox}><div style={styles.alreadyPulledLabel}>Today's Card</div><div style={styles.alreadyPulledCard}>{existingEntry?.card}</div><div style={{fontSize:11,color:C.textDim,letterSpacing:1}}>pulled earlier today</div>{existingEntry?.note&&<p style={{fontSize:13,color:C.textMid,fontStyle:"italic",lineHeight:1.7,marginTop:12}}>{existingEntry.note}</p>}</div><button style={{...styles.btnSecondary,width:"100%",marginTop:14}} onClick={drawAnyway}>Draw another card anyway</button></div>
    :!card?<div style={styles.drawArea}><div style={styles.cardBack} onClick={draw}><div style={{fontSize:44,color:C.accentDim}}>✦</div><div style={{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase"}}>Tap to draw</div></div></div>
    :<div>
      <div style={{...styles.drawnCard,borderColor:suitBorder(card),background:suitBg(card),position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(card),borderRadius:"3px 0 0 3px"}}/>
        <div style={{width:40,height:40,borderRadius:"50%",background:suitSymbolBg(card),display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}><span style={{color:suitColor(card),fontSize:22}}>{suitSymbol(card)}</span></div>
        <div style={styles.drawnCardName}>{card.name}</div>
        <div style={{fontSize:11,color:suitColor(card),letterSpacing:1.5,marginBottom:12,opacity:0.7}}>{card.keywords.join(" · ")}</div>
        <p style={styles.drawnCardMeaning}>{card.meaning}</p>
      </div>
      {!saved?<><textarea style={styles.textarea} placeholder="Your reflections on this card today…" value={note} onChange={e=>setNote(e.target.value)} rows={4}/><div style={styles.btnRow}><button style={styles.btnSecondary} onClick={draw}>Draw Again</button><button style={styles.btnPrimary} onClick={save}>Save to Journal</button></div></>:<div style={styles.savedBanner}>✦ Saved to your journal</div>}
    </div>}
  </div>);}

// ── New Entry ────────────────────────────────────────────────────────
function NewEntry({spreads,onSave,onBack}){
  const [step,setStep]=useState("pick");const [spread,setSpread]=useState(null);const [slots,setSlots]=useState([]);const [question,setQuestion]=useState("");const [globalNote,setGlobalNote]=useState("");const [activeSlot,setActiveSlot]=useState(0);
  const pickSpread=sp=>{setSpread(sp);setSlots(sp.positions.map(p=>({posId:p.id,label:p.label,meaning:p.meaning,card:"",clarifier:"",showClarifier:false,note:""})));setActiveSlot(0);setStep("fill");};
  const updateSlot=(idx,key,val)=>{const n=[...slots];n[idx]={...n[idx],[key]:val};setSlots(n);};
  const filledCount=slots.filter(s=>s.card).length;
  const save=()=>{onSave({id:Date.now().toString(),isDaily:false,date:formatDate(),dateKey:todayKey(),spreadId:spread.id,spreadName:spread.name,question,slots,note:globalNote});};
  if(step==="pick")return(<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Choose a Spread</h2>{spreads.map(sp=><button key={sp.id} style={styles.spreadPickCard} onClick={()=>pickSpread(sp)}><div style={styles.spreadPickName}>{sp.name}</div><div style={styles.spreadPickPositions}>{sp.positions.map(p=>p.label).join(" · ")}</div><div style={{fontSize:10,color:C.textDim,marginTop:4,letterSpacing:1}}>{sp.positions.length} {sp.positions.length===1?"card":"cards"}</div></button>)}</div>);
  if(step==="fill"){const layout=getSpreadLayout(spread);const slot=slots[activeSlot];const ac=slot?.card?ALL_CARDS.find(c=>c.name===slot.card):null;
    return(<div style={styles.section}><BackBtn onClick={()=>setStep("pick")}/><h2 style={styles.pageTitle}>{spread.name}</h2>
      <input style={styles.input} placeholder="Your question or intention (optional)" value={question} onChange={e=>setQuestion(e.target.value)}/>
      <SpreadMap layout={layout} slots={slots} activeIdx={activeSlot} onSelect={setActiveSlot}/>
      <div style={styles.mapProgress}><span>{filledCount} of {slots.length} filled</span>{slots.every(s=>s.card)&&<span style={{color:C.accent}}> ✦ all placed</span>}</div>
      {slot&&<div style={styles.slotPanel}><div style={styles.slotPanelHeader}><div style={styles.slotPanelNum}>{activeSlot+1}</div><div><div style={styles.slotLabel}>{slot.label}</div><div style={styles.slotMeaning}>{slot.meaning}</div></div></div>
        <CardSelect value={slot.card} onChange={v=>updateSlot(activeSlot,"card",v)} placeholder="Select card…"/>
        {slot.card&&ac&&<div style={{display:"flex",alignItems:"center",marginTop:6,paddingLeft:2}}><span style={{color:suitColor(ac),marginRight:6}}>{suitSymbol(ac)}</span><span style={{color:C.textDim,fontStyle:"italic",fontSize:12}}>{ac.keywords.join(" · ")}</span></div>}
        {slot.card&&<button style={styles.clarifierToggle} onClick={()=>updateSlot(activeSlot,"showClarifier",!slot.showClarifier)}>{slot.showClarifier?"− Remove clarifier":"+ Add clarifier"}</button>}
        {slot.showClarifier&&<div style={styles.clarifierArea}><div style={styles.clarifierLine}/><div style={{flex:1}}><div style={styles.clarifierLabel}>Clarifier</div><CardSelect value={slot.clarifier} onChange={v=>updateSlot(activeSlot,"clarifier",v)} placeholder="Select clarifier…"/></div></div>}
        <textarea style={{...styles.textarea,marginTop:8}} placeholder="Notes for this position…" value={slot.note} onChange={e=>updateSlot(activeSlot,"note",e.target.value)} rows={2}/>
        <div style={styles.slotPanelNav}><button style={{...styles.slotNavBtn,...(activeSlot===0?{opacity:.3}:{})}} disabled={activeSlot===0} onClick={()=>setActiveSlot(activeSlot-1)}>← {activeSlot>0?slots[activeSlot-1].label:""}</button><button style={{...styles.slotNavBtn,...(activeSlot===slots.length-1?{opacity:.3}:{})}} disabled={activeSlot===slots.length-1} onClick={()=>setActiveSlot(activeSlot+1)}>{activeSlot<slots.length-1?slots[activeSlot+1].label:""} →</button></div>
      </div>}
      <button style={styles.btnPrimary} onClick={()=>setStep("notes")}>Continue to Reflection →</button></div>);}
  return(<div style={styles.section}><BackBtn onClick={()=>setStep("fill")}/><h2 style={styles.pageTitle}>Overall Reflection</h2><textarea style={styles.textarea} placeholder="Overall impressions, themes, feelings…" value={globalNote} onChange={e=>setGlobalNote(e.target.value)} rows={6}/><button style={styles.btnPrimary} onClick={save}>Save Reading ✦</button></div>);}

// ── Edit Entry ───────────────────────────────────────────────────────
function EditEntry({entry,onSave,onBack}){
  const [question,setQuestion]=useState(entry.question||"");const [note,setNote]=useState(entry.note||"");const [dailyNote,setDailyNote]=useState(entry.isDaily?(entry.note||""):"");const [slots,setSlots]=useState((entry.slots||[]).map(s=>({...s})));const [activeSlot,setActiveSlot]=useState(0);
  const updateSlot=(idx,key,val)=>{const n=[...slots];n[idx]={...n[idx],[key]:val};setSlots(n);};
  const save=()=>{if(entry.isDaily)onSave({...entry,note:dailyNote});else onSave({...entry,question,note,slots});};
  if(entry.isDaily)return(<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Edit Daily Pull</h2><div style={styles.editCardDisplay}><span style={{color:suitColor(ALL_CARDS.find(c=>c.name===entry.card)||{}),marginRight:8}}>{suitSymbol(ALL_CARDS.find(c=>c.name===entry.card)||{})}</span>{entry.card}</div><label style={styles.fieldLabel}>Your Reflection</label><textarea style={styles.textarea} value={dailyNote} onChange={e=>setDailyNote(e.target.value)} rows={5} placeholder="Your reflections…"/><button style={styles.btnPrimary} onClick={save}>Save Changes ✦</button></div>);
  const layout=getEntryLayout(entry);const slot=slots[activeSlot];
  return(<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Edit Reading</h2><div style={styles.editMeta}>{entry.spreadName} · {entry.date}</div>
    <label style={styles.fieldLabel}>Question / Intention</label><input style={styles.input} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Your question or intention"/>
    <SpreadMap layout={layout} slots={slots} activeIdx={activeSlot} onSelect={setActiveSlot}/>
    {slot&&<div style={styles.slotPanel}><div style={styles.slotPanelHeader}><div style={styles.slotPanelNum}>{activeSlot+1}</div><div><div style={styles.slotLabel}>{slot.label}</div><div style={styles.slotMeaning}>{slot.meaning}</div></div></div>
      <CardSelect value={slot.card} onChange={v=>updateSlot(activeSlot,"card",v)} placeholder="Select card…"/>
      {slot.card&&<button style={styles.clarifierToggle} onClick={()=>updateSlot(activeSlot,"showClarifier",!slot.showClarifier||!!slot.clarifier)}>{slot.showClarifier||slot.clarifier?"− Remove clarifier":"+ Add clarifier"}</button>}
      {(slot.showClarifier||slot.clarifier)&&<div style={styles.clarifierArea}><div style={styles.clarifierLine}/><div style={{flex:1}}><div style={styles.clarifierLabel}>Clarifier</div><CardSelect value={slot.clarifier} onChange={v=>updateSlot(activeSlot,"clarifier",v)} placeholder="Select clarifier…"/></div></div>}
      <textarea style={{...styles.textarea,marginTop:8}} placeholder="Notes…" value={slot.note} onChange={e=>updateSlot(activeSlot,"note",e.target.value)} rows={2}/>
    </div>}
    <label style={{...styles.fieldLabel,marginTop:12}}>Overall Reflection</label><textarea style={styles.textarea} value={note} onChange={e=>setNote(e.target.value)} rows={5} placeholder="Overall impressions…"/><button style={styles.btnPrimary} onClick={save}>Save Changes ✦</button></div>);}

// ── Card Select ──────────────────────────────────────────────────────
function CardSelect({value,onChange,placeholder}){
  const [open,setOpen]=useState(false);const [search,setSearch]=useState("");
  const filtered=ALL_CARDS.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())).slice(0,20);const card=ALL_CARDS.find(c=>c.name===value);
  if(!open)return<button style={{...styles.cardSelectBtn,borderColor:card?suitColor(card)+"40":V.border}} onClick={()=>setOpen(true)}>{card?<><span style={{color:suitColor(card)}}>{suitSymbol(card)}</span> {card.name}</>:<span style={{opacity:.4}}>{placeholder}</span>}</button>;
  return(<div style={styles.cardSelectOpen}><input autoFocus style={styles.cardSearchInput} placeholder="Search cards…" value={search} onChange={e=>setSearch(e.target.value)}/><div style={styles.cardList}>{filtered.map(c=><button key={c.name} style={styles.cardListItem} onClick={()=>{onChange(c.name);setOpen(false);setSearch("");}}><span style={{color:suitColor(c),marginRight:6}}>{suitSymbol(c)}</span>{c.name}</button>)}</div><button style={styles.cardSelectCancel} onClick={()=>setOpen(false)}>Cancel</button></div>);}

// ── Entry Detail ─────────────────────────────────────────────────────
function EntryDetail({entry,onBack,onEdit,onDelete}){
  const [confirmDelete,setConfirmDelete]=useState(false);const [expandedSlot,setExpandedSlot]=useState(null);
  const hasSlots=(entry.slots||[]).length>0&&!entry.isDaily;const layout=hasSlots?getEntryLayout(entry):null;
  return(<div style={styles.section}>
    {confirmDelete&&<ConfirmModal message="Delete this reading permanently?" onConfirm={()=>{setConfirmDelete(false);onDelete();}} onCancel={()=>setConfirmDelete(false)}/>}
    <BackBtn onClick={onBack}/><div style={{textAlign:"center",marginBottom:8}}><h2 style={styles.pageTitle}>{entry.spreadName}</h2><div style={{fontSize:11,color:C.textDim,letterSpacing:2,marginBottom:16}}>{entry.date}</div></div>
    {entry.question&&<div style={styles.entryQuestion}>"{entry.question}"</div>}
    {entry.isDaily&&entry.card&&(()=>{const c=ALL_CARDS.find(x=>x.name===entry.card);return<div style={{...styles.drawnCard,borderColor:suitBorder(c),background:suitBg(c),position:"relative",overflow:"hidden"}}><div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(c),borderRadius:"3px 0 0 3px"}}/><div style={styles.drawnCardName}>{entry.card}</div>{entry.note&&<p style={styles.drawnCardMeaning}>{entry.note}</p>}</div>;})()}
    {hasSlots&&layout&&<><SpreadMap layout={layout} slots={entry.slots} activeIdx={expandedSlot} onSelect={setExpandedSlot}/><div style={styles.mapHint}>tap a position to see details</div></>}
    {hasSlots&&expandedSlot!==null&&entry.slots[expandedSlot]&&(()=>{const slot=entry.slots[expandedSlot];const card=ALL_CARDS.find(c=>c.name===slot.card);const clar=ALL_CARDS.find(c=>c.name===slot.clarifier);return(
      <div style={{...styles.slotDetailExpanded,background:card?suitBg(card):V.card,borderColor:card?suitBorder(card):V.border,position:"relative",overflow:"hidden"}}>
        {card&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(card),borderRadius:"3px 0 0 3px"}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={styles.slotLabel}>{slot.label}</div><div style={styles.slotMeaning}>{slot.meaning}</div></div><button onClick={()=>setExpandedSlot(null)} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:16,padding:0}}>✕</button></div>
        {card&&<div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}><div style={{width:32,height:32,borderRadius:"50%",background:suitSymbolBg(card),display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:suitColor(card),fontSize:16}}>{suitSymbol(card)}</span></div><span style={{fontSize:14,color:C.text,fontFamily:C.fontDisplay}}>{card.name}</span></div>}
        {card&&<div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginTop:6}}>{card.keywords.join(" · ")}</div>}
        {card&&<p style={{fontSize:12,color:C.textMid,fontStyle:"italic",lineHeight:1.7,marginTop:6,marginBottom:0}}>{card.meaning}</p>}
        {clar&&<div style={{...styles.cardPill,borderColor:suitColor(clar)+"30",color:suitColor(clar),fontSize:11,marginTop:6}}>↳ {clar.name} (clarifier)</div>}
        {slot.note&&<p style={{fontSize:12,color:C.textMid,fontStyle:"italic",margin:"8px 0 0",lineHeight:1.6}}>{slot.note}</p>}
      </div>);})()}
    {hasSlots&&expandedSlot===null&&(entry.slots||[]).map((slot,i)=>{const card=ALL_CARDS.find(c=>c.name===slot.card);if(!card)return null;return<div key={i} style={styles.slotCardCompact} onClick={()=>setExpandedSlot(i)}><span style={{color:suitColor(card),marginRight:8}}>{suitSymbol(card)}</span><span style={{fontSize:12,color:C.textMid,flex:1}}><span style={{color:C.accent}}>{slot.label}:</span> {card.name}</span>{slot.note&&<span style={{fontSize:10,color:C.accentDim}}>✎</span>}</div>;})}
    {entry.note&&!entry.isDaily&&<div style={styles.globalNote}>{entry.note}</div>}
    <div style={styles.btnRow}><button style={styles.btnSecondary} onClick={onEdit}>✎ Edit</button><button style={{...styles.btnSecondary,borderColor:"rgba(180,80,60,0.3)",color:C.rose}} onClick={()=>setConfirmDelete(true)}>Delete</button></div>
  </div>);}

// ── Spread Builder ───────────────────────────────────────────────────
function SpreadBuilder({spread,onSave,onBack}){
  const [name,setName]=useState(spread?.name||"");const [positions,setPositions]=useState(spread?.positions||[]);const isDefault=spread&&DEFAULT_SPREADS.find(s=>s.id===spread.id);
  const addPos=()=>setPositions([...positions,{id:Date.now().toString(),label:"",meaning:""}]);const updatePos=(i,k,v)=>{const n=[...positions];n[i]={...n[i],[k]:v};setPositions(n);};const removePos=i=>setPositions(positions.filter((_,idx)=>idx!==i));
  const moveUp=i=>{if(!i)return;const n=[...positions];[n[i-1],n[i]]=[n[i],n[i-1]];setPositions(n);};const moveDown=i=>{if(i===positions.length-1)return;const n=[...positions];[n[i],n[i+1]]=[n[i+1],n[i]];setPositions(n);};
  const save=()=>{if(!name.trim())return;onSave({id:spread?.id||Date.now().toString(),name:name.trim(),positions});};
  const pl=getSpreadLayout({id:spread?.id||"preview",positions});const ps=positions.map(p=>({posId:p.id,label:p.label,meaning:p.meaning,card:"",note:""}));
  return(<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>{spread?"Edit Spread":"New Spread"}</h2>
    {isDefault&&<div style={styles.infoNote}>✦ Editing a default template creates a customised version.</div>}
    <input style={styles.input} placeholder="Spread name…" value={name} onChange={e=>setName(e.target.value)}/>
    {positions.length>0&&<><div style={{...styles.fieldLabel,marginBottom:8}}>Layout Preview</div><SpreadMap layout={pl} slots={ps} activeIdx={-1} readOnly/></>}
    {positions.map((pos,i)=><div key={pos.id} style={styles.posRow}><div style={styles.posReorder}><button style={styles.reorderBtn} onClick={()=>moveUp(i)}>▲</button><button style={styles.reorderBtn} onClick={()=>moveDown(i)}>▼</button></div><div style={{flex:1}}><input style={{...styles.input,marginBottom:4}} placeholder={`Position ${i+1} label`} value={pos.label} onChange={e=>updatePos(i,"label",e.target.value)}/><input style={styles.input} placeholder="Meaning / description" value={pos.meaning} onChange={e=>updatePos(i,"meaning",e.target.value)}/></div><button style={styles.removeBtn} onClick={()=>removePos(i)}>✕</button></div>)}
    <button style={styles.btnSecondary} onClick={addPos}>+ Add Position</button><button style={{...styles.btnPrimary,marginTop:8}} onClick={save}>Save Spread ✦</button></div>);}

// ── Cards ────────────────────────────────────────────────────────────
function CardsSection({cardNotes,saveCardNotes,entries}){
  const [view,setView]=useState("list");const [activeCard,setActiveCard]=useState(null);const [filter,setFilter]=useState("All");
  const counts={};entries.forEach(e=>{(e.slots||[]).forEach(s=>{if(s.card)counts[s.card]=(counts[s.card]||0)+1;if(s.clarifier)counts[s.clarifier]=(counts[s.clarifier]||0)+1;});if(e.card)counts[e.card]=(counts[e.card]||0)+1;});
  const filters=["All","Major Arcana",...SUITS];const filtered=ALL_CARDS.filter(c=>{if(filter==="All")return true;if(filter==="Major Arcana")return!c.suit;return c.suit===filter;});
  if(view==="card")return<CardDetail card={activeCard} notes={cardNotes[activeCard.name]||{}} onSave={n=>{saveCardNotes({...cardNotes,[activeCard.name]:n});}} onBack={()=>setView("list")} count={counts[activeCard.name]||0}/>;
  return(<div style={styles.section}><h2 style={styles.pageTitle}>The 78 Cards</h2>
    <div style={styles.filterRow}>{filters.map(f=><button key={f} style={{...styles.filterBtn,...(filter===f?styles.filterBtnActive:{})}} onClick={()=>setFilter(f)}>{f==="All"?"All":f==="Major Arcana"?"Major":f}</button>)}</div>
    <div style={styles.cardGrid}>{filtered.map(card=><button key={card.name} style={{...styles.cardGridItem,borderColor:suitColor(card)+"25"}} onClick={()=>{setActiveCard(card);setView("card");}}>
      <div style={{color:suitColor(card),fontSize:18,marginBottom:4}}>{suitSymbol(card)}</div><div style={styles.cardGridName}>{card.name}</div>
      {counts[card.name]&&<div style={{fontSize:9,color:C.accent,marginTop:2}}>{counts[card.name]}×</div>}{cardNotes[card.name]?.myMeaning&&<div style={styles.cardGridEdited}>✎</div>}
    </button>)}</div></div>);}

function CardDetail({card,notes,onSave,onBack,count}){
  const [myKeywords,setMyKeywords]=useState(notes.myKeywords||"");const [myMeaning,setMyMeaning]=useState(notes.myMeaning||"");const [myNote,setMyNote]=useState(notes.myNote||"");const [tab,setTab]=useState("standard");
  const save=()=>onSave({myKeywords,myMeaning,myNote});
  return(<div style={styles.section}><BackBtn onClick={onBack}/>
    <div style={{...styles.cardDetailHero,background:suitBg(card),borderColor:suitBorder(card),position:"relative",overflow:"hidden"}}>
      {card.suit&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:suitBar(card),borderRadius:"3px 0 0 3px"}}/>}
      <div style={{width:48,height:48,borderRadius:"50%",background:suitSymbolBg(card),display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}><span style={{fontSize:28,color:suitColor(card)}}>{suitSymbol(card)}</span></div>
      <h2 style={styles.cardDetailName}>{card.name}</h2>{card.num&&<div style={{fontSize:13,color:C.textDim,letterSpacing:3}}>{card.num}</div>}
      {count>0&&<div style={{fontSize:11,color:C.accent,marginTop:7,letterSpacing:1}}>Appeared {count}× in your journal</div>}
    </div>
    <div style={styles.tabRow}><button style={{...styles.tabBtn,...(tab==="standard"?styles.tabBtnActive:{})}} onClick={()=>setTab("standard")}>Standard</button><button style={{...styles.tabBtn,...(tab==="mine"?styles.tabBtnActive:{})}} onClick={()=>setTab("mine")}>My Notes</button></div>
    {tab==="standard"&&<div style={styles.cardStandard}><div style={{fontSize:12,color:suitColor(card),letterSpacing:1.5,marginBottom:12,textAlign:"center"}}>{card.keywords.join(" · ")}</div><p style={styles.cardMeaningText}>{card.meaning}</p></div>}
    {tab==="mine"&&<div style={styles.cardMine}><label style={styles.fieldLabel}>My Keywords</label><input style={styles.input} placeholder="Your own keywords…" value={myKeywords} onChange={e=>setMyKeywords(e.target.value)}/><label style={styles.fieldLabel}>My Meaning</label><textarea style={styles.textarea} placeholder="What this card means to you…" value={myMeaning} onChange={e=>setMyMeaning(e.target.value)} rows={3}/><label style={styles.fieldLabel}>Personal Notes</label><textarea style={styles.textarea} placeholder="Memories, readings, associations…" value={myNote} onChange={e=>setMyNote(e.target.value)} rows={4}/><button style={styles.btnPrimary} onClick={save}>Save Notes ✦</button></div>}
  </div>);}

// ── Decks ─────────────────────────────────────────────────────────────
function DecksSection({decks,saveDecks}){
  const [view,setView]=useState("list");const [activeDeck,setActiveDeck]=useState(null);const [editing,setEditing]=useState(false);
  const deleteDeck=id=>{saveDecks(decks.filter(d=>d.id!==id));setView("list");};
  if(view==="new"||editing)return<DeckForm deck={editing?activeDeck:null} onSave={d=>{if(editing){saveDecks(decks.map(x=>x.id===d.id?d:x));setActiveDeck(d);setEditing(false);setView("detail");}else{saveDecks([d,...decks]);setView("list");}}} onBack={()=>{setEditing(false);setView(editing?"detail":"list");}}/>;
  if(view==="detail")return<DeckDetail deck={activeDeck} onBack={()=>setView("list")} onEdit={()=>setEditing(true)} onDelete={()=>deleteDeck(activeDeck.id)} onSave={d=>{saveDecks(decks.map(x=>x.id===d.id?d:x));setActiveDeck(d);}}/>;
  return(<div style={styles.section}><div style={styles.sectionHeaderRow}><h2 style={styles.pageTitle}>My Decks</h2><button style={styles.btnPrimary} onClick={()=>setView("new")}>+ Add Deck</button></div>
    {decks.length===0&&<EmptyState text="Add your first deck to start your collection"/>}
    <div style={styles.deckGrid}>{decks.map(dk=><button key={dk.id} style={styles.deckCard} onClick={()=>{setActiveDeck(dk);setView("detail");}}>
      {dk.photo?<img src={dk.photo} alt={dk.name} style={styles.deckThumb}/>:<div style={styles.deckThumbPlaceholder}><span style={{fontSize:28,opacity:.3}}>◎</span></div>}
      <div style={{fontSize:13,color:C.text,padding:"9px 11px 3px",letterSpacing:.5}}>{dk.name}</div>{dk.acquired&&<div style={{fontSize:10,color:C.textDim,padding:"0 11px 9px",letterSpacing:1}}>{dk.acquired}</div>}
    </button>)}</div></div>);}

function DeckDetail({deck,onBack,onEdit,onDelete,onSave}){
  const [addingPhoto,setAddingPhoto]=useState(false);const [confirmDelete,setConfirmDelete]=useState(false);
  const handlePhoto=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{onSave({...deck,photos:[...(deck.photos||[]),ev.target.result]});};r.readAsDataURL(f);};
  return(<div style={styles.section}>
    {confirmDelete&&<ConfirmModal message={`Delete "${deck.name}"?`} onConfirm={()=>{setConfirmDelete(false);onDelete();}} onCancel={()=>setConfirmDelete(false)}/>}
    <BackBtn onClick={onBack}/><div style={{textAlign:"center",marginBottom:18}}>{deck.photo?<img src={deck.photo} alt={deck.name} style={{width:"100%",maxHeight:210,objectFit:"cover",borderRadius:12,marginBottom:14}}/>:<div style={styles.deckThumbPlaceholder}>◎</div>}<h2 style={styles.pageTitle}>{deck.name}</h2>{deck.acquired&&<div style={{fontSize:11,color:C.textDim,letterSpacing:2}}>{deck.acquired}</div>}</div>
    {deck.notes&&<p style={styles.globalNote}>{deck.notes}</p>}
    {deck.tags&&deck.tags.length>0&&<div style={styles.tagRow}>{deck.tags.map(t=><span key={t} style={styles.tag}>{t}</span>)}</div>}
    <SectionHeader label="Photos" action="+ Add" onAction={()=>setAddingPhoto(true)}/>
    {addingPhoto&&<label style={styles.photoUpload}><input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/><span>📷 Tap to take or choose a photo</span></label>}
    {(deck.photos||[]).length===0&&!addingPhoto&&<EmptyState text="No photos yet"/>}
    <div style={styles.photoGrid}>{(deck.photos||[]).map((p,i)=><img key={i} src={p} alt="" style={styles.photoThumb}/>)}</div>
    <div style={styles.btnRow}><button style={styles.btnSecondary} onClick={onEdit}>Edit</button><button style={{...styles.btnSecondary,borderColor:"rgba(180,80,60,0.3)",color:C.rose}} onClick={()=>setConfirmDelete(true)}>Delete</button></div>
  </div>);}

function DeckForm({deck,onSave,onBack}){
  const [name,setName]=useState(deck?.name||"");const [acquired,setAcquired]=useState(deck?.acquired||"");const [notes,setNotes]=useState(deck?.notes||"");const [tags,setTags]=useState(deck?.tags?.join(", ")||"");const [photo,setPhoto]=useState(deck?.photo||null);
  const handleCover=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPhoto(ev.target.result);r.readAsDataURL(f);};
  const save=()=>{if(!name.trim())return;onSave({id:deck?.id||Date.now().toString(),name:name.trim(),acquired,notes,tags:tags.split(",").map(t=>t.trim()).filter(Boolean),photo,photos:deck?.photos||[]});};
  return(<div style={styles.section}><BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>{deck?"Edit Deck":"Add a Deck"}</h2>
    <label style={styles.photoUpload}>{photo?<img src={photo} alt="cover" style={{width:"100%",borderRadius:8,maxHeight:180,objectFit:"cover"}}/>:<span>📷 Add cover photo</span>}<input type="file" accept="image/*" capture="environment" onChange={handleCover} style={{display:"none"}}/></label>
    <label style={styles.fieldLabel}>Deck Name *</label><input style={styles.input} placeholder="e.g. Rider Waite Smith" value={name} onChange={e=>setName(e.target.value)}/>
    <label style={styles.fieldLabel}>Date Acquired</label><input style={styles.input} placeholder="e.g. March 2024" value={acquired} onChange={e=>setAcquired(e.target.value)}/>
    <label style={styles.fieldLabel}>Tags (comma separated)</label><input style={styles.input} placeholder="e.g. shadow work, gifted, daily reader" value={tags} onChange={e=>setTags(e.target.value)}/>
    <label style={styles.fieldLabel}>Notes</label><textarea style={styles.textarea} placeholder="Your thoughts on this deck…" value={notes} onChange={e=>setNotes(e.target.value)} rows={4}/>
    <button style={styles.btnPrimary} onClick={save}>Save Deck ✦</button></div>);}

// ── Settings ─────────────────────────────────────────────────────────
function SettingsSection({spreads,saveSpreads,onBack}){
  const [view,setView]=useState("main");const [editSpread,setEditSpread]=useState(null);const [confirmDelete,setConfirmDelete]=useState(null);
  if(view==="editSpread")return<SpreadBuilder spread={editSpread} onSave={sp=>{if(editSpread)saveSpreads(spreads.map(s=>s.id===sp.id?sp:s));else saveSpreads([...spreads,sp]);setView("main");}} onBack={()=>setView("main")}/>;
  const deleteSpread=id=>saveSpreads(spreads.filter(s=>s.id!==id));
  return(<div style={styles.section}>
    {confirmDelete&&<ConfirmModal message="Delete this spread template?" onConfirm={()=>{deleteSpread(confirmDelete);setConfirmDelete(null);}} onCancel={()=>setConfirmDelete(null)}/>}
    <BackBtn onClick={onBack}/><h2 style={styles.pageTitle}>Settings</h2>
    <SectionHeader label="Spread Templates" action="+ New" onAction={()=>{setEditSpread(null);setView("editSpread");}}/>
    <div style={styles.settingsList}>{spreads.map(sp=><div key={sp.id} style={styles.settingsRow}><div style={{flex:1}}><div style={{fontSize:14,color:C.text,letterSpacing:.5}}>{sp.name}</div><div style={{fontSize:11,color:C.textDim,marginTop:2}}>{sp.positions.length} positions</div></div>
      <div style={{display:"flex",gap:12}}><button style={styles.settingsRowBtn} onClick={()=>{setEditSpread(sp);setView("editSpread");}}>Edit</button>{!DEFAULT_SPREADS.find(d=>d.id===sp.id)&&<button style={{...styles.settingsRowBtn,color:C.rose}} onClick={()=>setConfirmDelete(sp.id)}>Delete</button>}</div></div>)}</div>
  </div>);}

// ── Shared ────────────────────────────────────────────────────────────
function BackBtn({onClick}){return<button onClick={onClick} style={styles.backBtn}>← Back</button>;}
function SectionHeader({label,action,onAction}){return<div style={styles.sectionHeaderRow}><div style={styles.sectionHeaderLabel}>{label}</div>{action&&<button style={styles.sectionHeaderAction} onClick={onAction}>{action}</button>}</div>;}
function EmptyState({text}){return<div style={styles.emptyState}>{text}</div>;}
function EntryCard({entry,onClick}){return(<button style={styles.entryCard} onClick={onClick}><div style={styles.entryCardTop}><span style={{fontSize:13,color:C.accent,letterSpacing:.5}}>{entry.spreadName}</span><span style={{fontSize:10,color:C.textDim,letterSpacing:1}}>{entry.date}</span></div>
  {entry.question&&<div style={{fontSize:12,color:C.textMid,fontStyle:"italic",marginBottom:5}}>"{entry.question}"</div>}
  {entry.isDaily&&entry.card&&<div style={{fontSize:13,color:C.text}}>{entry.card}</div>}
  {!entry.isDaily&&(entry.slots||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:5}}>{entry.slots.filter(s=>s.card).map(s=><span key={s.posId} style={styles.entryCardPill}>{s.card}</span>)}</div>}
</button>);}

// ══════════════════════════════════════════════════════════════════
// STYLES — Vellum Canopy
// ══════════════════════════════════════════════════════════════════
const styles = {
  root:{minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:C.fontBody,color:C.text,maxWidth:480,margin:"0 auto",position:"relative"},
  gradientBg:{position:"fixed",inset:0,background:C.gradient,zIndex:0},
  loading:{minHeight:"100vh",background:"#dcecd4",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12},
  header:{background:C.headerBg,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",padding:"16px 0 0",textAlign:"center",position:"sticky",top:0,zIndex:10},
  headerInner:{display:"flex",alignItems:"center",justifyContent:"center",gap:14},
  headerTitle:{fontSize:22,letterSpacing:8,color:C.lightText,fontWeight:400,fontFamily:C.fontDisplay},
  headerSub:{fontSize:10,letterSpacing:4,color:C.lightDim,marginTop:3,textTransform:"uppercase"},
  settingsBtn:{position:"absolute",top:"50%",right:16,transform:"translateY(-50%)",background:"none",border:"none",color:C.lightDim,fontSize:18,cursor:"pointer",padding:4,lineHeight:1},
  main:{flex:1,overflowY:"auto",paddingBottom:90,position:"relative",zIndex:1},
  nav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.navBg,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",zIndex:10,paddingBottom:"max(14px, env(safe-area-inset-bottom, 14px))"},
  navBtn:{flex:1,background:"none",border:"none",color:C.navInactive,cursor:"pointer",padding:"10px 0 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"color .2s"},
  navBtnActive:{color:C.navActive},navIcon:{fontSize:18},navLabel:{fontSize:9,letterSpacing:2,textTransform:"uppercase"},

  section:{padding:"22px 16px 16px",position:"relative",zIndex:1},
  pageTitle:{fontFamily:C.fontDisplay,fontSize:25,fontWeight:400,letterSpacing:3,color:C.text,margin:"0 0 22px",textAlign:"center"},
  quickRow:{display:"flex",gap:12,marginBottom:22},
  quickBtn:{flex:1,background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"18px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer",boxShadow:V.shadow},
  quickBtnLabel:{fontSize:11,letterSpacing:2,textTransform:"uppercase"},
  stalkerBox:{background:"rgba(240,236,224,0.45)",border:`1px solid rgba(60,130,60,0.2)`,borderRadius:12,padding:"16px",marginBottom:22,textAlign:"center",boxShadow:V.shadow},
  stalkerLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase",marginBottom:5},
  stalkerCard:{fontSize:19,color:C.accent,letterSpacing:1,fontFamily:C.fontDisplay},
  stalkerCount:{fontSize:11,color:C.textDim,marginTop:5},
  sectionHeaderRow:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,marginTop:6},
  sectionHeaderLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase"},
  sectionHeaderAction:{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",letterSpacing:1},
  entryCard:{width:"100%",background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"13px 15px",marginBottom:10,textAlign:"left",cursor:"pointer",boxShadow:V.shadow},
  entryCardTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5},
  entryCardPill:{fontSize:10,background:V.pill,border:`1px solid ${V.pillBorder}`,borderRadius:12,padding:"2px 9px",color:C.textMid},
  drawArea:{display:"flex",justifyContent:"center",padding:"32px 0"},
  cardBack:{width:132,height:204,background:"rgba(248,244,234,0.6)",border:`2px solid ${C.accentDim}`,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,cursor:"pointer",boxShadow:"0 8px 32px rgba(40,60,30,0.12)"},
  drawnCard:{border:"1px solid",borderRadius:14,padding:"22px 18px",marginBottom:16,textAlign:"center",boxShadow:V.shadow},
  drawnCardName:{fontSize:21,letterSpacing:2,color:C.text,margin:"10px 0",fontFamily:C.fontDisplay},
  drawnCardMeaning:{fontSize:14,color:C.textMid,lineHeight:1.7,fontStyle:"italic",margin:0},
  slotPanel:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"15px",marginBottom:12,boxShadow:V.shadow},
  slotPanelHeader:{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12},
  slotPanelNum:{width:28,height:28,borderRadius:"50%",background:V.input,border:`1px solid ${C.accentDim}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.accent,flexShrink:0,fontFamily:C.fontDisplay},
  slotPanelNav:{display:"flex",justifyContent:"space-between",marginTop:12,gap:8},
  slotNavBtn:{background:"none",border:`1px solid ${V.borderFaint}`,borderRadius:8,padding:"8px 12px",fontSize:11,color:C.textDim,cursor:"pointer",letterSpacing:.5,flex:1,textAlign:"center"},
  slotLabel:{fontSize:14,color:C.accent,letterSpacing:1,marginBottom:3},slotMeaning:{fontSize:11,color:C.textDim,fontStyle:"italic"},
  clarifierToggle:{background:"none",border:"none",color:C.textDim,fontSize:11,letterSpacing:1,cursor:"pointer",marginTop:7,padding:0},
  clarifierArea:{display:"flex",gap:10,alignItems:"flex-start",marginTop:10,paddingLeft:14},
  clarifierLine:{width:2,alignSelf:"stretch",background:V.border,borderRadius:2},
  clarifierLabel:{fontSize:10,color:C.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:5},
  cardPill:{display:"inline-block",border:"1px solid",borderRadius:20,padding:"4px 13px",fontSize:12,margin:"4px 4px 0 0"},
  slotCardCompact:{display:"flex",alignItems:"center",background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:"10px 13px",marginBottom:6,cursor:"pointer",boxShadow:V.shadow},
  slotDetailExpanded:{border:"1px solid",borderRadius:12,padding:"15px",marginBottom:12,boxShadow:`0 2px 12px rgba(40,60,30,0.08)`},
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
  savedBanner:{textAlign:"center",color:C.accent,fontSize:13,letterSpacing:2,padding:"16px",background:"rgba(220,236,210,0.5)",border:`1px solid ${C.accentDim}50`,borderRadius:12,marginTop:10},
  infoNote:{fontSize:11,color:C.textDim,background:V.card,border:`1px solid ${V.border}`,borderRadius:9,padding:"9px 13px",marginBottom:12,textAlign:"center"},
  filterRow:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18},
  filterBtn:{background:V.card,border:`1px solid ${V.border}`,borderRadius:18,padding:"6px 13px",fontSize:11,color:C.textDim,cursor:"pointer",letterSpacing:1},
  filterBtnActive:{background:"rgba(220,236,210,0.5)",borderColor:C.accentDim+"50",color:C.accent},
  cardGrid:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:9},
  cardGridItem:{background:V.card,border:"1px solid",borderRadius:10,padding:"11px 7px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",position:"relative",boxShadow:V.shadow},
  cardGridName:{fontSize:10,color:C.textMid,textAlign:"center",lineHeight:1.3},
  cardGridEdited:{position:"absolute",top:5,right:7,fontSize:9,color:C.accentDim},
  cardDetailHero:{border:"1px solid",borderRadius:14,padding:"26px 16px",textAlign:"center",marginBottom:18,boxShadow:V.shadow},
  cardDetailName:{fontSize:23,letterSpacing:3,color:C.text,fontWeight:400,margin:"10px 0 5px",fontFamily:C.fontDisplay},
  tabRow:{display:"flex",gap:0,marginBottom:18,border:`1px solid ${V.border}`,borderRadius:9,overflow:"hidden"},
  tabBtn:{flex:1,background:"none",border:"none",padding:"11px",fontSize:12,color:C.textDim,cursor:"pointer",letterSpacing:1},
  tabBtnActive:{background:"rgba(220,236,210,0.5)",color:C.accent},
  cardStandard:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,padding:"18px",boxShadow:V.shadow},
  cardMeaningText:{fontSize:14,color:C.textMid,lineHeight:1.8,fontStyle:"italic",margin:0},
  cardMine:{display:"flex",flexDirection:"column",gap:9},
  deckGrid:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:13,marginTop:8},
  deckCard:{background:V.card,border:`1px solid ${V.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",textAlign:"left",boxShadow:V.shadow},
  deckThumb:{width:"100%",height:115,objectFit:"cover"},
  deckThumbPlaceholder:{width:"100%",height:115,background:V.input,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,color:C.textDim+"40"},
  tagRow:{display:"flex",flexWrap:"wrap",gap:7,marginBottom:13},
  tag:{background:"rgba(220,236,210,0.5)",border:`1px solid ${C.accentDim}50`,borderRadius:14,padding:"4px 12px",fontSize:11,color:C.accent},
  photoUpload:{display:"block",width:"100%",background:V.card,border:`2px dashed ${V.border}`,borderRadius:12,padding:"22px",textAlign:"center",fontSize:13,color:C.textDim,cursor:"pointer",marginBottom:13,boxSizing:"border-box"},
  photoGrid:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:9,marginBottom:16},
  photoThumb:{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:9},
  input:{width:"100%",background:V.input,border:`1px solid ${V.border}`,borderRadius:9,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",marginBottom:9,fontFamily:"inherit",boxSizing:"border-box"},
  textarea:{width:"100%",background:V.input,border:`1px solid ${V.border}`,borderRadius:9,padding:"11px 13px",fontSize:13,color:C.text,outline:"none",resize:"vertical",fontFamily:C.fontBody,lineHeight:1.7,boxSizing:"border-box"},
  fieldLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase",display:"block",marginBottom:5},
  btnPrimary:{width:"100%",background:"rgba(220,236,210,0.5)",border:`1px solid ${C.accentDim}50`,borderRadius:10,padding:"14px",fontSize:13,color:C.accent,cursor:"pointer",letterSpacing:2,textTransform:"uppercase",marginTop:5},
  btnSecondary:{flex:1,background:"none",border:`1px solid ${V.border}`,borderRadius:10,padding:"12px",fontSize:12,color:C.textDim,cursor:"pointer",letterSpacing:1},
  btnRow:{display:"flex",gap:10,marginTop:10},
  backBtn:{background:"none",border:"none",color:C.textDim,fontSize:13,cursor:"pointer",padding:"0 0 18px",letterSpacing:1},
  settingsList:{display:"flex",flexDirection:"column",gap:2,marginBottom:24},
  settingsRow:{display:"flex",alignItems:"center",justifyContent:"space-between",background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:"12px 14px",boxShadow:V.shadow},
  settingsRowBtn:{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",letterSpacing:.5},
  emptyState:{textAlign:"center",color:C.textDim,fontSize:12,letterSpacing:2,padding:"28px 0",textTransform:"uppercase"},
  modalOverlay:{position:"fixed",inset:0,background:"rgba(30,58,34,0.4)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:24},
  modalBox:{background:"#f0f6ee",border:`1px solid ${V.border}`,borderRadius:14,padding:"24px 20px",maxWidth:340,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"},
  modalMessage:{fontSize:14,color:C.text,lineHeight:1.7,margin:"0 0 18px",textAlign:"center"},
  editCardDisplay:{background:V.card,border:`1px solid ${V.border}`,borderRadius:10,padding:"13px 16px",fontSize:15,color:C.text,textAlign:"center",marginBottom:16,letterSpacing:1},
  editMeta:{fontSize:11,color:C.textDim,letterSpacing:2,textAlign:"center",marginBottom:16,textTransform:"uppercase"},
  alreadyPulledBox:{background:V.card,border:`2px solid ${C.accentDim}50`,borderRadius:14,padding:"22px 18px",textAlign:"center",boxShadow:V.shadow},
  alreadyPulledLabel:{fontSize:10,letterSpacing:3,color:C.textDim,textTransform:"uppercase",marginBottom:8},
  alreadyPulledCard:{fontSize:21,letterSpacing:2,color:C.accent,marginBottom:6,fontFamily:C.fontDisplay},
};
