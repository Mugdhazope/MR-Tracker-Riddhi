import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, MapPin, Calendar, Plus, CheckCircle2, Clock, Store } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VisitMapModal } from '@/components/admin/VisitMapModal';
import { AssignTaskModal, AssignedTask } from '@/components/admin/AssignTaskModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mrData = [
  { id: '1', name: 'Rahul Kumar', territory: 'North Delhi', status: 'Working', visits: 8, firstPunch: '9:00 AM', lastPunch: '5:30 PM' },
  { id: '2', name: 'Priya Sharma', territory: 'South Delhi', status: 'Working', visits: 6, firstPunch: '9:15 AM', lastPunch: '4:45 PM' },
  { id: '3', name: 'Amit Rajan', territory: 'West Delhi', status: 'Leave', visits: 0, firstPunch: '-', lastPunch: '-' },
  { id: '4', name: 'Sneha Mishra', territory: 'East Delhi', status: 'Working', visits: 7, firstPunch: '8:45 AM', lastPunch: '5:00 PM' },
  { id: '5', name: 'Vikram Thakur', territory: 'Central Delhi', status: 'Working', visits: 5, firstPunch: '9:30 AM', lastPunch: '4:30 PM' },
  { id: '6', name: 'Neha Gupta', territory: 'Gurgaon', status: 'Off', visits: 0, firstPunch: '-', lastPunch: '-' },
];

const visitLogs = [
  { id: 1, time: '2:30 PM', mr: 'Rahul Kumar', doctor: 'Dr. Sharma', notes: 'Discussed new cardiac medicine', lat: 28.6139, lng: 77.2090, type: 'doctor' as const },
  { id: 2, time: '2:15 PM', mr: 'Priya Sharma', doctor: 'Dr. Patel', notes: 'Sample delivered', lat: 28.5355, lng: 77.2520, type: 'doctor' as const },
  { id: 3, time: '1:45 PM', mr: 'Rahul Kumar', doctor: 'Dr. Mehta', notes: 'Follow-up visit', lat: 28.6280, lng: 77.2169, type: 'doctor' as const },
  { id: 4, time: '1:30 PM', mr: 'Sneha Mishra', doctor: 'Dr. Singh', notes: 'New product demo', lat: 28.6692, lng: 77.4538, type: 'doctor' as const },
];

const shopVisitLogs = [
  { id: 1, time: '3:00 PM', mr: 'Rahul Kumar', shopName: 'MedPlus Pharmacy', location: 'Sector 18, Noida', notes: 'Discussed new product range', contactPerson: 'Ramesh Kumar' },
  { id: 2, time: '1:00 PM', mr: 'Priya Sharma', shopName: 'Apollo Pharmacy', location: 'Connaught Place', notes: 'Stock check', contactPerson: 'Suresh Verma' },
  { id: 3, time: '11:30 AM', mr: 'Sneha Mishra', shopName: 'Wellness Forever', location: 'Lajpat Nagar', notes: 'Order placed for 50 units', contactPerson: 'Amit Shah' },
];

const initialAssignedTasks: AssignedTask[] = [
  { 
    id: 'task-1', 
    mrId: '1',
    mrName: 'Rahul Kumar',
    doctorName: 'Dr. Kapoor', 
    doctorSpecialty: 'Cardiologist',
    date: new Date().toISOString().split('T')[0],
    time: '10:30',
    notes: 'Discuss new cardiac medication samples',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  { 
    id: 'task-2', 
    mrId: '1',
    mrName: 'Rahul Kumar',
    doctorName: 'Dr. Reddy', 
    doctorSpecialty: 'General Physician',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    status: 'completed',
    createdAt: new Date().toISOString()
  },
];

export default function MRTracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVisit, setSelectedVisit] = useState<typeof visitLogs[0] | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(initialAssignedTasks);

  const handleTaskAssigned = (task: AssignedTask) => {
    setAssignedTasks(prev => [task, ...prev]);
  };

  const filteredMRs = mrData.filter(mr => {
    const matchesSearch = mr.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTerritory = selectedTerritory === 'all' || mr.territory === selectedTerritory;
    const matchesStatus = selectedStatus === 'all' || mr.status === selectedStatus;
    return matchesSearch && matchesTerritory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working': return 'bg-secondary/10 text-secondary';
      case 'Leave': return 'bg-yellow-500/10 text-yellow-600';
      case 'Off': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="pharma-card p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search MRs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Territories</SelectItem>
                  <SelectItem value="North Delhi">North Delhi</SelectItem>
                  <SelectItem value="South Delhi">South Delhi</SelectItem>
                  <SelectItem value="East Delhi">East Delhi</SelectItem>
                  <SelectItem value="West Delhi">West Delhi</SelectItem>
                  <SelectItem value="Central Delhi">Central Delhi</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Off">Off</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button onClick={() => setIsAssignModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
            </div>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">MR Attendance Overview</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR Name</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                  <TableHead>First Punch</TableHead>
                  <TableHead>Last Punch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMRs.map((mr) => (
                  <TableRow key={mr.id}>
                    <TableCell>
                      <Link 
                        to={`/admin/mr/${mr.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {mr.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{mr.territory}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(mr.status)}`}>
                        {mr.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">{mr.visits}</TableCell>
                    <TableCell className="text-muted-foreground">{mr.firstPunch}</TableCell>
                    <TableCell className="text-muted-foreground">{mr.lastPunch}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/mr/${mr.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <Tabs defaultValue="doctor" className="w-full">
            <div className="p-4 lg:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="font-semibold text-foreground">Recent Visit Logs</h3>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="doctor" className="flex-1 sm:flex-none gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Doctor Visits</span>
                  <span className="sm:hidden">Doctors</span>
                </TabsTrigger>
                <TabsTrigger value="shop" className="flex-1 sm:flex-none gap-1.5">
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Shop Visits</span>
                  <span className="sm:hidden">Shops</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="doctor" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>MR</TableHead>
                      <TableHead>Doctor Visited</TableHead>
                      <TableHead className="hidden md:table-cell">Notes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitLogs.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{visit.time}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{visit.mr}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{visit.doctor}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate hidden md:table-cell text-xs sm:text-sm">{visit.notes}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedVisit(visit)}
                            className="text-xs sm:text-sm"
                          >
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">View on Map</span>
                            <span className="sm:hidden">Map</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="shop" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>MR</TableHead>
                      <TableHead>Shop Name</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead className="hidden lg:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopVisitLogs.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{visit.time}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{visit.mr}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="truncate">{visit.shopName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell text-xs sm:text-sm">{visit.location}</TableCell>
                        <TableCell className="text-muted-foreground hidden lg:table-cell text-xs sm:text-sm">{visit.contactPerson}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate hidden md:table-cell text-xs sm:text-sm">{visit.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Assigned Tasks</h3>
            <span className="text-sm text-muted-foreground">
              {assignedTasks.filter(t => t.status === 'pending').length} pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.mrName}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{task.doctorName}</span>
                        <p className="text-xs text-muted-foreground">{task.doctorSpecialty}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(task.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </TableCell>
                    <TableCell>
                      {task.time ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.time}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Flexible</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-yellow-500/10 text-yellow-600'
                      }`}>
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {task.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {task.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <VisitMapModal 
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />

      <AssignTaskModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onTaskAssigned={handleTaskAssigned}
      />
    </AdminLayout>
  );
}
