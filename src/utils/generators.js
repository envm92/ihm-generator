const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';

function rand(n) {
  return Math.floor(Math.random() * n);
}

function clean(str) {
  return str.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '').replace(/[ÁÉÍÓÚÜ]/g, c =>
    ({ Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' }[c] || c)
  );
}

export function generateCURP(nombre, apellido) {
  const ap = clean(apellido).slice(0, 3).padEnd(3, 'X');
  const nm = clean(nombre)[0] || 'X';
  const yy = String(rand(30) + 75).padStart(2, '0');
  const mm = String(rand(12) + 1).padStart(2, '0');
  const dd = String(rand(28) + 1).padStart(2, '0');
  const sexo = rand(2) === 0 ? 'H' : 'M';
  const r1 = CONSONANTS[rand(CONSONANTS.length)];
  const r2 = String(rand(10));
  return `${ap}${nm}${yy}${mm}${dd}${sexo}MXMGT${r1}${r2}`;
}

export function generateFolio() {
  const n = String(rand(99999) + 1).padStart(5, '0');
  return `IHM-${n}-MGTL`;
}

export function generateSeccion() {
  return String(rand(9999) + 1).padStart(4, '0');
}

export function generateJugoso() {
  return rand(91) + 10;
}

const PLATAFORMAS = {
  SPOTIFY: 'SPT',
  YOUTUBE: 'YTB',
  OTRO: 'OTR',
};

export const PLATAFORMA_OPTIONS = Object.keys(PLATAFORMAS);

export function getPlataformaCorta(plataforma) {
  return PLATAFORMAS[plataforma] || 'OTR';
}

export function generateAll(nombre, apellido) {
  return {
    curp: generateCURP(nombre || 'MANGO', apellido || 'HABITANTE'),
    folio: generateFolio(),
    seccion: generateSeccion(),
    jugoso: generateJugoso(),
  };
}
