import { ReelDownloaderForm } from "./components/ReelDownloaderForm";
import { ReelDownloaderHeader } from "./components/ReelDownloaderHeader";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-8 rounded-xl bg-white p-8 ring-1 ring-foreground/10 dark:bg-black dark:ring-foreground/20">
        <ReelDownloaderHeader />
        <ReelDownloaderForm />
      </main>
    </div>
  );
}
