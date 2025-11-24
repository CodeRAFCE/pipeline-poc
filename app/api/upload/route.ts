import { NextRequest, NextResponse } from "next/server";

const PRISM_API_URL = process.env.NEXT_PUBLIC_PRISM_API_URL || 'https://prismai.ap-southeast-1.elasticbeanstalk.com';
const PRISM_API_KEY = process.env.PRISM_API_KEY || '';

interface CharacterGenerationResponse {
  output: string;
  generation_time: number;
  credits_remaining: number;
  credits_used: number;
  type: 'ai_character';
}

interface VideoGenerationResponse {
  output: string;
  extra?: {
    transparent_video_url?: string;
  };
  generation_time: number;
  credits_remaining: number;
  credits_used: number;
  type: 'ai_video';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const characterDescription = formData.get("characterDescription") as string;
    const animationPrompt = formData.get("animationPrompt") as string;

    // Validation
    if (!image) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    if (!PRISM_API_KEY) {
      return NextResponse.json(
        { error: "PRISM API key not configured. Please set PRISM_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    console.log("🎨 Step 1: Generating AI character...");
    
    // Step 1: Generate AI Character
    const characterFormData = new FormData();
    characterFormData.append('image', image);
    characterFormData.append('character_description', characterDescription || '2d cartoon avatar with realistic proportions');

    const characterResponse = await fetch(`${PRISM_API_URL}/api/v1/generate_ai_character`, {
      method: 'POST',
      headers: {
        'x-api-key': PRISM_API_KEY,
      },
      body: characterFormData,
    });

    if (!characterResponse.ok) {
      let errorMessage = "Character generation failed";
      let errorDetails = "";
      
      try {
        const errorData = await characterResponse.json();
        errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorDetails = await characterResponse.text();
      }
      
      // Provide user-friendly error messages based on status code
      if (characterResponse.status === 429) {
        errorMessage = "API rate limit exceeded. Please try again later.";
      } else if (characterResponse.status === 402) {
        errorMessage = "Insufficient credits. Please top up your account.";
      } else if (characterResponse.status === 401 || characterResponse.status === 403) {
        errorMessage = "API authentication failed. Please check your API key.";
      } else if (characterResponse.status >= 500) {
        errorMessage = "PRISM API server error. Please try again later.";
      }
      
      console.error("Character generation failed:", errorDetails);
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: errorDetails,
          step: "character_generation",
          statusCode: characterResponse.status
        },
        { status: characterResponse.status }
      );
    }

    const characterData: CharacterGenerationResponse = await characterResponse.json();
    console.log(`✅ Character generated in ${characterData.generation_time}s`);
    console.log(`💰 Credits used: ${characterData.credits_used}, Remaining: ${characterData.credits_remaining}`);

    // Step 2: Generate AI Video from Character
    console.log("🎬 Step 2: Generating AI video...");
    
    // Use the character URL directly (no need to fetch and convert to blob)
    const videoFormData = new FormData();
    videoFormData.append('character', characterData.output); // Send URL as string
    videoFormData.append('prompt', animationPrompt || 'The person waves at the camera');
    videoFormData.append('loop', 'True'); // Create a looping video

    const videoResponse = await fetch(`${PRISM_API_URL}/api/v1/generate_ai_video`, {
      method: 'POST',
      headers: {
        'x-api-key': PRISM_API_KEY,
      },
      body: videoFormData,
    });

    if (!videoResponse.ok) {
      let errorMessage = "Video generation failed";
      let errorDetails = "";
      
      try {
        const errorData = await videoResponse.json();
        errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorDetails = await videoResponse.text();
      }
      
      // Provide user-friendly error messages based on status code
      if (videoResponse.status === 429) {
        errorMessage = "API rate limit exceeded. Please try again later.";
      } else if (videoResponse.status === 402) {
        errorMessage = "Insufficient credits. Please top up your account.";
      } else if (videoResponse.status === 401 || videoResponse.status === 403) {
        errorMessage = "API authentication failed. Please check your API key.";
      } else if (videoResponse.status >= 500) {
        errorMessage = "PRISM API server error. Please try again later.";
      }
      
      console.error("Video generation failed:", errorDetails);
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: errorDetails,
          step: "video_generation",
          statusCode: videoResponse.status,
          characterData // Return character data even if video fails
        },
        { status: videoResponse.status }
      );
    }

    const videoData: VideoGenerationResponse = await videoResponse.json();
    console.log(`✅ Video generated in ${videoData.generation_time}s`);
    console.log(`💰 Credits used: ${videoData.credits_used}, Remaining: ${videoData.credits_remaining}`);
    
    if (videoData.extra?.transparent_video_url) {
      console.log(`🎬 Transparent video available: ${videoData.extra.transparent_video_url}`);
    }

    // Calculate total metrics
    const totalGenerationTime = characterData.generation_time + videoData.generation_time;
    const totalCreditsUsed = characterData.credits_used + videoData.credits_used;

    return NextResponse.json({
      success: true,
      message: "Character and video generated successfully",
      data: {
        characterUrl: characterData.output,
        videoUrl: videoData.output,
        transparentVideoUrl: videoData.extra?.transparent_video_url,
        characterGenerationTime: characterData.generation_time,
        videoGenerationTime: videoData.generation_time,
        totalGenerationTime,
        creditsUsed: totalCreditsUsed,
        creditsRemaining: videoData.credits_remaining,
      },
      uploadedFile: {
        name: image.name,
        size: image.size,
        type: image.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    // Determine error type and provide appropriate message
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Network errors
      if (error.message.includes("fetch") || error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
        statusCode = 503;
      }
      // Timeout errors
      else if (error.message.includes("timeout")) {
        errorMessage = "Request timeout. The server took too long to respond. Please try again.";
        statusCode = 504;
      }
      // JSON parsing errors
      else if (error.message.includes("JSON")) {
        errorMessage = "Invalid response from server. Please try again.";
      }
      // Generic error with message
      else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: statusCode }
    );
  }
}

// Optional: Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
