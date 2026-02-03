/* 

This is the app's main dashboard / landing page after login

It lets the user:
    - Browse avaliable scenarios (cusotm/hardcoded)
    - Search scenarios via title,category,description
    - Click a scenario to preview it
    - Start interview from the preview
    - Open the "Manage Scenarios" dialog (currently just UI not functional in this version)
    - Access user account setting and sign out

Authentication is currently just simulated using localStorage - this is changed in the other version

 */

// React tools to store data and run code when things change
import { useState, useEffect, useMemo } from "react";

// Lets the app move the user to a different page
import { useNavigate } from "react-router-dom";

// Loads the default list of pre-made scenarios
import { defaultScenarios } from "@/data/scenarios";

// Defines what a scenario object looks like
import { Scenario } from "@/types";

// Card UI used to display a scenario in the grid
import { ScenarioCard } from "@/components/ScenarioCard";

// Popup used to preview scenario details before starting interview
import { ScenarioPopup } from "@/components/ScenarioPopup";

// Dialog used to manage custom scenarios (UI-only in standalone mode)
import { ManageScenariosDialog } from "@/components/ManageScenariosDialog";

// Pre-made UI parts (I used shadcn/ui)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Icons used in the interface
import { ClipboardList, Settings2, Search, X, Menu, User as UserIcon, LogOut } from "lucide-react";

// Toast = pop-up notifications for feedback
import { toast } from "sonner";

// LocalStorage auth key - this key is set by Auth.tsx when the user logs in
const LOGGED_IN_KEY = "regai_logged_in";

/* Index Component */
const Index = () => {
  // Router navigation helper
  const navigate = useNavigate();

  /* 
  Auth state -
  Reads a "logged in" flag from localStorage once - temporary until real auth provider is used
   */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(LOGGED_IN_KEY) === "true";
  });

  // Scenario selection and dialogs
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null); // Currently selected scenario (used by the popup)
  const [popupOpen, setPopupOpen] = useState(false); // Controls whether the scenario preview popup is open
  const [manageOpen, setManageOpen] = useState(false); // Controls whether "Manage Scenarios" dialog is open
  

  // Custom scenarios (UI-only for now)
  const [customScenarios] = useState<Scenario[]>([]);
  
  // Loading state (UI-only placeholder)
  const [isLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState(""); // What the user typed in the search box

  // If the user isn't logged in, route to /auth - prevents unauthorized access to the dashboard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  /*
  Logout handler -
  Clears localStorage auth flag, updates state, shows a toast, and navigates to /auth.
   */
  const handleLogout = () => {
    localStorage.removeItem(LOGGED_IN_KEY);
    setIsLoggedIn(false);
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  /*
  Scenario card click handler -
  Selects the scenario and opens the popup preview
   */
  const handleScenarioClick = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setPopupOpen(true);
  };

  /*
  Start interview handler -
  Closes the popup and navigates to /interview, passing the selected scenario via route state.
   */
  const handleStartInterview = () => {
    if (!selectedScenario) return;
    setPopupOpen(false);
    navigate("/interview", { state: { scenario: selectedScenario } });
  };

  // Manage Scenarios handlers (UI-only)
  const handleAddScenario = async () => {
    toast.info("Manage Scenarios is UI-only in standalone mode (no saving yet).");
  };

  const handleDeleteScenario = async () => {
    toast.info("Manage Scenarios is UI-only in standalone mode (no deleting yet).");
  };

  const handleUpdateScenario = async () => {
    toast.info("Manage Scenarios is UI-only in standalone mode (no editing yet).");
  };

  // Combine default and custom scenarios
  const allScenarios = useMemo(() => {
    return [...defaultScenarios, ...customScenarios];
  }, [customScenarios]);

  // Filter scenarios based on search query
  const filteredScenarios = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allScenarios;

    return allScenarios.filter((scenario) => {
      return (
        scenario.title.toLowerCase().includes(q) ||
        scenario.shortDescription.toLowerCase().includes(q) ||
        scenario.category.toLowerCase().includes(q)
      );
    });
  }, [allScenarios, searchQuery]);

  const hasResults = filteredScenarios.length > 0;

  // Avoid UI flash while redirecting
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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">REGAI</h1>
              <p className="text-xs text-muted-foreground">
                Requirements Elicitation Game
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Manage scenarios button */}
            <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
              <Settings2 className="w-4 h-4 mr-2" />
              Manage Scenarios
            </Button>

            {/* User menu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                {/* Navigate to account settings */}
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  Account
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page intro */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Choose a Scenario
          </h2>
          <p className="text-muted-foreground">
            Select a project scenario to practice gathering requirements from stakeholders
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            {/* Search icon positioned inside input */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            {/* Search input */}
            <Input
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />

            {/* Clear button (only appears when searchQuery has text) */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Empty results state*/}
        {!hasResults && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center text-2xl">
              🔍
            </div>
            <p className="text-muted-foreground">No scenarios found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search
            </p>
          </div>
        )}

        {/* Scenario grid */}
        {hasResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario, index) => (
              <div
                key={scenario.id}
                className="animate-slide-up"
                // Creates a staggered animation for cards
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ScenarioCard
                  scenario={scenario}
                  onClick={() => handleScenarioClick(scenario)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Loading (placeholder) */}
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        )}
      </main>

      {/* Scenario preview popup */}
      <ScenarioPopup
        scenario={selectedScenario}
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onStartInterview={handleStartInterview}
      />

      {/* Manage scenarios dialog (UI only) */}
      <ManageScenariosDialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        customScenarios={customScenarios}
        onAddScenario={handleAddScenario as any}
        onDeleteScenario={handleDeleteScenario as any}
        onImportScenario={handleAddScenario as any}
        onUpdateScenario={handleUpdateScenario as any}
      />
    </div>
  );
};

export default Index;
