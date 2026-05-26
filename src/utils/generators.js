// Utilidades para generar los campos aleatorios de la credencial (CURP ficticia, folio, sección, jugo)

// Solo consonantes — se usan para rellenar dígitos de verificación en la CURP ficticia
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';

// Número entero aleatorio en el rango [0, n)
function rand(n) {
  return Math.floor(Math.random() * n);
}

// Normaliza una cadena a solo letras mayúsculas sin acentos ni caracteres especiales
function clean(str) {
  return str.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '').replace(/[ÁÉÍÓÚÜ]/g, c =>
    ({ Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' }[c] || c)
  );
}

// Genera una "Clave de Habitante" (CURP ficticia) usando nombre y apellido como base
export function generateCURP(nombre, apellido) {
  const ap = clean(apellido).slice(0, 3).padEnd(3, 'X'); // Primeras 3 letras del apellido
  const nm = clean(nombre)[0] || 'X';                    // Primera letra del nombre
  const yy = String(rand(30) + 75).padStart(2, '0');     // Año de nacimiento ficticio: 1975–2004
  const mm = String(rand(12) + 1).padStart(2, '0');      // Mes aleatorio
  const dd = String(rand(28) + 1).padStart(2, '0');      // Día aleatorio (máx 28 para evitar fechas inválidas)
  const sexo = rand(2) === 0 ? 'H' : 'M';               // Sexo aleatorio
  const r1 = CONSONANTS[rand(CONSONANTS.length)];        // Consonante aleatoria de verificación
  const r2 = String(rand(10));                           // Dígito numérico de verificación
  return `${ap}${nm}${yy}${mm}${dd}${sexo}MXMGT${r1}${r2}`;
}

// Genera un folio único con formato IHM-NNNNN-MGTL
export function generateFolio() {
  const n = String(rand(99999) + 1).padStart(5, '0');
  return `IHM-${n}-MGTL`;
}

// Genera un número de sección electoral ficticio de 4 dígitos
export function generateSeccion() {
  return String(rand(9999) + 1).padStart(4, '0');
}

// Genera el nivel de jugo del habitante: siempre entre 10% y 100%
export function generateJugoso() {
  return rand(91) + 10;
}

// Mapeo de plataforma completa a código corto para la banda MRZ de la credencial
const PLATAFORMAS = {
  SPOTIFY: 'SPT',
  YOUTUBE: 'YTB',
  OTRO: 'OTR',
};

// Lista de plataformas disponibles para el selector del formulario
export const PLATAFORMA_OPTIONS = Object.keys(PLATAFORMAS);

// Devuelve el código de tres letras de la plataforma, o 'OTR' si no se reconoce
export function getPlataformaCorta(plataforma) {
  return PLATAFORMAS[plataforma] || 'OTR';
}

// Genera todos los campos aleatorios de la credencial en una sola llamada
export function generateAll(nombre, apellido) {
  return {
    curp: generateCURP(nombre || 'MANGO', apellido || 'HABITANTE'),
    folio: generateFolio(),
    seccion: generateSeccion(),
    jugoso: generateJugoso(),
  };
}
