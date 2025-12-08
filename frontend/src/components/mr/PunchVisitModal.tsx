import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, CheckCircle2, X, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PunchVisitModalProps {
  open: boolean;
  onClose: () => void;
}
const doctorsList = [
  { id: '1', name: 'Dr. Sharma', specialty: 'Cardiologist' },
  { id: '2', name: 'Dr. Patel', specialty: 'General Physician' },
  { id: '3', name: 'Dr. Mehta', specialty: 'Pediatrician' },
  { id: '4', name: 'Dr. Singh', specialty: 'Orthopedic' },
  { id: '5', name: 'Dr. Gupta', specialty: 'Dermatologist' },
];

type ModalState = 'form' | 'success' | 'add-doctor';

export function PunchVisitModal({ open, onClose }: PunchVisitModalProps) {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>('form');
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'acquired' | 'failed'>('acquiring');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [successData, setSuccessData] = useState<{ doctorName: string; time: string } | null>(null);
  
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open && modalState === 'form') {
      setGpsStatus('acquiring');
      const timer = setTimeout(() => {
        setGpsStatus('acquired');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, modalState]);

  useEffect(() => {
    if (modalState === 'success') {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [modalState]);

  const handleClose = () => {
    setModalState('form');
    setSelectedDoctor('');
    setNotes('');
    setGpsStatus('acquiring');
    setSuccessData(null);
    setNewDoctor({ name: '', specialty: '' });
    onClose();
  };

  const handleSaveVisit = () => {
    if (!selectedDoctor) {
      toast({
        title: 'Select a doctor',
        description: 'Please select a doctor to punch your visit.',
        variant: 'destructive',
      });
      return;
    }

    const doctor = doctorsList.find(d => d.id === selectedDoctor);
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    setSuccessData({
      doctorName: doctor?.name || 'Doctor',
      time,
    });
    setModalState('success');
  };

  const handleAddDoctor = () => {
    if (!newDoctor.name || !newDoctor.specialty) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all doctor details.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Doctor added',
      description: `${newDoctor.name} has been added to your list.`,
    });
    setNewDoctor({ name: '', specialty: '' });
    setModalState('form');
  };

  const filteredDoctors = doctorsList.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
        {modalState === 'form' && (
          <>
            <DialogHeader className="p-4 sm:p-6 pb-0">
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Punch Doctor Visit
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  {gpsStatus === 'acquiring' ? (
                    <>
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <span className="text-sm text-muted-foreground">Acquiring location...</span>
                    </>
                  ) : gpsStatus === 'acquired' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-foreground font-medium">Location Acquired ✔</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-destructive" />
                      <span className="text-sm text-destructive">Location failed. Please enable GPS.</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Doctor</Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span>{doctor.name}</span>
                          <span className="text-xs text-muted-foreground">{doctor.specialty}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => setModalState('add-doctor')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add new doctor
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Add any notes about this visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1 h-11"
                  disabled={gpsStatus !== 'acquired'}
                  onClick={handleSaveVisit}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Save Visit
                </Button>
              </div>
            </div>
          </>
        )}

        {modalState === 'success' && successData && (
          <div className="p-6 sm:p-8 text-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle2 className="w-10 sm:w-12 h-10 sm:h-12 text-secondary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Visit Saved Successfully!</h2>
            <p className="text-muted-foreground mb-2">{successData.doctorName}</p>
            <p className="text-sm text-muted-foreground">{successData.time}</p>
            <Button variant="outline" className="mt-4 sm:mt-6" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {modalState === 'add-doctor' && (
          <>
            <DialogHeader className="p-4 sm:p-6 pb-0">
              <DialogTitle className="text-lg sm:text-xl">Add New Doctor</DialogTitle>
            </DialogHeader>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label>Doctor Name</Label>
                <Input
                  placeholder="Enter doctor's name"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input
                  placeholder="Enter specialty"
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11" onClick={() => setModalState('form')}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1 h-11" onClick={handleAddDoctor}>
                  Add Doctor
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
