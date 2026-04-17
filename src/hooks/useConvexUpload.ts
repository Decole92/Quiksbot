"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export function useConvexUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrl);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setProgress(10);
    try {
      const uploadUrl = await generateUploadUrl();
      setProgress(40);

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) throw new Error("Upload failed");
      setProgress(70);

      const { storageId } = await response.json();
      const url = await getFileUrl({ storageId });
      setProgress(100);
      return url;
    } catch (err) {
      console.error("Convex upload error:", err);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  return { uploadFile, progress, isUploading };
}
