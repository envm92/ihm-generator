// Funciones de exportación: capturan elementos del DOM con html2canvas y los descargan como PNG
import html2canvas from 'html2canvas';

// Captura un elemento del DOM como canvas, ajustando el viewport de iOS antes de hacerlo
async function capture(element, options = {}) {
  // En iOS, el texto se infla cuando el elemento es más ancho que el viewport.
  // Se amplía temporalmente el viewport para que la tarjeta de 900px quepa sin inflarse.
  const viewport = document.querySelector('meta[name="viewport"]');
  const origContent = viewport?.content ?? null;
  if (viewport) {
    viewport.content = 'width=1200, initial-scale=1';
    // Se espera un frame para que iOS recalcule el layout con el nuevo viewport
    await new Promise(r => requestAnimationFrame(r));
  }

  try {
    return await html2canvas(element, {
      scale: 2,        // Doble resolución para pantallas retina
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Fondo transparente para que el PNG conserve bordes redondeados
      logging: false,
      ...options,
    });
  } finally {
    // Restaura el viewport original sin importar si la captura tuvo éxito o falló
    if (viewport && origContent !== null) viewport.content = origContent;
  }
}

// Descarga la credencial como PNG a doble resolución (1800×1120 px)
export async function downloadCard(cardRef, nombreArchivo = 'habitante-mangotitlan') {
  const canvas = await capture(cardRef.current, { scale: 2 });
  trigger(canvas, `${nombreArchivo}-credencial.png`);
}

// Descarga el story como PNG a resolución 1× (1080×1920 px, ya definido en CSS)
export async function downloadStory(storyRef, nombreArchivo = 'habitante-mangotitlan') {
  const canvas = await capture(storyRef.current, { scale: 1 });
  trigger(canvas, `${nombreArchivo}-story.png`);
}

// Captura la credencial oculta y devuelve el canvas sin descargar
export async function captureCard(cardRef) {
  return capture(cardRef.current, { scale: 2 });
}

// Captura el story oculto y devuelve el canvas sin descargar
export async function captureStory(storyRef) {
  return capture(storyRef.current, { scale: 1 });
}

// Dispara la descarga de un canvas ya capturado
export function triggerDownload(canvas, filename) {
  trigger(canvas, filename);
}

// Convierte el canvas a blob PNG y lo descarga creando un <a> temporal
function trigger(canvas, filename) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libera la memoria del blob después de la descarga
  }, 'image/png');
}
