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
  const clipHeight = compact ? 44 : height;
  const clipWidth = compact ? Math.min(Math.round(height * 0.72), 128) : undefined;

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/kudiclip.svg"
      alt="KudiClip"
      height={height}
      className={`w-auto object-contain object-center ${compact ? "max-w-none" : "max-w-full"} ${className}`.trim()}
      style={{
        height: compact ? height : undefined,
        maxHeight: height,
        width: "auto",
        ...(compact
          ? { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
          : {}),
      }}
    />
  );

  const inner = compact ? (
    <span
      className="relative inline-block overflow-hidden shrink-0 max-w-[40vw] sm:max-w-none"
      style={{ height: clipHeight, width: clipWidth }}
    >
      {img}
    </span>
  ) : (
    <span className="inline-flex items-center max-w-[min(100%,220px)] sm:max-w-none overflow-hidden">
      {img}
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href ?? "/"} className="inline-flex items-center shrink-0 min-w-0" aria-label="KudiClip home">
      {inner}
    </Link>
  );
}
