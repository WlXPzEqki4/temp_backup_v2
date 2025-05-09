
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
  
  if (!params.text || typeof params.text !== 'string' || params.text.trim() === '') {
    errors.push('Text is required and must be a non-empty string');
  }
  
  if (!params.conversationId) {
    errors.push('Conversation ID is required');
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
        JSON.stringify({ error: 'Server configuration error: Missing API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, conversationId } = requestData;
    
    console.log(`Sending text message to ElevenLabs conversation: ${conversationId}`);
    
    try {
      // Call the ElevenLabs API to send a text message to the conversation
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/${conversationId}/text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({ 
            text: text 
          }),
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
            details: errorText
          }),
          { status: elevenLabsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return success response
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Message sent successfully to ElevenLabs"
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
    console.error('Error in elevenlabs-conversation-message function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
