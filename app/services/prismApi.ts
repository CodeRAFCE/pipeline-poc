/**
 * PRISM AI API Service
 * Handles communication with PRISM AI backend for character and video generation
 */

const PRISM_API_URL =
  process.env.NEXT_PUBLIC_PRISM_API_URL ||
  "https://prismai.ap-southeast-1.elasticbeanstalk.com";
const PRISM_API_KEY = process.env.PRISM_API_KEY || "";

export interface CharacterGenerationResponse {
  output: string;
  generation_time: number;
  credits_remaining: number;
  credits_used: number;
  type: "ai_character";
}

export interface VideoGenerationResponse {
  output: string;
  generation_time: number;
  credits_remaining: number;
  credits_used: number;
  type: "ai_video";
}

/**
 * Generate AI character from an uploaded image
 * @param imageFile - The image file to convert to character
 * @param characterDescription - Description of the character style (e.g., "2d chibi avatar with realistic proportions")
 * @returns Character generation response with URL to generated character image
 */
export async function generateAICharacter(
  imageFile: File | Blob,
  characterDescription: string
): Promise<CharacterGenerationResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("character_description", characterDescription);

  const response = await fetch(
    `${PRISM_API_URL}/api/v1/generate_ai_character`,
    {
      method: "POST",
      headers: {
        "x-api-key": PRISM_API_KEY,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Character generation failed: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Generate AI video from a character image
 * @param characterImageUrl - URL of the character image (from character generation API output)
 * @param prompt - Animation prompt (e.g., "The person waves at the camera")
 * @returns Video generation response with URL to generated video
 */
export async function generateAIVideo(
  characterImageUrl: string,
  prompt: string
): Promise<VideoGenerationResponse> {
  const formData = new FormData();
  
  // Send the character URL directly as a string
  formData.append("character", characterImageUrl);
  formData.append("prompt", prompt);

  const response = await fetch(`${PRISM_API_URL}/api/v1/generate_ai_video`, {
    method: "POST",
    headers: {
      "x-api-key": PRISM_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Video generation failed: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Complete pipeline: Generate character from image, then generate video
 * @param imageFile - Original person image
 * @param characterDescription - Character style description
 * @param animationPrompt - Animation prompt for the video
 * @returns Video generation response
 */
export async function generateCharacterAndVideo(
  imageFile: File,
  characterDescription: string,
  animationPrompt: string
): Promise<{
  character: CharacterGenerationResponse;
  video: VideoGenerationResponse;
}> {
  // Step 1: Generate character
  const characterResult = await generateAICharacter(
    imageFile,
    characterDescription
  );

  // Step 2: Generate video from character
  const videoResult = await generateAIVideo(
    characterResult.output,
    animationPrompt
  );

  return {
    character: characterResult,
    video: videoResult,
  };
}
