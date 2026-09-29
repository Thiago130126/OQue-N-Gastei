from django.urls import path, include
from . import views

app_name = 'accounts'

urlpatterns = [
    path('', include('django.contrib.auth.urls')),
    path('register/', views.RegisterUser.as_view(), name='register_user'),
    # api
    path('api/register/', views.RegistroView.as_view(), name='api_registro'),
    path('api/login/', views.LoginView.as_view(), name='api_login'),
    path('api/refresh/', views.RefreshView.as_view(), name='refresh_token_api'),
    path('api/perfil/', views.ProfileView.as_view(), name='perfil_api'),
    path('api/csrf/', views.CsrfTokenView.as_view(), name='csrf_token_api'),
    path('api/refresh/logout/', views.LogoutView.as_view(), name='logout_api'),
]
