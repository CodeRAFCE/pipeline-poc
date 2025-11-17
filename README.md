# AI Animated Character Generator - PRISM POC

This Next.js application allows users to upload a person's image to generate an animated character video waving "Hi" using an AI pipeline.

## Features

- 📸 Image upload with drag-and-drop support
- 🖼️ Real-time image preview
- ✨ Modern, responsive UI with dark mode support
- 🚀 API integration for backend processing
- 🎭 Demo mode for testing without a backend
- ⚡ Built with Next.js 16 and React 19

## Getting Started

### Prerequisites

- Node.js 18+ installed
- (Optional) Backend API endpoint for production mode

### Installation

1. Install dependencies:

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Operating Modes

### 🎭 Demo Mode (Default)

The app runs in **demo mode** by default when no backend URL is configured:

- Upload any image to test the UI
- Simulates a 2-second upload delay
- Shows mock upload success and processing status
- Displays a "Download Video" button if `character.mp4` exists in `/public` folder

**To test with video download:**

1. Place any MP4 video file in the `/public` folder
2. Rename it to `character.mp4`
3. Upload an image - you'll see a download button after upload

### 🚀 Production Mode

To connect to a real backend:

1. Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your backend endpoint:

```env
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url/api/generate-video
```

3. Restart the dev server

## API Integration

### Backend Endpoint Expected Format

The frontend sends a POST request to your backend with the following JSON payload:

```json
{
  "image": "base64_encoded_image_string",
  "imageType": "image/jpeg",
  "imageName": "photo.jpg",
  "prompt": "Generate an animated character video waving \"Hi\" based on this person",
  "timestamp": "2025-11-17T12:00:00.000Z"
}
```

### Expected Backend Response

Success response (200):

```json
{
  "jobId": "unique-job-id",
  "status": "processing",
  "message": "Video generation started"
}
```

## Project Structure

```
app/
├── api/
│   └── upload/
│       └── route.ts          # API route for handling uploads
├── components/
│   └── ImageUpload.tsx       # Main upload component
├── page.tsx                  # Home page
├── layout.tsx                # Root layout
└── globals.css               # Global styles
```

## Configuration

### Image Upload Limits

- Maximum file size: 10MB
- Supported formats: All image types (PNG, JPG, GIF, etc.)

### Modifying the Prompt

Edit the prompt in `app/components/ImageUpload.tsx`:

```typescript
formData.append("prompt", "Your custom prompt here");
```

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
