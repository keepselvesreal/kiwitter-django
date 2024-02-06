from django.contrib import admin
from django.contrib.admin.widgets import AdminFileWidget
from django.utils.safestring import mark_safe
from django.db import models

from .models import Tweets, Comments, TweetImage

class ReplyInline(admin.TabularInline):
    model = Comments
    fk_name = 'parent'  # 부모 댓글을 가리키는 외래 키 필드
    extra = 1 
    

class CommentsAdmin(admin.ModelAdmin):
    list_display = ('content', 'author', 'created_at', 'tweet')
    inlines = [ReplyInline,]  # 대댓글을 인라인으로 표시
    

class CommentInline(admin.TabularInline):
    model = Comments
    extra = 0 
    
# class ReplyInline(admin.StackedInline):
#     model = Comments
#     fk_name = 'parent'  # 부모 댓글을 가리키는 외래 키 필드
#     extra = 1  # 기본적으로 추가로 보여줄 빈 인라인 폼의 수

class InlineImageWidget(AdminFileWidget):
    def render(self, name, value, attrs=None, renderer=None):
        html = super().render(name, value, attrs, renderer)
        if value and getattr(value, "url", None):
            html = mark_safe(f"<img src='{value.url}' height='150'>") + html
        return html
    
class TweetImageInline(admin.TabularInline):
    model = TweetImage
    extra = 1  # 기본적으로 표시할 빈 인라인 폼의 수
    
    
class TweetsAdmin(admin.ModelAdmin):
    inlines = [
        TweetImageInline,
        CommentInline,
        ]
    
    # # 이미지 필드를 위젯으로 설정
    # formfield_overrides = {
    #     models.ImageField: {'widget': InlineImageWidget},
    # }
    
admin.site.register(Tweets, TweetsAdmin)
admin.site.register(Comments, CommentsAdmin)
