from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db import models
from django.db.models import Count, Q, F

from mr_tracker.visits.models import DoctorVisit, ShopVisit, Doctor
from mr_tracker.tasks.models import DoctorVisitTask
from mr_tracker.users.models import User
from .serializers import (
    MRDashboardSerializer,
    AdminDashboardSerializer
)
from mr_tracker.visits.api.serializers import DoctorVisitSerializer, ShopVisitSerializer


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
                "gps_lat": getattr(v, "gps_lat", None),
                "gps_long": getattr(v, "gps_long", None),
            }
            for v in recent_doctors
        ]

        mr_tracking_list = []
        for mr in User.objects.filter(role="MR"):
            visits_today = DoctorVisit.objects.filter(mr=mr, visit_date=today)

            first = visits_today.order_by("visit_time").first()
            last = visits_today.order_by("-visit_time").first()

            mr_tracking_list.append({
                "mr_id": mr.id,
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


class AdminMRDetailView(APIView):
    """
    Detailed MR view with complete visit history and filtering by date range.
    Endpoint: GET /api/dashboard/admin/mr/{mr_id}/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, mr_id=None):
        try:
            mr = User.objects.get(id=mr_id, role="MR")
        except User.DoesNotExist:
            raise NotFound(f"MR with ID {mr_id} not found")

        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        visit_type = request.query_params.get('visit_type')

        filters = Q(mr=mr)
        
        if start_date:
            try:
                start_date_obj = timezone.datetime.strptime(start_date, '%Y-%m-%d').date()
                filters &= Q(visit_date__gte=start_date_obj)
            except ValueError:
                pass

        if end_date:
            try:
                end_date_obj = timezone.datetime.strptime(end_date, '%Y-%m-%d').date()
                filters &= Q(visit_date__lte=end_date_obj)
            except ValueError:
                pass

        doctor_visits_qs = DoctorVisit.objects.filter(filters).order_by('-visit_date', '-visit_time')
        doctor_visits = DoctorVisitSerializer(doctor_visits_qs, many=True).data

        shop_visits_qs = ShopVisit.objects.filter(filters).order_by('-visit_date', '-visit_time')
        shop_visits = ShopVisitSerializer(shop_visits_qs, many=True).data

        total_doctor_visits = doctor_visits_qs.count()
        total_shop_visits = shop_visits_qs.count()
        total_visits = total_doctor_visits + total_shop_visits

        task_based_doctor = doctor_visits_qs.filter(visit_type='task').count()
        self_visit_doctor = doctor_visits_qs.filter(visit_type='self').count()
        task_based_shop = shop_visits_qs.filter(visit_type='task').count()
        self_visit_shop = shop_visits_qs.filter(visit_type='self').count()

        top_doctors = (
            doctor_visits_qs
            .values('doctor_name__name', 'doctor_name__specialization')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        daily_breakdown = (
            doctor_visits_qs
            .extra(select={'visit_date_str': 'DATE(visit_date)'})
            .values('visit_date_str')
            .annotate(doctor_count=Count('id'))
        )

        shop_daily = (
            shop_visits_qs
            .extra(select={'visit_date_str': 'DATE(visit_date)'})
            .values('visit_date_str')
            .annotate(shop_count=Count('id'))
        )

        data = {
            "mr_id": mr.id,
            "mr_username": mr.username,
            "mr_name": mr.name or mr.username,
            "statistics": {
                "total_visits": total_visits,
                "total_doctor_visits": total_doctor_visits,
                "total_shop_visits": total_shop_visits,
                "task_based_doctor_visits": task_based_doctor,
                "self_visit_doctor_visits": self_visit_doctor,
                "task_based_shop_visits": task_based_shop,
                "self_visit_shop_visits": self_visit_shop,
            },
            "top_doctors": top_doctors,
            "doctor_visits": doctor_visits,
            "shop_visits": shop_visits,
            "date_range": {
                "start_date": start_date or "all",
                "end_date": end_date or "all",
            }
        }

        return Response(data)


class AdminAnalyticsView(APIView):
    """
    Real-time analytics dashboard with aggregated metrics from database.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        period = request.query_params.get('period', 'day')  
        today = timezone.now().date()

        if period == 'week':
            start_date = today - timedelta(days=7)
        elif period == 'month':
            start_date = today - timedelta(days=30)
        else:  # day
            start_date = today

        mrs = User.objects.filter(role="MR")
        mr_stats = []

        for mr in mrs:
            doctor_visits = DoctorVisit.objects.filter(
                mr=mr,
                visit_date__gte=start_date
            )
            shop_visits = ShopVisit.objects.filter(
                mr=mr,
                visit_date__gte=start_date
            )
            total = doctor_visits.count() + shop_visits.count()

            mr_stats.append({
                "mr_id": mr.id,
                "mr_username": mr.username,
                "mr_name": mr.name or mr.username,
                "doctor_visits": doctor_visits.count(),
                "shop_visits": shop_visits.count(),
                "total_visits": total,
                "task_based_visits": doctor_visits.filter(visit_type='task').count() + shop_visits.filter(visit_type='task').count(),
                "self_visits": doctor_visits.filter(visit_type='self').count() + shop_visits.filter(visit_type='self').count(),
            })

        mr_stats.sort(key=lambda x: x['total_visits'], reverse=True)

        top_doctors = (
            DoctorVisit.objects.filter(visit_date__gte=start_date)
            .values('doctor_name__id', 'doctor_name__name', 'doctor_name__specialization')
            .annotate(total_visits=Count('id'))
            .order_by('-total_visits')[:10]
        )

        daily_trends = []
        for i in range(30 if period == 'month' else 7 if period == 'week' else 1):
            day = today - timedelta(days=i)
            doctor_count = DoctorVisit.objects.filter(visit_date=day).count()
            shop_count = ShopVisit.objects.filter(visit_date=day).count()
            daily_trends.append({
                "date": day.isoformat(),
                "doctor_visits": doctor_count,
                "shop_visits": shop_count,
                "total": doctor_count + shop_count,
            })

        daily_trends.reverse()

        total_doctor_visits = DoctorVisit.objects.filter(visit_date__gte=start_date).count()
        total_shop_visits = ShopVisit.objects.filter(visit_date__gte=start_date).count()
        active_mrs_count = User.objects.filter(role="MR").annotate(
            visit_count=Count('doctor_visits') + Count('shop_visits')
        ).filter(visit_count__gt=0).count()

        data = {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": today.isoformat(),
            "summary": {
                "total_visits": total_doctor_visits + total_shop_visits,
                "total_doctor_visits": total_doctor_visits,
                "total_shop_visits": total_shop_visits,
                "active_mrs": active_mrs_count,
                "total_mrs": mrs.count(),
            },
            "mr_performance": mr_stats,
            "top_doctors": list(top_doctors),
            "daily_trends": daily_trends,
        }

        return Response(data)
