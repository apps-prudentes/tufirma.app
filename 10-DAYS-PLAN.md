# 🚀 Plan SEO SignPDF - 10 Días Intensivos

**Objetivo:** Tener app completamente optimizada para SEO + 5 landing pages + 3 blog posts

**Inicio:** Hoy en la noche (Día 1)

---

## 📅 CALENDARIO POR DÍA

### **DÍA 1 (Noche de hoy) - SEO TÉCNICO BASE**
**Duración:** 3-4 horas
**Prioridad:** 🔴 CRÍTICO

#### Tareas:
- [ ] **1.1** Implementar metadata dinámica en `/app/layout.tsx`
  ```tsx
  export const metadata: Metadata = {
    title: 'SignPDF | Firmar PDF Gratis Online',
    description: 'Firma documentos PDF gratis, rápido y 100% privado. Tus archivos nunca salen de tu navegador.',
    openGraph: {
      title: 'SignPDF | Firma PDF Online',
      description: 'Firma gratis desde cualquier dispositivo',
      url: 'https://tufirma.app',
      siteName: 'SignPDF',
      images: [{
        url: '/og-image.png',
        width: 1200,
        height: 630,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SignPDF | Firmar PDF Gratis',
      description: 'Firma documentos 100% privado online',
      images: ['/og-image.png'],
    },
  }
  ```

- [ ] **1.2** Crear `public/sitemap.xml`
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://tufirma.app</loc>
      <lastmod>2026-01-14</lastmod>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://tufirma.app/firmar-pdf-gratis</loc>
      <lastmod>2026-01-14</lastmod>
      <priority>0.9</priority>
    </url>
    <url>
      <loc>https://tufirma.app/blog</loc>
      <lastmod>2026-01-14</lastmod>
      <priority>0.8</priority>
    </url>
  </urlset>
  ```

- [ ] **1.3** Crear `public/robots.txt`
  ```
  User-agent: *
  Allow: /
  Disallow: /api/
  Sitemap: https://tufirma.app/sitemap.xml
  ```

- [ ] **1.4** Crear Schema JSON para FAQPage en `/components/schema.tsx`
  ```tsx
  export const FAQSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Es seguro firmar PDFs online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "100% seguro. SignPDF procesa todo en tu navegador, tus documentos nunca salen de tu dispositivo."
        }
      },
      {
        "@type": "Question",
        "name": "¿Necesito registrarme?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, puedes firmar documentos gratis sin registrarte. Solo crea cuenta si quieres usar Plan Premium."
        }
      }
    ]
  }
  ```

- [ ] **1.5** Agregar Google Search Console tag en `app/layout.tsx`
  ```tsx
  <meta name="google-site-verification" content="TU_VERIFICATION_CODE" />
  ```

- [ ] **1.6** Crear cuenta en Google Analytics 4 y agregar script

- [ ] **1.7** Crear `app/not-found.tsx` para 404 amigable

---

### **DÍA 2 - LANDING PAGE PRINCIPAL**
**Duración:** 4-5 horas
**Prioridad:** 🔴 CRÍTICO

#### Tareas:
- [ ] **2.1** Crear estructura `/app/(landing)/firmar-pdf-gratis/page.tsx`

- [ ] **2.2** Copiar y adaptar hero section de `/page.tsx` pero optimizado para keyword "firmar pdf gratis"
  - Meta title: "Firmar PDF Gratis Online | Sin Subir Archivos – SignPDF"
  - Meta description: "Firma documentos PDF gratis y 100% privado. Procesa todo en tu navegador sin subir archivos. Rápido, seguro y fácil."
  - H1: "Firma PDF Gratis Online sin Subir Archivos"

- [ ] **2.3** Agregar sección "¿Cómo Funciona?" con 4 pasos
  - Paso 1: Sube tu PDF
  - Paso 2: Crea tu firma
  - Paso 3: Coloca la firma
  - Paso 4: Descarga firmado

- [ ] **2.4** Agregar sección "¿Por Qué SignPDF?" con 5 beneficios
  - 🔒 100% Privado (nunca subimos archivos)
  - ⚡ Súper Rápido (procesamiento local)
  - 📱 Funciona en Celular
  - 💸 Gratis para Empezar
  - 🚀 Sin Instalación

- [ ] **2.5** Agregar testimonios/social proof (puede ser hardcoded por ahora)

- [ ] **2.6** Agregar FAQ schema con 5 preguntas frecuentes

- [ ] **2.7** CTA destacado: "Firmar PDF Gratis Ahora"

- [ ] **2.8** Metadata dinámica para esta página

---

### **DÍA 3 - LANDING PAGES SECUNDARIAS (Parte 1)**
**Duración:** 3-4 horas
**Prioridad:** 🟡 IMPORTANTE

#### Tareas:
- [ ] **3.1** Crear `/app/(landing)/firma-digital-online/page.tsx`
  - Focus keyword: "firma digital online"
  - H1: "Firma Digital Online - Segura y Completamente Privada"
  - Meta description: "Crea tu firma digital online en segundos. Privacidad garantizada, sin subir documentos a servidores."

- [ ] **3.2** Crear `/app/(landing)/firmar-desde-celular/page.tsx`
  - Focus keyword: "firmar desde celular"
  - H1: "Firmar Documentos desde Celular - Gratis y Seguro"
  - Meta description: "Firma PDFs directamente desde tu móvil. Soporte completo para Android e iOS. 100% privado."

- [ ] **3.3** Crear `/app/(landing)/firma-pdf-segura/page.tsx`
  - Focus keyword: "firma pdf segura"
  - H1: "Firma PDF de Forma Segura y Privada"
  - Meta description: "La forma más segura de firmar PDFs online. Tus documentos nunca salen de tu navegador."

- [ ] **3.4** Cada landing debe tener:
  - Hero diferenciado
  - 3-4 secciones de features
  - FAQ específica (5-6 preguntas)
  - CTA clara
  - Internal links a otras landings

---

### **DÍA 4 - LANDING PAGES SECUNDARIAS (Parte 2) + BLOG ESTRUCTURA**
**Duración:** 3-4 horas
**Prioridad:** 🟡 IMPORTANTE

#### Tareas:
- [ ] **4.1** Crear `/app/(landing)/alternativa-docusign/page.tsx`
  - Focus keyword: "alternativa docusign"
  - H1: "Alternativa a DocuSign - Más Barata y Privada"
  - Tabla comparativa: SignPDF vs DocuSign
  - Highlight: "Desde $5/mes vs $10+ de DocuSign"

- [ ] **4.2** Crear estructura `/app/blog` con:
  - `/app/blog/page.tsx` (listado de posts)
  - `/app/blog/[slug]/page.tsx` (página individual)
  - `/lib/blog/posts.ts` (data de posts)

- [ ] **4.3** Crear estructura de carpeta:
  ```
  /content/blog/
  ├── como-firmar-pdf-celular/
  │   ├── page.mdx (o JSON)
  │   └── metadata.json
  ├── docusign-vs-signpdf/
  └── es-seguro-firmar-pdf/
  ```

- [ ] **4.4** Crear componente `BlogCard` reutilizable

- [ ] **4.5** Metadata dinámica para blog posts

---

### **DÍA 5 - PRIMER BLOG POST**
**Duración:** 4-5 horas
**Prioridad:** 🔴 CRÍTICO

#### Tareas:
- [ ] **5.1** Escribir: "Cómo Firmar un PDF desde tu Celular (Guía Paso a Paso)"
  - **Keyword:** "firmar pdf desde celular" / "como firmar un pdf en el celular gratis"
  - **Meta title:** "Cómo Firmar un PDF desde tu Celular | Gratis en 3 Pasos"
  - **Meta description:** "Guía completa: cómo firmar PDFs desde tu Android o iPhone sin apps. Rápido, gratis y 100% privado."
  - **Estructura:**
    - Intro (100 palabras)
    - ¿Por qué firmar desde el celular? (200 palabras)
    - Paso a paso con imágenes/capturas (800 palabras)
    - Alternativas (no recomendadas)
    - FAQ (300 palabras)
    - CTA al signup
  - **Total:** 1,500-1,800 palabras

- [ ] **5.2** Agregar internal links:
  - Link a /firmar-pdf-gratis
  - Link a /firmar-desde-celular

- [ ] **5.3** Agregar imagen de hero para el blog post

- [ ] **5.4** Crear esquema Article + FAQPage para el post

- [ ] **5.5** Publicar y actualizar sitemap.xml

---

### **DÍA 6 - SEGUNDO Y TERCER BLOG POST**
**Duración:** 5-6 horas
**Prioridad:** 🟡 IMPORTANTE

#### Tareas:
- [ ] **6.1** Escribir: "DocuSign vs SignPDF: Comparación Honesta 2026"
  - **Keyword:** "docusign vs signpdf" / "alternativa barata a docusign"
  - **Meta title:** "DocuSign vs SignPDF: ¿Cuál Elegir en 2026?"
  - **Meta description:** "Comparativa completa: DocuSign vs SignPDF. Precio, seguridad, privacidad y funcionalidades."
  - **Estructura:**
    - Tabla comparativa (precio, features, seguridad, facilidad)
    - Análisis por categoría (200 palabras c/u)
    - Ventajas de cada uno
    - Para quién es cada uno
    - FAQ
    - CTA (SignPDF es mejor para ti si...)
  - **Total:** 1,800-2,000 palabras

- [ ] **6.2** Escribir: "¿Es Seguro Firmar PDFs Online? La Verdad Completa"
  - **Keyword:** "es seguro firmar pdf online" / "firma pdf segura"
  - **Meta title:** "¿Es Seguro Firmar PDFs Online? Análisis de Seguridad 2026"
  - **Meta description:** "¿Es realmente seguro firmar documentos online? Explicamos cómo funciona la seguridad en SignPDF."
  - **Estructura:**
    - ¿Qué es lo que nos asusta? (200 palabras)
    - Cómo funciona la seguridad real (500 palabras)
    - Cómo SignPDF protege tu privacidad (400 palabras)
    - Comparación vs otros servicios (400 palabras)
    - FAQ
    - CTA
  - **Total:** 1,600-1,900 palabras

- [ ] **6.3** Agregar internal links entre posts

- [ ] **6.4** Crear autor "SignPDF Team"

- [ ] **6.5** Publicar ambos y actualizar sitemap

---

### **DÍA 7 - OPTIMIZACIÓN ON-PAGE + ANALYTICS**
**Duración:** 3-4 horas
**Prioridad:** 🟡 IMPORTANTE

#### Tareas:
- [ ] **7.1** Revisar todas las páginas en Lighthouse
  - Performance > 80
  - SEO = 100
  - Accessibility > 90

- [ ] **7.2** Verificar meta tags en todas las páginas
  - [ ] /
  - [ ] /firmar-pdf-gratis
  - [ ] /firma-digital-online
  - [ ] /firmar-desde-celular
  - [ ] /firma-pdf-segura
  - [ ] /alternativa-docusign
  - [ ] /blog
  - [ ] /blog/como-firmar-pdf-celular
  - [ ] /blog/docusign-vs-signpdf
  - [ ] /blog/es-seguro-firmar-pdf

- [ ] **7.3** Crear/actualizar Open Graph images para cada página (1200x630px)

- [ ] **7.4** Implementar Google Analytics 4 correctamente
  - Tracking de eventos: signup, plan upgrade, PDF firmado
  - Custom events para blog views

- [ ] **7.5** Crear `app/sitemap.ts` (generador dinámico de sitemap)
  ```tsx
  export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return [
      { url: 'https://tufirma.app', lastModified: new Date(), priority: 1 },
      { url: 'https://tufirma.app/firmar-pdf-gratis', lastModified: new Date(), priority: 0.9 },
      // ... más URLs
    ]
  }
  ```

- [ ] **7.6** Verificar robots.txt y sitemap en Search Console

---

### **DÍA 8 - LANDING PAGE DE BLOG + OPTIMIZACIÓN**
**Duración:** 3-4 horas
**Prioridad:** 🟢 IMPORTANTE

#### Tareas:
- [ ] **8.1** Mejorar `/app/blog/page.tsx`:
  - Categorías de posts (opcional)
  - Cards con preview
  - Meta title: "Blog de SignPDF | Guías sobre Firma Digital"
  - Meta description: "Aprende todo sobre firma digital, seguridad online y cómo firmar documentos de forma segura."

- [ ] **8.2** Crear `robots.txt` mejorado con reglas para bot

- [ ] **8.3** Implementar breadcrumbs en todas las páginas
  ```tsx
  <nav aria-label="breadcrumb">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/blog">Blog</a></li>
      <li>Título del Post</li>
    </ol>
  </nav>
  ```

- [ ] **8.4** Verificar internal linking entre todas las páginas

- [ ] **8.5** Crear URL canonical en todas las páginas

- [ ] **8.6** Mobile testing: verificar que todo se ve bien en celular

---

### **DÍA 9 - SUBMISIÓN A INDEXADORES + OPTIMIZACIÓN FINAL**
**Duración:** 2-3 horas
**Prioridad:** 🔴 CRÍTICO

#### Tareas:
- [ ] **9.1** Registrar en Google Search Console
  - Verificar sitemap.xml
  - Inspeccionar URL en:
    - /
    - /firmar-pdf-gratis
    - /blog/como-firmar-pdf-celular
  - Solicitar indexación

- [ ] **9.2** Registrar en Bing Webmaster Tools

- [ ] **9.3** Enviar sitemap a:
  - Google (vía Search Console)
  - Bing (vía Webmaster Tools)
  - https://www.xml-sitemaps.com (verificar)

- [ ] **9.4** Ping a indexadores:
  ```bash
  curl "http://www.google.com/ping?sitemap=https://tufirma.app/sitemap.xml"
  curl "https://www.bing.com/ping?sitemap=https://tufirma.app/sitemap.xml"
  ```

- [ ] **9.5** Verificar que el sitio se carga en <2 segundos
  - Usar PageSpeed Insights
  - Optimizar imágenes si es necesario

- [ ] **9.6** Último review de copy en todas las landing pages

- [ ] **9.7** Hacer build final y test en producción
  ```bash
  npm run build
  npm run start
  ```

---

### **DÍA 10 - LANZAMIENTO + SEGUIMIENTO**
**Duración:** 2-3 horas
**Prioridad:** 🔴 CRÍTICO

#### Tareas:
- [ ] **10.1** Hacer deploy a Vercel
  - Verificar que todo funciona en vivo
  - Revisar Core Web Vitals

- [ ] **10.2** Crear cuenta en:
  - Google Search Console (si no la tienes)
  - Google Analytics
  - Bing Webmaster Tools

- [ ] **10.3** Crear cuenta en tools de SEO (gratuitas):
  - Ubersuggest (free tier)
  - Ahrefs (free tier)
  - SEMrush (free tier)

- [ ] **10.4** Publicar en ProductHunt
  - Crear post anunciando: "Firmar PDFs gratis sin subir archivos"
  - Mencionar: privacidad, seguridad, precio bajo

- [ ] **10.5** Compartir en redes (Twitter, LinkedIn, Reddit):
  - Twitter: Link a /firmar-pdf-gratis
  - LinkedIn: Post sobre firma digital + link
  - Reddit: r/freelance, r/entrepreneur, r/entrepreneur_es

- [ ] **10.6** Crear checklist de monitoreo (ver sección abajo)

- [ ] **10.7** Revisar analytics diarias durante 1 semana

---

## 🎯 PRIORIDADES POR DÍA (Resumen Rápido)

| Día | Tarea Principal | Tiempo | Deadline |
|-----|---|---|---|
| 1 | SEO Técnico (metadata, sitemap, robots) | 3-4h | Noche |
| 2 | Landing /firmar-pdf-gratis | 4-5h | Mañana |
| 3 | 3 Landing pages (firma-digital, celular, segura) | 3-4h | Tarde |
| 4 | Landing /alternativa-docusign + Estructura blog | 3-4h | Noche |
| 5 | Blog post #1 (Cómo firmar desde celular) | 4-5h | Mañana |
| 6 | Blog post #2 y #3 (DocuSign vs, Es seguro) | 5-6h | Tarde/Noche |
| 7 | Lighthouse, Meta tags, GA4, Sitemap dinámico | 3-4h | Mañana |
| 8 | Blog landing page + Breadcrumbs + Canonical | 3-4h | Tarde |
| 9 | Google Search Console, Bing, Sitemaps, Speed | 2-3h | Noche |
| 10 | Deploy + ProductHunt + Social Media | 2-3h | Mañana |

**TOTAL: 35-43 horas en 10 días** ✅

---

## 📊 CHECKLIST TÉCNICO QUICK REFERENCE

### SEO On-Page (Para cada página)
- [ ] H1 único y contiene keyword principal
- [ ] Meta title ≤ 60 caracteres
- [ ] Meta description ≤ 155 caracteres
- [ ] Alt text en todas las imágenes
- [ ] Internal links (3-5 por página)
- [ ] URL clean y descriptiva
- [ ] Open Graph tags
- [ ] Structured data (schema.org)

### SEO Técnico
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Meta viewport (responsivo)
- [ ] Favicon
- [ ] Breadcrumbs
- [ ] Canonical URLs
- [ ] 301 redirects si cambias URLs
- [ ] Compresión de imágenes

### Performance
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms
- [ ] Lighthouse Score > 80

### Registro y Seguimiento
- [ ] Google Search Console
- [ ] Google Analytics 4
- [ ] Bing Webmaster Tools
- [ ] Sitemap enviado
- [ ] URLs indexadas

---

## 🚀 QUICK WIN SI TE ATRASAS

Si no puedes hacer todo en 10 días, MÍNIMO estos días:
1. **Día 1:** SEO técnico ✅
2. **Día 2:** Landing /firmar-pdf-gratis ✅
3. **Días 5-6:** 3 blog posts ✅
4. **Día 9:** Submisiones a indexadores ✅
5. **Día 10:** Deploy + Launch ✅

**= Ya tienes 80% del work hecho con 5 días clave.**

---

## 📈 MÉTRICAS A MONITOREAR POST-LANZAMIENTO

### Semana 1-2:
- ✅ Indexación en Google (ver en Search Console)
- ✅ Errores de crawl
- ✅ CTR inicial
- ✅ Tráfico inicial (esperado: 0-50 visitas/día)

### Mes 1:
- ✅ Ranking inicial (probablemente página 3-5 para keywords principales)
- ✅ Tráfico orgánico
- ✅ Bounce rate
- ✅ Páginas más visitadas

### Mes 3:
- 🎯 Top 20 para "firmar pdf gratis"
- 🎯 500-1k visitas orgánicas/mes
- 🎯 Free to Paid conversion rate

---

## 💡 TIPS IMPORTANTES

1. **No hagas perfección, haz publicación:** Better done than perfect
2. **Publica primero, optimiza después:** Puedes mejorar on-page a la semana 2
3. **Tracking desde día 1:** Necesitas baseline para medir
4. **Blog posts > everything:** 3 posts buenos > 10 posts mediocres
5. **Internal links son oro:** Cada post debe linkar a 3-5 otras páginas
6. **Copywrites enfocado en usuario:** No en SEO
7. **No spam:** No hagas keyword stuffing

---

**¡Adelante! Tienes esto. 10 días = app completamente SEO-ready. 🔥**


Probar precio basico:

  ---
  ✅ DESPUÉS DE PROBAR:

  Simplemente comenta o borra el plan BÁSICO de:
  - Stripe (deshabilitar o borrar)
  - Home page (comentar el card)
  - Env var (comentar o borrar)