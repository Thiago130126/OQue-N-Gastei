'use client';

import { useState } from 'react';
import styles from './LogoutButton.module.css';
import { FiLogOut } from 'react-icons/fi';

interface LogoutButtonProps {
    onSuccess: () => void;
}

export default function LogoutButton({ onSuccess }: LogoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const logout = async () => {
        setLoading(true);
        try {
            const logout_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (logout_response.ok) {
                console.log('Logout realizado com sucesso');
                onSuccess();
            } else {
                console.log('Falha ao fazer logout: ', await logout_response.json());
            }
        } catch (error) {
            console.error('Falha ao fazer logout: ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            type="button" 
            onClick={logout} 
            disabled={loading}
            className={styles.logoutBtn}
            title="Encerrar sessão"
        >
            <FiLogOut size={16} className={styles.icon} />
            <span>{loading ? 'Saindo...' : 'Sair da conta'}</span>
        </button>
    );
}
