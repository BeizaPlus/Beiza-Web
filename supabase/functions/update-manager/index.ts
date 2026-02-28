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
    const { id, role, status = 'invited', display_name = null } = await req.json()

    if (!id || !role) {
      throw new Error('ID and role are required fields')
    }

    // Initialize Supabase client with the Service Role key
    // This bypasses RLS and allows updating users
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

    // Update the profile in manager_profiles
    const { data: profileData, error: profileError } = await supabaseClient
      .from('manager_profiles')
      .update({
        role: role.trim(),
        status: status,
        display_name: display_name?.trim() || null,
      })
      .eq("id", id)
      .select('id, email, role, status, display_name, last_sign_in_at')
      .single()

    if (profileError || !profileData) {
      console.error('Profile update error:', profileError)
      throw new Error(profileError?.message ?? 'Failed to update manager profile')
    }

    // Return the updated profile data
    return new Response(
      JSON.stringify(profileData),
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
