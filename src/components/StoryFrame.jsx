// Marco de story para exportar en formato vertical 1080×1920 — envuelve la credencial con contexto visual
import { forwardRef } from 'react';
import IdCard from './IdCard';
import './StoryFrame.css';


const StoryFrame = forwardRef(function StoryFrame({ data, avatar }, ref) {
  return (
    <div className="story-frame" ref={ref}>
      {/* Fondo de puntos halftone */}
      <div className="story-bg" />

      {/* Encabezado con la frase de pertenencia a Mangotitlán */}
      <div className="story-header">
        <div className="story-header-sub">SOY HABITANTE DE</div>
        <div className="story-header-main">MANGOTITLÁN</div>
      </div>

      {/* Área central con la credencial incrustada y su sombra decorativa */}
      <div className="story-card-wrap">
        <div className="story-card-shadow" />
        <div className="story-card-inner">
          <IdCard data={data} avatar={avatar} />
        </div>
      </div>

      {/* Pie del story: llamada a la acción, URL de la app y handle de redes sociales */}
      <div className="story-footer">
        <div className="story-footer-cta">¿Y TU, DE DÓNDE ERES?</div>
        <div className="story-footer-url">rmch-id-radioescucha.web.app</div>
        <div className="story-footer-handle">@radiomanguitochupado</div>
      </div>
    </div>
  );
});

export default StoryFrame;
