# 🥭 Generador de Identificación Habitante de Mangotitlán

**Fanmade · No oficial · Hecho con puro amor manguero**

---

Un generador de credenciales de identidad para los habitantes de **Mangotitlán**, el lugar ficticio más jugoso del universo del podcast [**Radio Manguito Chupado**](https://www.instagram.com/radiomanguitochupado/).

Arma tu mango, ingresa tu nombre, elige tu camisa y descarga tu credencial oficial (no oficial) de habitante. Con número de folio, CURP parodia, nivel de jugo y efecto holográfico incluido.

---

## ¿Qué es esto?

Radio Manguito Chupado es un podcast mexicano con una comunidad que ama crear cosas chidas. Esta app es un regalo de un fan para los fans y para las creadoras: algo para divertirse, compartir en redes y sentirse parte de Mangotitlán.

No tiene ningún fin comercial. Todo el cariño y los créditos van al equipo del podcast.

---

## Qué puedes hacer

- Crear tu **credencial de Habitante de Mangotitlán** con tu nombre, apellido y plataforma de escucha
- Personalizar tu **mango avatar** (tono de piel, camisa, expresión, accesorios)
- Ver el efecto holográfico pasando el cursor sobre la credencial
- Descargar la credencial como **PNG** o en formato **Story 1080×1920** lista para compartir en Instagram

---

## Cómo correrlo en tu máquina

Necesitas tener [Node.js](https://nodejs.org/) instalado.

```bash
# Clonar el repo
git clone https://github.com/tu-usuario/ihm-generator.git
cd ihm-generator

# Instalar dependencias
npm install

# Correr en modo desarrollo
npm run dev
```

Abre `http://localhost:5173` en tu navegador y ya.

```bash
# Generar el build de producción
npm run build
```

---

## Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- CSS plano (sin frameworks)
- [html2canvas](https://html2canvas.hertzen.com/) para exportar las imágenes
- [hover-tilt](https://github.com/simeydotme/hover-tilt) para el efecto de inclinación de la credencial
- Sprites SVG del avatar hechos con IA

---

## Créditos

- **Podcast:** [Radio Manguito Chupado](https://www.instagram.com/radiomanguitochupado/) — síganlas, apoyen el proyecto original
- **App:** Hecha por un fan, para la comunidad

---

> *Este proyecto es fanmade y no está afiliado oficialmente con Radio Manguito Chupado. Los assets del podcast y la marca pertenecen a sus respectivos creadores.*
