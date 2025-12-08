import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Store, CheckCircle2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalShopVisitModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (visit: MedicalShopVisit) => void;
}

export interface MedicalShopVisit {
  id: string;
  shopName: string;
  location: string;
  notes: string;
  contactPerson?: string;
  time: string;
  date: string;
}

type ModalState = 'form' | 'success';

export function MedicalShopVisitModal({ open, onClose, onSave }: MedicalShopVisitModalProps) {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>('form');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [successData, setSuccessData] = useState<{ shopName: string; time: string } | null>(null);

  const handleClose = () => {
    setModalState('form');
    setShopName('');
    setLocation('');
    setContactPerson('');
    setNotes('');
    setSuccessData(null);
    onClose();
  };

  const handleSaveVisit = () => {
    if (!shopName.trim()) {
      toast({
        title: 'Shop name required',
        description: 'Please enter the medical shop name.',
        variant: 'destructive',
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: 'Location required',
        description: 'Please enter the shop location.',
        variant: 'destructive',
      });
      return;
    }

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];
    
    const visit: MedicalShopVisit = {
      id: `shop-${Date.now()}`,
      shopName: shopName.trim(),
      location: location.trim(),
      contactPerson: contactPerson.trim(),
      notes: notes.trim(),
      time,
      date,
    };

    onSave?.(visit);
    
    setSuccessData({
      shopName: shopName.trim(),
      time,
    });
    setModalState('success');

    setTimeout(() => {
      handleClose();
    }, 2500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
        {modalState === 'form' && (
          <>
            <DialogHeader className="p-4 sm:p-6 pb-0">
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                Log Medical Shop Visit
              </DialogTitle>
              <DialogDescription className="sr-only">
                Enter medical shop details to log your visit
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
                No GPS required. Manually enter shop details.
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name *</Label>
                <Input
                  id="shopName"
                  placeholder="Enter chemist/pharmacy name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter shop location or address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person (optional)</Label>
                <Input
                  id="contactPerson"
                  placeholder="Enter contact person name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1 h-11"
                  onClick={handleSaveVisit}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Save Visit
                </Button>
              </div>
            </div>
          </>
        )}

        {modalState === 'success' && successData && (
          <div className="p-6 sm:p-8 text-center" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Visit Saved Successfully</DialogTitle>
            <DialogDescription className="sr-only">Your shop visit has been logged</DialogDescription>
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle2 className="w-10 sm:w-12 h-10 sm:h-12 text-secondary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Shop Visit Logged!</h2>
            <p className="text-muted-foreground mb-2">{successData.shopName}</p>
            <p className="text-sm text-muted-foreground">{successData.time}</p>
            <Button variant="outline" className="mt-4 sm:mt-6" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
