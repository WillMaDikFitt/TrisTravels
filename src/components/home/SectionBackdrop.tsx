import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  image: string;
  /** cream = light editorial band; sage = deeper green wash */
  tone?: "cream" | "sage";
  className?: string;
};

export function SectionBackdrop({ image, tone = "cream", className }: Props) {
  if (!image) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <Image
        src={image}
        alt=""
        fill
        className="object-cover scale-105"
        sizes="100vw"
        quality={75}
      />
      {tone === "cream" ? (
        <>
          <div className="absolute inset-0 bg-[#e8ebdd]/88" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(54,64,55,0.22) 0%, transparent 42%), linear-gradient(300deg, rgba(122,163,90,0.28) 0%, transparent 38%), radial-gradient(ellipse 90% 70% at 50% 100%, rgba(54,64,55,0.12), transparent 55%)",
            }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#364037]/72" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(122,163,90,0.35) 0%, transparent 45%), radial-gradient(ellipse 80% 60% at 100% 0%, rgba(232,235,221,0.15), transparent 50%)",
            }}
          />
        </>
      )}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(54,64,55,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(54,64,55,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
}
