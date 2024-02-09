# Generated by Django 4.2 on 2024-02-09 13:51

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("chats", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="conversation",
            name="last_message_at",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
