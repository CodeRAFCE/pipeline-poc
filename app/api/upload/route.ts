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
      const errorText = await characterResponse.text();
      console.error("Character generation failed:", errorText);
      return NextResponse.json(
        { 
          error: "Character generation failed", 
          details: errorText,
          step: "character_generation"
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

    const videoResponse = await fetch(`${PRISM_API_URL}/api/v1/generate_ai_video`, {
      method: 'POST',
      headers: {
        'x-api-key': PRISM_API_KEY,
      },
      body: videoFormData,
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error("Video generation failed:", errorText);
      return NextResponse.json(
        { 
          error: "Video generation failed", 
          details: errorText,
          step: "video_generation",
          characterData // Return character data even if video fails
        },
        { status: videoResponse.status }
      );
    }

    const videoData: VideoGenerationResponse = await videoResponse.json();
    console.log(`✅ Video generated in ${videoData.generation_time}s`);
    console.log(`💰 Credits used: ${videoData.credits_used}, Remaining: ${videoData.credits_remaining}`);

    // Calculate total metrics
    const totalGenerationTime = characterData.generation_time + videoData.generation_time;
    const totalCreditsUsed = characterData.credits_used + videoData.credits_used;

    return NextResponse.json({
      success: true,
      message: "Character and video generated successfully",
      data: {
        characterUrl: characterData.output,
        videoUrl: videoData.output,
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
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
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
