import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using the service role key for database operations
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const {
      facilityId,
      activityName,
      facilityName,
      bookingDate,
      startTime,
      endTime,
      selectedSlots,
      totalAmount,
      customerEmail,
      customerPhone,
      userId
    } = body;

    console.log("Payment request received:", { facilityId, activityName, facilityName, totalAmount, customerEmail });

    // Validate required fields
    if (!facilityId || !activityName || !facilityName || !bookingDate || 
        !startTime || !endTime || !selectedSlots || !totalAmount || 
        !customerEmail || !customerPhone) {
      throw new Error("Missing required booking information");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("Stripe") || "", {
      apiVersion: "2023-10-16",
    });

    console.log("Creating Stripe checkout session...");

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ 
      email: customerEmail, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing Stripe customer:", customerId);
    }

    // Create checkout session with Indian Rupee
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { 
              name: `${activityName} - ${facilityName}`,
              description: `Gaming session on ${bookingDate} from ${startTime} to ${endTime}`
            },
            unit_amount: totalAmount, // Amount in paise (1 INR = 100 paise)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/booking`,
      metadata: {
        facilityId,
        bookingDate,
        startTime,
        endTime,
        customerEmail,
        customerPhone,
        userId: userId || "guest"
      }
    });

    console.log("Stripe session created:", session.id);

    // Store order information in database
    const { data: orderData, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        user_id: userId || null,
        facility_id: facilityId,
        stripe_session_id: session.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        selected_slots: selectedSlots,
        amount: totalAmount,
        currency: "inr",
        customer_email: customerEmail,
        customer_phone: customerPhone,
        activity_name: activityName,
        facility_name: facilityName,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error(`Failed to create order record: ${orderError.message}`);
    }

    console.log("Order created in database:", orderData.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      orderId: orderData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});