from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta


class ChatConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.participants = []

    def connect(self):
        self.accept()
        print("WebSocket Connection Established")
        self.conver_id = self.scope["url_route"]["kwargs"]["converId"]
        print("self.conver_id : ", self.conver_id)
        print("self.channel_name : ", self.channel_name)
        async_to_sync(self.channel_layer.group_add)(self.conver_id, self.channel_name)


    def receive_json(self, content, **kwargs):
        from users.models import User
        print("receive_json 메소드 진입")
        from .models import Conversation, Message
        username = content.get("username", "Anonymous")
        user = User.objects.get(username=username)
        message = content.get("message", "")
        conversation, created = Conversation.objects.get_or_create(id=self.conver_id)
        new_message = Message.objects.create(conversation=conversation,  sender=user, content=message)
        print("username : ", username)
        print("user : ", user)
        print("message: ", message)
        print("new_message : ", new_message)

        # 채팅방의 모든 메시지를 조회
        time_unit = content.get("time_unit", "week")
        time_period = int(content.get("time_period", 1))
        if time_unit == "week":
            time_delta = timedelta(weeks=time_period)
        elif time_unit == "day":
            time_delta = timedelta(days=time_period)
        elif time_unit == "minute":
            time_delta = timedelta(minutes=time_period)
        else:
            time_delta = timedelta(days=7)  # 기본값은 7일

        start_time = timezone.now() - time_delta
        messages = Message.objects.filter(
            conversation=conversation,
            timestamp__gte=start_time
        ).values(
            'sender__username',
            'content',
            'timestamp'
        )
        messages_list = [
            {"username": msg['sender__username'],
             "message": msg['content'],
             "created_at": msg["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
             }
            for msg in messages]

        async_to_sync(self.channel_layer.group_send)(
            self.conver_id,
            {
                'type': 'chat_message',
                'messages': messages_list
            }
        )
        
        
    def chat_message(self, event):
        print("chat_message 메소드 진입")
        print("event : ", event)
        self.send_json(event['messages'])


    def disconnect(self, close_code):
        print("WebSocket Connection Closed")
        async_to_sync(self.channel_layer.group_discard)(
            self.conver_id,
            self.channel_name
        )