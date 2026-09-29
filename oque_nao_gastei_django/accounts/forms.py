from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from django import forms

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        # aqui eu seleciono os campos para serem exibidos no formulário de criar usuários
        # o campo senha e confirmação de senha já são incluídos automaticamente
        fields = ('email', 'first_name', 'last_name', 'data_nascimento')
        
        widgets = {
            'data_nascimento': forms.DateInput(
                # O atributo type='date' força o navegador a mostrar o calendário
                attrs={'type': 'date'}
            )
        }