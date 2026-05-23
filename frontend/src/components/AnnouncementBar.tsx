/**
 * AnnouncementBar
 * Scrolling promo ticker at the very top of every page.
 * Like Amazon/Flipkart's top banner — shows deals, free shipping, etc.
 */

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const ANNOUNCEMENTS = [
  { text: "🚚 Free Shipping on orders above ₹200",          link: "/shop" },
  { text: "🔥 Up to 40% OFF on Premium Electronics",        link: "/shop" },
  { text: "⌚ New Wearables Collection — Shop Now",          link: "/shop?cat=wearables" },
  { text: "📱 Latest Smartphones at Unbeatable Prices",     link: "/shop?cat=smart-phone" },
  { text: "🎧 Premium Audio — Free Delivery Across India",  link: "/shop?cat=audio" },
  { text: "🛡️ 2-Year Warranty + 30-Day Easy Returns",       link: "/shipping-returns" },
  { text: "🌏 Now Shipping to Australia & New Zealand",     link: "/about" },
];

const STORAGE_KEY = "lux_announcement_dismissed";

export default function AnnouncementBar() {
  const [visible, setVisible]   = useState(true);
  const [current, setCurrent]   = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check if user dismissed it this session
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) setVisible(false);
  }, []);

  // Auto-rotate every 3.5 seconds
  useEffect(() => {
    if (!visible) return;
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % ANNOUNCEMENTS.length);
    }, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const item = ANNOUNCEMENTS[current];

  return (
    <div className="relative z-[60] w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient text-primary-foreground text-xs sm:text-sm font-medium">
      <div className="flex items-center justify-center gap-3 px-10 py-2 sm:py-2.5 text-center">
        <Link
          to={item.link}
          className="hover:underline underline-offset-2 transition-all truncate max-w-[80vw]"
          key={current}
        >
          {item.text}
        </Link>

        {/* Dot indicators */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {ANNOUNCEMENTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Announcement ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
