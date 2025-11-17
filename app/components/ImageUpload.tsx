"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import {
  CHARACTER_PROMPTS,
  CHARACTER_STYLES,
  CharacterStyle,
} from "../config/prompts";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    jobId?: string;
    videoUrl?: string;
    status?: string;
  };
  uploadedFile?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ImageUploadProps {
  onUploadSuccess?: (data: UploadResponse) => void;
}

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [characterStyle, setCharacterStyle] =
    useState<CharacterStyle>("normal");
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [uploadedData, setUploadedData] = useState<UploadResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        setUploadStatus({ type: "", message: "" });
      } else {
        setUploadStatus({
          type: "error",
          message: "Please select a valid image file",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadStatus({ type: "", message: "" });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      setUploadStatus({
        type: "error",
        message: "Please select an image first",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: "", message: "" });

    // Check if backend URL is configured
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const useMockMode = !backendUrl;

    try {
      if (useMockMode) {
        // Mock/Demo mode - simulate backend response
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay

        const mockData: UploadResponse = {
          success: true,
          message: "Image uploaded successfully (DEMO MODE)",
          data: {
            jobId: `demo-${Date.now()}`,
            status: "completed",
            videoUrl: "/character.mp4",
          },
          uploadedFile: {
            name: selectedImage.name,
            size: selectedImage.size,
            type: selectedImage.type,
          },
        };

        setUploadStatus({
          type: "success",
          message: "Image uploaded successfully! Processing started.",
        });
        setUploadedData(mockData);
        if (onUploadSuccess) {
          onUploadSuccess(mockData);
        }
      } else {
        // Real backend mode
        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("prompt", CHARACTER_PROMPTS[characterStyle]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setUploadStatus({
            type: "success",
            message: "Image uploaded successfully! Processing started.",
          });
          setUploadedData(data);
          if (onUploadSuccess) {
            onUploadSuccess(data);
          }
        } else {
          setUploadStatus({
            type: "error",
            message: data.error || "Upload failed. Please try again.",
          });
        }
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setUploadStatus({ type: "", message: "" });
    setUploadedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // If upload was successful, show the success UI
  if (uploadedData && uploadStatus.type === "success") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <svg
                className="h-16 w-16 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your animated character video is being generated
            </p>
          </div>

          {/* Upload Details */}
          {uploadedData.uploadedFile && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Upload Details
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span className="font-medium">Character Style:</span>{" "}
                  <span className="capitalize">{characterStyle}</span>{" "}
                  {characterStyle === "chibi" ? "🎀" : "🧑"}
                </p>
                <p>
                  <span className="font-medium">File:</span>{" "}
                  {uploadedData.uploadedFile.name}
                </p>
                <p>
                  <span className="font-medium">Size:</span>{" "}
                  {(uploadedData.uploadedFile.size / 1024).toFixed(2)} KB
                </p>
                {uploadedData.data?.jobId && (
                  <p>
                    <span className="font-medium">Job ID:</span>{" "}
                    {uploadedData.data.jobId}
                  </p>
                )}
                {uploadedData.data?.status && (
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {uploadedData.data.status}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Download Button (if video URL is available) */}
          {uploadedData.data?.videoUrl && (
            <a
              href={uploadedData.data.videoUrl}
              download
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              Download Video
            </a>
          )}

          {/* Processing Message (if no video URL yet) */}
          {!uploadedData.data?.videoUrl && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Video is being processed
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    This may take a few minutes. Check back soon or refresh the
                    page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Upload Another Image
            </button>
            {uploadedData.data?.jobId && (
              <button
                onClick={() => {
                  // TODO: Implement status check
                  alert("Status check feature - coming soon!");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Check Status
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Character Style Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Choose Character Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CHARACTER_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setCharacterStyle(style.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  characterStyle === style.id
                    ? `border-${style.color}-600 bg-${style.color}-50 dark:bg-${style.color}-900/20`
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl">{style.emoji}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {style.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {style.description}
                    </div>
                  </div>
                </div>
                {characterStyle === style.id && (
                  <div className="absolute top-2 right-2">
                    <svg
                      className={`h-5 w-5 text-${style.color}-600 dark:text-${style.color}-400`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto aspect-square">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Choose a different image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="text-lg font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Status Messages */}
        {uploadStatus.message && (
          <div
            className={`p-4 rounded-lg ${
              uploadStatus.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
            }`}
          >
            {uploadStatus.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedImage || isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Generate Animated Video"
          )}
        </button>
      </form>
    </div>
  );
}
