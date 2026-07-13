import { Sparkles, Zap } from "lucide-react";

type ValueCard = {
  icon: typeof Zap;
  title: string;
  description: string;
  glowColor: string;
  glowPosition: string;
};

const VALUE_CARDS: readonly ValueCard[] = [
  {
    icon: Zap,
    title: "Fast & Secure",
    description:
      "Our advanced infrastructure ensures your media is processed instantly. No logs, no tracking, pure privacy.",
    glowColor: "bg-primary/10 group-hover:bg-primary/20",
    glowPosition: "-right-10 -top-10",
  },
  {
    icon: Sparkles,
    title: "Original Quality",
    description:
      "Download photos and videos in their original resolution. We preserve the source file metadata and clarity perfectly.",
    glowColor: "bg-secondary/10 group-hover:bg-secondary/20",
    glowPosition: "-left-10 -bottom-10",
  },
] as const;

export function ValueProposition() {
  return (
    <section
      id="features"
      className="w-full max-w-container-max mx-auto px-gutter mt-xl pt-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {VALUE_CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-surface-container border border-outline-variant rounded-xl p-xl flex flex-col justify-center relative overflow-hidden group"
          >
            <div
              className={`absolute ${card.glowPosition} w-40 h-40 ${card.glowColor} rounded-full blur-3xl transition-all duration-500`}
            />
            <card.icon
              className="text-primary mb-md"
              style={{ width: "60px", height: "60px" }}
            />
            <h3 className="text-headline-lg-mobile font-bold text-on-surface mb-xs">
              {card.title}
            </h3>
            <p className="text-body-md text-on-surface-variant">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
