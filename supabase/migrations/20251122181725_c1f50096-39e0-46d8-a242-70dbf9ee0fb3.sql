-- Fix the function to have a proper search path
CREATE OR REPLACE FUNCTION get_message_profile(message_user_id uuid)
RETURNS TABLE (username text, avatar_url text) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT username, avatar_url
  FROM public.profiles
  WHERE user_id = message_user_id;
$$;