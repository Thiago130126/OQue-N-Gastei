type Verbo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

class Api{
    rota_base: string;
    rota_refresh: string;
    rota_csrf: string;

    private defaultCredencials: RequestCredentials = 'include';

    constructor(rota_base: string, rota_refresh: string, rota_csrf: string){
        this.rota_base = rota_base;
        this.rota_refresh = rota_refresh;
        this.rota_csrf = rota_csrf;
    }

    private async Request(OpcesFetch: RequestInit, rota: string){
        const req = await fetch(
            this.rota_base + rota, {
                ...OpcesFetch,
            }
        );
        return req;
    }

    private async CSRFInterceptor(OpcesFetch: RequestInit, rota: string, csrf: boolean){
        let req;
        if((OpcesFetch.method ?? 'GET').toUpperCase() !== 'GET' && csrf){

            const Opcoes_CSRF_Fetch: RequestInit = {
                method: 'GET',
                credentials: 'include',
            };
            const csrf_response = await this.Request(Opcoes_CSRF_Fetch, this.rota_csrf);

            if(!csrf_response.ok){
                throw new Error(`Falha ao obter o csrf Token: ${csrf_response.status}`);
            }

            const csrf_data = await csrf_response.json();

            if(!csrf_data?.csrf_token){
                throw new Error('CSRF  token ausente na resposta');
            }

            const csrf_token = csrf_data.csrf_token;

            const headers = new Headers(OpcesFetch.headers);
            headers.set('X-CSRFToken', csrf_token);

            const opcesCSRF: RequestInit = {
                ...OpcesFetch,
                headers,
            };

            req = await this.Request(opcesCSRF, rota);

        }else{
            req = await this.Request(OpcesFetch, rota);
        }
        return req;
    }

    private async RequestManager(OpcesFetch: RequestInit, rota: string, csrf: boolean = true){
        try{
            let request;

            request = await this.CSRFInterceptor(OpcesFetch, rota, csrf);

            if(request.status === 401){
                const OpcesRefreshFetch: RequestInit = {
                    method: 'POST',
                    credentials: 'include',
                };
                const refresh = await this.CSRFInterceptor(OpcesRefreshFetch, this.rota_refresh, csrf);

                if(refresh.ok){
                    request = await this.CSRFInterceptor(OpcesFetch, rota, csrf);
                }
            }

            return request;
        }catch(error){
            console.error('Falha em RequestManager: ', error);
            throw error;
        }

    }

    private async Request_factory(
        method: Verbo,
        rota: string,
        OpcesFetch: RequestInit = {},
        csrf: boolean = true,
    ){
        const opcoes: RequestInit = {
            ...OpcesFetch,
            method: method,
            credentials: OpcesFetch.credentials ?? this.defaultCredencials,
        };
        const req = await this.RequestManager(opcoes, rota, csrf);

        return req;
    }

    async get(rota: string, OpcesFetch: RequestInit = {}){
        return this.Request_factory('GET', rota, OpcesFetch);
    }

    async post(rota: string, OpcesFetch: RequestInit = {}, csrf: boolean = true){
        return this.Request_factory('POST', rota, OpcesFetch, csrf);
    }

    async put(rota: string, OpcesFetch: RequestInit = {}, csrf: boolean = true){
        return this.Request_factory('PUT', rota, OpcesFetch, csrf);
    }

    async patch(rota: string, OpcesFetch: RequestInit = {}, csrf: boolean = true){
        return this.Request_factory('PATCH', rota, OpcesFetch, csrf);
    }

    async delete(rota: string, OpcesFetch: RequestInit = {}, csrf: boolean = true){
        return this.Request_factory('DELETE', rota, OpcesFetch, csrf);
    }
}

// O design desse código é oseguinte:
// A rota base do site, rota de refresh e rota do token csrf são atributos da classe, definidos no método construtor
// Desse jeito, o programador só precisa definir eles uma vez, que é na instancialização da classe usando variáveis de ambiente para conter essas rotas
// Os métodos que o projeto vai usar são get, post, put, patch e delete.
// Todos esses métodos chamam Request_factory que montará o objeto RequestInit e chamará RequestManager
// RequestManager fica responsável por chamar o método CSRFInterceptor e lidar com o erro 401, fazendo um retry da requisição, acessando a rota de refresh
// CSRFInterceptor fica responsável por verificar se o método é seguro e se a proteção de csrfToken está ativa, se não for e a proteção estiver ativa,
// Esse método chamará Request passando a rota do csrfToken, e depois chamará Request para acessar a rota protegida
// Por fim Request, é o método responsável por realizar o fetch.
// Esse código é uma grande matrioska, a maior matrioska é Request_factory, depois RequestManager e vai até chegar na menor matrioska, a mais interna, Request.