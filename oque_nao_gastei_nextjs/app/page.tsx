'use client';

import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import Modal from "@/components/Modal";
import React, { useState, useEffect } from "react";
import ProfileForm from "@/components/ProfileForm";
import UploadForm from "@/components/UploadForm";
import SobreProjeto from "@/components/SobreProjeto";
import PaginaDeslogada from "@/components/pages/PaginaDeslogada";
import PaginaLogada from "@/components/pages/PaginaLogada";
import PaginaLoading from "@/components/pages/PaginaLoading";

type ModalTipo = 'login' | 'cadastro' | 'upload' | 'perfil' | 'sobre' | null;

export default function HomePage(){
    const [modalAtivo, setModalAtivo] = useState<ModalTipo>(null);

    const [statusPagina, setStatusPagina] = useState<'loading' | 'logado' | 'deslogado'>('loading');
    const [nome, setNome] = useState('');

    const renderConteudoModal = () => {
        switch (modalAtivo) {
            case 'login':
                return <LoginForm onSuccess={(primeiro_nome) =>{ setModalAtivo(null); setStatusPagina('logado'); setNome(primeiro_nome);}}/>;
            case 'cadastro':
                return <RegisterForm onSuccess={(primeiro_nome) => {setModalAtivo(null); setStatusPagina('logado'); setNome(primeiro_nome);}}/>;
            case 'upload':
                return <UploadForm onSuccess={() => setModalAtivo(null)}/>;
            case 'perfil':
                return <ProfileForm onSuccess={() => setModalAtivo(null)}/>;
            case 'sobre':
                return <SobreProjeto/>;
            default:
                return null;
        }
    };

    useEffect(() => {
        async function fetchData(){
            let perfil_json;

            setStatusPagina('loading');
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

                setStatusPagina('logado');
                setNome(perfil.first_name);
            }
            else{
                setStatusPagina('deslogado');
                console.log('Falha ao buscar perfil');
            }
        }

        fetchData();
    }, []);

    let pagina: React.ReactNode;

    if (statusPagina === 'deslogado'){
        pagina = <PaginaDeslogada onAbrirLogin={() => setModalAtivo('login')} onAbrirCadastro={() => setModalAtivo('cadastro')}/>
    }else if (statusPagina === 'logado'){
        pagina = <PaginaLogada 
            nome={nome} 
            onAbrirPerfil={() => setModalAtivo('perfil')} 
            onAbrirSobre={() => setModalAtivo('sobre')}
            onAbrirUpload={() => setModalAtivo('upload')}
            onLogoutSuccess={() => {setNome(''); setStatusPagina('deslogado')}}
            />
    }else if (statusPagina === 'loading'){
        pagina = <PaginaLoading/>
    }
    

    return(
        <div>

            {pagina}

            {modalAtivo && (
                <Modal isOpen={true} onClose={() => setModalAtivo(null)}>
                    {renderConteudoModal()}
                </Modal>
            )}
        </div>
    )
}