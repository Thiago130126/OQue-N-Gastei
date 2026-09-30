'use client';
import React, { useState } from "react";
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
    onSuccess: (primeiro_nome: string) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErro(null);

        if (senha !== confirmPassword) {
            setErro('As senhas digitadas não coincidem.');
            return;
        }

        setLoading(true);

        const dados = {
            email,
            password: senha,
            confirmPassword,
            first_name: firstName,
            last_name: lastName,
            data_nascimento: dataNascimento
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            });

            if (response.ok) {
                const response_data = await response.json();
                onSuccess(response_data.first_name);
            } else {
                const erroData = await response.json();
                setErro(typeof erroData === 'string' ? erroData : 'Falha ao criar conta. Verifique os dados.');
                console.error(erroData);
            }
        } catch (error) {
            setErro('Erro na conexão com o servidor.');
            console.error('Falha na requisição: ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Criar Nova Conta</h2>
                <p className={styles.subtitle}>Preencha seus dados para gerenciar seus extratos.</p>
            </div>

            {erro && (
                <div className={styles.errorMessage} role="alert">
                    <span>{erro}</span>
                </div>
            )}

            {/* Linha com Nome e Sobrenome lado a lado */}
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="first_name_id" className={styles.label}>Nome</label>
                    <input 
                        type="text" 
                        name="first_name" 
                        placeholder="João" 
                        id="first_name_id" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="last_name_id" className={styles.label}>Sobrenome</label>
                    <input 
                        type="text" 
                        placeholder="da Silva" 
                        name="last_name" 
                        id="last_name_id" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required
                        className={styles.input}
                    />
                </div>
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
                <label htmlFor="email_id" className={styles.label}>E-mail</label>
                <input 
                    type="email" 
                    required 
                    placeholder="exemplo@gmail.com" 
                    name="email" 
                    id="email_id" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Data de Nascimento */}
            <div className={styles.inputGroup}>
                <label htmlFor="data_nascimento_id" className={styles.label}>Data de Nascimento</label>
                <input 
                    type="date" 
                    name="data_nascimento" 
                    id="data_nascimento_id" 
                    required 
                    value={dataNascimento} 
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className={styles.input}
                />
            </div>

            {/* Linha com Senha e Confirmação */}
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="password_id" className={styles.label}>Senha</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        required 
                        id="password_id" 
                        value={senha} 
                        onChange={(e) => setSenha(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword_id" className={styles.label}>Confirmar Senha</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="••••••••" 
                        id="confirmPassword_id" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                    />
                </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Criando conta...' : 'Cadastrar'}
            </button>
        </form>
    );
}
