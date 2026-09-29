from django.shortcuts import render
from extratos.models import Transacoes
import pandas as pd
from extratos.processamento_pd import Processamento
import io
import matplotlib.pyplot as plt
import base64
from datetime import datetime, timedelta
from .cache_manager import obter_extratos_usuario

# Create your views here.

def home_page(request):
    if request.user.is_authenticated:
        return home_page_gerar_graficos(request)
    else:
        return  render(request, 'home/home_page.html')



def home_page_gerar_graficos(request):
    if request.method == 'POST':
        tipo = request.POST.get('tipo')
        kind = request.POST.get('kind')
        moment = request.POST.get('moment')
        filter = request.POST.get('filter')
        periodo = request.POST.get('periodo')
        xlabel = request.POST.get('xlabel')
        ylabel = request.POST.get('ylabel')
        is_color = request.POST.get('is_color')
        color = request.POST.get('color')

        caderninho_saida = request.session.get('config_saida', {'kind': 'bar', 'moment': 'mes', 'filter': None, 'xlabel': 'Período', 'ylabel': 'Valor em Reais', 'color': 'red'})
        caderninho_entrada = request.session.get('config_entrada', {'kind': 'bar', 'moment': 'mes', 'filter': None, 'xlabel': 'Período', 'ylabel': 'Valor em Reais', 'color': 'green'})

        try:
            periodo = int(periodo)
        except:
            periodo = 30

        now = datetime.now()
        data_marcada = now - timedelta(days=periodo)

        request.session['data_marcada'] = str(data_marcada)

        extrato = obter_extratos_usuario(request.user)

        df_extrato = pd.DataFrame(extrato)
        df_extrato['data'] = pd.to_datetime(df_extrato['data'])
        df_extrato['valor'] = df_extrato['valor'].astype(float)

        df_extrato_filtrado = df_extrato[df_extrato['data'] >= data_marcada]
        
        if df_extrato_filtrado.empty:
            df_extrato_filtrado = df_extrato

        if not xlabel:
            xlabel = 'Período'
        if not ylabel:
            ylabel = 'Valor em reais'

        if kind == 'pie':
            ylabel = None

        if not is_color:
            if tipo == 'entrada':
                color = 'green'
            elif tipo == 'saida':
                color = 'red'

        if not filter:
            filter = None

        grafico_gastos = Processamento(df_extrato_filtrado, limpo=True)
        grafico_entradas = Processamento(df_extrato_filtrado, limpo=True)
        
        if tipo == 'saida':
            figura_grafico_gastos = grafico_gastos.plotar(color=color, plot=False, title='Gastos', meses=True, kind=kind, moment=moment, filter=filter, xlabel=xlabel, ylabel=ylabel)
            caderninho_saida.update({'color': color, 'kind': kind, 'moment': moment, 'filter': filter, 'xlabel':xlabel, 'ylabel': ylabel})
            request.session['config_saida'] = caderninho_saida
            request.session['filter_gastos'] = filter
            figura_grafico_entradas = grafico_entradas.plotar(color=caderninho_entrada['color'], plot=False, title='Entradas', meses=True, kind=caderninho_entrada['kind'], moment=caderninho_entrada['moment'], filter=caderninho_entrada['filter'], xlabel=caderninho_entrada['xlabel'], ylabel=caderninho_entrada['ylabel'])

        elif tipo == 'entrada':
            figura_grafico_entradas = grafico_entradas.plotar(color=color, plot=False, title='Entradas', meses=True, kind=kind, moment=moment, filter=filter, xlabel=xlabel, ylabel=ylabel, tipo='entrada')
            caderninho_entrada.update({'color': color, 'kind': kind, 'moment': moment, 'filter': filter, 'xlabel':xlabel, 'ylabel': ylabel})
            request.session['config_entrada'] = caderninho_entrada
            request.session['filter_entradas'] = filter
            figura_grafico_gastos = grafico_gastos.plotar(color=caderninho_saida['color'], plot=False, title='Gastos', meses=True, kind=caderninho_saida['kind'], moment=caderninho_saida['moment'], filter=caderninho_saida['filter'], xlabel=caderninho_saida['xlabel'], ylabel=caderninho_saida['ylabel'])

        graficos = [figura_grafico_gastos, figura_grafico_entradas]
        image_b64_list = []

        for grafico in graficos:
            buffer = io.BytesIO()
            grafico.savefig(buffer, format='png')
            image_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            image_b64_list.append(image_b64)
            plt.close(grafico)
        
        image_b64_gasto, image_b64_entrada = image_b64_list

        request.session['imagem_gasto'] = image_b64_gasto
        request.session['imagem_entrada'] = image_b64_entrada

    else:
        now = datetime.now()
        data_marcada = now - timedelta(days=30)

        request.session['data_marcada'] = str(data_marcada)

        extrato = obter_extratos_usuario(request.user)

        df_extrato = pd.DataFrame(extrato)
        df_extrato['data'] = pd.to_datetime(df_extrato['data'])
        df_extrato['valor'] = df_extrato['valor'].astype(float)

        df_extrato_filtrado = df_extrato[df_extrato['data'] >= data_marcada]

        if df_extrato_filtrado.empty:
            df_extrato_filtrado = df_extrato

        grafico_gastos = Processamento(df_extrato_filtrado, limpo=True).plotar(color='red', plot=False, title='Gastos', meses=True, kind='bar')
        request.session['config_saida'] = {'kind': 'bar', 'moment': 'mes', 'filter': None, 'xlabel': 'Período', 'ylabel': 'Valor em Reais', 'color': 'red'}

        grafico_entradas = Processamento(df_extrato_filtrado, limpo=True).plotar(color='green', plot=False, tipo='entrada', title='Entradas', meses=True, kind='bar')
        request.session['config_entrada'] = {'kind': 'bar', 'moment': 'mes', 'filter': None, 'xlabel': 'Período', 'ylabel': 'Valor em Reais', 'color': 'green'}

        buffer_gasto = io.BytesIO()
        grafico_gastos.figure.savefig(buffer_gasto, format='png')
        image_b64_gasto = base64.b64encode(buffer_gasto.getvalue()).decode('utf-8')
        plt.close(grafico_gastos.figure)

        grafico_entradas = Processamento(df_extrato_filtrado, limpo=True).plotar(color='green', plot=False, tipo='entrada', title='Entradas', meses=True, kind='bar')

        buffer_entradas = io.BytesIO()
        grafico_entradas.figure.savefig(buffer_entradas, format='png')
        image_b64_entrada = base64.b64encode(buffer_entradas.getvalue()).decode('utf-8')
        plt.close(grafico_entradas.figure)

        request.session['imagem_gasto'] = image_b64_gasto
        request.session['imagem_entrada'] = image_b64_entrada

        request.session['filter_gastos'] = None
        request.session['filter_entradas'] = None

    return render(
        request,
        'home/home_page.html',
        {'grafico_gastos': image_b64_gasto, 'grafico_entradas': image_b64_entrada}
    )

