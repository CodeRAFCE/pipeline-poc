# PRISM AI API Documentation

This document provides detailed information about the PRISM AI APIs used for character and video generation.

## Base URL

**Production:**

```
https://prismai.ap-southeast-1.elasticbeanstalk.com
```

**Development:**

```
http://localhost:8000
```

## Authentication

All API requests require authentication using an API key passed in the request headers.

**Header:**

```
x-api-key: YOUR_API_KEY
```

---

## API Endpoints

### 1. Generate AI Character

Converts an uploaded person's image into a 2D cartoon or chibi avatar.

#### Endpoint

```
POST /api/v1/generate_ai_character
```

#### Request

**Content-Type:** `multipart/form-data`

**Headers:**

```http
x-api-key: YOUR_API_KEY
content-type: multipart/form-data
```

**Form Data Parameters:**

| Parameter               | Type   | Required | Description                                       |
| ----------------------- | ------ | -------- | ------------------------------------------------- |
| `image`                 | File   | Yes      | The person's image file to convert to a character |
| `character_description` | String | Yes      | Description of the desired character style        |

**Character Description Examples:**

- `"2d cartoon avatar with realistic proportions"` - For normal style
- `"2d chibi avatar with realistic proportions"` - For chibi/cute style
- `"2d flatoon avatar with realistic proportions"` - Alternative style

#### Response

**Success Response (200 OK):**

```json
{
  "output": "https://replicate.delivery/xezq/A9uleGeeP3Zbsopn3BsxXkQfKH49iOOd9CTuybRz76YQjiuWB/tmp41ky4eoi.jpeg",
  "generation_time": 10.022533899999871,
  "credits_remaining": 8350,
  "credits_used": 5,
  "type": "ai_character"
}
```

**Response Fields:**

| Field               | Type         | Description                                        |
| ------------------- | ------------ | -------------------------------------------------- |
| `output`            | String (URL) | Direct URL to the generated character image (JPEG) |
| `generation_time`   | Number       | Time taken to generate the character in seconds    |
| `credits_remaining` | Number       | Remaining credits in your account                  |
| `credits_used`      | Number       | Credits consumed for this request (~5 credits)     |
| `type`              | String       | Always `"ai_character"` for this endpoint          |

#### cURL Example

```bash
curl --request POST \
  --url https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_character \
  --header 'content-type: multipart/form-data' \
  --header 'x-api-key: YOUR_API_KEY' \
  --form 'image=@/path/to/person-image.jpg' \
  --form 'character_description=2d chibi avatar with realistic proportions'
```

#### JavaScript/Fetch Example

```javascript
const url =
  "https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_character";
const form = new FormData();
form.append("image", imageFile); // File object
form.append(
  "character_description",
  "2d chibi avatar with realistic proportions"
);

const options = {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
  },
  body: form,
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log("Character URL:", data.output);
  console.log("Generation time:", data.generation_time, "seconds");
  console.log("Credits used:", data.credits_used);
  console.log("Credits remaining:", data.credits_remaining);
} catch (error) {
  console.error("Error:", error);
}
```

---

### 2. Generate AI Video

Animates a character image with a custom prompt/action.

#### Endpoint

```
POST /api/v1/generate_ai_video
```

#### Request

**Content-Type:** `multipart/form-data`

**Headers:**

```http
x-api-key: YOUR_API_KEY
content-type: multipart/form-data
```

**Form Data Parameters:**

| Parameter   | Type         | Required | Description                                                       |
| ----------- | ------------ | -------- | ----------------------------------------------------------------- |
| `character` | String (URL) | Yes      | URL of the character image (from character generation API output) |
| `prompt`    | String       | Yes      | Description of the animation/action to perform                    |
| `loop`      | Boolean      | No       | Whether to create a looping video (default: False)                |

**Animation Prompt Examples:**

- `"The person waves at the camera"` - Simple wave
- `"The person waves at the camera with a friendly smile"` - Wave with emotion
- `"The person waves at the camera in a cute and energetic way"` - Energetic wave

#### Response

**Success Response (200 OK):**

```json
{
  "output": "https://replicate.delivery/xezq/GPKQxFPqIyaoLxhlAa2PHYCj4Wq5zHPvfHjOcj1iKaBp8P2KA/output.mp4",
  "extra": {
    "transparent_video_url": "https://v3b.fal.media/files/b/elephant/DwdzpQDwkYRrBApGC-g6w_nccC911a.webm"
  },
  "generation_time": 121.55640279990621,
  "credits_remaining": 6630,
  "credits_used": 70,
  "type": "ai_video"
}
```

**Response Fields:**

| Field                         | Type         | Description                                                |
| ----------------------------- | ------------ | ---------------------------------------------------------- |
| `output`                      | String (URL) | Direct URL to the generated video file (MP4)               |
| `extra.transparent_video_url` | String (URL) | Optional URL to transparent background video (WebM format) |
| `generation_time`             | Number       | Time taken to generate the video in seconds (~120-130s)    |
| `credits_remaining`           | Number       | Remaining credits in your account                          |
| `credits_used`                | Number       | Credits consumed for this request (~70 credits)            |
| `type`                        | String       | Always `"ai_video"` for this endpoint                      |

**Note:** The `extra.transparent_video_url` field provides a WebM video with a transparent background, useful for overlays and compositing. This field may not always be present in the response.

#### cURL Example

```bash
curl --request POST \
  --url https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_video \
  --header 'content-type: multipart/form-data' \
  --header 'x-api-key: YOUR_API_KEY' \
  --form 'character=https://replicate.delivery/xezq/A9uleGeeP3Zbsopn3BsxXkQfKH49iOOd9CTuybRz76YQjiuWB/tmp41ky4eoi.jpeg' \
  --form 'prompt=The person waves at the camera with a friendly smile' \
  --form 'loop=True'
```

### Two-Step Process: Character → Video

```javascript
async function generateCharacterAndVideo(personImageFile) {
  const API_KEY = "YOUR_API_KEY";
  const BASE_URL = "https://prismai.ap-southeast-1.elasticbeanstalk.com";

  // Step 1: Generate Character
  console.log("Step 1: Generating AI character...");
  const characterForm = new FormData();
  characterForm.append("image", personImageFile);
  characterForm.append(
    "character_description",
    "2d chibi avatar with realistic proportions"
  );

  const characterResponse = await fetch(
    `${BASE_URL}/api/v1/generate_ai_character`,
    {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: characterForm,
    }
  );

  const characterData = await characterResponse.json();
  console.log("✅ Character generated:", characterData.output);
  console.log(`⏱️  Time: ${characterData.generation_time}s`);
  console.log(`💰 Credits used: ${characterData.credits_used}`);

  // Step 2: Generate video using character URL
  console.log("Step 2: Generating AI video...");

  const videoForm = new FormData();
  videoForm.append("character", characterData.output); // Use the URL directly
  videoForm.append(
    "prompt",
    "The person waves at the camera in a cute and energetic way"
  );

  const videoResponse = await fetch(`${BASE_URL}/api/v1/generate_ai_video`, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: videoForm,
  });

  const videoData = await videoResponse.json();
  console.log("✅ Video generated:", videoData.output);
  console.log(`⏱️  Time: ${videoData.generation_time}s`);
  console.log(`💰 Credits used: ${videoData.credits_used}`);

  if (videoData.extra?.transparent_video_url) {
    console.log("🎬 Transparent video:", videoData.extra.transparent_video_url);
  }

  // Return combined results
  return {
    character: {
      url: characterData.output,
      generationTime: characterData.generation_time,
      creditsUsed: characterData.credits_used,
    },
    video: {
      url: videoData.output,
      transparentUrl: videoData.extra?.transparent_video_url,
      generationTime: videoData.generation_time,
      creditsUsed: videoData.credits_used,
    },
    total: {
      generationTime: characterData.generation_time + videoData.generation_time,
      creditsUsed: characterData.credits_used + videoData.credits_used,
      creditsRemaining: videoData.credits_remaining,
    },
  };
}

// Usage
const imageFile = document.querySelector('input[type="file"]').files[0];
const result = await generateCharacterAndVideo(imageFile);
console.log("Total time:", result.total.generationTime, "seconds");
console.log("Total credits:", result.total.creditsUsed);
console.log("Download video:", result.video.url);
```

---

## Credits System

### Credit Costs

| Operation             | Credits         | Typical Time     |
| --------------------- | --------------- | ---------------- |
| Character Generation  | ~5 credits      | ~10 seconds      |
| Video Generation      | ~70 credits     | ~120-130 seconds |
| **Complete Pipeline** | **~75 credits** | **~140 seconds** |

### Monitoring Credits

Both API responses include:

- `credits_used`: Credits consumed in the current request
- `credits_remaining`: Total credits remaining in your account

**Example:**

```json
{
  "credits_used": 70,
  "credits_remaining": 8355
}
```

---

## Performance Metrics

### Expected Generation Times

| Endpoint             | Average Time     | Range            |
| -------------------- | ---------------- | ---------------- |
| Character Generation | ~10 seconds      | 8-15 seconds     |
| Video Generation     | ~127 seconds     | 120-140 seconds  |
| **Total Pipeline**   | **~137 seconds** | **~2-3 minutes** |

### Response Times by Stage

```
User Upload → Character API → Video API → Complete
    ↓              ↓              ↓           ↓
  Instant      ~10 seconds   ~127 seconds  ~137s total
```

---

## Error Handling

### Common Error Scenarios

#### 1. Invalid API Key

```json
{
  "error": "Unauthorized",
  "message": "Invalid API key"
}
```

**Status Code:** 401

#### 2. Missing Required Parameters

```json
{
  "error": "Bad Request",
  "message": "Missing required parameter: image"
}
```

**Status Code:** 400

#### 3. Invalid File Format

```json
{
  "error": "Bad Request",
  "message": "Invalid image format. Supported formats: JPEG, PNG, GIF"
}
```

**Status Code:** 400

#### 4. Insufficient Credits

```json
{
  "error": "Payment Required",
  "message": "Insufficient credits. Required: 5, Available: 2"
}
```

**Status Code:** 402

#### 5. Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An error occurred during generation"
}
```

**Status Code:** 500

### Error Handling Example

```javascript
async function generateWithErrorHandling(imageFile) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();

      switch (response.status) {
        case 401:
          throw new Error("Invalid API key. Please check your credentials.");
        case 400:
          throw new Error(`Bad request: ${errorData.message}`);
        case 402:
          throw new Error("Insufficient credits. Please top up your account.");
        case 500:
          throw new Error("Server error. Please try again later.");
        default:
          throw new Error(`API error: ${errorData.message || "Unknown error"}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Generation failed:", error.message);
    throw error;
  }
}
```

---

## Best Practices

### 1. Image Requirements

**Recommended:**

- **Format:** JPEG, PNG
- **Size:** 512x512 to 1024x1024 pixels
- **File Size:** Under 5MB
- **Content:** Clear, well-lit photo of a person's face/upper body

**Avoid:**

- Blurry or low-resolution images
- Multiple people in one image
- Heavy filters or effects
- Extreme angles or poses

### 2. Character Descriptions

**Good Examples:**

```
✅ "2d chibi avatar with realistic proportions"
✅ "2d cartoon avatar with realistic proportions"
✅ "2d anime-style character with exaggerated features"
```

**Avoid:**

```
❌ "make it look cool" (too vague)
❌ "realistic 3d model" (wrong style)
❌ "" (empty description)
```

### 3. Animation Prompts

**Good Examples:**

```
✅ "The person waves at the camera"
✅ "The person waves at the camera with a friendly smile"
✅ "The person waves at the camera in a cute and energetic way"
```

**Avoid:**

```
❌ "do something" (too vague)
❌ "perform a backflip" (too complex)
❌ "talk for 5 minutes" (too long)
```

### 4. Rate Limiting

- **Implement retry logic** with exponential backoff
- **Cache character URLs** to avoid regenerating
- **Monitor credits** before making requests
- **Queue requests** if processing multiple images

### 5. Resource Management

```javascript
// Good: Use character URL directly (no need to fetch)
const characterUrl = characterData.output;
const videoResult = await generateVideo(characterUrl, prompt);

// Also Good: Reuse the same character URL for multiple videos
await generateVideo(characterUrl, prompt1);
await generateVideo(characterUrl, prompt2); // Reuses the same URL
```

---

## Integration Checklist

- [ ] API key configured in environment variables
- [ ] Error handling implemented for all API calls
- [ ] Loading states shown during generation (2-3 minutes)
- [ ] Credits monitoring displayed to users
- [ ] Character images cached/stored
- [ ] Video URLs saved for download
- [ ] Timeout handling (set to at least 180 seconds)
- [ ] File size validation before upload
- [ ] User feedback during long operations
- [ ] Retry logic for failed requests

---

## Support & Resources

### API Endpoints Summary

| Endpoint                        | Method | Purpose               | Credits | Time  |
| ------------------------------- | ------ | --------------------- | ------- | ----- |
| `/api/v1/generate_ai_character` | POST   | Generate 2D character | ~5      | ~10s  |
| `/api/v1/generate_ai_video`     | POST   | Animate character     | ~70     | ~127s |

### Response URLs

Both endpoints return URLs to generated assets:

- **Character:** JPEG image hosted on Replicate CDN
- **Video:** MP4 video hosted on Replicate CDN
- **Validity:** URLs are permanent and can be downloaded/stored

### Testing

**Test with cURL:**

```bash
# Test character generation
curl -X POST https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_character \
  -H "x-api-key: YOUR_API_KEY" \
  -F "image=@test-image.jpg" \
  -F "character_description=2d cartoon avatar with realistic proportions"
```

---

## Changelog

### Version 1.0 (Current)

- Character generation endpoint
- Video generation endpoint
- Credits-based billing system
- Replicate CDN hosting for outputs

---

## License & Terms

- API access requires valid API key
- Credits are consumed per request
- Generated assets are hosted on Replicate CDN
- Refer to PRISM AI terms of service for usage limits

---

**Last Updated:** 2025-11-22  
**API Version:** v1  
**Base URL:** https://prismai.ap-southeast-1.elasticbeanstalk.com
