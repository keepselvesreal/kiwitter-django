# Generated by Django 4.2 on 2024-02-01 00:49

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("tweets", "0005_hashtag_tweets_likes_tweets_tags"),
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="like_tweets",
            field=models.ManyToManyField(
                blank=True,
                related_name="like_users",
                to="tweets.tweets",
                verbose_name="좋아요 누른 트윗 목록",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="profile_image",
            field=models.ImageField(blank=True, upload_to="users/profile"),
        ),
        migrations.AddField(
            model_name="user",
            name="short_description",
            field=models.TextField(blank=True),
        ),
        migrations.CreateModel(
            name="Relationship",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created", models.DateTimeField(auto_now_add=True)),
                (
                    "from_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="following_relationships",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="팔로우를 요청한 사용자",
                    ),
                ),
                (
                    "to_user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="follower_relationships",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="팔로우를 요청받은 사용자",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="user",
            name="following",
            field=models.ManyToManyField(
                related_name="followers",
                through="users.Relationship",
                to=settings.AUTH_USER_MODEL,
                verbose_name="팔로우 중인 사용자들",
            ),
        ),
    ]
