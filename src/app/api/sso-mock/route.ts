import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// We require the Service Role Key to bypass Row Level Security (RLS) on the sso_mock_accounts table.
// If it's not set in .env.local, we'll fall back to anon key but that might fail if RLS isn't configured for it.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('sso_mock_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error (GET):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error (GET):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('sso_mock_accounts')
      .insert([body])
      .select();

    if (error) {
      console.error('Supabase Error (POST):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error (POST):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('sso_mock_accounts')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase Error (PUT):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error (PUT):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const { error } = await supabaseAdmin
      .from('sso_mock_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error (DELETE):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
