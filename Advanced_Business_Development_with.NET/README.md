
# 📄 Documentação do Projeto: GS Alerta Desastres (Equipe MetaMind)

## Nosso projeto online em VPS Hostimger: http://31.97.64.208/

<p align="center">
  <a href="https://www.youtube.com/watch?v=Ad20_tE9ccU" target="_blank">
    <img src="https://img.shields.io/badge/Nossa%20Apresentação-%20%E2%96%B6%EF%B8%8F-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Vídeo de Apresentação">
  </a>
</p>

Bem-vindo à documentação oficial do projeto **GS Alerta Desastres**. Este sistema foi desenvolvido como parte da Global Solution FIAP 2025/1 pela Equipe MetaMind e visa fornecer uma solução tecnológica para monitorar eventos de desastres naturais, fornecer informações cruciais e permitir o disparo de alertas.

[![.NET](https://img.shields.io/badge/.NET-8.0-blueviolet?style=for-the-badge&logo=.net)](https://dotnet.microsoft.com/download/dotnet/8.0)
[![Next.js](https://img.shields.io/badge/Next-js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![OracleDB](https://img.shields.io/badge/Oracle-DB-red?style=for-the-badge&logo=oracle)](https://www.oracle.com/database/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger)](https://swagger.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-JS-1EB300?style=for-the-badge&logo=leaflet)](https://leafletjs.com/)
[![Chart.js](https://img.shields.io/badge/Chart-js-FF6384?style=for-the-badge&logo=chart.js)](https://www.chartjs.org/)

---

## 🧭 Menu de Navegação

- [📄 Documentação do Projeto: GS Alerta Desastres (Equipe MetaMind)](#-documentação-do-projeto-gs-alerta-desastres-equipe-metamind)
  - [🧭 Menu de Navegação](#-menu-de-navegação)
  - [🌟 Introdução](#-introdução)
  - [🏗️ Arquitetura Geral](#️-arquitetura-geral)
  - [🖥️ Backend (API .NET C#)](#️-backend-api-net-c)
    - [Estrutura do Projeto Backend](#estrutura-do-projeto-backend)
    - [Configuração Principal (`Program.cs`)](#configuração-principal-programcs)
    - [Endpoints da API (Controladores)](#endpoints-da-api-controladores)
      - [`ClientesController`](#clientescontroller)
      - [`ContatosController`](#contatoscontroller)
      - [`EnderecosController`](#enderecoscontroller)
      - [`EonetController`](#eonetcontroller)
      - [`StatsController`](#statscontroller)
      - [`AlertsController`](#alertscontroller)
    - [Modelo de Dados (Entidades)](#modelo-de-dados-entidades)
    - [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
    - [Serviços (Backend)](#serviços-backend)
    - [Tratamento de Exceções](#tratamento-de-exceções)
    - [Documentação da API (Swagger)](#documentação-da-api-swagger)
  - [⚛️ Frontend (Next.js \& React)](#️-frontend-nextjs--react)
    - [Estrutura do Projeto Frontend](#estrutura-do-projeto-frontend)
    - [Principais Páginas e Funcionalidades (Frontend)](#principais-páginas-e-funcionalidades-frontend)
      - [Página Inicial (`/app/page.tsx`)](#página-inicial-apppagetsx)
      - [Módulo de Usuários (`/app/clientes/`)](#módulo-de-usuários-appclientes)
      - [Módulo de Desastres (`/app/desastres/`)](#módulo-de-desastres-appdesastres)
      - [Página de Contato (`/app/contato/page.tsx`)](#página-de-contato-appcontatopagetsx)
    - [Componentes Reutilizáveis](#componentes-reutilizáveis)
    - [Comunicação com a API](#comunicação-com-a-api)
  - [✨ Considerações Finais](#-considerações-finais)
    - [📂 **Link do Repositório:**  ](#-link-do-repositório-)
  - [🎨 **Tecnologias Utilizadas no Projeto:**](#-tecnologias-utilizadas-no-projeto)

---

## 🌟 Introdução

O projeto "GS Alerta Desastres" da Equipe MetaMind propõe uma solução para monitoramento de eventos de desastres naturais em tempo real, utilizando dados da API EONET (Earth Observatory Natural Event Tracker) da NASA. A plataforma permite o cadastro de usuários (clientes), seus contatos e endereços, e visa, em futuras implementações, o disparo de alertas geolocalizados.

A API .NET, construída com C#, serve como o backend robusto para gerenciar dados, interagir com serviços externos (NASA EONET, ViaCEP, Google Geocoding) e fornecer os endpoints necessários para o frontend.

O frontend, desenvolvido com Next.js e React (usando TypeScript), oferece uma interface intuitiva para que os usuários interajam com o sistema, visualizem informações de desastres em mapas, consultem estatísticas e gerenciem seus dados.

## 🏗️ Arquitetura Geral

O sistema é composto por duas partes principais:

1.  **Backend API:**
    * Tecnologia: .NET 8, C#
    * Banco de Dados: Oracle (interagido via Entity Framework Core)
    * Responsabilidades: Gerenciamento de dados de usuários, contatos, endereços; integração com APIs externas (NASA EONET para eventos de desastres, ViaCEP para consulta de CEPs, Google Geocoding para obtenção de coordenadas); fornecimento de estatísticas; e (futuramente) lógica de alertas.
    * Documentação da API: Swagger (OpenAPI)

2.  **Frontend Web Application:**
    * Tecnologia: Next.js 13+ (App Router), React 18, TypeScript
    * Responsabilidades: Interface do usuário para cadastro e gerenciamento de clientes; visualização de eventos de desastres em mapas interativos (Leaflet); exibição de estatísticas (Chart.js); e interação com a API backend.

O fluxo de dados geralmente ocorre do frontend fazendo requisições HTTP para o backend API, que por sua vez pode consultar o banco de dados ou outros serviços externos antes de retornar uma resposta.

---

## 🖥️ Backend (API .NET C#)

O backend é uma API RESTful desenvolvida em .NET 8 com C#, projetada para ser robusta, escalável e de fácil manutenção.

### Estrutura do Projeto Backend

A estrutura do projeto segue um padrão comum em aplicações .NET, organizada da seguinte forma:

* `gsApi/`
    * `Program.cs`: Ponto de entrada e configuração da aplicação (injeção de dependência, pipeline HTTP, etc.).
    * `Controllers/`: Contém os controladores da API que lidam com as requisições HTTP e orquestram as respostas.
        * `ClientesController.cs`
        * `ContatosController.cs`
        * `EnderecosController.cs`
        * `EonetController.cs`
        * `StatsController.cs`
        * `AlertsController.cs`
        * `WeatherForecastController.cs` (Exemplo padrão, pode ser removido se não usado)
    * `data/`:
        * `AppDbContext.cs`: Contexto do Entity Framework Core para interação com o banco de dados Oracle, define os DbSets e o mapeamento das entidades.
    * `dto/`: Contém os Data Transfer Objects (DTOs) usados para modelar os dados nas requisições e respostas da API.
        * `request/`: DTOs para dados de entrada.
        * `response/`: DTOs para dados de saída.
    * `exceptions/`: Classes de exceções customizadas para tratamento de erros específicos da aplicação.
        * `RecursoNaoEncontradoException.cs`
        * `ServicoIndisponivelException.cs`
        * `ValidacaoException.cs`
    * `middleware/`: Middlewares customizados para o pipeline HTTP.
        * `TratadorGlobalExcecoesMiddleware.cs`: Intercepta e trata exceções globalmente.
    * `model/`: Contém as classes de entidade que representam as tabelas do banco de dados.
        * `Cliente.cs`
        * `Contato.cs`
        * `Endereco.cs`
        * `EonetEvent.cs`
    * `service/`: Contém a lógica de negócios e a interação com serviços externos ou repositórios.
        * `GeoCodingClient.cs`, `IGeoCodingClient.cs` (Integração com Google Geocoding)
        * `NasaEonetClient.cs`, `INasaEonetClient.cs` (Integração com NASA EONET API)
        * `ViaCepClient.cs`, `IViaCepClient.cs` (Integração com ViaCEP API)
        * `SmtpSettings.cs`, `IEmailNotificationService.cs` (Configuração e serviço para envio de e-mails - `EmailNotificationService` dentro de `SmtpSettings.cs`)
    * `Properties/`: Configurações do projeto (ex: `launchSettings.json`).
    * `Swagger/`: Configurações relacionadas ao Swagger.
        * `ExternalDocsDocumentFilter.cs`: Adiciona documentação externa ao Swagger.
    * `appsettings.json`: Arquivo de configuração da aplicação (strings de conexão, URLs de serviços, chaves de API, etc.).

### Configuração Principal (`Program.cs`)

O arquivo `Program.cs` é central para a configuração da aplicação ASP.NET Core. As principais configurações incluem:

1.  **Logging:**
    * Configurado para usar Console, Debug e provedores de `appsettings.json`.
    * Logging detalhado durante o startup para facilitar o diagnóstico.

2.  **CORS (Cross-Origin Resource Sharing):**
    * Uma política chamada `_myAllowSpecificOriginsGsApi` é definida para permitir requisições de origens específicas (ex: `http://localhost:3001`, `http://localhost:3000`), com quaisquer headers e métodos.

3.  **Serviços MVC e API Explorer:**
    * `AddControllers()`: Registra os controladores da API.
    * `AddEndpointsApiExplorer()`: Necessário para a geração do Swagger.

4.  **Banco de Dados (Entity Framework Core):**
    * `AppDbContext` é registrado com `AddDbContext`.
    * A string de conexão `OracleDb` é lida de `appsettings.json`.
    * O provedor Oracle é configurado com `UseOracle()`.
        * `QuerySplittingBehavior.SplitQuery` é usado para otimizar consultas.
    * Logging de comandos do EF Core, queries, conexões, etc., é configurado para `LogLevel.Information`.
    * Em ambiente de desenvolvimento (`IsDevelopment()`), `EnableSensitiveDataLogging()` e `EnableDetailedErrors()` são habilitados.

5.  **Clientes HTTP para Serviços Externos:**
    * `AddHttpClient` é usado para registrar e configurar instâncias de `HttpClient` para:
        * `IViaCepClient` (`ViaCepClient`): BaseURL configurada a partir de `ExternalServices:ViaCep:BaseUrl`.
        * `IGeoCodingClient` (`GeoCodingClient`): Chave de API e URL lidas internamente via `IConfiguration`.
        * `INasaEonetClient` (`NasaEonetClient`): BaseURL configurada a partir de `ExternalServices:NasaEonet:BaseUrl` e um User-Agent customizado.
    * `IEmailNotificationService` (`EmailNotificationService`): Registrado como transiente.

6.  **Swagger (OpenAPI):**
    * `AddSwaggerGen()` configura a geração da documentação da API.
    * Define informações gerais da API (título, versão, descrição, contato da equipe MetaMind, licença).
    * `ExternalDocsDocumentFilter` é adicionado para links externos.
    * Inclusão de comentários XML (gerados a partir do build com `<GenerateDocumentationFile>true</GenerateDocumentationFile>` no `.csproj`) para enriquecer a documentação dos endpoints e modelos.

7.  **Pipeline HTTP:**
    * `UseMiddleware<TratadorGlobalExcecoesMiddleware>()`: Adiciona o middleware de tratamento global de exceções.
    * **Ambiente de Desenvolvimento:**
        * `UseSwagger()`: Habilita o middleware do Swagger.
        * `UseSwaggerUI()`: Habilita a UI do Swagger, configurada para o endpoint `/swagger/v1/swagger.json`.
    * **Ambiente de Produção (não Desenvolvimento):**
        * `UseHsts()`: Adiciona o header HSTS para segurança.
    * `UseHttpsRedirection()`: Redireciona requisições HTTP para HTTPS.
    * `UseRouting()`: Habilita o roteamento.
    * `UseCors(MyAllowSpecificOrigins)`: Aplica a política de CORS definida.
    * `UseAuthorization()`: Habilita a autorização (embora não haja endpoints autenticados explicitamente neste extrato, o middleware está presente).
    * `MapControllers()`: Mapeia os atributos de rota dos controladores para os endpoints.

### Endpoints da API (Controladores)

Os controladores são responsáveis por definir os endpoints da API, receber requisições HTTP, interagir com os serviços e o contexto do banco de dados, e retornar respostas.

#### `ClientesController`
Rota base: `/api/clientes`

* `GET /`: Lista todos os clientes de forma paginada e ordenada.
    * Parâmetros: `pageNumber`, `pageSize`, `sortBy` (nome, documento, idCliente).
* `GET /{id}`: Busca um cliente específico pelo seu ID.
* `GET /{id}/coordenadas-principais`: Busca as coordenadas geográficas (latitude/longitude) do endereço principal de um cliente.
* `GET /documento/{documento}`: Busca um cliente pelo seu Documento (CPF/CNPJ).
* `POST /`: Cria um novo cliente.
    * Payload: `ClienteRequestDto`. Permite associar contatos e endereços existentes via IDs.
* `PUT /{id}`: Atualiza um cliente existente.
    * Payload: `ClienteRequestDto`. Permite alterar dados do cliente e suas associações com contatos/endereços.
* `DELETE /{id}`: Deleta um cliente pelo seu ID.
* `GET /pesquisar`: Pesquisa clientes por nome, sobrenome ou documento.
    * Parâmetros: `termo`, `pageNumber`, `pageSize`, `sortBy`.

#### `ContatosController`
Rota base: `/api/contatos`

* `GET /`: Lista todos os contatos de forma paginada e ordenada.
    * Parâmetros: `pageNumber`, `pageSize`, `sortBy` (email, idContato).
* `GET /{id}`: Busca um contato específico pelo seu ID.
* `GET /email/{email}`: Busca um contato pelo seu endereço de e-mail.
* `POST /`: Cria um novo contato.
    * Payload: `ContatoRequestDto`.
* `PUT /{id}`: Atualiza um contato existente.
    * Payload: `ContatoRequestDto`.
* `DELETE /{id}`: Deleta um contato pelo seu ID.

#### `EnderecosController`
Rota base: `/api/enderecos`

* `GET /`: Lista todos os endereços cadastrados de forma paginada.
    * Parâmetros: `pageNumber`, `pageSize`, `sortBy` (cep, localidade, idEndereco).
* `GET /{id}`: Busca um endereço específico pelo seu ID.
* `GET /consultar-cep/{cep}`: Consulta dados de um endereço a partir de um CEP utilizando o serviço ViaCEP.
* `POST /calcular-coordenadas`: Calcula as coordenadas geográficas (latitude e longitude) para um endereço usando o serviço Google Geocoding.
    * Payload: `EnderecoGeoRequestDto`.
* `POST /`: Cria um novo endereço. Requer que latitude e longitude sejam fornecidas.
    * Payload: `EnderecoRequestDto`.
* `PUT /{id}`: Atualiza um endereço existente.
    * Payload: `EnderecoRequestDto`.
* `DELETE /{id}`: Deleta um endereço pelo seu ID.

#### `EonetController`
Rota base: `/api/eonet`

* `GET /`: Lista todos os eventos EONET armazenados localmente, de forma paginada.
    * Parâmetros: `pageNumber`, `pageSize`, `sortBy` (data, eonetIdApi), `sortDirection`.
* `GET /{idInterno}`: Busca um evento EONET armazenado localmente pelo seu ID interno no banco de dados.
* `GET /api-id/{eonetApiId}`: Busca um evento EONET armazenado localmente pelo ID da API da NASA.
* `POST /`: Salva manualmente um novo evento EONET no banco de dados local.
    * Payload: `EonetRequestDto`.
* `PUT /{idInterno}`: Atualiza manualmente um evento EONET existente no banco de dados local.
    * Payload: `EonetRequestDto`.
* `DELETE /{idInterno}`: Deleta um evento EONET do banco de dados local pelo seu ID interno.
* `GET /por-data`: Busca eventos EONET armazenados localmente dentro de um intervalo de datas (`dataInicialOffset`, `dataFinalOffset`).
* `POST /nasa/sincronizar`: Busca novos eventos da API da NASA EONET e os persiste/atualiza localmente no banco de dados.
    * Parâmetros: `limit`, `days`, `status`, `source`.
* `GET /nasa/proximos`: Busca eventos diretamente da API EONET da NASA com base em vários filtros, incluindo geográficos (latitude, longitude, raioKm - embora a API EONET v3 espere BBOX, o backend pode precisar calcular isso), datas, status, etc.

#### `StatsController`
Rota base: `/api/stats`

* `GET /eonet/count-by-category`: Obtém a contagem de eventos EONET locais por categoria para um determinado período em dias.
    * Parâmetro: `days` (padrão: 365).
    * Este endpoint lê os eventos `EonetEvent` do banco, parseia o JSON armazenado (que deve ser compatível com `NasaEonetEventDto`) para extrair as categorias, e retorna uma lista de `CategoryCountDto`.

#### `AlertsController`
Rota base: `/api/alerts`

* `POST /trigger-user-specific-alert`: Dispara um alerta para um usuário específico sobre um evento.
    * Payload: `UserAlertRequestDto` (contendo `UserId` e `EventDetails` do tipo `AlertableEventDto`).
    * Busca o usuário e seu contato principal (e-mail).
    * Atualmente, simula o envio de e-mail, mas a infraestrutura para `IEmailNotificationService` está presente para uma implementação futura.

### Modelo de Dados (Entidades)

As entidades são definidas no namespace `gsApi.model` e mapeadas para tabelas do Oracle DB através do `AppDbContext`.

* **`Cliente` (`TB_CLIENTE3`)**:
    * `IdCliente` (PK, Sequence `TB_CLIENTE3_ID_CLIENTE_SEQ`)
    * `Nome`, `Sobrenome`, `DataNascimento`, `Documento`
    * Relacionamentos:
        * Muitos-para-Muitos com `Contato` (Tabela de Junção `TB_CLIENTECONTATO3`)
        * Muitos-para-Muitos com `Endereco` (Tabela de Junção `TB_CLIENTEENDERECO3`)

* **`Contato` (`TB_CONTATO3`)**:
    * `IdContato` (PK, Sequence `TB_CONTATO3_ID_CONTATO_SEQ`)
    * `Ddd`, `Telefone`, `Celular`, `Whatsapp`, `Email`, `TipoContato`
    * Relacionamentos:
        * Muitos-para-Muitos com `Cliente` (Tabela de Junção `TB_CLIENTECONTATO3`)

* **`Endereco` (`TB_ENDERECO3`)**:
    * `IdEndereco` (PK, Sequence `TB_ENDERECO3_ID_ENDERECO_SEQ`)
    * `Cep`, `Numero`, `Logradouro`, `Bairro`, `Localidade`, `Uf`, `Complemento`, `Latitude`, `Longitude`
    * Relacionamentos:
        * Muitos-para-Muitos com `Cliente` (Tabela de Junção `TB_CLIENTEENDERECO3`)
        * Muitos-para-Muitos com `EonetEvent` (Tabela de Junção `TB_ENDERECOEVENTOS3`) - _Esta relação permite associar eventos EONET a endereços específicos, potencialmente para alertas direcionados._

* **`EonetEvent` (`TB_EONET3`)**:
    * `IdEonet` (PK, Sequence `TB_EONET3_ID_EONET_SEQ`)
    * `Json` (CLOB): Armazena o JSON original do evento da API EONET da NASA. É crucial que este JSON seja serializado a partir de uma estrutura como `NasaEonetEventDto` para que o `StatsController` e outras partes do sistema possam desserializá-lo corretamente.
    * `Data` (TIMESTAMP): Data principal do evento (geralmente extraída da primeira geometria do evento).
    * `EonetIdApi`: O ID original do evento na API EONET da NASA (ex: "EONET_5678").
    * Relacionamentos:
        * Muitos-para-Muitos com `Endereco` (Tabela de Junção `TB_ENDERECOEVENTOS3`)

O `AppDbContext` configura os nomes das tabelas, colunas e sequences para estarem em maiúsculas, conforme o padrão Oracle, e define os relacionamentos Muitos-para-Muitos explicitamente usando `UsingEntity`.

### DTOs (Data Transfer Objects)

Os DTOs são usados para definir a estrutura dos dados enviados e recebidos pela API, desacoplando os modelos da API das entidades do banco de dados.

* **Request DTOs (`gsApi.dto.request` e `gsApi.DTOs.Request`):**
    * `AlertableEventDto`: Detalhes de um evento para alerta.
    * `ClienteRequestDto`: Dados para criar/atualizar um cliente (incluindo `ContatosIds` e `EnderecosIds`).
    * `ContatoRequestDto`: Dados para criar/atualizar um contato.
    * `EnderecoGeoRequestDto`: Dados de endereço para geocodificação.
    * `EnderecoRequestDto`: Dados para criar/atualizar um endereço (com lat/lon).
    * `EonetRequestDto`: Dados para salvar/atualizar um evento EONET manualmente (JSON, Data, EonetIdApi).
    * `UserAlertRequestDto`: ID do usuário e detalhes do evento para alerta.

* **Response DTOs (`gsApi.dto.response` e `gsApi.DTOs.Response`):**
    * `CategoryCountDto`: Usado pelo `StatsController` (Categoria e contagem).
    * `ClienteResponseDto`: Dados de um cliente, incluindo listas de `ContatoResponseDto` e `EnderecoResponseDto`.
    * `ContatoResponseDto`: Dados de um contato.
    * `EnderecoResponseDto`: Dados de um endereço.
    * `EonetResponseDto`: Dados de um evento EONET armazenado localmente (ID local, JSON, Data, ID da API EONET).
    * `GeoCoordinatesDto`: Latitude, longitude e endereço correspondente (usado por geocodificação).
    * DTOs para Google Geocoding API: `GoogleGeocodingApiResponseDto`, `GoogleGeocodingResultDto`, etc.
    * DTOs para NASA EONET API: `NasaEonetApiResponseDto`, `NasaEonetEventDto`, `NasaEonetCategoryDto`, `NasaEonetGeometryDto`, `NasaEonetSourceDto`. (Esses são cruciais, pois o JSON de `EonetEvent.Json` deve ser compatível com `NasaEonetEventDto`).
    * `NominatimResponseDto`: (Parece ser um DTO para outro serviço de geocodificação, Nominatim, mas não é explicitamente usado nos serviços principais mostrados. Pode ser resquício ou para uso futuro).
    * `TimeCountDto`: Não utilizado nos controllers fornecidos, mas presente.
    * `ViaCepResponseDto`: Resposta da API ViaCEP.
    * `PaginatedResponse<T>` (definido em `ClientesController.cs`): Estrutura genérica para respostas paginadas, contendo `Content`, `TotalElements`, `PageNumber`, `PageSize`, `TotalPages`.

### Serviços (Backend)

Os serviços encapsulam a lógica de negócios e a comunicação com dependências externas.

* **`ViaCepClient`**:
    * Implementa `IViaCepClient`.
    * Consulta a API ViaCEP (`https://viacep.com.br/`) para obter dados de endereço a partir de um CEP.
    * Lida com formatação de CEP, chamadas HTTP e desserialização da resposta (`ViaCepResponseDto`).
    * Trata casos de CEP não encontrado ou erros de serviço.

* **`GeoCodingClient`**:
    * Implementa `IGeoCodingClient`.
    * Usa a API Google Geocoding para obter coordenadas (latitude/longitude) a partir de um endereço (`EnderecoGeoRequestDto`).
    * Requer uma chave de API (`ExternalServices:GoogleGeocoding:ApiKey`) e uma URL da API (`ExternalServices:GoogleGeocoding:ApiUrl`) configuradas em `appsettings.json`.
    * Formata a query de endereço e componentes para a API do Google.
    * Retorna `GeoCoordinatesDto`.

* **`NasaEonetClient`**:
    * Implementa `INasaEonetClient`.
    * Consulta a API EONET da NASA (`https://eonet.gsfc.nasa.gov/api/v3/`) para buscar eventos de desastres.
    * Permite filtros por limite, dias, status, fonte, bounding box (BBOX), data de início e fim.
    * A BaseURL é configurada no `Program.cs`, e o endpoint específico (ex: `/events`) é configurado via `ExternalServices:NasaEonet:EventsEndpoint`.
    * Retorna `NasaEonetApiResponseDto` contendo uma lista de `NasaEonetEventDto`.

* **`EmailNotificationService`** (dentro de `SmtpSettings.cs`):
    * Implementa `IEmailNotificationService`.
    * Responsável por enviar e-mails. Atualmente, a lógica de alerta no `AlertsController` está comentada, mas este serviço seria usado para enviar notificações de eventos.
    * Utiliza a biblioteca `MailKit` para comunicação SMTP.
    * As configurações SMTP (`Server`, `Port`, `Username`, `Password`, `FromAddress`, `FromName`, `UseSsl`) são lidas da seção `SmtpSettings` em `appsettings.json`.

### Tratamento de Exceções

O `TratadorGlobalExcecoesMiddleware` intercepta exceções que ocorrem durante o processamento das requisições e as formata em respostas JSON padronizadas com o status HTTP apropriado.

* `RecursoNaoEncontradoException` -> HTTP 404 Not Found
* `ServicoIndisponivelException` -> HTTP 503 Service Unavailable
* `ValidacaoException` -> HTTP 400 Bad Request (com lista de erros)
* `ArgumentException` -> HTTP 400 Bad Request
* Outras exceções -> HTTP 500 Internal Server Error

Isso garante que a API sempre retorne respostas JSON consistentes em caso de erro.

### Documentação da API (Swagger)

A API é documentada usando Swagger (OpenAPI), o que facilita a exploração e o teste dos endpoints.

* A UI do Swagger está disponível em `/swagger` (em ambiente de desenvolvimento).
* A documentação inclui:
    * Descrição geral do projeto e da equipe.
    * Informações de contato e licença.
    * Um link externo para "Saiba mais sobre a Global Solution FIAP" (via `ExternalDocsDocumentFilter`).
    * Comentários XML dos arquivos C# são usados para descrever endpoints, parâmetros e modelos, fornecendo detalhes sobre o que cada um faz, os dados esperados e as possíveis respostas.

---

## ⚛️ Frontend (Next.js & React)

O frontend é uma Single Page Application (SPA) construída com Next.js (usando o App Router) e React, escrita em TypeScript. Ele fornece a interface do usuário para interagir com as funcionalidades do backend.

### Estrutura do Projeto Frontend

A estrutura do projeto frontend, baseada no Next.js App Router, é organizada da seguinte forma:

* `src/`
    * `app/`: Contém as rotas e páginas da aplicação.
        * `layout.tsx`: Layout raiz da aplicação, define a estrutura HTML base, `<head>` (metadados, fontes, ícones) e a navegação principal (`<nav>`) e rodapé (`<footer>`).
        * `page.tsx`: Página inicial da aplicação (Home).
        * `globals.css`: Estilos globais da aplicação.
        * `clientes/`: Módulo de gerenciamento de usuários.
            * `layout.tsx`: Layout específico para as páginas de clientes, com subnavegação (Listar, Cadastrar, Buscar).
            * `listar/page.tsx`: Página para listar todos os usuários com paginação.
            * `cadastrar/page.tsx`: Formulário para cadastrar novos usuários, incluindo busca de CEP e geocodificação.
            * `[id]/page.tsx`: Página para exibir detalhes de um usuário específico.
            * `alterar/[id]/page.tsx`: Formulário para editar um usuário existente.
            * `deletar/[id]/page.tsx`: Página de confirmação para deletar um usuário.
            * `buscar/page.tsx`: Página para buscar usuários por ID ou documento.
        * `desastres/`: Módulo de gerenciamento e visualização de desastres.
            * `layout.tsx`: Layout específico para as páginas de desastres, com subnavegação (Painel, Mapa Local, Mapa NASA, Estatísticas).
            * `page.tsx`: Painel principal de desastres EONET (listagem local, sincronização com NASA, busca por proximidade, disparo de alertas).
            * `mapa/page.tsx`: Exibe eventos EONET armazenados localmente em um mapa interativo (Leaflet).
            * `mapa-atuais/page.tsx`: Busca e exibe eventos diretamente da API EONET da NASA em um mapa.
            * `estatisticas/page.tsx`: Exibe estatísticas de eventos EONET por categoria usando gráficos (Chart.js).
        * `contato/`: Página de informações de contato da equipe.
            * `layout.tsx`: Layout específico para a página de contato.
            * `page.tsx`: Exibe informações dos membros da equipe, um formulário de contato (simulado) e um mapa Leaflet da localização da FIAP.
    * `components/`: Contém componentes React reutilizáveis.
        * `EonetEventMap.tsx`: Componente de mapa Leaflet customizado para exibir marcadores de eventos EONET.
        * `LeafletMap.tsx`: Componente de mapa Leaflet mais genérico, usado na página de contato.
    * `lib/`: Contém lógica auxiliar, como serviços de API e definições de tipo.
        * `apiService.ts` (assumido): Funções para fazer requisições à API backend.
        * `types.ts` (assumido): Definições de interface TypeScript para os DTOs da API e outros tipos de dados usados no frontend.
    * `public/`: Contém arquivos estáticos (imagens, favicon, etc.).
        * `favicon.ico`
        * `fotos-equipe/` (paulo.jpg, arthur.jpg, joao.jpg)

### Principais Páginas e Funcionalidades (Frontend)

#### Página Inicial (`/app/page.tsx`)
Componente: `HomePage`

* Apresenta uma visão geral do projeto "GS Alerta Desastres".
* Contém seções "Sobre o Projeto" e "Funcionalidades Principais" com links para as principais áreas do sistema.
* Inclui links para o repositório GitHub do projeto e para a página da Global Solution FIAP.

#### Módulo de Usuários (`/app/clientes/`)
Layout: `ClientesLayout` (Subnavegação: Listar, Cadastrar, Buscar)

1.  **Listar Usuários (`/app/clientes/listar/page.tsx`)**
    * Componente: `ListarClientesPage`
    * Exibe uma lista paginada de todos os usuários cadastrados.
    * Cada item da lista mostra informações resumidas do usuário (nome, ID, documento, contato principal, endereço principal).
    * Ações por usuário: Ver Detalhes, Editar, Deletar (com modal de confirmação).
    * Controles de paginação para navegar entre as páginas de resultados.

2.  **Cadastrar Usuário (`/app/clientes/cadastrar/page.tsx`)**
    * Componente: `CadastrarClientePage`
    * Formulário completo para registrar um novo usuário, incluindo:
        * Dados Pessoais (Nome, Sobrenome, Data de Nascimento, Documento).
        * Contato Principal (DDD, Telefone, Celular, WhatsApp, Email, Tipo Contato).
        * Endereço Principal (CEP, Número, Complemento, Logradouro, Bairro, Localidade, UF).
    * **Funcionalidades Auxiliares:**
        * Ao preencher o CEP e sair do campo (`onBlur`), consulta a API ViaCEP (através do backend) para preencher automaticamente os campos de endereço.
        * Botão "Obter/Atualizar Coordenadas": Após preencher o endereço, consulta a API Google Geocoding (através do backend) para obter Latitude e Longitude.
    * Validações de formulário antes do envio.
    * Após o cadastro bem-sucedido do contato, endereço e cliente, redireciona para a página de detalhes do novo usuário.

3.  **Detalhes do Usuário (`/app/clientes/[id]/page.tsx`)**
    * Componente: `ClienteDetalhesPage`
    * Exibe todas as informações de um usuário específico, carregado pelo ID na URL.
    * Mostra dados pessoais, contato principal e endereço principal formatados.
    * Links para Editar e Deletar o usuário, e para voltar à lista.

4.  **Alterar Usuário (`/app/clientes/alterar/[id]/page.tsx`)**
    * Componente: `AlterarClientePage`
    * Formulário pré-preenchido com os dados de um usuário existente para edição.
    * Funcionalidades similares ao cadastro (busca de CEP, obtenção de coordenadas).
    * Permite atualizar os dados pessoais do cliente, seu contato principal e seu endereço principal.
    * IDs do contato e endereço principal são mantidos para atualização dos respectivos registros.

5.  **Deletar Usuário (`/app/clientes/deletar/[id]/page.tsx`)**
    * Componente: `DeletarClienteConfirmPage`
    * Página de confirmação antes de deletar um usuário.
    * Exibe os dados do usuário a ser deletado.
    * Requer confirmação explícita para a deleção.

6.  **Buscar Usuário (`/app/clientes/buscar/page.tsx`)**
    * Componente: `BuscarUsuarioPage`
    * Permite buscar um usuário por ID ou por Documento (CPF/CNPJ).
    * Ao encontrar, redireciona para a página de detalhes do usuário.

#### Módulo de Desastres (`/app/desastres/`)
Layout: `DesastresLayout` (Subnavegação: Painel EONET, Mapa Local, Mapa NASA, Estatísticas)

1.  **Painel EONET (`/app/desastres/page.tsx`)**
    * Componente: `DesastresPage`
    * Interface com abas para diferentes funcionalidades relacionadas a eventos EONET:
        * **Eventos Locais:** Lista eventos EONET armazenados no banco de dados local, com paginacão. O JSON de cada evento é parseado para exibir detalhes como título, data e categorias.
        * **Sincronizar NASA:** Formulário para buscar eventos da API EONET da NASA (com filtros opcionais como limite, dias, status, fonte) e salvá-los/atualizá-los no banco de dados local.
        * **Buscar Próximos:**
            * Permite buscar eventos da API EONET da NASA com base em coordenadas geográficas (latitude, longitude) e um raio em KM.
            * Opcionalmente, pode-se informar um ID de usuário para buscar suas coordenadas cadastradas e usá-las na busca.
            * Se um ID de usuário for fornecido e eventos próximos forem encontrados, um alerta simulado é disparado para esse usuário através do backend.
            * Resultados da busca são listados.
        * **Alertar Usuário:**
            * Formulário para disparar um alerta manualmente para um usuário específico sobre um evento EONET específico.
            * Requer ID do Usuário e ID do Evento EONET (API ID).
            * Botões para "Verificar Usuário" (busca dados do usuário) e "Verificar Evento" (busca dados do evento local e parseia seu JSON).
            * Após verificação, o botão "Enviar Alerta" é habilitado.

2.  **Mapa de Eventos (Locais) (`/app/desastres/mapa/page.tsx`)**
    * Componente: `MapaDeEventosPage`
    * Exibe os eventos EONET armazenados no banco de dados local em um mapa interativo (Leaflet).
    * Os marcadores no mapa mostram a localização de cada evento e um popup com informações (título, data, categorias).
    * O JSON de cada evento local é parseado para extrair título, geometrias (para coordenadas) e categorias.

3.  **Mapa de Eventos Atuais (NASA) (`/app/desastres/mapa-atuais/page.tsx`)**
    * Componente: `MapaEventosAtuaisNasaPage`
    * Permite buscar eventos diretamente da API EONET da NASA usando filtros de data.
    * Ao carregar, tenta buscar o evento global mais recente.
    * Os eventos encontrados são exibidos em um mapa Leaflet.
    * Se um único evento for exibido, seus detalhes (título, data, ID, categorias, link) são mostrados abaixo do formulário de filtro.

4.  **Estatísticas de Desastres (`/app/desastres/estatisticas/page.tsx`)**
    * Componente: `EstatisticasDesastresPage`
    * Exibe estatísticas sobre os eventos EONET armazenados localmente.
    * Permite ao usuário selecionar um período (ex: últimos 30 dias, último ano, etc.).
    * Os dados são buscados do endpoint `/api/stats/eonet/count-by-category` do backend.
    * Apresenta gráficos da contagem de eventos por categoria usando `react-chartjs-2`.
    * Tipos de gráficos disponíveis através de abas:
        * 📊 Barras Verticais (com escala logarítmica no eixo Y)
        * 📊 Barras Horizontais (com escala logarítmica no eixo X)
        * 🍕 Pizza
        * 🍩 Rosca (Doughnut)
        * 🔆 Área Polar
    * Os gráficos mostram o número de eventos para cada categoria e, nos tooltips, a porcentagem relativa ao total de eventos no período.

#### Página de Contato (`/app/contato/page.tsx`)
Layout: `ContatoLayout`
Componente: `ContactsPage`

* Apresenta informações sobre os membros da equipe MetaMind (nome, RM, e-mail, GitHub, telefone, turma e foto).
* Inclui um formulário de contato (atualmente com envio simulado no frontend).
* Exibe um mapa Leaflet mostrando a localização da FIAP Paulista.
* Links para o repositório GitHub do projeto e para a página da Global Solution.

### Componentes Reutilizáveis

* **`EonetEventMap.tsx`**:
    * Um componente de mapa Leaflet configurado para exibir múltiplos marcadores de eventos.
    * Aceita uma lista de `EventMapMarkerData` (com ID, posição e texto do popup).
    * Ajusta automaticamente os limites do mapa (`fitBounds`) para englobar todos os marcadores, se houver.
    * Usa um ícone padrão do Leaflet.

* **`LeafletMap.tsx`**:
    * Um componente de mapa Leaflet mais simples, projetado para exibir um único marcador.
    * Usado na página de Contato para mostrar a localização da FIAP.
    * Aceita `position`, `zoom` e `markerText` como props.

Ambos os componentes de mapa são carregados dinamicamente (`next/dynamic`) com `ssr: false` para garantir que o Leaflet, que depende de `window`, funcione corretamente no ambiente Next.js.

### Comunicação com a API

* **`lib/apiService.ts` (Assumido)**: Este arquivo (não fornecido no texto, mas inferido pelo uso) deve conter as funções que realizam as chamadas `fetch` para os endpoints da API backend.
    * Exemplos de funções (baseado no uso nos componentes):
        * `listarClientes(page, size)`
        * `buscarClientePorId(id)`
        * `buscarClientePorDocumento(documento)`
        * `criarCliente(payload)`
        * `atualizarCliente(id, payload)`
        * `deletarCliente(id)`
        * `criarContatoSozinho(payload)`
        * `atualizarContato(id, payload)`
        * `criarEnderecoSozinho(payload)`
        * `atualizarEndereco(id, payload)`
        * `consultarCepPelaApi(cep)` (provavelmente chama `/api/enderecos/consultar-cep/{cep}`)
        * `calcularCoordenadasPelaApi(payload)` (provavelmente chama `/api/enderecos/calcular-coordenadas`)
        * `listarEventosEonet(page, size, sortBy, sortDir)`
        * `sincronizarNasaEonet(limit, days, status, source)`
        * `buscarEventosNasaProximos(lat, lon, raio, limit, days, status, source, startDate, endDate)`
        * `buscarEventoLocalPorEonetApiId(eonetApiId)`
        * `triggerUserSpecificAlert(payload)`
        * `getEonetCategoryStats(days)`
    * Estas funções devem tratar das respostas da API, incluindo a desserialização de JSON e o tratamento de erros HTTP.

* **`lib/types.ts` (Assumido)**: Este arquivo (não fornecido, mas inferido) deve conter as definições de interface TypeScript que correspondem aos DTOs (Request e Response) do backend. Isso garante type safety na comunicação entre frontend e backend.
    * Exemplos de tipos: `ClienteRequestDTO`, `ClienteResponseDTO`, `ContatoRequestDTO`, `EnderecoRequestDTO`, `Page<T>`, `NasaEonetEventDTO`, `EonetResponseDTO`, `CategoryCountDTO`, `UserAlertRequestDTO`, `EventMapMarkerData`, etc.

O frontend utiliza `fetch` (provavelmente encapsulado no `apiService.ts`) para interagir com a API backend, enviando dados JSON e processando as respostas JSON.

---

## ✨ Considerações Finais

Esta documentação oferece uma visão geral do projeto "GS Alerta Desastres". O sistema combina um backend .NET robusto com um frontend Next.js interativo para fornecer uma plataforma útil para o monitoramento de desastres. Há espaço para futuras expansões, como a implementação completa do sistema de notificação por e-mail, alertas push, e funcionalidades de geofencing mais avançadas.

Agradecemos por utilizar esta documentação!
**Equipe MetaMind** 🧠



### 📂 **Link do Repositório:**  
[![GitHub](https://img.shields.io/badge/GitHub-Repositório_do_Projeto-blue?style=for-the-badge&logo=github)](https://github.com/carmipa/GS_FIAP_2025_1SM)

*(Nota: O link acima leva para a raiz do repositório. Se o projeto específico estiver em uma subpasta como "Advanced_Business_Development_with.NET", você pode querer ajustar o link diretamente ou manter um link geral para o GS.)*

---
## 🎨 **Tecnologias Utilizadas no Projeto:**

**Backend:**
<p>
  <img src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white" alt="C#" />
  <img src="https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 8" />
  <img src="https://img.shields.io/badge/ASP.NET%20Core-512BD4?style=for-the-badge&logo=.net&logoColor=white" alt="ASP.NET Core" />
  <img src="https://img.shields.io/badge/Entity%20Framework%20Core-512BD4?style=for-the-badge&logo=.net&logoColor=white" alt="Entity Framework Core" />
  <img src="https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle" />
  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger (OpenAPI)" />
</p>

**Frontend:**
<p>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Leaflet-1EB300?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet.js" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</p>
