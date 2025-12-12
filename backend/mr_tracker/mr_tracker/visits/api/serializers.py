from rest_framework import serializers

from mr_tracker.users.models import User
from mr_tracker.visits.models import DoctorVisit, ShopVisit, Doctor


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization']

    def __str__(self):
        return self.name
    
class DoctorVisitSerializer(serializers.ModelSerializer):
    mr = serializers.HiddenField(default=serializers.CurrentUserDefault())
    doctor_name = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())

    class Meta:
        model = DoctorVisit
        fields = ['id', 'mr', 'doctor_name', 'gps_lat', 'gps_long', 'notes', 'visit_date', 'visit_time', 'completed']

class ShopVisitSerializer(serializers.ModelSerializer):
    mr = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = ShopVisit
        fields = ['id', 'mr', 'shop_name', 'location', 'contact_person', 'notes', 'visit_date', 'visit_time', 'completed']

# class AssignedVisitSerializer(serializers.ModelSerializer):
#     # Make admin read-only - it will be set in perform_create
#     # DO NOT use HiddenField or CurrentUserDefault here
#     admin = serializers.PrimaryKeyRelatedField(read_only=True)
    
#     # Only show MRs in the dropdown
#     mr = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.filter(role="MR")
#     )
    
#     doctor = serializers.PrimaryKeyRelatedField(
#         queryset=Doctor.objects.all()
#     )

#     class Meta:
#         model = AssignedVisit
#         fields = [
#             'id', 
#             'admin',  # This should be read_only
#             'mr', 
#             'doctor', 
#             'assigned_date', 
#             'assigned_time', 
#             'notes', 
#             'completed',
#             'completed_at'
#         ]
#         read_only_fields = ['admin', 'assigned_date', 'assigned_time', 'completed_at']
        
#     def validate(self, data):
#         """Optional: Add custom validation here"""
#         print(f"🔍 Serializer validate() called with data: {data}")
#         return data