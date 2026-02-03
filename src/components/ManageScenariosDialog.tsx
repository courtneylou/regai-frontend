/*

This component renders a modal dialog for managing user scenarios.

It provides:
    - Create new scenario (opens CreateScenarioDialog)
    - Import scenario JSON (opens ImportScenarioDialog)
    - Export all scenarios (default + custom) as a JSON download
    - List existing custom scenarios
    - Edit an existing custom scenario (opens CreateScenarioDialog in edit mode)
    - Delete an existing custom scenario

 */

// React tool to store data
import { useState } from 'react';

// Pre-made UI parts (I used shadcn/ui)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; 
import { Button } from '@/components/ui/button'; 
import { ScrollArea } from '@/components/ui/scroll-area'; 

// Icons used in the interface
import { Plus, Trash2, Upload, Download, Pencil, ClipboardPenLine } from 'lucide-react'; 

// Toast = pop-up notifications for feedback
import { toast } from 'sonner'; 

// Loads the default list of pre-made scenarios
import { defaultScenarios } from '@/data/scenarios'; 

// Dialog component for creating a new scenario
import { CreateScenarioDialog } from './CreateScenarioDialog'; 

// Dialog component for importing a scenario from a file or external source
import { ImportScenarioDialog } from './ImportScenarioDialog';

// Defines what a scenario object looks like
import { Scenario } from '@/types';

 /*
 ManageScenariosDialog controls the popup where users manage their scenarios.
 This popup:
    - Shows the user’s saved scenarios
    - Lets the user add new ones
    - Lets the user edit existing ones
    - Lets the user delete scenarios
    - Lets the user import scenarios from a file
*/
interface ManageScenariosDialogProps {
  open: boolean; // Whether the scenario management popup is visible
  onClose: () => void; // User closes the popup
  customScenarios: Scenario[]; // Users current saved scenarios
  onAddScenario: (scenario: Omit<Scenario, 'id'>) => Promise<void>; // User creates a new scenario
  onDeleteScenario: (id: string) => Promise<void>; // User removes a scenario
  onImportScenario: (scenario: Omit<Scenario, 'id'>) => Promise<void>; // Scenario is imported
  onUpdateScenario: (id: string, scenario: Omit<Scenario, 'id'>) => Promise<void>; // Scenario is edited
}

/*
ManageScenariosDialog Component
  */
export const ManageScenariosDialog = ({
  open,
  onClose,
  customScenarios,
  onAddScenario,
  onDeleteScenario,
  onImportScenario,
  onUpdateScenario,
}: ManageScenariosDialogProps) => {

  /* UI State */
  const [showCreateDialog, setShowCreateDialog] = useState(false); // Controls whether the "Create new scenario" dialog is open
  const [showImportDialog, setShowImportDialog] = useState(false); // Controls whether the "Import scenario" dialog is open
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null); // If not null, the edit dialog is open and prepopulated with this scenario

  /*
  Delete handler
   */
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      await onDeleteScenario(id); // delegate deletion to parent
      toast.success('Scenario deleted');
    }
  };

  /*
  Edit handler
   */
  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario); // triggers edit mode dialog open
  };

  /*
  Close the edit dialog by clearing editingScenario.
   */
  const handleCloseEditDialog = () => {
    setEditingScenario(null);
  };

  /*
  Export handler
  Exports BOTH:
      - defaultScenarios (predefined)
      - customScenarios (user created)
  Notes:
      - IDs are removed for portability
      - Produces a downloadable scenarios-export.json file
   */
  const handleExportAll = () => {
    // Combine default + custom scenarios, removes IDs
    const allScenarios = [...defaultScenarios, ...customScenarios].map((s) => ({
      title: s.title,
      shortDescription: s.shortDescription,
      fullDescription: s.fullDescription,
      category: s.category,
      stakeholders: s.stakeholders.map((st) => ({
        name: st.name,
        role: st.role,
        description: st.description,
      })),
    }));

    const json = JSON.stringify(allScenarios, null, 2); // Convert to json
    const blob = new Blob([json], { type: 'application/json' }); // Create a Blob so the browser can download content as a file
    const url = URL.createObjectURL(blob); // Create a temporary object URL pointing at that Blob

    // Create a temporary <a> element to trigger the download
    const a = document.createElement('a');
    a.href = url; // link target is the blob URL
    a.download = 'scenarios-export.json'; // suggested filename

    document.body.appendChild(a); // Append to DOM because some browsers require it before click()
    a.click(); // Click to trigger the download

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Scenarios exported successfully!');
  };
  /*
  Render
   */
  return (
    <>
    {/* Main "Manage Scenarios" Dialog */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl border-0 shadow-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Manage Scenarios</DialogTitle>
          </DialogHeader>

          {/* Action Buttons row */}
          <div className="flex gap-2 border-b border-border pb-3">
            {/* Create new scenario button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateDialog(true)} // opens create dialog
            >
              <Plus className="w-4 h-4 mr-1" />
              Create New
            </Button>

            {/* Import scenarios button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportDialog(true)} // opens import dialog
            >
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>

            {/* Export all scenarios button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportAll}
            >
              <Download className="w-4 h-4 mr-1" />
              Export All
            </Button>
          </div>

          {/* Scrollable list of custom scenarios */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-3 py-2">
              {/* Section header */}
              <p className="text-sm text-muted-foreground font-medium">
                My Scenarios ({customScenarios.length})
              </p>

              {/* Empty state when user has no custom scenarios */}
              {customScenarios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center text-2xl">
                    <ClipboardPenLine className="w-8 h-8" />
                  </div>
                  <p className="text-muted-foreground">
                    No custom scenarios yet
                    </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create or import your own scenarios
                  </p>
                </div>
              ) : (
                /* Render each custom scenario as a clickable row */
                customScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => handleEdit(scenario)} // clicking row opens edit mode
                  >
                    {/* Left side: title + stakeholder count */}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {scenario.title}
                        </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {/* Pluralize "stakeholder(s)" */}
                        {scenario.stakeholders.length} stakeholder
                        {scenario.stakeholders.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Right side: row action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Edit button (pencil)*/}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation(); // prevents row click handler from firing twice
                          handleEdit(scenario); // open edit dialog
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* Delete button (trash) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation(); // prevents triggering edit from row click
                          handleDelete(scenario.id); // delete scenario
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create Scenario Dialog (create mode) */}
      <CreateScenarioDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onAddScenario={onAddScenario}
      />
      
      {/* Create Scenario Dialog (edit mode) */}
      <CreateScenarioDialog
        open={!!editingScenario}
        onClose={handleCloseEditDialog}
        onAddScenario={onAddScenario}
        onUpdateScenario={onUpdateScenario}
        editScenario={editingScenario}
      />

      {/* Import Dialog */}
      <ImportScenarioDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportScenario={onImportScenario}
      />
    </>
  );
};
