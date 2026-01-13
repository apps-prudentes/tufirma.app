import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSavedSignatures, createSavedSignature } from '@/lib/db/queries';

// GET /api/saved-signatures - Get all saved signatures for the current user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const signatures = await getSavedSignatures(user.id);

    return NextResponse.json({ signatures }, { status: 200 });
  } catch (error) {
    console.error('Error fetching saved signatures:', error);
    return NextResponse.json({ error: 'Error fetching signatures' }, { status: 500 });
  }
}

// POST /api/saved-signatures - Create a new saved signature
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, imageData } = body;

    if (!name || !imageData) {
      return NextResponse.json({ error: 'Name and imageData are required' }, { status: 400 });
    }

    // Validate that imageData is a valid data URL
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    const signature = await createSavedSignature({
      userId: user.id,
      name,
      imageData,
    });

    return NextResponse.json({ signature }, { status: 201 });
  } catch (error) {
    console.error('Error creating saved signature:', error);
    return NextResponse.json({ error: 'Error creating signature' }, { status: 500 });
  }
}
