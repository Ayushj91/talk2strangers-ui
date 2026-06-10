// ---------------------------------------------------------------
// talk2strangers — mock data layer
// Everything here will be replaced by real backend calls later.
// ---------------------------------------------------------------

export type Room = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  kind: "topic" | "mood";
  baseCount: number;
};

export const ROOMS: Room[] = [
  // topic rooms (persistent)
  { id: "music", name: "Music", emoji: "🎧", desc: "What's on repeat right now", kind: "topic", baseCount: 64 },
  { id: "movies", name: "Movies", emoji: "🎬", desc: "Spoilers behind tags, always", kind: "topic", baseCount: 41 },
  { id: "gaming", name: "Gaming", emoji: "🕹️", desc: "Ranked rage & cozy games", kind: "topic", baseCount: 88 },
  { id: "tech", name: "Tech", emoji: "⚙️", desc: "Builders, breakers, lurkers", kind: "topic", baseCount: 37 },
  { id: "books", name: "Books", emoji: "📚", desc: "Currently reading…", kind: "topic", baseCount: 19 },
  // mood rooms (energy, not topics)
  { id: "laugh", name: "Just Wanna Laugh", emoji: "😆", desc: "Bring your worst jokes", kind: "mood", baseCount: 52 },
  { id: "vent", name: "Vent to Strangers", emoji: "🌧️", desc: "Say it. Nobody knows you.", kind: "mood", baseCount: 73 },
  { id: "debate", name: "Change My Mind", emoji: "⚖️", desc: "Hot takes, cold logic", kind: "mood", baseCount: 28 },
  { id: "weird", name: "Tell Me Something Weird", emoji: "👁️", desc: "The stranger the better", kind: "mood", baseCount: 33 },
  { id: "3am", name: "3AM Thoughts", emoji: "🌙", desc: "For everyone who can't sleep", kind: "mood", baseCount: 2 }
];

// ---------------------------------------------------------------
// anonymous handles
// ---------------------------------------------------------------
const ADJ = ["wandering", "quiet", "neon", "sleepy", "cosmic", "lowkey", "midnight", "electric", "soft", "feral", "polite", "hidden", "lucky", "rainy", "stray"];
const NOUN = ["fox", "owl", "comet", "cactus", "ghost", "pigeon", "tiger", "noodle", "cloud", "raccoon", "lantern", "moth", "panda", "signal", "violet"];

export function makeHandle(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  return `${a}_${n}_${Math.floor(10 + Math.random() * 89)}`;
}

export const MOODS = [
  { id: "laugh", label: "Laugh", emoji: "😄", blurb: "memes & nonsense" },
  { id: "vent", label: "Vent", emoji: "🌧️", blurb: "get it off your chest" },
  { id: "debate", label: "Debate", emoji: "⚔️", blurb: "friendly arguments" },
  { id: "weird", label: "Weird", emoji: "🛸", blurb: "the unexplainable" },
  { id: "chat", label: "Just Chat", emoji: "💬", blurb: "no agenda at all" }
] as const;

// ---------------------------------------------------------------
// stranger "AI" — canned conversational behaviour per mood
// ---------------------------------------------------------------
export const OPENERS: Record<string, string[]> = {
  laugh: ["okay important question. funniest thing you've seen this week, go", "hi!! I was told this is the fun queue"],
  vent: ["hey. rough day or just a weird one?", "this is the no-judgement zone right? because I have THOUGHTS"],
  debate: ["hot take loaded and ready. you first or me?", "tell me an opinion you'd defend to the death"],
  weird: ["do you ever think about how octopuses just… have nine brains", "tell me the weirdest fact you know. I'll trade you"],
  chat: ["hey stranger 👋 where in the world are you (vaguely)?", "hi! night owl or just a different timezone?"]
};

export const REPLIES: string[] = [
  "wait that's actually so real",
  "hahaha okay I did NOT expect that answer",
  "hmm. counterpoint: what if you're right",
  "I think about this at 3am sometimes honestly",
  "ok you have to elaborate, you can't just drop that and leave",
  "same energy as me last tuesday tbh",
  "that's the most human thing I've heard all day",
  "see THIS is why I talk to strangers. nobody I know would say that",
  "lmao fair. extremely fair",
  "okay new topic but related — do you collect anything weird?",
  "I'm going to think about that for the rest of the week, thanks",
  "no because literally same??",
  "you sound like someone who has good music taste. prove me right",
  "I respect it. wrong, but I respect it 😄",
  "describe your week in exactly three words"
];

export const QUESTION_REPLIES: string[] = [
  "honestly? probably yes. don't ask me to justify it",
  "hmm, hard no. but I love that you asked",
  "depends on the day. today: absolutely",
  "I genuinely don't know and that's the scariest answer",
  "yes!! finally someone asks the real questions"
];

export const NUDGES: string[] = [
  "What's a small thing that made you smile this week?",
  "If you could teleport anywhere for one hour, where?",
  "What's a food opinion you'd defend in court?",
  "What song do you secretly love?",
  "What would your superpower be — but it has to be useless?",
  "Describe your day as a movie title.",
  "What's something you believed as a kid that turned out wrong?",
  "Beach at sunrise or city at midnight?",
  "What's the best advice a stranger ever gave you?",
  "If animals could talk, which would be the rudest?"
];

export const TICKER: string[] = [
  "someone just said they've never seen snow",
  "two strangers have been talking for 47 minutes",
  "someone in the 3AM room just got a connection card",
  "a debate about pineapple pizza is going badly",
  "someone just used their first nudge question",
  "a stranger in Vent just said 'thank you, I needed that'",
  "someone's dare: sing the next message",
  "two night owls just matched on 'weird'",
  "someone shared a photo of a very judgemental cat",
  "a 20 Questions game just ended in chaos"
];

// ---------------------------------------------------------------
// games
// ---------------------------------------------------------------
export const WYR: { a: string; b: string }[] = [
  { a: "Always know when someone lies", b: "Always get away with lying" },
  { a: "Live without music", b: "Live without movies" },
  { a: "Talk to animals", b: "Speak every human language" },
  { a: "Rewind your life 10 years", b: "Skip 10 years ahead" },
  { a: "Free flights forever", b: "Free food forever" }
];

export const TRUTHS: string[] = [
  "What's the last lie you told?",
  "What's a hill you'd die on that nobody agrees with?",
  "Who was your most embarrassing celebrity crush?",
  "What's the longest you've gone without showering?",
  "What's saved in your camera roll that you'd never post?"
];

export const DARES: string[] = [
  "Type your next message with your eyes closed.",
  "Send the 7th emoji in your recent emojis. No context.",
  "Describe yourself in the style of a nature documentary.",
  "Write one sentence in ALL CAPS like it's breaking news.",
  "Compliment the stranger using only food metaphors."
];

export const TWENTYQ = [
  {
    secret: "a lighthouse",
    answers: {
      "Is it alive?": "nope ❌",
      "Is it bigger than a car?": "yes ✅ much",
      "Can you find it in a city?": "rarely 🤏",
      "Is it man-made?": "yes ✅",
      "Does it make light?": "…suspiciously specific question. yes 💡"
    }
  },
  {
    secret: "a jellyfish",
    answers: {
      "Is it alive?": "yes ✅",
      "Is it bigger than a car?": "usually not 😄",
      "Can you find it in a city?": "only in aquariums",
      "Is it man-made?": "no ❌",
      "Does it make light?": "some of them actually do!! 💡"
    }
  }
];

// member chatter for group rooms
export const ROOM_CHATTER: Record<string, string[]> = {
  default: [
    "anyone else here just lurking 👀",
    "this room has good energy tonight",
    "okay but nobody answered my question from before lol",
    "brb making chai",
    "first time here, this is fun",
    "the live count keeps going up, hi everyone",
    "can't believe I'm choosing this over sleep again",
    "someone said exactly what I was thinking, get out of my head"
  ],
  music: ["what's everyone's last played song? no skips no shame", "vinyl people, justify the prices. I'll wait", "found an artist with 4k monthly listeners and I feel like a billionaire"],
  gaming: ["ranked is a psychological experiment and we're the rats", "cozy game recs? I need to lower my heart rate", "my backlog has a backlog"],
  vent: ["today was a lot. that's it. that's the message", "you ever just sit in the car for 10 extra minutes", "thanks to whoever said that yesterday. it helped"],
  "3am": ["why is cereal at 3am better than any restaurant", "the silence right now is so loud", "if you're here, you're my kind of person"],
  debate: ["cold showers are a personality, not a habit. discuss", "the book is NOT always better. fight me", "spoiler: both sides are wrong and I can prove it"]
};

export const MEMBER_POOL = [
  "neon_moth_22", "quiet_comet_77", "stray_panda_31", "rainy_lantern_08",
  "feral_noodle_55", "lowkey_tiger_19", "hidden_cloud_63", "lucky_pigeon_44",
  "cosmic_violet_12", "soft_signal_90"
];

// stranger image (when the bot shares a photo)
export const STRANGER_IMAGES = [
  "https://picsum.photos/seed/t2s-cat/640/480",
  "https://picsum.photos/seed/t2s-sky/640/480",
  "https://picsum.photos/seed/t2s-street/640/480"
];

export const EMOJIS = ["❤️", "😂", "😮", "🔥", "👍", "🥲"];

export function rand<T>(arr: T[] | readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
