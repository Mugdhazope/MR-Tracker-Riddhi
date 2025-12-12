from django.urls import path
from .views import MRDashboardView, AdminDashboardView

urlpatterns = [
    path("mr/", MRDashboardView.as_view(), name="mr-dashboard"),
    path("admin/", AdminDashboardView.as_view(), name="admin-dashboard"),
]
