from django.urls import path
from users.api.views import MRLoginView, AdminLoginView, LogoutView


app_name = "users_api"

urlpatterns = [
    path("mr-login/", MRLoginView.as_view(), name="mr_login"),
    path("admin-login/", AdminLoginView.as_view(), name="admin_login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
