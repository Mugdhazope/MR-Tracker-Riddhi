import { Store, ChevronRight, MapPin } from 'lucide-react';
import { MedicalShopVisit } from './MedicalShopVisitModal';

interface MedicalShopVisitsSectionProps {
  visits: MedicalShopVisit[];
}

export function MedicalShopVisitsSection({ visits }: MedicalShopVisitsSectionProps) {
  if (visits.length === 0) {
    return null;
  }

  return (
    <div className="pharma-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Store className="w-4 h-4 text-primary" />
          <span className="text-sm sm:text-base">Medical Shop Visits</span>
        </h3>
        <span className="text-xs sm:text-sm text-primary font-medium">{visits.length} visits</span>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {visits.map((visit) => (
          <div 
            key={visit.id}
            className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Store className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{visit.shopName}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{visit.location}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{visit.time}</p>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
