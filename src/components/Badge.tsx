import { cx } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

/** Shared pill-chip shape for labels, counts, and other small static badges. */
export function Badge({ className, children }: BadgeProps) {
  return <span className={cx("rounded-full font-medium", className)}>{children}</span>;
}
