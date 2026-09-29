from django.db import models
from django.conf import settings

# Create your models here.

class Transacoes(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    data = models.DateField(verbose_name='Data da Transação')
    descricao = models.CharField(verbose_name='Descrição', max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Valor da transação')

    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.data} - {self.descricao} - R${self.valor}'