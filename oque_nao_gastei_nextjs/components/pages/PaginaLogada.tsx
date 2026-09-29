'use client';
import styles from './PaginaLogada.module.css';

import { useState, useEffect } from "react";
import MolduraGrafico from "../graficos/moldura/MolduraGrafico";
import LogoutButton from "../LogoutButton";
import { DadosGrafico } from "../types/grafico";
import { refresh_Token } from "../validators/Refresher";

//icons
import { TiChartPie } from "react-icons/ti";
import { TiChartBar } from "react-icons/ti";
import { TiChartLine } from "react-icons/ti";

import { TiBrush } from "react-icons/ti"; // pincel icon
import Link from 'next/link';

interface PaginaLogadaProps{
    onAbrirPerfil: () => void;
    onAbrirUpload: () => void;
    onAbrirSobre: () => void;
    nome: string;
    onLogoutSuccess: () => void;
}


export default function PaginaLogada({onAbrirPerfil, onAbrirUpload, onAbrirSobre, nome, onLogoutSuccess}: PaginaLogadaProps){

    const [modoCustomizacao, setModoCustomizacao] = useState(false);

    const [tipoGrafico, setTipoGrafico] = useState<'bar' | 'line' | 'pie' | 'sem_dados'>('bar');

    const [corEntrada, setCorEntrada] = useState('#30ed03');
    const [corGastos, setCorGastos] = useState('#dd1712');

    const [dadosEntradas, setDadosEntradas] = useState<DadosGrafico[]>([]);
    const [dadosGastos, setDadosGastos] = useState<DadosGrafico[]>([]);

    useEffect(() => {
        async function fetchData(){
            try{
                let response;
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.status === 401){
                    const refresh = await refresh_Token();

                    if(refresh.ok){
                        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/gerar-graficos/`, {
                            method: 'GET',
                            credentials: 'include',
                        });
                    }
                }

                try{

                    const dados = await response.json();

                    setDadosGastos(dados.gastos);
                    setDadosEntradas(dados.entradas);

                    const cor_entrada = localStorage.getItem('corEntradaLS');
                    if (cor_entrada !== null){
                        setCorEntrada(cor_entrada);
                    }
                    const cor_gastos = localStorage.getItem('corGastosLS');
                    if(cor_gastos !== null){
                        setCorGastos(cor_gastos);
                    }


                    if (dados.gastos.length === 0 && dados.entradas.length === 0){
                        setTipoGrafico('sem_dados');
                        console.log(tipoGrafico);
                    }

                }catch(error){
                    console.error('Falha na página principal logada, ao buscar os registros do usuário: ', error);
                }
            }catch(error){
                setTipoGrafico('sem_dados');
                console.log(tipoGrafico);
                console.log(error);
            }
        }

        fetchData();
    }, []);

    return (
        <div>
            <header className={styles.header}>
                <div className={styles.logo_area}>
                    <Link href='/'>
                        <img className={styles.logo} src="/logo3.png" alt="Logo" />
                    </Link>
                </div>
                <div className={styles.opcoes_usuario}>

                    <div className={styles.saudacoes_header}>
                        <h2>
                            <button onClick={onAbrirPerfil} className={styles.botaoPerfil}>Olá {nome}</button>
                        </h2>
                    </div>

                    <div className={styles.botoes_header} >
                        <button onClick={onAbrirSobre}>Sobre</button>
                        <LogoutButton onSuccess={onLogoutSuccess}/>
                        <button onClick={() => {setModoCustomizacao(!modoCustomizacao)}}><TiBrush /></button>
                    </div>

                </div>
            </header>

            <div>
                <button onClick={onAbrirUpload}>Fazer upload de CSV</button>
            </div>

            {modoCustomizacao && (
                <div className={styles.modo_customizacao}>
                    <label>
                        Cor das Entradas
                        <input type="color" value={corEntrada} onChange={(e) => {setCorEntrada(e.target.value); localStorage.setItem('corEntradaLS', e.target.value)}}/>
                    </label>
                    <label>
                        Cor dos gastos
                        <input type="color" value={corGastos} onChange={(e) => {setCorGastos(e.target.value); localStorage.setItem('corGastosLS', e.target.value)}}/>
                    </label>
                    <label>
                        <button onClick={() => {setCorEntrada('#30ed03'); setCorGastos('#dd1712')
                            localStorage.setItem('corEntradaLS', '#30ed03'); localStorage.setItem('corGastosLS', '#dd1712')
                        }}>Definir cores padrões</button>
                    </label>
                </div>
            )}

            <div className={styles.tipos_graficos}>
                <button type="button" aria-pressed={tipoGrafico === 'bar'} onClick={() => setTipoGrafico('bar')}>
                    <TiChartBar/>
                </button>

                <button type="button" aria-pressed={tipoGrafico === 'line'} onClick={() => setTipoGrafico('line')}>
                    <TiChartLine/>
                </button>

                <button type="button" aria-pressed={tipoGrafico === 'pie'} onClick={() => setTipoGrafico('pie')}>
                    <TiChartPie />
                </button>
            </div>

            <div className={styles.area_graficos}>
                <MolduraGrafico dados={dadosEntradas} titulo="Entradas" cor={corEntrada} tipoGrafico={tipoGrafico} tipo={'entrada'}/>

                <MolduraGrafico dados={dadosGastos} titulo="Gastos" cor={corGastos} tipoGrafico={tipoGrafico} tipo={'saida'}/>
            </div>
        </div>
    );
}