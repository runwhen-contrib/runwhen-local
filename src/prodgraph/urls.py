from django.urls import path

from . import views

urlpatterns = [
    path('info/', views.InfoView.as_view()),
    path('run/', views.RunView.as_view()),
]
