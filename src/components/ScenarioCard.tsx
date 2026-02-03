/*

This component renders a clickable card representing
a single Scenario in a scenario selection grid/list

 */

// Defines what a scenario object looks like
import { Scenario } from '@/types';

// Pre-made UI parts (I used shadcn/ui)
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Icons used in the interface
import { Users } from 'lucide-react';

/* 
getInitials() - generates initials for avatar bubbles

           !!!!!! also used in ChatInterface and Scenario Pop (make reusable)
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
interface ScenarioCardProps {
  scenario: Scenario; // Scenario object whose data will be rendered
  onClick: () => void; // Callback invoked when the card is clicked
}

/*
ScenarioCard Component
 */
export const ScenarioCard = ({
  scenario,
  onClick,
}: ScenarioCardProps) => {

  /* Render a clickable card */
  return (
    <Card
      onClick={onClick}
      className="
        cursor-pointer
        card-hover
        border-0
        shadow-md
        bg-card
        overflow-hidden
        group
      "
      // Styling Notes:
      //    - card-hover: custom hover animation
      //    - group: enables group-hover styles for child elements
    >
      <CardContent className="p-0">
        {/* Main Content */}
        <div className="p-5">
          {/* Top row: category badge + stakeholder count */}
          <div className="flex items-start justify-between mb-3">
            {/* Scenario category */}
            <Badge variant="secondary" className="font-medium">
              {scenario.category}
            </Badge>

            {/* Stakeholder count */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">
                {scenario.stakeholders.length}
              </span>
            </div>
          </div>

          {/* Scenario title */}
          <h3
            className="
              font-display
              font-semibold
              text-lg
              text-foreground
              mb-2
              group-hover:text-primary
              transition-colors
            "
          >
            {scenario.title}
          </h3>

          {/* Short description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {scenario.shortDescription}
          </p>
        </div>

        {/* Footer: Stakeholder Avatars */}
        <div className="px-5 py-3 bg-muted/30 border-t border-border/50">
          <div className="flex -space-x-2">
            {/* Render up to the first 4 stakeholders */}
            {scenario.stakeholders.slice(0, 4).map((stakeholder, index) => (
              <div
                key={stakeholder.id}

                className="
                  w-8 h-8
                  rounded-full
                  bg-card
                  border-2 border-card
                  flex items-center justify-center
                  text-xs font-medium
                  shadow-sm
                "
                // Avatar styling:
                //    - Circular shape
                //    - Slight border and shadow
                //    - Centered initials text

                style={{
                  // Higher z-index for earlier avatars so they overlap
                  zIndex: scenario.stakeholders.length - index,
                }}
              >
                {getInitials(stakeholder.name)}
              </div>
            ))}

            {/* If there are more than 4 stakeholders, show "+number" */}
            {scenario.stakeholders.length > 4 && (
              <div
                className="
                  w-8 h-8
                  rounded-full
                  bg-muted
                  border-2 border-card
                  flex items-center justify-center
                  text-xs font-medium
                  text-muted-foreground
                "
              >
                +{scenario.stakeholders.length - 4}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
