export async function refresh_Token(): Promise<Response>{
    const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/api/refresh/`, {
        method: 'POST',
        credentials: 'include'
    });
    console.log('Rota acessada: accounts/api/refresh/; status: ', refresh.status);

    return refresh;
}