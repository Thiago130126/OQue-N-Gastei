'use client';

import React, { useState } from 'react';

interface LoginFormProps{
    onSuccess: (primeiro_nome: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps){

    const [senha, setSenha] = useState(''); 
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha}),
                credentials: 'include',
            });

            if (response.ok){
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`, {
                    method: 'POST',
                    credentials: 'include'
                } ).then(res => console.log('Rota acessada: accounts/api/refresh/ ', res.status))

                const dados = await response.json()
                onSuccess(dados.first_name);
            }else{
                console.error('Falha no login: ', response.json());
            }

        }catch(error){
            console.error('Erro na requisição: ', error);
        }

    };
    
    return(
        <div>
            <form method="post" onSubmit={handleSubmit}>
                <label htmlFor="email_id">Seu email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@gmail.com" id="email_id"/>
                <label htmlFor="senha_id">Sua senha:</label>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} id="senha_id"/>
                <input type="submit" value={'Login'}/>
            </form>
        </div>
    )
}