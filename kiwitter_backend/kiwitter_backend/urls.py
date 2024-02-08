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
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

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
    is_liked,
    toggle_bookmark,
    is_bookmarked,
    list_bookmarked_tweets,
    user_tweets,
    user_comments,
    user_liked_tweets,
    tweets_by_hashtag,
    # generate_prompt,
    # generate_image,
)
from users.views import follow, unfollow, get_user, CustomTokenObtainPairView
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
    path('api/tweets/<int:tweet_id>/is_liked/', is_liked, name="is-liked"),
    path('api/tweets/<int:tweet_id>/toggle_bookmark/', toggle_bookmark, name='toggle-bookmark'),
    path('api/tweets/<int:tweet_id>/is_bookmarked/', is_bookmarked, name="is-bookmarked"),
    path('api/bookmarks/', list_bookmarked_tweets, name='list_bookmarked_tweets'),
    path('api/user-tweets/', user_tweets, name='user-tweets'),
    path('api/user-comments/', user_comments, name='user-comments'),
    path('api/user-liked-tweets/', user_liked_tweets, name='user-liked-tweets'),
    path('api/hashtags/<str:hashtag_name>/tweets/', tweets_by_hashtag, name='tweets-by-hashtag'),
    # path('api/generate_prompt/', views.generate_prompt, name='generate_prompt'),
    # path('api/generate_image/', views.generate_image, name='generate_image'),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('users/', include('allauth.urls')),
]

websocket_urlpatterns = [
    path('<str:converId>', ChatConsumer.as_asgi()),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)