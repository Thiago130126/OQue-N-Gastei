from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from .forms import UploadForm
from .processamento_pd import Processamento
import pandas as pd
from .models import Transacoes
from django.views.decorators.http import require_POST
from datetime import timedelta
from django.template.loader import render_to_string
import datetime
import weasyprint
from django.http import HttpResponse
from main.cache_manager import atualizar_cache, obter_extratos_usuario

from rest_framework.decorators import api_view, permission_classes, parser_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from accounts.authentication import CookieJWTAuthentication
from django.db import transaction
# Create your views here.

# Sugestão para um futuro, UploadExtratoView e upload_csv_api fazem a mesma operação que pode ser transferida para uma função desacoplada
# e provavelmente vai precisar de uma forma melhor para o código abrangir o modelo de csv de diferentes instituições
@login_required
def UploadExtratoView(request):
    if request.method == 'POST':
        upload_form = UploadForm(request.POST, request.FILES)
        if upload_form.is_valid():
            arquivo = upload_form.cleaned_data['arquivo_csv']
            df_arquivo = pd.read_csv(arquivo, sep=';', skiprows=4)
            frame = Processamento(df_arquivo)
            obj = frame.obter_dataframe()
            list_obj = [
                Transacoes(
                    data=linha.data,
                    descricao=linha.descricao,
                    valor=linha.valor,
                    user=request.user
                ) for linha in obj.itertuples()
                ]
            Transacoes.objects.bulk_create(list_obj)
            atualizar_cache(request.user)
            return redirect('/')
    else:
        upload_form = UploadForm()

    return render(
        request,
        'upload/upload_csv.html',
        {'form': upload_form}
    )

@login_required
@require_POST
def export_pdf(request):
    data_marcada = datetime.datetime.fromisoformat(request.session['data_marcada'])
    filtro_gastos, filtro_entradas = request.session['filter_gastos'], request.session['filter_entradas']

    extrato = Transacoes.objects.all().filter(user=request.user, data__gte=data_marcada).order_by('-data').values('data', 'descricao', 'valor')
    if not extrato.exists():
        extrato = Transacoes.objects.all().filter(user=request.user).order_by('-data').values('data', 'descricao', 'valor')
    extrato = pd.DataFrame(extrato)
    extrato = Processamento(extrato, limpo=True)

    extrato_ordenado = Processamento.ordenar_dataFrame(extrato, ordem='valor')

    top_transacoes = extrato_ordenado.head(5).to_dict('records')

    total_saidas = extrato.somar(pdf=True, filter=filtro_gastos)['valores']
    total_entradas = extrato.somar(tipo='entrada', pdf=True, filter=filtro_entradas)['valores']

    total_resultante = total_entradas - total_saidas

    pdf = {}

    pdf['data'] = datetime.datetime.now()
    pdf['filtro'] = f'gastos: {filtro_gastos} entradas: {filtro_entradas}'
    pdf['periodo'] = data_marcada

    grafico_gastos = request.session['imagem_gasto']
    grafico_entradas = request.session['imagem_entrada']

    html = render_to_string('pdf/pdf.html', {
        'top_transacoes': top_transacoes, 
        'total_saidas': total_saidas, 
        'total_entradas': total_entradas, 
        'total_resultante': total_resultante,
        'pdf': pdf,
        'grafico_gastos': grafico_gastos,
        'grafico_entradas': grafico_entradas
        })
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=extrato_graficos.pdf'
    weasyprint.HTML(string=html).write_pdf(response)
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
@parser_classes([MultiPartParser, FormParser])
def upload_csv_api(request):
    if 'arquivo_csv' not in request.FILES:
        return Response({'erro': 'Nenhum arquivo enviado'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df_arquivo = pd.read_csv(request.FILES['arquivo_csv'], sep=';', skiprows=4)
        frame = Processamento(df_arquivo)
        obj = frame.obter_dataframe()
        list_obj = [
            Transacoes(
                data=linha.data,
                descricao=linha.descricao,
                valor=linha.valor,
                user=request.user
            ) for linha in obj.itertuples()
        ]
        with transaction.atomic():
            Transacoes.objects.bulk_create(list_obj)
        atualizar_cache(request.user)

        return Response({
            'mensagem': f'{len(list_obj)} transações importadas com sucesso!'
        }, status=status.HTTP_201_CREATED)

    except Exception:
        return Response({'erro': 'Falha ao processar'}, status=status.HTTP_400_BAD_REQUEST)


def formartar_para_json(data_frame):
    if data_frame.empty:
        return []

    df = data_frame.reset_index()
    df.columns = ['periodo', 'valor']

    df['periodo'] = df['periodo'].astype(str)

    return df.to_dict('records')

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def gerar_graficos_api(request):
    if request.method == 'GET':

        extratos = obter_extratos_usuario(request.user)
        df_extrato = pd.DataFrame(extratos)
        try:
            df_extrato['data'] = pd.to_datetime(df_extrato['data'])
            df_extrato['valor'] = df_extrato['valor'].astype(float)

            frame_gastos = Processamento(df_extrato, limpo=True).somar()
            frame_entradas = Processamento(df_extrato, limpo=True).somar(tipo='entrada')

            dados_json = {
                'gastos': formartar_para_json(frame_gastos['valores']),
                'entradas': formartar_para_json(frame_entradas['valores'])
            }
        except Exception as e:
            dados_json = {
                'gastos': [],
                'entradas': []
            }
            print(f'Erro ao processar dados com o pandas: {e}')
    else:
        try:
            filtro = request.data.get('filter', None)
            moment = request.data.get('moment', 'mes')
            tipo = request.data.get('tipo', 'saida')
            periodo = int(request.data.get('periodo', 30))

            now = datetime.datetime.now()
            data_marcada = now - timedelta(days=periodo)

            extratos = obter_extratos_usuario(request.user)
            if not extratos:
                return Response({'resultados': []}, status=status.HTTP_200_OK)

            df_extrato = pd.DataFrame(extratos)
            df_extrato['data'] = pd.to_datetime(df_extrato['data'])
            df_extrato['valor'] = df_extrato['valor'].astype(float)

            df_extrato_filtrado = df_extrato[df_extrato['data'] >= data_marcada]

            if df_extrato_filtrado.empty:
                df_extrato_filtrado = df_extrato

            processador = Processamento(df_extrato_filtrado, limpo=True)
            resultado = processador.somar(tipo=tipo, filter=filtro, moment=moment)

            dados_json = {
                'resultado': formartar_para_json(resultado['valores']),
                'tipo': tipo,
                'filtro_aplicado': filtro
            }
        except Exception as e:
            return Response({'erro': f'Erro interno ao processar os dados: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(dados_json, status=status.HTTP_200_OK)