
-- Function to get unique dates from the news_angola table
CREATE OR REPLACE FUNCTION public.get_user_summary_dates()
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT TO_CHAR(published_at, 'YYYY-MM-DD"T"00:00:00"Z"') as date
  FROM news_angola
  WHERE published_at IS NOT NULL
  ORDER BY date DESC;
$$;

-- Original function is kept but renamed for backwards compatibility
CREATE OR REPLACE FUNCTION public.get_unique_news_dates()
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT TO_CHAR(published_at, 'YYYY-MM-DD"T"00:00:00"Z"') as date
  FROM news_angola
  WHERE published_at IS NOT NULL
  ORDER BY date DESC;
$$;

-- Add a version that accepts username parameter but ignores it (for compatibility)
CREATE OR REPLACE FUNCTION public.get_user_summary_dates(p_username text)
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT TO_CHAR(published_at, 'YYYY-MM-DD"T"00:00:00"Z"') as date
  FROM news_angola
  WHERE published_at IS NOT NULL
  ORDER BY date DESC;
$$;

-- Function to get unique dates from the Top_Narratives_by_Virality table
CREATE OR REPLACE FUNCTION public.get_dates_from_narratives_virality()
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT date
  FROM top_narratives_by_virality
  WHERE date IS NOT NULL
  ORDER BY date DESC;
$$;

-- Add version that takes an empty parameter object for REST API compatibility
CREATE OR REPLACE FUNCTION public.get_dates_from_narratives_virality(params jsonb)
RETURNS TABLE(date text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT date
  FROM top_narratives_by_virality
  WHERE date IS NOT NULL
  ORDER BY date DESC;
$$;

-- Function to get unique windows from the Top_Narratives_by_Virality table
CREATE OR REPLACE FUNCTION public.get_windows_from_narratives_virality()
RETURNS TABLE(window text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT window
  FROM top_narratives_by_virality
  WHERE window IS NOT NULL
  ORDER BY window;
$$;

-- Add version that takes an empty parameter object for REST API compatibility
CREATE OR REPLACE FUNCTION public.get_windows_from_narratives_virality(params jsonb)
RETURNS TABLE(window text) 
LANGUAGE sql
AS $$
  SELECT DISTINCT window
  FROM top_narratives_by_virality
  WHERE window IS NOT NULL
  ORDER BY window;
$$;

-- Function to get narratives filtered by date and window
CREATE OR REPLACE FUNCTION public.get_narratives_by_virality(p_date text, p_window text)
RETURNS TABLE(narrative text, percentage numeric, date text, window text) 
LANGUAGE sql
AS $$
  SELECT narrative, percentage, date, window
  FROM top_narratives_by_virality
  WHERE 
    (date = p_date OR p_date IS NULL) AND
    (window = p_window OR p_window IS NULL)
  ORDER BY percentage DESC;
$$;

-- Version of get_narratives_by_virality that accepts a JSON parameter for REST API compatibility
CREATE OR REPLACE FUNCTION public.get_narratives_by_virality(params jsonb)
RETURNS TABLE(narrative text, percentage numeric, date text, window text) 
LANGUAGE sql
AS $$
  SELECT narrative, percentage, date, window
  FROM top_narratives_by_virality
  WHERE 
    (date = params->>'date' OR params->>'date' IS NULL) AND
    (window = params->>'window' OR params->>'window' IS NULL)
  ORDER BY percentage DESC;
$$;
