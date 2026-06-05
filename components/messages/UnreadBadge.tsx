import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export default function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-sky-500 px-1.5 text-xs font-bold text-white",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
