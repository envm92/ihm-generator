// Utilidades para manipular cadenas SVG crudas antes de inyectarlas al DOM

// Agrega un prefijo a todos los ids y referencias internas del SVG para evitar colisiones
// cuando múltiples instancias del mismo SVG coexisten en la página
export function prefixIds(svgStr, prefix) {
  return svgStr
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/href="#([^"]+)"/g, (_, id) => `href="#${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);
}

// Reemplaza el color base del cabello (#1f1a18) por el color elegido por el usuario
export function applyHairColor(svgStr, color) {
  return svgStr.replaceAll('#1f1a18', color);
}

// Hace que el SVG ocupe el 100% del contenedor padre en lugar de tener dimensiones fijas
export function svgFillContainer(svgStr) {
  return svgStr.replace('<svg ', '<svg width="100%" height="100%" ');
}

// Extrae el contenido interno del SVG (quita el wrapper <svg>) para composición en capas
export function extractInner(svgStr) {
  return svgStr
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
}

// Construye un data URI con las capas de la mascota compuestas en un solo SVG
// Se usa como src de <image> dentro de SVGs exportados
export function buildAvatarDataUri({ head, hair, hairColor, expression, shirt, accessories, svgMap }) {
  const prefix = (key, str) => prefixIds(str, key);

  // Orden de capas de abajo hacia arriba: camisa → cabeza → cabello → expresión → accesorios
  const layers = [
    extractInner(prefix(`s-${shirt}`, svgMap.shirts[shirt] || '')),
    extractInner(svgMap.heads[head] || ''),
    extractInner(prefix(`h-${hair}`, applyHairColor(svgMap.hairs[hair] || '', hairColor))),
    extractInner(svgMap.expressions[expression] || ''),
    accessories.audifonos ? extractInner(svgMap.accessories.audifonos || '') : '',
    accessories.lentes ? extractInner(svgMap.accessories.lentes || '') : '',
    accessories.mate ? extractInner(svgMap.accessories.mate || '') : '',
  ];

  const composed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">${layers.join('')}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(composed);
}
