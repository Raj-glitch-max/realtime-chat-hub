-- Add foreign key from messages to profiles
-- First, we need to ensure messages.user_id can link to profiles.user_id
-- Since both reference auth.users, we'll create a view or adjust our query approach

-- Create a function to get profile for a user_id
CREATE OR REPLACE FUNCTION get_message_profile(message_user_id uuid)
RETURNS TABLE (username text, avatar_url text) 
LANGUAGE sql
STABLE
AS $$
  SELECT username, avatar_url
  FROM public.profiles
  WHERE user_id = message_user_id;
$$;