from rest_framework import generics
from rest_framework import viewsets
from .serializers import TweetSerializer, CommentSerializer, ReplySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import os
from dotenv import load_dotenv
import requests
from django.core.files.base import ContentFile
import httpx
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model

from .models import Tweets, Comments, HashTag, TweetImage

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


def extract_hashtags(content):
    hashtags = set(part[1:] for part in content.split() if part.startswith('#'))
    return [HashTag.objects.get_or_create(name=tag)[0] for tag in hashtags]


# 비동기 처리를 위한 별도의 함수
async def fetch_image_data(image_url):
    async with httpx.AsyncClient() as client:
        response = await client.get(image_url)
        if response.status_code == 200:
            return ContentFile(response.content, 'image.jpg')  # 임시 파일 이름 지정
    return None

class TweetViewSet(viewsets.ModelViewSet):
    queryset = Tweets.objects.all().order_by('-created_at')
    serializer_class = TweetSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        print("TweetViewSet perform_create 메소드 진입")
        tweet = serializer.save(author=self.request.user)
        print("tweet: ", tweet)
        # 생성된 이미지 URL 처리
        generated_image_urls = self.request.data.getlist('generatedImageUrls', [])
        print("generated_image_urls: ", generated_image_urls)
        for image_url in generated_image_urls:
            # 비동기 함수 호출을 위한 동기화 처리
            image_data = async_to_sync(fetch_image_data)(image_url)
            if image_data:
                TweetImage.objects.create(tweet=tweet, image=image_data)
        
        hashtags = extract_hashtags(tweet.content)
        tweet.tags.set(hashtags)
        
    @action(detail=True, methods=['get'], url_path='comments-count')
    def comments_count(self, request, pk=None):
        tweet = self.get_object()
        comments_count = tweet.comments.count()
        return Response({"tweet_id": tweet.id, "comments_count": comments_count})
    
    @action(detail=False, methods=['get'], url_path='my-vibe')
    def tweets_by_my_vibe(self, request):
        my_vibe_tag = get_object_or_404(HashTag, name='my_vibe')
        tweets = self.queryset.filter(tags=my_vibe_tag).order_by('-created_at')
        serializer = self.get_serializer(tweets, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comments.objects.filter(parent__isnull=True)  # 대댓글이 아닌 댓글만
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print("CommentViewSet get_queryset 메소드 진입")
        queryset = super().get_queryset()
        tweet_id = self.kwargs.get("tweet_id")
        if tweet_id:
            queryset = queryset.filter(tweet__id=tweet_id)
        return queryset
    
    def perform_create(self, serializer):
        print("CommentViewSet perform_create 메소드 진입")
        print("tweet_id: ", self.kwargs.get("tweet_id"))
        tweet_id = self.kwargs.get("tweet_id")
        tweet = Tweets.objects.get(id=tweet_id)
        print("author: ", self.request.user, "tweet: ", tweet)
        serializer.save(author=self.request.user, tweet=tweet)
        
        
class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Comments.objects.filter(parent__isnull=False)  # 대댓글만
    serializer_class = ReplySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print("ReplyViewSet get_queryset 메소드 진입")
        queryset = super().get_queryset()
        comment_id = self.kwargs.get("comment_id")
        if comment_id:
            queryset = queryset.filter(parent__id=comment_id)
        return queryset

    # 대댓글 생성 로직 (POST 메소드)
    def create(self, request, *args, **kwargs):
        print("ReplyViewSet create 메소드 진입")
        parent_comment_id = self.kwargs.get("comment_id")
        parent_comment = Comments.objects.get(id=parent_comment_id)
        reply_content = request.data.get('content')
        reply_comment = Comments.objects.create(
            tweet=parent_comment.tweet,
            content=reply_content,
            author=request.user,
            parent=parent_comment
        )
        serializer = self.get_serializer(reply_comment)
        return Response(serializer.data)
    
@api_view(['GET'])
def tags(request, tag_name):
    print("tags FBV 진입")
    try:
        tag = HashTag.objects.get(name=tag_name)
        tweets = Tweets.objects.filter(tags=tag)
    except HashTag.DoesNotExist:
        tweets = Tweets.objects.none()

    serializer = TweetSerializer(tweets, many=True)
    return Response(serializer.data)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def toggle_like(request, tweet_id):
    """특정 트윗의 좋아요를 추가하거나 삭제합니다."""
    tweet = get_object_or_404(Tweets, pk=tweet_id)
    is_liked = request.user in tweet.likes.all()
    if is_liked:
        tweet.likes.remove(request.user)
        is_liked = False
    else:
        tweet.likes.add(request.user)
        is_liked = True
    return Response({"status": "toggled", "is_liked": is_liked})

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def is_liked(request, tweet_id):
    """사용자가 특정 트윗에 좋아요를 눌렀는지 확인합니다."""
    tweet = get_object_or_404(Tweets, pk=tweet_id)
    is_liked = tweet.likes.filter(pk=request.user.pk).exists()
    return Response({"is_liked": is_liked})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_following(request, user_id):
    """현재 사용자가 특정 유저를 팔로우 중인지 확인합니다."""
    # 대상 사용자의 존재를 확인합니다.
    target_user = get_object_or_404(get_user_model(), pk=user_id)
    # 현재 사용자가 대상 사용자를 팔로우 중인지 확인합니다.
    is_following = request.user.following.filter(pk=user_id).exists()
    return Response({"is_following": is_following})

@api_view(['GET'])
def get_tweet_likes_count(request, tweet_id):
    try:
        tweet = Tweets.objects.get(id=tweet_id)
        likes_count = tweet.likes.count()  # 좋아요 수 얻기
        tweet_data = {
            'id': tweet.id,
            'author': tweet.author.username,
            'content': tweet.content,
            'likes_count': likes_count,  # 좋아요 수 추가
        }
        return JsonResponse(tweet_data, status=200)
    except Tweets.DoesNotExist:
        return JsonResponse({'error': 'Tweet not found'}, status=404)
    
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def toggle_bookmark(request, tweet_id):
    """특정 트윗의 북마크를 추가하거나 삭제합니다."""
    tweet = get_object_or_404(Tweets, pk=tweet_id)
    is_bookmarked = request.user.bookmarked_tweets.filter(pk=tweet_id).exists()
    if is_bookmarked:
        request.user.bookmarked_tweets.remove(tweet)
        is_bookmarked = False
    else:
        request.user.bookmarked_tweets.add(tweet)
        is_bookmarked = True
    return Response({"status": "toggled", "is_bookmarked": is_bookmarked})

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def is_bookmarked(request, tweet_id):
    """사용자가 특정 트윗을 북마크했는지 확인합니다."""
    tweet = get_object_or_404(Tweets, pk=tweet_id)
    is_bookmarked = request.user.bookmarked_tweets.filter(pk=tweet_id).exists()
    return Response({"is_bookmarked": is_bookmarked})

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def list_bookmarked_tweets(request):
    """사용자가 북마크한 트윗 목록을 반환합니다."""
    bookmarked_tweets = request.user.bookmarked_tweets.all()
    serializer = TweetSerializer(bookmarked_tweets, many=True)
    return Response(serializer.data)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def user_tweets(request):
    tweets = Tweets.objects.filter(author=request.user).order_by('-created_at')
    serializer = TweetSerializer(tweets, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def user_comments(request):
    comments = Comments.objects.filter(author=request.user).order_by('-created_at')
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def user_liked_tweets(request):
    liked_tweets = request.user.liked_tweets.all().order_by('-created_at')
    serializer = TweetSerializer(liked_tweets, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
def tweets_by_hashtag(request, hashtag_name):
    hashtag = HashTag.objects.filter(name=hashtag_name).first()
    if hashtag:
        tweets = hashtag.tweets_set.all().order_by('-created_at')
        serializer = TweetSerializer(tweets, many=True)
        return Response(serializer.data)
    else:
        return Response({'error': 'Hashtag not found'}, status=404)

# def generate_prompt(request):
#     print("generate_prompt FBV 진입")
#     if request.method == "POST":
#         mood = request.POST.get("mood")
#         genre = request.POST.get("genre")
#         prompt_text = f"{mood} 기분을 가장 잘 나타내면서 {genre} 장르에 속하는 독특하고 창의적인 이미지를 생성하기 위한 프롬프트를 작성해주세요."

#         api_endpoint = 'https://api.openai.com/v1/chat/completions'
#         headers = {
#             'Authorization': f'Bearer {OPENAI_API_KEY}',
#             'Content-Type': 'application/json'
#         }
#         data = {
#             'model': 'gpt-3.5-turbo',
#             'prompt': prompt_text,
#             'max_tokens': 500,
#             'temperature': 0.7,
#         }

#         response = requests.post(api_endpoint, json=data, headers=headers)
#         if response.status_code == 200:
#             generated_prompt = response.json()['choices'][0]['text'].strip()
#             return JsonResponse({'prompt': generated_prompt})
#         else:
#             return JsonResponse({'error': 'Failed to generate prompt'}, status=response.status_code)
#     else:
#         return JsonResponse({'error': 'Invalid request method'}, status=405)

# def generate_image(request):
#     print("generate_image FBV 진입")
#     if request.method == "POST":
#         prompt = request.POST.get("prompt")

#         api_endpoint = 'https://api.openai.com/v1/images/generations'
#         headers = {
#             'Authorization': f'Bearer {OPENAI_API_KEY}',
#             'Content-Type': 'application/json'
#         }
#         data = {
#             'prompt': prompt,
#             'n': 1,
#             'size': '512x512',
#         }

#         response = requests.post(api_endpoint, json=data, headers=headers)
#         if response.status_code == 200:
#             generated_image_url = response.json()['data'][0]['url']
#             return JsonResponse({'image_url': generated_image_url})
#         else:
#             return JsonResponse({'error': 'Failed to generate image'}, status=response.status_code)
#     else:
#         return JsonResponse({'error': 'Invalid request method'}, status=405)
    


# class CommentViewSet(viewsets.ModelViewSet):
#     queryset = Comments.objects.all()
#     serializer_class = CommentSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_queryset(self):
#         print("CommentViewSet get_queryset 메소드 진입")
#         queryset = super().get_queryset()
#         tweet_id = self.kwargs.get("tweet_id")
#         if tweet_id:
#             queryset = queryset.filter(tweet__id=tweet_id, parent__isnull=True)
#         return queryset
    
#     @action(detail=True, methods=['post', 'get'], url_path='replies')
#     def replies(self, request, pk=None, *args, **kwargs):
#         print("CommentViewSet replies 메소드 진입")
#         if request.method == 'POST':
#             reply_content = request.data.get('content')
#             parent_comment = self.get_object()
#             Comments.objects.create(tweet=parent_comment.tweet, content=reply_content, author=request.user, parent=parent_comment)
#         replies = self.get_queryset().filter(parent=pk)
#         serializer = self.get_serializer(replies, many=True)
#         return Response(serializer.data)
    
#     # @action(detail=True, methods=['post', 'get'])
#     # def replies(self, request, pk=None, *args, **kwargs):
#     #     print("CommentViewSet replies 메소드 진입")
#     #     comment = self.get_object()
#     #     print("comment: ", comment)
#     #     if request.method == 'POST':
#     #         reply_content = request.data.get('content')
#     #         Comments.objects.create(tweet=comment.tweet, content=reply_content, author=request.user, parent=comment)
#     #     replies = comment.replies.all()
#     #     serializer = self.get_serializer(replies, many=True)
#     #     return Response(serializer.data)
    
#     @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
#     def add_reply(self, request, pk=None):
#         print("CommentViewSet add_reply 메소드 진입")
#         # 대댓글을 추가하는 로직
#         parent_comment = self.get_object()
#         reply_content = request.data.get('content')
#         reply_comment = Comments.objects.create(
#             tweet=parent_comment.tweet,  # 부모 댓글에서 트윗을 가져옵니다.
#             author=request.user,
#             content=reply_content,
#             parent=parent_comment
#         )
#         serializer = self.get_serializer(reply_comment)
#         return Response(serializer.data)

#     def perform_create(self, serializer):
#         print("CommentViewSet perform_create 메소드 진입")
#         serializer.save(author=self.request.user)
        
    # def get_queryset(self):
    #     print("CommentViewSet get_queryset 메소드 진입")
    #     queryset = super().get_queryset()
    #     tweet_id = self.kwargs.get("tweet_id")
    #     comment_id = self.kwargs.get("comment_id")
    #     # tweet_id = self.kwargs.get("tweet_pk")  # NestedSimpleRouter를 사용하면 tweet_pk가 URL로부터 추출됩니다.
    #     # comment_id = self.kwargs.get("pk")
    #     print("comment_id: ", comment_id)

    #     if tweet_id:
    #         queryset = queryset.filter(tweet_id=tweet_id)

    #         # 특정 댓글에 대한 대댓글 조회
    #         if comment_id:
    #             queryset = queryset.filter(parent_id=comment_id)
    #         else:
    #             # 특정 트윗에 대한 댓글만 조회
    #             queryset = queryset.filter(parent__isnull=True)

    #     return queryset
        
    # @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    # def add_reply(self, request, pk=None, tweet_id=None):
    #     # 대댓글을 추가하는 로직
    #     parent_comment = self.get_object()
    #     reply_content = request.data.get('content')
    #     reply_comment = Comments.objects.create(
    #         tweet_id=tweet_id,
    #         author=request.user,
    #         content=reply_content,
    #         parent=parent_comment
    #     )
    #     serializer = self.get_serializer(reply_comment)
    #     return Response(serializer.data)
        
    # def retrieve(self, request, *args, **kwargs):
    #     print("CommentViewSet retrieve 메소드 진입")
    #     instance = self.get_object()
    #     print("instance: ", instance)
    #     serializer = self.get_serializer(instance)
    #     replies = instance.replies.all()  # 대댓글 조회
    #     replies_serializer = self.get_serializer(replies, many=True)
    #     return Response({
    #         'comment': serializer.data,
    #         'replies': replies_serializer.data
    #     })
    
    # def list(self, request, *args, **kwargs):
    #     print("CommentViewSet list 메소드 진입")
    #     # tweet_id를 사용하여 특정 트윗의 댓글과 대댓글을 모두 가져옴
    #     tweet_id = self.kwargs.get("tweet_id")
    #     queryset = self.filter_queryset(self.get_queryset()).filter(tweet_id=tweet_id)
        
    #     # 페이지네이션을 적용하고 싶은 경우 사용
    #     # page = self.paginate_queryset(queryset)
    #     # if page is not None:
    #     #     serializer = self.get_serializer(page, many=True)
    #     #     return self.get_paginated_response(serializer.data)
        
    #     # 페이지네이션을 적용하지 않고 모든 결과를 반환하고 싶은 경우 사용
    #     serializer = self.get_serializer(queryset, many=True)
    #     return Response(serializer.data)
    
    # @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    # def replies(self, request, pk=None):
    #     print("CommentViewSet replies 메소드 진입")
    #     # pk는 댓글의 ID, 대댓글 조회
    #     comment = self.get_object()
    #     replies = comment.replies.all()
    #     serializer = self.get_serializer(replies, many=True)
    #     return Response(serializer.data)