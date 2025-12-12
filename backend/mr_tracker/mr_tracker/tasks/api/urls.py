from rest_framework.routers import DefaultRouter
from mr_tracker.tasks.api.views import DoctorVisitTaskViewSet

router = DefaultRouter()
router.register("doctor-tasks", DoctorVisitTaskViewSet, basename="doctor-tasks")

urlpatterns = router.urls
