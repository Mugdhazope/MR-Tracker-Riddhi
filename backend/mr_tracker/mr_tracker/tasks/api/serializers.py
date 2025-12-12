from rest_framework import serializers
from mr_tracker.users.models import User
from mr_tracker.visits.models import DoctorVisit, Doctor
from mr_tracker.tasks.models import DoctorVisitTask


class DoctorVisitTaskSerializer(serializers.ModelSerializer):

    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="MR")
    )
    assigned_by = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    assigned_doctor = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all()
    )

    visit_record = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    class Meta:
        model = DoctorVisitTask
        fields = [
            'id',
            'assigned_to',
            'assigned_by',
            'assigned_doctor',
            'assigned_date',
            'due_date',
            'due_time',
            'notes',
            'completed',
            'visit_record'
        ]
        read_only_fields = ['assigned_date', 'completed', 'visit_record']

    def validate(self, attrs):
        if attrs["assigned_to"] == self.context["request"].user:
            raise serializers.ValidationError("You cannot assign a task to yourself.")

        return attrs
