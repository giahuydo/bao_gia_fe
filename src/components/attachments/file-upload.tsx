"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, File, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadAttachment } from "@/lib/api/attachments";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
];

const ACCEPTED_EXTENSIONS =
  ".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface SelectedFile {
  file: File;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  errorMessage?: string;
}

interface FileUploadProps {
  quotationId: string;
  onUploadSuccess?: () => void;
  disabled?: boolean;
}

export function FileUpload({
  quotationId,
  onUploadSuccess,
  disabled = false,
}: FileUploadProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      return `File type "${file.type || file.name.split(".").pop()}" is not supported. Accepted: PDF, images, Word, Excel, CSV, TXT.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size (${formatFileSize(file.size)}) exceeds the 10 MB limit.`;
    }
    return null;
  };

  const selectFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile({ file, status: "idle", progress: 0 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) selectFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || selectedFile.status === "uploading") return;

    setSelectedFile((prev) =>
      prev ? { ...prev, status: "uploading", progress: 0 } : null
    );

    try {
      await uploadAttachment(quotationId, selectedFile.file, (progress) => {
        setSelectedFile((prev) =>
          prev ? { ...prev, progress } : null
        );
      });

      setSelectedFile((prev) =>
        prev ? { ...prev, status: "success", progress: 100 } : null
      );

      toast.success(`"${selectedFile.file.name}" uploaded successfully.`);

      await queryClient.invalidateQueries({
        queryKey: ["attachments", quotationId],
      });

      onUploadSuccess?.();

      // Clear the selection after a brief delay so the success state is visible
      setTimeout(() => setSelectedFile(null), 1500);
    } catch {
      setSelectedFile((prev) =>
        prev
          ? {
              ...prev,
              status: "error",
              errorMessage: "Upload failed. Please try again.",
            }
          : null
      );
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
  };

  const isUploading = selectedFile?.status === "uploading";

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file drop zone"
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled
            ? "pointer-events-none opacity-50"
            : "cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="sr-only"
          disabled={disabled}
        />

        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-colors",
            isDragOver ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Upload
            className={cn(
              "size-5 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>

        <div>
          <p className="text-sm font-medium">
            {isDragOver ? "Drop file here" : "Drag & drop or click to browse"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            PDF, images, Word, Excel, CSV, TXT &middot; max 10 MB
          </p>
        </div>
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-md border px-3 py-2.5",
            selectedFile.status === "error" && "border-destructive/50 bg-destructive/5",
            selectedFile.status === "success" && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
          )}
        >
          {/* Icon */}
          <div className="shrink-0">
            {selectedFile.status === "success" ? (
              <CheckCircle className="size-5 text-green-600" />
            ) : selectedFile.status === "uploading" ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : (
              <File className="size-5 text-muted-foreground" />
            )}
          </div>

          {/* File info + progress */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {selectedFile.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.file.size)}
              {selectedFile.status === "uploading" &&
                ` \u00b7 ${selectedFile.progress}%`}
            </p>

            {/* Progress bar */}
            {selectedFile.status === "uploading" && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${selectedFile.progress}%` }}
                />
              </div>
            )}

            {/* Error message */}
            {selectedFile.status === "error" && selectedFile.errorMessage && (
              <p className="mt-0.5 text-xs text-destructive">
                {selectedFile.errorMessage}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {(selectedFile.status === "idle" ||
              selectedFile.status === "error") && (
              <>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading || disabled}
                >
                  Upload
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  aria-label="Remove selected file"
                >
                  <X className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
