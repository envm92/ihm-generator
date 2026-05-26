import { useState, useRef, useCallback, useEffect } from 'react';

import useTilt from './hooks/useTilt';
import IdCard from './components/IdCard';
import IdForm from './components/IdForm';
import StoryFrame from './components/StoryFrame';
import { generateAll } from './utils/generators';
import { downloadCard, downloadStory } from './utils/export';
import './App.css';

import logoRaw from './assets/credencial/logo-ihm.svg?raw';
import siluetaRaw from './assets/credencial/mango-pattern-silueta.svg?raw';

// Strip the low-opacity group so shapes are fully opaque when used as a CSS mask
const siluetaMaskSvg = siluetaRaw.replace(/opacity="0\.18"/, 'opacity="1"');
const SILUETA_MASK_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(siluetaMaskSvg)}`;

const CARD_W = 900;
const CARD_H = 560;

const DEFAULT_AVATAR = {
  head: 'classic',
  expression: 'asombro',
  shirt: 'hawaiana-flores',
  accessories: { audifonos: false, lentes: false },
};

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
  const [state, setState] = useState(buildInitialState);
  const [exporting, setExporting] = useState(null);
  const [cardScale, setCardScale] = useState(0.68);

  const { wrapRef, glareRef, onMove, onLeave, gyroState, startGyro } = useTilt();

  const cardRef = useRef(null);
  const cardExportRef = useRef(null);
  const storyRef = useRef(null);
  const previewRef = useRef(null);

  // Dynamic card scale based on available container width
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - 32;
      setCardScale(Math.min(available / CARD_W, 0.82));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleGenerate = useCallback(() => {
    const gen = generateAll(state.nombre, state.apellido);
    setState(s => ({ ...s, ...gen }));
  }, [state.nombre, state.apellido]);

  const handleChange = useCallback((next) => setState(next), []);

  const handleDownloadCard = async () => {
    setExporting('card');
    try { await downloadCard(cardExportRef, state.nombre || 'habitante'); }
    finally { setExporting(null); }
  };

  const handleDownloadStory = async () => {
    setExporting('story');
    try { await downloadStory(storyRef, state.nombre || 'habitante'); }
    finally { setExporting(null); }
  };

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

  // 28px = --ihm-r-xl; scaled so the glare radius matches the visual card corners
  const cardBr = Math.round(28 * cardScale);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header ihm-bg-halftone">
        <div className="app-header-inner">
          <div className="header-logo" dangerouslySetInnerHTML={{ __html: logoRaw }} />
          <div className="header-text">
            <div className="header-title">GENERADOR DE IDENTIFICACION</div>
            <div className="header-subtitle">MANGOTITLÁN · MX · FANMADE</div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="app-main">
        {/* Preview panel — appears first on mobile */}
        <section className="panel-preview" ref={previewRef}>
          <div className="preview-label ihm-label">Vista previa · Credencial</div>

          {/* Card with tilt — outer box defines hover area */}
          <div
            ref={wrapRef}
            className="card-tilt-wrap"
            style={{ '--card-br': `${cardBr}px` }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            {/* Outer sizer: tells the layout how much space the scaled card takes */}
            <div
              className="card-scale-outer"
              style={{ width: Math.round(CARD_W * cardScale), height: Math.round(CARD_H * cardScale) }}
            >
              {/* transform: scale keeps computed font sizes intact — zoom inflates text on iOS */}
              <div
                className="card-scale-wrap"
                style={{ transform: `scale(${cardScale})`, transformOrigin: 'top left' }}
              >
                <IdCard ref={cardRef} data={cardData} avatar={state.avatar} />
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

          <div className="preview-meta ihm-label">
            Nivel de jugo: <strong>{state.jugoso}%</strong>
            &nbsp;·&nbsp;
            Folio: <strong>{state.folio}</strong>
          </div>

          {gyroState === 'needs-permission' && (
            <button type="button" className="ihm-btn ihm-btn-gyro" onClick={startGyro}>
              Activar efecto giroscopio
            </button>
          )}

          <div className="export-buttons">
            <button
              type="button"
              className="ihm-btn ihm-btn-ink ihm-btn-card-dl"
              onClick={handleDownloadCard}
              disabled={!!exporting}
            >
              {exporting === 'card' ? 'Generando…' : '↓ Credencial PNG'}
            </button>
            <button
              type="button"
              className="ihm-btn"
              onClick={handleDownloadStory}
              disabled={!!exporting}
            >
              {exporting === 'story' ? 'Generando…' : '↓ Story 1080×1920'}
            </button>
          </div>
        </section>

        {/* Form panel */}
        <aside className="panel-form">
          <IdForm
            state={state}
            onChange={handleChange}
            onGenerate={handleGenerate}
          />
        </aside>
      </main>

      {/* Footer */}
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

      {/* Hidden full-size elements for export — no transforms, so html2canvas captures cleanly */}
      <div className="story-export-container" aria-hidden="true">
        <IdCard ref={cardExportRef} data={cardData} avatar={state.avatar} />
        <StoryFrame ref={storyRef} data={cardData} avatar={state.avatar} />
      </div>
    </div>
  );
}
