"""
ASGI config for kiwitter_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter  # ts
from channels.auth import AuthMiddlewareStack



os.environ.setdefault("DJANGO_SETTINGS_MODULE", "kiwitter_backend.settings")

application = get_asgi_application()

from .urls import websocket_urlpatterns  # ts

# from django.urls import path  # ts
# from chats.consumer import ChatConsumer  # ts
# websocket_urlpatterns = [
#     path('<str:converId>', ChatConsumer.as_asgi()),  # `ws/` 접두어 추가
# ]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})