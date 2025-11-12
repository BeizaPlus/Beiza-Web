import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UploadResult = {
  url: string;
  path: string;
  bucket: string;
};

interface UseImageUploadProps {
  bucket?: string;
  folder?: string;
  makePublic?: boolean;
  signedUrlDurationSeconds?: number;
  onUpload?: (result: UploadResult) => void;
  onRemove?: () => void;
  initialUrl?: string | null;
}

const DEFAULT_BUCKET = "public-assets";
const DEFAULT_FOLDER = "memoirs";

const sanitizeFileName = (fileName: string) =>
  fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");

export function useImageUpload({
  bucket = DEFAULT_BUCKET,
  folder = DEFAULT_FOLDER,
  makePublic = true,
  signedUrlDurationSeconds = 60 * 60,
  onUpload,
  onRemove,
  initialUrl = null,
}: UseImageUploadProps = {}) {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToSupabase = useCallback(
    async (file: File): Promise<UploadResult> => {
      const client = supabase;

      if (!client) {
        throw new Error("Supabase client is not configured. Check environment variables.");
      }

      const safeFileName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const storagePath = [folder, `${timestamp}-${safeFileName}`].filter(Boolean).join("/");

      const { error: uploadError } = await client.storage
        .from(bucket)
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      if (makePublic) {
        const {
          data: { publicUrl },
        } = client.storage.from(bucket).getPublicUrl(storagePath);

        if (!publicUrl) {
          throw new Error("Unable to resolve public URL for the uploaded asset.");
        }

        return { url: publicUrl, path: storagePath, bucket };
      }

      const { data, error: signedUrlError } = await client.storage
        .from(bucket)
        .createSignedUrl(storagePath, signedUrlDurationSeconds);

      if (signedUrlError || !data?.signedUrl) {
        throw new Error(signedUrlError?.message ?? "Unable to generate signed URL for the uploaded asset.");
      }

      return { url: data.signedUrl, path: storagePath, bucket };
    },
    [bucket, folder, makePublic, signedUrlDurationSeconds]
  );

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setFileName(file.name);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      previewRef.current = localUrl;
      setError(null);

      try {
        setUploading(true);
        const result = await uploadToSupabase(file);
        if (previewRef.current?.startsWith("blob:")) {
          URL.revokeObjectURL(previewRef.current);
        }
        setPreviewUrl(result.url);
        previewRef.current = result.url;
        onUpload?.(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed.";
        setError(errorMessage);
        if (previewRef.current) {
          if (previewRef.current.startsWith("blob:")) {
            URL.revokeObjectURL(previewRef.current);
          }
        }
        setPreviewUrl(null);
        setFileName(null);
        // eslint-disable-next-line no-console
        console.error("[image-upload] Failed to upload image", err);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, uploadToSupabase]
  );

  const handleRemove = useCallback(() => {
    if (previewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
    onRemove?.();
  }, [onRemove]);

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialUrl) {
      setPreviewUrl(initialUrl);
      previewRef.current = initialUrl;
      setFileName(null);
    } else if (!initialUrl && previewRef.current && !uploading) {
      // Only clear blob URLs when initialUrl is cleared
      // Don't clear if previewRef is already a real URL (not a blob), as it might be from a recent upload
      if (previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = null;
        setPreviewUrl(null);
        setFileName(null);
      }
      // If previewRef is a real URL (not a blob), keep it even if initialUrl is not set
      // This handles the case where we just uploaded and the form hasn't updated initialUrl yet
    }
  }, [initialUrl, uploading]);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    uploading,
    error,
  };
}
