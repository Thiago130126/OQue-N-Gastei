'use client';

import { ResponsiveBar } from "@nivo/bar";
import { DadosGrafico } from "../types/grafico";
import { formatarPeriodo, formatarMoeda, temaNivoDark } from "./graficoUtils";

interface GraficoBarrasProps {
    dados: DadosGrafico[];
    cor: string;
}

export default function GraficoBarras({ dados, cor }: GraficoBarrasProps) {
    const dadosFormatados = dados.map((item) => ({
        ...item,
        periodoFormatado: formatarPeriodo(item.periodo),
    }));

    return (
        <div style={{ height: '340px', width: '100%' }}> 
            <ResponsiveBar 
                data={dadosFormatados} 
                keys={['valor']} 
                indexBy="periodoFormatado" 
                margin={{ top: 20, right: 20, bottom: 50, left: 75 }} 
                padding={0.35} 
                colors={cor} 
                theme={temaNivoDark}
                borderRadius={4}
                enableLabel={false}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 8,
                    tickRotation: dadosFormatados.length > 8 ? -30 : 0,
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 8,
                    format: (v) => formatarMoeda(Number(v), true),
                }}
                enableGridY={true}
                enableGridX={false}
                animate={true}
                motionConfig="gentle"
                // Tooltip customizado dark mode com hover iluminado
                tooltip={({ data }) => (
                    <div style={{
                        background: 'rgba(18, 21, 28, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        fontSize: '12px'
                    }}>
                        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>
                            {data.periodo}
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
                                {formatarMoeda(data.valor)}
                            </strong>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
