import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { VisitsChart } from '@/components/admin/VisitsChart';
import { RecentVisitsTable } from '@/components/admin/RecentVisitsTable';
import { Users, MapPin, TrendingUp, UserCheck } from 'lucide-react';

const stats = [
  { label: 'Total Visits Today', value: '156', change: '+12%', icon: MapPin, color: 'primary' as const },
  { label: 'Active MRs', value: '24', change: '+2', icon: Users, color: 'secondary' as const },
  { label: 'Coverage Rate', value: '87%', change: '+5%', icon: TrendingUp, color: 'primary' as const },
  { label: 'Top Doctor Today', value: 'Dr. Sharma', subValue: '12 visits', icon: UserCheck, color: 'secondary' as const },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisitsChart />
          </div>
          <div>
            <RecentVisitsTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
