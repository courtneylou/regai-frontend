/*
This component renders the Requirements panel ont he right side
used during the interview process to gather requirements
 */

// React tools to store data
import { useState } from 'react';

// Defines what a requirement object looks like
import { Requirement } from '@/types';

// Pre-made UI parts (I used shadcn/ui)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Icons used in the interface
import { Plus, Trash2, ClipboardList, ChevronRight, ChevronLeft, Send, MoreVertical, Download } from 'lucide-react';

// Toast = pop-up notifications for feedback
import { toast } from 'sonner';

/* Props contract */
interface RequirementsPanelProps {
  requirements: Requirement[];   // Current list of requirements
  onAddRequirement: (requirement: Omit<Requirement, 'id'>) => void; // Callback to add a new requirement (ID assigned by parent)
  onDeleteRequirement: (id: string) => void; // Callback to delete a requirement by ID
  showSubmitButton?: boolean; // Whether to show "Submit for Review" (engineer-only mode)
  onSubmitForReview?: () => void; // Callback triggered when submitting requirements for review
  isSubmitting?: boolean; // Shows submission in progress 
}

/* RequirementsPanel Component */
export const RequirementsPanel = ({
  requirements,
  onAddRequirement,
  onDeleteRequirement,
  showSubmitButton = false,
  onSubmitForReview,
  isSubmitting = false,
}: RequirementsPanelProps) => {

  /* Local UI State */
  const [type, setType] = useState<'functional' | 'non-functional'>('functional'); // Tracks the selected requirement type in the add form
  const [description, setDescription] = useState(''); // Tracks the current requirement description input
  const [isExpanded, setIsExpanded] = useState(true); // Controls whether the panel is expanded or collapsed

  /* Add requirement handler */
  const handleAdd = () => {
    if (description.trim()) {
      onAddRequirement({ type, description: description.trim() });
      setDescription('');
    }
  };

  /* Keyboard handler */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  /* Derived Data */
  const functionalReqs = requirements.filter((r) => r.type === 'functional');
  const nonFunctionalReqs = requirements.filter((r) => r.type === 'non-functional');

  /* Export requirements as text */
  const handleExportRequirements = () => {
    if (requirements.length === 0) {
      toast.error('No requirements to export');
      return;
    }

    // Build export content
    let content = 'REQUIREMENTS LIST\n';
    content += '=================\n\n';

    if (functionalReqs.length > 0) {
      content += 'FUNCTIONAL REQUIREMENTS\n';
      content += '-----------------------\n';
      functionalReqs.forEach((req, i) => {
        content += `${i + 1}. ${req.description}\n`;
      });
      content += '\n';
    }

    if (nonFunctionalReqs.length > 0) {
      content += 'NON-FUNCTIONAL REQUIREMENTS\n';
      content += '---------------------------\n';
      nonFunctionalReqs.forEach((req, i) => {
        content += `${i + 1}. ${req.description}\n`;
      });
    }

    // Create downloadable file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'requirements.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Requirements exported!');
  };

  /*
  Render
   */
  return (
    <div
      className={`bg-card border-l border-border flex flex-col h-full transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12'
      }`}
    >
      {/* Expand / Collapse Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-6 h-12 bg-card border border-border rounded-l-lg
                   flex items-center justify-center hover:bg-muted
                   transition-colors z-10"
      >
        {isExpanded ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Collapsed View */}
      {!isExpanded ? (
        <div className="flex-1 flex flex-col items-center pt-4">
          <ClipboardList className="w-5 h-5 text-muted-foreground" />
          <span className="mt-2 text-xs font-medium text-muted-foreground writing-mode-vertical">
            Requirements ({requirements.length})
          </span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-foreground">Requirements</h2>
              </div>

              {/* Header acitons dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportRequirements}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as TXT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-muted-foreground">
              {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} gathered
            </p>
          </div>

          {/* Add requirement form */}
          <div className="p-4 border-b border-border space-y-3">
            <Select 
            value={type} 
            onValueChange={(v) => 
              setType(v as 'functional' | 'non-functional')
            }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="functional">
                  Functional
                  </SelectItem>
                <SelectItem value="non-functional">
                  Non-Functional
                  </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter requirement..."
                className="flex-1 h-9 text-sm"
              />
              <Button
                onClick={handleAdd}
                size="icon"
                className="h-9 w-9"
                disabled={!description.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Requirements list */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">

              {/* Functional requirements */}
              {functionalReqs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="text-xs">
                      Functional
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({functionalReqs.length})
                      </span>
                  </div>

                  <div className="space-y-2">
                    {functionalReqs.map((req) => (
                      <div
                        key={req.id}
                        className="group flex items-start gap-2 p-2 
                        rounded-lg bg-muted/50 hover:bg-muted 
                        transition-colors"
                      >
                        <p className="flex-1 text-sm text-foreground">
                          {req.description}
                          </p>
                        <button
                          onClick={() => onDeleteRequirement(req.id)}
                          className="opacity-0 group-hover:opacity-100 
                          p-1 hover:text-destructive 
                          transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-functional requirements */}
              {nonFunctionalReqs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Non-Functional
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({nonFunctionalReqs.length})
                      </span>
                  </div>

                  <div className="space-y-2">
                    {nonFunctionalReqs.map((req) => (
                      <div
                        key={req.id}
                        className="group flex items-start gap-2 p-2 
                        rounded-lg bg-muted/50 hover:bg-muted 
                        transition-colors"
                      >
                        <p className="flex-1 text-sm text-foreground">
                          {req.description}
                          </p>
                        <button
                          onClick={() => onDeleteRequirement(req.id)}
                          className="opacity-0 group-hover:opacity-100 
                          p-1 hover:text-destructive 
                          transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {requirements.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 
                                  flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No requirements yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Interview stakeholders to gather requirements
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Submit for Review Button */}
          {showSubmitButton && (
            <div className="p-4 border-t border-border">
              <Button
                onClick={onSubmitForReview}
                disabled={requirements.length === 0 || isSubmitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Send requirements to the Senior Engineer
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
