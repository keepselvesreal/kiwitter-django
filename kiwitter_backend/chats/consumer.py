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
        # last_message_at 필드를 현재 시간으로 업데이트합니다.
        conversation.last_message_at = timezone.now()
        conversation.save()
        
        print("username : ", username)
        print("user : ", user)
        print("message: ", message)
        print("new_message : ", new_message)
        print("last_message_at : ", conversation.last_message_at)

        # 클라이언트에 전송할 메시지 포맷을 맞춤
        new_message_json = {
            "id": new_message.id,  # 메시지 ID 추가
            # "conversation": new_message.conversation,  # 대화방 ID 추가
            "sender": username,  # sender의 username 직접 할당
            "content": message,  # 메시지 내용
            "timestamp": new_message.timestamp.strftime("%Y-%m-%d %H:%M:%S")  # 시간 포맷 맞춤
        }

        # 새 메시지만 클라이언트에 전송합니다.
        async_to_sync(self.channel_layer.group_send)(
            self.conver_id,
            {
                'type': 'chat_message',
                'message': new_message_json
            }
        )
        
        
    def chat_message(self, event):
        print("chat_message 메소드 진입")
        print("event : ", event)
        self.send_json(event['message'])
        # 클라이언트가 메시지 객체를 예상하는 형식으로 받을 수 있도록 포장
        # self.send_json({'message': event['message']})


    def disconnect(self, close_code):
        print("WebSocket Connection Closed")
        async_to_sync(self.channel_layer.group_discard)(
            self.conver_id,
            self.channel_name
        )