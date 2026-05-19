/**
 * Story prompt bank — silent taxonomy for narrative assembly.
 *
 * Each recording is silently tagged to a position in a life narrative arc.
 * Categories: origins → childhood → becoming → present → reflection →
 *             transmission → elegy
 *
 * Future use: given a family's full vault, we can assemble recordings
 * in arc_position order to generate a coherent life narrative,
 * a timeline, or a video sequence automatically.
 *
 * The user never sees these tags. They just answer a question.
 * We do the assembling.
 */

export type PromptCategory =
  | "origins"
  | "people"
  | "place"
  | "food"
  | "moment"
  | "loss"
  | "wisdom"
  | "legacy"
  | "joy"
  | "open";

export type ArcPosition =
  | "prologue"
  | "childhood"
  | "becoming"
  | "present"
  | "reflection"
  | "transmission"
  | "elegy";

export interface StoryPrompt {
  id: string;
  text: string;
  category: PromptCategory;
  arc_position: ArcPosition;
  tags: string[];
}

export const STORY_PROMPTS: StoryPrompt[] = [
  {
    id: "food_001",
    text: "What is your earliest memory of your mother's cooking?",
    category: "food",
    arc_position: "childhood",
    tags: ["mother", "kitchen", "smell", "early memory"],
  },
  {
    id: "food_002",
    text: "What dish would your family make that no restaurant could ever recreate?",
    category: "food",
    arc_position: "reflection",
    tags: ["family recipe", "home", "irreplaceable"],
  },
  {
    id: "food_003",
    text: "Who taught you how to cook something? What did they say while they taught you?",
    category: "food",
    arc_position: "becoming",
    tags: ["teaching", "transmission", "hands", "voice"],
  },
  {
    id: "people_001",
    text: "Describe someone in your family who everyone talks about but younger generations never met.",
    category: "people",
    arc_position: "prologue",
    tags: ["ancestor", "myth", "family legend"],
  },
  {
    id: "people_002",
    text: "What is something your father did that you only understood years later?",
    category: "people",
    arc_position: "reflection",
    tags: ["father", "understanding", "time"],
  },
  {
    id: "people_003",
    text: "Who in your family had the loudest laugh? Describe it.",
    category: "people",
    arc_position: "reflection",
    tags: ["laughter", "joy", "personality", "sensory"],
  },
  {
    id: "people_004",
    text: "Tell me about the person in your family who held everyone together.",
    category: "people",
    arc_position: "reflection",
    tags: ["matriarch", "patriarch", "anchor", "family structure"],
  },
  {
    id: "origins_001",
    text: "Where did your family come from before you were born?",
    category: "origins",
    arc_position: "prologue",
    tags: ["homeland", "roots", "geography", "before"],
  },
  {
    id: "origins_002",
    text: "Describe the journey — the first time someone in your family moved to a new city or country.",
    category: "origins",
    arc_position: "prologue",
    tags: ["migration", "movement", "new beginning"],
  },
  {
    id: "place_001",
    text: "Describe the smell of the house you grew up in.",
    category: "place",
    arc_position: "childhood",
    tags: ["home", "sensory", "smell", "childhood"],
  },
  {
    id: "place_002",
    text: "What place from your childhood no longer exists?",
    category: "place",
    arc_position: "reflection",
    tags: ["loss", "change", "memory", "physical space"],
  },
  {
    id: "place_003",
    text: "If you could go back to one room from your past, which would it be and why?",
    category: "place",
    arc_position: "reflection",
    tags: ["room", "longing", "specific memory"],
  },
  {
    id: "moment_001",
    text: "What is a moment you wish you had recorded at the time?",
    category: "moment",
    arc_position: "reflection",
    tags: ["regret", "impermanence", "presence"],
  },
  {
    id: "moment_002",
    text: "Describe the last time your whole family was in one room together.",
    category: "moment",
    arc_position: "present",
    tags: ["gathering", "family", "togetherness", "last time"],
  },
  {
    id: "moment_003",
    text: "Tell me about a moment of unexpected joy.",
    category: "joy",
    arc_position: "reflection",
    tags: ["surprise", "happiness", "turning point"],
  },
  {
    id: "loss_001",
    text: "Say something to someone who isn't here anymore.",
    category: "loss",
    arc_position: "elegy",
    tags: ["grief", "address", "the gone node", "direct speech"],
  },
  {
    id: "loss_002",
    text: "What do you miss that you cannot name exactly?",
    category: "loss",
    arc_position: "elegy",
    tags: ["grief", "ambiguous loss", "feeling"],
  },
  {
    id: "wisdom_001",
    text: "What is a lesson someone older than you passed down that you still carry?",
    category: "wisdom",
    arc_position: "reflection",
    tags: ["teaching", "elder", "inherited knowledge"],
  },
  {
    id: "wisdom_002",
    text: "What did you have to learn the hard way?",
    category: "wisdom",
    arc_position: "becoming",
    tags: ["difficulty", "growth", "lesson"],
  },
  {
    id: "legacy_001",
    text: "What do you want the next generation to know about where they came from?",
    category: "legacy",
    arc_position: "transmission",
    tags: ["future", "next generation", "roots", "identity"],
  },
  {
    id: "legacy_002",
    text: "What would you want your great-grandchildren to hear in your voice?",
    category: "legacy",
    arc_position: "transmission",
    tags: ["voice", "future family", "direct address"],
  },
  {
    id: "legacy_003",
    text: "If your grandmother could hear you right now, what would you tell her?",
    category: "legacy",
    arc_position: "elegy",
    tags: ["grandmother", "ancestor", "direct address", "longing"],
  },
  {
    id: "open_001",
    text: "Start anywhere. Just start talking.",
    category: "open",
    arc_position: "present",
    tags: ["unstructured", "free form"],
  },
  {
    id: "open_002",
    text: "What happened today that is worth keeping?",
    category: "open",
    arc_position: "present",
    tags: ["today", "present moment", "daily life"],
  },
];

/** Pick a random prompt from the bank, optionally excluding one id. */
export function pickRandomStoryPrompt(excludeId?: string): StoryPrompt {
  const pool = excludeId ? STORY_PROMPTS.filter((p) => p.id !== excludeId) : STORY_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)] ?? STORY_PROMPTS[0];
}

/** Resolve API or legacy string text to a tagged prompt when possible. */
export function resolveStoryPrompt(text: string): StoryPrompt {
  const match = STORY_PROMPTS.find((p) => p.text === text);
  if (match) return match;
  return {
    id: "dynamic",
    text,
    category: "open",
    arc_position: "present",
    tags: [],
  };
}
