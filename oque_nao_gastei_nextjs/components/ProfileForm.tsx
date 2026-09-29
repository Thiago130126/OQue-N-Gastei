'use client';

import React, { useState, useEffect } from "react";

interface ProfileFormProps{
    onSuccess: () => void;
}

export default function ProfileForm({onSuccess}: ProfileFormProps){
    
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [sobrenome, setSobreNome] = useState('');
    const [dataNasc, setDataNasc] = useState('');

    useEffect(() => {
        async function fetchData(){
            let perfil_json;

            perfil_json = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/perfil/`, {
                method: 'GET',
                credentials: 'include'
            });

            if(perfil_json.status === 401){

                const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`, {
                    method: 'POST',
                    credentials: 'include'
                });
                console.log('Rota acessada: accounts/api/refresh/; status: ', refresh.status);
                
                if(refresh.ok){
                    perfil_json = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/perfil/`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                }

            }
            if(perfil_json.ok){
                const perfil = await perfil_json.json();

                setEmail(perfil.email);
                setNome(perfil.first_name);
                setSobreNome(perfil.last_name);
                setDataNasc(perfil.data_nascimento);
            }
            else{
                console.error('Falha ao buscar perfil');
                console.log('Ao estilizar o site, tenho que adicionar um efeito visual que indique isso.');
            }
        }

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const dados = {
            email,
            first_name: nome,
            last_name: sobrenome,
            data_nascimento: dataNasc
        }

        try{

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

            if (response.ok){
                console.log('Requisição bem sucedida.');
            }else{
                console.error('Erro da API: ', await response.json());
            }

        }catch(error){
            console.error('Falha na requisição: ', error);
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nome">Nome:</label>
                <input type="text" id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)}/>
                <label htmlFor="sobrenome">Sobrenome:</label>
                <input type="text" id="sobrenome" name="sobrenome" value={sobrenome} onChange={(e) => setSobreNome(e.target.value)}/>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <label htmlFor="dataNasc">Data de Nascimento:</label>
                <input type="date" id="dataNasc" name="dataNasc" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)}/>

                <input type="submit" value={'Atualizar Perfil'}/>
            </form>
        </div>
    )
}