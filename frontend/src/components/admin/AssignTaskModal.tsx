import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Stethoscope, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createTask } from "@/lib/api";

interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  mrs: Array<{ id: number; name: string; username: string }>;
  doctors: Array<{ id: number; name: string; specialization: string }>;
  onTaskAssigned?: (task: AssignedTask) => void;
  defaultMRId?: number | string;
  defaultDoctorId?: number | string;
}

export interface AssignedTask {
  id: string;
  mrId: string;
  mrName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time?: string;
  notes?: string;
  status: "pending" | "completed";
  createdAt: string;
}

export function AssignTaskModal({
  open,
  onClose,
  onTaskAssigned,
  mrs,
  doctors,
  defaultMRId,
  defaultDoctorId,
}: AssignTaskModalProps) {
  const { toast } = useToast();
  const [selectedMR, setSelectedMR] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (!selectedMR || !selectedDoctor || !date || !time) {
      toast({
        title: "Missing fields",
        description: "Please select MR, doctor, date, and time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    createTask({
      assigned_to: Number(selectedMR),
      assigned_doctor: Number(selectedDoctor),
      due_date: date,
      due_time: time,
      notes: notes || undefined,
    })
      .then((created: any) => {
        onTaskAssigned?.({
          id: String(created?.id ?? `task-${Date.now()}`),
          mrId: selectedMR,
          mrName: "",
          doctorName: "",
          doctorSpecialty: "",
          date,
          time,
          notes: notes || undefined,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
          onClose();
        }, 1200);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Could not assign task";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const resetForm = () => {
    setSelectedMR("");
    setSelectedDoctor("");
    setDate("");
    setTime("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (open) {
      if (defaultMRId && !selectedMR) {
        setSelectedMR(String(defaultMRId));
      }
      if (defaultDoctorId && !selectedDoctor) {
        setSelectedDoctor(String(defaultDoctorId));
      }
    }
  }, [open, defaultMRId, defaultDoctorId]);

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Task Assigned!
            </h3>
            <p className="text-muted-foreground text-center">
              The visit task has been assigned successfully.
            </p>
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
            <Calendar className="w-5 h-5 text-primary" />
            Assign Visit Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Select MR
            </Label>
            <Select value={selectedMR} onValueChange={setSelectedMR}>
              <SelectTrigger>
                <SelectValue placeholder="Choose MR..." />
              </SelectTrigger>
              <SelectContent>
                {mrs.map((mr) => (
                  <SelectItem key={mr.id} value={String(mr.id)}>
                    {mr.name || mr.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-muted-foreground" />
              Select Doctor
            </Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Doctor..." />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={String(doctor.id)}>
                    {doctor.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Time (Optional)
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
