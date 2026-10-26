import Image from "next/image";

interface ScreenshotProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}

/** Product screenshot captured at 1440×900. */
export function Screenshot({ src, alt, caption, priority }: ScreenshotProps) {
  return (
    <figure>
      <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
        <Image src={src} alt={alt} width={1440} height={900} priority={priority} className="h-auto w-full" />
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
