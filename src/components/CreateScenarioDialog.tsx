/*

This component renders a modal dialog that allows users
to create or edit a Scenario

A Scenario consists of a title, short and full description, category
and one or more stakeholders

 */

// React tools to store data and run updates
import { useState, useEffect } from 'react';

// Pre-made UI parts (I used shadcn/ui)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Icons used in the interface
import { Plus, X } from 'lucide-react';

// Toast = pop-up notifications for feedback
import { toast } from 'sonner';

// Data validation tool (checks form input is correct)
import { z } from 'zod';

// Defines what a scenario object looks like
import { Scenario } from '@/types';

/*
 Predefined category list
    - Displayed as clickable buttons
    - Users also have option to write custom category
 */

const PREDEFINED_CATEGORIES = [
  'Education',
  'Entertainment',
  'Social',
  'Health',
  'Finance',
  'E-commerce',
  'Logistics',
  'Services',
  'Gaming',
  'Productivity',
  'Travel',
  'Food & Dining',
];

/*
Validation Schemas
- to enforce required fields and length constraints
- is done via Zod (https://zod.dev/) during submit
 */
const stakeholderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().min(1, 'Role is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
});

const scenarioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  shortDescription: z.string().min(1, 'Short description is required').max(200),
  fullDescription: z.string().min(1, 'Full description is required').max(2000),
  category: z.string().min(1, 'Category is required').max(50),
  stakeholders: z.array(stakeholderSchema).min(1, 'At least one stakeholder is required'),
});

/*
Component Props
 */
interface CreateScenarioDialogProps {
  open: boolean; // Controls dialog visibility
  onClose: () => void; // Called when dialog closes
  onAddScenario: (scenario: Omit<Scenario, 'id'>) => Promise<void>;
  onUpdateScenario?: (id: string, scenario: Omit<Scenario, 'id'>) => Promise<void>;
  editScenario?: Scenario | null; // Presence enables edit mode
}

/*
Local stakeholder form shape (IDs are generated later)
 */
interface StakeholderFormData {
  name: string;
  role: string;
  description: string;
}

/*
CreateScenarioDialog Component
 */
export const CreateScenarioDialog = ({
  open,
  onClose,
  onAddScenario,
  onUpdateScenario,
  editScenario,
}: CreateScenarioDialogProps) => {

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scenario Fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  // Category State 
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  // Stakeholders
  const [stakeholders, setStakeholders] = useState<StakeholderFormData[]>([
    { name: '', role: '', description: '' },
  ]);

  const isEditMode = !!editScenario; // Boolean to determine edit vs create mode

  /*
  Populate form when editing existing scenario
  Runs when:
      - dialog opens
      - editScenario changes
   */
  useEffect(() => {
    if (editScenario && open) {
      setTitle(editScenario.title);
      setShortDescription(editScenario.shortDescription);
      setFullDescription(editScenario.fullDescription);
      setCategory(editScenario.category);

      // Check if category is predefined or custom
      if (!PREDEFINED_CATEGORIES.includes(editScenario.category)) {
        setCustomCategory(editScenario.category);
      } else {
        setCustomCategory('');
      }

      // Strip IDs from stakeholders for form usage 
      setStakeholders(
        editScenario.stakeholders.map((s) => ({
          name: s.name,
          role: s.role,
          description: s.description,
        }))
      );
    }
  }, [editScenario, open]);

  // Reset form to empty state
  const resetForm = () => {
    setTitle('');
    setShortDescription('');
    setFullDescription('');
    setCategory('');
    setCustomCategory('');
    setStakeholders([{ name: '', role: '', description: '' }]);
  };

  // Handle selecting a predefined category badge
  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setCustomCategory('');
  };

  // Handle typing a custom category
  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value);
    if (value.trim()) {
      setCategory(value.trim());
    } else if (!PREDEFINED_CATEGORIES.includes(category)) {
      setCategory('');
    }
  };

  // Close dialog and reset local state
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Add a new blank stakeholder block
  const handleAddStakeholder = () => {
    setStakeholders([...stakeholders, { name: '', role: '', description: '' }]);
  };

  // Remove a stakeholder by index (minimum of one enforced)
  const handleRemoveStakeholder = (index: number) => {
    if (stakeholders.length > 1) {
      setStakeholders(stakeholders.filter((_, i) => i !== index));
    }
  };

  // Update a specific stakeholder field
  const handleStakeholderChange = (index: number, field: keyof StakeholderFormData, value: string) => {
    const updated = [...stakeholders];
    updated[index][field] = value;
    setStakeholders(updated);
  };

  /*
  Submit handler
  Steps:
  1 - Normalize & trim data
  2 - Validate via Zod
  3 - Call correct parent callback
  4 - Handle success/error UX
   */
  const handleSubmit = async () => {
    try {
      const data = {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        category: category.trim(),
        stakeholders: stakeholders.map((s) => ({
          name: s.name.trim(),
          role: s.role.trim(),
          description: s.description.trim(),
        })),
      };

      // Validate structure and constraints
      const validated = scenarioSchema.parse(data);
      
      setIsSubmitting(true);

      // Convert to Scenario shape (IDs created temporarily)
      const scenarioData: Omit<Scenario, 'id'> = {
        title: validated.title,
        shortDescription: validated.shortDescription,
        fullDescription: validated.fullDescription,
        category: validated.category,
        stakeholders: validated.stakeholders.map((s, i) => ({
          id: `temp-${i}`,
          name: s.name,
          role: s.role,
          description: s.description,
        })),
      };

      if (isEditMode && onUpdateScenario) {
        await onUpdateScenario(editScenario.id, scenarioData);
        toast.success('Scenario updated successfully!');
      } else {
        await onAddScenario(scenarioData);
        toast.success('Scenario created successfully!');
      }
      
      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(isEditMode ? 'Failed to update scenario' : 'Failed to create scenario');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  Render
   */
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl border-0 shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-display text-xl">
            {isEditMode ? 'Edit Scenario' : 'Create New Scenario'}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-4 py-2 pr-2">

            {/* Title*/}
            <div className="space-y-2">
              <Label htmlFor="create-title">Scenario Title *</Label>
              <Input
                id="create-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Restaurant Booking System"
                maxLength={100}
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <Label htmlFor="create-shortDesc">Short Description *</Label>
              <Input
                id="create-shortDesc"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A brief tagline for the scenario"
                maxLength={200}
              />
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <Label htmlFor="create-fullDesc">Full Description *</Label>
              <Textarea
                id="create-fullDesc"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Describe the platform/application in detail..."
                rows={3}
                maxLength={2000}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <Label>Category *</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={category === cat && !customCategory ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      category === cat && !customCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">or</span>
                <Input
                  value={customCategory}
                  onChange={(e) => handleCustomCategoryChange(e.target.value)}
                  placeholder="Type a custom category..."
                  maxLength={50}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Stakeholders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stakeholders *</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStakeholder}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Stakeholder
                </Button>
              </div>

              {stakeholders.map((stakeholder, index) => (
                <div key={index} className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Stakeholder {index + 1}
                    </span>
                    {stakeholders.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveStakeholder(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={stakeholder.name}
                        onChange={(e) => handleStakeholderChange(index, 'name', e.target.value)}
                        placeholder="John Doe"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Role</Label>
                      <Input
                        value={stakeholder.role}
                        onChange={(e) => handleStakeholderChange(index, 'role', e.target.value)}
                        placeholder="Restaurant Owner"
                        maxLength={100}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={stakeholder.description}
                      onChange={(e) => handleStakeholderChange(index, 'description', e.target.value)}
                      placeholder="Why this stakeholder is relevant to the project..."
                      rows={2}
                      maxLength={500}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditMode ? 'Saving...' : 'Creating...') 
                : (isEditMode ? 'Save Changes' : 'Create Scenario')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
