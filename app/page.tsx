"use client";

import ImageUpload from "./components/ImageUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Animated Character Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload a person&apos;s image to generate an animated character video
            waving &quot;Hi&quot;
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <ImageUpload
            onUploadSuccess={(data) => {
              console.log("Upload successful:", data);
            }}
          />
        </div>

        <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by PRISM Pipeline POC</p>
        </div>
      </main>
    </div>
  );
}
