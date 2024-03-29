"""echo URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
from users.views import CustomLoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='home'),
    path('follows/', views.follows_feed),
    path('ajax/', views.ajax_response),
    path('search/', views.search_response),
    path('accounts/login/', CustomLoginView.as_view()),
    path('accounts/', include('django.contrib.auth.urls')),
    path('users/', include('users.urls')),
    path('posts/', include('posts.urls')),
    path('chat/', include('chat.urls')),
    path('alerts/', include('notifications.urls')),
    path('browse/', include('news.urls')),
    path('settings/', views.settings_view),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)