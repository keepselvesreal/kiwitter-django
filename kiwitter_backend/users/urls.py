from django.urls import path
from .views import (
    register, api_login, api_logout, 
    NaverLoginAPIView, NaverCallbackAPIView, NaverToDjangoLoginView,
    KakaoLogin,
)

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', api_login, name='api_login'),
    path('logout/', api_logout, name='api_logout'),
    path('naver/login/', NaverLoginAPIView.as_view(), name='naver_login'),
    path('naver/callback/', NaverCallbackAPIView.as_view(), name='naver_callback'),
    path('naver/login/success/', NaverToDjangoLoginView.as_view()),
    path('rest-auth/kakao/', KakaoLogin.as_view(), name='kakao_login'),
]
