import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentVisit {
  mr: string;
  doctor: string;
  time: string;
  notes?: string;
  status?: string;
}

interface RecentVisitsTableProps {
  visits: RecentVisit[];
}

export function RecentVisitsTable({ visits }: RecentVisitsTableProps) {
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
        {visits.map((visit, index) => (
          <div
            key={`${visit.mr}-${visit.doctor}-${index}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {visit.mr}
                </span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm text-muted-foreground truncate">
                  {visit.doctor}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{visit.time}</p>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                visit.status === "verified" ? "bg-secondary" : "bg-yellow-500"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
