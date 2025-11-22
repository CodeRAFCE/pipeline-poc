# PRISM AI Integration Guide

This document explains the PRISM AI API integration for character and video generation.

## Overview

The application now integrates with PRISM AI APIs to:

1. **Generate AI Characters** - Convert uploaded images to 2D cartoon/chibi avatars
2. **Generate AI Videos** - Animate the characters with custom prompts

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# PRISM AI API Configuration
NEXT_PUBLIC_PRISM_API_URL=https://prismai.ap-southeast-1.elasticbeanstalk.com
PRISM_API_KEY=CD3V2pSBQtT2BohCEzWKVwC0JtSKD7rV0dUrj3rHThc
```

**Important:**

- `NEXT_PUBLIC_PRISM_API_URL` is public (used in both client and server)
- `PRISM_API_KEY` is server-only (never exposed to the client)

### 2. Install Dependencies

The project uses standard Next.js dependencies. Run:

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Integration Details

### Architecture

```
User Upload → Next.js API Route → PRISM AI APIs → Response
                                   ↓
                          1. Generate Character
                          2. Generate Video
```

### API Endpoints Used

#### 1. Generate AI Character

- **Endpoint:** `POST /api/v1/generate_ai_character`
- **Parameters:**
  - `image` (File): The uploaded person image
  - `character_description` (String): Style description (e.g., "2d chibi avatar with realistic proportions")
- **Response:**
  ```json
  {
    "output": "https://replicate.delivery/.../character.jpeg",
    "generation_time": 10.02,
    "credits_remaining": 8350,
    "credits_used": 5,
    "type": "ai_character"
  }
  ```

#### 2. Generate AI Video

- **Endpoint:** `POST /api/v1/generate_ai_video`
- **Parameters:**
  - `character` (File): The generated character image
  - `prompt` (String): Animation description (e.g., "The person waves at the camera")
- **Response:**
  ```json
  {
    "output": "https://replicate.delivery/.../video.mp4",
    "generation_time": 127.27,
    "credits_remaining": 8355,
    "credits_used": 70,
    "type": "ai_video"
  }
  ```

### File Structure

```
app/
├── api/
│   └── upload/
│       └── route.ts          # Main API route handling both character & video generation
├── components/
│   └── ImageUpload.tsx       # Frontend component for image upload and results display
├── config/
│   └── prompts.ts            # Character styles and animation prompts configuration
└── services/
    └── prismApi.ts           # PRISM AI service functions (optional direct usage)
```

## Character Styles

The application supports two character styles:

### Normal Character 🧑

- **Description:** "2d cartoon avatar with realistic proportions"
- **Animation:** "The person waves at the camera with a friendly smile"
- **Style:** Realistic proportions with natural movements

### Chibi Character 🎀

- **Description:** "2d chibi avatar with realistic proportions"
- **Animation:** "The person waves at the camera in a cute and energetic way"
- **Style:** Cute super deformation style with big head

## Workflow

1. **User uploads an image** and selects a character style (Normal/Chibi)
2. **Frontend sends request** to `/api/upload` with:
   - Image file
   - Character description
   - Animation prompt
3. **Backend processes** in two steps:
   - Step 1: Calls PRISM AI character generation API
   - Step 2: Uses generated character to call video generation API
4. **Response returned** with:
   - Character image URL
   - Video URL
   - Generation times
   - Credits used/remaining
5. **Frontend displays**:
   - Generated character preview
   - Download button for video
   - Generation statistics
   - Credits information

## Response Structure

The `/api/upload` endpoint returns:

```typescript
{
  success: boolean;
  message: string;
  data: {
    characterUrl: string; // URL to generated character image
    videoUrl: string; // URL to generated video
    characterGenerationTime: number; // Time in seconds
    videoGenerationTime: number; // Time in seconds
    totalGenerationTime: number; // Total time in seconds
    creditsUsed: number; // Total credits consumed
    creditsRemaining: number; // Remaining credits
  }
  uploadedFile: {
    name: string;
    size: number;
    type: string;
  }
}
```

## Error Handling

The API handles errors at each step:

- **Validation errors:** File type, size, missing API key
- **Character generation errors:** Returns error with step information
- **Video generation errors:** Returns error but includes character data
- **Network errors:** Caught and returned with appropriate messages

## Credits System

- **Character Generation:** ~5 credits
- **Video Generation:** ~70 credits
- **Total per request:** ~75 credits

The response includes:

- `creditsUsed`: Credits consumed in this request
- `creditsRemaining`: Total credits remaining in your account

## Testing

### Manual Testing

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Upload a person's image
4. Select a character style
5. Click "Generate Animated Video"
6. Wait for processing (typically 2-3 minutes)
7. View the generated character and download the video

### API Testing with cURL

```bash
# Test character generation
curl --request POST \
  --url https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_character \
  --header 'content-type: multipart/form-data' \
  --header 'x-api-key: YOUR_API_KEY' \
  --form 'image=@/path/to/image.jpg' \
  --form 'character_description=2d cartoon avatar with realistic proportions'

# Test video generation
curl --request POST \
  --url https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_video \
  --header 'content-type: multipart/form-data' \
  --header 'x-api-key: YOUR_API_KEY' \
  --form 'character=@/path/to/character.jpg' \
  --form 'prompt=The person waves at the camera'
```

## Customization

### Adding New Character Styles

Edit `app/config/prompts.ts`:

```typescript
export type CharacterStyle = "normal" | "chibi" | "yourNewStyle";

export const CHARACTER_DESCRIPTIONS: Record<CharacterStyle, string> = {
  normal: "2d cartoon avatar with realistic proportions",
  chibi: "2d chibi avatar with realistic proportions",
  yourNewStyle: "your custom description",
};

export const ANIMATION_PROMPTS: Record<CharacterStyle, string> = {
  normal: "The person waves at the camera with a friendly smile",
  chibi: "The person waves at the camera in a cute and energetic way",
  yourNewStyle: "your custom animation prompt",
};

export const CHARACTER_STYLES = [
  // ... existing styles
  {
    id: "yourNewStyle" as CharacterStyle,
    name: "Your Style Name",
    emoji: "🎨",
    description: "Description shown to users",
    color: "blue", // or "pink"
  },
];
```

## Troubleshooting

### API Key Not Configured

**Error:** "PRISM API key not configured"
**Solution:** Ensure `.env.local` exists with `PRISM_API_KEY` set

### Character Generation Failed

**Error:** "Character generation failed"
**Possible causes:**

- Invalid image format
- Image too large (>10MB)
- API key invalid or expired
- Insufficient credits

### Video Generation Failed

**Error:** "Video generation failed"
**Note:** Character data is still returned in the error response
**Possible causes:**

- Character image URL inaccessible
- Invalid prompt
- Insufficient credits

### Network Errors

**Error:** "Network error. Please check your connection"
**Solution:**

- Check internet connection
- Verify PRISM API URL is accessible
- Check for CORS issues (should be handled by Next.js API route)

## Performance Notes

- **Character generation:** ~10 seconds
- **Video generation:** ~120-130 seconds
- **Total processing time:** ~140 seconds (2-3 minutes)

The frontend shows a loading state during processing and displays detailed timing information in the results.

## Security Considerations

1. **API Key Protection:** The API key is stored server-side only and never exposed to the client
2. **File Upload Validation:** File type and size are validated before processing
3. **CORS:** Handled by Next.js API routes
4. **Rate Limiting:** Consider implementing rate limiting for production use

## Next Steps

Potential enhancements:

- [ ] Add progress tracking for long-running generations
- [ ] Implement caching for generated characters
- [ ] Add batch processing support
- [ ] Create a gallery of generated videos
- [ ] Add user authentication and credit management
- [ ] Implement webhook support for async processing
