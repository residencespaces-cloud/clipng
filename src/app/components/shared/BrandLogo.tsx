import Link from "next/link";

const SIZES = {
  sm: { height: 28 },
  md: { height: 32 },
  lg: { height: 48 },
  xl: { height: 160 },
} as const;

export function BrandLogo({
  size = "md",
  href,
  className = "",
  /** Keep visual size but clip SVG padding so thin bars (header) stay compact */
  compact = false,
}: {
  size?: keyof typeof SIZES;
  href?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const height = SIZES[size].height;
  const clipHeight = compact ? 56 : height;
  // Square SVG has empty padding; width ≈ height, wordmark sits in the center band
  const clipWidth = compact ? Math.round(height * 0.95) : undefined;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/kudiclip.svg"
      alt="KudiClip"
      height={height}
      className={`w-auto max-w-none object-contain object-center ${className}`.trim()}
      style={{
        height,
        width: "auto",
        ...(compact
          ? { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
          : {}),
      }}
    />
  );

  const inner = compact ? (
    <span
      className="relative inline-block overflow-hidden shrink-0"
      style={{ height: clipHeight, width: clipWidth }}
    >
      {img}
    </span>
  ) : (
    img
  );

  if (href === null) return inner;
  return (
    <Link href={href ?? "/"} className="inline-flex items-center shrink-0" aria-label="KudiClip home">
      {inner}
    </Link>
  );
}
