import { NextRequest, NextResponse } from "next/server";

const PRISM_API_URL =
  process.env.NEXT_PUBLIC_PRISM_API_URL ||
  "https://prismai.ap-southeast-1.elasticbeanstalk.com";
const PRISM_API_KEY = process.env.PRISM_API_KEY || "";

interface VideoGenerationResponse {
  output: string;
  extra?: {
    transparent_video_url?: string;
  };
  generation_time: number;
  credits_remaining: number;
  credits_used: number;
  type: "ai_video";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
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
        {
          error:
            "PRISM API key not configured. Please set PRISM_API_KEY in environment variables.",
        },
        { status: 500 }
      );
    }

    console.log("📤 Uploading image...");
    let imageFile: File = image;

    try {
      // Keep the original image file to send to video generation API
      console.log(`✅ Image ready for video generation`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Image preparation failed:", errorMessage);
      return NextResponse.json(
        {
          error: "Failed to prepare image",
          details: errorMessage,
          step: "image_upload",
        },
        { status: 500 }
      );
    }

    // Step 2: Generate video from the image URL
    console.log("🎬 Step 2: Generating animated video...");

    const maxRetries = 3;
    let videoResponse: Response | null = null;
    let lastError: { message: string; details: string; status: number } | null =
      null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(
            `⏳ Retry attempt ${attempt}/${maxRetries} after ${
              delay / 1000
            }s delay...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Send the image file directly
        const videoFormData = new FormData();
        videoFormData.append("character", imageFile);
        videoFormData.append(
          "prompt",
          animationPrompt || "The person waves at the camera"
        );
        videoFormData.append("loop", "True");

        console.log(`📋 Video generation request (attempt ${attempt})`);

        videoResponse = await fetch(
          `${PRISM_API_URL}/api/v1/generate_ai_video`,
          {
            method: "POST",
            headers: {
              "x-api-key": PRISM_API_KEY,
            },
            body: videoFormData,
          }
        );

        // If successful, break out of retry loop
        if (videoResponse.ok) {
          console.log(`✅ Video generation succeeded on attempt ${attempt}`);
          break;
        }

        // Parse error details
        let errorDetails = "";
        try {
          const errorData = await videoResponse.json();
          errorDetails =
            errorData.message || errorData.error || JSON.stringify(errorData);
        } catch {
          errorDetails = await videoResponse.text();
        }

        // Store error for potential final failure
        lastError = {
          message: "Video generation failed",
          details: errorDetails,
          status: videoResponse.status,
        };

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (
          videoResponse.status >= 400 &&
          videoResponse.status < 500 &&
          videoResponse.status !== 429
        ) {
          console.error(
            `❌ Client error ${videoResponse.status}, not retrying:`,
            errorDetails
          );
          break;
        }

        // Retry on server errors (5xx) and rate limits (429)
        if (videoResponse.status >= 500 || videoResponse.status === 429) {
          console.warn(
            `⚠️ Server error ${videoResponse.status} on attempt ${attempt}:`,
            errorDetails
          );
          if (attempt < maxRetries) {
            continue; // Retry
          }
        }
      } catch (fetchError) {
        console.error(`❌ Network error on attempt ${attempt}:`, fetchError);
        lastError = {
          message: "Network error during video generation",
          details:
            fetchError instanceof Error
              ? fetchError.message
              : String(fetchError),
          status: 503,
        };

        if (attempt < maxRetries) {
          continue; // Retry on network errors
        }
      }
    }

    // Check if all retries failed
    if (!videoResponse || !videoResponse.ok) {
      let errorMessage = "Video generation failed after multiple attempts";
      let errorDetails = lastError?.details || "Unknown error";
      const statusCode = lastError?.status || 503;

      // Provide user-friendly error messages based on status code
      if (statusCode === 429) {
        errorMessage = "API rate limit exceeded. Please try again later.";
      } else if (statusCode === 402) {
        errorMessage = "Insufficient credits. Please top up your account.";
      } else if (statusCode === 401 || statusCode === 403) {
        errorMessage = "API authentication failed. Please check your API key.";
      } else if (statusCode >= 500) {
        errorMessage =
          "PRISM API server error. The service may be temporarily unavailable.";
      }

      console.error("Video generation failed after all retries:", errorDetails);
      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          step: "video_generation",
          statusCode: statusCode,
          retriesAttempted: maxRetries,
        },
        { status: statusCode }
      );
    }

    const videoData: VideoGenerationResponse = await videoResponse.json();
    console.log(`✅ Video generated in ${videoData.generation_time}s`);
    console.log(
      `💰 Credits used: ${videoData.credits_used}, Remaining: ${videoData.credits_remaining}`
    );

    if (videoData.extra?.transparent_video_url) {
      console.log(
        `🎬 Transparent video available: ${videoData.extra.transparent_video_url}`
      );
    }

    // Calculate total credits used (only from video generation if S3 is used)
    const totalCreditsUsed = creditsUsed + videoData.credits_used;
    console.log(`💰 Total credits used: ${totalCreditsUsed}`);

    return NextResponse.json({
      success: true,
      message: "Video generated successfully",
      data: {
        videoUrl: videoData.output,
        transparentVideoUrl: videoData.extra?.transparent_video_url,
        videoGenerationTime: videoData.generation_time,
        creditsUsed: videoData.credits_used,
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
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
        statusCode = 503;
      }
      // Timeout errors
      else if (error.message.includes("timeout")) {
        errorMessage =
          "Request timeout. The server took too long to respond. Please try again.";
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
