"use client";

import { Check, Download, FileVideo, Loader2, X } from "lucide-react";

import { formatFileSize } from "@/lib/utils";

type DownloadConfirmationProps = {
  filename: string;
  fileSize: number;
  isDownloading: boolean;
  onDownload: () => void;
  onCancel: () => void;
};

const FILE_EXTENSION_REGEX = /\.([a-z0-9]+)$/i;

function getFileType(filename: string): string {
  const match = FILE_EXTENSION_REGEX.exec(filename);
  return match?.[1]?.toUpperCase() ?? "MP4";
}

export function DownloadConfirmation({
  filename,
  fileSize,
  isDownloading,
  onDownload,
  onCancel,
}: DownloadConfirmationProps) {
  return (
    <div className="mt-md bg-surface-container border border-outline-variant rounded-xl p-md text-left animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-xs">
          <Check className="size-5 text-primary" />
          <h3 className="text-label-sm font-semibold text-on-surface uppercase tracking-widest">
            Ready to Download
          </h3>
        </div>
        <span className="px-sm py-1 bg-primary/10 text-primary rounded-full text-[11px] uppercase tracking-tighter font-semibold">
          Loaded
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-md">
        <div className="relative w-full sm:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant flex items-center justify-center">
          <FileVideo className="size-12 text-on-surface-variant" />
        </div>
        <div className="flex flex-col justify-between py-xs flex-1 min-w-0">
          <div className="min-w-0">
            <p className="text-body-md text-on-surface-variant break-words">
              {filename}
            </p>
          </div>
          <div className="flex items-center gap-sm mt-sm">
            <div className="flex items-center gap-xs text-on-surface-variant">
              <Download className="size-[18px]" />
              <span className="text-label-sm">{formatFileSize(fileSize)}</span>
            </div>
            <div className="flex items-center gap-xs text-on-surface-variant">
              <FileVideo className="size-[18px]" />
              <span className="text-label-sm">{getFileType(filename)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-sm mt-md">
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-xs px-md py-sm bg-primary-container text-white text-label-sm font-semibold rounded-lg hover:bg-inverse-primary transition-colors disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="size-[18px] animate-spin" />
          ) : (
            <Download className="size-[18px]" />
          )}
          {isDownloading ? "Downloading..." : "Download"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isDownloading}
          className="flex items-center justify-center gap-xs px-md py-sm bg-surface-variant text-on-surface text-label-sm font-semibold rounded-lg hover:bg-surface-bright border border-outline-variant transition-colors disabled:opacity-50"
        >
          <X className="size-[18px]" />
          Cancel
        </button>
      </div>
    </div>
  );
}
