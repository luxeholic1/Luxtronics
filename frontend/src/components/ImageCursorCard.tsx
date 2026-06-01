/**
 * ImageCursorCard
 *
 * Shows the product's actual image as a floating cursor thumbnail when hovering.
 * Falls back to a category emoji if no image is provided.
 *
 * Desktop only — on touch devices the cursor element is never shown.
 */

import { useRef, useCallback, useEffect } from 'react';

interface Props {
  imageUrl?: string;
  category?: string;
  children: React.ReactNode;
}

// ── Category → Emoji fallback ─────────────────────────────────────────────────
function getCategoryEmoji(category = '', productName = ''): string {
  const text = `${category} ${productName}`.toLowerCase();

  if (/phone|mobile|iphone|samsung|galaxy|android|smartphone|redmi|poco|realme|vivo|oppo|oneplus|pixel|nokia|motorola|moto/.test(text)) return '📱';
  if (/watch|wearable|smartwatch|band|fitness|fitbit|garmin/.test(text))  return '⌚';
  if (/headphone|earphone|earbud|airpod|audio|speaker|sound|jbl|bose|sony wh|sony wf|boat|noise|sennheiser/.test(text)) return '🎧';
  if (/camera|photo|lens|dslr|mirrorless|gopro|dji|canon|nikon|fuji/.test(text)) return '📷';
  if (/laptop|macbook|notebook|chromebook|thinkpad|zenbook|vivobook|ideapad|spectre|xps/.test(text)) return '💻';
  if (/tablet|ipad|tab /.test(text))                                      return '📱';
  if (/gaming|controller|console|xbox|playstation|ps5|nintendo|gamepad/.test(text)) return '🎮';
  if (/tv|television|monitor|display|screen|oled|qled/.test(text))        return '📺';
  if (/keyboard|mouse|trackpad/.test(text))                               return '⌨️';
  if (/charger|cable|power bank|battery|adapter/.test(text))              return '🔋';
  if (/drone|robot/.test(text))                                           return '🚁';
  if (/bag|backpack|case|cover|sleeve/.test(text))                        return '🎒';
  if (/smart home|alexa|echo|nest|bulb|plug/.test(text))                  return '🏠';

  return '⚡';
}

// ── Singleton floating element ────────────────────────────────────────────────
let _el: HTMLDivElement | null = null;
let _img: HTMLImageElement | null = null;
let _emoji: HTMLSpanElement | null = null;
let _raf = 0;
let _isTouch = false;

function ensureFloatingEl() {
  if (_el) return;

  // Don't create on touch devices
  if (typeof window !== 'undefined') {
    _isTouch = window.matchMedia('(hover: none)').matches;
    if (_isTouch) return;
  }

  _el = document.createElement('div');
  _el.id = 'product-cursor-float';

  // Outer container
  Object.assign(_el.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '54px',
    height: '54px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: '2147483647',
    opacity: '0',
    transition: 'opacity 0.16s ease, transform 0.16s cubic-bezier(0.34,1.56,0.64,1)',
    transform: 'translate(14px, -120%) scale(0.86)',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 10px 26px rgba(0,0,0,0.16), 0 0 0 1px rgba(37,99,235,0.24)',
    willChange: 'left,top,opacity,transform',
    userSelect: 'none',
    overflow: 'hidden',
  });

  // Product image
  _img = document.createElement('img');
  Object.assign(_img.style, {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    padding: '0',
    display: 'none',
  });
  _el.appendChild(_img);

  // Emoji fallback
  _emoji = document.createElement('span');
  Object.assign(_emoji.style, {
    fontSize: '24px',
    lineHeight: '1',
    display: 'none',
  });
  _el.appendChild(_emoji);

  // Orange dot indicator at bottom-right
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#111827,#2563eb)',
    boxShadow: '0 0 6px rgba(37,99,235,0.45)',
  });
  _el.appendChild(dot);

  document.body.appendChild(_el);

  // Track mouse position
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
      cursor: pointer !important;
    }
    @media (hover: none) {
      .cat-cursor-zone,
      .cat-cursor-zone * {
        cursor: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImageCursorCard({ imageUrl, category, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectCursorCSS();
    ensureFloatingEl();
  }, []);

  const handleEnter = useCallback(() => {
    if (_isTouch) return;
    ensureFloatingEl();
    if (!_el || !_img || !_emoji) return;

    if (imageUrl) {
      // Show product image
      _img.src = imageUrl;
      _img.style.display = 'block';
      _emoji.style.display = 'none';
    } else {
      // Show emoji fallback
      _emoji.textContent = getCategoryEmoji(category);
      _emoji.style.display = 'block';
      _img.style.display = 'none';
    }

    _el.style.opacity = '1';
    _el.style.transform = 'translate(14px, -120%) scale(1)';
  }, [imageUrl, category]);

  const handleLeave = useCallback(() => {
    if (!_el) return;
    _el.style.opacity = '0';
    _el.style.transform = 'translate(14px, -120%) scale(0.86)';
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
