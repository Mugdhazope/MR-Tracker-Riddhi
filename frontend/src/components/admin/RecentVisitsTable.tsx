import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const recentVisits = [
  { id: 1, mr: 'Rahul K.', doctor: 'Dr. Sharma', time: '2:30 PM', status: 'verified' },
  { id: 2, mr: 'Priya S.', doctor: 'Dr. Patel', time: '2:15 PM', status: 'verified' },
  { id: 3, mr: 'Amit R.', doctor: 'Dr. Mehta', time: '1:45 PM', status: 'verified' },
  { id: 4, mr: 'Sneha M.', doctor: 'Dr. Singh', time: '1:30 PM', status: 'pending' },
  { id: 5, mr: 'Vikram T.', doctor: 'Dr. Gupta', time: '1:00 PM', status: 'verified' },
];

export function RecentVisitsTable() {
  return (
    <div className="pharma-card p-5 lg:p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Visits</h3>
        <Link to="/admin/mr-tracking">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentVisits.map((visit) => (
          <div 
            key={visit.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">{visit.mr}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm text-muted-foreground truncate">{visit.doctor}</span>
              </div>
              <p className="text-xs text-muted-foreground">{visit.time}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${visit.status === 'verified' ? 'bg-secondary' : 'bg-yellow-500'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
