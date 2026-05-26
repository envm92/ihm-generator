// Hook que aplica efecto de inclinación 3D a la tarjeta usando mouse (escritorio) o giroscopio (móvil)
import { useRef, useCallback, useEffect, useState } from 'react';

// Grados de inclinación máxima según dispositivo
const TILT = 8;
const SCALE = 1.03;
const TILT_MOBILE = 20;
const SCALE_MOBILE = 1.08;
const EASE = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)';

// Ángulo beta típico al sostener el teléfono en vertical; ±GYRO_RANGE mapea al tilt completo
const BETA_NEUTRAL = 70;
const GYRO_RANGE = 30;

export default function useTilt() {
  const wrapRef = useRef(null);    // Referencia al contenedor de la tarjeta
  const glareRef = useRef(null);   // Referencia a la capa de brillo holográfico
  const rafRef = useRef(null);     // ID del requestAnimationFrame activo para cancelarlo si llega otro evento
  const isMobileRef = useRef(false);
  // idle | needs-permission | active | unavailable
  const [gyroState, setGyroState] = useState('idle');

  // Aplica la transformación 3D y actualiza el brillo holográfico según la posición normalizada (x, y) en [-0.5, 0.5]
  const applyTilt = useCallback((x, y) => {
    const el = wrapRef.current;
    const glare = glareRef.current;
    if (!el) return;

    const mobile = isMobileRef.current;
    const tilt = mobile ? TILT_MOBILE : TILT;
    const scale = mobile ? SCALE_MOBILE : SCALE;
    const shadowMult = mobile ? 70 : 40;
    const glareOpacity = mobile ? 0.75 : 0.55;

    // Cancela el frame anterior para no acumular actualizaciones
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateY(${(x * tilt).toFixed(2)}deg) rotateX(${(-y * tilt).toFixed(2)}deg) scale3d(${scale},${scale},${scale})`;
      // La sombra sigue la dirección del tilt; el offset Y base mantiene una sombra de elevación en reposo
      const sx = (x * shadowMult).toFixed(1);
      const sy = (-y * (shadowMult * 0.5) + 22).toFixed(1);
      el.style.boxShadow = `${sx}px ${sy}px 60px rgba(42,26,6,0.52)`;
      el.style.transition = `transform 100ms ${EASE}, box-shadow 100ms ${EASE}`;

      if (glare) {
        // El matiz del gradiente rota con la posición horizontal para efecto arcoíris
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
        glare.style.opacity = String(glareOpacity);
      }
    });
  }, []);

  // Restaura la tarjeta a su posición neutral con una transición suave
  const reset = useCallback(() => {
    const el = wrapRef.current;
    const glare = glareRef.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
    el.style.transition = `transform 400ms ${EASE}, box-shadow 400ms ${EASE}`;
    if (glare) glare.style.opacity = '0';
  }, []);

  // Manejador de movimiento de mouse en escritorio: convierte posición del cursor a rango [-0.5, 0.5]
  const onMove = useCallback((e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    applyTilt(x, y);
  }, [applyTilt]);

  const onLeave = useCallback(() => reset(), [reset]);

  // Convierte los ángulos del giroscopio (gamma/beta) a valores normalizados para applyTilt
  const handleOrientation = useCallback((e) => {
    const gamma = e.gamma ?? 0; // Izquierda/derecha: -90 a 90
    const beta  = e.beta  ?? 0; // Adelante/atrás: -180 a 180
    const x = Math.max(-0.5, Math.min(0.5, gamma / (GYRO_RANGE * 2)));
    const y = Math.max(-0.5, Math.min(0.5, (beta - BETA_NEUTRAL) / (GYRO_RANGE * 2)));
    applyTilt(x, y);
  }, [applyTilt]);

  // Se llama desde el botón de la UI en iOS — debe ejecutarse dentro de un gesto del usuario
  const startGyro = useCallback(async () => {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === 'granted') {
        isMobileRef.current = true;
        window.addEventListener('deviceorientation', handleOrientation);
        setGyroState('active');
      } else {
        setGyroState('unavailable');
      }
    } catch {
      setGyroState('unavailable');
    }
  }, [handleOrientation]);

  // Inicia el giroscopio automáticamente en Android (no requiere permiso explícito)
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile) return;

    if (typeof DeviceOrientationEvent === 'undefined') {
      setGyroState('unavailable');
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ — requiere gesto explícito del usuario antes de escuchar el sensor
      setGyroState('needs-permission');
    } else {
      // Android / escritorio con giroscopio — se inicia de inmediato
      isMobileRef.current = true;
      window.addEventListener('deviceorientation', handleOrientation);
      setGyroState('active');
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [handleOrientation]);

  return { wrapRef, glareRef, onMove, onLeave, gyroState, startGyro };
}
