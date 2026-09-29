'use client';

import SobreProjeto from "../SobreProjeto";

interface PaginaDeslogadaProps{
    onAbrirLogin: () => void;
    onAbrirCadastro: () => void;
}

export default function PaginaDeslogada({onAbrirCadastro, onAbrirLogin}: PaginaDeslogadaProps){
    return(
        <div>
            <button onClick={onAbrirLogin}>Fazer Login</button>

            <button onClick={onAbrirCadastro}>Criar Conta</button>

            <SobreProjeto/>
        </div>        
    )
}