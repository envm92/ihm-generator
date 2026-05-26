import { useRef, useCallback } from 'react';

const TILT = 8;    // max degrees
const SCALE = 1.03;
const EASE = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)';

export default function useTilt() {
  const wrapRef = useRef(null);
  const glareRef = useRef(null);
  const rafRef = useRef(null);

  const onMove = useCallback((e) => {
    const el = wrapRef.current;
    const glare = glareRef.current;
    if (!el) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 → 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      el.style.transform = `perspective(900px) rotateY(${(x * TILT).toFixed(2)}deg) rotateX(${(-y * TILT).toFixed(2)}deg) scale3d(${SCALE},${SCALE},${SCALE})`;
      el.style.transition = 'transform 100ms ' + EASE;

      if (glare) {
        const hue = Math.round((x + 0.5) * 360);
        const angle = Math.round(x * 180 + 90);
        glare.style.background = `
          linear-gradient(
            ${angle}deg,
            hsl(${hue}deg,100%,65%) 0%,
            hsl(${(hue+45)%360}deg,100%,65%) 18%,
            hsl(${(hue+90)%360}deg,100%,65%) 36%,
            hsl(${(hue+135)%360}deg,100%,65%) 54%,
            hsl(${(hue+180)%360}deg,100%,65%) 72%,
            hsl(${(hue+270)%360}deg,100%,65%) 100%
          )
        `;
        glare.style.opacity = '0.55';
      }
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = wrapRef.current;
    const glare = glareRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = `transform 400ms ${EASE}`;
    if (glare) glare.style.opacity = '0';
  }, []);

  return { wrapRef, glareRef, onMove, onLeave };
}
