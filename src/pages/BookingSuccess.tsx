import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OrderDetails {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  selected_slots: string[];
  amount: number;
  customer_email: string;
  customer_phone: string;
  activity_name: string;
  facility_name: string;
  status: string;
}

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
      toast({
        title: "Invalid Session",
        description: "No payment session found",
        variant: "destructive",
      });
    }
  }, [sessionId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (error) throw error;

      setOrderDetails(data);

      // Create the actual booking in the bookings table
      if (data.status === 'pending') {
        const { error: bookingError } = await supabase
          .from('bookings')
          .insert({
            user_id: data.user_id,
            facility_id: data.facility_id,
            booking_date: data.booking_date,
            start_time: data.start_time,
            end_time: data.end_time,
            total_amount: data.amount,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            status: 'confirmed'
          });

        if (bookingError) {
          console.error('Error creating booking:', bookingError);
        } else {
          // Update order status
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', data.id);
        }
      }

    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price / 100}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-destructive">Booking Not Found</CardTitle>
            <CardDescription>
              We couldn't find your booking details. Please contact support if you completed a payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="absolute inset-0 bg-gradient-gaming opacity-10"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Your payment was successful and your gaming session has been booked.
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Booking Details
              </CardTitle>
              <CardDescription>
                Keep this information for your records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Activity & Facility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">Activity</span>
                  </div>
                  <p className="text-lg font-semibold">{orderDetails.activity_name}</p>
                  <p className="text-muted-foreground">{orderDetails.facility_name}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">Session Details</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {new Date(orderDetails.booking_date).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">
                    {orderDetails.start_time} - {orderDetails.end_time}
                  </p>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {orderDetails.selected_slots.length} slot(s)
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{orderDetails.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{orderDetails.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Payment Status:</span>
                  <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Paid
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(orderDetails.amount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={() => navigate('/')} 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  Back to Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')} 
                  className="flex-1 border-primary/20 hover:border-primary/40"
                >
                  View My Bookings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="mt-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-2 text-orange-800 dark:text-orange-200">
                Important Notes:
              </h3>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Please arrive 10 minutes before your scheduled session</li>
                <li>• Bring a valid ID for verification</li>
                <li>• Cancellations must be made at least 2 hours in advance</li>
                <li>• Contact support if you need to reschedule your session</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;