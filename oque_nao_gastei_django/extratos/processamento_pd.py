import pandas as pd
import re
import matplotlib.pyplot as plt

class Processamento:
    moments = ['dias_uteis', 'dias', 'semana', 'mes', 'bimestre', 'trimestre', 'semestre', 'ano']
    moments_not_meses = ['dias_uteis', 'dias', 'semana', 'ano']
    tipos = ['saida', 'entrada']
    meses = {
        1: 'Janeiro',
        2: 'Fevereiro',
        3: 'Março',
        4: 'Abril',
        5: 'Maio',
        6: 'Junho',
        7: 'Julho',
        8: 'Agosto',
        9: 'Setembro',
        10: 'Outubro',
        11: 'Novembro',
        12: 'Dezembro'
    }

    codigos = {
        'dias_uteis': 'B',
        'dias': 'D',
        'semana': 'W',
        'mes': 'M',
        'bimestre': '2M',
        'trimestre': 'Q',
        'semestre': '6M',
        'ano': 'Y'
    }

    kinds = ['bar', 'pie', 'barh', 'hist', 'line']

    ordenacoes = ['data', 'valor', '-data', '-valor']

    def __init__(self, frame=None, help=False, limpo=False):
        self.frame = frame
        self.help = help
        self.limpo = limpo
        self.response = {}

        if self.frame is None:
            self.help = True
        
        if self.help:
            frame_help = 'frame é o DataFrame a ser passado para ser processado. Espera-se que ele tenha os campos valor, descricao, data'
            not_frame_help = 'Se um DataFrame não for passado, a classe irá retornar a mensagem de ajuda, com informações a respeito da prórpia classe'
            filter_help = 'filter precisa ser um termo a ser pesquisado no campo Descricao do extrato através de expressão regular'
            raise ValueError(
                f'Valores disponíveis para moments: {Processamento.moments}\nValores disponíveis para tipos: {Processamento.tipos}\n{filter_help}\n{frame_help}\n{not_frame_help}'
            )
    
    def validar(self, moment=None, filter=None, tipo=None, ordem=None):
        if moment is not None:
            if moment.lower() not in Processamento.moments:
                raise ValueError(f'Parâmetro inválido para moment, lista de opções disponíveis: {Processamento.moments}')
        if tipo is not None:
            if tipo.lower() not in Processamento.tipos:
                raise ValueError(f'Parâmetro inválido para tipo, lista de opções disponíveis: {Processamento.tipos}')
        if filter is not None:
            try:
                re.compile(filter)
            except re.error:
                raise ValueError('Expressão regular inválida')
        
        if ordem is not None:
            if ordem.lower() not in Processamento.ordenacoes:
                raise ValueError(f'Parâmetro inválido para ordem, lista de opções disponíveis: {Processamento.ordenacoes}')
        
        if not self.limpo:
            self.limpar_dados()

    def limpar_dados(self):
        try:
            datas = pd.to_datetime(self.frame['Data Lançamento'], dayfirst=True)
            descricao = self.frame['Descrição']
            valores = self.frame['Valor'].str.replace(',', '.').astype(float)

            extrato = {
                'data': datas,
                'descricao': descricao,
                'valor': valores 
            }

            self.frame = pd.DataFrame(extrato)
            self.limpo = True
        except Exception as e:
            print(e)
            raise
    
    def obter_dataframe(self):
        if self.limpo:
            return self.frame
        else:
            self.limpar_dados()
            return self.frame
    
    def filtrar(self, valores, filter):
        linhas = valores['descricao'].str.contains(filter, case=False)
        valores_filtrados = valores.loc[linhas]

        return valores_filtrados
        
        
    def somar(self, moment='mes', filter=None, tipo='saida', pdf=False):
        try:
            self.validar(moment=moment, filter=filter, tipo=tipo)
            
            if tipo == Processamento.tipos[0]:
                valores = self.frame.loc[self.frame['valor'] < 0] # será gastos
            else:
                valores = self.frame.loc[self.frame['valor'] > 0] # será entradas
            
            if filter is not None:
                valores = self.filtrar(valores, filter)

                self.response['filtro'] = filter

            momento = Processamento.codigos[moment]
            if pdf:
                valores_organizados = valores['valor'].sum()
            else:
                valores_organizados = valores['valor'].groupby(valores['data'].dt.to_period(freq=momento)).sum()

            if tipo == Processamento.tipos[0]:
                valores_organizados = valores_organizados * -1

            self.response['valores'] = valores_organizados
            self.response['tipo'] = tipo

            return self.response
        except Exception as e:
            print(e)
            raise

    def plotar(self, kind='bar', color='blue', title=None, xlabel='Período', ylabel='Valor em Reais', rot=False, meses=False, plot=True, moment='mes', filter=None, tipo='saida'):
        try:
            fig, ax = plt.subplots()
            try:
                res = self.response['valores']
            except KeyError:
                res = self.somar(moment, filter, tipo)['valores']
            
            if res.empty:
                return fig

            if kind not in Processamento.kinds:
                raise ValueError(f'Opções disponíveis para kind: {Processamento.kinds}')
            
            if moment in Processamento.moments_not_meses:
                meses = False
            
            if kind == 'hist':
                xlabel = 'Valor em Reais'
                ylabel = 'Frequência'

            if kind == 'pie':
                xlabel = None
                ylabel = None

            if meses:
                dados_grafico = res.copy()
                dados_grafico.index = [
                    f'{Processamento.meses[periodo.month]} de {periodo.year}'
                    for periodo in dados_grafico.index
                ]

                imagem = dados_grafico.plot(
                    kind=kind, color=color, title=title, xlabel=xlabel, ylabel=ylabel, rot=rot, ax=ax
                )
            elif moment in Processamento.moments[:2]:
                dados_grafico = res.copy()
                dados_grafico.index = [
                    f'{periodo.day}/{periodo.month}/{periodo.year}'
                    for periodo in dados_grafico.index
                ]

                imagem = dados_grafico.plot(
                    kind=kind, color=color, title=title, xlabel=xlabel, ylabel=ylabel, rot=rot, ax=ax
                )

            else:
                imagem = res.plot(kind=kind, color=color, title=title, xlabel=xlabel, ylabel=ylabel, rot=rot, ax=ax)
            
            if plot:
                plt.show()
            else:
                return fig

        except Exception as e:
            print(e)
            raise

    def ordenar_dataFrame(self, ordem='data', tipo='saida', filter=None):
        try:
            self.validar(ordem=ordem, tipo=tipo, filter=filter)

            if tipo == Processamento.tipos[0]:
                valores = self.frame.loc[self.frame['valor'] < 0] # será gastos
            else:
                valores = self.frame.loc[self.frame['valor'] > 0] # será entradas

            if filter is not None:
                valores = self.filtrar(valores, filter)

            if ordem in Processamento.ordenacoes[:2]:
                frame_ordenado = valores.sort_values(by=[ordem])
            else:
                frame_ordenado = valores.sort_values(by=[ordem[1:]], ascending=False)
            
            return frame_ordenado

        except Exception as e:
            print(e)
            raise

    
    def documentacao(self):
        sobre = '''
        Essa classe (Processamento) tem como objetivo tornar eficiente e dinâmico o processo de receber um extrato csv e recuperar informações organizadas por períodos de tempo,
        filtragem etc. Essa classe foi planejada para lidar com o extrato bancário de conta corrente do banco inter, até este ponto, eu nunca vi extrato bancário csv
        de outro banco, se receber um com parões diferentes do Inter, como colunas que não se chamam Data Lançamento, ou Valores, ou Descrição já vai quebrar com tudo.
        '''
        init = """
            Init: O método init gera os objetos definido seus atributos ou com os valores passados pelo desenvolvedor ou usando os valores padrões mesmo e em seguida
            verificando se a variável help foi passada como true para printar um texto com algumas informações sobre a classe, e verifica se foi passado algum
            DataFrame se não foi, help é dado como true e então o código cai no que eu mencionei anteriormente.
        """
        validar = """
            validar: O método validar apenas verifica se o valor passado para os atributos moment e tipo estão entre as opções disponíveis, se não estiverem retorna erro. 
            Em seguida, verifica se os dados já foram limpos, se não tiverem sido, limpa eles chamando o método limpar_dados.
        """
        limparDados = """
            limpar dados: O método limpar_dados separa as colunas do DataFrame em 3 Series, com cada uma sendo uma coluna, a coluna com as datas, a coluna com a descrição
            e a coluna com os valores. Para as datas, é usado o método pd.to_datetime para converter os valores para tipo date. E usando o 
            método .str.replace(',', '.').astype(float) os valores que antes estavam em 10,00 passa a ser 10.00 e depois vai de string para float. Após isso, um dicionário
            é montado com essas Series e passado para o método construtor pd.DataFrame() e assim nasce o DataFrame manipulado pela classe Processamento e depois marca
            a flag 'limpo' como true indicando que não é mais necessário realizar a limpeza dos dados.
        """
        somar = """
            somar: O método somar primeiro chama o método validar() para garantir que os dados estão adequados para serem manipulados, então verifica-se qual tipo foi passado,
            se o usuário quer os valores que entraram ou se quer os que saíram e os seleciona, depois disso, o atributo moment é convertido para um código pandas para o
            atributo freq, então é usado o groupby() + to_period + sum() para somar os valores na coluna de valores, agrupando por um período que é passado através de
            momento.
        """
        document = """
            documentacao: O método documentacao, exibe informações a respeito da classe Processamento visando ajudar o usuário a entender melhor como ela funciona, e também
            a garantir que o criador, no caso este que vos fala, possa relembrar como ela funciona quando eu esquecer.
        """
        str_text = """
            str: O método str exibe os atributos do objeto com uma legenda.
        """
        atributos_classe = """
            Esses atributos são valores globais criados para que qualquer método da classe possa usa-los, estes são: moments, tipos, meses e codigos.
            moments e tipos são listas e servem para deixar 'salvo' quais são os parâmetros possíveis para esses atributos o que facilita para mexer nas validações 
            e nas mensagens de ajuda. Meses é um dicionário para converter o número do mês em seu nome. Codigos, é um dicionário para converter nomes amigáveis como 
            bimestre, semestre, dias_uteis para códigos do pandas. Kinds e moments_not_meses serve para auxiliar o método plotar para verficar respostas válidas.
        """
        filtro = """
            Filtrar: O método filtrar retorna as linhas do dataframe que correspondam a um padrão enviado pelo usuário.
        """
        plot = """
            O método plotar verifica se os dados já foram processados, se não chama a função somar(). Se o período for de dias ele enfeita os indexes, se o usuário marcar
            meses como true, o método enfeita o index também.
        """

        return (f'{sobre}\nAtributos de Classe: \n{atributos_classe}\nMétodos:\n{init}\n{validar}\n{limparDados}\n{somar}\n{document}\n{str_text}\n{filtro}')

    @staticmethod
    def creditos():
        return 'criado por Thiago Canal 15/07/2026'


    def __str__(self):
        try:
            self.validar()
            return f'{self.frame}\nNúmero de transações: {len(self.frame)}'
        except Exception as e:
            print(e)
            raise
