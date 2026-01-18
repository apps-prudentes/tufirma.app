# 📋 Plan de Implementación: Sistema de Créditos

## Resumen Ejecutivo
Cambiar de modelo de suscripción mensual (FREE, BASICO, PREMIUM) a modelo de **créditos prepagados** que nunca vencen.

### Cambios Principales:
1. **DB Schema**: Agregar tabla `credit_packages` y actualizar `user_credits`
2. **API Stripe**: Crear endpoints para vender créditos (no suscripciones)
3. **API Firmas**: Descontar créditos al firmar (en lugar de verificar plan)
4. **Frontend**: Mostrar balance de créditos, tienda de créditos
5. **Lógica de Autenticación**: Cambiar de verificación de plan a verificación de créditos

---

## Fase 1: Cambios en Base de Datos (Drizzle)

### Paso 1.1: Crear tabla `credit_packages`

**Archivo**: `src/lib/db/schema.ts`

```typescript
// Agregar al final del archivo schema.ts

export const creditPackages = pgTable('credit_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // "Bolsa Chica", "Bolsa Media", etc
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // En MXN
  creditAmount: integer('credit_amount').notNull(), // Número de firmas
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  order: integer('order').notNull().default(0), // Para ordenar en UI
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CreditPackage = typeof creditPackages.$inferSelect;
export type NewCreditPackage = typeof creditPackages.$inferInsert;
```

### Paso 1.2: Actualizar tabla `profiles`

**Cambio**: Reemplazar columna `plan` por `totalCreditsEver` (solo tracking)

```typescript
// En schema.ts, actualizar profiles table:

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  plan: text('plan').notNull().default('FREE'), // Mantener para legacy, pero no usaremos
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  totalCreditsEver: integer('total_credits_ever').notNull().default(0), // Total acumulado
});
```

### Paso 1.3: Crear tabla `user_credits`

**Archivo**: `src/lib/db/schema.ts`

```typescript
export const userCredits = pgTable('user_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id), // FK
  balance: integer('balance').notNull().default(0), // Créditos disponibles
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserCredit = typeof userCredits.$inferSelect;
export type NewUserCredit = typeof userCredits.$inferInsert;
```

### Paso 1.4: Crear tabla `credit_transactions`

**Archivo**: `src/lib/db/schema.ts`

```typescript
export const creditTransactions = pgTable('credit_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id), // FK
  type: text('type').notNull(), // 'purchase' | 'use' | 'refund'
  amount: integer('amount').notNull(), // Cantidad de créditos (positivo o negativo)
  description: text('description'),
  relatedSignatureId: uuid('related_signature_id'), // Para tipo 'use'
  relatedPaymentId: text('related_payment_id'), // Para tipo 'purchase' (Stripe)
  balance: integer('balance').notNull(), // Balance después de esta transacción
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
```

### Paso 1.5: Ejecutar migración
```bash
npm run db:push
```

---

## Fase 2: Nuevas Funciones en Base de Datos (Queries)

### Paso 2.1: Agregar a `src/lib/db/queries.ts`

```typescript
// ============ Credit Packages ============

export async function getCreditPackages(): Promise<CreditPackage[]> {
  const result = await db
    .select()
    .from(creditPackages)
    .where(eq(creditPackages.isActive, true))
    .orderBy(creditPackages.order);
  return result;
}

export async function getCreditPackageById(id: string): Promise<CreditPackage | undefined> {
  const [pkg] = await db.select().from(creditPackages).where(eq(creditPackages.id, id));
  return pkg;
}

// ============ User Credits ============

export async function getUserCredits(userId: string): Promise<UserCredit | undefined> {
  const [credits] = await db.select().from(userCredits).where(eq(userCredits.userId, userId));
  return credits;
}

export async function getOrCreateUserCredits(userId: string): Promise<UserCredit> {
  let credits = await getUserCredits(userId);
  if (!credits) {
    const [newCredits] = await db
      .insert(userCredits)
      .values({
        userId,
        balance: 1, // 1 firma gratis por semana
      })
      .returning();
    return newCredits;
  }
  return credits;
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  relatedPaymentId?: string
): Promise<CreditTransaction> {
  // Obtener balance actual
  const userCredit = await getOrCreateUserCredits(userId);
  const newBalance = userCredit.balance + amount;

  // Actualizar balance
  await db
    .update(userCredits)
    .set({ balance: newBalance, updatedAt: new Date() })
    .where(eq(userCredits.userId, userId));

  // Crear transacción
  const [transaction] = await db
    .insert(creditTransactions)
    .values({
      userId,
      type: 'purchase',
      amount,
      description,
      relatedPaymentId,
      balance: newBalance,
    })
    .returning();

  return transaction;
}

export async function useCredits(
  userId: string,
  amount: number,
  relatedSignatureId: string
): Promise<CreditTransaction> {
  // Obtener balance actual
  const userCredit = await getOrCreateUserCredits(userId);
  const newBalance = Math.max(0, userCredit.balance - amount);

  // Actualizar balance
  await db
    .update(userCredits)
    .set({ balance: newBalance, updatedAt: new Date() })
    .where(eq(userCredits.userId, userId));

  // Crear transacción
  const [transaction] = await db
    .insert(creditTransactions)
    .values({
      userId,
      type: 'use',
      amount: -amount,
      description: `Firma en PDF #${relatedSignatureId}`,
      relatedSignatureId,
      balance: newBalance,
    })
    .returning();

  return transaction;
}

export async function getCreditHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
  const result = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
  return result;
}
```

---

## Fase 3: Nuevos Endpoints de API

### Paso 3.1: Obtener Paquetes de Créditos

**Archivo**: `src/app/api/credits/packages/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getCreditPackages } from '@/lib/db/queries';

export async function GET() {
  try {
    const packages = await getCreditPackages();
    return NextResponse.json({ packages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json({ error: 'Error fetching packages' }, { status: 500 });
  }
}
```

### Paso 3.2: Obtener Balance de Usuario

**Archivo**: `src/app/api/credits/balance/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserCredits, getCreditHistory } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await getOrCreateUserCredits(user.id);
    const history = await getCreditHistory(user.id, 10);

    return NextResponse.json({
      balance: credits.balance,
      history,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json({ error: 'Error fetching balance' }, { status: 500 });
  }
}
```

### Paso 3.3: Crear Sesión de Checkout (Actualizado para Créditos)

**Archivo**: `src/app/api/stripe/create-checkout-session/route.ts` (REEMPLAZAR COMPLETAMENTE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { getProfileById, updateProfile, createProfile, getCreditPackageById } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener packageId del body
    const body = await req.json();
    const packageId = body.packageId;

    if (!packageId) {
      return NextResponse.json({ error: 'packageId required' }, { status: 400 });
    }

    // Obtener paquete de créditos
    const creditPackage = await getCreditPackageById(packageId);
    if (!creditPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Get or create profile
    let profile = await getProfileById(user.id);
    if (!profile) {
      profile = await createProfile(user.id);
    }

    // If user doesn't have a stripeCustomerId, create a customer in Stripe
    let stripeCustomerId = profile.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || '',
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;
      await updateProfile(user.id, { stripeCustomerId });
    }

    // Create a checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // ONE-TIME PAYMENT, not subscription
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: creditPackage.name,
              description: `${creditPackage.creditAmount} firmas - ${creditPackage.description}`,
            },
            unit_amount: Math.round(parseFloat(creditPackage.price) * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        userId: user.id,
        packageId: creditPackage.id,
        creditAmount: creditPackage.creditAmount.toString(),
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
```

### Paso 3.4: Webhook (Actualizado para Créditos)

**Archivo**: `src/app/api/webhooks/stripe/route.ts` (ACTUALIZAR checkout.session.completed)

```typescript
// En la sección de 'checkout.session.completed', reemplazar con:

case 'checkout.session.completed':
  {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const packageId = session.metadata?.packageId;
    const creditAmount = parseInt(session.metadata?.creditAmount || '0');

    console.log('=== CHECKOUT SESSION COMPLETED ===');
    console.log('Session ID:', session.id);
    console.log('User ID:', userId);
    console.log('Package ID:', packageId);
    console.log('Credits:', creditAmount);

    if (userId && packageId && creditAmount > 0 && session.customer) {
      // Update profile with customer ID
      await updateProfile(userId, {
        stripeCustomerId: session.customer as string
      });

      // Add credits to user
      await addCredits(userId, creditAmount, `Compra de ${creditAmount} créditos`, session.payment_intent as string);
      console.log('Credits added successfully');
    }
  }
  break;
```

### Paso 3.5: Endpoint para Verificar Créditos Disponibles

**Archivo**: `src/app/api/credits/check-available/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserCredits } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const credits = await getOrCreateUserCredits(user.id);

    return NextResponse.json({
      canSign: credits.balance > 0,
      remaining: credits.balance,
      message: `Tienes ${credits.balance} créditos disponibles`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking credits:', error);
    return NextResponse.json({ error: 'Error checking credits' }, { status: 500 });
  }
}
```

---

## Fase 4: Actualizar Endpoint de Firmar PDF

### Paso 4.1: Actualizar `src/lib/utils/signatureLimits.ts`

```typescript
// Agregar función para verificar créditos

export async function checkCredits(): Promise<{
  hasCredits: boolean;
  remaining: number;
  canSign: boolean;
}> {
  try {
    const response = await fetch('/api/credits/check-available');

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('User not authenticated');
      }
      throw new Error('Error checking credits');
    }

    const data = await response.json();
    return {
      hasCredits: data.canSign,
      remaining: data.remaining,
      canSign: data.canSign,
    };
  } catch (error) {
    console.error('Error checking credits:', error);
    throw error;
  }
}

// Agregar función para usar un crédito

export async function useCredit(signatureId: string): Promise<{
  success: boolean;
  remainingCredits: number;
}> {
  try {
    const response = await fetch('/api/credits/use', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signatureId }),
    });

    if (!response.ok) {
      throw new Error('Error using credit');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error using credit:', error);
    throw error;
  }
}
```

### Paso 4.2: Crear endpoint para usar crédito

**Archivo**: `src/app/api/credits/use/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateUserCredits, useCredits } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const signatureId = body.signatureId;

    if (!signatureId) {
      return NextResponse.json({ error: 'signatureId required' }, { status: 400 });
    }

    // Verificar que tiene créditos
    const userCredits = await getOrCreateUserCredits(user.id);
    if (userCredits.balance <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // Usar 1 crédito
    await useCredits(user.id, 1, signatureId);

    // Obtener nuevo balance
    const updatedCredits = await getOrCreateUserCredits(user.id);

    return NextResponse.json({
      success: true,
      remainingCredits: updatedCredits.balance,
    }, { status: 200 });
  } catch (error) {
    console.error('Error using credit:', error);
    return NextResponse.json({ error: 'Error using credit' }, { status: 500 });
  }
}
```

---

## Fase 5: Actualizar Frontend

### Paso 5.1: Nueva página `/shop` o sección en dashboard

**Crear**: `src/app/(dashboard)/shop/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CreditPackage {
  id: string;
  name: string;
  price: string;
  creditAmount: number;
  description?: string;
}

export default function ShopPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/credits/packages');
      const data = await response.json();
      setPackages(data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (packageId: string) => {
    setCheckoutLoading(packageId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar compra');
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-20">Cargando paquetes...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/logo2.png"
              alt="Logo"
              width={150}
              height={50}
              className="h-12 w-auto cursor-pointer hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Comprar Créditos</h1>
          <p className="text-lg text-gray-600">Selecciona el paquete que mejor se adapte a ti. Los créditos nunca vencen.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="text-4xl font-bold">${pkg.price}</div>
                  <div className="text-lg text-gray-600">{pkg.creditAmount} firmas</div>
                  <p className="text-sm text-gray-500">
                    ${(parseFloat(pkg.price) / pkg.creditAmount).toFixed(2)} por firma
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleBuyCredits(pkg.id)}
                  disabled={checkoutLoading === pkg.id}
                >
                  {checkoutLoading === pkg.id ? 'Procesando...' : 'Comprar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Paso 5.2: Actualizar Dashboard para mostrar Créditos

**Modificar**: `src/app/(dashboard)/dashboard/page.tsx`

```typescript
// Reemplazar la lógica de límites con créditos

const [credits, setCredits] = useState<{ balance: number; history: any[] } | null>(null);

useEffect(() => {
  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/balance');
      const data = await response.json();
      setCredits(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  fetchCredits();
}, []);

// En el render, mostrar:
<div className="text-5xl font-bold text-green-600">
  {credits?.balance || 0}
</div>
<p className="text-sm text-gray-500">créditos disponibles</p>
<Button asChild>
  <Link href="/shop">Comprar Créditos</Link>
</Button>
```

---

## Fase 6: Configuración de Paquetes Iniciales

### Paso 6.1: Script para insertar paquetes de créditos

**Crear**: `scripts/seed-credit-packages.ts` o ejecutar manualmente

```typescript
import { db } from '@/lib/db/index';
import { creditPackages } from '@/lib/db/schema';

const packages = [
  {
    name: 'Bolsa Chica',
    price: '7.99',
    creditAmount: 3,
    description: '3 firmas - Perfecto para probar',
    order: 1,
  },
  {
    name: 'Bolsa Media',
    price: '19.99',
    creditAmount: 12,
    description: '12 firmas - El más popular',
    order: 2,
  },
  {
    name: 'Bolsa Pro',
    price: '49.99',
    creditAmount: 40,
    description: '40 firmas - Para profesionales',
    order: 3,
  },
];

// Insertar en base de datos
await db.insert(creditPackages).values(packages);
```

---

## Fase 7: Checklist de Implementación

### Base de Datos
- [ ] Ejecutar `npm run db:push` para migrar schema
- [ ] Verificar que se crearon las 3 nuevas tablas

### API
- [ ] Crear endpoint `/api/credits/packages`
- [ ] Crear endpoint `/api/credits/balance`
- [ ] Crear endpoint `/api/credits/check-available`
- [ ] Crear endpoint `/api/credits/use`
- [ ] Actualizar `/api/stripe/create-checkout-session`
- [ ] Actualizar webhook en `/api/webhooks/stripe/route.ts`

### Frontend
- [ ] Crear página `/shop`
- [ ] Actualizar dashboard para mostrar créditos
- [ ] Actualizar endpoint de firma para descontar créditos
- [ ] Actualizar componente de verificación de permisos

### Testing
- [ ] Probar compra de paquete chico ($7.99)
- [ ] Probar compra de paquete medio ($19.99)
- [ ] Probar que créditos se restan al firmar
- [ ] Probar que historial de transacciones se guarda
- [ ] Probar que no puedes firmar sin créditos

### Deployment
- [ ] Deploy a Vercel
- [ ] Actualizar paquetes en Stripe Dashboard (opcional - automático)
- [ ] Testear flujo completo en producción

---

## Fase 8: Rollback/Contingencia

Si algo sale mal:

1. **Mantener tabla `profiles.plan`** (no eliminarla) por si necesitas volver atrás
2. **Mantener lógica de verificación antigua** como fallback
3. **Script de rollback**: Guardar créditos en plan equivalente (si es necesario)

---

## Notas Importantes

- **Créditos gratis**: Los usuarios nuevos obtienen 1 crédito gratis al registrarse (1 firma/semana)
- **Sin expiración**: Los créditos NUNCA vencen (ventaja competitiva)
- **Historial**: Guardar transacciones completas para auditoría y debugging
- **Stripe**: Cambiar de "subscription" a "payment" (compra única)
- **IVA**: Agregar IVA automáticamente en Stripe (16% en México)
