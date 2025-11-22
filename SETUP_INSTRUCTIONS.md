# PRISM AI Integration - Setup Instructions

## ⚠️ IMPORTANT: Environment Configuration Required

The PRISM AI integration is now complete, but you need to create the environment configuration file manually.

### Step 1: Create `.env.local` File

Create a new file named `.env.local` in the project root directory:

**Location:** `c:\Users\Admin\Desktop\PRISM_POC\pipeline-poc\.env.local`

**Contents:**

```env
# PRISM AI API Configuration
NEXT_PUBLIC_PRISM_API_URL=https://prismai.ap-southeast-1.elasticbeanstalk.com
NEXT_PUBLIC_PRISM_API_KEY=CD3V2pSBQtT2BohCEzWKVwC0JtSKD7rV0dUrj3rHThc
```

**Note:** The `NEXT_PUBLIC_` prefix is required because the frontend now calls the PRISM API directly.

### Step 2: Restart the Development Server

After creating the `.env.local` file, restart your development server:

1. Stop the current server (Ctrl+C in the terminal)
2. Run `npm run dev` again

### Step 3: Test the Integration

1. Open http://localhost:3000
2. Upload a person's image
3. Select a character style (Normal or Chibi)
4. Click "Generate Animated Video"
5. Wait for processing (~2-3 minutes)
6. View the generated character and download the video

## What Was Changed

### New Files Created

1. **`app/services/prismApi.ts`** - PRISM AI service functions
2. **`PRISM_INTEGRATION.md`** - Detailed integration documentation
3. **`SETUP_INSTRUCTIONS.md`** - This file

### Modified Files

1. **`app/config/prompts.ts`**

   - Changed from `CHARACTER_PROMPTS` to `CHARACTER_DESCRIPTIONS` and `ANIMATION_PROMPTS`
   - Updated to match PRISM AI API format

2. **`app/api/upload/route.ts`**

   - Complete rewrite to integrate with PRISM AI
   - Two-step process: character generation → video generation
   - Returns detailed response with URLs, timing, and credits

3. **`app/components/ImageUpload.tsx`**

   - Updated to use new prompt configuration
   - Modified response interface to match PRISM API
   - Enhanced success UI to show character preview and generation stats
   - Removed mock/demo mode
   - Added credits tracking display

4. **`README.md`**
   - Updated with PRISM AI integration details
   - Removed outdated demo mode information
   - Added character styles documentation

## Integration Flow

```
User Upload
    ↓
Frontend (ImageUpload.tsx)
    ↓
PRISM AI - Step 1: Generate Character (Direct API Call)
    ↓
PRISM AI - Step 2: Generate Video (Direct API Call)
    ↓
Response with URLs & Stats
    ↓
Display Results to User
```

**Note:** The frontend now calls PRISM API directly without a backend proxy.

## API Endpoints Used

### 1. Character Generation

- **URL:** `https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_character`
- **Method:** POST (multipart/form-data)
- **Headers:** `x-api-key: YOUR_API_KEY`
- **Body:**
  - `image`: File (uploaded from frontend)
  - `character_description`: String (e.g., "2d chibi avatar with realistic proportions")

### 2. Video Generation

- **URL:** `https://prismai.ap-southeast-1.elasticbeanstalk.com/api/v1/generate_ai_video`
- **Method:** POST (multipart/form-data)
- **Headers:** `x-api-key: YOUR_API_KEY`
- **Body:**
  - `character`: String (URL from character generation response)
  - `prompt`: String (e.g., "The person waves at the camera")

## Response Structure

The frontend now receives:

```json
{
  "success": true,
  "message": "Character and video generated successfully",
  "data": {
    "characterUrl": "https://replicate.delivery/.../character.jpeg",
    "videoUrl": "https://replicate.delivery/.../video.mp4",
    "characterGenerationTime": 10.02,
    "videoGenerationTime": 127.27,
    "totalGenerationTime": 137.29,
    "creditsUsed": 75,
    "creditsRemaining": 8280
  },
  "uploadedFile": {
    "name": "photo.jpg",
    "size": 123456,
    "type": "image/jpeg"
  }
}
```

## Character Styles

### Normal Character 🧑

- **Description:** "2d cartoon avatar with realistic proportions"
- **Animation:** "The person waves at the camera with a friendly smile"
- **Credits:** ~75 total (5 for character + 70 for video)

### Chibi Character 🎀

- **Description:** "2d chibi avatar with realistic proportions"
- **Animation:** "The person waves at the camera in a cute and energetic way"
- **Credits:** ~75 total (5 for character + 70 for video)

## Error Handling

The integration includes comprehensive error handling:

- **Validation Errors:** File type, size, missing API key
- **Character Generation Errors:** Returns error with step information
- **Video Generation Errors:** Returns error but includes character data
- **Network Errors:** Caught and returned with appropriate messages

## Performance Expectations

- **Character Generation:** ~10 seconds
- **Video Generation:** ~120-130 seconds
- **Total Processing Time:** ~2-3 minutes

The UI shows a loading state during processing.

## Credits Monitoring

Each request consumes approximately **75 credits**:

- Character generation: ~5 credits
- Video generation: ~70 credits

The response includes:

- `creditsUsed`: Credits consumed in this request
- `creditsRemaining`: Total credits remaining in your account

## Next Steps

1. ✅ Create `.env.local` file (see Step 1 above)
2. ✅ Restart development server
3. ✅ Test the integration
4. 📖 Read `PRISM_INTEGRATION.md` for detailed documentation
5. 🎨 Customize character styles in `app/config/prompts.ts` if needed

## Troubleshooting

### "PRISM API key not configured" Error

- Make sure `.env.local` exists in the project root
- Verify `PRISM_API_KEY` is set correctly
- Restart the development server

### Character/Video Generation Failed

- Check if the API key is valid
- Verify you have sufficient credits
- Check the console logs for detailed error messages

### Network Errors

- Verify internet connection
- Check if PRISM API URL is accessible
- Review browser console for CORS or network issues

## Documentation

- **`PRISM_INTEGRATION.md`** - Comprehensive integration guide
- **`README.md`** - Project overview and quick start
- **`app/config/prompts.ts`** - Character styles configuration

## Support

For issues or questions:

1. Check the troubleshooting section in `PRISM_INTEGRATION.md`
2. Review console logs for detailed error messages
3. Verify all environment variables are set correctly
