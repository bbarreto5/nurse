# Carolyn Carcamo Barreto · Landing page

Página personal de Carolyn Carcamo Barreto, auxiliar de enfermería en Barranquilla.
Sitio estático (HTML + CSS + JS, sin dependencias ni build).

## Ver en local

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000   # luego http://localhost:8000
```

## Estructura

- `index.html`: contenido y secciones
- `styles.css`: diseño y animaciones (colores en `:root`)
- `script.js`: preloader, ECG del monitor, contadores, revelado al hacer scroll, cursor, copiar correo
- `assets/carolyn.jpeg`: foto (reemplázala por una de mayor resolución con el mismo nombre)
- `assets/CV-Carolyn-Carcamo-Barreto.pdf`: hoja de vida descargable

## Publicar

- **GitHub Pages**: Settings → Pages → Branch `main` / root.
- **Netlify / Vercel**: arrastra la carpeta o conecta el repo; no requiere comando de build.
