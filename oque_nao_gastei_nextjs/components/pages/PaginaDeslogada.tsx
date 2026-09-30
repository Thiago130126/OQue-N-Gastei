'use client';

import Link from "next/link";
import SobreProjeto from "../SobreProjeto";
import styles from './PaginaDeslogada.module.css';
import { FiLogIn, FiUserPlus, FiArrowRight } from "react-icons/fi";

interface PaginaDeslogadaProps {
    onAbrirLogin: () => void;
    onAbrirCadastro: () => void;
}

export default function PaginaDeslogada({ onAbrirCadastro, onAbrirLogin }: PaginaDeslogadaProps) {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.navbar}>
                <div className={styles.brandTitle}> <Link href='/'>O Que Não Gastei</Link></div>
                <div className={styles.navActions}>
                    <button onClick={onAbrirLogin} className={styles.btnGhost}>
                        <FiLogIn size={16} />
                        <span>Entrar</span>
                    </button>
                    <button onClick={onAbrirCadastro} className={styles.btnPrimary}>
                        <FiUserPlus size={16} />
                        <span>Criar Conta</span>
                    </button>
                </div>
            </header>

            <main className={styles.heroSection}>
                <div className={styles.badge}>
                    <span>✦ Controle Financeiro Inteligente</span>
                </div>
                
                <h1 className={styles.heroTitle}>
                    Visualize seus extratos bancários com clareza absoluta.
                </h1>
                
                <p className={styles.heroDescription}>
                    Faça o upload do seu arquivo CSV, agrupe por períodos, filtre por palavras-chave e veja o dinheiro que você economizou com gráficos interativos.
                </p>

                <div className={styles.heroButtons}>
                    <button onClick={onAbrirCadastro} className={styles.btnCta}>
                        <span>Começar Gratuitamente</span>
                        <FiArrowRight size={18} />
                    </button>
                    <button onClick={onAbrirLogin} className={styles.btnGlass}>
                        <span>Já possuo uma conta</span>
                    </button>
                </div>

                <div className={styles.aboutCard}>
                    <SobreProjeto />
                </div>
            </main>
        </div>
    );
}
