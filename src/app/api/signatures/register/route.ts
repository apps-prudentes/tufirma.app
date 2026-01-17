import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileById, createSignature, createProfile, getUserCredits, useCredits } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get fileName from request body
    const body = await req.json();
    const { fileName } = body;

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    // Get or create profile
    let profile = await getProfileById(user.id);
    if (!profile) {
      profile = await createProfile(user.id);
    }

    // Check user's credit balance
    const userCredits = await getUserCredits(user.id);

    if (!userCredits || userCredits.balance < 1) {
      return NextResponse.json({
        error: 'Insufficient credits. Please purchase more signatures.',
        remaining: userCredits?.balance || 0
      }, { status: 402 });
    }

    // Deduct 1 credit from user
    const transactionId = await useCredits(user.id, 1, `Firma de PDF: ${fileName}`);

    // Register the new signature
    const now = new Date();
    const weekNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(getWeekNumber(now)).padStart(2, '0')}`;
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const newSignature = await createSignature({
      userId: user.id,
      fileName,
      weekNumber,
      monthYear,
    });

    return NextResponse.json({
      success: true,
      signature: newSignature,
      message: 'Signature registered successfully',
    }, { status: 200 });
  } catch (error) {
    console.error('Error registering signature:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get week number
function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
