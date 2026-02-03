/*
This component renders a modal dialog that shows detailed information 
about a selected Scenario before the user starts an interview

This is the preview step, allowing the user to:
    - Read the full scenario description
    - Review all stakeholders involved
    - Start the interview process
 */

// Defines what a scenario object looks like
import { Scenario } from '@/types';

// Pre-made UI parts (I used shadcn/ui)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons used in the interface
import { MessageSquare, Users } from 'lucide-react';

/* 
getInitials() - generates initials for avatar bubbles

           !!!!!! also used in ChatInterface, StakeholderSidebar, and Scenario Pop (make reusable)
*/
const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/); // Removes trailing whitespace and splits words on spaces

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase(); // If the name only has oen word return only that letter
  }

  return ( // Otherwise return first and last 
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

/* Props contract */
interface ScenarioPopupProps {
  scenario: Scenario | null;
  open: boolean;
  onClose: () => void;
  onStartInterview: () => void;
}

/* ScenarioPopup Component */
export const ScenarioPopup = ({
  scenario,
  open,
  onClose,
  onStartInterview,
}: ScenarioPopupProps) => {
  // Guard clause: If no scenario is provided, render nothing
  if (!scenario) return null;

  // Render the scenario preview dialog
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-0 shadow-xl">
        {/* Header */}
        <DialogHeader>
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-medium">
              {scenario.category}
            </Badge>
          </div>

          {/* Scenario title */}
          <DialogTitle className="font-display text-2xl">
            {scenario.title}
          </DialogTitle>

          {/* Full scenario description */}
          <DialogDescription className="text-base leading-relaxed pt-2">
            {scenario.fullDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Stakeholders Section */}
        <div className="mt-4">
          {/* Section header */}
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-medium text-sm text-muted-foreground">
              Stakeholders
            </h4>
          </div>

          {/* Scrollable list of stakeholders */}
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {scenario.stakeholders.map((stakeholder) => (
              <div
                key={stakeholder.id} // Unique key for React list reconciliation

                className="
                  flex items-start gap-3
                  p-3 rounded-lg
                  bg-muted/50 hover:bg-muted
                  transition-colors
                "
              >
                {/* Avatar with initials */}
                <div
                  className="
                    w-10 h-10
                    rounded-full
                    bg-card
                    border border-border
                    flex items-center justify-center
                    text-sm font-medium
                    shrink-0
                  "
                >
                  {getInitials(stakeholder.name)}
                </div>

                {/* Stakeholder details */}
                <div className="min-w-0">
                  {/* Name */}
                  <p className="font-medium text-foreground">
                    {stakeholder.name}
                  </p>

                  {/* Role */}
                  <p className="text-sm text-primary font-medium">
                    {stakeholder.role}
                  </p>

                  {/* Description (clamped to 2 lines) */}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {stakeholder.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Call to Action */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            onClick={onStartInterview}
            className="
              w-full h-12
              gradient-primary
              hover:opacity-90
              transition-opacity
              font-medium
            "
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start Interviewing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};