# 🔐 Guía de Configuración de Stripe - Sistema de Créditos

## Situación Actual

### Antes (Sistema Antiguo - Suscripción)
Tenías 2 productos de suscripción mensual:
- **PREMIUM** ($95 MXN/mes) - 50 firmas/mes
- **BASICO** ($15 MXN/mes) - 10 firmas/mes

Con precios:
- `STRIPE_PREMIUM_PRICE_ID` = `price_1Spt...` (suscripción)
- `STRIPE_BASIC_PRICE_ID` = `price_1Spt...` (suscripción)

### Ahora (Sistema Nuevo - Créditos)
Tienes 3 productos de **PAGO ÚNICO**:
- **Bolsa Chica** ($7.99 MXN) - 3 firmas
- **Bolsa Media** ($24.99 MXN) - 12 firmas
- **Bolsa Pro** ($49.99 MXN) - 40 firmas

---

## Paso 1: Ir a Dashboard de Stripe

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Selecciona tu cuenta
3. Ve a **Catalogs** → **Products** (o **Catálogo** → **Productos**)

---

## Paso 2: Qué Hacer con los Productos Viejos

### Opción A: Dejarlos (Recomendado)
✅ Mantenlos por si alguien tiene una suscripción activa
- No eliminarlos evita problemas con clientes existentes
- Stripe seguirá facturando a los que estén suscritos
- Puedes dejar que expiren naturalmente

### Opción B: Archivarlos
⚠️ Si quieres limpiar pero mantener referencia:
1. Click en el producto (PREMIUM)
2. Click en los 3 puntos (⋮) → **Archive**
3. Repetir con BASICO

### Opción C: Eliminarlos
❌ NO RECOMENDADO si tienes clientes activos
- Rompe referencias históricas
- Problemas con facturas

**Recomendación Final**: Déjalos como están. No interfieren.

---

## Paso 3: Crear los 3 Nuevos Productos de Créditos

### Crear Producto 1: "Bolsa Chica"

**En Stripe Dashboard:**
1. Click en **+ Add Product**
2. Rellena:
   - **Name**: `Bolsa Chica`
   - **Description**: `3 firmas - Perfecto para probar`
   - **Type**: `One-time payments` (IMPORTANTE: no recurrente)
   - **Default Price**:
     - **Currency**: `MXN`
     - **Amount**: `7.99`
3. Click en **Save product**

**Copiar el Price ID** que se genera (algo como `price_1Sq4...Bolsa...`)

---

### Crear Producto 2: "Bolsa Media"

Repetir proceso anterior pero con:
- **Name**: `Bolsa Media`
- **Description**: `12 firmas - El más popular`
- **Amount**: `24.99`

**Copiar el Price ID**

---

### Crear Producto 3: "Bolsa Pro"

Repetir proceso anterior pero con:
- **Name**: `Bolsa Pro`
- **Description**: `40 firmas - Para profesionales`
- **Amount**: `49.99`

**Copiar el Price ID**

---

## Paso 4: Guardar los Price IDs en Variables de Entorno

Los Price IDs que copiaste, agrégalos a tu `.env.local`:

```bash
# Viejos (mantener por referencia, pero no usarlos)
# STRIPE_PREMIUM_PRICE_ID=price_1Spt...
# STRIPE_BASIC_PRICE_ID=price_1Spt...

# Nuevos - Créditos (estos SÍ usaremos, pero los guardamos en BD)
# Nota: Ya NO los necesitamos en .env porque se guardan en la tabla credit_packages
```

---

## Paso 5: Insertar los Paquetes en la Base de Datos

Ahora necesitas agregar los paquetes de créditos a la tabla `credit_packages`.

### Opción A: Ejecutar Query SQL Directamente

1. Ve a Supabase → **SQL Editor**
2. Copia y ejecuta esto:

```sql
INSERT INTO credit_packages (name, price, credit_amount, description, is_active, "order")
VALUES
  ('Bolsa Chica', '7.99', 3, '3 firmas - Perfecto para probar', true, 1),
  ('Bolsa Media', '24.99', 12, '12 firmas - El más popular', true, 2),
  ('Bolsa Pro', '49.99', 40, '40 firmas - Para profesionales', true, 3);
```

**Verifica que se insertaron correctamente:**
```sql
SELECT id, name, price, credit_amount FROM credit_packages ORDER BY "order";
```

Deberías ver 3 filas con los IDs generados (UUIDs).

---

### Opción B: Crear Script en TypeScript (Más Limpio)

**Crear archivo**: `scripts/seed-credit-packages.ts`

```typescript
import { db } from '@/lib/db/index';
import { creditPackages } from '@/lib/db/schema';

async function seedCreditPackages() {
  try {
    const packages = await db
      .insert(creditPackages)
      .values([
        {
          name: 'Bolsa Chica',
          price: '7.99',
          creditAmount: 3,
          description: '3 firmas - Perfecto para probar',
          isActive: true,
          order: 1,
        },
        {
          name: 'Bolsa Media',
          price: '24.99',
          creditAmount: 12,
          description: '12 firmas - El más popular',
          isActive: true,
          order: 2,
        },
        {
          name: 'Bolsa Pro',
          price: '49.99',
          creditAmount: 40,
          description: '40 firmas - Para profesionales',
          isActive: true,
          order: 3,
        },
      ])
      .returning();

    console.log('✅ Credit packages seeded:', packages);
  } catch (error) {
    console.error('❌ Error seeding credit packages:', error);
  }
}

seedCreditPackages();
```

Ejecutar con:
```bash
npx ts-node scripts/seed-credit-packages.ts
```

---

## Paso 6: Verificar Configuración

### ✅ Checklist de Stripe

- [ ] Visitaste [dashboard.stripe.com](https://dashboard.stripe.com)
- [ ] Tienes 3 nuevos productos de **pago único** (no suscripción)
- [ ] Cada producto tiene un precio en MXN
- [ ] Copiaste correctamente los Price IDs
- [ ] El webhook está apuntando a `https://tufirma.app/api/webhooks/stripe`
- [ ] El webhook tiene los eventos: `checkout.session.completed`, `payment_intent.succeeded`, etc.

### ✅ Checklist de Base de Datos

- [ ] La tabla `credit_packages` tiene 3 filas
- [ ] Los precios son: 7.99, 24.99, 49.99
- [ ] Los créditos son: 3, 12, 40
- [ ] El campo `is_active` es `true` para los 3

**Query de verificación:**
```sql
SELECT id, name, price, credit_amount, is_active, "order" FROM credit_packages;
```

---

## Paso 7: Actualizar Variables de Entorno (Opcional)

Si quieres mantener referencia a los viejos precios (por si acaso):

```bash
# Viejos - Por referencia/historial
STRIPE_PREMIUM_PRICE_ID=price_1Spt...xxx
STRIPE_BASIC_PRICE_ID=price_1Spt...yyy

# Nuevos - Créditos (NO necesario en .env, están en BD)
# Los Price IDs de los nuevos productos se guardan conceptualmente en credit_packages
# pero técnicamente no los necesitamos en .env porque todo es "one-time payment"
```

---

## Paso 8: Futuro - Si Quieres Limitar Usuarios

### Opción A: Bloquear después de X firmas por período

**Ejemplo**: Omar solo puede firmar 100 PDFs por mes

**Implementación** (pseudocódigo):
```typescript
// En /api/signatures/register
const monthSignatures = await countSignatures(userId, startOfMonth, endOfMonth);
if (monthSignatures >= 100) {
  return { error: 'Límite de 100 firmas por mes alcanzado' };
}
```

---

### Opción B: Limitar por rol o tipo de usuario

**Tabla nueva** (futura):
```typescript
export const userLimits = pgTable('user_limits', {
  userId: uuid('user_id').primaryKey(),
  maxSignaturesPerMonth: integer('max_signatures_per_month').default(Infinity),
  maxSignaturesPerWeek: integer('max_signatures_per_week').default(Infinity),
  roleType: text('role_type').default('user'), // 'user' | 'premium' | 'admin'
});
```

---

### Opción C: Limitar por cliente/empresa (B2B)

**Tabla nueva** (futura):
```typescript
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  maxSignaturesPerMonth: integer('max_signatures_per_month'),
});

export const organizationMembers = pgTable('organization_members', {
  userId: uuid('user_id'),
  organizationId: uuid('organization_id'),
  role: text('role'), // 'admin' | 'member'
});
```

---

## Resumen

| Acción | Responsable |
|--------|------------|
| Crear 3 nuevos productos en Stripe | **TÚ** (manual en dashboard) |
| Insertar paquetes en `credit_packages` | **TÚ** (SQL o script) |
| Webhook ya está configurado | ✅ Ya hecho |
| Backend listo para procesar compras | ✅ Ya hecho |
| Frontend aún no implementado | ⏳ Próxima fase |

---

## Problemas Comunes

### ❌ "Error: price_data.unit_amount must be an integer"
**Solución**: Stripe espera centavos. Así que $7.99 = 799 centavos.
```javascript
unit_amount: Math.round(parseFloat(creditPackage.price) * 100) // ✅ Correcto
```

### ❌ "No such customer: 'cus_...'"
**Solución**: El cliente de Stripe fue eliminado. El webhook creará uno nuevo automáticamente.

### ❌ "Webhook not reaching my endpoint"
**Verificar:**
1. URL correcta: `https://tufirma.app/api/webhooks/stripe` (sin `/api/stripe`)
2. Middleware permite webhooks sin autenticación
3. Firma del webhook es válida

---

## Siguientes Pasos

Una vez completes esto:
1. ✅ Paquetes en BD
2. ✅ Stripe configurado
3. ⏳ Crear página `/shop` para que usuarios compren créditos
4. ⏳ Integrar descuento de créditos en el flujo de firma
5. ⏳ Dashboard mostrando balance de créditos
