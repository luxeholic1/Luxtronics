/**
 * ImageCursorCard
 * Shows a floating product-image thumbnail that follows the cursor
 * when hovering over a product card.
 *
 * Uses a single shared DOM element (created once, reused for all cards)
 * so there is zero overhead per card.
 */

import { useRef, useCallback, useEffect } from 'react';

interface Props {
  imageUrl: string;
  children: React.ReactNode;
}

// ── Singleton floating element ────────────────────────────────────────────────
let _el: HTMLDivElement | null = null;
let _img: HTMLImageElement | null = null;
let _raf = 0;
let _mouseX = 0;
let _mouseY = 0;

function ensureFloatingEl() {
  if (_el) return;

  _el = document.createElement('div');
  _el.id = 'img-cursor-float';
  _el.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:40px',
    'height:40px',
    'border-radius:6px',
    'overflow:hidden',
    'pointer-events:none',
    'z-index:2147483647',
    'opacity:0',
    'transition:opacity 0.15s ease, transform 0.15s ease',
    'transform:translate(-50%,-65%) scale(0.8)',
    'box-shadow:0 4px 16px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.12)',
    'background:#111',
    'will-change:left,top,opacity,transform',
  ].join(';');

  _img = document.createElement('img');
  _img.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:4px;display:block;';
  _el.appendChild(_img);
  document.body.appendChild(_el);

  // Single global mousemove listener — updates position for whichever card is active
  window.addEventListener('mousemove', (e) => {
    _mouseX = e.clientX;
    _mouseY = e.clientY;
    cancelAnimationFrame(_raf);
    _raf = requestAnimationFrame(() => {
      if (_el) {
        _el.style.left = `${_mouseX}px`;
        _el.style.top  = `${_mouseY}px`;
      }
    });
  }, { passive: true });
}

// ── Inject global CSS once to force cursor:none on the card and all children ──
let _cssInjected = false;
function injectCursorCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .img-cursor-zone,
    .img-cursor-zone * {
      cursor: none !important;
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImageCursorCard({ imageUrl, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Inject CSS + create floating element on first render
  useEffect(() => {
    injectCursorCSS();
    ensureFloatingEl();
  }, []);

  const handleEnter = useCallback(() => {
    ensureFloatingEl();
    if (_img) _img.src = imageUrl;
    if (_el) {
      _el.style.opacity   = '1';
      _el.style.transform = 'translate(-50%,-65%) scale(1)';
    }
  }, [imageUrl]);

  const handleLeave = useCallback(() => {
    if (_el) {
      _el.style.opacity   = '0';
      _el.style.transform = 'translate(-50%,-65%) scale(0.8)';
    }
  }, []);

  return (
    <div
      ref={ref}
      className="img-cursor-zone"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
