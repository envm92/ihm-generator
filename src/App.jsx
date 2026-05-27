// Componente raíz de la aplicación — orquesta el estado global y renderiza los paneles principales
import { useState, useRef, useCallback, useEffect } from 'react';

import useTilt from './hooks/useTilt';
import IdCard from './components/IdCard';
import IdForm from './components/IdForm';
import StoryFrame from './components/StoryFrame';
import { generateAll } from './utils/generators';
import { captureCard, captureStory, triggerDownload } from './utils/export';
import './App.css';

// SVGs importados como texto crudo para manipularlos antes de inyectarlos al DOM
import logoRaw from './assets/credencial/logo-ihm.svg?raw';
import siluetaRaw from './assets/credencial/mango-pattern-silueta.svg?raw';

// Se quita el grupo con baja opacidad para que las formas sean completamente opacas al usarse como máscara CSS
const siluetaMaskSvg = siluetaRaw.replace(/opacity="0\.18"/, 'opacity="1"');
const SILUETA_MASK_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(siluetaMaskSvg)}`;

// Dimensiones reales de la credencial en píxeles (sin escalar)
const CARD_W = 900;
const CARD_H = 560;

// Avatar predeterminado que se muestra al cargar la app por primera vez
const DEFAULT_AVATAR = {
  head: 'classic',
  expression: 'asombro',
  shirt: 'hawaiana-flores',
  accessories: { audifonos: false, lentes: false },
};

// Genera el estado inicial con datos aleatorios para que la credencial no aparezca vacía
function buildInitialState() {
  const gen = generateAll('MANGO', 'HABITANTE', 'H');
  return {
    nombre: '',
    apellido: '',
    plataforma: 'SPOTIFY',
    fiel: false,
    avatar: DEFAULT_AVATAR,
    ...gen,
  };
}

export default function App() {
  // Estado principal del formulario y la credencial
  const [state, setState] = useState(buildInitialState);
  // 'card' | 'story' | null — indica qué descarga está en curso (muestra overlay + deshabilita botones)
  const [downloadAnim, setDownloadAnim] = useState(null);
  // Escala dinámica de la tarjeta según el ancho disponible del contenedor
  const [cardScale, setCardScale] = useState(0.68);

  const { wrapRef, glareRef, onMove, onLeave, gyroState, startGyro } = useTilt();

  // Referencias al DOM: cardRef es la vista, cardExportRef y storyRef son los elementos ocultos para exportar
  const cardRef = useRef(null);
  const cardExportRef = useRef(null);
  const storyRef = useRef(null);
  const previewRef = useRef(null);

  // Referencias para el efecto holo autónomo del overlay de descarga
  const dlWrapRef = useRef(null);
  const dlGlareRef = useRef(null);

  // Ajusta la escala de la tarjeta cada vez que cambia el ancho del panel de vista previa
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      // Se resta 32px de padding y se limita a 82% del ancho para evitar que ocupe todo el espacio
      const available = entry.contentRect.width - 32;
      setCardScale(Math.min(available / CARD_W, 0.82));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Loop RAF autónomo de tilt holográfico — oscilación Lissajous mientras el overlay muestra 'done'
  useEffect(() => {
    if (downloadAnim !== 'done') return;
    let frame;
    let t = 0;
    const tick = () => {
      t += 0.008;
      // Lissajous: frecuencias distintas para que el trazo no se repita de inmediato
      const x = Math.sin(t * 1.7) * 0.38;
      const y = Math.sin(t) * 0.28;
      const el = dlWrapRef.current;
      const glare = dlGlareRef.current;
      if (el) {
        el.style.transform = `perspective(900px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) scale3d(1.03,1.03,1.03)`;
        el.style.boxShadow = `${(x * 20).toFixed(1)}px ${(-y * 10 + 18).toFixed(1)}px 55px rgba(42,26,6,0.50)`;
      }
      if (glare) {
        const hue = Math.round((x + 0.5) * 360);
        const ang = Math.round(x * 180 + 90);
        glare.style.background = `linear-gradient(${ang}deg,hsl(${hue},100%,65%) 0%,hsl(${(hue+60)%360},100%,65%) 25%,hsl(${(hue+120)%360},100%,65%) 50%,hsl(${(hue+180)%360},100%,65%) 75%,hsl(${(hue+240)%360},100%,65%) 100%)`;
        glare.style.opacity = '0.50';
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [downloadAnim]);

  // Regenera CURP, folio, sección y nivel de jugo con el nombre/apellido actuales
  const handleGenerate = useCallback(() => {
    const gen = generateAll(state.nombre, state.apellido);
    setState(s => ({ ...s, ...gen }));
  }, [state.nombre, state.apellido]);

  // Reemplaza el estado completo con el objeto enviado desde IdForm
  const handleChange = useCallback((next) => setState(next), []);

  // Muestra el overlay animado, captura la credencial en paralelo; al terminar ambos muestra el estado 'done'
  const handleDownloadCard = async () => {
    setDownloadAnim('card');
    const minWait = new Promise(r => setTimeout(r, 950));
    try {
      const canvas = await captureCard(cardExportRef);
      await minWait;
      triggerDownload(canvas, `${state.nombre || 'habitante'}-credencial.png`);
      setDownloadAnim('done');
    } catch {
      setDownloadAnim(null);
    }
  };

  // Muestra el overlay animado, captura el story en paralelo; al terminar ambos muestra el estado 'done'
  const handleDownloadStory = async () => {
    setDownloadAnim('story');
    const minWait = new Promise(r => setTimeout(r, 950));
    try {
      const canvas = await captureStory(storyRef);
      await minWait;
      triggerDownload(canvas, `${state.nombre || 'habitante'}-story.png`);
      setDownloadAnim('done');
    } catch {
      setDownloadAnim(null);
    }
  };

  // Datos normalizados que se pasan a IdCard; usa textos de respaldo si los campos están vacíos
  const cardData = {
    nombre: state.nombre || 'NOMBRE COMPLETO',
    apellido: state.apellido || 'APELLIDO',
    plataforma: state.plataforma,
    curp: state.curp,
    folio: state.folio,
    seccion: state.seccion,
    jugoso: state.jugoso,
    fiel: state.fiel,
  };

  // 28px = --ihm-r-xl; se escala para que el radio del brillo coincida con las esquinas visuales de la tarjeta
  const cardBr = Math.round(28 * cardScale);

  return (
    <div className="app">
      {/* Encabezado con logo y título de la herramienta */}
      <header className="app-header ihm-bg-halftone">
        <div className="app-header-inner">
          <div className="header-logo" dangerouslySetInnerHTML={{ __html: logoRaw }} />
          <div className="header-text">
            <div className="header-title">GENERADOR DE IDENTIFICACION</div>
            <div className="header-subtitle">MANGOTITLÁN · MX · FANMADE</div>
          </div>
        </div>
      </header>

      {/* Layout principal: panel de vista previa + panel del formulario */}
      <main className="app-main">
        {/* Panel de vista previa — aparece primero en móvil */}
        <section className="panel-preview" ref={previewRef}>
          <div className="preview-label ihm-label">Vista previa · Credencial</div>

          {/* Contenedor del efecto tilt — el área de hover abarca todo el div externo */}
          <div
            ref={wrapRef}
            className="card-tilt-wrap"
            style={{ '--card-br': `${cardBr}px` }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            {/* Ajusta el espacio que ocupa la tarjeta escalada en el flujo del layout */}
            <div
              className="card-scale-outer"
              style={{ width: Math.round(CARD_W * cardScale), height: Math.round(CARD_H * cardScale) }}
            >
              {/* transform: scale mantiene los tamaños de fuente calculados; zoom los infla en iOS */}
              <div
                className="card-scale-wrap"
                style={{ transform: `scale(${cardScale})`, transformOrigin: 'top left' }}
              >
                <IdCard ref={cardRef} data={cardData} avatar={state.avatar} />
                {/* Capa de brillo holográfico enmascarada con el patrón de silueta de mango */}
                <div
                  ref={glareRef}
                  className="card-glare"
                  style={{
                    maskImage: `url("${SILUETA_MASK_URL}")`,
                    maskSize: '220px 220px',
                    maskRepeat: 'repeat',
                    WebkitMaskImage: `url("${SILUETA_MASK_URL}")`,
                    WebkitMaskSize: '220px 220px',
                    WebkitMaskRepeat: 'repeat',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Metadatos generados: nivel de jugo y folio actual */}
          <div className="preview-meta ihm-label">
            Nivel de jugo: <strong>{state.jugoso}%</strong>
            &nbsp;·&nbsp;
            Folio: <strong>{state.folio}</strong>
          </div>

          {/* Botón que aparece en iOS 13+ para solicitar permiso del giroscopio */}
          {gyroState === 'needs-permission' && (
            <button type="button" className="ihm-btn ihm-btn-gyro" onClick={startGyro}>
              Activar efecto giroscopio
            </button>
          )}

          {/* Botones de descarga; se deshabilitan mientras hay una exportación en curso */}
          <div className="export-buttons">
            <button
              type="button"
              className="ihm-btn ihm-btn-ink ihm-btn-card-dl"
              onClick={handleDownloadCard}
              disabled={!!downloadAnim}
            >
              {downloadAnim === 'card' ? 'Generando…' : '↓ Credencial PNG'}
            </button>
            <button
              type="button"
              className="ihm-btn"
              onClick={handleDownloadStory}
              disabled={!!downloadAnim}
            >
              {downloadAnim === 'story' ? 'Generando…' : '↓ Story 1080×1920'}
            </button>
          </div>
        </section>

        {/* Panel lateral con el formulario de personalización */}
        <aside className="panel-form">
          <IdForm
            state={state}
            onChange={handleChange}
            onGenerate={handleGenerate}
          />
        </aside>
      </main>

      {/* Pie de página con crédito y enlace al repositorio */}
      <footer className="app-footer">
        <span className="app-footer-credit">Fanmade por <strong>envm92</strong></span>
        <a
          className="ihm-btn ihm-btn-sm"
          href="https://github.com/envm92/ihm-generator"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>

      {/* Elementos ocultos a tamaño real para exportar — sin transformaciones para que html2canvas los capture correctamente */}
      <div className="story-export-container" aria-hidden="true">
        <IdCard ref={cardExportRef} data={cardData} avatar={state.avatar} />
        <StoryFrame ref={storyRef} data={cardData} avatar={state.avatar} />
      </div>

      {/* Overlay de descarga — pantalla oscura con la credencial animada */}
      {downloadAnim && (
        <div className="dl-overlay" aria-hidden="true">
          <div className="dl-scene">
            <div className={`dl-card-anim${downloadAnim === 'done' ? ' dl-card-done' : ''}`}>
              <div ref={dlWrapRef} className="dl-tilt-wrap">
                <div className="dl-card-size-reserve">
                  <div className="dl-card-scale-inner">
                    <IdCard data={cardData} avatar={state.avatar} />
                    <div
                      ref={dlGlareRef}
                      className="card-glare"
                      style={{
                        maskImage: `url("${SILUETA_MASK_URL}")`,
                        maskSize: '220px 220px',
                        maskRepeat: 'repeat',
                        WebkitMaskImage: `url("${SILUETA_MASK_URL}")`,
                        WebkitMaskSize: '220px 220px',
                        WebkitMaskRepeat: 'repeat',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {downloadAnim !== 'done' ? (
              <div className="dl-processing-text">
                PROCESANDO · GUARDANDO · DESCARGANDO · PROCESANDO · GUARDANDO · DESCARGANDO
              </div>
            ) : (
              <div className="dl-success">
                <div className="dl-success-title">¡ID descargada!</div>
                <button
                  type="button"
                  className="ihm-btn ihm-btn-yellow dl-btn-otra"
                  onClick={() => { setDownloadAnim(null); handleGenerate(); }}
                >
                  Haz otra →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
