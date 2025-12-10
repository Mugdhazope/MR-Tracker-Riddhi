from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin, CreateModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.mixins import UpdateModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from mr_tracker.users.models import User
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .serializers import (
    DoctorSerializer, 
    DoctorVisitSerializer, 
    ShopVisitSerializer, 
    AssignedVisitSerializer
)
from mr_tracker.visits.models import DoctorVisit, ShopVisit, AssignedVisit, Doctor

import logging        
logger = logging.getLogger(__name__)


class DoctorViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DoctorVisitViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin):
    serializer_class = DoctorVisitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "MR":
            return DoctorVisit.objects.filter(mr=user)
        return DoctorVisit.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(mr=self.request.user)


class ShopVisitViewSet(GenericViewSet, ListModelMixin, RetrieveModelMixin, CreateModelMixin, UpdateModelMixin):
    serializer_class = ShopVisitSerializer  
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "MR":
            return ShopVisit.objects.filter(mr=user)
        return ShopVisit.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(mr=self.request.user)


class AssignedVisitViewSet(
    GenericViewSet, 
    ListModelMixin, 
    RetrieveModelMixin, 
    CreateModelMixin, 
    UpdateModelMixin
):
    """
    ViewSet for managing assigned visits.
    
    Permissions:
    - Both Admin and MR can technically create (backend is open)
    - Frontend should only show "Assign Task" button to admins
    - MRs can view only their assigned visits
    - MRs can mark their visits as complete
    """
    serializer_class = AssignedVisitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        - MRs can only see visits assigned to them
        - Admins can see all assigned visits
        """
        user = self.request.user
        logger.info(f"GET queryset for user: {user.username} (Role: {user.role})")
        
        if user.role == "MR":
            queryset = AssignedVisit.objects.filter(mr=user)
            logger.info(f"Returning {queryset.count()} visits for MR {user.username}")
            return queryset
        
        queryset = AssignedVisit.objects.all()
        logger.info(f"Returning all {queryset.count()} visits for admin {user.username}")
        return queryset
    
    def perform_create(self, serializer):
        """
        Creates an assigned visit.
        The admin field is automatically set to the current user.
        
        NOTE: Backend allows both admin and MR to create (for flexibility)
        Frontend should only show "Assign Task" button to admins.
        """
        user = self.request.user
        
        logger.info(f"AssignedVisit creation by: {user.username} (ID: {user.id}, Role: {user.role})")
        
        serializer.save(admin=user)
        logger.info(f"AssignedVisit created successfully by {user.username}")

    @extend_schema(
        request=None,  
        responses={
            200: AssignedVisitSerializer,
            400: OpenApiResponse(description="Visit already completed"),
            403: OpenApiResponse(description="Not authorized"),
            404: OpenApiResponse(description="Visit not found"),
        },
        description="Mark an assigned visit as completed. Only the MR who was assigned the visit can mark it complete. No request body needed."
    )
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        """
        Mark an assigned visit as completed.
        Only the MR who was assigned the visit can mark it complete.
        
        Endpoint: POST /api/visits/assigned-visits/{id}/complete/
        No request body needed - just call the endpoint.
        """
        assigned_visit = self.get_object()
        user = request.user

        logger.info(f"Complete action called by {user.username} (Role: {user.role}) for visit {pk}")

        if user.role != "MR":
            logger.warning(f"Non-MR user {user.username} attempted to complete visit")
            raise PermissionDenied("Only MRs can complete visits")
        
        if assigned_visit.mr != user:
            logger.warning(f"MR {user.username} attempted to complete visit assigned to {assigned_visit.mr.username}")
            raise PermissionDenied("You can only complete visits assigned to you")

        if assigned_visit.completed:
            logger.info(f"Visit {pk} already marked as completed")
            return Response(
                {"detail": "This visit is already marked as completed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        assigned_visit.completed = True
        assigned_visit.completed_at = timezone.now()
        assigned_visit.save()

        logger.info(f"Visit {pk} marked as completed by {user.username} at {assigned_visit.completed_at}")

        serializer = self.get_serializer(assigned_visit)
        return Response(serializer.data, status=status.HTTP_200_OK)