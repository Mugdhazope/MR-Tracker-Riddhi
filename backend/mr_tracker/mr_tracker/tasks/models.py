from django.db import models
from django.utils import timezone
from mr_tracker.users.models import User
from mr_tracker.visits.models import DoctorVisit, ShopVisit, Doctor

class DoctorVisitTask(models.Model):
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    
    assigned_doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE, related_name="doctor_tasks"
    )
    assigned_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    due_time = models.TimeField()
    notes = models.TextField(blank=True)

    visit_record = models.OneToOneField(
        DoctorVisit,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="task"
    )

    completed = models.BooleanField(default=False)
    
    def mark_completed(self, visit):
        self.visit_record = visit
        self.completed = True
        self.save()

    def __str__(self):
        return f"Doctor Task for {self.assigned_to.username} - Dr. {self.assigned_doctor.name}"