import { pgTable, text, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['FREE', 'BASICO', 'PREMIUM']);

// Supabase Auth creates auth.users automatically
// We create a profiles table that references it
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users(id)
  plan: planEnum('plan').notNull(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const signatures = pgTable('signatures', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull(), // References auth.users(id)
  fileName: text('file_name').notNull(),
  signedAt: timestamp('signed_at').notNull(),
  weekNumber: text('week_number').notNull(),
  monthYear: text('month_year').notNull(),
});

// Saved signatures library - stores user's reusable signatures
export const savedSignatures = pgTable('saved_signatures', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References auth.users(id)
  name: text('name').notNull(), // User-friendly name like "Formal", "Initial", "Rubric"
  imageData: text('image_data').notNull(), // Base64 data URL of the signature
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Signature = typeof signatures.$inferSelect;
export type NewSignature = typeof signatures.$inferInsert;
export type SavedSignature = typeof savedSignatures.$inferSelect;
export type NewSavedSignature = typeof savedSignatures.$inferInsert;
