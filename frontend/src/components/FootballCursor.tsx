import { useEffect, useRef } from "react";

const FOOTBALL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#111111" stroke-width="2"/>
  <g fill="#111111">
    <polygon points="32,14 39,19.5 36.5,28 27.5,28 25,19.5"/>
    <polygon points="14,30 21,25 27.5,28 25,37 16.5,37.5"/>
    <polygon points="50,30 43,25 36.5,28 39,37 47.5,37.5"/>
    <polygon points="32,50 25,44.5 27.5,37 36.5,37 39,44.5"/>
  </g>
  <g fill="none" stroke="#111111" stroke-width="1.4">
    <path d="M32 14 L32 4"/>
    <path d="M14 30 L5 27"/>
    <path d="M50 30 L59 27"/>
    <path d="M16.5 37.5 L9 45"/>
    <path d="M47.5 37.5 L55 45"/>
    <path d="M25 44.5 L23 58"/>
    <path d="M39 44.5 L41 58"/>
  </g>
</svg>
`.trim();

/**
 * Site-wide football cursor. Renders a floating, fixed-position SVG (vector —
 * always crisp regardless of display density) that tracks the mouse and
 * replaces the native pointer. Skipped on touch devices, which have no cursor.
 */
const FootballCursor = () => {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const el = document.createElement("div");
    el.innerHTML = FOOTBALL_SVG;
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 28px;
      height: 28px;
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-50%, -50%);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      will-change: transform;
    `;
    document.body.appendChild(el);
    elRef.current = el;
    document.body.style.cursor = "none";

    const handleMove = (e: MouseEvent) => {
      el.style.transform = `translate(-50%, -50%) translate(${e.clientX}px, ${e.clientY}px)`;
    };
    const handleLeave = () => {
      el.style.opacity = "0";
    };
    const handleEnter = () => {
      el.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    document.documentElement.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.documentElement.removeEventListener("mouseenter", handleEnter);
      document.body.style.cursor = "";
      el.remove();
    };
  }, []);

  return null;
};

export default FootballCursor;
