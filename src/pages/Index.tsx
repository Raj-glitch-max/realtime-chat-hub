import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, Users, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-chat-bg to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-3xl p-6">
              <MessageCircle className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ChatFlow
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Real-time messaging made simple. Connect, chat, and collaborate instantly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 rounded-2xl p-4 w-fit mx-auto">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Updates</h3>
            <p className="text-muted-foreground">
              Messages appear instantly with WebSocket-powered real-time synchronization
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
            <div className="bg-accent/10 rounded-2xl p-4 w-fit mx-auto">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">User Presence</h3>
            <p className="text-muted-foreground">
              See who's online and view typing indicators as people compose messages
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
            <div className="bg-online/10 rounded-2xl p-4 w-fit mx-auto">
              <Shield className="w-8 h-8 text-online" />
            </div>
            <h3 className="text-xl font-semibold">Secure & Private</h3>
            <p className="text-muted-foreground">
              Built with authentication and row-level security for your peace of mind
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
