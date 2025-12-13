import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createDoctor } from '@/lib/api';

interface AddDoctorModalProps {
  open: boolean;
  onClose: () => void;
  onDoctorCreated?: () => void;
}

export function AddDoctorModal({ open, onClose, onDoctorCreated }: AddDoctorModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const reset = () => {
    setName('');
    setSpecialty('');
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !specialty.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please enter doctor name and specialization.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDoctor({ name: name.trim(), specialization: specialty.trim() });
      setShowSuccess(true);
      onDoctorCreated?.();
      setTimeout(handleClose, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create doctor';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Doctor Added</h3>
            <p className="text-muted-foreground text-center">The doctor has been created successfully.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            Add Doctor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Doctor Name</Label>
            <Input
              placeholder="Enter doctor's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Specialization</Label>
            <Input
              placeholder="Enter specialization"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

