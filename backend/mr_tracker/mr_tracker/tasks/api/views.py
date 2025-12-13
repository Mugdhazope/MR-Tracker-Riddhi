from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import (
    CreateModelMixin,
    ListModelMixin,
    RetrieveModelMixin
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from mr_tracker.tasks.models import DoctorVisitTask
from mr_tracker.visits.models import DoctorVisit, Doctor
from mr_tracker.tasks.api.serializers import DoctorVisitTaskSerializer



class DoctorVisitTaskViewSet(CreateModelMixin,
                             ListModelMixin,
                             RetrieveModelMixin,
                             GenericViewSet):
    
    serializer_class = DoctorVisitTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "MR":
            return DoctorVisitTask.objects.filter(assigned_to=user)
        
        return DoctorVisitTask.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):

        task = self.get_object()

        if request.user != task.assigned_to:
            raise PermissionDenied("You cannot complete a task not assigned to you.")

        doctor_id = task.assigned_doctor.id
        gps_lat = request.data.get("gps_lat")
        gps_long = request.data.get("gps_long")
        notes = request.data.get("notes", "")

        visit = DoctorVisit.objects.create(
            mr=request.user,
            doctor_name=task.assigned_doctor,
            gps_lat=gps_lat,
            gps_long=gps_long,
            notes=notes,
            completed=True,
            visit_type='task',  # Mark as task-based visit
        )

        task.visit_record = visit
        task.completed = True
        task.save()

        return Response({
            "message": "Task completed successfully.",
            "task_id": task.id,
            "visit_id": visit.id
        })