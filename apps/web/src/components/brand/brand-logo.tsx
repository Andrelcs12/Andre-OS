import { cn } from "@/lib/utils";

type BrandLogoProps = { className?: string };

/** Temporary typographic mark. Replace with the final SVG identity when available. */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={cn("text-sm font-bold tracking-[-0.04em]", className)}>
      ANDRÉ <span className="text-primary">OS</span>
    </span>
  );
}
