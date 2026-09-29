'use client';
import { ResponsiveBar } from "@nivo/bar";
import { DadosGrafico } from "../types/grafico";

interface GraficoBarrasProps {
    dados: DadosGrafico[];
    cor: string;
}

export default function GraficoBarras({dados, cor}: GraficoBarrasProps){
    return(
        <div style={{ height: '300px' }}> 
            <ResponsiveBar data={dados} keys={['valor']} indexBy={'periodo'} margin={{ top: 20, right: 20, bottom: 60, left: 70 }} 
            padding={0.3} layout="vertical" colors={cor} enableLabel={false} 
            />
        </div>
    );
}