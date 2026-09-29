'use client';

import { ResponsivePie, PieCustomLayerProps } from '@nivo/pie'
import { DadosGrafico } from '../types/grafico';

interface GraficoPieProps{
    cor: string;
    dados: DadosGrafico[];
}

interface DadoPie {
    id: string;
    label: string;
    value: number;
}

export default function GraficoPie({cor, dados}: GraficoPieProps){
    const fatias = dados.map((item) => ({
        id: item.periodo,
        label: item.periodo,
        value: item.valor,
    }));

    const total = fatias.reduce(
        (soma, fatia) => soma + fatia.value,
        0
    );

    const total_formatado = new Intl.NumberFormat('pt-br', {
        style: 'currency',
        currency: 'BRL',
    }).format(total)

    const camadaTotal = ({
    centerX,
    centerY,
    }: PieCustomLayerProps<DadoPie>) => {
        return(
            <text x={centerX} y={centerY} textAnchor='middle' dominantBaseline='middle'>{total_formatado}</text>
        )
    }

    return(
        <div style={{ height: '300px' }}>
            <ResponsivePie data={fatias} colors={cor} innerRadius={0.6} borderWidth={2} borderColor={"black"} padAngle={2} layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', camadaTotal]}/>
        </div>  
    );
}