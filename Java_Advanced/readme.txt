Parte 1: Documentação do Backend (API Java/Spring Boot)
1.1. Tecnologias Utilizadas (Backend)
O backend do projeto "GS Alerta Desastres" foi construído utilizando um conjunto robusto de tecnologias e frameworks do ecossistema Java:

Java: Linguagem de programação principal.
Spring Boot: Framework principal para criação rápida de aplicações stand-alone e prontas para produção. Ele simplifica a configuração e o desenvolvimento de aplicações Spring.
Spring Web (MVC): Para criação de APIs RESTful (controllers, request mappings, etc.).
Spring Data JPA: Para facilitar a persistência de dados e a interação com o banco de dados relacional, abstraindo grande parte do código boilerplate de JDBC/JPA.
Spring Cache: Para implementação de caching em métodos de serviço, melhorando a performance de consultas frequentes.
Hibernate: Implementação JPA utilizada pelo Spring Data JPA para mapeamento objeto-relacional (ORM) e persistência.
Oracle Database: Sistema de gerenciamento de banco de dados relacional utilizado para armazenar os dados da aplicação (clientes/usuários, endereços, contatos, eventos EONET locais).
MapStruct: Processador de anotações para geração de mappers entre DTOs (Data Transfer Objects) e Entidades JPA, reduzindo código manual de conversão.
Jackson: Biblioteca para serialização e desserialização de objetos Java para JSON (e vice-versa), utilizada extensivamente pelo Spring Web.
Springdoc OpenAPI (Swagger): Para geração automática de documentação interativa da API REST. Facilita a visualização e teste dos endpoints. (Configurado em OpenApiConfig.java e SwaggerBrowserLauncher.java).
RestTemplate / WebClient (Spring): Para realizar chamadas HTTP a APIs externas como ViaCEP, Google Geocoding e NASA EONET.
Slf4j: Fachada de logging, permitindo o uso de diferentes implementações de log (como Logback, que vem com o Spring Boot).
Jakarta Validation (Bean Validation): Para validação de dados de entrada nos DTOs e entidades.
Lombok (Implícito): Embora não explicitamente listado, o uso de anotações como @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor em DTOs e Entidades sugere fortemente o uso do Lombok para reduzir código boilerplate.
Maven ou Gradle (Implícito): Ferramenta de build e gerenciamento de dependências do projeto Java.
1.2. Endpoints da API (Visão Geral)
A API RESTful do backend fornece diversos endpoints para gerenciar as entidades do sistema e interagir com serviços externos. A documentação interativa e mais detalhada de cada endpoint (incluindo todos os parâmetros, corpos de requisição/resposta e códigos de status) está disponível através do Swagger UI, geralmente acessível em /swagger-ui.html quando a aplicação backend está rodando.

Abaixo, uma visão geral dos controllers e suas responsabilidades:

1. ClienteController (/api/clientes)

Responsável pelo gerenciamento de dados de clientes/usuários.
Principais Endpoints:
GET /api/clientes: Lista todos os clientes de forma paginada.
GET /api/clientes/{id}: Busca um cliente pelo ID.
GET /api/clientes/documento/{documento}: Busca um cliente pelo CPF/CNPJ.
POST /api/clientes: Cria um novo cliente. Requer um ClienteRequestDTO no corpo.
PUT /api/clientes/{id}: Atualiza um cliente existente. Requer um ClienteRequestDTO.
DELETE /api/clientes/{id}: Deleta um cliente.
GET /api/clientes/pesquisar?termo={termo}: Pesquisa clientes por nome ou sobrenome.
2. ContatoController (/api/contatos)

Responsável pelo gerenciamento dos dados de contato dos clientes.
Principais Endpoints:
GET /api/contatos: Lista todos os contatos de forma paginada.
GET /api/contatos/{id}: Busca um contato pelo ID.
GET /api/contatos/email/{email}: Busca um contato pelo email.
POST /api/contatos: Cria um novo contato. Requer um ContatoRequestDTO.
PUT /api/contatos/{id}: Atualiza um contato existente. Requer um ContatoRequestDTO.
DELETE /api/contatos/{id}: Deleta um contato.
3. EnderecoController (/api/enderecos)

Responsável pelo gerenciamento dos dados de endereço dos clientes e serviços de geolocalização.
Principais Endpoints:
GET /api/enderecos: Lista todos os endereços de forma paginada.
GET /api/enderecos/{id}: Busca um endereço pelo ID.
POST /api/enderecos: Cria um novo endereço. Requer um EnderecoRequestDTO.
PUT /api/enderecos/{id}: Atualiza um endereço existente. Requer um EnderecoRequestDTO.
DELETE /api/enderecos/{id}: Deleta um endereço.
GET /api/enderecos/consultar-cep/{cep}: Consulta dados de endereço a partir de um CEP (ViaCEP).
POST /api/enderecos/calcular-coordenadas: Calcula latitude e longitude para um endereço (usando Google Geocoding). Requer EnderecoGeoRequestDTO.
4. EonetController (/api/eonet)

Responsável pelo gerenciamento de eventos da NASA EONET, tanto os armazenados localmente quanto a interação com a API da NASA.
Principais Endpoints:
GET /api/eonet: Lista todos os eventos EONET armazenados localmente de forma paginada.
GET /api/eonet/{idInterno}: Busca um evento EONET local pelo seu ID interno.
GET /api/eonet/api-id/{eonetApiId}: Busca um evento EONET local pelo ID da API da NASA.
POST /api/eonet: Salva manualmente um novo evento EONET localmente. Requer EonetRequestDTO.
PUT /api/eonet/{idInterno}: Atualiza um evento EONET local. Requer EonetRequestDTO.
DELETE /api/eonet/{idInterno}: Deleta um evento EONET local.
GET /api/eonet/por-data?dataInicial=...&dataFinal=...: Busca eventos locais por intervalo de datas.
POST /api/eonet/nasa/sincronizar: Busca novos eventos da API da NASA e os persiste/atualiza localmente. Aceita parâmetros como limit, days, status, source.
GET /api/eonet/nasa/proximos: Busca eventos diretamente da API EONET da NASA. Permite busca por:
Proximidade geográfica (latitude, longitude, raioKm).
Intervalo de datas (startDate, endDate).
Filtros gerais (limit, days, status, source).
5. StatsController (/api/stats)

Responsável por fornecer dados estatísticos sobre os eventos de desastres.
Principais Endpoints:
GET /api/stats/eonet/count-by-category?days={dias}: Obtém a contagem de eventos EONET locais por categoria para um determinado período em dias.
Parte 2: Documentação da Navegação do Frontend (Next.js)
2.1. Tecnologias Utilizadas (Frontend)
O frontend foi desenvolvido com as seguintes tecnologias e bibliotecas:

Next.js: Framework React para desenvolvimento de aplicações web modernas, com funcionalidades como renderização do lado do servidor (SSR), geração de sites estáticos (SSG), e roteamento baseado em sistema de arquivos.
App Router: O novo sistema de roteamento do Next.js (usado em src/app) que permite layouts aninhados, server components, e outras funcionalidades avançadas.
React: Biblioteca JavaScript para construção de interfaces de usuário.
TypeScript: Superset do JavaScript que adiciona tipagem estática, melhorando a manutenibilidade e a detecção de erros em tempo de desenvolvimento.
CSS (Puro / Módulos): Para estilização dos componentes (globals.css e estilos inline/componentizados).
Leaflet: Biblioteca JavaScript open-source para mapas interativos. Usada para exibir eventos EONET em mapas. (Componentes LeafletMap.tsx e EonetEventMap.tsx).
Chart.js: Biblioteca para criação de gráficos. Usada na página de estatísticas para visualizar dados de desastres.
Material Icons: Biblioteca de ícones do Google, utilizada para melhorar a interface visual dos botões e links.
2.2. Estrutura de Navegação e Uso
A navegação no frontend do "GS Alerta Desastres" é gerenciada pelo App Router do Next.js e por componentes de layout específicos.

Estrutura de Roteamento (App Router):
O Next.js utiliza o sistema de arquivos dentro da pasta src/app para definir as rotas da aplicação. Cada pasta representa um segmento da URL, e um arquivo page.tsx dentro de uma pasta define o conteúdo a ser renderizado para aquela rota.

src/app/page.tsx: Página inicial da aplicação (/).
src/app/clientes/page.tsx (se existisse, seria /clientes): Atualmente, a rota base /clientes redireciona ou é coberta pelo layout.tsx e a página de listagem.
src/app/clientes/listar/page.tsx: Página para listar usuários (/clientes/listar).
src/app/clientes/cadastrar/page.tsx: Página para cadastrar novos usuários (/clientes/cadastrar).
src/app/clientes/[id]/page.tsx: Página para ver detalhes de um usuário específico (/clientes/123).
src/app/clientes/alterar/[id]/page.tsx: Página para alterar um usuário (/clientes/alterar/123).
... e assim por diante para buscar e deletar.
src/app/desastres/page.tsx: Painel principal da seção de desastres EONET (/desastres).
src/app/desastres/mapa/page.tsx: Mapa de eventos EONET armazenados localmente (/desastres/mapa).
src/app/desastres/mapa-atuais/page.tsx: Mapa de eventos atuais/por data buscados da API da NASA (/desastres/mapa-atuais).
src/app/desastres/estatisticas/page.tsx: Página de estatísticas de desastres (/desastres/estatisticas).
src/app/contato/page.tsx: Página de contato da equipe (/contato).
Layouts de Navegação:

Layout Raiz (src/app/layout.tsx):

Define a estrutura HTML base para todas as páginas (tags <html>, <head>, <body>).
Contém a barra de navegação principal (navbar), que é persistente em toda a aplicação.
Links na navbar principal:
Logo "GS Alerta Desastres": Leva para a Home (/).
Home: Leva para a Home (/).
Usuários (anteriormente Clientes): Leva para a listagem de usuários (/clientes/listar).
Desastres EONET: Leva para o painel de desastres (/desastres).
Fale Conosco: Leva para a página de contato (/contato).
Layout da Seção Usuários (src/app/clientes/layout.tsx):

Envolve todas as páginas dentro de /clientes/*.
Fornece uma sub-navegação específica para a gerência de usuários.
Links na sub-navegação:
Listar Usuários: Para /clientes/listar.
Cadastrar Usuário: Para /clientes/cadastrar.
Buscar Usuário: Para /clientes/buscar.
Layout da Seção Desastres (src/app/desastres/layout.tsx):

Envolve todas as páginas dentro de /desastres/*.
Fornece uma sub-navegação para as funcionalidades relacionadas a desastres.
Links na sub-navegação:
Painel EONET: Para /desastres.
Mapa de Eventos (Locais): Para /desastres/mapa.
Mapa Atuais (NASA): Para /desastres/mapa-atuais.
Estatísticas: Para /desastres/estatisticas.
Layout da Página de Contato (src/app/contato/layout.tsx):

Pode ser usado para aplicar estilos ou estruturas específicas apenas para a página de contato, como a importação de CSS do Leaflet (se apenas usado lá).
Componente <Link>:
A navegação entre as páginas do frontend é realizada utilizando o componente <Link> importado de next/link. Este componente habilita a navegação do lado do cliente (client-side navigation), o que significa que a transição entre páginas é rápida e não requer um recarregamento completo da página, melhorando a experiência do usuário.

Como Usar a Navegação:

Página Inicial (/):

Apresenta uma visão geral do projeto e links rápidos para as principais seções (Cards de Funcionalidades).
Contém links para o repositório GitHub do projeto e para a página da Global Solution FIAP.
Barra de Navegação Principal:

Use os links na barra superior para acessar as seções principais: Home, Usuários, Desastres EONET, Fale Conosco.
Seção Usuários (/clientes/...):

Ao clicar em "Usuários" na navbar principal, você é levado para a listagem de usuários.
Utilize a sub-navegação (Listar, Cadastrar, Buscar) para interagir com os dados dos usuários.
Ações como "Ver", "Editar", "Deletar" estão disponíveis na lista para cada usuário.
Seção Desastres EONET (/desastres/...):

Ao clicar em "Desastres EONET" na navbar principal, você acessa o painel de desastres.
A sub-navegação permite:
Painel EONET: Listar eventos locais, sincronizar com a NASA, buscar eventos próximos na API da NASA.
Mapa de Eventos (Locais): Visualizar eventos do banco de dados local em um mapa.
Mapa Atuais (NASA): Buscar e visualizar eventos recentes ou por data diretamente da API da NASA em um mapa.
Estatísticas: Ver gráficos (barras, pizza) sobre a contagem de eventos por categoria, com filtro de período.
Página Fale Conosco (/contato):

Mostra informações sobre a equipe de desenvolvimento, um formulário de contato (simulado) e um mapa com a localização da FIAP Paulista.