from django.conf import settings
from django.urls import include, path
from rest_framework.routers import DefaultRouter, SimpleRouter

from mr_tracker.users.api.views import UserViewSet

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

# router.register("users", UserViewSet, basename="users")

app_name = "api"

urlpatterns = [
    *router.urls,  

    path("auth/", include("mr_tracker.users.api.urls")),
]
