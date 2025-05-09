
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback news data in case the API fails
const fallbackNewsData = {
  breaking: {
    status: "ok",
    articles: [
      {
        title: "Global Summit on Climate Change Begins in Geneva",
        description: "World leaders gather to discuss urgent climate action as new data shows accelerating global warming trends.",
        url: "https://example.com/climate-summit",
        publishedAt: new Date().toISOString(),
        source: { name: "Fallback News Service" }
      },
      {
        title: "Tech Giants Announce Joint AI Ethics Coalition",
        description: "Leading technology companies form alliance to establish ethical guidelines for artificial intelligence development.",
        url: "https://example.com/ai-ethics",
        publishedAt: new Date().toISOString(),
        source: { name: "Fallback News Service" }
      },
      {
        title: "Medical Breakthrough: New Treatment Shows Promise for Alzheimer's",
        description: "Clinical trials reveal significant improvement in cognitive function with revolutionary therapy.",
        url: "https://example.com/medical-breakthrough",
        publishedAt: new Date().toISOString(),
        source: { name: "Fallback News Service" }
      }
    ]
  },
  uae: {
    status: "ok",
    articles: [
      {
        title: "UAE Launches New Sustainability Initiative",
        description: "Government announces comprehensive green energy program with ambitious 2030 targets.",
        url: "https://example.com/uae-sustainability",
        publishedAt: new Date().toISOString(),
        source: { name: "Fallback News Service" }
      },
      {
        title: "Dubai Hosts International Technology Exhibition",
        description: "Annual expo showcases cutting-edge innovations from around the world.",
        url: "https://example.com/dubai-tech-expo",
        publishedAt: new Date().toISOString(),
        source: { name: "Fallback News Service" }
      },
      {
        title: "Abu Dhabi Investment Authority Announces New Global Partners",
        description: "Sovereign wealth fund expands portfolio with strategic international investments.",
        url: "https://example.com/adia-investments",
        publishedAt: new Date().toISOString(),
        source: { name: "Fallback News Service" }
      }
    ]
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type } = await req.json()
    const apiKey = Deno.env.get('NEWS_API_KEY')
    
    if (!apiKey) {
      console.log('NEWS_API_KEY not configured, using fallback data')
      return new Response(JSON.stringify(fallbackNewsData[type]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Fetching news for type: ${type}`)
    
    let url
    if (type === 'breaking') {
      url = `https://newsapi.org/v2/top-headlines?language=en&apiKey=${apiKey}`
    } else if (type === 'uae') {
      url = `https://newsapi.org/v2/everything?q=UAE&language=en&sortBy=publishedAt&apiKey=${apiKey}`
    } else {
      throw new Error('Invalid news type requested')
    }

    console.log(`Making request to: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SentryView/1.0'
      }
    })
    
    console.log(`Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', JSON.stringify(errorData, null, 2))
      
      // If we're rate limited or any other API error, use fallback data
      console.log(`Using fallback data for ${type} due to API error`)
      return new Response(JSON.stringify(fallbackNewsData[type]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error.message)
    
    // If any other error occurs, use fallback data based on the requested type
    // Default to breaking news if type is undefined
    const type = req.url.includes('uae') ? 'uae' : 'breaking';
    console.log(`Using fallback data for ${type} due to error: ${error.message}`)
    
    return new Response(JSON.stringify(fallbackNewsData[type]), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 instead of error status
    })
  }
})
