"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  CHARACTER_DESCRIPTIONS,
  ANIMATION_PROMPTS,
  CHARACTER_STYLES,
  CharacterStyle,
} from "../config/prompts";

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    characterUrl?: string;
    videoUrl?: string;
    transparentVideoUrl?: string;
    characterGenerationTime?: number;
    videoGenerationTime?: number;
    totalGenerationTime?: number;
    creditsUsed?: number;
    creditsRemaining?: number;
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
        toast.success("Image selected successfully!");
      } else {
        toast.error("Please select a valid image file (PNG, JPG, GIF)");
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
      toast.success("Image dropped successfully!");
    } else {
      toast.error("Please drop a valid image file");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      toast.error("Please select an image first");
      setUploadStatus({
        type: "error",
        message: "Please select an image first",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: "", message: "" });

    // Show loading toast
    const loadingToast = toast.loading("Generating your animated character...");

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append(
        "characterDescription",
        CHARACTER_DESCRIPTIONS[characterStyle]
      );
      formData.append("animationPrompt", ANIMATION_PROMPTS[characterStyle]);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Character and video generated successfully! 🎉", {
          id: loadingToast,
        });
        setUploadStatus({
          type: "success",
          message: "Character and video generated successfully!",
        });
        setUploadedData(data);
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }
      } else {
        throw new Error(data.error || data.details || "Upload failed");
      }
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Generation failed. Please try again.";

      toast.error(errorMessage, {
        id: loadingToast,
      });

      setUploadStatus({
        type: "error",
        message: errorMessage,
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

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.loading(`Downloading ${filename}...`);

      // Fetch the video file
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      // Convert to blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.dismiss();
      toast.success(`${filename} downloaded successfully!`);
    } catch (error) {
      toast.dismiss();
      toast.error("Download failed. Opening in new tab instead...");
      // Fallback: open in new tab
      window.open(url, "_blank");
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
                Generation Details
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
                {uploadedData.data?.characterGenerationTime && (
                  <p>
                    <span className="font-medium">Character Generation:</span>{" "}
                    {uploadedData.data.characterGenerationTime.toFixed(2)}s
                  </p>
                )}
                {uploadedData.data?.videoGenerationTime && (
                  <p>
                    <span className="font-medium">Video Generation:</span>{" "}
                    {uploadedData.data.videoGenerationTime.toFixed(2)}s
                  </p>
                )}
                {uploadedData.data?.totalGenerationTime && (
                  <p>
                    <span className="font-medium">Total Time:</span>{" "}
                    {uploadedData.data.totalGenerationTime.toFixed(2)}s
                  </p>
                )}
                {uploadedData.data?.creditsUsed !== undefined && (
                  <p>
                    <span className="font-medium">Credits Used:</span>{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {uploadedData.data.creditsUsed}
                    </span>
                  </p>
                )}
                {uploadedData.data?.creditsRemaining !== undefined && (
                  <p>
                    <span className="font-medium">Credits Remaining:</span>{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {uploadedData.data.creditsRemaining}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Character Preview */}
          {uploadedData.data?.characterUrl && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Generated Character
              </h3>
              <div className="relative w-full max-w-sm mx-auto aspect-square">
                <Image
                  src={uploadedData.data.characterUrl}
                  alt="Generated Character"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <a
                href={uploadedData.data.characterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Full Size
              </a>
            </div>
          )}

          {/* Video Download Buttons */}
          {uploadedData.data?.videoUrl && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                Generated Videos
              </h3>
              <div
                className={`grid gap-3 ${
                  uploadedData.data?.transparentVideoUrl
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {/* Regular Video */}
                <button
                  onClick={() =>
                    handleDownload(
                      uploadedData.data?.videoUrl!,
                      "animated-video.mp4"
                    )
                  }
                  className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span className="text-sm">Download Video (MP4)</span>
                </button>

                {/* Transparent Video */}
                {uploadedData.data?.transparentVideoUrl && (
                  <button
                    onClick={() =>
                      handleDownload(
                        uploadedData.data?.transparentVideoUrl!,
                        "animated-video-transparent.webm"
                      )
                    }
                    className="flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center gap-2"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className="text-sm">Download Transparent (WebM)</span>
                  </button>
                )}
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
            {CHARACTER_STYLES.map((style) => {
              const isSelected = characterStyle === style.id;
              const isBlue = style.color === "blue";
              const isPink = style.color === "pink";

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCharacterStyle(style.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? isBlue
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : isPink
                        ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20"
                        : ""
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
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <svg
                        className={
                          isBlue
                            ? "h-5 w-5 text-blue-600 dark:text-blue-400"
                            : isPink
                            ? "h-5 w-5 text-pink-600 dark:text-pink-400"
                            : "h-5 w-5"
                        }
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
              );
            })}
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
