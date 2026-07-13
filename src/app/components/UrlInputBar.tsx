"use client";

import { ClipboardCheck, ClipboardPaste, Link2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const PASTE_ICON_DURATION_MS = 2000;
const DEFAULT_PLACEHOLDER = "Insert instagram link here";
const DEFAULT_SUBMIT_LABEL = "Download";

type UrlInputBarProps = {
  url: string;
  onUrlChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onPaste: () => Promise<boolean>;
  isBusy: boolean;
  errorMessage?: string;
  isError?: boolean;
  placeholder?: string;
  submitLabel?: string;
};

export function UrlInputBar({
  url,
  onUrlChange,
  onSubmit,
  onPaste,
  isBusy,
  errorMessage,
  isError,
  placeholder = DEFAULT_PLACEHOLDER,
  submitLabel = DEFAULT_SUBMIT_LABEL,
}: UrlInputBarProps) {
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    if (!pasted) {
      return;
    }
    const timer = setTimeout(() => setPasted(false), PASTE_ICON_DURATION_MS);
    return () => clearTimeout(timer);
  }, [pasted]);

  async function onPasteClick() {
    const success = await onPaste();
    if (success) {
      setPasted(true);
    }
  }

  const isFetching = isBusy;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-md">
      <form
        className="bg-surface-container border border-outline-variant rounded-xl p-xs flex flex-col sm:flex-row items-center gap-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-[0_4px_30px_rgba(79,70,229,0.1)]"
        onSubmit={onSubmit}
      >
        <div className="flex-1 w-full relative">
          <Link2 className="absolute left-sm top-1/2 -translate-y-1/2 size-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder={placeholder}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            aria-invalid={isError}
            disabled={isBusy}
            className="w-full bg-transparent border-none text-on-surface text-body-md py-md pl-xl pr-sm focus:ring-0 focus:outline-none placeholder-on-surface-variant"
          />
        </div>
        <div className="flex gap-xs w-full sm:w-auto p-xs sm:p-0">
          <button
            type="button"
            onClick={onPasteClick}
            disabled={isBusy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-md py-sm bg-surface-variant text-on-surface text-label-sm font-semibold rounded-lg hover:bg-surface-bright border border-outline-variant transition-colors"
          >
            {pasted ? (
              <ClipboardCheck className="size-[18px]" />
            ) : (
              <ClipboardPaste className="size-[18px]" />
            )}
            Paste
          </button>
          <button
            type="submit"
            disabled={isBusy || !url.trim()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-xs px-lg py-sm bg-primary-container text-white text-label-sm font-semibold rounded-lg hover:bg-inverse-primary transition-colors shadow-[0_4px_14px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <Loader2 className="size-[18px] animate-spin" />
            ) : null}
            {isFetching ? "Fetching..." : submitLabel}
          </button>
        </div>
      </form>

      {isError && errorMessage ? (
        <p
          className="text-sm text-error bg-error-container/20 px-md py-sm rounded-lg border border-error/30"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
