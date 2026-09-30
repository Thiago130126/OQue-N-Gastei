// components/graficos/graficoUtils.ts

// Formata períodos: '2026-06-15' -> '15/06' | '2026-06' -> 'Jun/26'
export function formatarPeriodo(periodo: string): string {
    if (!periodo) return '';
    
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(periodo)) {
        const [ano, mes, dia] = periodo.split('-');
        return `${dia}/${mes}/${ano.slice(2)}`;
    }
    // YYYY-MM
    if (/^\d{4}-\d{2}$/.test(periodo)) {
        const [ano, mes] = periodo.split('-');
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const idx = parseInt(mes, 10) - 1;
        return `${meses[idx] || mes}/${ano.slice(2)}`;
    }
    return periodo;
}

// Formata valores numéricos para R$
export function formatarMoeda(valor: number, compacto = false): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: compacto ? 0 : 2,
    }).format(valor);
}

// Tema visual Dark Mode com contraste ajustado para a Nivo
export const temaNivoDark = {
    text: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        fill: '#94a3b8',
    },
    axis: {
        domain: {
            line: {
                stroke: 'rgba(255, 255, 255, 0.12)',
                strokeWidth: 1,
            },
        },
        legend: {
            text: {
                fontSize: 12,
                fontWeight: 600,
                fill: '#cbd5e1',
            },
        },
        ticks: {
            line: {
                stroke: 'rgba(255, 255, 255, 0.12)',
                strokeWidth: 1,
            },
            text: {
                fontSize: 11,
                fill: '#94a3b8',
                fontWeight: 500,
            },
        },
    },
    grid: {
        line: {
            stroke: 'rgba(255, 255, 255, 0.05)',
            strokeWidth: 1,
            strokeDasharray: '3 3',
        },
    },
    tooltip: {
        container: {
            background: 'rgba(18, 21, 28, 0.95)',
            color: '#f8fafc',
            fontSize: '12px',
            borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '10px 14px',
            backdropFilter: 'blur(8px)',
        },
    },
};
