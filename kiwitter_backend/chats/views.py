from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation
from .models import Message, Conversation
from .serializers import MessageSerializer


User = get_user_model()

@api_view(['POST'])
def check_user_exists(request):
    username = request.data.get('username')
    if User.objects.filter(username=username).exists():
        return Response({'exists': True})
    return Response({'exists': False, 'error': '사용자가 존재하지 않습니다.'})


@api_view(['POST'])
def create_conversation(request):
    usernames = request.data.get('usernames', [])  
    users = User.objects.filter(username__in=usernames)
    print("usernames : ", usernames)
    print("users : ", users)
    if len(usernames) != users.count():
        missing_users = set(usernames) - set(users.values_list('username', flat=True))
        return JsonResponse({'error': f'Users not found: {", ".join(missing_users)}'}, status=400)

    conversation = Conversation.objects.create()
    conversation.participant.add(*users)  # 참가자를 대화방에 추가
    conversation.save()

    participants_data = [{'id': user.id, 'username': user.username} for user in users]

    return JsonResponse({
        'conversation_id': conversation.id,
        'participants': participants_data
    }, status=201)



@api_view(['GET'])
def get_conversations(request):
    user = request.user
    if user.is_authenticated:
        conversations = Conversation.objects.filter(participant=user).prefetch_related('participant')
        conversation_data = [{
            'conversation_id': conv.id,
            'participants': [
                {'id': participant.id, 'username': participant.username}
                for participant in conv.participant.all()
            ],
            'last_message': conv.message_set.last().content if conv.message_set.exists() else ''
        } for conv in conversations]
        return JsonResponse({'conversations': conversation_data}, status=200)
    return JsonResponse({'error': '인증되지 않은 사용자입니다.'}, status=403)


@api_view(['GET'])
def get_messages(request, conversation_id):
    print("get_messages 함수 진입")
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': '대화방이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)
    
    # 대화방에 속한 메시지를 모두 불러옵니다.
    messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    serializer = MessageSerializer(messages, many=True)
    print("conversation : ", conversation)
    print("messages : ", messages)
    return Response(serializer.data, status=status.HTTP_200_OK)
