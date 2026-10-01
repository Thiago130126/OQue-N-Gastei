from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')


        if not access_token:
            return None

        validated_token = self.get_validated_token(access_token)

        user = self.get_user(validated_token)

        self.enforce_csrf(request)

        return user, validated_token

    def enforce_csrf(self, request):
        check = CSRFCheck(lambda request: None)
        check.process_request(request)

        reason = check.process_view(request, None, (), {})

        if reason:
            raise AuthenticationFailed('Falha ao validar csrf token: ', reason)



# não esquecer de configurar o cookie refresh apenas para rota de refresh