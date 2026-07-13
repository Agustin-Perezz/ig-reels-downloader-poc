import { Instructions } from "./components/Instructions";
import { MediaTypeChips } from "./components/MediaTypeChips";
import { ReelDownloaderForm } from "./components/ReelDownloaderForm";
import { SiteFooter } from "./components/SiteFooter";
import { TopNavBar } from "./components/TopNavBar";
import { ValueProposition } from "./components/ValueProposition";

export default function Home() {
  return (
    <>
      <TopNavBar />
      <main className="flex-1 pt-[100px] pb-xl flex flex-col items-center">
        <section className="w-full max-w-container-max mx-auto px-gutter pt-xl text-center flex flex-col items-center">
          <MediaTypeChips />
          <h1 className="text-display-xl font-extrabold text-on-surface mb-sm">
            Instagram Downloader
          </h1>
          <p className="text-body-md text-on-surface-variant mb-xl max-w-2xl mx-auto">
            The fastest way to download Instagram Photos, Videos, Reels, and
            IGTV. Secure, high-quality, and completely free.
          </p>
          <ReelDownloaderForm />
        </section>
        <ValueProposition />
        <Instructions />
      </main>
      <SiteFooter />
    </>
  );
}
