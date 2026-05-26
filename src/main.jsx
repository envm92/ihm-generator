// Punto de entrada principal de la aplicación
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Monta la app en el elemento raíz del DOM con StrictMode activado para detectar problemas en desarrollo
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
