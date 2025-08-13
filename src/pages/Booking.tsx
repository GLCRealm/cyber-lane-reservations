import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar as CalendarIcon, User, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  name: string;
  description: string;
  hourly_rate: number;
}

interface Facility {
  id: string;
  activity_id: string;
  name: string;
  is_available: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample time slots (in real app, this would come from the database)
  const timeSlots: TimeSlot[] = [
    { time: '04:30 PM', available: true },
    { time: '05:00 PM', available: true },
    { time: '05:30 PM', available: true },
    { time: '06:00 PM', available: true },
    { time: '06:30 PM', available: true },
    { time: '07:00 PM', available: false },
    { time: '07:30 PM', available: true },
    { time: '08:00 PM', available: true },
  ];

  const loadActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
      return;
    }
    
    setActivities(data || []);
  };

  const loadFacilities = async (activityId: string) => {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('activity_id', activityId)
      .order('name');
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load facilities",
        variant: "destructive",
      });
      return;
    }
    
    setFacilities(data || []);
  };

  const handleActivitySelect = async (activity: Activity) => {
    setSelectedActivity(activity);
    await loadFacilities(activity.id);
    setStep(2);
  };

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setStep(3);
  };

  const handleSlotToggle = (timeSlot: string) => {
    setSelectedSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleBooking = async () => {
    if (!user || !selectedFacility || !selectedDate || selectedSlots.length === 0) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const totalAmount = selectedSlots.length * (selectedActivity?.hourly_rate || 0);
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          facility_id: selectedFacility.id,
          booking_date: selectedDate.toISOString().split('T')[0],
          start_time: selectedSlots[0],
          end_time: selectedSlots[selectedSlots.length - 1],
          total_amount: totalAmount,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          status: 'confirmed'
        });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your gaming session has been booked successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load activities on component mount
  useState(() => {
    loadActivities();
  });

  const formatPrice = (price: number) => `₹${price / 100}`;
  const totalAmount = selectedSlots.length * (selectedActivity?.hourly_rate || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="absolute inset-0 bg-gradient-gaming opacity-10"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
              className="border-primary/20 hover:border-primary/40"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Book a Gaming Slot
              </h1>
              <p className="text-muted-foreground">Reserve your gaming experience</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {['Activity', 'Facility', 'Slots', 'Payment'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index + 1 <= step 
                    ? 'bg-gradient-primary text-white' 
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${index + 1 <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stepName}
                </span>
                {index < 3 && <div className="w-8 h-0.5 bg-muted mx-4" />}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Activity */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h2 className="text-2xl font-semibold">Choose an Activity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity) => (
                  <Card 
                    key={activity.id}
                    className="border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleActivitySelect(activity)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {activity.name}
                        <Badge variant="secondary" className="bg-gradient-primary text-white">
                          {formatPrice(activity.hourly_rate)} onwards
                        </Badge>
                      </CardTitle>
                      <CardDescription>{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-gradient-primary hover:opacity-90">
                        BOOK
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Facility */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h2 className="text-2xl font-semibold">Choose a Facility</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {facilities.map((facility) => (
                  <Card 
                    key={facility.id}
                    className={`border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer
                      ${!facility.is_available ? 'opacity-50' : ''}
                      ${selectedFacility?.id === facility.id ? 'border-primary' : ''}
                    `}
                    onClick={() => facility.is_available && handleFacilitySelect(facility)}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{facility.name}</CardTitle>
                      <CardDescription>
                        {facility.is_available ? '24x7 Available' : 'Not Available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">
                          {formatPrice(selectedActivity?.hourly_rate || 0)}
                        </span>
                        <span className="text-sm text-muted-foreground">onwards</span>
                      </div>
                      <Button 
                        className="w-full bg-gradient-primary hover:opacity-90"
                        disabled={!facility.is_available}
                      >
                        BOOK
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Slots */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h2 className="text-2xl font-semibold">Select Slots</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <Label className="text-base font-medium mb-4 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border border-primary/20"
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-4 block">Available Time Slots</Label>
                  <div className="space-y-2">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                          ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}
                          ${selectedSlots.includes(slot.time) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}
                        `}
                        onClick={() => slot.available && handleSlotToggle(slot.time)}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">{slot.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">
                            {formatPrice(selectedActivity?.hourly_rate || 0)}
                          </span>
                          <span className="text-sm text-muted-foreground">1 left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedSlots.length > 0 && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Selected Slots:</span>
                        <span className="text-sm text-muted-foreground">{selectedSlots.length} slot(s)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-gradient-primary hover:opacity-90"
                        onClick={() => setStep(4)}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment & Contact Info */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <h2 className="text-2xl font-semibold">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Activity:</span>
                      <span className="font-medium">{selectedActivity?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facility:</span>
                      <span className="font-medium">{selectedFacility?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Slots:</span>
                      <span className="font-medium">{selectedSlots.length} slot(s)</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-primary">{formatPrice(totalAmount)}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={handleBooking}
                      disabled={loading || !customerEmail || !customerPhone}
                    >
                      {loading ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;