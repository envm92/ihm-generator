import { useRef, useCallback, useEffect, useState } from 'react';

const TILT = 8;
const SCALE = 1.03;
const EASE = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)';

// Typical beta when holding phone upright in portrait; ±GYRO_RANGE maps to full tilt
const BETA_NEUTRAL = 70;
const GYRO_RANGE = 30;

export default function useTilt() {
  const wrapRef = useRef(null);
  const glareRef = useRef(null);
  const rafRef = useRef(null);
  const [gyroState, setGyroState] = useState('idle'); // idle | needs-permission | active | unavailable

  const applyTilt = useCallback((x, y) => {
    const el = wrapRef.current;
    const glare = glareRef.current;
    if (!el) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
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

  const reset = useCallback(() => {
    const el = wrapRef.current;
    const glare = glareRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = `transform 400ms ${EASE}`;
    if (glare) glare.style.opacity = '0';
  }, []);

  // Mouse (desktop)
  const onMove = useCallback((e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    applyTilt(x, y);
  }, [applyTilt]);

  const onLeave = useCallback(() => reset(), [reset]);

  // Gyroscope
  const handleOrientation = useCallback((e) => {
    const gamma = e.gamma ?? 0; // left/right: -90 to 90
    const beta  = e.beta  ?? 0; // front/back: -180 to 180
    const x = Math.max(-0.5, Math.min(0.5, gamma / (GYRO_RANGE * 2)));
    const y = Math.max(-0.5, Math.min(0.5, (beta - BETA_NEUTRAL) / (GYRO_RANGE * 2)));
    applyTilt(x, y);
  }, [applyTilt]);

  // Called from a button tap on iOS (must be inside a user gesture)
  const startGyro = useCallback(async () => {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation);
        setGyroState('active');
      } else {
        setGyroState('unavailable');
      }
    } catch {
      setGyroState('unavailable');
    }
  }, [handleOrientation]);

  // Auto-start on mobile devices that don't need permission (Android)
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile) return;

    if (typeof DeviceOrientationEvent === 'undefined') {
      setGyroState('unavailable');
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ — needs explicit user gesture before we can listen
      setGyroState('needs-permission');
    } else {
      // Android / desktop with gyro — start immediately
      window.addEventListener('deviceorientation', handleOrientation);
      setGyroState('active');
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [handleOrientation]);

  return { wrapRef, glareRef, onMove, onLeave, gyroState, startGyro };
}
