'use client';
import React, { useState } from "react"

interface RegisterFormProps{
    onSuccess: (primeiro_nome: string) => void;
}

export default function RegisterForm({onSuccess}: RegisterFormProps){

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (senha !== confirmPassword){
            console.error('Senha e Confirmação de senha não coincidem'); // adicionar futuramente, uma indicação mais visual de que está errado
            return;
        }

        const dados = {
            email,
            password: senha,
            confirmPassword,
            first_name: firstName,
            last_name: lastName,
            data_nascimento: dataNascimento
        }

        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            });

            if (response.ok){
                const response_data = await response.json();
                const first_name = response_data.first_name;

                onSuccess(first_name);
            }else{
                const erro = await response.json();
                console.error(erro);
            }
        }catch(error){
            console.error('Falha na requisição: ', error);
        }
    }

    return(
        <div>
            <h1>Criar Conta</h1>

            <div>
                <form method="POST" onSubmit={handleSubmit}>
                    <label htmlFor="first_name_id">Nome:</label>
                    <input type="text" name="first_name" placeholder="ex: João" id="first_name_id" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                    <label htmlFor="last_name_id">Sobrenome:</label>
                    <input type="text" placeholder="Da silva" name="last_name" id="last_name_id" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                    <label htmlFor="email_id">Email:</label>
                    <input type="email" required placeholder="email_exemplo@gmail.com" name="email" id="email_id" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <label htmlFor="data_nascimento_id">Data de Nascimento:</label>
                    <input type="date" name="data_nascimento" id="data_nascimento_id" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)}/>
                    <label htmlFor="password_id">Senha:</label>
                    <input type="password" name="password" required id="password_id" value={senha} onChange={(e) => setSenha(e.target.value)}/>
                    <label htmlFor="confirmPassword_id">Confirme sua senha:</label>
                    <input type="password" name="confirmPassword" id="confirmPassword_id" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <input type="submit" value={'Criar Conta'}/>
                </form>
            </div>
        </div>
    )
}