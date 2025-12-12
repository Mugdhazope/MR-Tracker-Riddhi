from rest_framework.routers import DefaultRouter
from .views import DoctorViewSet, DoctorVisitViewSet, ShopVisitViewSet

router = DefaultRouter()
router.register(r"doctors", DoctorViewSet, basename="doctors")
router.register(r"doctor-visits", DoctorVisitViewSet, basename="doctor-visits")
router.register(r"shop-visits", ShopVisitViewSet, basename="shop-visits")
# router.register(r"assigned-visits", AssignedVisitViewSet, basename="assigned-visits")

urlpatterns = router.urls
