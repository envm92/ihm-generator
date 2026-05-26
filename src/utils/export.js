import html2canvas from 'html2canvas';

async function capture(element, options = {}) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
    ...options,
  });
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
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
