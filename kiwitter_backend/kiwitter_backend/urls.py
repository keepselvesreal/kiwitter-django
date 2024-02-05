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

from tweets.views import (
    TweetViewSet, 
    CommentViewSet, 
    ReplyViewSet, tags, 
    # like_tweet, 
    # unlike_tweet, 
    get_tweet_likes_count, 
    # bookmark_tweet, 
    # remove_bookmark_tweet,
    toggle_like,
    toggle_bookmark,
    list_bookmarked_tweets,
)
from users.views import follow, unfollow, get_user
from chats.consumer import ChatConsumer
from chats.views import check_user_exists, create_conversation, get_conversations, get_messages


router = DefaultRouter()
router.register("tweets", TweetViewSet)
# router.register(r"tweets/(?P<tweet_id>\d+)/comments/", CommentViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
    path("", include(router.urls)),
    path('tweets/<int:tweet_id>/comments/', CommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='tweet-comments'),
    path('tweets/<int:tweet_id>/comments/<int:pk>/', CommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='tweet-comment-detail'),
    path('tweets/<int:tweet_id>/comments/<int:comment_id>/replies/', ReplyViewSet.as_view({'get': 'list', 'post': 'create'}), name='comment-replies'),
    path('tweets/<int:tweet_id>/comments/<int:comment_id>/replies/<int:pk>/', ReplyViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='reply-detail'),
    path("api/follow/<int:user_id>/", follow, name="follow"),
    path("api/unfollow/<int:user_id>/", unfollow, name="unfollow"),
    path('api/tags/<str:tag_name>/', tags, name='tags'),
    path('api/users/<int:user_id>/', get_user, name='get_user'),
    path('api/check-user-exists/', check_user_exists, name='check-user-exists'),
    path('api/create-conversation/', create_conversation, name='create-conversation'),
    path('api/conversations/', get_conversations, name='get-conversations'),
    path('api/conversations/<int:conversation_id>/messages/', get_messages, name='get-messages'),
    # path('api/tweets/<int:tweet_id>/like/', like_tweet, name='like_tweet'),
    # path('api/tweets/<int:tweet_id>/unlike/', unlike_tweet, name='unlike_tweet'),
    path('api/tweets/<int:tweet_id>/likes/count/', get_tweet_likes_count, name='get-tweet-likes-count'),
    # path('api/tweets/<int:tweet_id>/bookmark/', bookmark_tweet, name='bookmark-tweet'),
    # path('api/tweets/<int:tweet_id>/unbookmark/', remove_bookmark_tweet, name='unbookmark-tweet'),
    path('api/tweets/<int:tweet_id>/toggle_like/', toggle_like, name='toggle-like'),
    path('api/tweets/<int:tweet_id>/toggle_bookmark/', toggle_bookmark, name='toggle-bookmark'),
    path('api/bookmarks/', list_bookmarked_tweets, name='list_bookmarked_tweets'),
]

websocket_urlpatterns = [
    path('<str:converId>', ChatConsumer.as_asgi()),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)