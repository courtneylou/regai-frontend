/*

This file defines the authentication screen for REGAI

It supports user login and sign up

 */

// React hook for managing component state
import { useState } from "react";

// Used to redirect the user after login/signup
import { useNavigate } from "react-router-dom";

// Pre-made UI parts (I used shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Toast = pop-up notifications for feedback
import { toast } from "sonner";

// Icons used in the interface
import { ClipboardList, LogIn, UserPlus } from "lucide-react";


// Auth Component
const Auth = () => {
  /*
  Mode state -
  isLogin determines whether the screen is in:
      - Login mode (true)
      - Sign-up mode (false)
   */
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 

  /*
  Loading state -
  Used to disable the form and show a spinner while simulating authentication
   */
  const [loading, setLoading] = useState(false);

  // Router navigation helper
  const navigate = useNavigate();

  // Form submission handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default browser form submission
    setLoading(true); // Disable form and show loading state

    setTimeout(() => {
      localStorage.setItem("regai_logged_in", "true"); // Store auth state locally
      localStorage.setItem( // Persist email for account screen display
        "regai_email",
        email.trim() || "you@example.com"
      );

      toast.success(
        isLogin ? "Welcome!" : "Account created!"
      );

      setLoading(false);
      navigate("/");
    }, 500);
  };

  /* Render */
  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* App branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-glow">
            <ClipboardList className="w-8 h-8 text-primary-foreground" />
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            REGAI
          </h1>

          <p className="text-muted-foreground">
            Requirements Elicitation Game
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-lg">

          {/* Card header */}
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-xl">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>

            <CardDescription>
              {isLogin
                ? "Sign in to continue your training"
                : "Start your requirements gathering journey"}
            </CardDescription>
          </CardHeader>

          {/* Card content */}
          <CardContent>

            {/* Auth form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 gradient-primary hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  // Loading state UI
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {isLogin
                      ? "Signing in..."
                      : "Creating account..."}
                  </span>
                ) : (
                  // Default state UI
                  <span className="flex items-center gap-2">
                    {isLogin ? (
                      <LogIn className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {isLogin ? "Sign In" : "Create Account"}
                  </span>
                )}
              </Button>
            </form>

            {/* Mode toggle */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <span className="text-primary font-medium">
                      Sign up
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-primary font-medium">
                      Sign in
                    </span>
                  </>
                )}
              </button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;