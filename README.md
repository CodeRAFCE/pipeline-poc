# AI Animated Character Generator - PRISM POC

This Next.js application allows users to upload a person's image to generate an animated character video waving "Hi" using PRISM AI APIs.

## Features

- 📸 Image upload with drag-and-drop support
- 🖼️ Real-time image preview
- 🎨 Multiple character styles (Normal & Chibi)
- 🎬 AI-powered character and video generation via PRISM AI
- ✨ Modern, responsive UI with dark mode support
- 📊 Generation statistics and credits tracking
- ⚡ Built with Next.js 16 and React 19

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# PRISM AI API Configuration
NEXT_PUBLIC_PRISM_API_URL=https://prismai.ap-southeast-1.elasticbeanstalk.com
PRISM_API_KEY=CD3V2pSBQtT2BohCEzWKVwC0JtSKD7rV0dUrj3rHThc
```

**Important:** Replace the API key with your actual PRISM AI API key.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## PRISM AI Integration

This application integrates with PRISM AI's character and video generation APIs:

1. **Character Generation** - Converts uploaded images to 2D cartoon/chibi avatars
2. **Video Generation** - Animates the characters with custom prompts

For detailed integration documentation, see [PRISM_INTEGRATION.md](./PRISM_INTEGRATION.md)

## Character Styles

### Normal Character 🧑

- Realistic 2D cartoon style with natural proportions
- Friendly waving animation
- ~5 credits for character + ~70 credits for video

### Chibi Character 🎀

- Cute super deformation style with big head
- Energetic waving animation
- ~5 credits for character + ~70 credits for video

## Project Structure

```
app/
├── api/
│   └── upload/
│       └── route.ts          # API route handling PRISM AI integration
├── components/
│   └── ImageUpload.tsx       # Main upload component with results display
├── config/
│   └── prompts.ts            # Character styles and animation prompts
├── services/
│   └── prismApi.ts           # PRISM AI service functions
├── page.tsx                  # Home page
├── layout.tsx                # Root layout
└── globals.css               # Global styles
```

## How It Works

1. User uploads an image and selects a character style
2. Frontend sends request to `/api/upload` with image and style preferences
3. Backend processes in two steps:
   - Generates AI character using PRISM AI
   - Generates animated video from the character
4. Results displayed with:
   - Generated character preview
   - Downloadable video
   - Generation statistics
   - Credits usage information

## Configuration

### Image Upload Limits

- Maximum file size: 10MB
- Supported formats: All image types (PNG, JPG, GIF, etc.)

### Customizing Character Styles

Edit `app/config/prompts.ts` to add or modify character styles and animation prompts.

## API Response Structure

The application returns:

```typescript
{
  success: boolean;
  message: string;
  data: {
    characterUrl: string; // Generated character image
    videoUrl: string; // Generated video
    characterGenerationTime: number; // Seconds
    videoGenerationTime: number; // Seconds
    totalGenerationTime: number; // Total seconds
    creditsUsed: number; // Credits consumed
    creditsRemaining: number; // Credits remaining
  }
}
```

## Performance

- Character generation: ~10 seconds
- Video generation: ~120-130 seconds
- Total processing time: ~2-3 minutes

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new).

**Important:** Remember to set environment variables in Vercel:

- `NEXT_PUBLIC_PRISM_API_URL`
- `PRISM_API_KEY`

## Documentation

- [PRISM Integration Guide](./PRISM_INTEGRATION.md) - Detailed API integration documentation
- [Next.js Documentation](https://nextjs.org/docs)

## Troubleshooting

See [PRISM_INTEGRATION.md](./PRISM_INTEGRATION.md#troubleshooting) for common issues and solutions.

## Credits System

Each generation consumes credits from your PRISM AI account:

- Character generation: ~5 credits
- Video generation: ~70 credits
- **Total per request: ~75 credits**

Monitor your credits in the application after each generation.
