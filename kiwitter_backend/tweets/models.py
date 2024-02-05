from django.db import models
from django.contrib.auth import get_user_model

# user=get_user_model() 후 이하 user 사용이 낫겠지?

class Tweets(models.Model):
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(get_user_model(), related_name='liked_tweets', blank=True)
    tags = models.ManyToManyField("tweets.Hashtag", verbose_name="hashtags list", blank=True)
    bookmarks = models.ManyToManyField(get_user_model(), related_name='bookmarked_tweets', blank=True)

    def __str__(self):
        return self.content
    

class Comments(models.Model):
    tweet = models.ForeignKey(Tweets, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', related_name='replies', null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return self.content
    
    
class HashTag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
