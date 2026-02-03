/*

 This component renders a modal dialog that allows a user
 to IMPORT a Scenario from JSON
 
 The JSON can be provided via drag & drop of a `.json` file, 
 or manual paste into a textarea

 */

// React tools to store data, reference elements, and reuse functions
import { useState, useRef, useCallback } from "react";

// Pre-made UI parts (I used shadcn/ui)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Icons used in the interface
import { Upload, FileJson } from "lucide-react";

// Toast = pop-up notifications for feedback
import { toast } from "sonner";

// Data validation tool (checks form input is correct)
import { z } from "zod";
// Runtime schema validation library

// Defines what a scenario object looks like
import { Scenario } from "@/types";

/*
Component Props
 */
interface ImportScenarioDialogProps {
  open: boolean; // Controls whether dialog is visible
  onClose: () => void; // Called when dialog closes
  onImportScenario: (scenario: Omit<Scenario, "id">) => Promise<void>;
  // Callback to persist imported scenario (without ID - parent owned)
}


/*
Zod validation schema for imported JSON
    - This schema defines the accepted shape of imported data
    - Anything outside this shape is rejected
 */
const importSchema = z.object({
  title: z.string().min(1).max(100), // Required scenario title
  shortDescription: z.string().min(1).max(200).optional(), // Optional short description
  fullDescription: z.string().min(1).max(2000), // Required full description
  category: z.string().min(1).max(50).optional(), // Optional category

  stakeholders: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        role: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
      }),
    )
    .min(1), // At least one stakeholder required
});

/*
ImportScenarioDialog Component
 */
export const ImportScenarioDialog = ({ 
  open, 
  onClose, 
  onImportScenario 
}: ImportScenarioDialogProps) => {

  /* Submission State */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
   Reset form state - clears JSON input when dialog closes or completes
   */
  const resetForm = () => {
    setImportJson("");
  };

  /*
  Close dialog handler
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /*
  Core JSON processing logic
  This function:
  1 - Parses JSON text
  2 - Validates structure using Zod
  3 - Normalises data to Scenario shape
  4 - Calls parent import callback
   */
  const processJsonContent = async (content: string) => {
    try {
      const parsed = JSON.parse(content);
      const validated = importSchema.parse(parsed);
      setIsSubmitting(true);

      await onImportScenario({
        title: validated.title,
        shortDescription: validated.shortDescription || validated.title,
        fullDescription: validated.fullDescription,
        category: validated.category || "Custom",
        stakeholders: validated.stakeholders.map((s, i) => ({
          id: `temp-${i}`, // Temporary ID - real ID assigned later
          name: s.name,
          role: s.role,
          description: s.description,
        })),
      });

      resetForm();
      onClose();
      toast.success("Scenario imported successfully!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message); // Validation error
      } 
      else if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format"); // JSON syntax error
      } 
      else {
        toast.error("Failed to import scenario"); // Generic fallback
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  Handle clicking "Import Scenario" button
   */
  const handleImport = () => {
    if (!importJson.trim()) return;
    processJsonContent(importJson);
  };

  /*
  File reading logic
   */
  const handleFileRead = useCallback((file: File) => {
    // Enforce .json extension
    if (!file.name.endsWith(".json")) {
      toast.error("Please upload a JSON file");
      return;
    }

    const reader = new FileReader();

    // File successfully read
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportJson(content);
      toast.success("File loaded! Click Import to continue.");
    };

    // File read error
    reader.onerror = () => {
      toast.error("Failed to read file");
    };

    reader.readAsText(file);
  }, []);

  /*
  Drag-and-drop handlers
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead],
  );

  /*
  File input (browse) handler
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  /*
  Programmatically trigger hidden file input
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  /*
  Render
   */
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl border-0 shadow-xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Import Scenario
            </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-4 py-2 pr-2">
            {/* JSON Format Help */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">
                JSON Format:
                </p>
              <pre className="text-xs overflow-x-auto">
{`[
  {
    "title": "Scenario Name",
    "shortDescription": "Brief summary...",
    "fullDescription": "Full description...",
    "category": "Category Name",
    "stakeholders": [
      {
        "name": "Person Name",
        "role": "Their Role",
        "description": "Why they matter..."
      },
      {
        (...)
      }
    ]
  },
  (...)
]`}
              </pre>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-3">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isDragging 
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDragging 
                  ? <FileJson className="w-6 h-6" /> 
                  : <Upload className="w-6 h-6" />}
                </div>

                {/* Text */}
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {isDragging 
                    ? "Drop your JSON file here" 
                    : "Drag & drop your JSON file"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse
                    </p>
                </div>
              </div>
            </div>

            {/* Manual JSON Paste Area */}
            <div className="space-y-2">
              <Label htmlFor="importJson">
                Or paste JSON manually
                </Label>
              <Textarea
                id="importJson"
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste your scenario JSON here..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              className="w-full gradient-primary"
              disabled={!importJson.trim() || isSubmitting}
            >
              {isSubmitting ? "Importing..." : "Import Scenario"}
            </Button>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
