import { ReelDownloaderForm } from "./components/ReelDownloaderForm";
import { ReelDownloaderHeader } from "./components/ReelDownloaderHeader";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-rose-50 to-white px-4 dark:from-zinc-950 dark:to-black">
      <main className="flex w-full max-w-lg flex-col gap-8 rounded-2xl bg-card p-10 shadow-lg ring-1 ring-foreground/10 dark:ring-foreground/20">
        <ReelDownloaderHeader />
        <ReelDownloaderForm />
      </main>
    </div>
  );
}
