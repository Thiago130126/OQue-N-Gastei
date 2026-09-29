export interface DadosGrafico{
    periodo: string;
    valor: number;
}

export interface PontoLinha{
    x: string;
    y: number;
}

export interface SerieLinha{
    id: string;
    data: PontoLinha[];
}