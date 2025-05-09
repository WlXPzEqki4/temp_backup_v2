import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol, type } = await req.json()
    
    if (type === 'crypto') {
      console.log(`Fetching crypto data for ${symbol} from CoinGecko API`)
      
      // Get current price
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`
      )
      
      if (!priceResponse.ok) {
        const errorText = await priceResponse.text()
        console.error(`CoinGecko API price error: ${priceResponse.status} - ${errorText}`)
        throw new Error(`CoinGecko API error: ${priceResponse.status} - ${errorText}`)
      }
      
      const priceData = await priceResponse.json()
      console.log(`Price data received for ${symbol}:`, JSON.stringify(priceData))
      
      if (!priceData[symbol]) {
        throw new Error(`No price data available for ${symbol}`)
      }

      // Get historical data (30 days)
      const historicalResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=30&interval=daily`
      )

      if (!historicalResponse.ok) {
        const errorText = await historicalResponse.text()
        console.error(`CoinGecko API historical error: ${historicalResponse.status} - ${errorText}`)
        throw new Error(`CoinGecko API error: ${historicalResponse.status} - ${errorText}`)
      }
      
      const historicalData = await historicalResponse.json()
      console.log(`Historical data received for ${symbol}:`, JSON.stringify(historicalData).substring(0, 100) + '...')
      
      // Transform the data into our expected format
      const currentPrice = priceData[symbol].usd
      const priceChange24h = priceData[symbol].usd_24h_change || 0
      
      const historicalPrices = historicalData.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp).toISOString().split('T')[0],
        price: price,
      }))

      return new Response(
        JSON.stringify({
          price: currentPrice,
          change24h: priceChange24h,
          historicalData: historicalPrices,
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // ... keep existing code (stock data fetching logic)
  } catch (error) {
    console.error('Error:', error.message)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }), 
      {
        status: 200, // Return 200 even for errors so frontend can parse the JSON
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
