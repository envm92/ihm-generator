import { forwardRef } from 'react';
import IdCard from './IdCard';
import './StoryFrame.css';

import hojaRaw from '../assets/credencial/hoja-tropical.svg?raw';

function Hoja({ className }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: hojaRaw }} />;
}

const StoryFrame = forwardRef(function StoryFrame({ data, avatar }, ref) {
  return (
    <div className="story-frame" ref={ref}>
      {/* Halftone background */}
      <div className="story-bg" />


      {/* Header text */}
      <div className="story-header">
        <div className="story-header-sub">SOY HABITANTE DE</div>
        <div className="story-header-main">MANGOTITLÁN</div>
      </div>

      {/* Card area */}
      <div className="story-card-wrap">
        <div className="story-card-shadow" />
        <div className="story-card-inner">
          <IdCard data={data} avatar={avatar} />
        </div>
      </div>

      {/* Footer */}
      <div className="story-footer">
        <div className="story-footer-cta">¿Y TU, DE DÓNDE ERES?</div>
        <div className="story-footer-url">rmch-id-radioescucha.web.app</div>
        <div className="story-footer-handle">@radio_manguito_chupado</div>
      </div>
    </div>
  );
});

export default StoryFrame;
