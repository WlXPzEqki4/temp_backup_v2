
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
  
  if (!params.voice_id || typeof params.voice_id !== 'string') {
    errors.push('Voice ID is required and must be a string');
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

    const { text, voice_id } = requestData;
    
    // Prevent too long text that might crash the function with stack overflow
    const truncatedText = text.length > 5000 ? text.substring(0, 5000) + "..." : text;
    
    // Prepare the request to ElevenLabs API
    const ttsRequest = {
      text: truncatedText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
      },
    };

    console.log(`Generating TTS for text (${truncatedText.substring(0, 50)}...) using voice ID: ${voice_id}`);
    
    // Make the request to ElevenLabs API
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify(ttsRequest),
      }
    );

    if (!elevenlabsResponse.ok) {
      let errorText = '';
      try {
        const errorData = await elevenlabsResponse.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await elevenlabsResponse.text();
      }
      
      console.error('ElevenLabs API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Error from ElevenLabs API', details: errorText }),
        { status: elevenlabsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read the audio data
    const audioArrayBuffer = await elevenlabsResponse.arrayBuffer();
    
    // Check if we received valid audio data
    if (audioArrayBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ error: 'Received empty audio data from ElevenLabs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Convert binary audio data to base64 string safely
    const uint8Array = new Uint8Array(audioArrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const audioBase64 = btoa(binary);

    // Return the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        audio_base64: audioBase64,
        format: 'mp3',  // ElevenLabs returns MP3 by default
        voice_id
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
