"use client";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FormStatus, useReelDownload } from "@/shared/hooks/useReelDownload";

export function ReelDownloaderForm() {
  const { url, setUrl, state, handleSubmit } = useReelDownload();

  const isDownloading = state.status === FormStatus.Downloading;

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <Input
        type="url"
        placeholder="https://www.instagram.com/reel/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-invalid={state.status === FormStatus.Error}
        disabled={isDownloading}
      />
      <Button type="submit" size="lg" disabled={isDownloading || !url.trim()}>
        {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
        {isDownloading ? "Downloading..." : "Download"}
      </Button>
      {state.status === FormStatus.Error && (
        <p className="text-sm text-destructive">{state.errorMessage}</p>
      )}
    </form>
  );
}
