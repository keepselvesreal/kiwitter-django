from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User

class UserSerializer(serializers.ModelSerializer):
    following_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image', 'short_description', 'following_ids']

    # todo: get_following_names로 이름 바꿔야할 듯
    def get_following_ids(self, obj):
        return obj.following.values_list('username', flat=True)
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)
        token["insertion example"] = "까꿍"

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user_id"] = self.user.id
        return data