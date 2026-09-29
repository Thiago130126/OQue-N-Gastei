from django.views.generic import CreateView
from .forms import CustomUserCreationForm
from django.urls import reverse_lazy
from django.contrib.auth import login
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegistroSerializer, ProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from django.middleware.csrf import get_token
from .authentication import CookieJWTAuthentication
from decouple import config
from .models import CustomUser
from django.shortcuts import get_object_or_404

# Create your views here.

refresh_path = '/accounts/api/refresh/'

class RegisterUser(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'account/register.html'

    success_url = reverse_lazy('main:home')

    def form_valid(self, form):
        response = super().form_valid(form)

        usuario_criado = self.object

        login(self.request, usuario_criado)

        return response

def gerar_tokens(user, response):

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True, # Uma proteção importante para impedir acesso via javascript pelo frontend
        secure=config('COOKIE_SECURE', default=False, cast=bool), # mudar para True em produção (HTTPS)
        samesite='Lax',
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        httponly=True,
        secure=config('COOKIE_SECURE', default=False, cast=bool), # Trocar para true em produção (HTTPS)
        samesite='Lax',
        path=refresh_path,
    )

    return response

class RegistroView(CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        response = Response(
            {
                'message': 'Conta criada e login realizado com sucesso',
                'first_name': user.first_name,
            },
            status=status.HTTP_201_CREATED,
        )
        gerar_tokens(user, response)

        return response

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        senha = request.data.get('senha')

        user = authenticate(request, username=email, password=senha)

        if user is not None:
            response = Response({'message': 'Login realizado com sucesso', 'first_name': user.first_name})

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True, # Uma proteção importante para impedir acesso via javascript pelo frontend
                secure=config('COOKIE_SECURE', default=False, cast=bool), # mudar para True em produção (HTTPS)
                samesite='Lax',
            )

            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=config('COOKIE_SECURE', default=False, cast=bool), # Trocar para true em produção (HTTPS)
                samesite='Lax',
                path=refresh_path,
            )

            return response

        return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

class RefreshView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token is None:
            return Response({'erro': 'Ausência de token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            user_id = token['user_id']
            user = get_object_or_404(CustomUser, pk=user_id)
            new_refresh_token = RefreshToken.for_user(user)
            new_access_token = str(new_refresh_token.access_token)
            token.blacklist()

            response = Response({'message': 'Access token, renovado com sucesso.'})

            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                secure=config('COOKIE_SECURE', default=False, cast=bool), # Trocar para True
                samesite='Lax'
            )

            response.set_cookie(
                key='refresh_token',
                value=str(new_refresh_token),
                httponly=True,
                secure=config('COOKIE_SECURE', default=False, cast=bool),
                samesite='Lax',
                path=refresh_path,
            )

            return response

        except TokenError:
            return Response({'erro': 'Token inválido'}, status=status.HTTP_401_UNAUTHORIZED)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        profile = ProfileSerializer(user)

        return Response(profile.data)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

class CsrfTokenView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return Response({
            'csrf_token': csrf_token
        })

class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token is None:
            return Response({'erro': 'Ausência de token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({'erro': 'Token inválido'}, status=status.HTTP_401_UNAUTHORIZED)
        
        response = Response({'message': 'Logout realizado com sucesso'})

        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token', path=refresh_path)

        return response
