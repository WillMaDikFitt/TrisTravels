import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fills a photo slot (absolute, inset-0) until a photo is uploaded in Studio. */
export function PhotoPlaceholder({
  className,
  iconSize = 32,
}: {
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-surface-container text-on-surface-variant/40",
        className,
      )}
      aria-hidden
    >
      <ImageIcon size={iconSize} strokeWidth={1.25} />
    </div>
  );
}
