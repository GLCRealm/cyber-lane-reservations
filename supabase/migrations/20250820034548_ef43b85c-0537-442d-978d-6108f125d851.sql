-- Update RLS policies to allow anonymous bookings
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;

-- Allow both authenticated users to create their own bookings and anonymous users to create bookings
CREATE POLICY "Allow booking creation" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() = user_id)
);

-- Update SELECT policy to allow users to view their own bookings (authenticated users only)
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Update UPDATE policy to allow users to update their own bookings (authenticated users only)
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id AND user_id IS NOT NULL);