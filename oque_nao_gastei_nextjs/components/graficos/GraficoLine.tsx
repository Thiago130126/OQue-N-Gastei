'use client';

import { ResponsiveLine } from '@nivo/line'
import { DadosGrafico } from '../types/grafico';

interface GraficoLineProps{
    cor: string;
    dados: DadosGrafico[];
}

export default function GraficoLine({cor, dados}: GraficoLineProps){
    const pontos = dados.map((item) => ({
        x: item.periodo,
        y: item.valor,
    }));

    const serie = {
        id: 'Entadas',
        data: pontos,
    };

    return (
        <div style={{ height: '300px' }}>
            <ResponsiveLine colors={[cor]} data={[serie]} xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false,
            }}
            margin={{ top: 30, right: 30, bottom: 60, left: 70 }} 
            axisBottom={{
                legend: 'Período',
                legendOffset: 40,
                legendPosition: 'middle',
            }}
            axisLeft={{
                legend: 'Valor',
                legendOffset: -60,
                legendPosition: 'middle',
            }}
            enableGridX={false}
            enableGridY={true}
            useMesh={true}
            animate={true}
            />
        </div>
    );
}