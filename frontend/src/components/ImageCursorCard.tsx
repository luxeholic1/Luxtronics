/**
 * ImageCursorCard
 * Shows a category-specific emoji icon as cursor when hovering over a product card.
 * Phone → 📱, Watch → ⌚, Headphones → 🎧, Camera → 📷, Laptop → 💻, etc.
 */

import { useRef, useCallback, useEffect } from 'react';

interface Props {
  imageUrl?: string;
  category?: string;   // product category name
  children: React.ReactNode;
}

// ── Category → Emoji map ──────────────────────────────────────────────────────
function getCategoryEmoji(category = ''): string {
  const c = category.toLowerCase();

  if (/phone|mobile|iphone|samsung|android|smartphone/.test(c)) return '📱';
  if (/watch|wearable|smartwatch|band|fitness/.test(c))          return '⌚';
  if (/headphone|earphone|earbuds|audio|speaker|sound/.test(c))  return '🎧';
  if (/camera|photo|lens|dslr|mirrorless/.test(c))               return '📷';
  if (/laptop|macbook|notebook|computer|pc/.test(c))             return '💻';
  if (/tablet|ipad/.test(c))                                     return '📟';
  if (/gaming|controller|console|xbox|playstation/.test(c))      return '🎮';
  if (/tv|television|monitor|display|screen/.test(c))            return '🖥️';
  if (/keyboard|mouse|accessory|accessories/.test(c))            return '⌨️';
  if (/charger|cable|power|battery/.test(c))                     return '🔋';
  if (/drone|robot/.test(c))                                     return '🚁';
  if (/bag|backpack|case|cover/.test(c))                         return '🎒';

  return '🛍️'; // default
}

// ── Singleton floating element ────────────────────────────────────────────────
let _el: HTMLDivElement | null = null;
let _raf = 0;

function ensureFloatingEl() {
  if (_el) return;

  _el = document.createElement('div');
  _el.id = 'cat-cursor-float';
  _el.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:56px',
    'height:56px',
    'border-radius:14px',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'font-size:28px',
    'line-height:1',
    'pointer-events:none',
    'z-index:2147483647',
    'opacity:0',
    'transition:opacity 0.15s ease, transform 0.15s ease',
    'transform:translate(-50%,-65%) scale(0.8)',
    'background:linear-gradient(135deg,#f97316,#ec4899)',
    'box-shadow:0 8px 24px rgba(249,115,22,0.45)',
    'will-change:left,top,opacity,transform',
    'user-select:none',
  ].join(';');

  document.body.appendChild(_el);

  window.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(_raf);
    _raf = requestAnimationFrame(() => {
      if (_el) {
        _el.style.left = `${e.clientX}px`;
        _el.style.top  = `${e.clientY}px`;
      }
    });
  }, { passive: true });
}

// ── Inject cursor:none CSS once ───────────────────────────────────────────────
let _cssInjected = false;
function injectCursorCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .cat-cursor-zone,
    .cat-cursor-zone * {
      cursor: none !important;
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImageCursorCard({ category, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectCursorCSS();
    ensureFloatingEl();
  }, []);

  const handleEnter = useCallback(() => {
    ensureFloatingEl();
    if (_el) {
      _el.textContent    = getCategoryEmoji(category);
      _el.style.opacity  = '1';
      _el.style.transform = 'translate(-50%,-65%) scale(1)';
    }
  }, [category]);

  const handleLeave = useCallback(() => {
    if (_el) {
      _el.style.opacity   = '0';
      _el.style.transform = 'translate(-50%,-65%) scale(0.8)';
    }
  }, []);

  return (
    <div
      ref={ref}
      className="cat-cursor-zone"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
