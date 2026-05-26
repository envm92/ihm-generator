// Componente de la credencial de habitante — renderiza la tarjeta completa con todos sus campos
import { forwardRef, useId, useMemo } from 'react';
import AvatarStage from './AvatarStage';
import { getPlataformaCorta } from '../utils/generators';
import { prefixIds } from '../utils/svgUtils';
import './IdCard.css';

// Activos de la credencial importados como texto SVG crudo
import logoRaw from '../assets/credencial/logo-ihm.svg?raw';
import selloRaw from '../assets/credencial/sello-mangotitlan.svg?raw';
import hologramaRaw from '../assets/credencial/holograma.svg?raw';

// Iconos de plataforma en línea — se usa icono-play como respaldo genérico
import iconoPlayRaw from '../assets/credencial/icono-play.svg?raw';
import iconoRadioRaw from '../assets/credencial/icono-radio.svg?raw';
import iconoHeadRaw from '../assets/credencial/icono-headphones.svg?raw';

// Mapeo de plataforma a su ícono correspondiente
const PLATFORM_ICONS = {
  SPOTIFY: iconoHeadRaw,
  YOUTUBE: iconoPlayRaw,
  OTRO: iconoRadioRaw,
};

// Envuelve un string SVG crudo en un div para inyectarlo de forma segura al DOM
function RawSvg({ svg, className, style }) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
}

const IdCard = forwardRef(function IdCard({ data, avatar }, ref) {
  // uid único por instancia para prefijar los ids de los SVGs y evitar colisiones en exportación
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const logoSvg = useMemo(() => prefixIds(logoRaw, `${uid}logo`), [uid]);
  const selloSvg = useMemo(() => prefixIds(selloRaw, `${uid}sello`), [uid]);
  const hologramaSvg = useMemo(() => prefixIds(hologramaRaw, `${uid}holo`), [uid]);

  const { nombre, apellido, plataforma, curp, folio, seccion, jugoso, fiel } = data;
  // Solo el primer nombre para la banda MRZ (campo de ancho fijo)
  const nombreCorto = nombre.split(' ')[0] || nombre || 'NOMBRE';
  const apellidoUp = apellido.toUpperCase() || 'APELLIDO';
  const nombreUp = (nombre || 'NOMBRE').toUpperCase();
  const plataformaCorta = getPlataformaCorta(plataforma);
  const anio = new Date().getFullYear();

  return (
    <div className="credencial" ref={ref}>
      {/* Patrón de fondo guilloché (decorativo) */}
      <div className="cred-bg-pattern" />

      {/* Encabezado con logo, título y ticker de texto desplazable */}
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

      {/* Cuerpo principal: avatar a la izquierda, campos de datos a la derecha */}
      <div className="cred-body">
        {/* Columna izquierda: avatar del habitante y número de folio */}
        <div className="cred-left">
          <div className="cred-avatar-slot">
            <AvatarStage config={avatar} />
          </div>
          <div className="cred-folio">
            <span className="field-label">FOLIO</span>
            <span className="cred-folio-value">{folio || 'IHM-00000-MGTL'}</span>
          </div>
        </div>

        {/* Columna derecha: campos de texto de la credencial */}
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

          {/* Fila con plataforma de escucha y nivel de jugo en paralelo */}
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
                {/* Barra de progreso que representa visualmente el nivel de jugo */}
                <div className="jugoso-bar">
                  <div className="jugoso-fill" style={{ width: `${jugoso ?? 0}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="field-divider" />

          {/* Clave de habitante (equivalente ficticio de la CURP) */}
          <div className="cred-field">
            <span className="field-label">CLAVE DE HABITANTE</span>
            <span className="field-value field-value--mono">{curp || 'MANX000000HMXMGT00'}</span>
            <div className="field-divider" />
          </div>

          {/* Fila inferior: vigencia, sección y firma */}
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
              {/* Trayectoria SVG que simula una firma manuscrita */}
              <svg className="firma-svg" viewBox="0 0 120 30" fill="none">
                <path d="M 0 22 Q 25 5, 40 22 T 80 20 Q 100 10, 120 26" stroke="#2a1a06" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Marca de agua holográfica superpuesta */}
      <RawSvg svg={hologramaSvg} className="cred-hologram" />

      {/* Sello oficial de Mangotitlán */}
      <RawSvg svg={selloSvg} className="cred-sello" />

      {/* Insignia "CLIMATERIO FIEL" — solo aparece si el usuario activó la opción */}
      {fiel && (
        <div className="cred-fiel">
          <span>CLIMATERIO</span>
          <span>FIEL</span>
        </div>
      )}

      {/* Banda MRZ (Machine Readable Zone) al estilo de documentos de viaje oficiales */}
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
