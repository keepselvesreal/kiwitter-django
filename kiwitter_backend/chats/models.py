from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


class Conversation(models.Model):
    participant = models.ManyToManyField("users.User")
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Conversation : {self.id}, participant : {self.participant.all()}, created_at : {self.created_at}"


def get_anonymous_user():
    user = get_user_model()
    anonymous, created = user.objects.get_or_create(username='Anonymous')
    return anonymous


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    sender = models.ForeignKey(
        "users.User",
        on_delete=models.SET(get_anonymous_user),
        related_name = "messages",
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.sender} : {self.content}"
