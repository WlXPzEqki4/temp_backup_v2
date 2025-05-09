
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, fileUrl, username, conversationId } = await req.json();
    
    console.log('PDF Chat function started', { query, fileUrl, username, conversationId });
    
    if (!query) {
      throw new Error('No query provided');
    }

    if (!fileUrl) {
      throw new Error('No file URL provided');
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the file content from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('pdf_docs')
      .download(fileUrl.replace('pdf_docs/', ''));
    
    if (fileError || !fileData) {
      console.error('Error fetching file:', fileError);
      throw new Error(`Error fetching file: ${fileError?.message || 'File not found'}`);
    }

    console.log(`Processing PDF query for file: ${fileUrl}`);
    
    // Convert the PDF to an array buffer
    const pdfBytes = await fileData.arrayBuffer();
    console.log(`PDF size: ${Math.round(pdfBytes.byteLength / 1024)} KB`);
    
    // Extract text using a basic approach
    const extractedText = await extractTextFromPDF(pdfBytes);
    
    if (!extractedText || extractedText.length < 10) {
      console.log("Basic text extraction produced limited results, trying alternative method");
      // Try alternative extraction method
      const alternativeText = extractTextAlternative(pdfBytes);
      if (alternativeText.length > extractedText.length) {
        console.log("Using alternative extraction method which produced better results");
        extractedText = alternativeText;
      }
    }
    
    console.log(`Extracted approximately ${extractedText.length} characters from PDF`);
    if (extractedText.length > 100) {
      console.log(`Sample text: ${extractedText.substring(0, 100)}...`);
    }
    
    // Call OpenAI API with the extracted PDF text
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that helps users understand PDF documents. 
            I've provided you with text extracted from a PDF document. 
            Analyze this content carefully and provide detailed, accurate answers to the user's questions.
            
            If the document appears to be a specific type (article, research paper, report, etc.), 
            mention that in your response.
            
            If the extracted text seems incomplete or corrupted, do your best to extract 
            meaningful information, but be transparent about limitations.`
          },
          {
            role: 'user',
            content: `Here is text extracted from a PDF document:
            
            ${extractedText}
            
            Based on this content, please answer the following question: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;
    
    console.log('Got AI response', { length: aiResponse.length });
    
    // Store the conversation if a username is provided
    if (username && conversationId) {
      try {
        // Store the user message
        await supabase.from('pdf_conversations').insert({
          conversation_id: conversationId,
          username: username,
          role: 'user',
          content: query,
          document_url: fileUrl,
          timestamp: new Date().toISOString()
        });
        
        // Store the AI response
        await supabase.from('pdf_conversations').insert({
          conversation_id: conversationId,
          username: username,
          role: 'ai',
          content: aiResponse,
          document_url: fileUrl,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Stored conversation with ID ${conversationId}`);
      } catch (storeError) {
        // Log the error but don't fail the request
        console.error('Error storing conversation:', storeError);
      }
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in PDF chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Function to extract text from PDF
async function extractTextFromPDF(pdfBytes: ArrayBuffer): Promise<string> {
  try {
    // Simple text extraction
    const decoder = new TextDecoder('utf-8');
    let rawText = decoder.decode(new Uint8Array(pdfBytes));
    
    // Clean up the text - strip binary data and extract readable segments
    const textSegments = rawText.match(/[\w\s.,;:'"()\[\]{}\-+=$&%#@!?<>/\\|*^]+/g) || [];
    let extractedText = textSegments.join(' ');
    
    // Limit text length to avoid token limits
    extractedText = extractedText.substring(0, 50000);
    
    console.log(`Basic extraction found ${textSegments.length} text segments`);
    
    return extractedText;
  } catch (error) {
    console.error('Error in text extraction:', error);
    return '';
  }
}

// Alternative text extraction method
function extractTextAlternative(pdfBytes: ArrayBuffer): string {
  try {
    // Different approach - try to find text patterns using regex
    const decoder = new TextDecoder('utf-8');
    const rawText = decoder.decode(new Uint8Array(pdfBytes));
    
    // Try to find content between common PDF text markers
    // This is a simplified approach and may not work for all PDFs
    const patterns = [
      /\(([^)]+)\)/g,  // Content in parentheses
      /\/([\w\s.,;:'"()\[\]{}\-+=$&%#@!?<>/\\|*^]+)\/]/g,  // Content between slashes
      /\>([^<]+)\</g,  // Content between angle brackets
      /\[([^\]]+)\]/g  // Content in square brackets
    ];
    
    let extractedParts: string[] = [];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(rawText)) !== null) {
        if (match[1] && match[1].length > 3) { // Ignore very short matches
          extractedParts.push(match[1]);
        }
      }
    });
    
    // Join all extracted parts and clean up
    let extractedText = extractedParts.join(' ');
    extractedText = extractedText
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    console.log(`Alternative extraction found ${extractedParts.length} text segments`);
    
    // Limit text length
    return extractedText.substring(0, 50000);
  } catch (error) {
    console.error('Error in alternative text extraction:', error);
    return '';
  }
}
