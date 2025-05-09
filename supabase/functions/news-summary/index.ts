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
    const { date } = await req.json();
    
    console.log('News summary function started', { date });
    
    if (!date) {
      throw new Error('No date provided');
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Format date for querying (YYYY-MM-DD)
    const queryDate = date.substring(0, 10);
    
    console.log(`Fetching news articles for date: ${queryDate}`);
    
    // Get news articles from the news_angola table for the specified date
    const { data: articles, error: fetchError } = await supabase
      .from('news_angola')
      .select('title, content, published_at, source, author')
      .gte('published_at', `${queryDate}T00:00:00`)
      .lt('published_at', `${queryDate}T23:59:59`)
      .order('published_at', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching news articles:', fetchError);
      throw new Error(`Error fetching news articles: ${fetchError.message}`);
    }

    console.log(`Found ${articles?.length || 0} articles for date ${queryDate}`);
    
    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ 
        summary: "No news articles found for this date.",
        entities: [],
        themes: [],
        articles: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Prepare content for the AI summary
    let articleContents = articles.map((article, index) => {
      return `Article ${index + 1}: ${article.title || 'Untitled'}\n${article.content || 'No content available'}`;
    }).join('\n\n');
    
    // Limit text length to avoid token limits
    if (articleContents.length > 15000) {
      console.log(`Content too large (${articleContents.length} chars), truncating...`);
      articleContents = articleContents.substring(0, 15000) + "... [truncated]";
    }
    
    console.log(`Prepared ${articleContents.length} characters for AI analysis`);
    
    // Call OpenAI API to analyze the articles and generate a summary
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
            content: `You are a news analyst. Your job is to review information and provide a maximum 300-word summary of news articles from a specified day. 
            Provide a concise prose summary. 
            Do a basic named entity recognition and provide those as a list. 
            Create another list of 2-5 key themes/topics mentioned.
            Format your response as JSON with three fields: 
            "summary" (string), 
            "entities" (array of strings), 
            "themes" (array of strings).`
          },
          {
            role: 'user',
            content: `Here are news articles from ${queryDate}. Please analyze and summarize:\n\n${articleContents}`
          }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = JSON.parse(openAIData.choices[0].message.content);
    
    // Add article metadata for reference
    const articleMetadata = articles.map(article => ({
      title: article.title,
      source: article.source,
      author: article.author,
      published_at: article.published_at
    }));
    
    // Return the AI summary along with article metadata
    return new Response(JSON.stringify({
      ...aiResponse,
      articles: articleMetadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in news summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
