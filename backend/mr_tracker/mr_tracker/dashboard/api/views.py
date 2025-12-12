from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db import models

from mr_tracker.visits.models import DoctorVisit, ShopVisit
from mr_tracker.tasks.models import DoctorVisitTask
from mr_tracker.users.models import User
from .serializers import (
    MRDashboardSerializer,
    AdminDashboardSerializer
)


class IsMR:
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "MR"

class IsAdmin:
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"



class MRDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsMR]

    def get(self, request):

        user = request.user
        today = timezone.now().date()

        today_doctor_visits = DoctorVisit.objects.filter(
            mr=user,
            visit_date=today
        ).order_by("-visit_time")

        today_shop_visits = ShopVisit.objects.filter(
            mr=user,
            visit_date=today
        ).order_by("-visit_time")

        tasks = DoctorVisitTask.objects.filter(assigned_to=user)

        task_list = [
            {
                "mr": t.assigned_to.username,
                "doctor": t.assigned_doctor.name,
                "date": t.due_date,
                "time": t.due_time,
                "status": "completed" if t.completed else "pending",
                "notes": t.notes,
            }
            for t in tasks
        ]

        recent_doctor_visits = [
            {
                "mr": dv.mr.username,
                "doctor": dv.doctor_name.name,
                "time": dv.visit_time.strftime("%I:%M %p"),
                "notes": dv.notes,
            }
            for dv in today_doctor_visits
        ]

        data = {
            "today_visits": today_doctor_visits.count() + today_shop_visits.count(),
            "assigned_tasks": task_list,
            "todays_doctor_visits": recent_doctor_visits,
            "todays_shop_visits": [
                {
                    "shop_name": sv.shop_name,
                    "location": sv.location,
                    "notes": sv.notes,
                    "time": sv.visit_time.strftime("%I:%M %p"),
                }
                for sv in today_shop_visits
            ],
        }

        serializer = MRDashboardSerializer(data)
        return Response(serializer.data)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        today = timezone.now().date()

        total_visits_today = (
            DoctorVisit.objects.filter(visit_date=today).count()
            + ShopVisit.objects.filter(visit_date=today).count()
        )

        active_mrs = User.objects.filter(role="MR").count()

        visited_today = DoctorVisit.objects.filter(
            visit_date=today
        ).values("mr").distinct().count()

        coverage_rate = (visited_today / active_mrs * 100) if active_mrs else 0

        top_doctor = (
            DoctorVisit.objects.filter(visit_date=today)
            .values("doctor_name__name")
            .annotate(count=models.Count("id"))
            .order_by("-count")
            .first()
        )

        summary_block = {
            "total_visits_today": total_visits_today,
            "active_mrs": active_mrs,
            "coverage_rate": f"{coverage_rate:.0f}%",
            "top_doctor_today": (
                {
                    "name": top_doctor["doctor_name__name"],
                    "visits": top_doctor["count"],
                }
                if top_doctor else None
            ),
        }

        last_7_days = []
        for i in range(7):
            day = today - timedelta(days=i)
            visits = (
                DoctorVisit.objects.filter(visit_date=day).count()
                + ShopVisit.objects.filter(visit_date=day).count()
            )
            last_7_days.append({"date": day, "count": visits})
        last_7_days.reverse()

        recent_doctors = DoctorVisit.objects.order_by(
            "-visit_date", "-visit_time"
        )[:10]

        recent_visits = [
            {
                "mr": v.mr.username,
                "doctor": v.doctor_name.name,
                "time": v.visit_time.strftime("%I:%M %p"),
                "notes": v.notes,
            }
            for v in recent_doctors
        ]

        mr_tracking_list = []
        for mr in User.objects.filter(role="MR"):
            visits_today = DoctorVisit.objects.filter(mr=mr, visit_date=today)

            first = visits_today.order_by("visit_time").first()
            last = visits_today.order_by("-visit_time").first()

            mr_tracking_list.append({
                "mr": mr.username,
                "visits_today": visits_today.count(),
                "first_punch": first.visit_time.strftime("%I:%M %p") if first else None,
                "last_punch": last.visit_time.strftime("%I:%M %p") if last else None,
            })

        tasks = DoctorVisitTask.objects.all().order_by("-due_date")
        task_summary = [
            {
                "mr": t.assigned_to.username,
                "doctor": t.assigned_doctor.name,
                "date": t.due_date,
                "time": t.due_time,
                "status": "completed" if t.completed else "pending",
                "notes": t.notes,
            }
            for t in tasks
        ]

        data = {
            "summary": summary_block,
            "daily_visits": last_7_days,
            "recent_visits": recent_visits,
            "mr_tracking": mr_tracking_list,
            "assigned_tasks": task_summary,
        }
        serializer = AdminDashboardSerializer(data)
        return Response(serializer.data)
