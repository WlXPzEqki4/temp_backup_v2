
// Follow Deno APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for the response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle pre-flight OPTIONS request
const handleOptions = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: new Headers(corsHeaders),
    });
  }
  return null;
};

// Validate required parameters
const validateParams = (params: any) => {
  const errors = [];
  
  if (!params.userClassificationLevel) {
    errors.push('User classification level is required');
  }
  
  return errors;
};

// Main function to handle the request
serve(async (req: Request) => {
  try {
    // Handle CORS preflight request
    const optionsResponse = handleOptions(req);
    if (optionsResponse) {
      return optionsResponse;
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    
    // Validate required parameters
    const validationErrors = validateParams(requestData);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation error', details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the ElevenLabs API key from environment variables
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      console.error('Missing ELEVENLABS_API_KEY environment variable');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing API key',
          details: 'The ELEVENLABS_API_KEY environment variable is not set. Please set it in your Supabase project settings.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userClassificationLevel, selectedVoice, agentId } = requestData;
    
    // Use provided agent ID or fall back to environment variable
    const effectiveAgentId = agentId || Deno.env.get('ELEVENLABS_AGENT_ID') || "default_assistant";
    
    console.log(`Generating signed URL for agent ID: ${effectiveAgentId} with classification level: ${userClassificationLevel}`);
    
    try {
      // Make the request to ElevenLabs API to get a signed URL
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${effectiveAgentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
        }
      );

      if (!elevenLabsResponse.ok) {
        let errorText = '';
        try {
          const errorData = await elevenLabsResponse.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await elevenLabsResponse.text();
        }
        
        console.error('ElevenLabs API error:', errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Error from ElevenLabs API', 
            details: errorText,
            suggestion: 'Please make sure you have created a conversational agent in your ElevenLabs account and the agent ID is correct.'
          }),
          { status: elevenLabsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get the signed URL from the response
      const responseData = await elevenLabsResponse.json();
      const signedUrl = responseData.signed_url;

      if (!signedUrl) {
        return new Response(
          JSON.stringify({ error: 'Invalid response from ElevenLabs API: Missing signed_url' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return the signed URL to the client
      return new Response(
        JSON.stringify({ 
          success: true, 
          url: signedUrl,
          agentId: effectiveAgentId
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to connect to ElevenLabs API', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('Error in elevenlabs-conversation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
