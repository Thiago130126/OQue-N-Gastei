'use client';

import { ResponsivePie, PieCustomLayerProps } from '@nivo/pie';
import { DadosGrafico } from '../types/grafico';
import { formatarPeriodo, formatarMoeda, temaNivoDark } from './graficoUtils';

interface GraficoPieProps {
    cor: string;
    dados: DadosGrafico[];
}

interface DadoPie {
    id: string;
    label: string;
    value: number;
    periodoOriginal: string;
}

export default function GraficoPie({ cor, dados }: GraficoPieProps) {
    const fatias: DadoPie[] = dados.map((item) => ({
        id: formatarPeriodo(item.periodo),
        label: formatarPeriodo(item.periodo),
        value: item.valor,
        periodoOriginal: item.periodo,
    }));

    const total = fatias.reduce((soma, fatia) => soma + fatia.value, 0);

    // Camada central com totalizador em destaque
    const camadaTotal = ({ centerX, centerY }: PieCustomLayerProps<DadoPie>) => {
        return (
            <g transform={`translate(${centerX}, ${centerY})`}>
                <text 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    y="-10"
                    style={{ fill: '#94a3b8', fontSize: '11px', fontWeight: 500 }}
                >
                    Total Acumulado
                </text>
                <text 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    y="12"
                    style={{ fill: '#f8fafc', fontSize: '16px', fontWeight: 700 }}
                >
                    {formatarMoeda(total, true)}
                </text>
            </g>
        );
    };

    return (
        <div style={{ height: '420px', width: '100%' }}>
            <ResponsivePie 
                data={fatias} 
                margin={{top: 30, right: 50, bottom: 30, left: 50}}
                theme={temaNivoDark}
                colors={{ scheme: 'category10' }} // Paleta variada para fatias se destacarem
                innerRadius={0.65} 
                padAngle={2.5} 
                cornerRadius={5}
                borderWidth={1} 
                borderColor="rgba(255, 255, 255, 0.1)" 
                enableArcLinkLabels={dados.length <= 6}
                arcLinkLabelsTextColor="#94a3b8"
                arcLinkLabelsThickness={1}
                arcLinkLabelsColor={{ from: 'color' }}
                enableArcLabels={false}
                activeOuterRadiusOffset={8}
                animate={true}
                motionConfig="gentle"
                layers={['arcs', 'arcLabels', 'arcLinkLabels', camadaTotal]}
                // Tooltip estilizado
                tooltip={({ datum }) => (
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
                            {datum.data.periodoOriginal || datum.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: datum.color,
                                display: 'inline-block'
                            }} />
                            <strong style={{ fontSize: '13px', color: '#f1f5f9' }}>
                                {formatarMoeda(datum.value)}
                            </strong>
                        </div>
                    </div>
                )}
            />
        </div>  
    );
}
