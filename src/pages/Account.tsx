/*

This page represents the user's Account Settings screen

(needs some major improvements LOL)

It allows a user to:
    - View and update their email address
    - Update their password

 */

// React tools to store data and run code when things change
import { useEffect, useMemo, useState } from "react";

// Lets the app move the user to a different page
import { useNavigate } from "react-router-dom";

// Pre-made UI parts (I used shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Icons used in the interface
import { ArrowLeft, Mail, Lock } from "lucide-react";

// Toast = pop-up notifications for feedback
import { toast } from "sonner";

// These keys are used to simulate authentication
const LOGGED_IN_KEY = "regai_logged_in";
const EMAIL_KEY = "regai_email";

/* Account Component */
const Account = () => {
  // Router navigation helper
  const navigate = useNavigate();

  /*
  Authentication state -
  Determine whether the user is logged in
  This is read ONCE from localStorage when the component initializes
   */
  const [isLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(LOGGED_IN_KEY) === "true";
  });

  /*
  Initial email value -
  Read the stored email from localStorage once
  If none exists, fall back to a placeholder value
   */
  const initialEmail = useMemo(() => {
    return localStorage.getItem(EMAIL_KEY) ?? "you@example.com";
  }, []);

  // Form State
  const [email, setEmail] = useState(initialEmail);  // Email input value
  const [newPassword, setNewPassword] = useState(""); // Password input values
  const [confirmPassword, setConfirmPassword] = useState(""); // ""
  
   // Loading / submission state
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  /*
  Redirect guard -
  If the user is NOT logged in, redirect them to the authentication page
   */
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  // Email update handler
  const handleUpdateEmail = async () => {
    const trimmed = email.trim();

    // Basic validation
    if (!trimmed) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      localStorage.setItem(EMAIL_KEY, trimmed);

      toast.success("Email updated.");
    } catch {
      toast.error("Failed to update email");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Password update handler
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /* 
  Fallback UI while redirecting -
  Prevents the page from flashing before navigation completes
   */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting to login…</p>
      </div>
    );
  }

  /* Render */
  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your email and password
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Address
              </CardTitle>
              <CardDescription>
                Update your email address. (Standalone UI mode for now.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <Button
                onClick={handleUpdateEmail}
                disabled={
                  isUpdatingEmail ||
                  email.trim() === initialEmail.trim()
                }
              >
                {isUpdatingEmail ? "Updating..." : "Update Email"}
              </Button>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password
              </CardTitle>
              <CardDescription>
                Change your password. (Standalone UI mode for now.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                disabled={
                  isUpdatingPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Account;