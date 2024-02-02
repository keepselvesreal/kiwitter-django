"""
URL configuration for kiwitter_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from tweets.views import TweetViewSet, CommentViewSet, ReplyViewSet, tags
from users.views import follow, unfollow, get_user

router = DefaultRouter()
router.register("tweets", TweetViewSet)
# router.register(r"tweets/(?P<tweet_id>\d+)/comments/", CommentViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
    path("", include(router.urls)),
    path('tweets/<int:tweet_id>/comments/', CommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='tweet-comments'),
    path('tweets/<int:tweet_id>/comments/<int:comment_id>/replies/', ReplyViewSet.as_view({'get': 'list', 'post': 'create'}), name='comment-replies'),
    path("api/follow/<int:user_id>/", follow, name="follow"),
    path("api/unfollow/<int:user_id>/", unfollow, name="unfollow"),
    path('api/tags/<str:tag_name>/', tags, name='tags'),
    path('api/users/<int:user_id>/', get_user, name='get_user'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)