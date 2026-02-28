import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()

    if (!id) {
      throw new Error('Manager ID is required')
    }

    // Initialize Supabase client with the Service Role key
    // This bypasses RLS and allows deleting users
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )

    // 1. Delete the user from Supabase Auth completely
    const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(id)

    if (deleteAuthError) {
      console.error('Auth deletion error:', deleteAuthError)
      throw new Error(deleteAuthError?.message ?? 'Failed to delete user from Auth service')
    }

    // 2. Delete their manager profile 
    // (Note: Depending on foreign key constraints, this might happen automatically on cascade, 
    // but we do it explicitly to be safe if no CASCADE is defined)
    const { error: deleteProfileError } = await supabaseClient
      .from('manager_profiles')
      .delete()
      .eq('id', id)

    if (deleteProfileError) {
      console.error('Profile deletion error:', deleteProfileError)
      throw new Error(deleteProfileError?.message ?? 'Failed to delete manager profile')
    }

    return new Response(
      JSON.stringify({ success: true, id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
