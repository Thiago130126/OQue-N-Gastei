// components/SobreProjeto.tsx
import styles from './SobreProjeto.module.css';
import { FiCode, FiCpu, FiTarget, FiExternalLink, FiAward } from 'react-icons/fi';

export default function SobreProjeto() {
    const techs = [
        { name: "Next.js & React", type: "Frontend" },
        { name: "TypeScript", type: "Linguagem" },
        { name: "Django & DRF", type: "Backend API" },
        { name: "Python", type: "Linguagem" },
        { name: "Pandas", type: "Processamento" },
        { name: "PostgreSQL", type: "Banco de Dados" },
        { name: "Redis", type: "Cache" },
        { name: "Nivo Charts", type: "Visualização" },
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.badge}>
                    <FiCode size={14} />
                    <span>Sobre o Projeto</span>
                </div>
                <h2 className={styles.title}>O Que Não Gastei?</h2>
                <p className={styles.lead}>
                    Gestão financeira inteligente, direto ao ponto e sem depender de APIs de inteligência artificial.
                </p>
            </header>

            {/* Seção 1: Origem e Filosofia */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <FiCpu className={styles.sectionIcon} />
                    A História e Abordagem
                </h3>
                <p className={styles.text}>
                    <strong>O Que Não Gastei</strong> é o meu primeiro projeto web full stack de grande porte. Ele nasceu como uma inspiração/paródia do projeto{' '}
                    <a 
                        href="https://www.oquegastei.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        O Que Gastei? <FiExternalLink size={12} />
                    </a>.
                </p>
                <div className={styles.callout}>
                    <p className={styles.calloutText}>
                        <strong>Por que sem IA?</strong> Muitos serviços acabam sendo apenas um intermediário caro para APIs de LLM (como Gemini ou OpenAI). Se a ferramenta apenas repassa seus extratos para uma IA, por que não colar direto lá? Decidi seguir pelo caminho da engenharia tradicional: <strong>código determinístico, seguro e eficiente com Python e Pandas</strong> para processar cada linha do seu CSV.
                    </p>
                </div>
            </section>

            {/* Seção 2: Tech Stack em Badges */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <FiCode className={styles.sectionIcon} />
                    Tecnologias Utilizadas
                </h3>
                <div className={styles.techGrid}>
                    {techs.map((tech) => (
                        <div key={tech.name} className={styles.techCard}>
                            <span className={styles.techName}>{tech.name}</span>
                            <span className={styles.techType}>{tech.type}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Seção 3: Objetivos e Aprendizados */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <FiTarget className={styles.sectionIcon} />
                    Objetivos do Projeto
                </h3>
                <p className={styles.text}>
                    O grande foco foi o aprendizado prático de ponta a ponta: arquitetura de APIs REST com Django, autenticação baseada em JWT com rotação de tokens, processamento analítico com Pandas, caching em memória com Redis, componentes dinâmicos no ecossistema React/Next.js e segurança em aplicações web.
                </p>
            </section>

            {/* Footer do Sobre */}
            <footer className={styles.footer}>
                <FiAward size={18} color="var(--accent-primary)" />
                <span>Desenvolvido com foco em privacidade e autonomia dos dados.</span>
            </footer>
        </div>
    );
}
