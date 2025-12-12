from django.db import models
from mr_tracker.users.models import User

class Doctor(models.Model):
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="doctors_created"
    )

    def __str__(self):
        return self.name
    

class DoctorVisit(models.Model):
    mr = models.ForeignKey(User,on_delete=models.CASCADE, related_name='doctor_visits')
    doctor_name = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='doctor')
    gps_lat = models.FloatField(null=True, blank=True)
    gps_long = models.FloatField(null=True, blank=True)

    notes = models.TextField(blank=True)

    visit_date = models.DateField(auto_now_add=True)
    visit_time = models.TimeField(auto_now_add=True)

    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Visit to {self.doctor_name} by {self.mr.username} on {self.visit_date}"
    
    class Meta:
        ordering = ['-visit_date', '-visit_time']

class ShopVisit(models.Model):
    mr = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shop_visits')
    
    shop_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True)

    visit_date = models.DateField(auto_now_add=True)
    visit_time = models.TimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Shop Visit to {self.shop_name} by {self.mr.username} on {self.id}"
    
    class Meta:
        ordering = ['-visit_date', '-visit_time']


# class AssignedVisit(models.Model):
#     admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_by')
#     mr = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assiged_to')
#     doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='assigned_doctor')

#     assigned_date = models.DateField(auto_now_add=True)
#     assigned_time = models.TimeField(auto_now_add=True)

#     notes = models.TextField(blank=True)

#     completed = models.BooleanField(default=False)

#     completed_at = models.DateTimeField(null=True, blank=True)

#     def __str__(self):
#         return f"Assigned Visit of {self.doctor} to {self.mr.username} by {self.admin.username}"
    










