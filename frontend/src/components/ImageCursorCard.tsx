/**
 * ImageCursorCard
 * Wraps a product card and shows the product image as the cursor on hover.
 * Drop-in replacement — just wrap <ProductCard> with this.
 */

import { useRef, useState, useCallback } from 'react';

interface Props {
  imageUrl: string;
  children: React.ReactNode;
}

// Single shared floating cursor element (created once, reused for all cards)
let floatingEl: HTMLDivElement | null = null;
let floatingImg: HTMLImageElement | null = null;
let rafId = 0;

function getFloatingEl() {
  if (floatingEl) return { el: floatingEl, img: floatingImg! };

  const el = document.createElement('div');
  el.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 88px; height: 88px;
    border-radius: 14px;
    overflow: hidden;
    pointer-events: none;
    z-index: 99999;
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.8);
    transition: opacity 0.15s ease, transform 0.15s ease;
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.15);
    background: #0a0a0a;
    will-change: transform, left, top;
  `;

  const img = document.createElement('img');
  img.style.cssText = 'width:100%;height:100%;object-fit:contain;padding:6px;';
  el.appendChild(img);
  document.body.appendChild(el);

  floatingEl  = el;
  floatingImg = img;

  // Track mouse globally
  window.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      if (floatingEl) {
        floatingEl.style.left = `${e.clientX}px`;
        floatingEl.style.top  = `${e.clientY}px`;
      }
    });
  }, { passive: true });

  return { el, img };
}

export default function ImageCursorCard({ imageUrl, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => {
    const { el, img } = getFloatingEl();
    img.src = imageUrl;
    el.style.opacity   = '1';
    el.style.transform = 'translate(-50%, -60%) scale(1)';
    if (containerRef.current) {
      containerRef.current.style.cursor = 'none';
    }
  }, [imageUrl]);

  const handleLeave = useCallback(() => {
    const { el } = getFloatingEl();
    el.style.opacity   = '0';
    el.style.transform = 'translate(-50%, -60%) scale(0.8)';
    if (containerRef.current) {
      containerRef.current.style.cursor = '';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
