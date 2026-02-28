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
    const { email, role, status = 'invited', display_name = null } = await req.json()

    if (!email || !role) {
      throw new Error('Email and role are required fields')
    }

    // Initialize Supabase client with the Service Role key
    // This bypasses RLS and allows inviting users
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

    // 1. Invite the user via the Auth Admin API
    const { data: inviteData, error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      { data: { role: role.trim() } }
    )

    if (inviteError || !inviteData?.user) {
      console.error('Auth invite error:', inviteError)
      throw new Error(inviteError?.message ?? 'Failed to invite user via Auth service')
    }

    const userId = inviteData.user.id

    // 2. Add their profile to manager_profiles
    const { data: profileData, error: profileError } = await supabaseClient
      .from('manager_profiles')
      .upsert(
        {
          id: userId,
          email: email.trim().toLowerCase(),
          role: role.trim(),
          status: status,
          display_name: display_name?.trim() || null,
        },
        { onConflict: 'id' }
      )
      .select('id, email, role, status, display_name, last_sign_in_at')
      .single()

    if (profileError || !profileData) {
      console.error('Profile creation error:', profileError)
      throw new Error(profileError?.message ?? 'Failed to save manager profile')
    }

    // 3. Return the newly created profile data
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
