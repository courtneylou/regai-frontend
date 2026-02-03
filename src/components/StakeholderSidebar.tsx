/*

This component renders the left-hand sidebar used during the interview flow

It allows the user to select a stakeholder, and switch to SSE to 
submit for review


 */

// Defines what a scenario object looks like
import { Stakeholder } from '@/types';

// Loads the senior engineer character setup
import { seniorEngineer } from '@/data/scenarios';

// Pre-made UI parts (I used shadcn/ui)
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
interface StakeholderSidebarProps {
  stakeholders: Stakeholder[]; // List of stakeholders associated with the current scenario
  activeStakeholderId: string; // ID of the currently selected stakeholder
  onSelectStakeholder: (id: string) => void;
}

/* StakeholderSidebar Component */
export const StakeholderSidebar = ({
  stakeholders,
  activeStakeholderId,
  onSelectStakeholder,
}: StakeholderSidebarProps) => {

  // Render the sidebar layout
  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground">
          Stakeholders
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Select someone to interview
        </p>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        {/* Stakeholder List */}
        <div className="p-3 space-y-1">
          {stakeholders.map((stakeholder) => (
            <button
              key={stakeholder.id} // Unique key for React reconciliation

              onClick={() => onSelectStakeholder(stakeholder.id)}

              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                activeStakeholderId === stakeholder.id
                  ? 'bg-accent/10 border-2 border-accent shadow-glow'
                  : 'hover:bg-muted border-2 border-transparent'
              }`}
            >
              {/* Avatar */}
              <div
                className="
                  w-10 h-10
                  rounded-full
                  bg-muted
                  flex items-center justify-center
                  text-sm font-medium
                  shrink-0
                "
              >
                {getInitials(stakeholder.name)}
              </div>

              {/* Stakeholder details */}
              <div className="min-w-0 flex-1">
                {/* Name */}
                <p className="font-medium text-sm text-foreground truncate">
                  {stakeholder.name}
                </p>

                {/* Role */}
                <p className="text-xs text-muted-foreground truncate">
                  {stakeholder.role}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="px-3">
          <Separator className="my-3" />
        </div>

        {/* Senior Engineer Section */}
        <div className="px-3 pb-3">
          {/* Section label */}
          <p className="text-xs font-medium text-muted-foreground px-3 mb-2 uppercase tracking-wide">
            Submit Requirements
          </p>

          {/* Senior Engineer button */}
          <button
            onClick={() => onSelectStakeholder(seniorEngineer.id)} // Selecting this switches the chat to review mode

            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
              activeStakeholderId === seniorEngineer.id
                ? 'bg-accent/10 border-2 border-accent shadow-glow'
                : 'hover:bg-muted border-2 border-transparent'
            }`}
          >
            {/* Senior Engineer avatar */}
            <div
              className="
                w-10 h-10
                rounded-full
                bg-accent/20
                flex items-center justify-center
                text-sm font-medium
                shrink-0
                text-accent
              "
            >
              {getInitials(seniorEngineer.name)}
            </div>

            {/* Senior Engineer details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {/* Name */}
                <p className="font-medium text-sm text-foreground truncate">
                  {seniorEngineer.name}
                </p>

                {/* Reviewer badge */}
                <Badge
                  variant="outline"
                  className="
                    text-[10px]
                    px-1.5 py-0
                    border-accent
                    text-accent
                  "
                >
                  Reviewer
                </Badge>
              </div>

              {/* Role */}
              <p className="text-xs text-muted-foreground truncate">
                {seniorEngineer.role}
              </p>
            </div>
          </button>
        </div>
      </ScrollArea>
    </div>
  );
};