export function prefixIds(svgStr, prefix) {
  return svgStr
    .replace(/id="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/href="#([^"]+)"/g, (_, id) => `href="#${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`);
}

export function applyHairColor(svgStr, color) {
  return svgStr.replaceAll('#1f1a18', color);
}

export function svgFillContainer(svgStr) {
  return svgStr.replace('<svg ', '<svg width="100%" height="100%" ');
}

// Extracts inner SVG content (strips the <svg> wrapper) for compositing
export function extractInner(svgStr) {
  return svgStr
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
}

// Builds a data URI from composed mascot layers for use as <image> in SVG
export function buildAvatarDataUri({ head, hair, hairColor, expression, shirt, accessories, svgMap }) {
  const prefix = (key, str) => prefixIds(str, key);

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
