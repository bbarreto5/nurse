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
- `assets/og-carolyn-carcamo.jpg`: imagen 1200×630 para la vista previa en WhatsApp/redes (Open Graph)
- `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`: iconos
- `robots.txt`, `sitemap.xml`: SEO (URL absoluta https://landingpagenurse.netlify.app/)
- `netlify.toml`: configuración de publicación en Netlify

## Analítica

Los CTA llevan `data-track` y `script.js` envía los eventos `whatsapp_click`, `service_click`,
`hiring_click`, `phone_click` y `cv_download` a GA4 (`gtag`), GTM (`dataLayer`) o Plausible si están
instalados. Para activar GA4, descomenta el bloque en el `<head>` de `index.html` y pon tu ID `G-…`.

## Publicar

- **GitHub Pages**: Settings → Pages → Branch `main` / root.
- **Netlify / Vercel**: arrastra la carpeta o conecta el repo; no requiere comando de build.
