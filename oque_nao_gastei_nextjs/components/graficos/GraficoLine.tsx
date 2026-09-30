'use client';

import { ResponsiveLine } from '@nivo/line';
import { DadosGrafico } from '../types/grafico';
import { formatarPeriodo, formatarMoeda, temaNivoDark } from './graficoUtils';

interface GraficoLineProps {
    cor: string;
    dados: DadosGrafico[];
}

export default function GraficoLine({ cor, dados }: GraficoLineProps) {
    const pontos = dados.map((item) => ({
        x: formatarPeriodo(item.periodo),
        y: item.valor,
        periodoOriginal: item.periodo,
    }));

    const serie = {
        id: 'Valores',
        data: pontos,
    };

    return (
        <div style={{ height: '340px', width: '100%' }}>
            <ResponsiveLine 
                data={[serie]} 
                colors={[cor]}
                theme={temaNivoDark}
                margin={{ top: 25, right: 25, bottom: 50, left: 75 }} 
                xScale={{ type: 'point' }}
                yScale={{
                    type: 'linear',
                    min: 0,
                    max: 'auto',
                    stacked: false,
                }}
                curve="monotoneX"
                lineWidth={3}
                pointSize={8}
                pointColor="#0b0d11"
                pointBorderWidth={2}
                pointBorderColor={cor}
                enablePointLabel={false}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    tickRotation: pontos.length > 8 ? -30 : 0,
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    format: (v) => formatarMoeda(Number(v), true),
                }}
                enableGridX={false}
                enableGridY={true}
                useMesh={true}
                enableArea={true}
                areaOpacity={0.12}
                animate={true}
                motionConfig="gentle"
                // Tooltip com hover nos pontos
                tooltip={({ point }) => (
                    <div style={{
                        background: 'rgba(18, 21, 28, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        color: '#fff',
                        fontSize: '12px'
                    }}>
                        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>
                            {(point.data as any).periodoOriginal || point.data.xFormatted}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: cor,
                                display: 'inline-block'
                            }} />
                            <strong style={{ fontSize: '13px', color: '#f1f5f9' }}>
                                {formatarMoeda(Number(point.data.yFormatted))}
                            </strong>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
