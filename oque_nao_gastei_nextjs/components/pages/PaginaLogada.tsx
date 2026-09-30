'use client';
import styles from './PaginaLogada2.module.css';

import { useState, useEffect } from "react";
import MolduraGrafico from "../graficos/moldura/MolduraGrafico";
import LogoutButton from "../LogoutButton";
import { DadosGrafico } from "../types/grafico";
import { refresh_Token } from "../validators/Refresher";

// icons
import { TiChartPie, TiChartBar, TiChartLine, TiBrush } from "react-icons/ti";
import { FiUpload, FiUser, FiInfo, FiSliders } from "react-icons/fi";
import Link from 'next/link';

interface PaginaLogadaProps {
    onAbrirPerfil: () => void;
    onAbrirUpload: () => void;
    onAbrirSobre: () => void;
    nome: string;
    onLogoutSuccess: () => void;
}

export default function PaginaLogada({ onAbrirPerfil, onAbrirUpload, onAbrirSobre, nome, onLogoutSuccess }: PaginaLogadaProps) {
    const [modoCustomizacao, setModoCustomizacao] = useState(false);
    const [tipoGrafico, setTipoGrafico] = useState<'bar' | 'line' | 'pie' | 'sem_dados'>('bar');
    const [corEntrada, setCorEntrada] = useState('#10b981');
    const [corGastos, setCorGastos] = useState('#f43f5e');
    const [dadosEntradas, setDadosEntradas] = useState<DadosGrafico[]>([]);
    const [dadosGastos, setDadosGastos] = useState<DadosGrafico[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.status === 401) {
                    const refresh = await refresh_Token();
                    if (refresh.ok) {
                        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                    }
                }

                try {
                    const dados = await response.json();
                    setDadosGastos(dados.gastos || []);
                    setDadosEntradas(dados.entradas || []);

                    const cor_entrada = localStorage.getItem('corEntradaLS');
                    if (cor_entrada !== null) setCorEntrada(cor_entrada);
                    const cor_gastos = localStorage.getItem('corGastosLS');
                    if (cor_gastos !== null) setCorGastos(cor_gastos);

                    if ((!dados.gastos || dados.gastos.length === 0) && (!dados.entradas || dados.entradas.length === 0)) {
                        setTipoGrafico('sem_dados');
                    }
                } catch (error) {
                    console.error('Falha ao processar dados dos gráficos: ', error);
                }
            } catch (error) {
                setTipoGrafico('sem_dados');
                console.error(error);
            }
        }
        fetchData();
    }, []);

    return (
        <div className={styles.layoutWrapper}>
            {/* Sidebar Fixa Glassmorphism */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <Link href='/'>
                        <img className={styles.logo} src="/logo3.png" alt="O Que Não Gastei" />
                    </Link>
                </div>

                <nav className={styles.navigation}>
                    <button className={`${styles.navItem} ${styles.navItemActive}`}>
                        <FiSliders size={18} />
                        <span>Dashboard</span>
                    </button>
                    <button onClick={onAbrirUpload} className={styles.navItem}>
                        <FiUpload size={18} />
                        <span>Importar CSV</span>
                    </button>
                    <button onClick={onAbrirPerfil} className={styles.navItem}>
                        <FiUser size={18} />
                        <span>Minha Conta</span>
                    </button>
                    <button onClick={onAbrirSobre} className={styles.navItem}>
                        <FiInfo size={18} />
                        <span>Sobre o Projeto</span>
                    </button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <span className={styles.userLabel}>Logado como</span>
                        <strong className={styles.userName}>{nome || 'Usuário'}</strong>
                    </div>
                    <LogoutButton onSuccess={onLogoutSuccess} />
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className={styles.mainContent}>
                {/* Header Superior */}
                <header className={styles.topHeader}>
                    <div>
                        <h1 className={styles.greetingTitle}>Olá, {nome} 👋</h1>
                        <p className={styles.greetingSubtitle}>Acompanhe o balanço das suas despesas e receitas.</p>
                    </div>

                    <div className={styles.headerActions}>
                        <button 
                            className={`${styles.iconButton} ${modoCustomizacao ? styles.iconButtonActive : ''}`}
                            onClick={() => setModoCustomizacao(!modoCustomizacao)}
                            title="Personalizar cores"
                        >
                            <TiBrush size={20} />
                            <span>Cores</span>
                        </button>
                        <button onClick={onAbrirUpload} className={styles.primaryUploadButton}>
                            <FiUpload size={16} />
                            <span>Upload de Extrato</span>
                        </button>
                    </div>
                </header>

                {/* Painel Expansível de Cores */}
                {modoCustomizacao && (
                    <div className={styles.customizerCard}>
                        <h3 className={styles.customizerTitle}>Customização de Cores dos Gráficos</h3>
                        <div className={styles.customizerRow}>
                            <label className={styles.colorPickerLabel}>
                                <span>Entradas:</span>
                                <input 
                                    type="color" 
                                    value={corEntrada} 
                                    onChange={(e) => {
                                        setCorEntrada(e.target.value); 
                                        localStorage.setItem('corEntradaLS', e.target.value);
                                    }}
                                />
                            </label>
                            <label className={styles.colorPickerLabel}>
                                <span>Gastos:</span>
                                <input 
                                    type="color" 
                                    value={corGastos} 
                                    onChange={(e) => {
                                        setCorGastos(e.target.value); 
                                        localStorage.setItem('corGastosLS', e.target.value);
                                    }}
                                />
                            </label>
                            <button 
                                className={styles.resetButton}
                                onClick={() => {
                                    setCorEntrada('#10b981'); 
                                    setCorGastos('#f43f5e');
                                    localStorage.setItem('corEntradaLS', '#10b981'); 
                                    localStorage.setItem('corGastosLS', '#f43f5e');
                                }}
                            >
                                Restaurar Padrões
                            </button>
                        </div>
                    </div>
                )}

                {/* Barra de Troca de Tipo de Gráfico */}
                <div className={styles.controlsBar}>
                    <span className={styles.controlsLabel}>Visualização:</span>
                    <div className={styles.graphTypeSelector}>
                        <button 
                            type="button" 
                            className={`${styles.typeButton} ${tipoGrafico === 'bar' ? styles.typeButtonActive : ''}`}
                            onClick={() => setTipoGrafico('bar')}
                            title="Gráfico de Barras"
                        >
                            <TiChartBar size={22} />
                            <span>Barras</span>
                        </button>
                        <button 
                            type="button" 
                            className={`${styles.typeButton} ${tipoGrafico === 'line' ? styles.typeButtonActive : ''}`}
                            onClick={() => setTipoGrafico('line')}
                            title="Gráfico de Linha"
                        >
                            <TiChartLine size={22} />
                            <span>Linha</span>
                        </button>
                        <button 
                            type="button" 
                            className={`${styles.typeButton} ${tipoGrafico === 'pie' ? styles.typeButtonActive : ''}`}
                            onClick={() => setTipoGrafico('pie')}
                            title="Gráfico de Pizza"
                        >
                            <TiChartPie size={22} />
                            <span>Pizza</span>
                        </button>
                    </div>
                </div>

                {/* Grid com os 2 Gráficos */}
                <section className={styles.chartsGrid}>
                    <div className={styles.chartWrapper}>
                        <MolduraGrafico dados={dadosEntradas} titulo="Entradas" cor={corEntrada} tipoGrafico={tipoGrafico} tipo={'entrada'} />
                    </div>
                    <div className={styles.chartWrapper}>
                        <MolduraGrafico dados={dadosGastos} titulo="Gastos" cor={corGastos} tipoGrafico={tipoGrafico} tipo={'saida'} />
                    </div>
                </section>
            </main>
        </div>
    );
}
