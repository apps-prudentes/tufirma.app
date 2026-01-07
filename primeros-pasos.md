# 🚀 Primeros Pasos - Configuración de Servicios Externos

Esta guía te ayudará a configurar todos los servicios externos necesarios para desarrollar y probar la aplicación SignPDF antes de lanzarla como SaaS.

## 📋 Resumen de Servicios

| Servicio | Propósito | Costo Desarrollo | Tiempo Setup |
|----------|-----------|------------------|--------------|
| Supabase | Base de datos PostgreSQL | GRATIS | 5 min |
| Clerk | Autenticación de usuarios | GRATIS | 10 min |
| Stripe | Procesamiento de pagos | GRATIS (test) | 15 min |

**Total: $0 para desarrollo** 🎉

---

## 🗄️ 1. Base de Datos PostgreSQL (PRIMER PASO)

### Por qué primero
Sin base de datos no puedes guardar usuarios ni rastrear firmas. Es la base de todo.

### Opción Recomendada: Supabase

**Plan Gratuito:**
- 500MB de base de datos
- 1GB de transferencia
- Suficiente para 1000+ usuarios de prueba

### Pasos de Configuración

1. **Crear cuenta**
   - Ve a https://supabase.com
   - Crea una cuenta (puedes usar GitHub)

2. **Crear proyecto**
   - Click en **"New Project"**
   - Nombre: `signpdf-dev` (o el que prefieras)
   - Database Password: Crea una contraseña segura (guárdala!)
   - Región: Elige la más cercana a ti
   - Click en **"Create new project"**
   - Espera 2-3 minutos mientras se crea

3. **Obtener Connection String**
   - Una vez creado, ve a **Settings** (ícono de engranaje)
   - Click en **Database** en el menú lateral
   - Busca la sección **"Connection String"**
   - Selecciona la pestaña **"URI"**
   - Copia la cadena completa (se ve así):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
     ```
   - **IMPORTANTE:** Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste

4. **Configurar en tu aplicación**
   - Crea un archivo `.env` en la raíz del proyecto (si no existe)
   - Agrega:
     ```env
     DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
     ```

5. **Crear tablas**
   - Abre tu terminal en el proyecto
   - Ejecuta:
     ```bash
     npx prisma generate
     npx prisma db push
     ```
   - Verás un mensaje de éxito ✓

6. **Verificar tablas creadas**
   - En Supabase, ve a **Table Editor**
   - Deberías ver las tablas `User` y `Signature`

### Alternativas a Supabase

- **Neon** (https://neon.tech) - También gratis, muy rápido
- **Railway** (https://railway.app) - $5/mes con créditos gratis iniciales
- **PostgreSQL local** - Más complejo pero 100% local

---

## 🔐 2. Clerk (Autenticación - SEGUNDO PASO)

### Por qué segundo
Necesitas autenticación para identificar usuarios en la base de datos.

### Plan Gratuito
- 10,000 usuarios activos mensuales
- Autenticación social (Google, GitHub, etc.)
- Email/Password
- Más que suficiente para desarrollo

### Pasos de Configuración

1. **Crear cuenta**
   - Ve a https://clerk.com
   - Click en **"Start building for free"**
   - Regístrate con email o GitHub

2. **Crear aplicación**
   - Click en **"Create Application"**
   - Nombre: `SignPDF Dev`
   - Selecciona métodos de autenticación:
     - ✅ Email
     - ✅ Google (opcional)
   - Click en **"Create Application"**

3. **Obtener API Keys**
   - Una vez creada la app, verás las keys inmediatamente
   - O ve a **Configure** → **API Keys**
   - Copia ambas keys:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```
   - Agrégalas a tu archivo `.env`

4. **Configurar Paths (Rutas)**
   - En el dashboard de Clerk, ve a **Paths** en el sidebar
   - Configura:
     - **Sign-in URL:** `/sign-in`
     - **Sign-up URL:** `/sign-up`
     - **After sign-in redirect:** `/dashboard`
     - **After sign-up redirect:** `/dashboard`
     - **Home URL:** `http://localhost:3000`
   - Guarda los cambios

5. **Configurar Webhook (Sincronización con BD)**

   Para desarrollo local, necesitas exponer tu localhost a internet.

   **Opción A: ngrok (Recomendado)**

   ```bash
   # Instalar ngrok
   npm install -g ngrok

   # Ejecutar (en una terminal separada)
   ngrok http 3000
   ```

   Verás algo como:
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:3000
   ```

   Copia la URL `https://abc123.ngrok.io`

   **Opción B: Localtunnel**

   ```bash
   npx localtunnel --port 3000
   ```

   **Configurar Webhook en Clerk:**

   - En Clerk dashboard, ve a **Webhooks**
   - Click en **"Add Endpoint"**
   - **Endpoint URL:** `https://tu-url-ngrok.ngrok.io/api/webhooks/clerk`
   - **Subscribe to events:**
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Click en **"Create"**
   - Copia el **Signing Secret** (empieza con `whsec_...`)
   - Agrégalo a `.env`:
     ```env
     CLERK_WEBHOOK_SECRET="whsec_..."
     ```

6. **Probar autenticación**
   - Reinicia tu servidor de desarrollo (`npm run dev`)
   - Ve a `http://localhost:3000`
   - Click en "Registrarse"
   - Crea una cuenta de prueba
   - Deberías ver el usuario en Supabase (tabla `User`)

### Notas Importantes

- ⚠️ **ngrok es temporal:** Cada vez que reinicies ngrok, la URL cambia. Debes actualizar el webhook en Clerk.
- 💡 **Para producción:** Usarás tu dominio real (ej: `https://signpdf.com/api/webhooks/clerk`)

---

## 💳 3. Stripe (Pagos - TERCER PASO)

### Por qué tercero
Necesitas usuarios autenticados antes de poder cobrarles.

### Modo Test
- ✅ Transacciones ilimitadas gratis
- ✅ Webhooks de prueba
- ✅ Tarjetas de prueba

### Pasos de Configuración

1. **Crear cuenta**
   - Ve a https://stripe.com
   - Click en **"Start now"**
   - Completa el registro

2. **Activar Modo Test**
   - **MUY IMPORTANTE:** Asegúrate de que el toggle **"Test mode"** esté activado
   - Lo verás en la esquina superior derecha del dashboard
   - Debe decir "Viewing test data"

3. **Obtener API Keys**
   - Ve a **Developers** → **API keys**
   - Verás dos keys (en modo Test):
     - **Publishable key** (empieza con `pk_test_...`)
     - **Secret key** (empieza con `sk_test_...`)
   - Click en "Reveal test key" si está oculta
   - Cópialas a tu `.env`:
     ```env
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
     STRIPE_SECRET_KEY="sk_test_..."
     ```

4. **Crear Producto Premium**

   - Ve a **Products** → **Add product**
   - **Nombre:** Premium Plan
   - **Descripción:** 50 firmas por mes
   - **Pricing:**
     - Model: Standard pricing
     - Price: $5.00 USD
     - Billing period: Monthly
     - Payment type: Recurring
   - Click en **"Save product"**
   - **IMPORTANTE:** Copia el **Price ID** (empieza con `price_...`)
   - Agrégalo a `.env`:
     ```env
     STRIPE_PREMIUM_PRICE_ID="price_..."
     ```

5. **Configurar Webhook (Desarrollo Local)**

   **Instalar Stripe CLI:**

   Windows (con winget):
   ```bash
   winget install stripe.stripe-cli
   ```

   Windows (manual):
   - Descarga desde: https://github.com/stripe/stripe-cli/releases
   - Extrae el .exe a una carpeta
   - Agrégalo al PATH o ejecútalo desde esa carpeta

   macOS:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

   **Autenticar CLI:**
   ```bash
   stripe login
   ```
   Se abrirá tu navegador para autorizar.

   **Escuchar webhooks:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Verás algo como:
   ```
   > Ready! Your webhook signing secret is whsec_abc123...
   ```

   Copia ese secret y agrégalo a `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

   ⚠️ **IMPORTANTE:** Deja esta terminal corriendo mientras desarrollas. No la cierres.

6. **Probar Stripe**

   - Reinicia tu servidor (`npm run dev`)
   - Inicia sesión en la app
   - Ve a `/upgrade`
   - Click en "Upgrade to Premium"
   - Usa la tarjeta de prueba:
     - Número: `4242 4242 4242 4242`
     - Fecha: Cualquier fecha futura (ej: 12/25)
     - CVC: Cualquier 3 dígitos (ej: 123)
     - ZIP: Cualquier código (ej: 12345)
   - Completa el pago
   - Verifica en Supabase que el plan cambió a `PREMIUM`

### Tarjetas de Prueba Stripe

| Escenario | Número de Tarjeta | Resultado |
|-----------|-------------------|-----------|
| Pago exitoso | `4242 4242 4242 4242` | ✅ Aprobado |
| Requiere autenticación | `4000 0025 0000 3155` | 🔐 3D Secure |
| Pago declinado | `4000 0000 0000 9995` | ❌ Rechazado |
| Fondos insuficientes | `4000 0000 0000 9995` | ❌ Sin fondos |

Más tarjetas: https://stripe.com/docs/testing

---

## 📝 Archivo `.env` Completo

Crea este archivo en la raíz del proyecto:

```env
# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# ============================================
# APLICACIÓN
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================
# CLERK (AUTENTICACIÓN)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# ============================================
# STRIPE (PAGOS - MODO TEST)
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PREMIUM_PRICE_ID="price_..."

# ============================================
# STORAGE (OPCIONAL - NO IMPLEMENTADO AÚN)
# ============================================
# SUPABASE_URL=""
# SUPABASE_ANON_KEY=""
# SUPABASE_SERVICE_ROLE_KEY=""
```

⚠️ **NUNCA** subas el archivo `.env` a Git. Ya está en `.gitignore`.

---

## ✅ Lista de Verificación

### Antes de Probar

- [ ] Supabase configurado y tablas creadas
- [ ] Clerk configurado con webhook funcionando
- [ ] Stripe configurado en modo test
- [ ] Archivo `.env` completo
- [ ] Servidor reiniciado después de agregar variables

### Pruebas Funcionales

#### 1. Autenticación
- [ ] Registrar nuevo usuario
- [ ] Usuario aparece en tabla `User` de Supabase
- [ ] Cerrar sesión
- [ ] Iniciar sesión nuevamente

#### 2. Firma (Plan FREE)
- [ ] Cargar un PDF
- [ ] Crear firma
- [ ] Colocar firma en el PDF
- [ ] Exportar PDF firmado
- [ ] Firma aparece en tabla `Signature` de Supabase
- [ ] Intentar firmar segunda vez (debe mostrar límite)

#### 3. Upgrade a Premium
- [ ] Click en "Upgrade to Premium"
- [ ] Completar pago con tarjeta de prueba
- [ ] Plan cambia a `PREMIUM` en Supabase
- [ ] Dashboard muestra plan Premium
- [ ] Firmas restantes: 50

#### 4. Límites Premium
- [ ] Firmar múltiples PDFs
- [ ] Contador de firmas disminuye correctamente
- [ ] Al llegar a 50, mostrar límite alcanzado

---

## 🔧 Comandos Útiles

### Base de Datos (Prisma)
```bash
# Generar cliente de Prisma
npx prisma generate

# Crear/actualizar tablas en la BD
npx prisma db push

# Ver datos en la BD (abre UI)
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name descripcion_cambio
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# En terminal separada: ngrok (para webhooks de Clerk)
ngrok http 3000

# En terminal separada: Stripe CLI (para webhooks de Stripe)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🐛 Solución de Problemas

### Error: "Clerk is not configured"
- ✅ Verifica que las variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` estén en `.env`
- ✅ Reinicia el servidor de desarrollo

### Error: Webhook de Clerk no funciona
- ✅ Verifica que ngrok esté corriendo
- ✅ Actualiza la URL del webhook en Clerk si ngrok cambió de URL
- ✅ Verifica que `CLERK_WEBHOOK_SECRET` sea correcto

### Error: Stripe webhook signature failed
- ✅ Verifica que Stripe CLI esté corriendo: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- ✅ Usa el webhook secret que Stripe CLI te da, no el del dashboard
- ✅ Para producción, usa el secret del dashboard de Stripe

### Error: Cannot connect to database
- ✅ Verifica que `DATABASE_URL` sea correcta
- ✅ Verifica que hayas reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- ✅ Verifica que el proyecto de Supabase esté activo

### Los PDFs no se cargan
- ✅ Verifica que estés usando webpack: `npm run dev -- --webpack`
- ✅ El script en `package.json` ya debería incluir `--webpack`

---

## 🚀 Próximos Pasos

Una vez que todo funcione en desarrollo:

1. **Deploy a Vercel** (staging)
2. **Configurar dominio personalizado**
3. **Activar Stripe en modo Live**
4. **Configurar webhooks de producción**
5. **Agregar analytics (opcional)**
6. **Testing con usuarios reales**
7. **Lanzamiento oficial** 🎉

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Clerk](https://clerk.com/docs)
- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 💡 Consejos

- 🔄 **Reinicia el servidor** cada vez que cambies el `.env`
- 📝 **Documenta todo** lo que configures (passwords, URLs, etc.)
- 🧪 **Usa datos de prueba** siempre en desarrollo
- 💾 **Haz backups** de tu base de datos antes de migraciones importantes
- 🔒 **Nunca compartas** tus secrets o API keys

---

**¿Listo para configurar?** Empieza con Supabase (Paso 1) y ve avanzando. ¡Cualquier duda, revisa esta guía! 🚀
