from rest_framework import serializers
from mr_tracker.visits.models import DoctorVisit, ShopVisit
from mr_tracker.users.models import User
from mr_tracker.tasks.models import DoctorVisitTask


class RecentVisitSerializer(serializers.Serializer):
    mr = serializers.CharField()
    doctor = serializers.CharField()
    time = serializers.CharField()
    notes = serializers.CharField()
    gps_lat = serializers.FloatField(allow_null=True, required=False)
    gps_long = serializers.FloatField(allow_null=True, required=False)


class MRTrackingSerializer(serializers.Serializer):
    mr_id = serializers.IntegerField(required=False)
    mr = serializers.CharField()
    visits_today = serializers.IntegerField()
    first_punch = serializers.CharField(allow_null=True)
    last_punch = serializers.CharField(allow_null=True)


class TaskSummarySerializer(serializers.Serializer):
    mr = serializers.CharField()
    doctor = serializers.CharField()
    date = serializers.DateField()
    time = serializers.TimeField()
    status = serializers.CharField()
    notes = serializers.CharField()


class MRDashboardSerializer(serializers.Serializer):
    today_visits = serializers.IntegerField()
    assigned_tasks = TaskSummarySerializer(many=True)
    todays_doctor_visits = RecentVisitSerializer(many=True)
    todays_shop_visits = serializers.ListField()


class AdminDashboardSerializer(serializers.Serializer):
    summary = serializers.DictField()
    daily_visits = serializers.ListField()
    recent_visits = RecentVisitSerializer(many=True)
    mr_tracking = MRTrackingSerializer(many=True)
    assigned_tasks = TaskSummarySerializer(many=True)
