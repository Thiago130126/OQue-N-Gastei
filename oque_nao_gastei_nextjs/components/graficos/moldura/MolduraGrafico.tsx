'use client';

import GraficoBarras from "../GraficosBarras";
import { DadosGrafico } from '@/components/types/grafico';
import GraficoLine from "../GraficoLine";
import GraficoPie from "../GraficoPie";
import FormGrafico from "../formulario/FormQuery";
import { useState, useEffect } from "react";


interface MolduraGraficoProps{
    titulo: string;
    dados: DadosGrafico[];
    cor: string;
    tipo: 'entrada' | 'saida';
    tipoGrafico: 'bar' | 'line' | 'pie' | 'sem_dados';
}

export default function MolduraGrafico({titulo, dados, cor, tipoGrafico, tipo}: MolduraGraficoProps){
    let grafico;

    const [dadosAtuais, setDadosAtuais] = useState<DadosGrafico[]>(dados);

    useEffect(() => {
        setDadosAtuais(dados);
    }, [dados]);

    if (tipoGrafico === 'line'){
        grafico = <GraficoLine dados={dadosAtuais} cor={cor}/>
    }else if (tipoGrafico === 'pie'){
        grafico = <GraficoPie dados={dadosAtuais} cor={cor}/>
    }else if (tipoGrafico === 'bar'){
        grafico = <GraficoBarras dados={dadosAtuais} cor={cor}/>
    }else if(tipoGrafico === 'sem_dados'){
        grafico = <h2>Não há nenhum extrato bancário salvo ainda.</h2>
    }

    return(
        <div>
            <h2>{titulo}</h2>
            {grafico}
            <FormGrafico tipo={tipo} onResultado={setDadosAtuais}/>
        </div>
    );
}