// Supabase Edge Function: verify-lead-otp
// Deploy: supabase functions deploy verify-lead-otp
// Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { lead_id, otp_code, phone } = await req.json();

    if (!lead_id || !otp_code || !phone) {
      return new Response(
        JSON.stringify({ error: "lead_id, otp_code, and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP via Twilio Verify API
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const twilioAuthToken  = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const twilioServiceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID")!;

    const twilioUrl = `https://verify.twilio.com/v2/Services/${twilioServiceSid}/VerificationCheck`;

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
      },
      body: new URLSearchParams({ To: phone, Code: otp_code }),
    });

    const twilioData = await twilioRes.json();

    if (twilioData.status !== "approved") {
      return new Response(
        JSON.stringify({ error: "Invalid or expired OTP" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OTP verified — activate the lead
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("leads")
      .update({ otp_verified: true, active: true })
      .eq("id", lead_id);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Lead verified and activated" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
