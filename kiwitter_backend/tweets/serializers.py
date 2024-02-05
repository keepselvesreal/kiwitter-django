from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Tweets, Comments

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  


class TweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Tweets
        fields = "__all__"
        

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tweet = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Comments
        fields = '__all__'
        

class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comments
        fields = ['id', 'tweet', 'author', 'content', 'created_at', 'parent']
        extra_kwargs = {
            'parent': {'required': True}  # parent 필드는 필수로 지정
        }

    def create(self, validated_data):
        # 대댓글 생성 로직
        user = self.context['request'].user
        parent_comment_id = validated_data.pop('parent', None)
        parent_comment = Comments.objects.get(id=parent_comment_id)
        return Comments.objects.create(author=user, parent=parent_comment, **validated_data)
