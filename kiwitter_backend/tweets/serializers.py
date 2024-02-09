from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Tweets, Comments, TweetImage

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  


class TweetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TweetImage
        fields = ['image']
        
        
class TweetSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    images = TweetImageSerializer(many=True, required=False)

    class Meta:
        model = Tweets
        fields = "__all__"
        extra_kwargs = {'images': {'required': False}}
        
    def create(self, validated_data):
        print("TweetSerializer create 메서드 진입")
        # many-to-many 필드를 처리하기 위해 pop을 사용하여 제거
        validated_data.pop('likes', None)
        validated_data.pop('tags', None)
        validated_data.pop('bookmarks', None)
        images = self.context['request'].FILES.getlist('images')
        print("validated_data: ", validated_data)
        tweet = Tweets.objects.create(**validated_data)
        print("tweet: ", tweet)
        for image_file in images:
            TweetImage.objects.create(tweet=tweet, image=image_file)
            
        return tweet

        

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
