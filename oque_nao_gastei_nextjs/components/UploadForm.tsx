'use client';

import { useState } from "react";
import { refresh_Token } from "./validators/Refresher";
import styles from './UploadForm.module.css';
import { FiUploadCloud } from "react-icons/fi";
import { LuFileCheck } from "react-icons/lu"
import { toast } from "sonner";

interface UploadFormProps {
    onSuccess: () => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected_file = e.target.files?.[0] ?? null;
        setArquivo(selected_file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!arquivo) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('arquivo_csv', arquivo);

        try {
            const csrf_token_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/csrf/`, {
                method: 'GET',
                credentials: 'include'
            });
            const csrf_data = await csrf_token_response.json();
            const csrf_token = csrf_data.csrf_token;

            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/upload/`, {
                method: 'POST',
                headers: { 'X-CSRFToken': csrf_token },
                credentials: 'include',
                body: formData
            });

            if (response.status === 401) {
                const refresh = await refresh_Token();
                if (refresh.ok) {
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/upload/`, {
                        method: 'POST',
                        headers: { 'X-CSRFToken': csrf_token },
                        credentials: 'include',
                        body: formData
                    });
                }
            }

            if (response.ok) {
                onSuccess();
            } else {
                const erro = await response.json();
                console.error('Falha no upload:', erro);
                toast.error('falha ao processar extrato, formato de csv inválido');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            toast.error('Erro interno ao processar o arquivo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2 className={styles.modalTitle}>Importar Extrato Bancário</h2>
            <p className={styles.modalDescription}>Selecione o arquivo CSV exportado do seu banco.</p>

            <label className={styles.dropzone}>
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    className={styles.hiddenInput} 
                />
                {arquivo ? (
                    <div className={styles.fileSelected}>
                        <LuFileCheck size={36} color="var(--color-income)" />
                        <span className={styles.fileName}>{arquivo.name}</span>
                        <span className={styles.changeHint}>Clique para trocar de arquivo</span>
                    </div>
                ) : (
                    <div className={styles.emptyPrompt}>
                        <FiUploadCloud size={36} color="var(--accent-primary)" />
                        <span className={styles.dropText}>Clique para selecionar o CSV</span>
                        <span className={styles.formatHint}>Somente arquivos .csv são suportados</span>
                    </div>
                )}
            </label>

            <button 
                type="submit" 
                disabled={!arquivo || loading} 
                className={styles.submitBtn}
            >
                {loading ? 'Processando dados...' : 'Enviar Arquivo'}
            </button>
        </form>
    );
}
