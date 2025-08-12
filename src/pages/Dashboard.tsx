import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2, Calendar, Clock, Trophy, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "See you next game!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4">
      <div className="absolute inset-0 bg-gradient-gaming opacity-5"></div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back, Gamer! 🎮
            </h1>
            <p className="text-muted-foreground mt-2">
              Email: {user?.email}
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')}
              className="border-primary/20 hover:border-primary/40"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-destructive/20 hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm animate-slide-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Playtime</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0 hours</div>
              <p className="text-xs text-muted-foreground">Start gaming to track time!</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm animate-slide-in" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">0</div>
              <p className="text-xs text-muted-foreground">No active bookings</p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-card/80 backdrop-blur-sm animate-slide-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">0</div>
              <p className="text-xs text-muted-foreground">Unlock achievements by playing!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm animate-fade-in" style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                Book a Gaming Session
              </CardTitle>
              <CardDescription>
                Reserve your spot and start gaming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300">
                View Available Slots
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm animate-fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                Browse Games
              </CardTitle>
              <CardDescription>
                Discover your next favorite game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full border-secondary/20 hover:border-secondary/40 hover:text-secondary"
              >
                Explore Game Library
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Features */}
        <Card className="mt-8 border-accent/20 bg-card/80 backdrop-blur-sm animate-fade-in" style={{animationDelay: '0.5s'}}>
          <CardHeader>
            <CardTitle className="text-center bg-gradient-secondary bg-clip-text text-transparent">
              More Features Coming Soon! 🚀
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-semibold text-primary mb-2">Real-time Booking</h3>
                <p className="text-sm text-muted-foreground">2-step booking system with payment integration</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <h3 className="font-semibold text-secondary mb-2">Game Statistics</h3>
                <p className="text-sm text-muted-foreground">Track playtime and favorite games</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h3 className="font-semibold text-accent mb-2">Social Features</h3>
                <p className="text-sm text-muted-foreground">Connect with other gamers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;