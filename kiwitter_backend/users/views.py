from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

from .models import Relationship
from .serializers import UserSerializer

User = get_user_model()

@api_view(['POST'])
def register(request):
    print("-"*70)
    print("register 진입")
    print("request -> ", request)
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'id': user.id, 'username': user.username, 'token': token.key})

@api_view(['POST'])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    print("user from authenticate -> ", user)
    if user is not None:
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'id': user.id,
            'username': user.username,
            'token': token.key
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)

@api_view(['GET', 'PATCH'])
def get_user(request, user_id):
    try:
        if request.method == 'PATCH':
            user = get_object_or_404(User, pk=user_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
    
        user = User.objects.get(pk=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
@api_view(['POST'])
def follow(request, user_id):
    if request.method == "POST":
        print("follow 진입")
        print("current_user -> ", request.user)
        current_user = request.user
        try:
            to_user = User.objects.get(pk=user_id)
             # 이미 팔로우 중인지 확인
            if Relationship.objects.filter(from_user=current_user, to_user=to_user).exists():
                return JsonResponse({"error": "Already following this user"}, status=400)

            Relationship.objects.create(from_user=current_user, to_user=to_user)
            return JsonResponse({"status": "success"}, status=201)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

@api_view(['POST'])
def unfollow(request, user_id):
    if request.method == "POST":
        current_user = request.user
        try:
            to_user = User.objects.get(pk=user_id)
            Relationship.objects.filter(from_user=current_user, to_user=to_user).delete()
            return JsonResponse({"status": "success"}, status=204)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)