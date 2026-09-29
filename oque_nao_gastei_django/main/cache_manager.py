from django.core.cache import cache
from extratos.models import Transacoes

def obter_extratos_usuario(user):
    cache_key = f'extratos_usuario_{user.id}'

    extrato_dados = cache.get(cache_key)

    if extrato_dados is not None:
        return extrato_dados

    transacoes_qs = Transacoes.objects.all().filter(user=user).order_by('-data').values('data', 'descricao', 'valor')
    extrato_dados = list(transacoes_qs)

    cache.set(cache_key, extrato_dados, timeout=86400) # 86400 segundos, são 24 horas

    return extrato_dados

def atualizar_cache(user):
    cache_key = f'extratos_usuario_{user.id}'

    cache.delete(cache_key)
    transacoes_qs = Transacoes.objects.all().filter(user=user).order_by('-data').values('data', 'descricao', 'valor')
    extrato_dados = list(transacoes_qs)
    
    cache.set(cache_key, extrato_dados, timeout=86400)
