import { forwardRef, useId, useMemo } from 'react';
import AvatarStage from './AvatarStage';
import { getPlataformaCorta } from '../utils/generators';
import { prefixIds } from '../utils/svgUtils';
import './IdCard.css';

import logoRaw from '../assets/credencial/logo-ihm.svg?raw';
import selloRaw from '../assets/credencial/sello-mangotitlan.svg?raw';
import hologramaRaw from '../assets/credencial/holograma.svg?raw';

// Platform icon inline fallback using icono-play.svg
import iconoPlayRaw from '../assets/credencial/icono-play.svg?raw';
import iconoRadioRaw from '../assets/credencial/icono-radio.svg?raw';
import iconoHeadRaw from '../assets/credencial/icono-headphones.svg?raw';

const PLATFORM_ICONS = {
  SPOTIFY: iconoHeadRaw,
  YOUTUBE: iconoPlayRaw,
  OTRO: iconoRadioRaw,
};

function RawSvg({ svg, className, style }) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}

const IdCard = forwardRef(function IdCard({ data, avatar }, ref) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const logoSvg = useMemo(() => prefixIds(logoRaw, `${uid}logo`), [uid]);
  const selloSvg = useMemo(() => prefixIds(selloRaw, `${uid}sello`), [uid]);
  const hologramaSvg = useMemo(() => prefixIds(hologramaRaw, `${uid}holo`), [uid]);

  const { nombre, apellido, plataforma, curp, folio, seccion, jugoso, fiel } = data;
  const nombreCorto = nombre.split(' ')[0] || nombre || 'NOMBRE';
  const apellidoUp = apellido.toUpperCase() || 'APELLIDO';
  const nombreUp = (nombre || 'NOMBRE').toUpperCase();
  const plataformaCorta = getPlataformaCorta(plataforma);
  const anio = new Date().getFullYear();

  return (
    <div className="credencial" ref={ref}>
      {/* Background guilloché pattern */}
      <div className="cred-bg-pattern" />

      {/* Header */}
      <div className="cred-header">
        <RawSvg svg={logoSvg} className="cred-logo-svg" />
        <div className="cred-header-text">
          <div className="cred-title">INSTITUTO MANGOTITLÁN</div>
          <div className="cred-subtitle">RADIOESCUCHA</div>
        </div>
        <div className="cred-ticker">
          {'RADIOMANGUITOCHUPADO · '.repeat(12)}
        </div>
      </div>

      <div className="cred-separator-yellow" />
      <div className="cred-separator-dark" />

      {/* Body */}
      <div className="cred-body">
        {/* Left: avatar + folio */}
        <div className="cred-left">
          <div className="cred-avatar-slot">
            <AvatarStage config={avatar} />
          </div>
          <div className="cred-folio">
            <span className="field-label">FOLIO</span>
            <span className="cred-folio-value">{folio || 'IHM-00000-MGTL'}</span>
          </div>
        </div>

        {/* Right: data fields */}
        <div className="cred-fields">
          <div className="cred-field">
            <span className="field-label">NOMBRE</span>
            <span className="field-value field-value--lg">{nombreUp || 'NOMBRE COMPLETO'}</span>
            <div className="field-divider" />
          </div>

          <div className="cred-field">
            <span className="field-label">DOMICILIO</span>
            <span className="field-value">MANGOTITLÁN, M.X.</span>
            <div className="field-divider" />
          </div>

          <div className="cred-field cred-field--row">
            <div className="cred-field-inner">
              <span className="field-label">ESCUCHA EN</span>
              <div className="platform-row">
                <RawSvg svg={PLATFORM_ICONS[plataforma] || iconoPlayRaw} className="platform-icon" />
                <span className="field-value">{plataforma || 'YOUTUBE'}</span>
              </div>
            </div>
            <div className="cred-field-inner">
              <span className="field-label">NIVEL DE JUGO</span>
              <div className="jugoso-row">
                <span className="jugoso-value">{jugoso ?? '??'}%</span>
                <div className="jugoso-bar">
                  <div className="jugoso-fill" style={{ width: `${jugoso ?? 0}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="field-divider" />

          <div className="cred-field">
            <span className="field-label">CLAVE DE HABITANTE</span>
            <span className="field-value field-value--mono">{curp || 'MANX000000HMXMGT00'}</span>
            <div className="field-divider" />
          </div>

          <div className="cred-field cred-field--row cred-field--bottom">
            <div className="cred-field-inner">
              <span className="field-label">VIGENCIA</span>
              <span className="field-value field-value--sm">2026 — 2034</span>
            </div>
            <div className="cred-field-inner">
              <span className="field-label">SECCIÓN</span>
              <span className="field-value field-value--sm">{seccion || '0000'}</span>
            </div>
            <div className="cred-field-inner cred-firma">
              <span className="field-label">FIRMA</span>
              <svg className="firma-svg" viewBox="0 0 120 30" fill="none">
                <path d="M 0 22 Q 25 5, 40 22 T 80 20 Q 100 10, 120 26" stroke="#2a1a06" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hologram watermark */}
      <RawSvg svg={hologramaSvg} className="cred-hologram" />

      {/* Sello Mangotitlán */}
      <RawSvg svg={selloSvg} className="cred-sello" />

      {/* FIEL DEL CLIMATERIO badge */}
      {fiel && (
        <div className="cred-fiel">
          <span>CLIMATERIO</span>
          <span>FIEL</span>
        </div>
      )}

      {/* MRZ band */}
      <div className="cred-mrz">
        <div className="mrz-line">
          {`IHM<<${apellidoUp.replace(/\s/g, '<')}<<${nombreCorto.toUpperCase().replace(/\s/g, '<')}${'<'.repeat(20)}`}
        </div>
        <div className="mrz-line">
          {`${folio || 'IHM-00000-MGTL'}<<MX<<MGTL<<${anio}<<${plataformaCorta}${'<'.repeat(20)}`}
        </div>
      </div>
    </div>
  );
});

export default IdCard;
