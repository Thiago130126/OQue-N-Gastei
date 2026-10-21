import pandas as pd

metodos_limpeza = []

def add_funcao(funcao):
    metodos_limpeza.append(funcao)
    return funcao

def ler_csv(arquivo, delimiter=',', skiprows=0):
    codes = ["utf-8", "latin-1", "iso-8859-1", "cp1252"]

    try:
        if hasattr(arquivo, 'seek'):
            arquivo.seek(0)

        for code in codes:
            try:
                csv = pd.read_csv(arquivo, delimiter=delimiter, skiprows=skiprows, encoding=code)
                break
            except UnicodeDecodeError as code_error:
                print(code_error)
                if hasattr(arquivo, 'seek'):
                    arquivo.seek(0)
                pass
            except Exception as e:
                print(e)
                if hasattr(arquivo, 'seek'):
                    arquivo.seek(0)

        return csv
    except Exception as e:
        print(e)
        return None

    

@add_funcao
def inter(csv, read=True):
    try:
        if read:
            csv = ler_csv(csv, delimiter=';', skiprows=4)

        datas = pd.to_datetime(csv['Data Lançamento'], dayfirst=True)
        descricao = csv['Descrição']
        valores = (
                    csv['Valor']
                    .astype(str)
                    .str.replace(' ', '', regex=False)
                    .str.replace('R$', '', regex=False)
                    .str.replace('.', '', regex=False)
                    .str.replace(',', '.', regex=False)
                )
        valores = pd.to_numeric(valores, errors='coerce')

        valido = datas.notna() & valores.notna()
        
        extrato = {
            'data': datas[valido],
            'descricao': descricao[valido],
            'valor': valores[valido]
        }

        print('Funcionou', flush=True)
        
        return extrato
    except Exception as e:
        print(e)
        return None

@add_funcao
def sicredi(csv, read=True):
    try:
        if read:
            csv = ler_csv(csv, delimiter=';')

        datas = pd.to_datetime(csv['Data'], dayfirst=True)
        descricao = (
            csv['Descricao'].fillna('').astype(str) + ' ' +
            csv['CodTransacao'].fillna('').astype(str) + ' ' +
            csv['Identificador'].fillna('').astype(str) + ' ' +
            csv['Tipo'].fillna('').astype(str)
        ).str.strip()
        valores = (
            csv['Valor']
            .astype(str)
            .str.replace(' ', '', regex=False)
            .str.replace('R$', '', regex=False)
            .str.replace('.', '', regex=False)
            .str.replace(',', '.', regex=False)
        )
        valores = pd.to_numeric(valores, errors='coerce')

        valido = datas.notna() & valores.notna()

        extrato = {
            'data': datas[valido],
            'descricao': descricao[valido],
            'valor': valores[valido]
        }

        return extrato
    except Exception as e:
        print(e)
        return None

@add_funcao
def bb(csv, read=True):
    try:
        if read:
            csv = ler_csv(csv)

        csv = csv[
            ~(
                (csv['Data'] == '00/00/0000')
                | csv['Lançamento']
                .astype(str)
                .str.contains(r's\s*a\s*l\s*d\s*o', case=False, regex=True, na=False)
            )
        ]
        
        datas = pd.to_datetime(csv['Data'], dayfirst=True)
        descricao = (
            csv['Lançamento'].fillna('').astype(str) + ' ' +
            csv.get('Detalhes', pd.Series('', index=csv.index)).fillna('').astype(str) + ' ' +
            csv.get('N° documento', pd.Series('', index=csv.index)).fillna('').astype(str)
        ).str.strip()
        valores = (
            csv['Valor']
            .astype(str)
            .str.replace(' ', '', regex=False)
            .str.replace('R$', '', regex=False)
            .str.replace('.', '', regex=False)
            .str.replace(',', '.', regex=False)
        )
        valores = pd.to_numeric(valores, errors='coerce')

        valido = datas.notna() & valores.notna()

        extrato = {
            'data': datas[valido],
            'descricao': descricao[valido],
            'valor': valores[valido]
        }

        return extrato
    except Exception as e:
        print(e)
        return None

#@add_funcao # Estou sem extrato nubank para poder fazer
def nubank(arquivo):
    pass
