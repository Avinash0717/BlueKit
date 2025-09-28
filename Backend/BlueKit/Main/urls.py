from django.urls import path, re_path
import Main.views as views

urlpatterns = [
    path('remove-comments/', views.comment_remover,)
]