from django.contrib import admin
from mr_tracker.tasks.models import DoctorVisitTask


@admin.register(DoctorVisitTask)
class DoctorVisitTaskAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "assigned_to",
        "assigned_by",
        "assigned_doctor",
        "due_date",
        "due_time",
        "completed",
        "visit_record",
        "assigned_date",
    )

    list_filter = (
        "completed",
        "assigned_date",
        "due_date",
        "assigned_doctor",
    )

    search_fields = (
        "assigned_to__username",
        "assigned_by__username",
        "assigned_doctor__name",
        "notes",
    )

    readonly_fields = (
        "assigned_date",
        "visit_record",
        "completed",
    )

    ordering = ("-assigned_date", "-id")
