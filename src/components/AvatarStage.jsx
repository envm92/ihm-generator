// Componente que renderiza el avatar de la mascota mango en capas SVG apiladas
import { useMemo, useId } from 'react';
import { prefixIds, svgFillContainer } from '../utils/svgUtils';

// Cabezas (tonos de piel)
import headClassic from '../assets/mascot/heads/mango-classic.svg?raw';
import headMaduro from '../assets/mascot/heads/mango-maduro.svg?raw';
import headRosa from '../assets/mascot/heads/mango-rosa.svg?raw';
import headVerde from '../assets/mascot/heads/mango-verde.svg?raw';

// Expresiones faciales
import exprAsombro from '../assets/mascot/expressions/asombro.svg?raw';
import exprCool from '../assets/mascot/expressions/cool.svg?raw';
import exprGuino from '../assets/mascot/expressions/guino.svg?raw';

// Camisas
import shirtFrutas from '../assets/mascot/shirts/frutas.svg?raw';
import shirtHawaianaFlores from '../assets/mascot/shirts/hawaiana-flores.svg?raw';
import shirtHawaianaHojas from '../assets/mascot/shirts/hawaiana-hojas.svg?raw';
import shirtLisaAmarilla from '../assets/mascot/shirts/lisa-amarilla.svg?raw';
import shirtLisaBlanca from '../assets/mascot/shirts/lisa-blanca.svg?raw';
import shirtLisaNegra from '../assets/mascot/shirts/lisa-negra.svg?raw';
import shirtLisaRoja from '../assets/mascot/shirts/lisa-roja.svg?raw';
import shirtLunares from '../assets/mascot/shirts/lunares.svg?raw';
import shirtRayasMarineras from '../assets/mascot/shirts/rayas-marineras.svg?raw';

// Accesorios opcionales
import accAudifonos from '../assets/mascot/accessories/audifonos.svg?raw';
import accLentes from '../assets/mascot/accessories/lentes.svg?raw';

// Mapas de SVGs crudos indexados por clave — se usan en la composición de capas
export const HEADS = { classic: headClassic, maduro: headMaduro, rosa: headRosa, verde: headVerde };
export const EXPRESSIONS = { asombro: exprAsombro, cool: exprCool, guino: exprGuino };
export const SHIRTS = {
  'frutas': shirtFrutas,
  'hawaiana-flores': shirtHawaianaFlores,
  'hawaiana-hojas': shirtHawaianaHojas,
  'lisa-amarilla': shirtLisaAmarilla,
  'lisa-blanca': shirtLisaBlanca,
  'lisa-negra': shirtLisaNegra,
  'lisa-roja': shirtLisaRoja,
  'lunares': shirtLunares,
  'rayas-marineras': shirtRayasMarineras,
};
export const ACCESSORIES = { audifonos: accAudifonos, lentes: accLentes };

// Etiquetas y colores para los controles del formulario
export const HEAD_LABELS = { classic: 'Clásico', maduro: 'Maduro', rosa: 'Rosa', verde: 'Verde' };
export const HEAD_COLORS = { classic: '#FFCB2F', maduro: '#FFB347', rosa: '#FFA585', verde: '#C8D85E' };

export const EXPRESSION_LABELS = { asombro: 'Asombro', cool: 'Cool', guino: 'Guiño' };

export const SHIRT_LABELS = {
  'frutas': 'Frutas', 'hawaiana-flores': 'Hawaiana Flores', 'hawaiana-hojas': 'Hawaiana Hojas',
  'lisa-amarilla': 'Lisa Amarilla', 'lisa-blanca': 'Lisa Blanca', 'lisa-negra': 'Lisa Negra',
  'lisa-roja': 'Lisa Roja', 'lunares': 'Lunares', 'rayas-marineras': 'Marinera',
};

// Una sola capa del avatar — inyecta el SVG estirado al 100% del contenedor
function Layer({ svgStr, layerKey }) {
  return (
    <div
      className="avatar-layer"
      data-layer={layerKey}
      dangerouslySetInnerHTML={{ __html: svgFillContainer(svgStr) }}
    />
  );
}

export default function AvatarStage({ config }) {
  const { head, expression, shirt, accessories } = config;
  // uid único por instancia para prefijar los ids de la camisa y evitar colisiones entre múltiples avatares
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  // Construye el arreglo de capas en orden de profundidad (abajo → arriba)
  const layers = useMemo(() => {
    const result = [
      { key: 'head', svg: HEADS[head] ?? HEADS.classic },
      // La camisa necesita prefijo porque sus gradientes internos colisionarían si hay dos instancias
      { key: 'shirt', svg: prefixIds(SHIRTS[shirt] ?? SHIRTS['hawaiana-flores'], `${uid}s${shirt}`) },
      { key: 'expr', svg: EXPRESSIONS[expression] ?? EXPRESSIONS.asombro },
    ];
    // Los accesorios se añaden al final para que queden encima de todo
    if (accessories.lentes) result.push({ key: 'lentes', svg: ACCESSORIES.lentes });
    if (accessories.audifonos) result.push({ key: 'audifonos', svg: ACCESSORIES.audifonos });

    return result;
  }, [uid, head, expression, shirt, accessories]);

  return (
    <div className="avatar-stage">
      {layers.map(l => <Layer key={l.key} layerKey={l.key} svgStr={l.svg} />)}
    </div>
  );
}
