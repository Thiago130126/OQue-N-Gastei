'use client';

import React, { useState, useEffect } from "react";
import styles from './ProfileForm.module.css';
import { FiUser, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface ProfileFormProps {
    onSuccess: () => void;
}

export default function ProfileForm({ onSuccess }: ProfileFormProps) {
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [sobrenome, setSobreNome] = useState('');
    const [dataNasc, setDataNasc] = useState('');

    const [carregandoDados, setCarregandoDados] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
    const [mensagemErro, setMensagemErro] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setCarregandoDados(true);
            try {
                let perfil_json = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/perfil/`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (perfil_json.status === 401) {
                    const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`, {
                        method: 'POST',
                        credentials: 'include'
                    });

                    if (refresh.ok) {
                        perfil_json = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/perfil/`, {
                            method: 'GET',
                            credentials: 'include'
                        });
                    }
                }

                if (perfil_json.ok) {
                    const perfil = await perfil_json.json();
                    setEmail(perfil.email || '');
                    setNome(perfil.first_name || '');
                    setSobreNome(perfil.last_name || '');
                    setDataNasc(perfil.data_nascimento || '');
                } else {
                    setMensagemErro('Não foi possível carregar os dados do seu perfil.');
                }
            } catch (error) {
                console.error('Falha ao buscar perfil:', error);
                setMensagemErro('Erro de conexão ao carregar o perfil.');
            } finally {
                setCarregandoDados(false);
            }
        }

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSalvando(true);
        setMensagemSucesso(null);
        setMensagemErro(null);

        const dados = {
            email,
            first_name: nome,
            last_name: sobrenome,
            data_nascimento: dataNasc
        };

        try {
            const csrf_token_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/csrf/`, {
                method: 'GET',
                credentials: 'include',
            });
            const csrf_data = await csrf_token_response.json();
            const csrf_token = csrf_data.csrf_token;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/perfil/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf_token
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                setMensagemSucesso('Perfil atualizado com sucesso!');
                onSuccess();
            } else {
                const erroData = await response.json();
                setMensagemErro('Falha ao atualizar dados. Verifique as informações.');
                console.error('Erro da API: ', erroData);
            }
        } catch (error) {
            setMensagemErro('Erro na conexão com o servidor.');
            console.error('Falha na requisição: ', error);
        } finally {
            setSalvando(false);
        }
    };

    if (carregandoDados) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <span>Carregando informações do perfil...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <FiUser size={20} />
                </div>
                <div>
                    <h2 className={styles.title}>Minha Conta</h2>
                    <p className={styles.subtitle}>Gerencie suas informações pessoais</p>
                </div>
            </div>

            {mensagemSucesso && (
                <div className={styles.successAlert} role="status">
                    <FiCheckCircle size={16} />
                    <span>{mensagemSucesso}</span>
                </div>
            )}

            {mensagemErro && (
                <div className={styles.errorAlert} role="alert">
                    <FiAlertCircle size={16} />
                    <span>{mensagemErro}</span>
                </div>
            )}

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="nome" className={styles.label}>Nome</label>
                    <input 
                        type="text" 
                        id="nome" 
                        name="nome" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="sobrenome" className={styles.label}>Sobrenome</label>
                    <input 
                        type="text" 
                        id="sobrenome" 
                        name="sobrenome" 
                        value={sobrenome} 
                        onChange={(e) => setSobreNome(e.target.value)} 
                        className={styles.input}
                        required
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>E-mail</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className={styles.input}
                    required
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="dataNasc" className={styles.label}>Data de Nascimento</label>
                <input 
                    type="date" 
                    id="dataNasc" 
                    name="dataNasc" 
                    value={dataNasc} 
                    onChange={(e) => setDataNasc(e.target.value)} 
                    className={styles.input}
                />
            </div>

            <button type="submit" disabled={salvando} className={styles.submitBtn}>
                {salvando ? 'Salvando alterações...' : 'Salvar Alterações'}
            </button>
        </form>
    );
}
