'use client';

interface LogoutButtonPrpos{
    onSuccess: () => void;
}

export default function LogoutButton({onSuccess}: LogoutButtonPrpos){
    const logout = async () => {
        try{
            const logout_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if(logout_response.ok){
                console.log('Logout realizado com sucesso');
                onSuccess();
            }else{
                console.log('Falha ao fazer logout: ', logout_response.json());
            }
        }catch(error){
            console.error('Falha ao fazer logout: ', error);
        }
    };

    return(
        <div>
            <button onClick={logout}>Sair</button>
        </div>
    )
}