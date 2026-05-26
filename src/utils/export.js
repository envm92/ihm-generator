import html2canvas from 'html2canvas';

async function capture(element, options = {}) {
  // iOS inflates text when an element is wider than the viewport.
  // Temporarily widen the viewport so the 900px card fits, preventing inflation.
  const viewport = document.querySelector('meta[name="viewport"]');
  const origContent = viewport?.content ?? null;
  if (viewport) {
    viewport.content = 'width=1200, initial-scale=1';
    // Wait one frame so iOS recalculates layout with the new viewport
    await new Promise(r => requestAnimationFrame(r));
  }

  try {
    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      ...options,
    });
  } finally {
    if (viewport && origContent !== null) viewport.content = origContent;
  }
}

export async function downloadCard(cardRef, nombreArchivo = 'habitante-mangotitlan') {
  const canvas = await capture(cardRef.current, { scale: 2 });
  trigger(canvas, `${nombreArchivo}-credencial.png`);
}

export async function downloadStory(storyRef, nombreArchivo = 'habitante-mangotitlan') {
  const canvas = await capture(storyRef.current, { scale: 1 });
  trigger(canvas, `${nombreArchivo}-story.png`);
}

function trigger(canvas, filename) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
