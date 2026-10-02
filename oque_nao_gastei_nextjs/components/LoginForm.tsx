'use client';

import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { toast } from 'sonner';

interface LoginFormProps {
    onSuccess: (primeiro_nome: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [senha, setSenha] = useState(''); 
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
                credentials: 'include',
            });

            if (response.ok) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`, {
                    method: 'POST',
                    credentials: 'include'
                });
                const dados = await response.json();
                onSuccess(dados.first_name);
            } else {
                console.error('Falha no login: ', response.json());
                toast.error('Email ou senha incorretos');
            }
        } catch (error) {
            console.error('Erro na requisição: ', error);
            toast.error('Falha interna ao fazer login');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2 className={styles.title}>Acessar Conta</h2>
            
            <div className={styles.inputGroup}>
                <label htmlFor="email_id" className={styles.label}>E-mail</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="exemplo@gmail.com" 
                    id="email_id"
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="senha_id" className={styles.label}>Senha</label>
                <input 
                    type="password" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                    id="senha_id"
                    placeholder="••••••••"
                    required
                    className={styles.input}
                />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
            </button>
        </form>
    );
}
