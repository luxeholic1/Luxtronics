import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, Theme } from "@/context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark",  label: "Dark",  Icon: Moon },
  { value: "system",label: "System",Icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center">
        <div className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
      </div>
    );
  }

  const CurrentIcon = resolvedTheme === "light" ? Moon : Sun;

  return (
    <div ref={ref} className="relative">
      <button
        id="theme-toggle-btn"
        aria-label="Toggle theme"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-colors",
          open ? "bg-primary/10 text-primary" : "hover:bg-secondary"
        )}
      >
        <CurrentIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-300" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-50 w-36 rounded-2xl border border-white/8 bg-[hsl(var(--popover))] shadow-2xl overflow-hidden"
            style={{ backdropFilter: "blur(14px)" }}
          >
            {options.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => { setTheme(value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                  "hover:bg-white/[0.06]",
                  theme === value
                    ? "text-primary bg-primary/10 border-l-2 border-primary"
                    : "text-[hsl(var(--foreground))]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-medium">{label}</span>
                {theme === value && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
