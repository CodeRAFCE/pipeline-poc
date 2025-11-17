export type CharacterStyle = "normal" | "chibi";

export const CHARACTER_PROMPTS: Record<CharacterStyle, string> = {
  normal:
    'Generate a realistic animated character video based on this person, waving "Hi" with natural movements and friendly expression',
  chibi:
    'Generate a cute chibi-style animated character video based on this person, with large head proportions, small body, waving "Hi" in an adorable kawaii style with exaggerated cheerful expressions',
};

export const CHARACTER_STYLES = [
  {
    id: "normal" as CharacterStyle,
    name: "Normal Character",
    emoji: "🧑",
    description: "Realistic style with natural movements",
    color: "blue",
  },
  {
    id: "chibi" as CharacterStyle,
    name: "Chibi Character",
    emoji: "🎀",
    description: "Cute kawaii style with big head",
    color: "pink",
  },
] as const;
