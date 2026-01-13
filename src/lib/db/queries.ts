import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { db } from './index';
import { profiles, signatures, savedSignatures, type Profile, type Signature, type SavedSignature, type NewSavedSignature } from './schema';

// Profile operations
export async function getProfileById(id: string): Promise<Profile | undefined> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
  return profile;
}

export async function createProfile(userId: string): Promise<Profile> {
  const now = new Date();

  const result = await db.execute(sql`
    INSERT INTO profiles (id, plan, stripe_customer_id, created_at, updated_at)
    VALUES (${userId}::uuid, 'FREE'::"plan", NULL, ${now}, ${now})
    ON CONFLICT (id) DO UPDATE SET
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `);

  return result[0] as Profile;
}

export async function updateProfile(id: string, data: { plan?: string; stripeCustomerId?: string | null }): Promise<Profile> {
  const now = new Date();

  // Build update object
  const updateData: any = { updatedAt: now };

  if (data.plan) {
    updateData.plan = data.plan;
  }

  if (data.stripeCustomerId !== undefined) {
    updateData.stripeCustomerId = data.stripeCustomerId;
  }

  const [result] = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.id, id))
    .returning();

  return result;
}

export async function getProfileByStripeCustomerId(stripeCustomerId: string): Promise<Profile | undefined> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.stripeCustomerId, stripeCustomerId));
  return profile;
}

// Signature operations
export async function createSignature(data: { userId: string; fileName: string; weekNumber: string; monthYear: string }): Promise<Signature> {
  const id = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const [signature] = await db.insert(signatures).values({
    id,
    userId: data.userId as any,
    fileName: data.fileName,
    signedAt: new Date(),
    weekNumber: data.weekNumber,
    monthYear: data.monthYear,
  }).returning();
  return signature;
}

export async function countSignatures(userId: string, startDate: Date, endDate: Date): Promise<number> {
  const result = await db
    .select()
    .from(signatures)
    .where(
      and(
        eq(signatures.userId, userId as any),
        gte(signatures.signedAt, startDate),
        lte(signatures.signedAt, endDate)
      )
    );
  return result.length;
}

// Saved Signatures operations (signature library)
export async function getSavedSignatures(userId: string): Promise<SavedSignature[]> {
  const result = await db
    .select()
    .from(savedSignatures)
    .where(eq(savedSignatures.userId, userId as any))
    .orderBy(savedSignatures.createdAt);
  return result;
}

export async function getSavedSignatureById(id: string, userId: string): Promise<SavedSignature | undefined> {
  const [signature] = await db
    .select()
    .from(savedSignatures)
    .where(
      and(
        eq(savedSignatures.id, id as any),
        eq(savedSignatures.userId, userId as any)
      )
    );
  return signature;
}

export async function createSavedSignature(data: { userId: string; name: string; imageData: string }): Promise<SavedSignature> {
  const [signature] = await db
    .insert(savedSignatures)
    .values({
      userId: data.userId as any,
      name: data.name,
      imageData: data.imageData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return signature;
}

export async function updateSavedSignature(id: string, userId: string, data: { name?: string; imageData?: string }): Promise<SavedSignature> {
  const updateData: any = { updatedAt: new Date() };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.imageData !== undefined) {
    updateData.imageData = data.imageData;
  }

  const [signature] = await db
    .update(savedSignatures)
    .set(updateData)
    .where(
      and(
        eq(savedSignatures.id, id as any),
        eq(savedSignatures.userId, userId as any)
      )
    )
    .returning();
  return signature;
}

export async function deleteSavedSignature(id: string, userId: string): Promise<void> {
  await db
    .delete(savedSignatures)
    .where(
      and(
        eq(savedSignatures.id, id as any),
        eq(savedSignatures.userId, userId as any)
      )
    );
}
