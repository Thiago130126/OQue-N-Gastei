'use client';

import { useState } from "react";
import { refresh_Token } from "./validators/Refresher";

interface UploadFormProps{
    onSuccess: () => void;
}

export default function UploadForm({onSuccess}: UploadFormProps){

    const [arquivo, setArquivo] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected_file = e.target.files?.[0] ?? null;
        setArquivo(selected_file);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!arquivo){
            console.error('Nenhum arquivo selecionado');
            return;
        }

        const formData = new FormData();
        formData.append('arquivo_csv', arquivo);

        try{
            const csrf_token_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/csrf/`, {
                method: 'GET',
                credentials: 'include'
            });
            const csrf_data = await csrf_token_response.json();
            const csrf_token = csrf_data.csrf_token;

            let response;

            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/upload/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrf_token,
                },
                credentials: 'include',
                body: formData
            });

            if(response.status === 401){

                const refresh = await refresh_Token();
                
                if(refresh.ok){
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extratos/api/upload/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrf_token,
                        },
                        credentials: 'include',
                        body: formData
                    });
                }
            }

            if (response.ok){
                onSuccess();
            }else {
                const erro = await response.json();
                console.error('Falha no upload:', erro);
            }
        }catch(error){
            console.error('Erro na requisição:', error);
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".csv" onChange={handleFileChange}/>
                <input type="submit" value={'Enviar Arquivo'}/>
            </form>
        </div>
    )
}