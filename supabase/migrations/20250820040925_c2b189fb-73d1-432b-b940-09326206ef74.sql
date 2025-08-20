-- Create orders table to track payment information
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id),
  stripe_session_id TEXT UNIQUE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  selected_slots TEXT[] NOT NULL,
  amount INTEGER NOT NULL,             -- Amount in cents
  currency TEXT DEFAULT 'inr',
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',       -- 'pending', 'paid', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() = user_id AND user_id IS NOT NULL) OR (auth.uid() IS NULL AND user_id IS NULL));

CREATE POLICY "Allow order creation" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow order updates" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();