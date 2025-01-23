from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('user-dashboard', views.render_dashboard, name='user-dashboard'),
    path('api/images/', views.send_images, name='send-images'),
]