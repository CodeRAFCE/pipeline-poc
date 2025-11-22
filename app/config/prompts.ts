export type CharacterStyle = "normal" | "chibi";

/**
 * Character descriptions for PRISM AI character generation
 * These are used in the generate_ai_character API call
 */
export const CHARACTER_DESCRIPTIONS: Record<CharacterStyle, string> = {
  normal: "2d cartoon avatar with realistic proportions",
  chibi: "2d chibi avatar with realistic proportions",
};

/**
 * Animation prompts for PRISM AI video generation
 * These are used in the generate_ai_video API call
 */
export const ANIMATION_PROMPTS: Record<CharacterStyle, string> = {
  normal: "The person waves at the camera with a friendly smile",
  chibi: "The person waves at the camera in a cute and energetic way",
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
    description: "Cute super deformation style with big head",
    color: "pink",
  },
] as const;
