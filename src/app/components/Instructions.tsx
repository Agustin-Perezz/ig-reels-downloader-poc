type InstructionStep = {
  number: string;
  title: string;
  description: string;
};

const INSTRUCTION_STEPS: readonly InstructionStep[] = [
  {
    number: "1",
    title: "Copy the URL",
    description:
      'Open the Instagram app or website, find the post, click the share icon, and select "Copy Link".',
  },
  {
    number: "2",
    title: "Paste the Link",
    description:
      "Return to InstaSave, paste the copied URL into the input field at the top of the page.",
  },
  {
    number: "3",
    title: "Hit Download",
    description:
      'Click the "Download" button and your media will be processed and saved to your device immediately.',
  },
] as const;

export function Instructions() {
  return (
    <section
      id="how-to-use"
      className="w-full max-w-container-max mx-auto px-gutter mt-xl pt-xl"
    >
      <div className="text-center mb-lg">
        <h2 className="text-headline-lg font-bold text-on-surface mb-sm">
          How to download from Instagram?
        </h2>
        <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
          You must follow these three easy steps to download video, reels, and
          photo from Instagram.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {INSTRUCTION_STEPS.map((step) => (
          <div
            key={step.number}
            className="bg-surface-container border border-outline-variant rounded-xl p-lg text-center flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center text-[32px] font-bold text-primary mb-md">
              {step.number}
            </div>
            <h4 className="text-label-sm font-semibold text-on-surface mb-xs uppercase tracking-widest text-primary">
              {step.title}
            </h4>
            <p className="text-body-md text-on-surface-variant">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
