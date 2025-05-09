
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { parse } from 'https://deno.land/x/xml@2.1.1/mod.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Parse XML to JSON
async function parseXML(xml: string, feedUrl: string) {
  try {
    console.log(`Parsing XML for ${feedUrl}`);
    
    // Try to parse the XML
    const parsedXml = parse(xml);
    
    // Log the entire parsed XML structure (first level only) to help debug
    console.log("Parsed XML structure keys:", Object.keys(parsedXml));
    
    // Handle different RSS structures
    let channel;
    if (parsedXml.rss && parsedXml.rss.channel) {
      channel = parsedXml.rss.channel;
    } else if (parsedXml.feed) { 
      // Some feeds use Atom format
      channel = parsedXml.feed;
    } else {
      console.error("Unknown feed structure:", Object.keys(parsedXml));
      throw new Error("Unknown feed structure");
    }
    
    // Log channel structure to debug
    console.log("Channel keys:", channel ? Object.keys(channel) : "No channel found");
    
    // Find items based on feed format
    let items = [];
    if (channel.item) {
      // RSS format
      items = Array.isArray(channel.item) ? channel.item : [channel.item];
    } else if (channel.entry) {
      // Atom format
      items = Array.isArray(channel.entry) ? channel.entry : [channel.entry];
    }
    
    if (items.length === 0) {
      console.error("No items found in feed");
      return [];
    }
    
    // Log sample item structure to understand what fields are available
    console.log("Sample item structure:", Object.keys(items[0]));
    
    const feedItems = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Extract title
      let title = '';
      if (item.title) {
        title = typeof item.title === 'string' ? item.title : 
               item.title._text ? item.title._text : 
               item.title.value ? item.title.value : '';
      }
      
      // Extract link
      let link = '';
      if (item.link) {
        link = typeof item.link === 'string' ? item.link :
               item.link._text ? item.link._text :
               item.link.href ? item.link.href : '';
      } else if (item.guid && item.guid._text) {
        link = item.guid._text;
      }
      
      // Extract date
      let pubDate = '';
      // Try all possible date fields
      const dateFields = ['pubDate', 'dc:date', 'date', 'published', 'updated'];
      for (const field of dateFields) {
        if (item[field]) {
          if (typeof item[field] === 'string') {
            pubDate = item[field];
            break;
          } else if (item[field]._text) {
            pubDate = item[field]._text;
            break;
          }
        }
      }
      
      // If still no date and it's BBC feed, try to use channel lastBuildDate
      if (!pubDate && feedUrl.includes('bbc') && channel.lastBuildDate) {
        pubDate = typeof channel.lastBuildDate === 'string' ? 
                 channel.lastBuildDate : 
                 channel.lastBuildDate._text ? channel.lastBuildDate._text : '';
      }
      
      // Format date if possible, or use current date
      if (!pubDate) {
        pubDate = new Date().toUTCString();
      }
      
      // Extract description
      let description = '';
      if (item.description) {
        description = typeof item.description === 'string' ? item.description :
                     item.description._text ? item.description._text : '';
      } else if (item.summary) {
        description = typeof item.summary === 'string' ? item.summary :
                     item.summary._text ? item.summary._text : '';
      } else if (item.content) {
        description = typeof item.content === 'string' ? item.content :
                     item.content._text ? item.content._text : '';
      }
      
      // Log the extracted data for debugging
      console.log(`Item ${i+1}: Title=${title ? 'Found' : 'Missing'}, Link=${link ? 'Found' : 'Missing'}, Date=${pubDate ? 'Found' : 'Missing'}`);
      
      feedItems.push({
        title: title,
        link: link,
        pubDate: pubDate,
        description: description
      });
    }
    
    console.log(`Successfully parsed ${feedItems.length} feed items`);
    return feedItems;
  } catch (error) {
    console.error("Error parsing XML:", error.message);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { feedUrl } = await req.json();
    console.log(`Fetching RSS feed: ${feedUrl}`);
    
    // Try to fetch with a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(feedUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSSReader/1.0)'
        } 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
      }
      
      const xml = await response.text();
      
      // Log a small sample of the XML for debugging
      console.log(`XML sample (first 200 chars): ${xml.substring(0, 200)}...`);
      
      const items = await parseXML(xml, feedUrl);
      
      if (!items.length) {
        throw new Error("No items found in feed");
      }
      
      console.log(`Successfully parsed ${items.length} items from feed`);
      
      return new Response(
        JSON.stringify({
          items: items.slice(0, 10) // Limit to first 10 items
        }),
        {
          headers: corsHeaders,
        },
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error(`Error processing RSS feed:`, error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "error" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});
