from rest_framework import serializers

from .models import User

class UserSerializer(serializers.ModelSerializer):
    following_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image', 'short_description', 'following_ids']

    # todo: get_following_names로 이름 바꿔야할 듯
    def get_following_ids(self, obj):
        return obj.following.values_list('username', flat=True)