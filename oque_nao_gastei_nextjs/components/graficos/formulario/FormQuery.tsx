'use client';

import { useState } from 'react';
import { DadosGrafico } from '@/components/types/grafico';

interface FormGraficoProps {
    tipo: 'entrada' | 'saida';
    onResultado: (dados: DadosGrafico[]) => void;
}

const opcoesMoment = [
    { valor: 'dias', texto: 'Dias' },
    { valor: 'semana', texto: 'Semana' },
    { valor: 'mes', texto: 'Mês' },
    { valor: 'ano', texto: 'Ano' },
];



export default function FormGrafico({ tipo, onResultado }: FormGraficoProps) {
    const [moment, setMoment] = useState('mes');
    const [filtro, setFiltro] = useState('');

    const dados_consulta = {
        filter: filtro.trim() || null,
        moment,
        tipo
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            const csrf_token_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/csrf/`, {
                method: 'GET',
                credentials: 'include',
            });
            const csrf_data = await csrf_token_response.json();
            const csrf_token = csrf_data.csrf_token;

            let response;

            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf_token,
                },
                body: JSON.stringify(dados_consulta),
            });

            if(response.status === 401){
                const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`,{
                    method: 'POST',
                    credentials: 'include'
                });
                console.log('Rota acessada: accounts/api/refresh/; status: ', refresh.status);

                if(refresh.ok){
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrf_token,
                        },
                        body: JSON.stringify(dados_consulta),
                    });
                }
            }

            const dados = await response.json();

            if(!response.ok){
                console.error('Falha ao tentar filtrar os dados do gráfico: ', dados);
            }
            
            onResultado(dados.resultado);

        }catch(error){
            console.error('Falha ao tentar customizar os gráficos: ', error);
        }
    }

    return (
        <form method='POST' onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Filtrar por descrição"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />

            <fieldset>
                <legend>Agrupar por:</legend>

                {opcoesMoment.map((opcao) => (
                    <label key={opcao.valor}>
                        <input
                            type="radio"
                            name="moment"
                            value={opcao.valor}
                            checked={moment === opcao.valor}
                            onChange={(e) => setMoment(e.target.value)}
                        />
                        {opcao.texto}
                    </label>
                ))}
            </fieldset>

            <button type="submit">Aplicar filtros</button>
        </form>
    );
}
