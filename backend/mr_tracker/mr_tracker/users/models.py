from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.db import models



class User(AbstractUser):
    ROLE_CHOICES =[
        ("admin", "Admin"),
        ("MR", "Medical Representative")]


    name = CharField(_("Name of User"), blank=True, max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="MR")
    first_name = None  # type: ignore[assignment]
    last_name = None  # type: ignore[assignment]

    def get_absolute_url(self) -> str:

        return reverse("users:detail", kwargs={"username": self.username})
