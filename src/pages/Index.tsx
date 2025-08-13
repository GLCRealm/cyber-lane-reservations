import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Calendar, Users, Trophy, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="absolute inset-0 bg-gradient-gaming opacity-10"></div>
      
      <div className="relative">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                <Gamepad2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                GLCRealm Gaming Cafe
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The ultimate gaming destination where legends are born. 
                Experience cutting-edge gaming with friends in our premium cafe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-300 text-lg px-8 py-6"
                    onClick={() => navigate('/booking')}
                  >
                    Start Gaming
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:opacity-90 transition-all duration-300 text-lg px-8 py-6"
                    onClick={() => navigate('/auth')}
                  >
                    Start Gaming
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/20 hover:border-primary/40 text-lg px-8 py-6"
                    onClick={() => navigate('/auth')}
                  >
                    Join the Community
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 animate-slide-in">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Booking System</CardTitle>
                <CardDescription>
                  Reserve your gaming sessions with our 2-step booking process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Real-time slot availability</li>
                  <li>• Secure payment integration</li>
                  <li>• Up to 7 days advance booking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-card/80 backdrop-blur-sm hover:border-secondary/40 transition-all duration-300 animate-slide-in" style={{animationDelay: '0.1s'}}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Premium Gaming Experience</CardTitle>
                <CardDescription>
                  High-end PC, Xbox, and PlayStation setups for every gamer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Latest gaming hardware</li>
                  <li>• Extensive game library</li>
                  <li>• Comfortable gaming environment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-card/80 backdrop-blur-sm hover:border-accent/40 transition-all duration-300 animate-slide-in" style={{animationDelay: '0.2s'}}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-gaming rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Track Your Progress</CardTitle>
                <CardDescription>
                  Monitor your gaming stats and unlock achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Detailed playtime tracking</li>
                  <li>• Personal gaming statistics</li>
                  <li>• Achievement system</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
              Ready to Level Up?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of gamers who have made GLCRealm their gaming home. 
              Create your account and start your gaming journey today!
            </p>
            {!user && (
              <Button
                size="lg"
                className="bg-gradient-secondary hover:opacity-90 transition-all duration-300 text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
