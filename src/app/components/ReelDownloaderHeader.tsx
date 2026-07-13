export function ReelDownloaderHeader() {
  return (
    <div className="flex flex-col gap-3 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
        IG{" "}
        <span className="bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent">
          Reels
        </span>{" "}
        Downloader
      </h1>
      <p className="text-base text-muted-foreground">
        Paste an Instagram reel URL to fetch and download the video.
      </p>
    </div>
  );
}
