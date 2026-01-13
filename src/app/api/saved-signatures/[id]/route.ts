import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSavedSignatureById, updateSavedSignature, deleteSavedSignature } from '@/lib/db/queries';

// PUT /api/saved-signatures/[id] - Update a saved signature
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, imageData } = body;

    // Verify the signature belongs to the user
    const existingSignature = await getSavedSignatureById(id, user.id);
    if (!existingSignature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    // Validate imageData if provided
    if (imageData && !imageData.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    const signature = await updateSavedSignature(id, user.id, { name, imageData });

    return NextResponse.json({ signature }, { status: 200 });
  } catch (error) {
    console.error('Error updating saved signature:', error);
    return NextResponse.json({ error: 'Error updating signature' }, { status: 500 });
  }
}

// DELETE /api/saved-signatures/[id] - Delete a saved signature
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the signature belongs to the user
    const existingSignature = await getSavedSignatureById(id, user.id);
    if (!existingSignature) {
      return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    }

    await deleteSavedSignature(id, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting saved signature:', error);
    return NextResponse.json({ error: 'Error deleting signature' }, { status: 500 });
  }
}
