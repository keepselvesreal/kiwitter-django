from django.contrib import admin

from .models import Tweets, Comments

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

    
class TweetsAdmin(admin.ModelAdmin):
    inlines = [CommentInline,]
    
admin.site.register(Tweets, TweetsAdmin)
admin.site.register(Comments, CommentsAdmin)
