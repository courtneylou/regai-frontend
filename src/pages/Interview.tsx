/*

This page is the main "interview workspace" where the user:
    - Selects stakeholder from sidebar
    - Chats with them to gather requirements (currently a hardocded response)
    - Records requirements in the RequirementsPanel
    - Switches to SSE to submit requirements for review (also a hardcoded response)

 */

// React tools to 
import { useState, useCallback, useEffect } from "react";

// Tools for moving between pages and reading the current page in the app
import { useNavigate, useLocation } from "react-router-dom";

// Defines the shapes of the main data used in the app (scenarios, people, messages, and requirements)
import type { Scenario, Stakeholder, Message, Requirement } from "@/types";

// Special reviewer persona (not part of scenario.stakeholders array)
import { seniorEngineer } from "@/data/scenarios";

// UI components
import { StakeholderSidebar } from "@/components/StakeholderSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { RequirementsPanel } from "@/components/RequirementsPanel";

// Pre-made UI parts (I used shadcn/ui)
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Icons used in the interface
import { ArrowLeft, MoreVertical, Trash2 } from "lucide-react";

// Toast = pop-up notifications for feedback
import { toast } from "sonner";

/*
makeAssistantReply()

Generates a simulated assistant reply based on:
    - Whether the active chat is the senior engineer
    - The scenario title
    - The user's current requirements list
    
    This is UI only - will be changed to call an API or LLM
 */
function makeAssistantReply(params: {
  stakeholder: Stakeholder;
  scenarioTitle: string;
  scenarioDescription: string;
  isEngineer: boolean;
  requirements: Requirement[];
}): string {
  const { stakeholder, scenarioTitle, isEngineer, requirements } = params;

  // If talking to the Senior Engineer, reply with review guidance
  if (isEngineer) {
    if (requirements.length === 0) { // If no requirements, tell the user to add some
      return `I am the senior engineer. Add a few requirements first, then hit “Submit for Review” and I will give feedback.`;
    }

    // Count functional requirements
    const fnCount = requirements.filter((r) => r.type === "functional").length;

    // Count non-functional requirements
    const nfrCount = requirements.filter((r) => r.type === "non-functional").length;

    // Return a short summary count
    return `Quick summary for "${scenarioTitle}": I see ${fnCount} functional and ${nfrCount} non-functional requirements. 
    Here is how you can improve ...`;
  }

  //  Otherwise, return a generic stakeholder response
  return `As ${stakeholder.name} (${stakeholder.role}), here is what I would care about for "${scenarioTitle}": 
I would want ...`;
}

// Interview Component
const Interview = () => {
  /* Router helpers */
  const navigate = useNavigate();
  const location = useLocation();

  /*
  Scenario is passed in from Index.tsx:
  navigate("/interview", { state: { scenario: selectedScenario } })
   */
  const scenario = location.state?.scenario as Scenario | undefined;

  // State: which stakeholder is currently active
  const [activeStakeholderId, setActiveStakeholderId] = useState<string>("");

  /*
  State: chat histories per stakeholder
  
  Structure:
  {
    [stakeholderId: string]: Message[]
  }
  
  Allows independent chat history of each stakeholder
   */
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});

  
  const [requirements, setRequirements] = useState<Requirement[]>([]); // State: gathered requirements
  const [isLoading, setIsLoading] = useState(false); // State: loading indicator
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State: delete history dialog

  // If no scenario exists banish them back to the dashboard
  useEffect(() => {
    if (!scenario) navigate("/");
  }, [scenario, navigate]);

  if (!scenario) return null;

  // Create an array of stakeholders from the scenario
  const allStakeholders: Stakeholder[] = [...scenario.stakeholders];

  /* Determine which stakeholder object is active */
  const activeStakeholder =
    activeStakeholderId === seniorEngineer.id
      ? seniorEngineer
      : allStakeholders.find((s) => s.id === activeStakeholderId) || null;

  /*
  Get the message list for the active stakeholder
  and if none exists yet, default to an empty array
   */
  const currentMessages = chatHistories[activeStakeholderId] || [];

  // Check if chatting to SSE
  const isEngineerChat = activeStakeholderId === seniorEngineer.id;

  // Called when the user submits a message in ChatInterface
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeStakeholder) return;

      // Build a message object for the user's message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      // Add the users message immediately so the UI feels responsive
      setChatHistories((prev) => ({
        ...prev,
        [activeStakeholderId]: [
          ...(prev[activeStakeholderId] || []),
          userMessage,
        ],
      }));

      // Show typing indicator and disable input
      setIsLoading(true);

      try {
        // Mock assistant reply ~ real implementation would call an LLM/AI
        const reply = makeAssistantReply({
          stakeholder: activeStakeholder,
          scenarioTitle: scenario.title,
          scenarioDescription: scenario.fullDescription,
          isEngineer: isEngineerChat,
          requirements,
        });

        // Create assistant message object
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        };

        // Add assistant message to the same stakeholders chat history
        setChatHistories((prev) => ({
          ...prev,
          [activeStakeholderId]: [
            ...(prev[activeStakeholderId] || []),
            assistantMessage,
          ],
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate response.");
      } finally {
        setIsLoading(false);
      }
    },
    // If these values change, rebuild the callback
    [activeStakeholder, activeStakeholderId, isEngineerChat, requirements, scenario]
  );

  /* Requirement handlers */

  // Adds a requirement and shows confirmation toast
  const handleAddRequirement = async (requirement: Omit<Requirement, "id">) => {
    const newId = crypto.randomUUID();
    setRequirements((prev) => [...prev, { ...requirement, id: newId }]);
    toast.success("Requirement added.");
  };

  // Removes a requirement by ID and shows confirmation toast
  const handleDeleteRequirement = async (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    toast.success("Requirement removed.");
  };

  /*
  Submit requirements for review:
  - packages requirements into a message and sends it to SSE chat
   */
  const handleSubmitForReview = async () => {
    if (requirements.length === 0) {
      toast.error("Please add some requirements first");
      return;
    }

    const reqList = requirements
      .map((r) => `[${r.type.toUpperCase()}] ${r.description}`)
      .join("\n");

    const reviewMessage = `Please review the following requirements I've gathered:\n\n${reqList}`;

    await handleSendMessage(reviewMessage);
  };

  /* Delete history handler */
  const handleDeleteHistory = async () => {
    setChatHistories({});
    setRequirements([]);
    toast.success("Chat history and requirements cleared.");
    setShowDeleteDialog(false);
  };

  /* Render */
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center">
          {/* Back button */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Scenario title */}
          <div className="ml-4 pl-4 border-l border-border">
            <h1 className="font-display font-semibold text-foreground">
              {scenario.title}
            </h1>
          </div>
        </div>

        {/* Header dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all chat messages and requirements for this scenario in this browser.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {/* Cancel button just closes the dialog */}
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            {/* Confirm button runs the delete handler */}
            <AlertDialogAction
              onClick={handleDeleteHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: stakeholder list */}
        <StakeholderSidebar
          stakeholders={allStakeholders}
          activeStakeholderId={activeStakeholderId}
          onSelectStakeholder={setActiveStakeholderId}
        />

        {/* Center: chat */}
        <ChatInterface
          stakeholder={activeStakeholder}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />

        {/* Right: requirements */}
        <RequirementsPanel
          requirements={requirements}
          onAddRequirement={handleAddRequirement}
          onDeleteRequirement={handleDeleteRequirement}
          showSubmitButton={isEngineerChat}
          onSubmitForReview={handleSubmitForReview}
          isSubmitting={isLoading}
        />
      </div>
    </div>
  );
};

export default Interview;
