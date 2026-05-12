import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  type?: "card" | "list" | "hero" | "text";
  count?: number;
  className?: string;
}

const LoadingSkeleton = ({ type = "card", count = 1, className }: LoadingSkeletonProps) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5", className)}>
        {skeletons.map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-gradient-card border border-border p-5 animate-pulse"
          >
            <div className="aspect-square rounded-xl bg-secondary/40 mb-4 skeleton" />
            <div className="space-y-3">
              <div className="h-3 w-1/4 rounded-full bg-secondary/40 skeleton" />
              <div className="h-4 w-3/4 rounded-full bg-secondary/40 skeleton" />
              <div className="h-3 w-1/2 rounded-full bg-secondary/40 skeleton" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-16 rounded-full bg-secondary/40 skeleton" />
                <div className="h-8 w-8 rounded-full bg-secondary/40 skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {skeletons.map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-card border border-border animate-pulse">
            <div className="h-16 w-16 rounded-lg bg-secondary/40 skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-secondary/40 skeleton" />
              <div className="h-3 w-1/2 rounded-full bg-secondary/40 skeleton" />
            </div>
            <div className="h-6 w-20 rounded-full bg-secondary/40 skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "hero") {
    return (
      <div className={cn("container py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-0", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="h-4 w-32 rounded-full bg-secondary/40 skeleton" />
            <div className="space-y-4">
              <div className="h-12 w-3/4 rounded-2xl bg-secondary/40 skeleton" />
              <div className="h-12 w-2/3 rounded-2xl bg-secondary/40 skeleton" />
            </div>
            <div className="h-5 w-full rounded-full bg-secondary/40 skeleton" />
            <div className="h-5 w-4/5 rounded-full bg-secondary/40 skeleton" />
            <div className="flex gap-4 pt-4">
              <div className="h-10 w-32 rounded-full bg-secondary/40 skeleton" />
              <div className="h-10 w-40 rounded-full bg-secondary/40 skeleton" />
            </div>
          </div>
          <div className="h-[400px] md:h-[500px] rounded-3xl bg-secondary/40 skeleton" />
        </div>
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={cn("space-y-3", className)}>
        {skeletons.map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-secondary/40 skeleton",
              i % 3 === 0 ? "h-3 w-full" : i % 3 === 1 ? "h-3 w-4/5" : "h-3 w-2/3"
            )}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;