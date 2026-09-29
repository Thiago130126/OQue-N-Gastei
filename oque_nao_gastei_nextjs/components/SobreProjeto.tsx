export default function SobreProjeto(){

    return(
        <div>
            <h1>Sobre</h1>
            <p>
                    O Que Não Gastei? É o meu primeiro projeto de 'grande porte', eu já havia feito aplicações web antes, mas sempre só uma stack, mas dessa vez, não.
                O Que Não Gastei é um site de gestão de gastos, onde os usuário importam seus extratos como csv, e o site, gera gráficos do segus gastos e ganhos,
                podendo escolher de quanto tempo atrás são os dados, qual o período para agrupar, por exemplo, ver os gastos agrupados por meses, filtrar por palavras,
                por exemplo, quero ver todos os meus gastos com 'Amazon', isso é possível.
                    Esse site é uma inspiração, cópia, paródia, ou seja lá como queira chamar do site <a href="https://www.oquegastei.com/" target="_blank">O Que Gastei?</a>, 
                criado por um criador de conteúdo do youtube e também programador. Mas esse cara, ele criou o dele, usando o Gemini para processar os extratos bancários.
                E eu não gostei muito dessa abordagem, primeiro, porque 'O Que Gastei?', não passa de um frontend alternativo para a API do Gemini, então fica aquela dúvida,
                se o site dele é o Gemini por traz dos panos, porque não ir direto no gemini? Se o usuário já paga o Gemini, porque ele também deveria pagar pelo site que usa
                o Gemini? São boas pergunta a serem feitas. Então eu resolvi fazer esse site também, mas sem LLM, apenas puro código.
                
                    Tecnologias:
                Sobre as tecnologias do site, o backend foi feito em Django, Python, a API, feita com DRF (Django Rest Framework), o frontend foi feito com NextJS, 
                TypeScript, React, o banco de dados é o PostgreSQL, para cache no backend, foi usado o Redis, para processar os extratos, foi usado o Pandas e para
                gerar os gráficos, foi usado o Nivo.

                    Objetivo:
                O objetivo de fazer esse site, e não usar LLM, é adquirir experiência com criação de APIs, gerenciamento de tokens, pandas, cache, react, next,
                colocar projetos em produção, iteração, e claro, programação web em geral.

                    Conclusão:
                Foi muito legal e interessante criar esse pequeno projeto de uma única página, aprendi muito, sobre segurança da informação em aplicações web,
                sobre as tecnologias que usei e consegui aprendizados para fazer projetos melhores no futuro.
            </p>
        </div>
    )
}