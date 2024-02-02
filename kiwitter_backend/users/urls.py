from django.urls import path
from .views import register, api_login, api_logout

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', api_login, name='api_login'),
    path('logout/', api_logout, name='api_logout'),
]
