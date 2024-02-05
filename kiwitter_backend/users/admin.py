from django.contrib import admin
from django.utils.html import mark_safe

from .models import User


class FollowersInline(admin.TabularInline):
    model = User.following.through
    fk_name = "from_user"
    verbose_name = "내가 팔로우 하고 있는 사용자"
    verbose_name_plural = f"{verbose_name} 목록"
    extra = 1


class FollowingInline(admin.TabularInline):
    model = User.following.through
    fk_name = "to_user"
    verbose_name = "나를 팔로우 하고 있는 사용자"
    verbose_name_plural = f"{verbose_name} 목록"
    extra = 1
    
class UserAdmin(admin.ModelAdmin):
    inlines = [FollowersInline, FollowingInline]
    

def profile_image_thumbnail(obj):
    if obj.profile_image:
        return mark_safe(f'<img src="{obj.profile_image.url}" width="150" height="150" />')
    return "-"

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'profile_image_display')  # 프로필 이미지를 보여줄 필드 추가
    readonly_fields = ('profile_image_display',)
    inlines = [
        FollowersInline,
        FollowingInline,
    ]

    def profile_image_display(self, obj):
        return profile_image_thumbnail(obj)
    profile_image_display.short_description = 'Profile Image'


admin.site.register(User, UserAdmin)