import { cx } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

/** Shared pill-chip look for labels, counts, and other small static badges. */
export function Badge({ className, children }: BadgeProps) {
  return (
    <span className={cx("rounded-full px-2 py-0.5 text-[11px] font-medium", className)}>
      {children}
    </span>
  );
}
