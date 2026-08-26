import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = { className?: string; priority?: boolean };

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <span className={cn("relative block h-7 w-32", className)}>
      <Image
        src="/brand/wordmark-dark.png"
        alt="ANDRÉ OS"
        fill
        priority={priority}
        sizes="128px"
        className="object-contain object-left dark:hidden"
      />
      <Image
        src="/brand/wordmark-light.png"
        alt="ANDRÉ OS"
        fill
        priority={priority}
        sizes="128px"
        className="hidden object-contain object-left dark:block"
      />
    </span>
  );
}
