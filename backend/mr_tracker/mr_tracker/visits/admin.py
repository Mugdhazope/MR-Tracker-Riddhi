from django.contrib import admin
from .models import Doctor, DoctorVisit, ShopVisit


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "specialization")
    search_fields = ("name", "specialization")
    ordering = ("name",)


@admin.register(DoctorVisit)
class DoctorVisitAdmin(admin.ModelAdmin):
    list_display = ("id", "mr", "doctor_name", "visit_date", "visit_time", "completed")
    list_filter = ("completed", "visit_date", "doctor_name")
    search_fields = ("mr__username", "doctor_name__name", "notes")
    readonly_fields = ("visit_date", "visit_time")
    ordering = ("-visit_date", "-visit_time")


@admin.register(ShopVisit)
class ShopVisitAdmin(admin.ModelAdmin):
    list_display = ("id", "mr", "shop_name", "visit_date", "visit_time", "completed")
    list_filter = ("completed", "visit_date")
    search_fields = ("mr__username", "shop_name", "location", "notes")
    readonly_fields = ("visit_date", "visit_time")
    ordering = ("-visit_date", "-visit_time")


# @admin.register(AssignedVisit)
# class AssignedVisitAdmin(admin.ModelAdmin):
#     list_display = ("id", "admin", "mr", "doctor", "assigned_date", "assigned_time", "completed")
#     list_filter = ("completed", "assigned_date", "doctor")
#     search_fields = ("admin__username", "mr__username", "doctor__name", "notes")
#     readonly_fields = ("assigned_date", "assigned_time", "completed_at")
#     ordering = ("-assigned_date", "-assigned_time")
