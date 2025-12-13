import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface AssignedTask {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time?: string;
  notes?: string;
  status: 'pending' | 'completed';
}

interface AssignedTasksSectionProps {
  tasks: AssignedTask[];
  onMarkComplete: (taskId: string) => Promise<void> | void;
}

export function AssignedTasksSection({ tasks, onMarkComplete }: AssignedTasksSectionProps) {
  const { toast } = useToast();
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(task => task.date === today);
  const upcomingTasks = tasks.filter(task => task.date > today);
  const pendingTodayTasks = todaysTasks.filter(task => task.status === 'pending');
  const completedTodayTasks = todaysTasks.filter(task => task.status === 'completed');

  const handleMarkComplete = async (taskId: string) => {
    setCompletingTaskId(taskId);

    try {
      await onMarkComplete(taskId);
      toast({
        title: 'Task Completed',
        description: 'Visit marked as completed successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete task';
      toast({
        title: 'Error completing task',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Flexible';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const TaskCard = ({ task, showDate = false }: { task: AssignedTask; showDate?: boolean }) => (
    <div 
      className={`p-3 sm:p-4 rounded-lg border transition-all ${
        task.status === 'completed' 
          ? 'bg-secondary/5 border-secondary/20' 
          : 'bg-primary/5 border-primary/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${task.status === 'completed' ? 'text-secondary' : 'text-primary'}`} />
            <h4 className="font-medium text-foreground text-sm sm:text-base truncate">{task.doctorName}</h4>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">{task.doctorSpecialty}</p>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
            {showDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {formatDate(task.date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {formatTime(task.time)}
            </span>
          </div>
          
          {task.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{task.notes}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {task.status === 'completed' ? (
            <div className="flex items-center gap-1 text-secondary text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Done</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => handleMarkComplete(task.id)}
              disabled={completingTaskId === task.id}
              className="bg-secondary hover:bg-secondary/90 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
            >
              {completingTaskId === task.id ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Complete</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="pharma-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Today's Assigned Visits</h3>
          </div>
          <span className="text-xs sm:text-sm text-primary font-medium">
            {pendingTodayTasks.length} pending
          </span>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="text-center py-4 sm:py-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No assigned visits for today</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {pendingTodayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {completedTodayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div className="pharma-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Upcoming Tasks</h3>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              {upcomingTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {upcomingTasks.slice(0, 5).map((task) => (
              <TaskCard key={task.id} task={task} showDate />
            ))}
          </div>

          {upcomingTasks.length > 5 && (
            <button className="w-full mt-3 sm:mt-4 py-2 text-xs sm:text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1">
              View all {upcomingTasks.length} upcoming tasks
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
