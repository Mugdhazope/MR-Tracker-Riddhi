import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  WifiOff, 
  Wifi, 
  LogOut,
  Calendar,
  ChevronRight,
  User,
  Store
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PunchVisitModal } from '@/components/mr/PunchVisitModal';
import { MedicalShopVisitModal, MedicalShopVisit } from '@/components/mr/MedicalShopVisitModal';
import { MedicalShopVisitsSection } from '@/components/mr/MedicalShopVisitsSection';
import { AssignedTasksSection, AssignedTask } from '@/components/mr/AssignedTasksSection';

const todaysVisits = [
  { id: 1, doctorName: 'Dr. Sharma', time: '9:30 AM', status: 'completed' },
  { id: 2, doctorName: 'Dr. Patel', time: '11:00 AM', status: 'completed' },
  { id: 3, doctorName: 'Dr. Mehta', time: '1:30 PM', status: 'completed' },
];

const lastVisit = { doctorName: 'Dr. Mehta', time: '1:30 PM' };

const initialAssignedTasks: AssignedTask[] = [
  { 
    id: 'task-1', 
    doctorName: 'Dr. Kapoor', 
    doctorSpecialty: 'Cardiologist',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    notes: 'Discuss new cardiac medication samples',
    status: 'pending'
  },
  { 
    id: 'task-2', 
    doctorName: 'Dr. Reddy', 
    doctorSpecialty: 'General Physician',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    status: 'pending'
  },
  { 
    id: 'task-3', 
    doctorName: 'Dr. Joshi', 
    doctorSpecialty: 'Orthopedic',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:00',
    notes: 'Product demo for joint supplements',
    status: 'pending'
  },
  { 
    id: 'task-4', 
    doctorName: 'Dr. Nair', 
    doctorSpecialty: 'Neurologist',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    status: 'pending'
  },
];

const initialShopVisits: MedicalShopVisit[] = [
  {
    id: 'shop-1',
    shopName: 'MedPlus Pharmacy',
    location: 'Sector 18, Noida',
    notes: 'Discussed new product range',
    contactPerson: 'Ramesh Kumar',
    time: '10:15 AM',
    date: new Date().toISOString().split('T')[0],
  },
];

export default function MRDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(initialAssignedTasks);
  const [shopVisits, setShopVisits] = useState<MedicalShopVisit[]>(initialShopVisits);

  const handleMarkTaskComplete = (taskId: string) => {
    setAssignedTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );
  };

  const handleShopVisitSave = (visit: MedicalShopVisit) => {
    setShopVisits(prev => [visit, ...prev]);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {!isOnline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You are offline. Visits will sync when connected.</span>
        </div>
      )}

      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{getGreeting()}</p>
                <h1 className="font-semibold text-foreground">Rahul Kumar</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-secondary" />
                    <span className="text-muted-foreground">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground">Offline</span>
                  </>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{currentDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{currentTime}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div 
            onClick={() => setIsPunchModalOpen(true)}
            className="pharma-card p-3 sm:p-4 cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-4 sm:p-5 text-center shadow-pharma-lg group-hover:shadow-pharma-xl transition-shadow">
              <div className="relative mx-auto mb-2 sm:mb-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-primary-foreground mb-0.5">Doctor Visit</h2>
              <p className="text-primary-foreground/70 text-xs hidden sm:block">With GPS</p>
            </div>
          </div>

          <div 
            onClick={() => setIsShopModalOpen(true)}
            className="pharma-card p-3 sm:p-4 cursor-pointer group hover:border-secondary/30 transition-all"
          >
            <div className="bg-gradient-to-r from-pharma-blue to-primary rounded-xl p-4 sm:p-5 text-center shadow-pharma-lg group-hover:shadow-pharma-xl transition-shadow">
              <div className="relative mx-auto mb-2 sm:mb-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
                  <Store className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-primary-foreground mb-0.5">Shop Visit</h2>
              <p className="text-primary-foreground/70 text-xs hidden sm:block">No GPS</p>
            </div>
          </div>
        </div>

        {lastVisit && (
          <div className="pharma-card p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Last doctor visit:</span>
              <span className="font-medium text-foreground">
                {lastVisit.doctorName} at {lastVisit.time}
              </span>
            </div>
          </div>
        )}

        <div className="mb-4 sm:mb-6">
          <AssignedTasksSection 
            tasks={assignedTasks} 
            onMarkComplete={handleMarkTaskComplete} 
          />
        </div>

        <div className="pharma-card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Today's Doctor Visits</h3>
            <span className="text-xs sm:text-sm text-primary font-medium">{todaysVisits.length} visits</span>
          </div>

          {todaysVisits.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No visits recorded today</p>
              <p className="text-xs text-muted-foreground mt-1">Tap above to punch your first visit</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {todaysVisits.map((visit) => (
                <div 
                  key={visit.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{visit.doctorName}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">{visit.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <MedicalShopVisitsSection visits={shopVisits.filter(v => v.date === new Date().toISOString().split('T')[0])} />
      </main>

      <PunchVisitModal 
        open={isPunchModalOpen} 
        onClose={() => setIsPunchModalOpen(false)} 
      />

      <MedicalShopVisitModal
        open={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onSave={handleShopVisitSave}
      />
    </div>
  );
}
