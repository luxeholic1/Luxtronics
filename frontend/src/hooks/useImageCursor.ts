/**
 * useImageCursor
 * Changes the cursor to a product image when hovering over a product card.
 * Uses a floating <img> element that follows the mouse — CSS cursor: url()
 * has a 128px size limit and can't load remote URLs in most browsers,
 * so the floating-element approach is the only reliable cross-browser solution.
 */

import { useEffect, useRef, useCallback } from 'react';

export function useImageCursor(imageUrl: string | null) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rafRef    = useRef<number>(0);
  const activeRef = useRef(false);

  // Create the floating cursor element once
  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 80px; height: 80px;
      border-radius: 12px;
      overflow: hidden;
      pointer-events: none;
      z-index: 99999;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.85);
      transition: opacity 0.18s ease, transform 0.18s ease;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      border: 2px solid rgba(255,255,255,0.25);
      background: #111;
    `;

    const img = document.createElement('img');
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
    el.appendChild(img);
    document.body.appendChild(el);
    cursorRef.current = el;

    return () => {
      document.body.removeChild(el);
    };
  }, []);

  // Update image src whenever imageUrl changes
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const img = el.querySelector('img');
    if (img && imageUrl) img.src = imageUrl;
  }, [imageUrl]);

  const show = useCallback(() => {
    const el = cursorRef.current;
    if (!el || !imageUrl) return;
    activeRef.current = true;
    document.body.style.cursor = 'none';
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1)';
  }, [imageUrl]);

  const hide = useCallback(() => {
    const el = cursorRef.current;
    if (!el) return;
    activeRef.current = false;
    document.body.style.cursor = '';
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%, -50%) scale(0.85)';
  }, []);

  const move = useCallback((e: MouseEvent) => {
    if (!activeRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cursorRef.current;
      if (el) {
        el.style.left = `${e.clientX}px`;
        el.style.top  = `${e.clientY}px`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(rafRef.current);
      hide();
    };
  }, [move, hide]);

  return { show, hide };
}
