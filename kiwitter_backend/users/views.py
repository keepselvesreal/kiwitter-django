from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.shortcuts import redirect
import requests
from allauth.socialaccount.providers.naver import views as naver_views
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.kakao.views import KakaoOAuth2Adapter
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from json import JSONDecodeError
import random

from .models import Relationship
from .serializers import UserSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

main_domain = settings.MAIN_DOMAIN

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


# 이하 아래 두 클래스 출처: https://axce.tistory.com/131
# DRF의 APIView를 상속받아 View를 구성
class NaverLoginAPIView(APIView):
    # 로그인을 위한 창은 누구든 접속이 가능해야 하기 때문에 permission을 AllowAny로 설정
    permission_classes = (AllowAny,)
    
    def get(self, request, *args, **kwargs):
        client_id = settings.NAVER_CLIENT_ID
        response_type = "code"
        # Naver에서 설정했던 callback url을 입력해주어야 한다.
        # 아래의 전체 값은 http://127.0.0.1:8000/user/naver/callback 이 된다.
        uri = main_domain + "/users/naver/callback/"
        state = settings.STATE
        # Naver Document 에서 확인했던 요청 url
        url = "https://nid.naver.com/oauth2.0/authorize"
        
        # Document에 나와있는 요소들을 담아서 요청한다.
        return redirect(
            f'{url}?response_type={response_type}&client_id={client_id}&redirect_uri={uri}&state={state}'
        )


class NaverCallbackAPIView(APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request, *args, **kwargs):
        try:
            # Naver Login Parameters
            grant_type = 'authorization_code'
            client_id = settings.NAVER_CLIENT_ID
            client_secret = settings.NAVER_CLIENT_SECRET
            code = request.GET.get('code')
            state = request.GET.get('state')

            parameters = f"grant_type={grant_type}&client_id={client_id}&client_secret={client_secret}&code={code}&state={state}"

            # token request
            token_request = requests.get(
                f"https://nid.naver.com/oauth2.0/token?{parameters}"
            )

            token_response_json = token_request.json()
            error = token_response_json.get("error", None)

            if error is not None:
                raise JSONDecodeError(error)

            access_token = token_response_json.get("access_token")

            # User info get request
            user_info_request = requests.get(
                "https://openapi.naver.com/v1/nid/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            # User 정보를 가지고 오는 요청이 잘못된 경우
            if user_info_request.status_code != 200:
                return JsonResponse({"error": "failed to get email."}, status=status.HTTP_400_BAD_REQUEST)

            user_info = user_info_request.json().get("response")
            email = user_info["email"]

            # User 의 email 을 받아오지 못한 경우
            if email is None:
                return JsonResponse({
                    "error": "Can't Get Email Information from Naver"
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
                data = {'access_token': access_token, 'code': code}
                # accept 에는 token 값이 json 형태로 들어온다({"key"}:"token value")
                # 여기서 오는 key 값은 authtoken_token에 저장된다.
                accept = requests.post(
                    f"{main_domain}/users/naver/login/success/", data=data
                )
                # 만약 token 요청이 제대로 이루어지지 않으면 오류처리
                if accept.status_code != 200:
                    return JsonResponse({"error": "Failed to Signin."}, status=accept.status_code)
                return Response(accept.json(), status=status.HTTP_200_OK)

            except User.DoesNotExist:
                print("User.DoesNotExist 진입")
                data = {'access_token': access_token, 'code': code}
                print("data", data)
                print(f"{main_domain}/users/naver/login/success/")
                accept = requests.post(
                    f"{main_domain}/users/naver/login/success/", data=data
                )
                # token 발급
                return Response(accept.json(), status=status.HTTP_200_OK)
                
        except:
            return JsonResponse({
                "error": "error",
            }, status=status.HTTP_404_NOT_FOUND)
            
   
class NaverToDjangoLoginView(SocialLoginView):
    adapter_class = naver_views.NaverOAuth2Adapter
    client_class = OAuth2Client
    

KAKAO_CALLBACK_URI = 'http://localhost:8000/users/kakao/callback/'
class KakaoLogin(SocialLoginView):
    adapter_class = KakaoOAuth2Adapter
    callbakc_url = KAKAO_CALLBACK_URI
    client_class = OAuth2Client
    serializer_class = SocialLoginSerializer
            

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
    
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    
# jwt login시 user detail 정보 조회 목적 사용하려 했으나 get_user 함수로 대체
class UserViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user_id = request.query_params.get("user_id")
        queryset = User.objects.get(id=user_id)
        serializer = UserSerializer(queryset)
        return Response(serializer.data)
    
    
@api_view(['POST'])
def follow(request, user_id):
    if request.method == "POST":
        print("follow 진입")
        print("current_user -> ", request.user)
        current_user = request.user
        try:
            to_user = User.objects.get(pk=user_id)
            print("to_user -> ", to_user)
             # 이미 팔로우 중인지 확인
            if Relationship.objects.filter(from_user=current_user, to_user=to_user).exists():
                return JsonResponse({"error": "Already following this user"}, status=200) # 상태 코드 200으로 변경. 클라이언트가 이를 명확히 인지할 수 있도록
            print("pass")
            Relationship.objects.create(from_user=current_user, to_user=to_user)
            return JsonResponse({"status": "success"}, status=201)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

@api_view(['POST'])
def unfollow(request, user_id):
    print("unfollow 진입")
    if request.method == "POST":
        current_user = request.user
        try:
            to_user = User.objects.get(pk=user_id)
            Relationship.objects.filter(from_user=current_user, to_user=to_user).delete()
            return JsonResponse({"status": "success"}, status=204)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        
@api_view(['GET'])
def recommend_random_users(request):
    # 모든 유저 중에서 랜덤하게 7명 선택
    users_count = User.objects.count()

    # 만약 사용자 수가 7보다 작다면 모든 사용자를 추천
    if users_count <= 7:
        random_users = User.objects.all()
    else:
        # 중복되지 않는 랜덤한 7개의 인덱스 생성
        random_indexes = random.sample(range(users_count), 7)
        # 생성된 인덱스를 사용하여 사용자 선택
        random_users = User.objects.filter(pk__in=random_indexes)

    # User 모델을 위한 Serializer를 사용하여 JSON으로 변환
    serializer = UserSerializer(random_users, many=True)
    return Response(serializer.data)