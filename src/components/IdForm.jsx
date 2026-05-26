// Formulario de personalización de la credencial: datos del habitante y apariencia del avatar
import {
  HEAD_LABELS, HEAD_COLORS,
  EXPRESSION_LABELS,
  SHIRT_LABELS,
} from './AvatarStage';
import { PLATAFORMA_OPTIONS } from '../utils/generators';
import './IdForm.css';

// Componente de sección con título para agrupar controles del formulario
function Section({ title, children }) {
  return (
    <div className="form-section">
      <div className="form-section-title">{title}</div>
      {children}
    </div>
  );
}


export default function IdForm({ state, onChange, onGenerate }) {
  // Actualiza un campo de primer nivel del estado
  const set = (key, val) => onChange({ ...state, [key]: val });
  // Actualiza un campo dentro del objeto avatar
  const setAvatar = (key, val) => onChange({ ...state, avatar: { ...state.avatar, [key]: val } });
  // Activa o desactiva un accesorio individual del avatar
  const setAccessory = (key, val) => onChange({
    ...state,
    avatar: { ...state.avatar, accessories: { ...state.avatar.accessories, [key]: val } }
  });

  return (
    <form className="id-form" onSubmit={e => e.preventDefault()}>

      <Section title="Tu Info">
        <div className="form-row">
          <div className="form-group">
            <label className="ihm-label">Nombre</label>
            <input
              className="ihm-input"
              value={state.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="JUANA JULIA"
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label className="ihm-label">Apellido</label>
            <input
              className="ihm-input"
              value={state.apellido}
              onChange={e => set('apellido', e.target.value)}
              placeholder="YEYE"
              maxLength={30}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="ihm-label">Escucha en</label>
            <select
              className="ihm-select"
              value={state.plataforma}
              onChange={e => set('plataforma', e.target.value)}
            >
              {PLATAFORMA_OPTIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Tu Mango">
        <div className="form-group">
          <label className="ihm-label">Tono de piel</label>
          <div className="swatch-grid swatch-grid--heads">
            {Object.keys(HEAD_LABELS).map(key => (
              <button
                key={key}
                type="button"
                className={`head-swatch${state.avatar.head === key ? ' is-active' : ''}`}
                onClick={() => setAvatar('head', key)}
                title={HEAD_LABELS[key]}
              >
                <div className="head-swatch-dot" style={{ background: HEAD_COLORS[key] }} />
                <span>{HEAD_LABELS[key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="ihm-label">Expresión</label>
          <div className="pill-grid">
            {Object.keys(EXPRESSION_LABELS).map(key => (
              <button
                key={key}
                type="button"
                className={`pill-btn${state.avatar.expression === key ? ' is-active' : ''}`}
                onClick={() => setAvatar('expression', key)}
              >
                {EXPRESSION_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="ihm-label">Camisa</label>
          <div className="pill-grid">
            {Object.keys(SHIRT_LABELS).map(key => (
              <button
                key={key}
                type="button"
                className={`pill-btn${state.avatar.shirt === key ? ' is-active' : ''}`}
                onClick={() => setAvatar('shirt', key)}
              >
                {SHIRT_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="ihm-label">Accesorios</label>
          <div className="accessory-grid">
            {[
              { key: 'audifonos', label: 'Audífonos' },
              { key: 'lentes', label: 'Lentes' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`accessory-btn${state.avatar.accessories[key] ? ' is-active' : ''}`}
                onClick={() => setAccessory(key, !state.avatar.accessories[key])}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Extras">
        <div className="extras-row">
          <button
            type="button"
            className={`fiel-toggle${state.fiel ? ' is-active' : ''}`}
            onClick={() => set('fiel', !state.fiel)}
          >
            <span className="fiel-stamp">★</span>
             CLIMATERIO FIEL
          </button>
        </div>

        <button
          type="button"
          className="ihm-btn ihm-btn-yellow regenerar-btn"
          onClick={onGenerate}
        >
          ↺ Regenerar ID
        </button>
      </Section>
    </form>
  );
}
