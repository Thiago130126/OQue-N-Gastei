'use client';

import { useState } from 'react';
import { DadosGrafico } from '@/components/types/grafico';
import styles from './FormQuery.module.css';
import { FiSearch, FiFilter } from 'react-icons/fi';

interface FormGraficoProps {
    tipo: 'entrada' | 'saida';
    onResultado: (dados: DadosGrafico[]) => void;
}

const opcoesMoment = [
    { valor: 'dias', texto: 'Dias' },
    { valor: 'mes', texto: 'Mês' },
    { valor: 'ano', texto: 'Ano' },
];

export default function FormGrafico({ tipo, onResultado }: FormGraficoProps) {
    const [moment, setMoment] = useState('mes');
    const [filtro, setFiltro] = useState('');
    const [loading, setLoading] = useState(false);

    const dados_consulta = {
        filter: filtro.trim() || null,
        moment,
        tipo
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const csrf_token_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/csrf/`, {
                method: 'GET',
                credentials: 'include',
            });
            const csrf_data = await csrf_token_response.json();
            const csrf_token = csrf_data.csrf_token;

            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf_token,
                },
                body: JSON.stringify(dados_consulta),
            });

            if (response.status === 401) {
                const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refresh.ok) {
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrf_token,
                        },
                        body: JSON.stringify(dados_consulta),
                    });
                }
            }

            const dados = await response.json();

            if (!response.ok) {
                console.error('Falha ao tentar filtrar os dados do gráfico: ', dados);
            }
            
            onResultado(dados.resultado || []);
        } catch (error) {
            console.error('Falha ao tentar customizar os gráficos: ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.filterForm}>
            <div className={styles.topRow}>
                {/* Campo de Busca por Texto */}
                <div className={styles.searchWrapper}>
                    <FiSearch className={styles.searchIcon} size={15} />
                    <input
                        type="text"
                        placeholder="Filtrar descrição (ex: Mercado, Uber...)"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Botão de Envio */}
                <button type="submit" disabled={loading} className={styles.applyBtn}>
                    <FiFilter size={14} />
                    <span>{loading ? 'Filtrando...' : 'Aplicar'}</span>
                </button>
            </div>

            {/* Agrupamento em Chips (Substitui os radios clássicos) */}
            <div className={styles.groupWrapper}>
                <span className={styles.groupLabel}>Agrupar por:</span>
                <div className={styles.chipsContainer}>
                    {opcoesMoment.map((opcao) => (
                        <label 
                            key={opcao.valor}
                            className={`${styles.chip} ${moment === opcao.valor ? styles.chipActive : ''}`}
                        >
                            <input
                                type="radio"
                                name={`moment-${tipo}`}
                                value={opcao.valor}
                                checked={moment === opcao.valor}
                                onChange={(e) => setMoment(e.target.value)}
                                className={styles.hiddenRadio}
                            />
                            <span>{opcao.texto}</span>
                        </label>
                    ))}
                </div>
            </div>
        </form>
    );
}
