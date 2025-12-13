from django.urls import path
from .views import (
    MRDashboardView,
    AdminDashboardView,
    AdminMRDetailView,
    AdminAnalyticsView,
)

urlpatterns = [
    path("mr/", MRDashboardView.as_view(), name="mr-dashboard"),
    path("admin/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/mr/<int:mr_id>/", AdminMRDetailView.as_view(), name="admin-mr-detail"),
    path("admin/analytics/", AdminAnalyticsView.as_view(), name="admin-analytics"),
]
