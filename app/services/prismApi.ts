/**
 * PRISM AI API Service
 * Handles communication with PRISM AI backend for video generation
 */

const PRISM_API_URL =
  process.env.NEXT_PUBLIC_PRISM_API_URL ||
  "https://prismai.ap-southeast-1.elasticbeanstalk.com";
const PRISM_API_KEY = process.env.PRISM_API_KEY || "";

export interface VideoGenerationResponse {
  output: string;
  generation_time: number;
  credits_remaining: number;
  credits_used: number;
  type: "ai_video";
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
