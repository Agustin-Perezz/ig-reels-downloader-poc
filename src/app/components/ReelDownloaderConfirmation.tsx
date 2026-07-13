"use client";

import { Check, Download, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";

type ReelDownloaderConfirmationProps = {
  filename: string;
  fileSize: number;
  isDownloading: boolean;
  onDownload: () => void;
  onCancel: () => void;
};

export function ReelDownloaderConfirmation({
  filename,
  fileSize,
  isDownloading,
  onDownload,
  onCancel,
}: ReelDownloaderConfirmationProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Check className="size-4 text-primary" />
        <span>Reel ready to download</span>
      </div>

      <dl className="flex flex-col gap-1 text-sm text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>File</dt>
          <dd className="truncate text-foreground">{filename}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Size</dt>
          <dd className="text-foreground">{formatFileSize(fileSize)}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button
          type="button"
          size="lg"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex-1"
        >
          {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
          {isDownloading ? "Downloading..." : "Download"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="ghost"
          onClick={onCancel}
          disabled={isDownloading}
        >
          <X />
          Cancel
        </Button>
      </div>
    </div>
  );
}
