"use client";

import { useState } from "react";
import { FileDown, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { exportQuotationPdf } from "@/lib/api/quotations";
import { Button } from "@/components/ui/button";

interface QuotationPdfPreviewProps {
  quotationId: string;
  quotationNumber?: string;
}

export function QuotationPdfPreview({
  quotationId,
  quotationNumber,
}: QuotationPdfPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filename = `quotation-${quotationNumber || quotationId}.pdf`;

  const fetchPdfBlob = async (): Promise<Blob | null> => {
    setError(null);
    try {
      const blob = await exportQuotationPdf(quotationId);
      return blob;
    } catch {
      const message = "Failed to load PDF. Please try again.";
      setError(message);
      toast.error(message);
      return null;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await fetchPdfBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = async () => {
    setIsOpening(true);
    try {
      const blob = await fetchPdfBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");

      // Revoke the object URL after the tab has had time to load it
      if (win) {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else {
        // Popup was blocked — fall back to download
        URL.revokeObjectURL(url);
        toast.error("Popup blocked. Downloading instead.");
        handleDownload();
      }
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenInNewTab}
        disabled={isOpening || isDownloading}
      >
        {isOpening ? (
          <Loader2 className="size-4 mr-1 animate-spin" />
        ) : (
          <ExternalLink className="size-4 mr-1" />
        )}
        Preview PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading || isOpening}
      >
        {isDownloading ? (
          <Loader2 className="size-4 mr-1 animate-spin" />
        ) : (
          <FileDown className="size-4 mr-1" />
        )}
        Download PDF
      </Button>
    </div>
  );
}
