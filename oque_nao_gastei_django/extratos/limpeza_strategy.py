import pandas as pd

metodos_limpeza = []

def add_funcao(funcao):
    metodos_limpeza.append(funcao)
    return funcao

def ler_csv(arquivo, delimiter=',', skiprows=0):
    codes = ["utf-8", "latin-1"]

    try:
        if hasattr(arquivo, 'seek'):
            arquivo.seek(0)

        for code in codes:
            try:
                csv = pd.read_csv(arquivo, delimiter=delimiter, skiprows=skiprows, encoding=code)
                break
            except UnicodeDecodeError:
                if hasattr(arquivo, 'seek'):
                    arquivo.seek(0)
                pass
            except Exception:
                if hasattr(arquivo, 'seek'):
                    arquivo.seek(0)

        return csv
    except Exception:
        return None

    

@add_funcao
def inter(csv, read=True):
    try:
        if read:
            csv = ler_csv(csv, delimiter=';', skiprows=4)

        datas = pd.to_datetime(csv['Data Lançamento'], dayfirst=True)
        descricao = csv['Descrição']
        valores = csv['Valor'].str.replace(',', '.').astype(float)
        
        extrato = {
            'data': datas,
            'descricao': descricao,
            'valor': valores 
        }
        
        return extrato
    except Exception:
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
        valores = csv['Valor'].str.replace(',', '.').str.replace(' R$ ', '').astype(float)

        extrato = {
            'data': datas,
            'descricao': descricao,
            'valor': valores
        }

        return extrato
    except Exception:
        return None

@add_funcao
def bb(csv, read=True):
    try:
        if read:
            csv = ler_csv(csv)

        csv = csv[~((csv['Data'] == '00/00/0000') | (csv['Lançamento'] == 'Saldo do dia'))]
        
        datas = pd.to_datetime(csv['Data'], dayfirst=True)
        descricao = (
            csv['Lançamento'].fillna('').astype(str) + ' ' +
            csv.get('Detalhes', pd.Series('', index=csv.index)).fillna('').astype(str) + ' ' +
            csv.get('Nº documento', pd.Series('', index=csv.index)).fillna('').astype(str)
        ).str.strip()
        valores = csv['Valor'].str.replace(',', '.').astype(float)

        extrato = {
            'data': datas,
            'descricao': descricao,
            'valor': valores
        }

        return extrato
    except Exception:
        return None

#@add_funcao # Estou sem extrato nubank para poder fazer
def nubank(arquivo):
    pass
